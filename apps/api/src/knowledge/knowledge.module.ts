import { Module } from '@nestjs/common';
import { DefaultOCRProvider, OCRProvider } from './ocr.provider';
import { DocumentExtractorService } from './pdf-extractor.service';
import { DocumentChunkerService } from './chunker.service';
import { EventDeduplicationService } from './event-deduplication.service';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';

import { DocumentQueueService } from './document-queue.service';

@Module({
  controllers: [KnowledgeController],
  providers: [
    {
      provide: OCRProvider,
      useClass: DefaultOCRProvider,
    },
    DocumentExtractorService,
    DocumentChunkerService,
    EventDeduplicationService,
    KnowledgeService,
    DocumentQueueService,
  ],
  exports: [
    KnowledgeService,
    DocumentQueueService,
    OCRProvider,
    DocumentExtractorService,
    DocumentChunkerService,
  ],
})
export class KnowledgeModule {}
