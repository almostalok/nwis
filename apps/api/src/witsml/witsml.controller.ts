import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WitsmlService } from './witsml.service';

@ApiTags('WITSML / eRTMAC Integration Interface')
@Controller('api/v1/witsml')
export class WitsmlController {
  constructor(private readonly witsmlService: WitsmlService) {}

  @Get('status')
  @ApiOperation({ summary: 'Verify WITSML adapter connection and contract specifications' })
  @ApiQuery({ name: 'endpoint', required: false, type: String })
  async getStatus(@Query('endpoint') endpoint?: string) {
    return this.witsmlService.testConnection({
      endpointUrl: endpoint || 'https://ertmac.oilindia.in/witsml/services/WMLS',
      witsmlVersion: '1.4.1.1',
    });
  }

  @Get('capabilities')
  @ApiOperation({ summary: 'Inspect supported WITSML objects and functions for eRTMAC data exchange' })
  async getCapabilities() {
    return this.witsmlService.getCap({
      endpointUrl: 'https://ertmac.oilindia.in/witsml/services/WMLS',
      witsmlVersion: '1.4.1.1',
    });
  }
}
