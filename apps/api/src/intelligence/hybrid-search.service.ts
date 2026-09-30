import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@nwis/database';
import { HybridSearchQueryDto, HybridSearchResult, SearchResultItem } from '@nwis/types';
import { SpatialUtils, VectorUtils } from '@nwis/utils';

@Injectable()
export class HybridSearchService {
  private readonly logger = new Logger(HybridSearchService.name);

  /**
   * Executes multi-modal hybrid search (Vector Similarity + Text Keyword + Metadata Filtering).
   */
  async search(queryDto: HybridSearchQueryDto): Promise<HybridSearchResult> {
    const { query, wellId, radiusKm, formation, depth, eventType, limit = 20 } = queryDto;
    this.logger.log(`Executing hybrid search for: "${query}" with filters`);

    // 1. Generate query embedding vector
    const queryEmbedding = VectorUtils.generateLocalEmbedding(query, 64);
    const queryLower = query.toLowerCase();
    const queryKeywords = queryLower.split(/\W+/).filter((w) => w.length > 2);

    // 2. Fetch candidate chunks
    const chunks = await prisma.documentChunk.findMany({
      include: {
        document: {
          include: {
            well: true,
          },
        },
      },
      take: 200,
    });

    // 3. Fetch candidate events
    const events = await prisma.operationalEvent.findMany({
      where: {
        eventType: eventType || undefined,
        startDepth: depth ? { gte: depth - 100, lte: depth + 100 } : undefined,
      },
      include: {
        well: true,
        formation: true,
        document: true,
      },
      take: 100,
    });

    // 3.5. Pre-fetch target well once outside loop to eliminate N+1 query
    let targetWell: any = null;
    if (wellId && radiusKm) {
      targetWell = await prisma.well.findFirst({
        where: { OR: [{ id: wellId }, { wellId: wellId }] },
      });
    }

    const searchResults: SearchResultItem[] = [];

    // Score and rank chunks
    for (const chunk of chunks) {
      // Filter by wellId if specified
      if (wellId && chunk.document.well?.wellId !== wellId && chunk.document.wellId !== wellId) {
        continue;
      }

      // Filter by radius if wellId and radius specified
      if (wellId && radiusKm && chunk.document.well && targetWell) {
        const dist = SpatialUtils.haversineDistanceKm(
          targetWell.latitude,
          targetWell.longitude,
          chunk.document.well.latitude,
          chunk.document.well.longitude,
        );
        if (dist > radiusKm) continue;
      }

      // 1. Vector similarity
      const chunkVec = (chunk.embedding as number[]) || [];
      const vectorSim = VectorUtils.cosineSimilarity(queryEmbedding, chunkVec);

      // 2. Keyword exact matches
      const chunkTextLower = chunk.text.toLowerCase();
      let kwMatches = 0;
      for (const kw of queryKeywords) {
        if (chunkTextLower.includes(kw)) kwMatches++;
      }
      const kwScore = queryKeywords.length > 0 ? kwMatches / queryKeywords.length : 0;

      // 3. Metadata filters
      let metadataScore = 0.5;
      if (formation && chunkTextLower.includes(formation.toLowerCase())) {
        metadataScore += 0.3;
      }
      if (depth && Math.abs(depth) > 0) {
        const depthRegex = new RegExp(`\\b${Math.round(depth / 50) * 50}\\b|\\b${depth}\\b`);
        if (depthRegex.test(chunkTextLower)) metadataScore += 0.2;
      }

      // Hybrid combined score
      const hybridScore = Number((0.5 * vectorSim + 0.3 * kwScore + 0.2 * metadataScore).toFixed(3));

      if (hybridScore > 0.35 || kwMatches > 0) {
        // Create highlight snippet around matching text
        let snippet = chunk.text.slice(0, 220) + '...';
        if (queryKeywords.length > 0) {
          const firstKw = queryKeywords.find((kw) => chunkTextLower.includes(kw));
          if (firstKw) {
            const idx = chunkTextLower.indexOf(firstKw);
            const start = Math.max(0, idx - 60);
            const end = Math.min(chunk.text.length, idx + 160);
            snippet = (start > 0 ? '...' : '') + chunk.text.slice(start, end) + (end < chunk.text.length ? '...' : '');
          }
        }

        searchResults.push({
          id: chunk.id,
          entityType: 'CHUNK',
          relevanceScore: hybridScore,
          wellId: chunk.document.well?.wellId || null,
          wellName: chunk.document.well?.name || null,
          title: `${chunk.document.title} (Page ${chunk.pageNumber})`,
          snippet,
          sourceDocument: chunk.document.fileName,
          pageNumber: chunk.pageNumber,
          highlights: queryKeywords.filter((kw) => chunkTextLower.includes(kw)),
        });
      }
    }

    // Score and rank operational events
    for (const ev of events) {
      const evText = `${ev.eventType} ${ev.description} ${ev.mitigation || ''} ${ev.rootCause || ''}`.toLowerCase();

      let kwMatches = 0;
      for (const kw of queryKeywords) {
        if (evText.includes(kw)) kwMatches++;
      }
      const kwScore = queryKeywords.length > 0 ? kwMatches / queryKeywords.length : 0;

      let score = 0.6 + 0.4 * kwScore;
      if (formation && ev.formation?.formationName.toLowerCase().includes(formation.toLowerCase())) {
        score += 0.2;
      }

      const relevanceScore = Math.min(0.99, Number(score.toFixed(3)));

      if (kwMatches > 0 || (formation && ev.formation?.formationName.toLowerCase().includes(formation.toLowerCase()))) {
        searchResults.push({
          id: ev.id,
          entityType: 'EVENT',
          relevanceScore,
          wellId: ev.well.wellId,
          wellName: ev.well.name,
          formation: ev.formation?.formationName || undefined,
          depth: ev.startDepth,
          title: `Operational Event: ${ev.eventType} at ${ev.startDepth}m`,
          snippet: `${ev.description}. Mitigation: ${ev.mitigation || 'N/A'}. Outcome: ${ev.outcome || 'N/A'}.`,
          sourceDocument: ev.document?.fileName || 'Drilling Incident Report',
          pageNumber: ev.sourcePage || 1,
          highlights: queryKeywords.filter((kw) => evText.includes(kw)),
        });
      }
    }

    // Sort by relevance score descending
    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      query,
      totalFound: searchResults.length,
      results: searchResults.slice(0, limit),
      appliedFilters: {
        wellId,
        radiusKm,
        formation,
        depth,
        eventType,
      },
    };
  }
}
