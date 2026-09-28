import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { DataSourceType, UserRole } from '@nwis/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { IsNotEmpty, IsString } from 'class-validator';

class ImportDataDto {
  @IsString()
  @IsNotEmpty()
  sourceName!: string;

  @IsNotEmpty()
  sourceType!: DataSourceType;

  @IsString()
  @IsNotEmpty()
  entityType!: string;

  @IsNotEmpty()
  payload!: any;
}

@ApiTags('Data Ingestion Pipeline')
@Controller('api/v1/ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DATA_ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Import dataset through canonical pipeline (Adapter -> Parser -> Validator -> Normalizer -> Mapper -> Database)',
  })
  async importData(@Body() body: ImportDataDto) {
    return this.ingestionService.importData(body);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get history of ingestion jobs and audit logs' })
  async getJobs() {
    return this.ingestionService.getJobs();
  }
}
