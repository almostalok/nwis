import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { prisma } from '@nwis/database';
import { WellIntelligenceSummary } from '@nwis/types';
import { WellSimilarityService } from './well-similarity.service';

@Injectable()
export class IntelligenceService {
  private readonly logger = new Logger(IntelligenceService.name);

  constructor(private readonly similarityService: WellSimilarityService) {}

  /**
   * Generates a structured intelligence summary for a well (Section 41).
   */
  async getWellSummary(wellIdOrCode: string): Promise<WellIntelligenceSummary> {
    const well = await prisma.well.findFirst({
      where: { OR: [{ id: wellIdOrCode }, { wellId: wellIdOrCode }] },
      include: {
        formations: true,
        events: true,
        documents: true,
      },
    });

    if (!well) throw new NotFoundException(`Well [${wellIdOrCode}] not found`);

    // Group events by type
    const eventCounts: Record<string, number> = {};
    for (const ev of well.events) {
      eventCounts[ev.eventType] = (eventCounts[ev.eventType] || 0) + 1;
    }
    const majorEvents = Object.entries(eventCounts).map(([type, count]) => ({
      eventType: type as any,
      count,
    }));

    // Identify risk intervals from events
    const riskIntervals = well.events.map((ev) => ({
      startDepth: ev.startDepth,
      endDepth: ev.endDepth || ev.startDepth + 20,
      formation: well.formations.find((f) => f.id === ev.formationId)?.formationName || 'Barail/Tipam',
      riskFactor: ev.eventType,
      severity: ev.severity,
    }));

    // Find count of comparable wells
    const similarWells = await this.similarityService.findSimilarWells(well.id, 10);

    return {
      wellId: well.wellId,
      wellName: well.name,
      field: well.field,
      totalDepth: well.totalDepth,
      formations: well.formations.map((f) => f.formationName),
      majorEvents: majorEvents as any,
      riskIntervals: riskIntervals as any,
      documentCount: well.documents.length,
      comparableWellsCount: similarWells.filter((s) => s.overallSimilarity > 0.6).length,
    };
  }

  /**
   * Generates a unified depth-ordered timeline combining casings, formations, and events (Section 42).
   */
  async getWellTimeline(wellIdOrCode: string) {
    const well = await prisma.well.findFirst({
      where: { OR: [{ id: wellIdOrCode }, { wellId: wellIdOrCode }] },
      include: {
        formations: { orderBy: { topDepth: 'asc' } },
        events: {
          orderBy: { startDepth: 'asc' },
          include: { evidence: true },
        },
        casingSections: { orderBy: { settingDepth: 'asc' } },
      },
    });

    if (!well) throw new NotFoundException(`Well [${wellIdOrCode}] not found`);

    const timelineItems: any[] = [];

    // Add casing sections
    for (const c of well.casingSections) {
      timelineItems.push({
        type: 'CASING',
        depth: c.settingDepth,
        title: `Casing Shoe: ${c.section} (${c.casingSize}")`,
        details: `Grade: ${c.grade || 'L-80'}, Setting: ${c.settingDepth}m`,
      });
    }

    // Add formation tops
    for (const f of well.formations) {
      timelineItems.push({
        type: 'FORMATION_TOP',
        depth: f.topDepth,
        title: `Formation Top: ${f.formationName}`,
        details: `Lithology: ${f.lithology}, Interval: ${f.topDepth}m - ${f.bottomDepth}m`,
      });
    }

    // Add operational events
    for (const ev of well.events) {
      timelineItems.push({
        type: 'OPERATIONAL_EVENT',
        depth: ev.startDepth,
        title: `Event: ${ev.eventType} (${ev.severity})`,
        details: ev.description,
        mitigation: ev.mitigation,
        outcome: ev.outcome,
        evidenceCount: ev.evidence.length,
      });
    }

    // Sort all timeline items by depth ascending
    timelineItems.sort((a, b) => a.depth - b.depth);

    return {
      wellId: well.wellId,
      wellName: well.name,
      totalDepth: well.totalDepth,
      timelineItems,
    };
  }

  /**
   * Returns nearby offset wells with multi-factor similarity and historical risks (Section 30).
   */
  async getNearbyIntelligence(wellIdOrCode: string, limit = 5) {
    const well = await prisma.well.findFirst({
      where: { OR: [{ id: wellIdOrCode }, { wellId: wellIdOrCode }] },
    });

    if (!well) throw new NotFoundException(`Well [${wellIdOrCode}] not found`);

    const similarWells = await this.similarityService.findSimilarWells(well.id, limit);

    // Enrich each similar well with its historical events and risk summary
    const enriched = [];
    for (const item of similarWells) {
      const candidate = await prisma.well.findUnique({
        where: { id: item.candidateWellId },
        include: {
          events: {
            select: {
              id: true,
              eventType: true,
              severity: true,
              startDepth: true,
              description: true,
            },
          },
        },
      });

      enriched.push({
        ...item,
        status: candidate?.status,
        totalDepth: candidate?.totalDepth,
        historicalEvents: candidate?.events || [],
        riskEventsCount: candidate?.events.filter((e) => e.severity === 'HIGH' || e.severity === 'CRITICAL').length || 0,
      });
    }

    return enriched;
  }
}
