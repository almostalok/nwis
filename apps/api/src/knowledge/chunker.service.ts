import { Injectable, Logger } from '@nestjs/common';
import { VectorUtils } from '@nwis/utils';
import { ExtractedPage } from './pdf-extractor.service';

export interface ChunkPayload {
  pageNumber: number;
  chunkIndex: number;
  text: string;
  section: string;
  startOffset: number;
  endOffset: number;
  tokenCount: number;
  embedding: number[];
}

@Injectable()
export class DocumentChunkerService {
  private readonly logger = new Logger(DocumentChunkerService.name);

  /**
   * Performs semantic, boundary-aware chunking over document pages.
   */
  chunkPages(pages: ExtractedPage[]): ChunkPayload[] {
    const chunks: ChunkPayload[] = [];
    let globalChunkIdx = 0;

    for (const page of pages) {
      const pageText = page.text;
      let pageOffset = 0;

      // Split page by semantic sections (headers ending in colon, double newlines)
      const sectionSplits = pageText.split(/(?:\n\s*\n|(?<=[A-Z\s]{3,}:)\n)/);

      for (const sectionText of sectionSplits) {
        const trimmed = sectionText.trim();
        if (trimmed.length < 20) {
          pageOffset += sectionText.length;
          continue;
        }

        // Determine section name from leading text
        let sectionName = 'GENERAL';
        const headerMatch = trimmed.match(/^([A-Z\s/_-]{3,30}):/);
        if (headerMatch) {
          sectionName = headerMatch[1].trim();
        } else if (trimmed.toLowerCase().includes('formation') || trimmed.toLowerCase().includes('lithology')) {
          sectionName = 'GEOLOGY';
        } else if (trimmed.toLowerCase().includes('drill') || trimmed.toLowerCase().includes('rop') || trimmed.toLowerCase().includes('torque')) {
          sectionName = 'OPERATIONS';
        } else if (trimmed.toLowerCase().includes('mud') || trimmed.toLowerCase().includes('viscosity')) {
          sectionName = 'FLUIDS';
        } else if (trimmed.toLowerCase().includes('incident') || trimmed.toLowerCase().includes('stuck') || trimmed.toLowerCase().includes('loss')) {
          sectionName = 'INCIDENTS';
        }

        const startOffset = pageOffset;
        const endOffset = pageOffset + sectionText.length;
        pageOffset = endOffset;

        // Estimate token count (~4 characters per token)
        const tokenCount = Math.ceil(trimmed.length / 4);

        // Generate semantic embedding vector
        const embedding = VectorUtils.generateLocalEmbedding(trimmed, 64);

        chunks.push({
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIdx++,
          text: trimmed,
          section: sectionName,
          startOffset,
          endOffset,
          tokenCount,
          embedding,
        });
      }
    }

    this.logger.log(`Created ${chunks.length} semantic chunks across ${pages.length} pages`);
    return chunks;
  }
}
