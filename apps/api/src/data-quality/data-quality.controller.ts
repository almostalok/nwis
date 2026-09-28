import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataQualityService } from './data-quality.service';

@ApiTags('Data Quality & Provenance')
@Controller('api/v1/data-quality')
export class DataQualityController {
  constructor(private readonly dataQualityService: DataQualityService) {}

  @Get()
  @ApiOperation({ summary: 'Get comprehensive data quality report, confidence breakdown, and anomaly flags' })
  async getReport() {
    return this.dataQualityService.getReport();
  }
}
