import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { prisma, SpatialRepository } from '@nwis/database';
import {
  CrossWellComparison,
  EventType,
  SimilarityBreakdown,
  SimilarityWeights,
  WellSimilarityScore,
} from '@nwis/types';
import { SpatialUtils } from '@nwis/utils';

@Injectable()
export class WellSimilarityService {
  private readonly logger = new Logger(WellSimilarityService.name);
  private readonly spatialRepo = new SpatialRepository(prisma);

  // Configurable engineering weights (Section 26)
  private readonly defaultWeights: SimilarityWeights = {
    spatialWeight: 0.2,
    formationWeight: 0.3,
    depthWeight: 0.2,
    trajectoryWeight: 0.1,
    operationalWeight: 0.1,
    reservoirWeight: 0.1,
  };

  /**
   * Calculates multi-factor similarity between target well and candidate well.
   */
  async calculateSimilarity(
    targetWellId: string,
    candidateWellId: string,
    weights: SimilarityWeights = this.defaultWeights,
  ): Promise<WellSimilarityScore> {
    const [targetWell, candidateWell] = await Promise.all([
      prisma.well.findUnique({
        where: { id: targetWellId },
        include: {
          formations: true,
          events: true,
          trajectoryPoints: { orderBy: { measuredDepth: 'asc' }, take: 10 },
        },
      }),
      prisma.well.findUnique({
        where: { id: candidateWellId },
        include: {
          formations: true,
          events: true,
          trajectoryPoints: { orderBy: { measuredDepth: 'asc' }, take: 10 },
        },
      }),
    ]);

    if (!targetWell) throw new NotFoundException(`Target well [${targetWellId}] not found`);
    if (!candidateWell) throw new NotFoundException(`Candidate well [${candidateWellId}] not found`);

    // 1. Spatial Similarity (Distance decay)
    const distanceKm = SpatialUtils.haversineDistanceKm(
      targetWell.latitude,
      targetWell.longitude,
      candidateWell.latitude,
      candidateWell.longitude,
    );
    // 0km -> 1.0; 10km -> 0.6; 25km -> 0.2; >30km -> 0.05
    const spatialScore = Math.max(0, 1 - distanceKm / 25);

    // 2. Formation Overlap (Jaccard Index)
    const targetFormations = new Set(targetWell.formations.map((f) => f.formationName));
    const candidateFormations = new Set(candidateWell.formations.map((f) => f.formationName));
    const sharedFormations = Array.from(targetFormations).filter((f) => candidateFormations.has(f));
    const allFormations = new Set([...Array.from(targetFormations), ...Array.from(candidateFormations)]);
    const formationScore = allFormations.size > 0 ? sharedFormations.length / allFormations.size : 0;

    // 3. Depth Profile Overlap
    const targetTD = targetWell.totalDepth;
    const candidateTD = candidateWell.totalDepth;
    const minTD = Math.min(targetTD, candidateTD);
    const maxTD = Math.max(targetTD, candidateTD);
    const depthScore = maxTD > 0 ? minTD / maxTD : 0;
    const depthOverlapMeters = minTD;

    // 4. Trajectory Profile Similarity
    const targetMaxInc = Math.max(...targetWell.trajectoryPoints.map((p) => p.inclination), 0);
    const candMaxInc = Math.max(...candidateWell.trajectoryPoints.map((p) => p.inclination), 0);
    const incDiff = Math.abs(targetMaxInc - candMaxInc);
    const trajectoryScore = Math.max(0, 1 - incDiff / 90);

    // 5. Operational / Event Profile Similarity
    const targetEventTypes = new Set(targetWell.events.map((e) => e.eventType));
    const candidateEventTypes = new Set(candidateWell.events.map((e) => e.eventType));
    const sharedEvents = Array.from(targetEventTypes).filter((e) => candidateEventTypes.has(e));
    const operationalScore =
      targetEventTypes.size > 0
        ? sharedEvents.length / targetEventTypes.size
        : candidateEventTypes.size > 0
        ? 0.5
        : 0.8;

    // 6. Reservoir Formations Similarity
    const targetReservoirs = targetWell.formations.filter((f) => f.reservoir).map((f) => f.formationName);
    const candReservoirs = candidateWell.formations.filter((f) => f.reservoir).map((f) => f.formationName);
    const sharedReservoirs = targetReservoirs.filter((r) => candReservoirs.includes(r));
    const reservoirScore =
      targetReservoirs.length > 0 ? sharedReservoirs.length / targetReservoirs.length : 0.7;

    const breakdown: SimilarityBreakdown = {
      spatial: Number(spatialScore.toFixed(3)),
      formation: Number(formationScore.toFixed(3)),
      depth: Number(depthScore.toFixed(3)),
      trajectory: Number(trajectoryScore.toFixed(3)),
      operational: Number(operationalScore.toFixed(3)),
      reservoir: Number(reservoirScore.toFixed(3)),
    };

    const overallSimilarity = Number(
      (
        breakdown.spatial * weights.spatialWeight +
        breakdown.formation * weights.formationWeight +
        breakdown.depth * weights.depthWeight +
        breakdown.trajectory * weights.trajectoryWeight +
        breakdown.operational * weights.operationalWeight +
        breakdown.reservoir * weights.reservoirWeight
      ).toFixed(3),
    );

    // Build human-readable explanations (Section 27)
    const explanation: string[] = [];
    if (distanceKm < 3) {
      explanation.push(`Immediate offset well: located only ${distanceKm.toFixed(1)} km away`);
    } else if (distanceKm < 10) {
      explanation.push(`Field proximity: located within ${distanceKm.toFixed(1)} km radius`);
    }

    if (sharedFormations.length > 0) {
      explanation.push(`Shares ${sharedFormations.length} geological formations: ${sharedFormations.slice(0, 3).join(', ')}`);
    }

    if (depthScore > 0.85) {
      explanation.push(`Target depth difference is within ${Math.abs(targetTD - candidateTD).toFixed(0)}m (${targetTD}m vs ${candidateTD}m)`);
    }

    if (sharedEvents.length > 0) {
      explanation.push(`Encountered similar historical operational events: ${sharedEvents.join(', ')}`);
    }

    return {
      targetWellId,
      candidateWellId,
      candidateWellName: candidateWell.name,
      distanceKm: Number(distanceKm.toFixed(2)),
      overallSimilarity,
      breakdown,
      sharedFormations,
      depthOverlapMeters,
      explanation,
    };
  }

