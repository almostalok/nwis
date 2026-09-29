import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { prisma } from '@nwis/database';
import {
  RealtimeDrillingSample,
  RealtimeFeatureData,
  AnomalyData,
  RiskAssessmentData,
  SimulationScenario,
  SimulationState,
  SensorQuality,
  SensorQualityStatus,
  AlertSeverity,
} from '@nwis/types';
import { SyntheticLiveStreamAdapter } from '../adapters/synthetic-live-stream.adapter';
import { FeatureEngineService } from '../features/feature-engine.service';
import { AnomalyEngineService } from '../anomaly/anomaly-engine.service';
import { RiskFusionEngine } from '../risk/risk-fusion.engine';
import { AlertEngineService } from '../alerts/alert-engine.service';
import { StreamEventService } from '../stream/stream-event.service';
import { SIMULATION_PRESETS } from '../config/risk-config';

@Injectable()
export class DrillingSimulatorService implements OnModuleInit {
  private readonly logger = new Logger(DrillingSimulatorService.name);
  private readonly prisma = prisma;

  // Latest sample cache per well

  private latestSamples = new Map<string, RealtimeDrillingSample>();
  private latestFeatures = new Map<string, RealtimeFeatureData[]>();
  private latestAnomalies = new Map<string, AnomalyData[]>();
  private latestRisks = new Map<string, RiskAssessmentData[]>();

  constructor(
    private readonly syntheticAdapter: SyntheticLiveStreamAdapter,
    private readonly featureEngine: FeatureEngineService,
    private readonly anomalyEngine: AnomalyEngineService,
    private readonly riskFusion: RiskFusionEngine,
    private readonly alertEngine: AlertEngineService,
    private readonly streamService: StreamEventService
  ) {}

  onModuleInit() {
    // Wire the synthetic adapter output to the real-time processing pipeline
    this.syntheticAdapter.onSample(async (sample) => {
      await this.processIncomingSample(sample);
    });

    this.logger.log('DrillingSimulatorService initialized and wired to SyntheticLiveStreamAdapter.');
  }

  /**
   * Complete real-time stream processing pipeline:
   * Sample -> Validation -> Feature Engine -> Anomaly Engine -> Risk Fusion -> Alert Engine -> Stream Delivery
   */
  async processIncomingSample(sample: RealtimeDrillingSample): Promise<void> {
    const wellId = sample.wellId;
    this.latestSamples.set(wellId, sample);

    // 1. Broadcast raw sample
    this.streamService.broadcast({
      type: 'drilling.sample',
      wellId,
      timestamp: sample.timestamp,
      data: sample,
    });

    // 2. Feature engineering
    const features = this.featureEngine.processSample(sample);
    this.latestFeatures.set(wellId, features);

    if (features.length > 0) {
      this.streamService.broadcast({
        type: 'drilling.feature.updated',
        wellId,
        timestamp: sample.timestamp,
        data: features,
      });
    }

    // 3. Anomaly detection
    const anomalies = this.anomalyEngine.detectAnomalies(sample, features);
    this.latestAnomalies.set(wellId, anomalies);

    if (anomalies.length > 0) {
      this.streamService.broadcast({
        type: 'anomaly.detected',
        wellId,
        timestamp: sample.timestamp,
        data: anomalies,
      });
    }

    // 4. Risk evaluation (fused with Stage 02 precedent engine)
    const risks = await this.riskFusion.evaluateAllRisks(sample, features, anomalies);
    this.latestRisks.set(wellId, risks);

    if (risks.length > 0) {
      this.streamService.broadcast({
        type: 'risk.updated',
        wellId,
        timestamp: sample.timestamp,
        data: risks,
      });

      // 5. Alert lifecycle processing
      for (const risk of risks) {
        const precedentItems = this.riskFusion.formatHistoricalEvidence(
          risk.historicalContext?.topPrecedentEvents ?? []
        );
        const alertResult = await this.alertEngine.processRiskAssessment(
          sample,
          risk,
          precedentItems
        );

        if (alertResult) {
          const eventType =
            alertResult.action === 'CREATED'
              ? 'alert.created'
              : alertResult.action === 'RESOLVED'
              ? 'alert.resolved'
              : 'alert.updated';

          this.streamService.broadcast({
            type: eventType,
            wellId,
            timestamp: sample.timestamp,
            data: alertResult.alert,
          });
        }
      }
    }

    // 6. Asynchronously persist sample to PostgreSQL
    try {
      await this.prisma.realtimeDrillingSample.create({
        data: {
          wellId: sample.wellId,
          timestamp: new Date(sample.timestamp),
          measuredDepth: sample.measuredDepth,
          trueVerticalDepth: sample.trueVerticalDepth,
          formationId: sample.formationId,
          rop: sample.rop,
          wob: sample.wob,
          rpm: sample.rpm,
          torque: sample.torque,
          hookload: sample.hookload,
          standpipePressure: sample.standpipePressure,
          flowIn: sample.flowIn,
          flowOut: sample.flowOut,
          pitVolume: sample.pitVolume,
          mudWeightIn: sample.mudWeightIn,
          mudWeightOut: sample.mudWeightOut,
          drag: sample.drag,
          drillingState: (sample.drillingState as any) ?? 'DRILLING',
          source: sample.source ?? 'SYNTHETIC_STREAM',
          quality: (sample.quality as any) ?? 'GOOD',
          qualityIssues: sample.qualityIssues ?? [],
        },
      });
    } catch (err) {
      // Continue without breaking live stream in case of DB collision
      this.logger.debug(`Could not write sample to database: ${err}`);
    }
  }

