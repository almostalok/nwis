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
export class LostCirculationRiskEngine implements RiskEngine {
  private readonly logger = new Logger(LostCirculationRiskEngine.name);
  readonly riskType = RiskType.LOST_CIRCULATION;

  evaluate(context: RiskEvaluationContext): RiskAssessmentData | null {
    const { sample, features, anomalies, precedents } = context;

    // MANDATORY REQUIREMENT: Insufficient Data Rule
    // If flow-out sensor is unavailable/missing, do NOT invent a score.
    if (sample.flowOut === null || sample.flowOut === undefined) {
      return {
        wellId: sample.wellId,
        riskType: RiskType.LOST_CIRCULATION,
        score: 0,
        severity: AlertSeverity.NORMAL,
        confidence: 0.0,
        depth: sample.measuredDepth,
        formation: sample.formationId,
        signals: ['INSUFFICIENT DATA: Flow-out sensor unavailable'],
        evidence: {
          flowIn: sample.flowIn,
          flowOut: null,
          reason: 'Flow-out data unavailable for the current interval. Lost-circulation assessment is unavailable.',
        },
        contributingFactors: [],
        recommendedReview:
          'Verify flow-out sensor connectivity and return paddle calibration before evaluating lost circulation risk.',
        modelVersion: 'v1.0.0-rules',
        featureVersion: 'v1.0.0',
        timestamp: sample.timestamp,
      };
    }

    const primaryFeature = features.find((f) => f.windowSeconds === 60) ?? features[0];
    const flowIn = sample.flowIn ?? 0;
    const flowOut = sample.flowOut;
    const flowDeficit = flowIn - flowOut; // positive means loss
    const pitVolChange = primaryFeature?.pitVolumeChange ?? 0; // negative means pit level dropping

    const contributingFactors: ContributingFactor[] = [];
    const signals: string[] = [];
    let rawScore = 0;

    // 1. Flow out deficit vs flow in
    if (flowDeficit >= 150) {
      const ratio = Math.min(1.0, (flowDeficit - 150) / 450);
      const points = Number((RISK_WEIGHTS.LOST_CIRCULATION.FLOW_OUT_DEFICIT * (0.4 + 0.6 * ratio)).toFixed(1));
      rawScore += points;
      contributingFactors.push({
        factor: 'Flow Out Deficit',
        weight: RISK_WEIGHTS.LOST_CIRCULATION.FLOW_OUT_DEFICIT,
        contribution: points,
        description: `Flow return deficit: ${flowDeficit.toFixed(0)} L/min below pump rate`,
      });
      signals.push(`Flow Return Deficit -${flowDeficit.toFixed(0)} L/min`);
    }

    // 2. Pit volume decline
    if (pitVolChange <= -1.0) {
      const ratio = Math.min(1.0, Math.abs(pitVolChange + 1.0) / 4.0);
      const points = Number((RISK_WEIGHTS.LOST_CIRCULATION.PIT_VOLUME_LOSS * (0.4 + 0.6 * ratio)).toFixed(1));
      rawScore += points;
      contributingFactors.push({
        factor: 'Pit Volume Loss',
        weight: RISK_WEIGHTS.LOST_CIRCULATION.PIT_VOLUME_LOSS,
        contribution: points,
        description: `Active pit volume declined by ${Math.abs(pitVolChange).toFixed(1)} m³`,
      });
      signals.push(`Pit Volume Drop ${pitVolChange.toFixed(1)} m³`);
    }

    // 3. Historical Precedent Corroboration
    const lostPrecedents = (precedents ?? []).filter(
      (p) => p.eventType === 'LOST_CIRCULATION' || p.title?.includes('Loss')
    );
    if (lostPrecedents.length > 0) {
      const count = Math.min(2, lostPrecedents.length);
      const points = Number((RISK_WEIGHTS.LOST_CIRCULATION.HISTORICAL_PRECEDENT * (count / 2)).toFixed(1));
      rawScore += points;
      contributingFactors.push({
        factor: 'Historical Loss Precedent',
        weight: RISK_WEIGHTS.LOST_CIRCULATION.HISTORICAL_PRECEDENT,
        contribution: points,
        description: `${lostPrecedents.length} comparable lost-circulation events recorded in offset wells`,
      });
      signals.push(`${lostPrecedents.length} offset loss precedents`);
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
      riskType: RiskType.LOST_CIRCULATION,
      score: finalScore,
      severity,
      confidence: 0.88,
      depth: sample.measuredDepth,
      formation: sample.formationId,
      signals,
      evidence: {
        flowIn,
        flowOut,
        flowDeficitLpm: flowDeficit,
        pitVolumeChangeM3: pitVolChange,
      },
      contributingFactors,
      historicalContext: {
        precedentCount: lostPrecedents.length,
        similarWells: Array.from(new Set(lostPrecedents.map((p) => p.wellId || p.wellName))),
        topPrecedentEvents: lostPrecedents.slice(0, 3),
      },
      recommendedReview:
        'Verify mud pit totalizer and flow sensor readings. Prepare LCM (loss circulation material) per drilling program contingency. Decision-support prototype; do not perform automated pump changes.',
      modelVersion: 'v1.0.0-rules',
      featureVersion: 'v1.0.0',
      timestamp: sample.timestamp,
    };
  }
}
