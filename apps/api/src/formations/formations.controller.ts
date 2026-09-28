import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FormationsService } from './formations.service';

@ApiTags('Formations')
@Controller('api/v1/formations')
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}

  @Get()
  @ApiOperation({ summary: 'List formation intervals across all wells with optional formation name filter' })
  @ApiQuery({ name: 'formationName', required: false, type: String })
  async getFormations(@Query('formationName') formationName?: string) {
    return this.formationsService.findAll(formationName);
  }
}