  startSimulation(
    wellId: string,
    scenario: SimulationScenario = SimulationScenario.NORMAL_DRILLING,
    options?: {
      startDepth?: number;
      endDepth?: number;
      speedMultiplier?: number;
      intervalSeconds?: number;
      totalSteps?: number;
    }
  ) {
    const session = this.syntheticAdapter.startSimulation(wellId, scenario, options);

    this.streamService.broadcast({
      type: 'simulation.started',
      wellId,
      timestamp: new Date(),
      data: { scenario, speedMultiplier: session.speedMultiplier },
    });
    return session;
  }

  stopSimulation(wellId: string) {
    const stopped = this.syntheticAdapter.stopSimulation(wellId);
    this.streamService.broadcast({
      type: 'simulation.stopped',
      wellId,
      timestamp: new Date(),
      data: { wellId },
    });
    return stopped;
  }

  pauseSimulation(wellId: string) {
    const paused = this.syntheticAdapter.pauseSimulation(wellId);
    this.streamService.broadcast({
      type: 'simulation.paused',
      wellId,
      timestamp: new Date(),
      data: { wellId },
    });
    return paused;
  }

  resumeSimulation(wellId: string) {
    const resumed = this.syntheticAdapter.resumeSimulation(wellId);
    this.streamService.broadcast({
      type: 'simulation.resumed',
      wellId,
      timestamp: new Date(),
      data: { wellId },
    });
    return resumed;
  }

  resetAllSimulations(): { stoppedCount: number; status: string } {
    const stoppedCount = this.syntheticAdapter.stopAllSimulations();
    this.featureEngine.clearAllBuffers();
    this.streamService.broadcast({
      type: 'simulation.stopped',
      wellId: 'ALL',
      timestamp: new Date(),
      data: { stoppedCount, action: 'RESET_ALL' },
    });
    this.logger.log(`All active simulations reset. Cleared ${stoppedCount} sessions.`);
    return { stoppedCount, status: 'ALL_RESET' };
  }

  /**
   * Deterministic Hackathon Demo Mode:
   * Starts OIL-SYN-020 at 3200m depth with STUCK_PIPE_PRECURSOR scenario
   */
  runHackathonDemo() {
    const wellId = SIMULATION_PRESETS.DEFAULT_WELL_ID;
    this.featureEngine.clearBuffer(wellId);

    const session = this.startSimulation(
      wellId,
      SimulationScenario.STUCK_PIPE_PRECURSOR,
      {
        startDepth: 3200,
        endDepth: 3250,
        speedMultiplier: 10,
        intervalSeconds: 2,
      }
    );

    this.logger.log(`Hackathon Demo initialized on well ${wellId} (Stuck Pipe Precursor).`);
    return {
      status: 'DEMO_RUNNING',
      wellId,
      scenario: SimulationScenario.STUCK_PIPE_PRECURSOR,
      startDepth: 3200,
      targetDepth: 3250,
      speedMultiplier: 10,
      narrative:
        'Demo sequence initialized. Normal drilling will gradually transition into elevated torque (+35%), ROP drop (-30%), and drag increase (+28%), matching historical stuck-pipe cases in SYN-003, SYN-007, and SYN-012.',
    };
  }

