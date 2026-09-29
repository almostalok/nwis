import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { KnowledgeService } from './knowledge.service';

@ApiTags('Knowledge & Document Intelligence')
@Controller('api/v1/knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('documents')
  @ApiOperation({ summary: 'List all drilling reports, processing states, and entity counts' })
  @ApiQuery({ name: 'wellId', required: false })
  async listDocuments(@Query('wellId') wellId?: string) {
    return this.knowledgeService.listDocuments(wellId);
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get document details including semantic chunks and extracted entities' })
  async getDocumentDetails(@Param('id') id: string) {
    return this.knowledgeService.getDocumentDetails(id);
  }

  @Post('process-all')
  @ApiOperation({ summary: 'Index and execute full NLP/OCR pipeline across all historical sample documents' })
  async processAll() {
    return this.knowledgeService.syncAndProcessAllSampleDocuments();
  }

  @Post('process/:id')
  @ApiOperation({ summary: 'Process a single document through the Stage 02 knowledge pipeline' })
  async processDocument(@Param('id') id: string) {
    return this.knowledgeService.processDocument(id);
  }
}
