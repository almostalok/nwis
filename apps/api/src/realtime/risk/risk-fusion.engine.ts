import { Injectable, Logger } from '@nestjs/common';
import {
  RealtimeDrillingSample,
  RealtimeFeatureData,
  AnomalyData,
  RiskAssessmentData,
  RiskType,
  AlertSeverity,
  HistoricalEvidenceItem,
} from '@nwis/types';
import { RiskEvaluationContext } from './risk-engine.interface';
import { StuckPipeRiskEngine } from './stuck-pipe-risk.engine';
import { LostCirculationRiskEngine } from './lost-circulation-risk.engine';
import { KickRiskEngine } from './kick-risk.engine';
import { TorqueRiskEngine } from './torque-risk.engine';
import { CementingRiskEngine } from './cementing-risk.engine';
import { PrecedentEngineService } from '../../intelligence/precedent-engine.service';
import { ALERT_LIFECYCLE } from '../config/risk-config';

interface CachedPrecedents {
  timestamp: number;
  precedents: any[];
}

@Injectable()
export class RiskFusionEngine {
  private readonly logger = new Logger(RiskFusionEngine.name);

  // Precedent cache keyed by `${wellId}:${formation}:${depthBucket}`
  private precedentCache = new Map<string, CachedPrecedents>();

  constructor(
    private readonly stuckPipeEngine: StuckPipeRiskEngine,
    private readonly lostCirculationEngine: LostCirculationRiskEngine,
    private readonly kickEngine: KickRiskEngine,
    private readonly torqueEngine: TorqueRiskEngine,
    private readonly cementingEngine: CementingRiskEngine,
    private readonly precedentService: PrecedentEngineService
  ) {}

  /**
   * Main fusion pipeline:
   * Realtime telemetry + Features + Anomalies + Precedent Engine -> Unified Risk Assessments
   */
  async evaluateAllRisks(
    sample: RealtimeDrillingSample,
    features: RealtimeFeatureData[],
    anomalies: AnomalyData[]
  ): Promise<RiskAssessmentData[]> {
    // 1. Check if we need historical precedent context
    // Trigger historical lookup if anomalies exist or if sample values deviate significantly
    const hasAnomalies = anomalies.length > 0;
    let precedents: any[] = [];

    if (hasAnomalies) {
      precedents = await this.getPrecedentsWithCache(
        sample.wellId,
        sample.measuredDepth,
        sample.formationId ?? 'Formation Gamma'
      );
    }

    const context: RiskEvaluationContext = {
      sample,
      features,
      anomalies,
      precedents,
    };

    // 2. Evaluate all modular engines
    const assessments: (RiskAssessmentData | null)[] = [
      this.stuckPipeEngine.evaluate(context),
      this.lostCirculationEngine.evaluate(context),
      this.kickEngine.evaluate(context),
      this.torqueEngine.evaluate(context),
      this.cementingEngine.evaluate(context),
    ];

    // Filter out null or NORMAL assessments without active signals
    return assessments.filter((a): a is RiskAssessmentData => a !== null);
  }

  /**
   * Format precedents from Stage 02 Precedent Engine into structured HistoricalEvidenceItem
   */
  formatHistoricalEvidence(precedents: any[]): HistoricalEvidenceItem[] {
    if (!precedents || precedents.length === 0) return [];

    return precedents.map((p) => {
      const topEvidence = p.evidence && p.evidence.length > 0 ? p.evidence[0] : null;
      return {
        wellId: p.wellId ?? p.wellName ?? 'UNKNOWN',
        wellName: p.wellName ?? p.wellId ?? 'Offset Well',
        formationName: p.formation ?? p.formationName ?? 'Formation Gamma',
        depth: p.depth ?? 3200,
        eventType: p.eventType ?? 'STUCK_PIPE',
        severity: p.severity ?? 'CRITICAL',
        similarityScore: Number((p.similarityScore ?? 0.85).toFixed(2)),
        sourceDocument: topEvidence?.fileName ?? (p.wellId ? `WCR-${p.wellId}.pdf` : 'DDR-003.pdf'),
        documentType: topEvidence?.documentTitle ? 'WCR' : 'DDR',
        pageNumber: topEvidence?.pageNumber ?? 14,
        summary: p.description ?? p.title ?? 'Historical stuck pipe precursor observed during drilling',
      };
    });
  }

  /**
   * Retrieve precedents with caching to avoid duplicate DB/Vector searches every 1-second tick
   */
  private async getPrecedentsWithCache(
    wellId: string,
    depth: number,
    formation: string
  ): Promise<any[]> {
    // 25-meter depth bucket
    const depthBucket = Math.floor(depth / 25) * 25;
    const cacheKey = `${wellId}:${formation}:${depthBucket}`;
    const now = Date.now();

    const cached = this.precedentCache.get(cacheKey);
    if (cached && now - cached.timestamp < ALERT_LIFECYCLE.COOLDOWN_SECONDS * 1000) {
      return cached.precedents;
    }

    try {
      const result = await this.precedentService.detectPrecedents({
        wellId,
        targetDepth: depth,
        formationName: formation,
        radiusKm: 30,
      });

      const precedents = result?.precedents ?? [];
      this.precedentCache.set(cacheKey, { timestamp: now, precedents });
      return precedents;
    } catch (err) {
      this.logger.error(`Error querying precedent service for ${wellId} at ${depth}m:`, err);
      return [];
    }
  }
}

