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
export class TorqueRiskEngine implements RiskEngine {
  private readonly logger = new Logger(TorqueRiskEngine.name);
  readonly riskType = RiskType.TORQUE_ANOMALY;

  evaluate(context: RiskEvaluationContext): RiskAssessmentData | null {
    const { sample, features, anomalies, precedents } = context;

    if (sample.torque === null || sample.torque === undefined) {
      return null;
    }

    const primaryFeature = features.find((f) => f.windowSeconds === 60) ?? features[0];
    const torque = sample.torque;
    const torqueMean = primaryFeature?.torqueMean ?? torque;
    const torqueDevPct = primaryFeature?.formationBaselineDeviation?.torquePct ?? 0;
    const torqueStd = primaryFeature?.torqueStd ?? 0;

    const contributingFactors: ContributingFactor[] = [];
    const signals: string[] = [];
    let rawScore = 0;

    // 1. Torque Magnitude Spike
    if (torqueDevPct >= 20) {
      const ratio = Math.min(1.0, (torqueDevPct - 20) / 30);
      const points = Number((RISK_WEIGHTS.TORQUE_ANOMALY.TORQUE_MAGNITUDE * (0.5 + 0.5 * ratio)).toFixed(1));
      rawScore += points;
      contributingFactors.push({
        factor: 'Torque Spike Magnitude',
        weight: RISK_WEIGHTS.TORQUE_ANOMALY.TORQUE_MAGNITUDE,
        contribution: points,
        description: `Surface torque elevated ${torqueDevPct.toFixed(1)}% above recent mean`,
      });
      signals.push(`Torque Spike +${torqueDevPct.toFixed(1)}%`);
    }

    // 2. Torque Oscillation / Erratic Behavior (Std Dev)
    if (torqueStd >= 2.5) {
      const ratio = Math.min(1.0, (torqueStd - 2.5) / 5.0);
      const points = Number((RISK_WEIGHTS.TORQUE_ANOMALY.TORQUE_OSCILLATION * (0.5 + 0.5 * ratio)).toFixed(1));
      rawScore += points;
      contributingFactors.push({
        factor: 'Torque Oscillation',
        weight: RISK_WEIGHTS.TORQUE_ANOMALY.TORQUE_OSCILLATION,
        contribution: points,
        description: `High torque standard deviation (${torqueStd.toFixed(2)} kNm) indicating torsional oscillation`,
      });
      signals.push(`Torque Oscillation σ=${torqueStd.toFixed(2)} kNm`);
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
      riskType: RiskType.TORQUE_ANOMALY,
      score: finalScore,
      severity,
      confidence: 0.86,
      depth: sample.measuredDepth,
      formation: sample.formationId,
      signals,
      evidence: {
        torque,
        torqueMean,
        torqueStd,
        torqueDevPct,
      },
      contributingFactors,
      recommendedReview:
        'Inspect top drive electrical/hydraulic feedback. Check for stick-slip dynamics and review bottom-hole assembly (BHA) stabilizer clearance.',
      modelVersion: 'v1.0.0-rules',
      featureVersion: 'v1.0.0',
      timestamp: sample.timestamp,
    };
  }
}
