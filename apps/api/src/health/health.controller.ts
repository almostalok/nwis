import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('System Health & Operations')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'System health check and diagnostic status' })
  checkHealth() {
    return this.healthService.checkHealth();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for container orchestrators' })
  checkLiveness() {
    return this.healthService.checkLiveness();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe verifying database connectivity' })
  checkReadiness() {
    return this.healthService.checkReadiness();
  }

  @Get('dependencies')
  @ApiOperation({ summary: 'Status of internal subsystems and OIL integration adapters' })
  getDependencies() {
    return this.healthService.getDependencies();
  }
}
