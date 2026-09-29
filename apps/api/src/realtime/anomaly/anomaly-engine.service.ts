import { Injectable, Logger } from '@nestjs/common';
import {
  RealtimeDrillingSample,
  RealtimeFeatureData,
  AnomalyData,
  AlertSeverity,
} from '@nwis/types';
import { ANOMALY_THRESHOLDS } from '../config/risk-config';

@Injectable()
export class AnomalyEngineService {
  private readonly logger = new Logger(AnomalyEngineService.name);

  /**
   * Evaluate a sample and its calculated rolling features to detect statistical & trend anomalies
   */
  detectAnomalies(
    sample: RealtimeDrillingSample,
    features: RealtimeFeatureData[]
  ): AnomalyData[] {
    const anomalies: AnomalyData[] = [];
    const wellId = sample.wellId;
    const depth = sample.measuredDepth;
    const formation = sample.formationId ?? 'Unknown Formation';
    const timestamp = sample.timestamp;

    // Use medium (60s) or short (30s) window feature set if available
    const primaryFeature = features.find((f) => f.windowSeconds === 60) ?? features[0];
    if (!primaryFeature) {
      return anomalies;
    }

    // 1. TORQUE ANOMALY: Statistical Z-Score & Robust Z-Score
    if (sample.torque !== null && sample.torque !== undefined && primaryFeature.torqueMean !== null) {
      const zScore = Math.abs(primaryFeature.torqueZScore ?? 0);
      const robustZ = Math.abs(primaryFeature.torqueRobustZ ?? 0);
      const torqueDevPct = primaryFeature.formationBaselineDeviation?.torquePct ?? 0;

      if (
        zScore >= ANOMALY_THRESHOLDS.Z_SCORE_CRITICAL ||
        robustZ >= ANOMALY_THRESHOLDS.ROBUST_Z_CRITICAL ||
        torqueDevPct >= ANOMALY_THRESHOLDS.TORQUE_INCREASE_PCT_CRITICAL
      ) {
        anomalies.push({
          wellId,
          timestamp,
          depth,
          formation,
          parameter: 'TORQUE',
          observedValue: sample.torque,
          expectedValue: primaryFeature.torqueMean ?? 0,
          deviation: Number(torqueDevPct.toFixed(1)),
          severity: AlertSeverity.CRITICAL,
          method: 'ROBUST_Z_AND_BASELINE',
          confidence: 0.92,
          evidence: { zScore, robustZ, torqueDevPct, slope: primaryFeature.torqueSlope },
        });
      } else if (
        zScore >= ANOMALY_THRESHOLDS.Z_SCORE_WARNING ||
        torqueDevPct >= ANOMALY_THRESHOLDS.TORQUE_INCREASE_PCT_WARNING
      ) {
        anomalies.push({
          wellId,
          timestamp,
          depth,
          formation,
          parameter: 'TORQUE',
          observedValue: sample.torque,
          expectedValue: primaryFeature.torqueMean ?? 0,
          deviation: Number(torqueDevPct.toFixed(1)),
          severity: AlertSeverity.WARNING,
          method: 'ROLLING_Z_SCORE',
          confidence: 0.85,
          evidence: { zScore, robustZ, torqueDevPct, slope: primaryFeature.torqueSlope },
        });
      } else if (
        zScore >= ANOMALY_THRESHOLDS.Z_SCORE_WATCH ||
        torqueDevPct >= ANOMALY_THRESHOLDS.TORQUE_INCREASE_PCT_WATCH
      ) {
        anomalies.push({
          wellId,
          timestamp,
          depth,
          formation,
          parameter: 'TORQUE',
          observedValue: sample.torque,
          expectedValue: primaryFeature.torqueMean ?? 0,
          deviation: Number(torqueDevPct.toFixed(1)),
          severity: AlertSeverity.WATCH,
          method: 'ROLLING_Z_SCORE',
          confidence: 0.75,
          evidence: { zScore, torqueDevPct },
        });
      }
    }

    // 2. ROP ANOMALY: Rate of Penetration Decline
    if (sample.rop !== null && sample.rop !== undefined && primaryFeature.ropMean !== null) {
      const ropDevPct = primaryFeature.formationBaselineDeviation?.ropPct ?? 0;
      const ropSlope = primaryFeature.ropSlope ?? 0;

      if (
        ropDevPct <= -ANOMALY_THRESHOLDS.ROP_DECREASE_PCT_CRITICAL ||
        (ropDevPct <= -ANOMALY_THRESHOLDS.ROP_DECREASE_PCT_WARNING && ropSlope < -0.05)
      ) {
        anomalies.push({
          wellId,
          timestamp,
          depth,
          formation,
          parameter: 'ROP',
          observedValue: sample.rop,
          expectedValue: primaryFeature.ropMean ?? 0,
          deviation: Number(ropDevPct.toFixed(1)),
          severity: AlertSeverity.WARNING,
          method: 'TREND_SLOPE_AND_DECLINE',
          confidence: 0.88,
          evidence: { ropDevPct, ropSlope },
        });
      } else if (ropDevPct <= -ANOMALY_THRESHOLDS.ROP_DECREASE_PCT_WATCH) {
        anomalies.push({
          wellId,
          timestamp,
          depth,
          formation,
          parameter: 'ROP',
          observedValue: sample.rop,
          expectedValue: primaryFeature.ropMean ?? 0,
          deviation: Number(ropDevPct.toFixed(1)),
          severity: AlertSeverity.WATCH,
          method: 'BASELINE_DEVIATION',
          confidence: 0.78,
          evidence: { ropDevPct },
        });
      }
    }

    // 3. DRAG ANOMALY: Overpull / Friction Increase
    if (sample.drag !== null && sample.drag !== undefined && primaryFeature.dragMean !== null) {
      const dragDevPct = primaryFeature.formationBaselineDeviation?.dragPct ?? 0;

      if (dragDevPct >= ANOMALY_THRESHOLDS.DRAG_INCREASE_PCT_WARNING) {
        anomalies.push({
          wellId,
          timestamp,
          depth,
          formation,
          parameter: 'DRAG',
          observedValue: sample.drag,
          expectedValue: primaryFeature.dragMean ?? 0,
          deviation: Number(dragDevPct.toFixed(1)),
          severity: AlertSeverity.WARNING,
          method: 'BASELINE_DEVIATION',
          confidence: 0.82,
          evidence: { dragDevPct, dragSlope: primaryFeature.dragSlope },
        });
      } else if (dragDevPct >= ANOMALY_THRESHOLDS.DRAG_INCREASE_PCT_WATCH) {
        anomalies.push({
          wellId,
          timestamp,
          depth,
          formation,
          parameter: 'DRAG',
          observedValue: sample.drag,
          expectedValue: primaryFeature.dragMean ?? 0,
          deviation: Number(dragDevPct.toFixed(1)),
          severity: AlertSeverity.WATCH,
          method: 'BASELINE_DEVIATION',
          confidence: 0.72,
          evidence: { dragDevPct },
        });
      }
    }


    // 4. FLOW DIFFERENTIAL ANOMALY (Lost Circulation vs Kick Precursors)
    if (primaryFeature.flowDifference !== null && primaryFeature.flowDifference !== undefined) {
      const flowDiff = primaryFeature.flowDifference; // flowOut - flowIn

      if (flowDiff <= -ANOMALY_THRESHOLDS.FLOW_DIFF_LPM_WARNING) {
        anomalies.push({
          wellId,
          timestamp,
          depth,
          formation,
          parameter: 'FLOW_OUT',
          observedValue: sample.flowOut ?? 0,
          expectedValue: sample.flowIn ?? 0,
          deviation: flowDiff,
          severity: AlertSeverity.WARNING,
          method: 'DIFFERENTIAL_BALANCE',
          confidence: 0.89,
          evidence: { flowDifferenceLpm: flowDiff, type: 'DEFICIT_LOST_CIRCULATION_SIGNAL' },
        });
      } else if (flowDiff >= ANOMALY_THRESHOLDS.FLOW_DIFF_LPM_WARNING) {
        anomalies.push({
          wellId,
          timestamp,
          depth,
          formation,
          parameter: 'FLOW_OUT',
          observedValue: sample.flowOut ?? 0,
          expectedValue: sample.flowIn ?? 0,
          deviation: flowDiff,
          severity: AlertSeverity.WARNING,
          method: 'DIFFERENTIAL_BALANCE',
          confidence: 0.90,
          evidence: { flowDifferenceLpm: flowDiff, type: 'SURGE_KICK_PRECURSOR_SIGNAL' },
        });
      }
    }

    // 5. PIT VOLUME ANOMALY
    if (primaryFeature.pitVolumeChange !== null && primaryFeature.pitVolumeChange !== undefined) {
      const volChange = primaryFeature.pitVolumeChange;

      if (volChange <= -ANOMALY_THRESHOLDS.PIT_VOLUME_CHANGE_M3_WARNING) {
        anomalies.push({
          wellId,
          timestamp,
          depth,
          formation,
          parameter: 'PIT_VOLUME',
          observedValue: sample.pitVolume ?? 0,
          expectedValue: (sample.pitVolume ?? 0) - volChange,
          deviation: volChange,
          severity: AlertSeverity.WARNING,
          method: 'VOLUME_INTEGRATION',
          confidence: 0.86,
          evidence: { volumeLossM3: volChange },
        });
      } else if (volChange >= ANOMALY_THRESHOLDS.PIT_VOLUME_CHANGE_M3_WARNING) {
        anomalies.push({
          wellId,
          timestamp,
          depth,
          formation,
          parameter: 'PIT_VOLUME',
          observedValue: sample.pitVolume ?? 0,
          expectedValue: (sample.pitVolume ?? 0) - volChange,
          deviation: volChange,
          severity: AlertSeverity.WARNING,
          method: 'VOLUME_INTEGRATION',
          confidence: 0.88,
          evidence: { volumeGainM3: volChange },
        });
      }
    }

    return anomalies;
  }
}