  getLatestSample(wellId: string): RealtimeDrillingSample | null {
    return this.latestSamples.get(wellId) ?? null;
  }

  getLatestFeatures(wellId: string): RealtimeFeatureData[] {
    return this.latestFeatures.get(wellId) ?? [];
  }

  getLatestAnomalies(wellId: string): AnomalyData[] {
    return this.latestAnomalies.get(wellId) ?? [];
  }

  getLatestRisks(wellId: string): RiskAssessmentData[] {
    return this.latestRisks.get(wellId) ?? [];
  }

  async getRecentHistory(wellId: string, limit = 50): Promise<any[]> {
    return this.prisma.realtimeDrillingSample.findMany({
      where: { wellId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Sensor Quality & Health Evaluation
   */
  getSensorHealth(wellId: string): SensorQualityStatus[] {
    const sample = this.latestSamples.get(wellId);
    if (!sample) {
      return [
        { parameter: 'ALL_SENSORS', quality: SensorQuality.MISSING, statusMessage: 'No telemetry stream active' },
      ];
    }

    const check = (param: string, value?: number | null, unit?: string): SensorQualityStatus => {
      if (value === null || value === undefined) {
        return { parameter: param, quality: SensorQuality.MISSING, statusMessage: 'Sensor signal missing' };
      }
      return {
        parameter: param,
        quality: sample.quality ?? SensorQuality.GOOD,
        lastValue: value,
        lastTimestamp: sample.timestamp,
        statusMessage: `Nominal reading (${value} ${unit ?? ''})`,
      };
    };

    return [
      check('TORQUE', sample.torque, 'kNm'),
      check('ROP', sample.rop, 'm/hr'),
      check('WOB', sample.wob, 'kN'),
      check('RPM', sample.rpm, 'rpm'),
      check('DRAG', sample.drag, 'kN'),
      check('HOOKLOAD', sample.hookload, 'kN'),
      check('STANDPIPE_PRESSURE', sample.standpipePressure, 'bar'),
      check('FLOW_IN', sample.flowIn, 'L/min'),
      check('FLOW_OUT', sample.flowOut, 'L/min'),
      check('PIT_VOLUME', sample.pitVolume, 'm³'),
      check('MUD_WEIGHT', sample.mudWeightIn, 'sg'),
    ];
  }

  /**
   * Unified Current Well Context for Dashboard and Real-Time RAG
   */
  async getCurrentWellContext(wellId: string): Promise<any> {
    const well = await this.prisma.well.findUnique({
      where: { wellId },
      include: {
        formations: true,
      },
    });

    const latestSample = this.latestSamples.get(wellId);
    const recentFeatures = this.latestFeatures.get(wellId) ?? [];
    const activeAnomalies = this.latestAnomalies.get(wellId) ?? [];
    const activeRisks = this.latestRisks.get(wellId) ?? [];

    const activeAlerts = await this.prisma.alert.findMany({
      where: {
        wellId,
        status: { in: ['NEW', 'ACKNOWLEDGED', 'ESCALATED'] },
      },
      orderBy: { createdAt: 'desc' },
      include: { events: true },
    });

    return {
      well,
      currentDepth: latestSample?.measuredDepth ?? well?.totalDepth ?? 3200,
      currentFormation: latestSample?.formationId ?? 'Formation Gamma',
      drillingState: latestSample?.drillingState ?? 'DRILLING',
      currentParameters: latestSample,
      recentFeatures,
      activeAnomalies,
      activeRisks,
      activeAlerts,
      streamStatus: this.syntheticAdapter.getStatus(),
    };
  }

  getSimulatorStatus() {
    return {
      adapter: this.syntheticAdapter.getStatus(),
      activeSimulations: this.syntheticAdapter.getAllSimulations().map((sim) => ({
        wellId: sim.wellId,
        scenario: sim.scenario,
        currentDepth: sim.currentDepth,
        endDepth: sim.endDepth,
        speedMultiplier: sim.speedMultiplier,
        isPaused: sim.isPaused,
        stepIndex: sim.stepIndex,
        totalSteps: sim.totalSteps,
      })),
    };
  }
}
