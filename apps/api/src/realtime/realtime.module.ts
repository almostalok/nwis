import { Module } from '@nestjs/common';
import { IntelligenceModule } from '../intelligence/intelligence.module';
import { SyntheticLiveStreamAdapter } from './adapters/synthetic-live-stream.adapter';
import { ERTMACAdapter } from './adapters/ertmac-live.adapter';
import { WITSMLLiveAdapter } from './adapters/witsml-live.adapter';
import { FeatureEngineService } from './features/feature-engine.service';
import { AnomalyEngineService } from './anomaly/anomaly-engine.service';
import { StuckPipeRiskEngine } from './risk/stuck-pipe-risk.engine';
import { LostCirculationRiskEngine } from './risk/lost-circulation-risk.engine';
import { KickRiskEngine } from './risk/kick-risk.engine';
import { TorqueRiskEngine } from './risk/torque-risk.engine';
import { CementingRiskEngine } from './risk/cementing-risk.engine';
import { RiskFusionEngine } from './risk/risk-fusion.engine';
import { AlertEngineService } from './alerts/alert-engine.service';
import { StreamEventService } from './stream/stream-event.service';
import { DrillingSimulatorService } from './simulator/drilling-simulator.service';
import { RealtimeController } from './controllers/realtime.controller';
import { AlertsController } from './controllers/alerts.controller';

@Module({
  imports: [IntelligenceModule],
  controllers: [RealtimeController, AlertsController],
  providers: [
    SyntheticLiveStreamAdapter,
    ERTMACAdapter,
    WITSMLLiveAdapter,
    FeatureEngineService,
    AnomalyEngineService,
    StuckPipeRiskEngine,
    LostCirculationRiskEngine,
    KickRiskEngine,
    TorqueRiskEngine,
    CementingRiskEngine,
    RiskFusionEngine,
    AlertEngineService,
    StreamEventService,
    DrillingSimulatorService,
  ],
  exports: [
    SyntheticLiveStreamAdapter,
    ERTMACAdapter,
    WITSMLLiveAdapter,
    FeatureEngineService,
    AnomalyEngineService,
    RiskFusionEngine,
    AlertEngineService,
    StreamEventService,
    DrillingSimulatorService,
  ],
})
export class RealtimeModule {}
