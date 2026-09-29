import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Executive Intelligence & Reports')
@Controller('api/v1/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('well/:wellId')
  @ApiOperation({ summary: 'Generate comprehensive Well Intelligence Dossier with offset hazards and precedent lessons' })
  generateWellReport(@Param('wellId') wellId: string) {
    return this.reportsService.generateWellIntelligenceReport(wellId);
  }

  @Get('alert/:alertId')
  @ApiOperation({ summary: 'Generate Alert Investigation & Post-Mortem Report' })
  generateAlertReport(@Param('alertId') alertId: string) {
    return this.reportsService.generateAlertInvestigationReport(alertId);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Generate Daily Drilling Operations and Precedent Intelligence Summary' })
  generateDailyReport() {
    return this.reportsService.generateDailyOperationalReport();
  }
}
