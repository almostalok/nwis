import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@nwis/database';
import { CryptoUtils } from '@nwis/utils';
import { EventSeverity, EventType, QualityStatus } from '@nwis/types';

export interface UnprocessedEventEvidence {
  wellId: string;
  eventType: EventType;
  severity: EventSeverity;
  depth?: number;
  description: string;
  rootCause?: string;
  mitigation?: string;
  outcome?: string;
  precedingIndicators?: string[];
  documentId: string;
  pageNumber: number;
  textExcerpt: string;
  confidence: number;
}

@Injectable()
export class EventDeduplicationService {
  private readonly logger = new Logger(EventDeduplicationService.name);

  /**
   * Generates a deterministic deduplication key for an operational event.
   * Clusters events occurring in the same well, with same event type, within a 15m depth window.
   */
  generateDedupKey(wellId: string, eventType: EventType, depth = 0): string {
    const depthBucket = Math.round(depth / 15) * 15;
    const raw = `${wellId}_${eventType}_${depthBucket}`;
    return CryptoUtils.sha256(raw).slice(0, 32);
  }

  /**
   * Deduplicates an incoming extracted event. If a matching event exists, links evidence;
   * otherwise creates the event and links evidence.
   */
  async recordOrAttachEvidence(item: UnprocessedEventEvidence): Promise<{ eventId: string; isNew: boolean }> {
    const depth = item.depth || 0;
    const dedupKey = this.generateDedupKey(item.wellId, item.eventType, depth);

    // 1. Check for existing event matching dedupKey or exact wellId + eventType + close depth
    let existingEvent = await prisma.operationalEvent.findFirst({
      where: {
        OR: [
          { dedupKey },
          {
            wellId: item.wellId,
            eventType: item.eventType,
            startDepth: {
              gte: depth - 25,
              lte: depth + 25,
            },
          },
        ],
      },
    });

    if (existingEvent) {
      this.logger.log(
        `Deduplicated event [${item.eventType}] for well [${item.wellId}] at depth [${depth}m]. Attaching evidence to event: ${existingEvent.id}`,
      );

      // Check if evidence from this document and page already attached
      const existingEvidence = await prisma.historicalEventEvidence.findFirst({
        where: {
          eventId: existingEvent.id,
          documentId: item.documentId,
          pageNumber: item.pageNumber,
        },
      });

      if (!existingEvidence) {
        await prisma.historicalEventEvidence.create({
          data: {
            eventId: existingEvent.id,
            documentId: item.documentId,
            pageNumber: item.pageNumber,
            textExcerpt: item.textExcerpt,
            confidence: item.confidence,
          },
        });
      }

      // Update indicators/mitigation if existing event was missing them
      if (!existingEvent.mitigation && item.mitigation) {
        await prisma.operationalEvent.update({
          where: { id: existingEvent.id },
          data: {
            mitigation: item.mitigation,
            outcome: item.outcome || existingEvent.outcome,
            rootCause: item.rootCause || existingEvent.rootCause,
          },
        });
      }

      return { eventId: existingEvent.id, isNew: false };
    }

    // 2. Find associated formation interval for well at this depth
    let formationId: string | null = null;
    if (depth > 0) {
      const matchedFormation = await prisma.formationInterval.findFirst({
        where: {
          wellId: item.wellId,
          topDepth: { lte: depth },
          bottomDepth: { gte: depth },
        },
      });
      if (matchedFormation) {
        formationId = matchedFormation.id;
      }
    }

    // 3. Create new canonical operational event
    const newEvent = await prisma.operationalEvent.create({
      data: {
        wellId: item.wellId,
        eventType: item.eventType,
        severity: item.severity,
        startDepth: depth,
        endDepth: depth > 0 ? depth + 10 : null,
        formationId,
        description: item.description,
        rootCause: item.rootCause,
        mitigation: item.mitigation,
        outcome: item.outcome,
        precedingIndicators: item.precedingIndicators || [],
        confidence: item.confidence,
        dedupKey,
        sourceDocumentId: item.documentId,
        sourcePage: item.pageNumber,
        extractionMethod: 'NLP_PIPELINE',
        extractionConfidence: item.confidence,
        qualityStatus: QualityStatus.VERIFIED,
        qualityScore: 0.98,
      },
    });

    // 4. Attach initial evidence record
    await prisma.historicalEventEvidence.create({
      data: {
        eventId: newEvent.id,
        documentId: item.documentId,
        pageNumber: item.pageNumber,
        textExcerpt: item.textExcerpt,
        confidence: item.confidence,
      },
    });

    this.logger.log(`Created new canonical event [${newEvent.id}] for well [${item.wellId}] with evidence link`);
    return { eventId: newEvent.id, isNew: true };
  }
}
