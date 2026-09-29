import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@nwis/database';
import {
  DetectedPrecedent,
  PrecedentDetectionResult,
  PrecedentEvidenceItem,
  PrecedentQueryDto,
} from '@nwis/types';
import { SpatialUtils } from '@nwis/utils';

@Injectable()
export class PrecedentEngineService {
  private readonly logger = new Logger(PrecedentEngineService.name);

  /**
   * The Signature NWIS Precedent Engine:
   * "Has a comparable operational situation happened before in offset wells?"
   */
  async detectPrecedents(query: PrecedentQueryDto): Promise<PrecedentDetectionResult> {
    const { wellId, targetDepth, formationName, radiusKm = 25, parameters } = query;
    this.logger.log(
      `Detecting precedents for depth: ${targetDepth}m, formation: ${formationName || 'ANY'}, wellId: ${wellId || 'UNSPECIFIED'}`,
    );

    // 1. Resolve current well coordinates if wellId provided
    let currentWell: any = null;
    if (wellId) {
      currentWell = await prisma.well.findFirst({
        where: { OR: [{ id: wellId }, { wellId: wellId }] },
      });
    }

    // 2. Identify candidate offset wells
    const candidateWells = await prisma.well.findMany({
      where: currentWell ? { id: { not: currentWell.id } } : undefined,
      include: {
        formations: true,
        events: {
          include: {
            evidence: {
              include: {
                document: true,
              },
            },
            formation: true,
            document: true,
          },
        },
      },
    });

    const detectedPrecedents: DetectedPrecedent[] = [];
    const observedIndicators: string[] = [];

    // Analyze current parameter indicators
    if (parameters) {
      if (parameters.torque && parameters.torque > 25) {
        observedIndicators.push('TORQUE_SPIKE');
      }
      if (parameters.rop && parameters.rop < 6) {
        observedIndicators.push('ROP_DECREASE');
      }
      if (parameters.standpipePressure && parameters.standpipePressure > 210) {
        observedIndicators.push('PRESSURE_ANOMALY');
      }
    }

    for (const cand of candidateWells) {
      // Calculate distance if current well available
      let distanceKm = 3.5;
      if (currentWell) {
        distanceKm = SpatialUtils.haversineDistanceKm(
          currentWell.latitude,
          currentWell.longitude,
          cand.latitude,
          cand.longitude,
        );
        if (distanceKm > radiusKm) {
          continue; // outside requested radius
        }
      }

      // Check formation correlation
      const matchingFormations = cand.formations.filter((f) => {
        if (formationName) {
          return (
            f.formationName.toLowerCase().includes(formationName.toLowerCase()) ||
            formationName.toLowerCase().includes(f.formationName.toLowerCase())
          );
        }
        return f.topDepth <= targetDepth && f.bottomDepth >= targetDepth;
      });

      const formationMatched = matchingFormations.length > 0;
      const targetFormationName = formationMatched
        ? matchingFormations[0].formationName
        : formationName || 'Unknown Formation';

      // Find events in candidate well matching depth interval (+/- 80m)
      const matchingEvents = cand.events.filter((e) => {
        const depthDelta = Math.abs(e.startDepth - targetDepth);
        return depthDelta <= 80;
      });

      for (const ev of matchingEvents) {
        // Calculate similarity score based on depth closeness, distance, and formation match
        const depthDelta = Math.abs(ev.startDepth - targetDepth);
        const depthCloseness = Math.max(0, 1 - depthDelta / 80);
        const distanceCloseness = Math.max(0, 1 - distanceKm / 25);
        const formationBonus = formationMatched ? 0.35 : 0.1;

        // Precursor parameter match bonus
        let precursorBonus = 0;
        const evIndicators = (ev.precedingIndicators as string[]) || [];
        const commonIndicators = evIndicators.filter((ind) => observedIndicators.includes(ind));
        if (commonIndicators.length > 0) {
          precursorBonus = 0.2;
        }

        const similarityScore = Math.min(
          0.98,
          Number((0.35 * depthCloseness + 0.25 * distanceCloseness + formationBonus + precursorBonus).toFixed(2)),
        );

        // Build evidence citations
        const evidenceItems: PrecedentEvidenceItem[] = [];
        if (ev.evidence && ev.evidence.length > 0) {
          for (const evi of ev.evidence) {
            evidenceItems.push({
              id: evi.id,
              documentTitle: evi.document?.title || 'Daily Drilling Report',
              fileName: evi.document?.fileName || 'drilling-report.txt',
              pageNumber: evi.pageNumber,
              textExcerpt: evi.textExcerpt,
              confidence: evi.confidence,
            });
          }
        } else if (ev.document) {
          evidenceItems.push({
            id: ev.document.id,
            documentTitle: ev.document.title,
            fileName: ev.document.fileName,
            pageNumber: ev.sourcePage || 1,
            textExcerpt: ev.description,
            confidence: ev.extractionConfidence || 0.95,
          });
        }

        // Build human-readable relevance explanation
        const relevanceExplanation: string[] = [
          `Matched historical event [${ev.eventType}] at ${ev.startDepth}m (delta ${depthDelta.toFixed(0)}m from target ${targetDepth}m)`,
          `Offset well ${cand.wellId} (${cand.name}) located ${distanceKm.toFixed(1)} km away`,
        ];

        if (formationMatched) {
          relevanceExplanation.push(`Identical geological interval: ${targetFormationName}`);
        }

        if (commonIndicators.length > 0) {
          relevanceExplanation.push(`Matching precursor signature: ${commonIndicators.join(', ')}`);
        }

        detectedPrecedents.push({
          id: ev.id,
          wellId: cand.wellId,
          wellName: cand.name,
          distanceKm: Number(distanceKm.toFixed(1)),
          similarityScore,
          eventType: ev.eventType as unknown as any,
          severity: ev.severity as unknown as any,
          depth: ev.startDepth,
          formation: ev.formation?.formationName || targetFormationName,
          precedingIndicators: evIndicators,
          description: ev.description,
          rootCause: ev.rootCause,
          mitigation: ev.mitigation,
          outcome: ev.outcome,
          evidence: evidenceItems,
          relevanceExplanation,
        });
      }
    }

    // Sort precedents by similarity score descending
    detectedPrecedents.sort((a, b) => b.similarityScore - a.similarityScore);

    const detectedCount = detectedPrecedents.length;
    let summary = 'No historical precedents found for the specified depth interval.';
    if (detectedCount > 0) {
      const top = detectedPrecedents[0];
      summary = `PRECEDENT DETECTED: Found ${detectedCount} comparable historical events in offset wells around ${targetDepth}m. Primary precedent: ${top.eventType} in well ${top.wellId} (${(top.similarityScore * 100).toFixed(0)}% similarity).`;
    }

    return {
      currentContext: {
        wellId,
        targetDepth,
        formation: formationName || 'Auto-correlated',
        observedIndicators: observedIndicators.length > 0 ? observedIndicators : undefined,
      },
      detectedCount,
      precedents: detectedPrecedents,
      summary,
    };
  }
}
