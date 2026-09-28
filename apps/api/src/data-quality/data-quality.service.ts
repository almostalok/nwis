import { Injectable } from '@nestjs/common';
import { prisma } from '@nwis/database';
import { DataQualityReport, QualityStatus } from '@nwis/types';

@Injectable()
export class DataQualityService {
  async getReport(): Promise<DataQualityReport> {
    const [wells, formations, events, drillingSamples] = await Promise.all([
      prisma.well.findMany({ select: { id: true, wellId: true, totalDepth: true, qualityStatus: true, qualityScore: true } }),
      prisma.formationInterval.findMany({ select: { id: true, topDepth: true, bottomDepth: true, qualityStatus: true } }),
      prisma.operationalEvent.findMany({ select: { id: true, wellId: true, startDepth: true, endDepth: true, qualityStatus: true, qualityScore: true } }),
      prisma.drillingParameterSample.findMany({ select: { id: true, rop: true, wob: true, torque: true, qualityStatus: true }, take: 200 }),
    ]);

    const statusCounts: Record<QualityStatus, number> = {
      [QualityStatus.VALID]: 0,
      [QualityStatus.WARNING]: 0,
      [QualityStatus.INVALID]: 0,
      [QualityStatus.UNVERIFIED]: 0,
      [QualityStatus.VERIFIED]: 0,
    };

    let totalScoreSum = 0;
    let totalScoreCount = 0;

    const countStatus = (status: any, score?: number) => {
      const qStatus = (status as QualityStatus) || QualityStatus.VALID;
      if (statusCounts[qStatus] !== undefined) {
        statusCounts[qStatus]++;
      }
      if (score !== undefined && !isNaN(score)) {
        totalScoreSum += score;
        totalScoreCount++;
      }
    };

    wells.forEach((w) => countStatus(w.qualityStatus, w.qualityScore));
    formations.forEach((f) => countStatus(f.qualityStatus, 1.0));
    events.forEach((e) => countStatus(e.qualityStatus, e.qualityScore));
    drillingSamples.forEach((s) => countStatus(s.qualityStatus, 1.0));

    const totalRecords = wells.length + formations.length + events.length + drillingSamples.length;
    const overallScore = totalScoreCount > 0 ? Number((totalScoreSum / totalScoreCount).toFixed(3)) : 1.0;

    // Detect anomalies / flags
    const recentFlags: any[] = [];

    // Check for any wells with depth < 100m
    wells.forEach((w) => {
      if (w.totalDepth < 500) {
        recentFlags.push({
          entityType: 'WELL',
          entityId: w.wellId,
          field: 'totalDepth',
          issue: `Unusually shallow total depth (${w.totalDepth}m) for deep exploration target`,
          severity: 'LOW',
        });
      }
    });

    // Check for formation overlap or inversion
    formations.forEach((f) => {
      if (f.bottomDepth <= f.topDepth) {
        recentFlags.push({
          entityType: 'FORMATION',
          entityId: f.id,
          field: 'depthInterval',
          issue: `Inverted depth interval: Top ${f.topDepth}m >= Bottom ${f.bottomDepth}m`,
          severity: 'HIGH',
        });
      }
    });

    // Check for events with missing end depth
    events.forEach((e) => {
      if (e.endDepth && e.endDepth < e.startDepth) {
        recentFlags.push({
          entityType: 'EVENT',
          entityId: e.id,
          field: 'endDepth',
          issue: `Event end depth (${e.endDepth}m) is shallower than start depth (${e.startDepth}m)`,
          severity: 'HIGH',
        });
      }
    });

    return {
      overallScore,
      totalRecords,
      statusBreakdown: statusCounts,
      anomaliesCount: recentFlags.length,
      wellsEvaluated: wells.length,
      formationsEvaluated: formations.length,
      eventsEvaluated: events.length,
      samplesEvaluated: drillingSamples.length,
      recentFlags,
    };
  }
}
