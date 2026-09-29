import { PrismaClient } from '@prisma/client';
import { DomainNLPUtils, VectorUtils, CryptoUtils } from '@nwis/utils';
import { DocumentProcessingStatus, DocumentType, EventSeverity, EventType, QualityStatus } from '@nwis/types';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting NWIS Stage 02 Document Knowledge & Precedent Seeding ---');

  // 1. Update existing operational events with precursor indicators & dedupKey
  const events = await prisma.operationalEvent.findMany({
    include: { well: true, formation: true },
  });

  console.log(`Updating ${events.length} existing operational events with precursor indicators...`);
  for (const ev of events) {
    let indicators: string[] = [];
    if (ev.eventType === EventType.STUCK_PIPE) {
      indicators = ['TORQUE_SPIKE', 'ROP_DECREASE', 'DRAG_INCREASE'];
    } else if (ev.eventType === EventType.TORQUE_SPIKE) {
      indicators = ['TORQUE_SPIKE', 'ROP_DECREASE'];
    } else if (ev.eventType === EventType.LOST_CIRCULATION) {
      indicators = ['PIT_VOLUME_DROP', 'FLOW_IMBALANCE'];
    } else if (ev.eventType === EventType.KICK) {
      indicators = ['PIT_GAIN', 'FLOW_CHECK_POSITIVE'];
    }

    const dedupKey = CryptoUtils.sha256(`${ev.wellId}_${ev.eventType}_${Math.round(ev.startDepth / 15) * 15}`).slice(0, 32);

    await prisma.operationalEvent.update({
      where: { id: ev.id },
      data: {
        precedingIndicators: indicators,
        dedupKey,
        problemDescription: ev.description,
        mitigationAction: ev.mitigation,
      },
    });
  }

  // 2. Index all sample documents from data/samples/
  let samplesDir = path.resolve(process.cwd(), 'data/samples');
  if (!fs.existsSync(samplesDir)) {
    samplesDir = path.resolve(__dirname, '../../../data/samples');
  }
  if (!fs.existsSync(samplesDir)) {
    samplesDir = path.resolve(__dirname, '../../data/samples');
  }
  if (!fs.existsSync(samplesDir)) {
    console.error(`Samples directory not found: ${samplesDir}`);
    return;
  }

  const files = fs.readdirSync(samplesDir);
  console.log(`Found ${files.length} sample drilling reports in ${samplesDir}`);

  for (const file of files) {
    const filePath = path.join(samplesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Parse well ID
    let well = null;
    const wellMatch = file.match(/well-(\d{3})/i);
    if (wellMatch) {
      well = await prisma.well.findUnique({
        where: { wellId: `OIL-SYN-${wellMatch[1]}` },
      });
    }

    // Determine type
    let docType = DocumentType.OTHER;
    if (file.includes('ddr')) docType = DocumentType.DDR;
    else if (file.includes('wcr')) docType = DocumentType.WCR;
    else if (file.includes('mud')) docType = DocumentType.MUD_REPORT;

    // Upsert Document
    const title = `OIL Operations Report — ${file.toUpperCase()}`;
    const doc = await prisma.document.upsert({
      where: { id: CryptoUtils.sha256(file).slice(0, 32) },
      update: {
        wellId: well?.id,
        processingStatus: DocumentProcessingStatus.COMPLETED,
        extractionStatus: 'COMPLETED',
        ocrConfidence: 0.98,
      },
      create: {
        id: CryptoUtils.sha256(file).slice(0, 32),
        wellId: well?.id,
        documentType: docType,
        title,
        fileName: file,
        mimeType: 'text/plain',
        storagePath: `data/samples/${file}`,
        pageCount: 1,
        processingStatus: DocumentProcessingStatus.COMPLETED,
        extractionStatus: 'COMPLETED',
        ocrConfidence: 0.98,
        sourceSystem: 'NWIS-SYNTHETIC-ARCHIVE',
      },
    });

    console.log(`Processing Document [${doc.id}]: ${file} (Well: ${well?.wellId || 'N/A'})...`);

    // Clean existing chunks and entities
    await prisma.documentChunk.deleteMany({ where: { documentId: doc.id } });
    await prisma.extractedEntity.deleteMany({ where: { documentId: doc.id } });
    await prisma.historicalEventEvidence.deleteMany({ where: { documentId: doc.id } });

    // Segment into semantic chunks
    const rawSections = content.split(/(?:\n\s*\n|(?<=[A-Z\s]{3,}:)\n)/);
    let chunkIdx = 0;
    let offset = 0;

    for (const sec of rawSections) {
      const trimmed = sec.trim();
      if (trimmed.length < 25) {
        offset += sec.length;
        continue;
      }

      let sectionName = 'GENERAL';
      const headerMatch = trimmed.match(/^([A-Z\s/_-]{3,30}):/);
      if (headerMatch) sectionName = headerMatch[1].trim();
      else if (trimmed.toLowerCase().includes('formation') || trimmed.toLowerCase().includes('lithology')) sectionName = 'GEOLOGY';
      else if (trimmed.toLowerCase().includes('drill') || trimmed.toLowerCase().includes('torque') || trimmed.toLowerCase().includes('rop')) sectionName = 'OPERATIONS';
      else if (trimmed.toLowerCase().includes('mud')) sectionName = 'FLUIDS';
      else if (trimmed.toLowerCase().includes('incident') || trimmed.toLowerCase().includes('stuck') || trimmed.toLowerCase().includes('loss')) sectionName = 'INCIDENTS';

      const embedding = VectorUtils.generateLocalEmbedding(trimmed, 64);
      const tokenCount = Math.ceil(trimmed.length / 4);

      await prisma.documentChunk.create({
        data: {
          documentId: doc.id,
          pageNumber: 1,
          chunkIndex: chunkIdx++,
          text: trimmed,
          section: sectionName,
          startOffset: offset,
          endOffset: offset + sec.length,
          tokenCount,
          embedding,
        },
      });

      offset += sec.length;

      // Extract entities
      const entities = DomainNLPUtils.extractAll(trimmed);

      for (const w of entities.wells) {
        await prisma.extractedEntity.create({
          data: {
            documentId: doc.id,
            entityType: 'WELL',
            value: w,
            confidence: 0.99,
            pageNumber: 1,
          },
        });
      }

      for (const d of entities.depths) {
        await prisma.extractedEntity.create({
          data: {
            documentId: doc.id,
            entityType: 'DEPTH',
            value: `${d.value} m`,
            normalizedValue: String(d.value),
            confidence: d.confidence,
            pageNumber: 1,
          },
        });
      }

      for (const f of entities.formations) {
        await prisma.extractedEntity.create({
          data: {
            documentId: doc.id,
            entityType: 'FORMATION',
            value: f.name,
            confidence: f.confidence,
            pageNumber: 1,
          },
        });
      }

      for (const m of entities.mitigations) {
        await prisma.extractedEntity.create({
          data: {
            documentId: doc.id,
            entityType: 'ACTION',
            value: m.action,
            confidence: m.confidence,
            pageNumber: 1,
          },
        });
      }

      // Link evidence to existing operational events
      if (well && entities.events.length > 0) {
        for (const evItem of entities.events) {
          const depth = evItem.depth || (entities.depths.length > 0 ? entities.depths[0].value : 0);
          const matchedEvent = await prisma.operationalEvent.findFirst({
            where: {
              wellId: well.id,
              eventType: evItem.eventType,
            },
          });

          if (matchedEvent) {
            await prisma.historicalEventEvidence.create({
              data: {
                eventId: matchedEvent.id,
                documentId: doc.id,
                pageNumber: 1,
                textExcerpt: trimmed,
                confidence: evItem.confidence,
              },
            });
            console.log(`  ✓ Linked evidence from ${file} to Event [${matchedEvent.eventType}] at ${matchedEvent.startDepth}m in ${well.wellId}`);
          }
        }
      }
    }
  }

  const chunkTotal = await prisma.documentChunk.count();
  const entityTotal = await prisma.extractedEntity.count();
  const evidenceTotal = await prisma.historicalEventEvidence.count();

  console.log(`✓ Stage 02 Knowledge Seeding Complete:`);
  console.log(`  - Total Semantic Document Chunks: ${chunkTotal}`);
  console.log(`  - Total Extracted Domain Entities: ${entityTotal}`);
  console.log(`  - Total Historical Evidence Links: ${evidenceTotal}`);
}

main()
  .catch((e) => {
    console.error('Error in Stage 02 seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
