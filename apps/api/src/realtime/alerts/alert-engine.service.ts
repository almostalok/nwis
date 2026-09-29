import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { prisma } from '@nwis/database';
import {
  RealtimeDrillingSample,
  RealtimeFeatureData,
  RiskAssessmentData,
  AlertData,
  AlertEventData,
  AlertSeverity,
  AlertStatus,
  RiskType,
  HistoricalEvidenceItem,
} from '@nwis/types';
import { ALERT_LIFECYCLE } from '../config/risk-config';

@Injectable()
export class AlertEngineService {
  private readonly logger = new Logger(AlertEngineService.name);
  private readonly prisma = prisma;

  // In-memory tracking of normal sample counts per well/riskType for debounced resolution
  private normalSampleCounts = new Map<string, number>();

  constructor() {}


  /**
   * Evaluate a risk assessment and create, update, escalate, or resolve alerts
   */
  async processRiskAssessment(
    sample: RealtimeDrillingSample,
    risk: RiskAssessmentData,
    historicalEvidence: HistoricalEvidenceItem[]
  ): Promise<{ alert: any; action: string } | null> {
    const wellId = sample.wellId;
    const riskType = risk.riskType;
    const severity = risk.severity;
    const score = risk.score;
    const key = `${wellId}:${riskType}`;

    // Find any existing active alert for this well and riskType
    const activeAlert = await this.prisma.alert.findFirst({
      where: {
        wellId,
        riskType: riskType as any,
        status: { in: ['NEW', 'ACKNOWLEDGED', 'ESCALATED'] },
      },
      orderBy: { createdAt: 'desc' },
      include: { events: true },
    });

    // 1. If risk is elevated (WATCH, WARNING, or CRITICAL)
    if (severity !== AlertSeverity.NORMAL && score > 30) {
      // Reset normal sample count
      this.normalSampleCounts.set(key, 0);

      if (!activeAlert) {
        // Create NEW alert
        const title = `Elevated ${riskType.replace(/_/g, ' ')} Risk Pattern Detected`;
        const description = `Live drilling telemetry at ${sample.measuredDepth}m (${sample.formationId ?? 'Unknown Formation'}) displays elevated risk score of ${score}/100. Signals: ${risk.signals.join(', ')}`;

        const newAlert = await this.prisma.alert.create({
          data: {
            wellId,
            riskType: riskType as any,
            severity: severity as any,
            status: AlertStatus.NEW,
            title,
            description,
            score,
            confidence: risk.confidence,
            detectedDepth: sample.measuredDepth,
            formationId: sample.formationId,
            triggerSignals: risk.signals,
            historicalEvidence: historicalEvidence as any,
            sourceEvidence: risk.evidence as any,
            peakScore: score,
            lastTriggeredAt: new Date(sample.timestamp),
            modelVersion: risk.modelVersion ?? 'v1.0.0-rules',
            featureVersion: risk.featureVersion ?? 'v1.0.0',
            events: {
              create: {
                action: 'CREATED',
                actor: 'SYSTEM',
                previousState: null,
                newState: AlertStatus.NEW,
                score,
                reason: `Initial detection at ${sample.measuredDepth}m`,
              },
            },
          },
          include: { events: true },
        });

        // Store Context Snapshot for Warning/Critical
        if (severity === AlertSeverity.WARNING || severity === AlertSeverity.CRITICAL) {
          await this.createContextSnapshot(newAlert.id, sample, risk, historicalEvidence);
        }

        this.logger.log(`Created new alert ${newAlert.id} for well ${wellId} (${riskType})`);
        return { alert: newAlert, action: 'CREATED' };
      } else {
        // DEDUPLICATION & ESCALATION on existing active alert
        const isEscalation =
          (activeAlert.severity === AlertSeverity.WATCH && (severity === AlertSeverity.WARNING || severity === AlertSeverity.CRITICAL)) ||
          (activeAlert.severity === AlertSeverity.WARNING && severity === AlertSeverity.CRITICAL);

        const newPeakScore = Math.max(activeAlert.peakScore, score);
        const newStatus = isEscalation ? AlertStatus.ESCALATED : activeAlert.status;
        const newSeverity = isEscalation ? severity : activeAlert.severity;

        const updated = await this.prisma.alert.update({
          where: { id: activeAlert.id },
          data: {
            score,
            peakScore: newPeakScore,
            severity: newSeverity as any,
            status: newStatus as any,
            lastTriggeredAt: new Date(sample.timestamp),
            triggerSignals: risk.signals,
            sourceEvidence: risk.evidence as any,
            historicalEvidence: historicalEvidence.length > 0 ? (historicalEvidence as any) : undefined,
            events: {
              create: {
                action: isEscalation ? 'ESCALATED' : 'SCORE_UPDATED',
                actor: 'SYSTEM',
                previousState: activeAlert.status,
                newState: newStatus,
                score,
                reason: isEscalation
                  ? `Escalated to ${severity} due to persistent worsening signals`
                  : `Telemetry updated; current score: ${score}, peak: ${newPeakScore}`,
              },
            },
          },
          include: { events: true },
        });

        if (isEscalation) {
          await this.createContextSnapshot(updated.id, sample, risk, historicalEvidence);
        }

        return { alert: updated, action: isEscalation ? 'ESCALATED' : 'UPDATED' };
      }
    } else {
      // 2. Risk is NORMAL (Signals normalized) -> DEBOUNCED RESOLUTION
      if (activeAlert) {
        const count = (this.normalSampleCounts.get(key) ?? 0) + 1;
        this.normalSampleCounts.set(key, count);

        // Auto-resolve only after consecutive normal samples
        if (count >= ALERT_LIFECYCLE.DEBOUNCE_SAMPLES_FOR_RESOLUTION) {
          const resolved = await this.prisma.alert.update({
            where: { id: activeAlert.id },
            data: {
              status: AlertStatus.RESOLVED,
              resolvedBy: 'SYSTEM_AUTO_DEBOUNCE',
              resolvedAt: new Date(),
              resolutionNote: `Telemetry signals stabilized within baseline for ${count} consecutive samples. Risk score reduced to ${score}.`,
              events: {
                create: {
                  action: 'RESOLVED',
                  actor: 'SYSTEM',
                  previousState: activeAlert.status,
                  newState: AlertStatus.RESOLVED,
                  score,
                  reason: `Auto-resolved after ${count} consecutive normal samples`,
                },
              },
            },
            include: { events: true },
          });

          this.normalSampleCounts.delete(key);
          this.logger.log(`Auto-resolved alert ${activeAlert.id} for well ${wellId} after stabilization`);
          return { alert: resolved, action: 'RESOLVED' };
        }
      }
      return null;
    }
  }

