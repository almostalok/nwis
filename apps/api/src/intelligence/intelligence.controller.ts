import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  HybridSearchQueryDto,
  PrecedentQueryDto,
  RAGQueryDto,
} from '@nwis/types';
import { HybridSearchService } from './hybrid-search.service';
import { IntelligenceService } from './intelligence.service';
import { PrecedentEngineService } from './precedent-engine.service';
import { RAGService } from './rag.service';
import { WellSimilarityService } from './well-similarity.service';

@ApiTags('Drilling Intelligence & Precedent Engine')
@Controller('api/v1/intelligence')
export class IntelligenceController {
  constructor(
    private readonly intelligenceService: IntelligenceService,
    private readonly similarityService: WellSimilarityService,
    private readonly precedentEngine: PrecedentEngineService,
    private readonly hybridSearch: HybridSearchService,
    private readonly ragService: RAGService,
  ) {}

  @Post('search')
  @ApiOperation({
    summary: 'Hybrid search across document chunks and operational events (Vector + Keyword + Metadata)',
  })
  async search(@Body() queryDto: HybridSearchQueryDto) {
    return this.hybridSearch.search(queryDto);
  }

  @Post('precedents')
  @ApiOperation({
    summary: 'Precedent Engine: Detect comparable historical situations in offset wells for current depth and formation',
  })
  async detectPrecedents(@Body() queryDto: PrecedentQueryDto) {
    return this.precedentEngine.detectPrecedents(queryDto);
  }

  @Post('ask')
  @ApiOperation({
    summary: 'Grounded RAG Assistant: Ask questions about offset wells, formations, and historical drilling events',
  })
  async askQuestion(@Body() queryDto: RAGQueryDto) {
    return this.ragService.askQuestion(queryDto);
  }

  @Get('wells/:id/summary')
  @ApiOperation({ summary: 'Structured intelligence summary for a well (formations, major events, risk intervals)' })
  async getWellSummary(@Param('id') id: string) {
    return this.intelligenceService.getWellSummary(id);
  }

  @Get('wells/:id/nearby')
  @ApiOperation({ summary: 'Nearby offset wells intelligence with multi-factor similarity and historical risk events' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getNearbyIntelligence(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.intelligenceService.getNearbyIntelligence(id, limit ? Number(limit) : 5);
  }

  @Get('wells/:id/timeline')
  @ApiOperation({ summary: 'Unified depth-ordered operational timeline (casings, formations, historical events)' })
  async getWellTimeline(@Param('id') id: string) {
    return this.intelligenceService.getWellTimeline(id);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Side-by-side cross-well multi-dimensional comparison' })
  @ApiQuery({ name: 'wellA', required: true })
  @ApiQuery({ name: 'wellB', required: true })
  async compareWells(@Query('wellA') wellA: string, @Query('wellB') wellB: string) {
    return this.similarityService.compareWells(wellA, wellB);
  }
}
