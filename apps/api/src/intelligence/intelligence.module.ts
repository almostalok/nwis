import { Module } from '@nestjs/common';
import { WellSimilarityService } from './well-similarity.service';
import { PrecedentEngineService } from './precedent-engine.service';
import { HybridSearchService } from './hybrid-search.service';
import { RAGService } from './rag.service';
import { IntelligenceService } from './intelligence.service';
import { IntelligenceController } from './intelligence.controller';

import { ConfigurableExternalLLMProvider, LLMProvider } from './llm.provider';
import { ConfigurableExternalEmbeddingProvider, EmbeddingProvider } from './embedding.provider';

@Module({
  controllers: [IntelligenceController],
  providers: [
    {
      provide: LLMProvider,
      useClass: ConfigurableExternalLLMProvider,
    },
    {
      provide: EmbeddingProvider,
      useClass: ConfigurableExternalEmbeddingProvider,
    },
    WellSimilarityService,
    PrecedentEngineService,
    HybridSearchService,
    RAGService,
    IntelligenceService,
  ],
  exports: [
    LLMProvider,
    EmbeddingProvider,
    WellSimilarityService,
    PrecedentEngineService,
    HybridSearchService,
    RAGService,
    IntelligenceService,
  ],
})
export class IntelligenceModule {}
