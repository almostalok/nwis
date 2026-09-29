import { Injectable, Logger } from '@nestjs/common';
import { RiskEngine, RiskEvaluationContext } from './risk-engine.interface';
import {
  RiskAssessmentData,
  RiskType,
  AlertSeverity,
  ContributingFactor,
} from '@nwis/types';
import { RISK_WEIGHTS, RISK_SCORE_BOUNDS } from '../config/risk-config';

@Injectable()
export class KickRiskEngine implements RiskEngine {
  private readonly logger = new Logger(KickRiskEngine.name);
  readonly riskType = RiskType.KICK;

  evaluate(context: RiskEvaluationContext): RiskAssessmentData | null {
    const { sample, features, anomalies, precedents } = context;

    if (sample.flowOut === null || sample.flowOut === undefined) {
      return null;
    }

    const primaryFeature = features.find((f) => f.windowSeconds === 60) ?? features[0];
    const flowIn = sample.flowIn ?? 0;
    const flowOut = sample.flowOut;
    const flowSurge = flowOut - flowIn; // positive flowOut > flowIn indicates influx
    const pitVolChange = primaryFeature?.pitVolumeChange ?? 0; // positive indicates pit gain

    const contributingFactors: ContributingFactor[] = [];
    const signals: string[] = [];
    let rawScore = 0;

    // 1. Flow out surge above pump rate
    if (flowSurge >= 150) {
      const ratio = Math.min(1.0, (flowSurge - 150) / 400);
      const points = Number((RISK_WEIGHTS.KICK.FLOW_OUT_SURGE * (0.5 + 0.5 * ratio)).toFixed(1));
      rawScore += points;
      contributingFactors.push({
        factor: 'Flow Return Surge',
        weight: RISK_WEIGHTS.KICK.FLOW_OUT_SURGE,
        contribution: points,
        description: `Flow return surge: +${flowSurge.toFixed(0)} L/min exceeding pump rate`,
      });
      signals.push(`Flow Return Surge +${flowSurge.toFixed(0)} L/min`);
    }

    // 2. Pit volume gain
    if (pitVolChange >= 1.0) {
      const ratio = Math.min(1.0, (pitVolChange - 1.0) / 4.0);
      const points = Number((RISK_WEIGHTS.KICK.PIT_VOLUME_GAIN * (0.5 + 0.5 * ratio)).toFixed(1));
      rawScore += points;
      contributingFactors.push({
        factor: 'Active Pit Gain',
        weight: RISK_WEIGHTS.KICK.PIT_VOLUME_GAIN,
        contribution: points,
        description: `Active pit volume increased by ${pitVolChange.toFixed(1)} m³`,
      });
      signals.push(`Pit Volume Gain +${pitVolChange.toFixed(1)} m³`);
    }

    // 3. Historical Precedents
    const kickPrecedents = (precedents ?? []).filter(
      (p) => p.eventType === 'KICK' || p.title?.includes('Kick')
    );
    if (kickPrecedents.length > 0) {
      const count = Math.min(2, kickPrecedents.length);
      const points = Number((RISK_WEIGHTS.KICK.HISTORICAL_PRECEDENT * (count / 2)).toFixed(1));
      rawScore += points;
      contributingFactors.push({
        factor: 'Historical Kick Precedent',
        weight: RISK_WEIGHTS.KICK.HISTORICAL_PRECEDENT,
        contribution: points,
        description: `${kickPrecedents.length} comparable influx events in nearby formation intervals`,
      });
      signals.push(`${kickPrecedents.length} offset kick precedents`);
    }

    const finalScore = Math.min(100, Math.round(rawScore));

    let severity = AlertSeverity.NORMAL;
    if (finalScore >= RISK_SCORE_BOUNDS.CRITICAL.MIN) {
      severity = AlertSeverity.CRITICAL;
    } else if (finalScore >= RISK_SCORE_BOUNDS.WARNING.MIN) {
      severity = AlertSeverity.WARNING;
    } else if (finalScore >= RISK_SCORE_BOUNDS.WATCH.MIN) {
      severity = AlertSeverity.WATCH;
    }

    if (severity === AlertSeverity.NORMAL && signals.length === 0) {
      return null;
    }

    return {
      wellId: sample.wellId,
      riskType: RiskType.KICK,
      score: finalScore,
      severity,
      confidence: 0.91,
      depth: sample.measuredDepth,
      formation: sample.formationId,
      signals,
      evidence: {
        flowIn,
        flowOut,
        flowSurgeLpm: flowSurge,
        pitVolumeGainM3: pitVolChange,
      },
      contributingFactors,
      historicalContext: {
        precedentCount: kickPrecedents.length,
        similarWells: Array.from(new Set(kickPrecedents.map((p) => p.wellId || p.wellName))),
        topPrecedentEvents: kickPrecedents.slice(0, 3),
      },
      recommendedReview:
        'Perform immediate flow check as per Well Control Manual (API RP 59 / OIL SOP). Notify Toolpusher and Wellsite Drilling Engineer. Decision support only.',
      modelVersion: 'v1.0.0-rules',
      featureVersion: 'v1.0.0',
      timestamp: sample.timestamp,
    };
  }
}
