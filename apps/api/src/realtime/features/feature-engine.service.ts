import { Injectable, Logger } from '@nestjs/common';
import {
  RealtimeDrillingSample,
  RealtimeFeatureData,
} from '@nwis/types';
import {
  calculateRollingMean,
  calculateRollingStd,
  calculateRollingMedian,
  calculateMedianAbsoluteDeviation,
  calculateRollingSlope,
  calculateZScore,
  calculateRobustZScore,
  calculatePercentageChange,
} from '@nwis/utils';
import { FEATURE_WINDOWS } from '../config/risk-config';

interface SampleBufferEntry {
  timestampSec: number;
  sample: RealtimeDrillingSample;
}

@Injectable()
export class FeatureEngineService {
  private readonly logger = new Logger(FeatureEngineService.name);

  // Per-well ring buffer of recent samples (up to extended window = 900 seconds)
  private sampleBuffers = new Map<string, SampleBufferEntry[]>();

  // Formation baselines (can be seeded or dynamically calculated from Stage 01/02 data)
  private formationBaselines = new Map<
    string,
    { torque: number; rop: number; drag: number; spp: number }
  >([
    ['Formation Gamma', { torque: 15.0, rop: 18.0, drag: 22.0, spp: 195.0 }],
    ['Formation Beta', { torque: 12.0, rop: 22.0, drag: 18.0, spp: 180.0 }],
    ['Formation Alpha', { torque: 10.0, rop: 25.0, drag: 15.0, spp: 170.0 }],
    ['DEFAULT', { torque: 14.0, rop: 20.0, drag: 20.0, spp: 190.0 }],
  ]);

  /**
   * Ingest a new sample into the well's buffer and compute features across windows
   */
  processSample(sample: RealtimeDrillingSample): RealtimeFeatureData[] {
    const wellId = sample.wellId;
    const nowSec =
      typeof sample.timestamp === 'string'
        ? new Date(sample.timestamp).getTime() / 1000
        : sample.timestamp.getTime() / 1000;

    let buffer = this.sampleBuffers.get(wellId);
    if (!buffer) {
      buffer = [];
      this.sampleBuffers.set(wellId, buffer);
    }

    buffer.push({ timestampSec: nowSec, sample });

    // Evict entries older than EXTENDED window (900 seconds)
    const cutoffSec = nowSec - FEATURE_WINDOWS.EXTENDED_SECONDS;
    while (buffer.length > 0 && buffer[0].timestampSec < cutoffSec) {
      buffer.shift();
    }

    // Compute features for each target window
    const windowSizes = [
      FEATURE_WINDOWS.SHORT_SECONDS,
      FEATURE_WINDOWS.MEDIUM_SECONDS,
      FEATURE_WINDOWS.LONG_SECONDS,
    ];

    const results: RealtimeFeatureData[] = [];
    for (const winSec of windowSizes) {
      const windowEntries = buffer.filter((e) => e.timestampSec >= nowSec - winSec);
      if (windowEntries.length >= 2) {
        results.push(this.calculateWindowFeatures(wellId, sample, windowEntries, winSec));
      }
    }

    return results;
  }

