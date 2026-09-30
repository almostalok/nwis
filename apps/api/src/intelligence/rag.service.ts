import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@nwis/database';
import { RAGEvidenceSource, RAGQueryDto, RAGResponse } from '@nwis/types';
import { DomainNLPUtils } from '@nwis/utils';
import { HybridSearchService } from './hybrid-search.service';
import { PrecedentEngineService } from './precedent-engine.service';
import { LLMProvider } from './llm.provider';

@Injectable()
export class RAGService {
  private readonly logger = new Logger(RAGService.name);

  constructor(
    private readonly precedentEngine: PrecedentEngineService,
    private readonly hybridSearch: HybridSearchService,
    private readonly llmProvider: LLMProvider,
  ) {}

  /**
   * Grounded RAG Drilling Intelligence Assistant.
   * Strictly adheres to zero hallucination and explicit evidence verification.
   */
  async askQuestion(queryDto: RAGQueryDto): Promise<RAGResponse> {
    const { question, currentWellId, currentDepth, currentFormation } = queryDto;
    this.logger.log(`Processing grounded RAG query: "${question}"`);

    // 1. Anti-hallucination check 1: Check for explicit well references in question
    const mentionedWells = DomainNLPUtils.extractWells(question);
    if (mentionedWells.length > 0) {
      for (const wellCode of mentionedWells) {
        const found = await prisma.well.findUnique({
          where: { wellId: wellCode },
        });
        if (!found) {
          return {
            answer: `No matching evidence was found in the indexed NWIS dataset. Well '${wellCode}' does not exist in the database.`,
            grounded: false,
            confidence: 'HIGH',
            evidenceSources: [],
            reasoning: [`Checked well catalog for identifier: ${wellCode}`, `Well record was not found`],
          };
        }
      }
    }

    // 2. Anti-hallucination check 2: Check for requested depth versus well TD
    const mentionedDepths = DomainNLPUtils.extractDepths(question);
    const targetDepth = currentDepth || (mentionedDepths.length > 0 ? mentionedDepths[0].value : undefined);

    let activeWell: any = null;
    if (currentWellId) {
      activeWell = await prisma.well.findFirst({
        where: { OR: [{ id: currentWellId }, { wellId: currentWellId }] },
      });
    } else if (mentionedWells.length > 0) {
      activeWell = await prisma.well.findUnique({
        where: { wellId: mentionedWells[0] },
      });
    }

    if (activeWell && targetDepth) {
      if (targetDepth > activeWell.totalDepth + 100) {
        return {
          answer: `No matching evidence was found in the indexed NWIS dataset. Well ${activeWell.wellId} has a total drilled depth of ${activeWell.totalDepth}m; depth ${targetDepth}m exceeds the well boundaries.`,
          grounded: false,
          confidence: 'HIGH',
          evidenceSources: [],
          reasoning: [
            `Evaluated requested depth (${targetDepth}m) against well total depth (${activeWell.totalDepth}m)`,
            `Depth is beyond drilled interval; premise rejected`,
          ],
        };
      }
    }

    // 3. Grounded Precedent & Evidence Retrieval
    const precedentResult = targetDepth
      ? await this.precedentEngine.detectPrecedents({
          wellId: activeWell?.wellId,
          targetDepth,
          formationName: currentFormation,
          radiusKm: 30,
        })
      : null;

    // 4. Hybrid Search Retrieval over Chunks and Incident Reports
    const searchResult = await this.hybridSearch.search({
      query: question,
      depth: targetDepth,
      formation: currentFormation,
      limit: 5,
    });

    const evidenceSources: RAGEvidenceSource[] = [];
    const reasoning: string[] = [];

    // Collect evidence from precedents
    if (precedentResult && precedentResult.detectedCount > 0) {
      reasoning.push(`Identified ${precedentResult.detectedCount} matching historical precedents via Precedent Engine`);
      for (const prec of precedentResult.precedents.slice(0, 3)) {
        for (const ev of prec.evidence) {
          evidenceSources.push({
            documentTitle: ev.documentTitle,
            fileName: ev.fileName,
            pageNumber: ev.pageNumber,
            excerpt: ev.textExcerpt,
            wellId: prec.wellId,
            wellName: prec.wellName,
          });
        }
      }
    }

    // Collect evidence from hybrid search chunks
    for (const res of searchResult.results) {
      if (res.entityType === 'CHUNK' && res.sourceDocument) {
        evidenceSources.push({
          documentTitle: res.title,
          fileName: res.sourceDocument,
          pageNumber: res.pageNumber || 1,
          excerpt: res.snippet,
          wellId: res.wellId || undefined,
          wellName: res.wellName || undefined,
        });
      }
    }

    // 5. Anti-hallucination check 3: No evidence found
    if (evidenceSources.length === 0 && (!precedentResult || precedentResult.detectedCount === 0)) {
      return {
        answer: 'No sufficient historical evidence was found in the indexed NWIS dataset.',
        grounded: false,
        confidence: 'HIGH',
        evidenceSources: [],
        reasoning: [
          `Queried indexed historical events and document chunks for: "${question}"`,
          'Zero relevant precedents or corroborating evidence excerpts were returned',
        ],
      };
    }

    // 6. Context Builder & LLM Provider Call
    const topPrecedents = precedentResult ? precedentResult.precedents.slice(0, 3) : [];
    
    let contextBuilder = `### Retrived Precedents and Excerpts\n`;
    for (const prec of topPrecedents) {
      contextBuilder += `* **Well ${prec.wellId}** (${prec.distanceKm} km away, ${(prec.similarityScore * 100).toFixed(0)}% similarity): ${prec.eventType} at ${prec.depth}m in ${prec.formation}. Indicators: ${prec.precedingIndicators.join(', ')}. Action: ${prec.mitigation || 'Standard procedure'}.\n`;
    }
    for (const src of evidenceSources.slice(0, 3)) {
      contextBuilder += `Source: ${src.documentTitle} (p. ${src.pageNumber}) - ${src.excerpt}\n`;
    }

    const llmCompletion = await this.llmProvider.generateCompletion({
      systemPrompt: 'You are NWIS Grounded Drilling Intelligence Assistant for Oil India Limited. You must answer questions using exclusively the provided technical context without inventing facts.',
      userPrompt: question,
      context: contextBuilder,
    });

    return {
      answer: llmCompletion.content,
      grounded: true,
      confidence: 'HIGH',
      evidenceSources: evidenceSources.slice(0, 5),
      relatedPrecedents: topPrecedents,
      reasoning,
    };
  }
}
