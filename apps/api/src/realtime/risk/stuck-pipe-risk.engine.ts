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
export class StuckPipeRiskEngine implements RiskEngine {
  private readonly logger = new Logger(StuckPipeRiskEngine.name);
  readonly riskType = RiskType.STUCK_PIPE;

  evaluate(context: RiskEvaluationContext): RiskAssessmentData | null {
    const { sample, features, anomalies, precedents } = context;

    // Data completeness check: Stuck pipe evaluation requires torque or drag
    if (
      (sample.torque === null || sample.torque === undefined) &&
      (sample.drag === null || sample.drag === undefined)
    ) {
      return null;
    }

    const primaryFeature = features.find((f) => f.windowSeconds === 60) ?? features[0];
    const torqueDevPct = primaryFeature?.formationBaselineDeviation?.torquePct ?? 0;
    const ropDevPct = primaryFeature?.formationBaselineDeviation?.ropPct ?? 0;
    const dragDevPct = primaryFeature?.formationBaselineDeviation?.dragPct ?? 0;

    const contributingFactors: ContributingFactor[] = [];
    const signals: string[] = [];
    let rawScore = 0;

    // 1. Torque Trend & Deviation
    if (torqueDevPct >= 15) {
      const ratio = Math.min(1.0, (torqueDevPct - 15) / 25);
      const points = Number((RISK_WEIGHTS.STUCK_PIPE.TORQUE_TREND * (0.5 + 0.5 * ratio)).toFixed(1));
      rawScore += points;
      contributingFactors.push({
        factor: 'Torque Deviation',
        weight: RISK_WEIGHTS.STUCK_PIPE.TORQUE_TREND,
        contribution: points,
        description: `Torque increased ${torqueDevPct.toFixed(1)}% above formation baseline`,
      });
      signals.push(`Torque ↑ ${torqueDevPct.toFixed(1)}%`);
    }

    // 2. ROP Decline
    if (ropDevPct <= -15) {
      const ratio = Math.min(1.0, Math.abs(ropDevPct + 15) / 25);
      const points = Number((RISK_WEIGHTS.STUCK_PIPE.ROP_DECLINE * (0.5 + 0.5 * ratio)).toFixed(1));
      rawScore += points;
      contributingFactors.push({
        factor: 'ROP Decline',
        weight: RISK_WEIGHTS.STUCK_PIPE.ROP_DECLINE,
        contribution: points,
        description: `Rate of Penetration dropped ${Math.abs(ropDevPct).toFixed(1)}% below baseline`,
      });
      signals.push(`ROP ↓ ${Math.abs(ropDevPct).toFixed(1)}%`);
    }

    // 3. Drag Increase / Overpull
    if (dragDevPct >= 12) {
      const ratio = Math.min(1.0, (dragDevPct - 12) / 20);
      const points = Number((RISK_WEIGHTS.STUCK_PIPE.DRAG_INCREASE * (0.5 + 0.5 * ratio)).toFixed(1));
      rawScore += points;
      contributingFactors.push({
        factor: 'Drag Increase',
        weight: RISK_WEIGHTS.STUCK_PIPE.DRAG_INCREASE,
        contribution: points,
        description: `Overpull / drag increased ${dragDevPct.toFixed(1)}%`,
      });
      signals.push(`Drag ↑ ${dragDevPct.toFixed(1)}%`);
    }

    // 4. Historical Precedent Corroboration from Stage 02
    const stuckPrecedents = (precedents ?? []).filter(
      (p) => p.eventType === 'STUCK_PIPE' || p.title?.includes('Stuck')
    );
    if (stuckPrecedents.length > 0) {
      const count = Math.min(3, stuckPrecedents.length);
      const points = Number((RISK_WEIGHTS.STUCK_PIPE.HISTORICAL_PRECEDENT * (count / 3)).toFixed(1));
      rawScore += points;
      contributingFactors.push({
        factor: 'Historical Precedent',
        weight: RISK_WEIGHTS.STUCK_PIPE.HISTORICAL_PRECEDENT,
        contribution: points,
        description: `${stuckPrecedents.length} comparable historical stuck-pipe events documented in offset wells`,
      });
      signals.push(`${stuckPrecedents.length} historical stuck-pipe cases matched`);
    }

    // 5. Formation Context (e.g. Formation Gamma known high-friction/shale interval)
    if (sample.formationId?.includes('Gamma')) {
      const points = RISK_WEIGHTS.STUCK_PIPE.FORMATION_CONTEXT * 0.8;
      rawScore += points;
      contributingFactors.push({
        factor: 'Formation Sensitivity',
        weight: RISK_WEIGHTS.STUCK_PIPE.FORMATION_CONTEXT,
        contribution: Number(points.toFixed(1)),
        description: `${sample.formationId} identified as mechanically sensitive interval`,
      });
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.round(rawScore));

    // Determine severity
    let severity = AlertSeverity.NORMAL;
    if (finalScore >= RISK_SCORE_BOUNDS.CRITICAL.MIN) {
      severity = AlertSeverity.CRITICAL;
    } else if (finalScore >= RISK_SCORE_BOUNDS.WARNING.MIN) {
      severity = AlertSeverity.WARNING;
    } else if (finalScore >= RISK_SCORE_BOUNDS.WATCH.MIN) {
      severity = AlertSeverity.WATCH;
    }

    // If score is NORMAL, return assessment only if there are active signals
    if (severity === AlertSeverity.NORMAL && signals.length === 0) {
      return null;
    }

    return {
      wellId: sample.wellId,
      riskType: RiskType.STUCK_PIPE,
      score: finalScore,
      severity,
      confidence: 0.84,
      depth: sample.measuredDepth,
      formation: sample.formationId,
      signals,
      evidence: {
        currentTorque: sample.torque,
        torqueBaseline: primaryFeature?.torqueMean,
        torqueDeviationPct: torqueDevPct,
        currentRop: sample.rop,
        ropDeviationPct: ropDevPct,
        currentDrag: sample.drag,
        dragDeviationPct: dragDevPct,
      },
      contributingFactors,
      historicalContext: {
        precedentCount: stuckPrecedents.length,
        similarWells: Array.from(new Set(stuckPrecedents.map((p) => p.wellId || p.wellName))),
        topPrecedentEvents: stuckPrecedents.slice(0, 3),
      },
      recommendedReview:
        'Review approved stuck-pipe prevention procedure. Verify string rotation, check pick-up/slack-off weights, and monitor torque oscillation. NWIS provides decision-support only; no autonomous equipment changes are executed.',
      modelVersion: 'v1.0.0-rules',
      featureVersion: 'v1.0.0',
      timestamp: sample.timestamp,
    };
  }
}
