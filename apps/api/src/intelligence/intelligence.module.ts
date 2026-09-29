import { Module } from '@nestjs/common';
import { WellSimilarityService } from './well-similarity.service';
import { PrecedentEngineService } from './precedent-engine.service';
import { HybridSearchService } from './hybrid-search.service';
import { RAGService } from './rag.service';
import { IntelligenceService } from './intelligence.service';
import { IntelligenceController } from './intelligence.controller';

@Module({
  controllers: [IntelligenceController],
  providers: [
    WellSimilarityService,
    PrecedentEngineService,
    HybridSearchService,
    RAGService,
    IntelligenceService,
  ],
  exports: [
    WellSimilarityService,
    PrecedentEngineService,
    HybridSearchService,
    RAGService,
    IntelligenceService,
  ],
})
export class IntelligenceModule {}
