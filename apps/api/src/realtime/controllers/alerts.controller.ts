import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AlertEngineService } from '../alerts/alert-engine.service';
import { AlertSeverity, AlertStatus, RiskType, UserRole } from '@nwis/types';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DRILLING_ENGINEER, UserRole.MANAGER)
  acknowledgeAlert(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('actor') bodyActor?: string,
    @Body('note') note?: string
  ) {
    const actor = user?.name || bodyActor || 'Authorized Drilling Engineer';
    return this.alertEngine.acknowledgeAlert(id, actor, note);
  }

  @Post(':id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DRILLING_ENGINEER, UserRole.MANAGER)
  resolveAlert(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('actor') bodyActor?: string,
    @Body('note') note = 'Telemetry stabilized; operational verification complete.'
  ) {
    const actor = user?.name || bodyActor || 'Authorized Drilling Engineer';
    return this.alertEngine.resolveAlert(id, actor, note);
  }

  @Post(':id/dismiss')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DRILLING_ENGINEER, UserRole.MANAGER)
  dismissAlert(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('actor') bodyActor?: string,
    @Body('reason') reason?: string
  ) {
    const actor = user?.name || bodyActor || 'Authorized Drilling Engineer';
    return this.alertEngine.dismissAlert(id, actor, reason || 'Reviewed and dismissed by engineer');
  }
}
