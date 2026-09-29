import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { prisma } from '@nwis/database';
import { DocumentProcessingStatus, DocumentType } from '@nwis/types';
import { DomainNLPUtils } from '@nwis/utils';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentChunkerService } from './chunker.service';
import { EventDeduplicationService } from './event-deduplication.service';
import { DocumentExtractorService } from './pdf-extractor.service';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private readonly extractor: DocumentExtractorService,
    private readonly chunker: DocumentChunkerService,
    private readonly eventDeduplicator: EventDeduplicationService,
  ) {}

  /**
   * Process a document through the full Stage 02 Knowledge Pipeline:
   * Document -> TEXT_EXTRACTION -> OCR_PROCESSING -> CHUNKING -> ENTITY_EXTRACTION -> EVENT_EXTRACTION -> EMBEDDING -> COMPLETED
   */
  async processDocument(documentId: string): Promise<any> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { well: true },
    });

    if (!document) {
      throw new NotFoundException(`Document [${documentId}] not found`);
    }

    this.logger.log(`Starting knowledge processing pipeline for document: ${document.title} (${document.fileName})`);

    try {
      // 1. TEXT_EXTRACTION & OCR_PROCESSING
      await prisma.document.update({
        where: { id: documentId },
        data: { processingStatus: DocumentProcessingStatus.TEXT_EXTRACTION },
      });

      const pages = await this.extractor.extractPages(document.storagePath);
      const avgConfidence = pages.reduce((acc, p) => acc + p.confidence, 0) / (pages.length || 1);

      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingStatus: DocumentProcessingStatus.CHUNKING,
          pageCount: pages.length,
          ocrConfidence: Number(avgConfidence.toFixed(2)),
        },
      });

      // 2. CHUNKING & EMBEDDINGS
      const chunks = this.chunker.chunkPages(pages);

      // Clean existing chunks for this document if re-processing
      await prisma.documentChunk.deleteMany({
        where: { documentId },
      });

      // Create chunks in database
      for (const chunk of chunks) {
        await prisma.documentChunk.create({
          data: {
            documentId,
            pageNumber: chunk.pageNumber,
            chunkIndex: chunk.chunkIndex,
            text: chunk.text,
            section: chunk.section,
            startOffset: chunk.startOffset,
            endOffset: chunk.endOffset,
            tokenCount: chunk.tokenCount,
            embedding: chunk.embedding,
          },
        });
      }

      // 3. ENTITY_EXTRACTION
      await prisma.document.update({
        where: { id: documentId },
        data: { processingStatus: DocumentProcessingStatus.ENTITY_EXTRACTION },
      });

      await prisma.extractedEntity.deleteMany({
        where: { documentId },
      });

      let extractedEventsCount = 0;
      let associatedWellId = document.wellId;

      for (const chunk of chunks) {
        const entities = DomainNLPUtils.extractAll(chunk.text);

        // If document was not yet linked to a well, resolve well from extracted well references
        if (!associatedWellId && entities.wells.length > 0) {
          const matchedWell = await prisma.well.findUnique({
            where: { wellId: entities.wells[0] },
          });
          if (matchedWell) {
            associatedWellId = matchedWell.id;
            await prisma.document.update({
              where: { id: documentId },
              data: { wellId: matchedWell.id },
            });
          }
        }

        // Store extracted entities
        for (const w of entities.wells) {
          await prisma.extractedEntity.create({
            data: {
              documentId,
              entityType: 'WELL',
              value: w,
              confidence: 0.98,
              pageNumber: chunk.pageNumber,
            },
          });
        }

        for (const d of entities.depths) {
          await prisma.extractedEntity.create({
            data: {
              documentId,
              entityType: 'DEPTH',
              value: `${d.value} m`,
              normalizedValue: String(d.value),
              confidence: d.confidence,
              pageNumber: chunk.pageNumber,
            },
          });
        }

        for (const f of entities.formations) {
          await prisma.extractedEntity.create({
            data: {
              documentId,
              entityType: 'FORMATION',
              value: f.name,
              confidence: f.confidence,
              pageNumber: chunk.pageNumber,
            },
          });
        }

        for (const m of entities.mitigations) {
          await prisma.extractedEntity.create({
            data: {
              documentId,
              entityType: 'ACTION',
              value: m.action,
              confidence: m.confidence,
              pageNumber: chunk.pageNumber,
            },
          });
        }

        // 4. EVENT_EXTRACTION & DEDUPLICATION WITH EVIDENCE
        if (associatedWellId && entities.events.length > 0) {
          for (const ev of entities.events) {
            await this.eventDeduplicator.recordOrAttachEvidence({
              wellId: associatedWellId,
              eventType: ev.eventType,
              severity: ev.severity,
              depth: ev.depth || (entities.depths.length > 0 ? entities.depths[0].value : 0),
              description: ev.rawText,
              mitigation: entities.mitigations.length > 0 ? entities.mitigations[0].action : undefined,
              precedingIndicators: ev.precedingIndicators,
              documentId,
              pageNumber: chunk.pageNumber,
              textExcerpt: chunk.text,
              confidence: ev.confidence,
            });
            extractedEventsCount++;
          }
        }
      }

      // 5. EMBEDDING & COMPLETED
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingStatus: DocumentProcessingStatus.COMPLETED,
          extractionStatus: 'COMPLETED',
        },
      });

      this.logger.log(
        `Document [${document.title}] processed successfully. Chunks: ${chunks.length}, Events linked: ${extractedEventsCount}`,
      );

      return {
        success: true,
        documentId,
        chunksCreated: chunks.length,
        eventsExtracted: extractedEventsCount,
        status: DocumentProcessingStatus.COMPLETED,
      };
    } catch (err: any) {
      this.logger.error(`Failed processing document [${documentId}]: ${err.message}`, err.stack);
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingStatus: DocumentProcessingStatus.FAILED,
          extractionStatus: `ERROR: ${err.message}`,
        },
      });
      throw err;
    }
  }

  /**
   * Discovers and syncs all files in data/samples/ into database documents, then processes them.
   */
  async syncAndProcessAllSampleDocuments(): Promise<{ totalDocuments: number; processed: number; errors: any[] }> {
    this.logger.log('Starting full sync and indexing of all sample drilling documents in data/samples/');

    const samplesDir = path.resolve(process.cwd(), 'data/samples');
    if (!fs.existsSync(samplesDir)) {
      this.logger.warn(`Samples directory not found at: ${samplesDir}`);
      return { totalDocuments: 0, processed: 0, errors: [] };
    }

    const files = fs.readdirSync(samplesDir);
    const errors: any[] = [];
    let processed = 0;

    for (const file of files) {
      try {
        const filePath = path.join(samplesDir, file);
        const stat = fs.statSync(filePath);
        if (!stat.isFile()) continue;

        // Parse well identifier from file name (e.g. synthetic-well-003-ddr.txt -> OIL-SYN-003)
        let matchedWellId: string | null = null;
        const wellMatch = file.match(/well-(\d{3})/i);
        if (wellMatch) {
          const well = await prisma.well.findUnique({
            where: { wellId: `OIL-SYN-${wellMatch[1]}` },
          });
          if (well) matchedWellId = well.id;
        }

        // Determine DocumentType
        let docType = DocumentType.OTHER;
        if (file.includes('ddr')) docType = DocumentType.DDR;
        else if (file.includes('wcr')) docType = DocumentType.WCR;
        else if (file.includes('mud')) docType = DocumentType.MUD_REPORT;
        else if (file.includes('geo')) docType = DocumentType.GEOLOGICAL_REPORT;

        // Upsert Document record
        const title = `OIL Synthetic Report — ${file.replace(/[-_]/g, ' ').toUpperCase()}`;
        let doc = await prisma.document.findFirst({
          where: { fileName: file },
        });

        if (!doc) {
          doc = await prisma.document.create({
            data: {
              wellId: matchedWellId,
              documentType: docType,
              title,
              fileName: file,
              mimeType: 'text/plain',
              storagePath: `data/samples/${file}`,
              processingStatus: DocumentProcessingStatus.UPLOADED,
              extractionStatus: 'PENDING',
              sourceSystem: 'NWIS-SYNTHETIC-ARCHIVE',
            },
          });
        } else if (matchedWellId && !doc.wellId) {
          doc = await prisma.document.update({
            where: { id: doc.id },
            data: { wellId: matchedWellId },
          });
        }

        // Run knowledge extraction pipeline
        await this.processDocument(doc.id);
        processed++;
      } catch (err: any) {
        this.logger.error(`Error processing sample file ${file}: ${err.message}`);
        errors.push({ file, error: err.message });
      }
    }

    return {
      totalDocuments: files.length,
      processed,
      errors,
    };
  }

  /**
   * Retrieves list of indexed documents with status and metadata.
   */
  async listDocuments(wellId?: string) {
    return prisma.document.findMany({
      where: wellId ? { wellId } : undefined,
      include: {
        well: {
          select: { wellId: true, name: true, field: true },
        },
        _count: {
          select: { chunks: true, evidence: true, extractedEntities: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retrieves a document with its chunks, entities, and linked evidence.
   */
  async getDocumentDetails(documentId: string) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        well: true,
        chunks: {
          orderBy: { chunkIndex: 'asc' },
        },
        extractedEntities: true,
        evidence: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!doc) {
      throw new NotFoundException(`Document [${documentId}] not found`);
    }

    return doc;
  }

  /**
   * Human-in-the-loop verification of an extracted technical entity
   */
  async verifyEntity(entityId: string, update: { value?: string; confidence?: number; verifiedBy?: string; notes?: string }) {
    const existing = await prisma.extractedEntity.findUnique({
      where: { id: entityId },
    });

    if (!existing) {
      throw new NotFoundException(`Extracted entity [${entityId}] not found`);
    }

    const currentMetadata = (existing.metadata as Record<string, any>) || {};

    const updated = await prisma.extractedEntity.update({
      where: { id: entityId },
      data: {
        value: update.value !== undefined ? update.value : existing.value,
        confidence: update.confidence !== undefined ? update.confidence : 1.0,
        metadata: {
          ...currentMetadata,
          humanVerified: true,
          verifiedAt: new Date().toISOString(),
          verifiedBy: update.verifiedBy || 'Drilling Engineer',
          notes: update.notes || 'Manually verified against original technical document',
        },
      },
    });

    this.logger.log(`Entity [${entityId}] verified by ${update.verifiedBy || 'Drilling Engineer'}`);
    return updated;
  }
}
