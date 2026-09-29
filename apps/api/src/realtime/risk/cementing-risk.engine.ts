import { Injectable, Logger } from '@nestjs/common';
import { RiskEngine, RiskEvaluationContext } from './risk-engine.interface';
import {
  RiskAssessmentData,
  RiskType,
  AlertSeverity,
  DrillingState,
  ContributingFactor,
} from '@nwis/types';
import { RISK_WEIGHTS, RISK_SCORE_BOUNDS } from '../config/risk-config';

@Injectable()
export class CementingRiskEngine implements RiskEngine {
  private readonly logger = new Logger(CementingRiskEngine.name);
  readonly riskType = RiskType.CEMENTING_RISK;

  evaluate(context: RiskEvaluationContext): RiskAssessmentData | null {
    const { sample, features, anomalies, precedents } = context;

    // Requirement: Do not create cementing alerts while drilling unless in CEMENTING state
    if (sample.drillingState !== DrillingState.CEMENTING) {
      return null;
    }

    const contributingFactors: ContributingFactor[] = [];
    const signals: string[] = [];
    let rawScore = 0;

    const pumpPressure = sample.pumpPressure ?? sample.standpipePressure ?? 0;
    // Expected cementing displacement pressure ~ 120-180 bar
    if (pumpPressure > 220) {
      const points = RISK_WEIGHTS.CEMENTING.DISPLACEMENT_PRESSURE * 0.8;
      rawScore += points;
      contributingFactors.push({
        factor: 'Displacement Pressure Elevation',
        weight: RISK_WEIGHTS.CEMENTING.DISPLACEMENT_PRESSURE,
        contribution: points,
        description: `Cement displacement pressure (${pumpPressure} bar) exceeds planned schedule`,
      });
      signals.push(`Displacement Pressure ${pumpPressure} bar`);
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

    if (severity === AlertSeverity.NORMAL) {
      return null;
    }

    return {
      wellId: sample.wellId,
      riskType: RiskType.CEMENTING_RISK,
      score: finalScore,
      severity,
      confidence: 0.82,
      depth: sample.measuredDepth,
      formation: sample.formationId,
      signals,
      evidence: { pumpPressure, drillingState: sample.drillingState },
      contributingFactors,
      recommendedReview:
        'Verify cementing unit transducer calibration, check slurry density and check returns flowrate against displacement calculations.',
      modelVersion: 'v1.0.0-rules',
      featureVersion: 'v1.0.0',
      timestamp: sample.timestamp,
    };
  }
}
