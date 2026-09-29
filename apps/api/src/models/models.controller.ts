import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ModelsService } from './models.service';

@ApiTags('Model Registry & Governance')
@Controller('api/v1/models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  @ApiOperation({ summary: 'List all registered ML/heuristic risk engines, benchmarks, lead times, and drift metrics' })
  getAllModels() {
    return this.modelsService.getAllModels();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed architecture, feature weights, and calibration data for a specific model' })
  getModelById(@Param('id') id: string) {
    return this.modelsService.getModelById(id);
  }
}
