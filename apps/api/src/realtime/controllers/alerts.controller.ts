import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { AlertEngineService } from '../alerts/alert-engine.service';
import { AlertSeverity, AlertStatus, RiskType } from '@nwis/types';

@Controller('api/v1/alerts')
export class AlertsController {

  constructor(private readonly alertEngine: AlertEngineService) {}

  @Get()
  getAlerts(
    @Query('wellId') wellId?: string,
    @Query('riskType') riskType?: RiskType,
    @Query('severity') severity?: AlertSeverity,
    @Query('status') status?: AlertStatus,
    @Query('limit') limit?: string
  ) {
    const lim = limit ? parseInt(limit, 10) : 50;
    return this.alertEngine.getAlerts({
      wellId,
      riskType,
      severity,
      status,
      limit: lim,
    });
  }

  @Get(':id')
  getAlertById(@Param('id') id: string) {
    return this.alertEngine.getAlertById(id);
  }

  @Post(':id/acknowledge')
  acknowledgeAlert(
    @Param('id') id: string,
    @Body('actor') actor = 'Drilling Engineer',
    @Body('note') note?: string
  ) {
    return this.alertEngine.acknowledgeAlert(id, actor, note);
  }

  @Post(':id/resolve')
  resolveAlert(
    @Param('id') id: string,
    @Body('actor') actor = 'Drilling Engineer',
    @Body('note') note = 'Telemetry stabilized; operational verification complete.'
  ) {
    return this.alertEngine.resolveAlert(id, actor, note);
  }

  @Post(':id/dismiss')
  dismissAlert(
    @Param('id') id: string,
    @Body('actor') actor = 'Drilling Engineer',
    @Body('reason') reason: string
  ) {
    return this.alertEngine.dismissAlert(id, actor, reason);
  }
}