  /**
   * Finds and ranks most similar offset wells for a given target well.
   */
  async findSimilarWells(targetWellId: string, limit = 5): Promise<WellSimilarityScore[]> {
    const allWells = await prisma.well.findMany({
      where: { id: { not: targetWellId } },
      select: { id: true },
    });

    const scores: WellSimilarityScore[] = [];
    for (const w of allWells) {
      try {
        const score = await this.calculateSimilarity(targetWellId, w.id);
        scores.push(score);
      } catch (err) {
        // Skip inaccessible wells
      }
    }

    scores.sort((a, b) => b.overallSimilarity - a.overallSimilarity);
    return scores.slice(0, limit);
  }

  /**
   * Generates a detailed multi-dimensional comparison between two wells.
   */
  async compareWells(wellAIdOrCode: string, wellBIdOrCode: string): Promise<CrossWellComparison> {
    const [wellA, wellB] = await Promise.all([
      prisma.well.findFirst({
        where: { OR: [{ id: wellAIdOrCode }, { wellId: wellAIdOrCode }] },
        include: { formations: true, events: true },
      }),
      prisma.well.findFirst({
        where: { OR: [{ id: wellBIdOrCode }, { wellId: wellBIdOrCode }] },
        include: { formations: true, events: true },
      }),
    ]);

    if (!wellA) throw new NotFoundException(`Well [${wellAIdOrCode}] not found`);
    if (!wellB) throw new NotFoundException(`Well [${wellBIdOrCode}] not found`);

    const similarity = await this.calculateSimilarity(wellA.id, wellB.id);

    const formsA = wellA.formations.map((f) => f.formationName);
    const formsB = wellB.formations.map((f) => f.formationName);
    const sharedForms = formsA.filter((f) => formsB.includes(f));
    const uniqueA = formsA.filter((f) => !formsB.includes(f));
    const uniqueB = formsB.filter((f) => !formsA.includes(f));

    const eventsA = wellA.events;
    const eventsB = wellB.events;
    const typesA = new Set(eventsA.map((e) => e.eventType));
    const typesB = new Set(eventsB.map((e) => e.eventType));
    const sharedEventTypes = Array.from(typesA).filter((t) => typesB.has(t));

    return {
      wellA: {
        id: wellA.id,
        wellId: wellA.wellId,
        name: wellA.name,
        totalDepth: wellA.totalDepth,
        formations: formsA,
        eventCount: eventsA.length,
        nptHours: eventsA.length * 18, // Estimated NPT for demo
      },
      wellB: {
        id: wellB.id,
        wellId: wellB.wellId,
        name: wellB.name,
        totalDepth: wellB.totalDepth,
        formations: formsB,
        eventCount: eventsB.length,
        nptHours: eventsB.length * 18,
      },
      distanceKm: similarity.distanceKm,
      similarityScore: similarity.overallSimilarity,
      similarityBreakdown: similarity.breakdown,
      formationOverlap: {
        shared: sharedForms,
        uniqueToA: uniqueA,
        uniqueToB: uniqueB,
      },
      depthCorrelation: {
        depthOverlapMeters: similarity.depthOverlapMeters,
        correlationRatio: Number((similarity.depthOverlapMeters / Math.max(wellA.totalDepth, wellB.totalDepth)).toFixed(2)),
      },
      historicalEventsComparison: {
        eventsA,
        eventsB,
        sharedEventTypes: sharedEventTypes as unknown as EventType[],
      },
      explanations: similarity.explanation,
    };
  }
}