  /**
   * Manual acknowledgement by Drilling Engineer
   */
  async acknowledgeAlert(alertId: string, actor: string, note?: string): Promise<any> {
    const alert = await this.prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) throw new NotFoundException(`Alert ${alertId} not found`);

    if (alert.status === AlertStatus.RESOLVED || alert.status === AlertStatus.DISMISSED) {
      throw new BadRequestException(`Cannot acknowledge an alert that is ${alert.status}`);
    }

    return this.prisma.alert.update({
      where: { id: alertId },
      data: {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedBy: actor,
        acknowledgedAt: new Date(),
        events: {
          create: {
            action: 'ACKNOWLEDGED',
            actor,
            previousState: alert.status,
            newState: AlertStatus.ACKNOWLEDGED,
            score: alert.score,
            reason: note ?? 'Acknowledged by drilling engineer',
          },
        },
      },
      include: { events: true },
    });
  }

  /**
   * Manual resolution by Drilling Engineer / Manager
   */
  async resolveAlert(alertId: string, actor: string, note: string): Promise<any> {
    const alert = await this.prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) throw new NotFoundException(`Alert ${alertId} not found`);

    return this.prisma.alert.update({
      where: { id: alertId },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedBy: actor,
        resolvedAt: new Date(),
        resolutionNote: note,
        events: {
          create: {
            action: 'RESOLVED',
            actor,
            previousState: alert.status,
            newState: AlertStatus.RESOLVED,
            score: alert.score,
            reason: note,
          },
        },
      },
      include: { events: true },
    });
  }

  /**
   * Manual dismissal with required justification reason
   */
  async dismissAlert(alertId: string, actor: string, reason: string): Promise<any> {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('A reason is strictly required to dismiss an alert');
    }

    const alert = await this.prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) throw new NotFoundException(`Alert ${alertId} not found`);

    return this.prisma.alert.update({
      where: { id: alertId },
      data: {
        status: AlertStatus.DISMISSED,
        dismissedBy: actor,
        dismissedAt: new Date(),
        dismissalReason: reason,
        events: {
          create: {
            action: 'DISMISSED',
            actor,
            previousState: alert.status,
            newState: AlertStatus.DISMISSED,
            score: alert.score,
            reason,
          },
        },
      },
      include: { events: true },
    });
  }

  /**
   * Query alerts with comprehensive filtering
   */
  async getAlerts(filter?: {
    wellId?: string;
    riskType?: RiskType;
    severity?: AlertSeverity;
    status?: AlertStatus;
    limit?: number;
  }): Promise<any[]> {
    const where: any = {};
    if (filter?.wellId) where.wellId = filter.wellId;
    if (filter?.riskType) where.riskType = filter.riskType as any;
    if (filter?.severity) where.severity = filter.severity as any;
    if (filter?.status) where.status = filter.status as any;

    return this.prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filter?.limit ?? 50,
      include: {
        events: { orderBy: { timestamp: 'desc' } },
        well: { select: { wellId: true, name: true, field: true } },
      },
    });
  }

  async getAlertById(id: string): Promise<any> {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
      include: {
        events: { orderBy: { timestamp: 'asc' } },
        well: true,
      },
    });
    if (!alert) throw new NotFoundException(`Alert with ID ${id} not found`);
    return alert;
  }

  /**
   * Create an immutable ContextSnapshot for auditability and post-event analysis
   */
  private async createContextSnapshot(
    alertId: string,
    sample: RealtimeDrillingSample,
    risk: RiskAssessmentData,
    historicalEvidence: HistoricalEvidenceItem[]
  ): Promise<void> {
    try {
      await this.prisma.contextSnapshot.create({
        data: {
          alertId,
          wellId: sample.wellId,
          depth: sample.measuredDepth,
          formation: sample.formationId,
          drillingState: sample.drillingState ?? 'DRILLING',
          currentParameters: {
            rop: sample.rop,
            torque: sample.torque,
            wob: sample.wob,
            rpm: sample.rpm,
            drag: sample.drag,
            hookload: sample.hookload,
            spp: sample.standpipePressure,
            flowIn: sample.flowIn,
            flowOut: sample.flowOut,
            pitVolume: sample.pitVolume,
          },
          recentFeatures: {},
          activeAnomalies: [],
          activeRisks: [risk as any],
          similarWells: historicalEvidence.map((e) => e.wellId),
          historicalPrecedents: historicalEvidence as any,
          sourceDocuments: historicalEvidence.map((e) => e.sourceDocument ?? '') as any,
          modelVersion: risk.modelVersion ?? 'v1.0.0-rules',
          configVersion: 'v1.0.0',
        },
      });

    } catch (err) {
      this.logger.error(`Error saving context snapshot for alert ${alertId}:`, err);
    }
  }
}