  /**
   * Compute statistical and trend features for a specific time window
   */
  private calculateWindowFeatures(
    wellId: string,
    currentSample: RealtimeDrillingSample,
    entries: SampleBufferEntry[],
    windowSeconds: number
  ): RealtimeFeatureData {
    const torques = entries.map((e) => e.sample.torque).filter((v): v is number => v !== null && v !== undefined);
    const rops = entries.map((e) => e.sample.rop).filter((v): v is number => v !== null && v !== undefined);
    const drags = entries.map((e) => e.sample.drag).filter((v): v is number => v !== null && v !== undefined);
    const spps = entries.map((e) => e.sample.standpipePressure).filter((v): v is number => v !== null && v !== undefined);

    // 1. Torque features
    const torqueMean = torques.length > 0 ? calculateRollingMean(torques) : null;
    const torqueStd = torques.length > 1 ? calculateRollingStd(torques, torqueMean!) : null;
    const torqueMedian = torques.length > 0 ? calculateRollingMedian(torques) : null;
    const torqueMad = torques.length > 1 ? calculateMedianAbsoluteDeviation(torques, torqueMedian!) : null;
    const torqueSlope =
      entries.length > 1
        ? calculateRollingSlope(
            entries
              .filter((e) => e.sample.torque !== null && e.sample.torque !== undefined)
              .map((e) => ({ timestampSec: e.timestampSec, value: e.sample.torque! }))
          )
        : null;

    const torqueZScore =
      currentSample.torque !== null && currentSample.torque !== undefined && torqueMean !== null && torqueStd !== null
        ? calculateZScore(currentSample.torque, torqueMean, torqueStd)
        : null;

    const torqueRobustZ =
      currentSample.torque !== null && currentSample.torque !== undefined && torqueMedian !== null && torqueMad !== null
        ? calculateRobustZScore(currentSample.torque, torqueMedian, torqueMad)
        : null;

    // 2. ROP features
    const ropMean = rops.length > 0 ? calculateRollingMean(rops) : null;
    const ropStd = rops.length > 1 ? calculateRollingStd(rops, ropMean!) : null;
    const ropSlope =
      entries.length > 1
        ? calculateRollingSlope(
            entries
              .filter((e) => e.sample.rop !== null && e.sample.rop !== undefined)
              .map((e) => ({ timestampSec: e.timestampSec, value: e.sample.rop! }))
          )
        : null;

    const ropZScore =
      currentSample.rop !== null && currentSample.rop !== undefined && ropMean !== null && ropStd !== null
        ? calculateZScore(currentSample.rop, ropMean, ropStd)
        : null;

    // 3. Drag features
    const dragMean = drags.length > 0 ? calculateRollingMean(drags) : null;
    const dragSlope =
      entries.length > 1
        ? calculateRollingSlope(
            entries
              .filter((e) => e.sample.drag !== null && e.sample.drag !== undefined)
              .map((e) => ({ timestampSec: e.timestampSec, value: e.sample.drag! }))
          )
        : null;

    // 4. Standpipe Pressure features
    const sppMean = spps.length > 0 ? calculateRollingMean(spps) : null;
    const sppSlope =
      entries.length > 1
        ? calculateRollingSlope(
            entries
              .filter((e) => e.sample.standpipePressure !== null && e.sample.standpipePressure !== undefined)
              .map((e) => ({ timestampSec: e.timestampSec, value: e.sample.standpipePressure! }))
          )
        : null;

    // 5. Differential flow & volume changes
    const flowDifference =
      currentSample.flowIn !== null && currentSample.flowIn !== undefined && currentSample.flowOut !== null && currentSample.flowOut !== undefined
        ? Number((currentSample.flowOut - currentSample.flowIn).toFixed(1))
        : null;

    const firstEntry = entries[0].sample;
    const pitVolumeChange =
      currentSample.pitVolume !== null && currentSample.pitVolume !== undefined && firstEntry.pitVolume !== null && firstEntry.pitVolume !== undefined
        ? Number((currentSample.pitVolume - firstEntry.pitVolume).toFixed(2))
        : null;

    const mudWeightChange =
      currentSample.mudWeightIn !== null && currentSample.mudWeightIn !== undefined && firstEntry.mudWeightIn !== null && firstEntry.mudWeightIn !== undefined
        ? Number((currentSample.mudWeightIn - firstEntry.mudWeightIn).toFixed(3))
        : null;

    // 6. Contextual formation baseline comparison
    const formationKey = currentSample.formationId ?? 'DEFAULT';
    const baseline = this.formationBaselines.get(formationKey) ?? this.formationBaselines.get('DEFAULT')!;
    
    const formationBaselineDeviation: Record<string, number> = {};
    if (currentSample.torque !== null && currentSample.torque !== undefined) {
      formationBaselineDeviation.torquePct = Number(
        calculatePercentageChange(currentSample.torque, baseline.torque).toFixed(1)
      );
    }
    if (currentSample.rop !== null && currentSample.rop !== undefined) {
      formationBaselineDeviation.ropPct = Number(
        calculatePercentageChange(currentSample.rop, baseline.rop).toFixed(1)
      );
    }
    if (currentSample.drag !== null && currentSample.drag !== undefined) {
      formationBaselineDeviation.dragPct = Number(
        calculatePercentageChange(currentSample.drag, baseline.drag).toFixed(1)
      );
    }
    if (currentSample.standpipePressure !== null && currentSample.standpipePressure !== undefined) {
      formationBaselineDeviation.sppPct = Number(
        calculatePercentageChange(currentSample.standpipePressure, baseline.spp).toFixed(1)
      );
    }

    return {
      wellId,
      timestamp: currentSample.timestamp,
      windowSeconds,
      torqueMean: torqueMean !== null ? Number(torqueMean.toFixed(2)) : null,
      torqueStd: torqueStd !== null ? Number(torqueStd.toFixed(3)) : null,
      torqueSlope: torqueSlope !== null ? Number(torqueSlope.toFixed(4)) : null,
      torqueZScore: torqueZScore !== null ? Number(torqueZScore.toFixed(2)) : null,
      torqueRobustZ: torqueRobustZ !== null ? Number(torqueRobustZ.toFixed(2)) : null,
      ropMean: ropMean !== null ? Number(ropMean.toFixed(2)) : null,
      ropSlope: ropSlope !== null ? Number(ropSlope.toFixed(4)) : null,
      ropZScore: ropZScore !== null ? Number(ropZScore.toFixed(2)) : null,
      dragMean: dragMean !== null ? Number(dragMean.toFixed(2)) : null,
      dragSlope: dragSlope !== null ? Number(dragSlope.toFixed(4)) : null,
      sppMean: sppMean !== null ? Number(sppMean.toFixed(1)) : null,
      sppSlope: sppSlope !== null ? Number(sppSlope.toFixed(4)) : null,
      flowDifference,
      pitVolumeChange,
      mudWeightChange,
      formationBaselineDeviation,
      rawFeatures: {
        windowSampleCount: entries.length,
        timeSpanSeconds: entries[entries.length - 1].timestampSec - entries[0].timestampSec,
      },
    };
  }

  /**
   * Clear buffer for a well when resetting or stopping simulation
   */
  clearBuffer(wellId: string): void {
    this.sampleBuffers.delete(wellId);
  }

  /**
   * Clear all well feature buffers
   */
  clearAllBuffers(): void {
    this.sampleBuffers.clear();
  }
}
