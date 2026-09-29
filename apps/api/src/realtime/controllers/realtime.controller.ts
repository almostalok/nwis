import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DrillingSimulatorService } from '../simulator/drilling-simulator.service';
import { StreamEventService } from '../stream/stream-event.service';
import { SimulationScenario } from '@nwis/types';

@Controller('api/v1/realtime')
export class RealtimeController {

  constructor(
    private readonly simulatorService: DrillingSimulatorService,
    private readonly streamService: StreamEventService
  ) {}

  @Sse('stream')
  streamEvents(@Query('wellId') wellId?: string): Observable<MessageEvent> {
    return this.streamService.getStream(wellId).pipe(
      map((payload) => ({
        data: payload,
      }))
    );
  }

  @Get('wells/:id/latest')
  getLatestSample(@Param('id') wellId: string) {
    return this.simulatorService.getLatestSample(wellId);
  }

  @Get('wells/:id/history')
  getHistory(
    @Param('id') wellId: string,
    @Query('limit') limit?: string
  ) {
    const lim = limit ? parseInt(limit, 10) : 50;
    return this.simulatorService.getRecentHistory(wellId, lim);
  }

  @Get('wells/:id/features')
  getFeatures(@Param('id') wellId: string) {
    return this.simulatorService.getLatestFeatures(wellId);
  }

  @Get('wells/:id/anomalies')
  getAnomalies(@Param('id') wellId: string) {
    return this.simulatorService.getLatestAnomalies(wellId);
  }

  @Get('wells/:id/risks')
  getRisks(@Param('id') wellId: string) {
    return this.simulatorService.getLatestRisks(wellId);
  }

  @Get('wells/:id/context')
  getCurrentWellContext(@Param('id') wellId: string) {
    return this.simulatorService.getCurrentWellContext(wellId);
  }

  @Get('wells/:id/sensor-health')
  getSensorHealth(@Param('id') wellId: string) {
    return this.simulatorService.getSensorHealth(wellId);
  }

  @Post('simulator/start')
  startSimulation(
    @Body()
    body: {
      wellId: string;
      scenario?: SimulationScenario;
      startDepth?: number;
      endDepth?: number;
      speedMultiplier?: number;
      intervalSeconds?: number;
      totalSteps?: number;
    }
  ) {
    const session = this.simulatorService.startSimulation(
      body.wellId,
      body.scenario ?? SimulationScenario.NORMAL_DRILLING,
      {
        startDepth: body.startDepth,
        endDepth: body.endDepth,
        speedMultiplier: body.speedMultiplier,
        intervalSeconds: body.intervalSeconds,
        totalSteps: body.totalSteps,
      }
    );

    return {
      status: 'STARTED',
      wellId: session.wellId,
      scenario: session.scenario,
      currentDepth: session.currentDepth,
      speedMultiplier: session.speedMultiplier,
    };
  }

  @Post('simulator/stop')
  stopSimulation(@Body('wellId') wellId: string) {
    const stopped = this.simulatorService.stopSimulation(wellId);
    return { status: stopped ? 'STOPPED' : 'NOT_FOUND', wellId };
  }

  @Post('simulator/pause')
  pauseSimulation(@Body('wellId') wellId: string) {
    const paused = this.simulatorService.pauseSimulation(wellId);
    return { status: paused ? 'PAUSED' : 'NOT_FOUND', wellId };
  }

  @Post('simulator/resume')
  resumeSimulation(@Body('wellId') wellId: string) {
    const resumed = this.simulatorService.resumeSimulation(wellId);
    return { status: resumed ? 'RESUMED' : 'NOT_FOUND', wellId };
  }

  @Post('simulator/demo')
  runHackathonDemo() {
    return this.simulatorService.runHackathonDemo();
  }

  @Post('simulator/reset')
  resetSimulations() {
    return this.simulatorService.resetAllSimulations();
  }

  @Get('simulator/status')
  getSimulatorStatus() {
    return this.simulatorService.getSimulatorStatus();
  }
}
