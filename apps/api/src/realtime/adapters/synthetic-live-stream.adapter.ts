import { Injectable, Logger } from '@nestjs/common';
import { RealtimeDrillingAdapter, AdapterStatus, SampleCallback } from './realtime-drilling.adapter';
import {
  RealtimeDrillingSample,
  SensorQuality,
  DrillingState,
  SimulationScenario,
} from '@nwis/types';
import { SENSOR_BOUNDS, SIMULATION_PRESETS } from '../config/risk-config';

export interface ActiveSimulationState {
  wellId: string;
  scenario: SimulationScenario;
  currentDepth: number;
  endDepth: number;
  speedMultiplier: number;
  intervalMs: number;
  timerRef?: NodeJS.Timeout;
  stepIndex: number;
  totalSteps: number;
  isPaused: boolean;
  baseParams: {
    rop: number;
    wob: number;
    rpm: number;
    torque: number;
    hookload: number;
    spp: number;
    flowIn: number;
    flowOut: number;
    pitVolume: number;
    mudWeight: number;
    drag: number;
  };
}

@Injectable()
export class SyntheticLiveStreamAdapter implements RealtimeDrillingAdapter {
  private readonly logger = new Logger(SyntheticLiveStreamAdapter.name);
  readonly adapterName = 'NWIS Synthetic Live Stream Adapter (OIL Demonstration)';
  private isConnected = true;
  private sampleCallback?: SampleCallback;
  private simulations = new Map<string, ActiveSimulationState>();
  private samplesDispatched = 0;
  private lastSampleTime?: Date;

  async connect(): Promise<void> {
    this.isConnected = true;
    this.logger.log('SyntheticLiveStreamAdapter connected.');
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    for (const [wellId] of this.simulations) {
      await this.stopSimulation(wellId);
    }
  }

  async subscribe(wellId: string): Promise<void> {
    if (!this.simulations.has(wellId)) {
      this.logger.log(`Subscribed to well: ${wellId}`);
    }
  }

  async unsubscribe(wellId: string): Promise<void> {
    await this.stopSimulation(wellId);
  }

  onSample(callback: SampleCallback): void {
    this.sampleCallback = callback;
  }

  getStatus(): AdapterStatus {
    return {
      connected: this.isConnected,
      adapterName: this.adapterName,
      sourceType: 'SYNTHETIC_DEMONSTRATION_STREAM',
      subscribedWells: Array.from(this.simulations.keys()),
      samplesReceived: this.samplesDispatched,
      lastSampleTimestamp: this.lastSampleTime,
      statusMessage: `Active synthetic streams: ${this.simulations.size}. Total samples: ${this.samplesDispatched}`,
    };
  }

  /**
   * Start or restart a simulation scenario for a specific well
   */
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
  ): ActiveSimulationState {
    this.stopSimulation(wellId);

    const startDepth = options?.startDepth ?? SIMULATION_PRESETS.DEFAULT_START_DEPTH;
    const endDepth = options?.endDepth ?? SIMULATION_PRESETS.DEFAULT_END_DEPTH;
    const speed = Math.max(1, options?.speedMultiplier ?? SIMULATION_PRESETS.DEFAULT_SPEED_MULTIPLIER);
    const intervalSec = options?.intervalSeconds ?? SIMULATION_PRESETS.DEFAULT_INTERVAL_SECONDS;
    const intervalMs = Math.max(100, Math.floor((intervalSec * 1000) / speed));
    const totalSteps = options?.totalSteps ?? 80;

    const state: ActiveSimulationState = {
      wellId,
      scenario,
      currentDepth: startDepth,
      endDepth,
      speedMultiplier: speed,
      intervalMs,
      stepIndex: 0,
      totalSteps,
      isPaused: false,
      baseParams: {
        rop: 18.5,
        wob: 110.0,
        rpm: 120.0,
        torque: 14.5,
        hookload: 1250.0,
        spp: 195.0,
        flowIn: 2400.0,
        flowOut: 2400.0,
        pitVolume: 120.0,
        mudWeight: 1.25,
        drag: 22.0,
      },
    };

    state.timerRef = setInterval(() => {
      if (!state.isPaused) {
        this.stepSimulation(state);
      }
    }, intervalMs);

    this.simulations.set(wellId, state);
    this.logger.log(
      `Started synthetic stream for ${wellId}: scenario=${scenario}, speed=${speed}x, interval=${intervalMs}ms`
    );
    return state;
  }

  pauseSimulation(wellId: string): boolean {
    const sim = this.simulations.get(wellId);
    if (!sim) return false;
    sim.isPaused = true;
    return true;
  }

  resumeSimulation(wellId: string): boolean {
    const sim = this.simulations.get(wellId);
    if (!sim) return false;
    sim.isPaused = false;
    return true;
  }

  stopSimulation(wellId: string): boolean {
    const sim = this.simulations.get(wellId);
    if (!sim) return false;
    if (sim.timerRef) {
      clearInterval(sim.timerRef);
    }
    this.simulations.delete(wellId);
    this.logger.log(`Stopped synthetic stream for ${wellId}`);
    return true;
  }

  stopAllSimulations(): number {
    let count = 0;
    for (const [wellId, sim] of this.simulations.entries()) {
      if (sim.timerRef) {
        clearInterval(sim.timerRef);
      }
      count++;
    }
    this.simulations.clear();
    this.logger.log(`Stopped and reset all ${count} active synthetic simulations`);
    return count;
  }

  getSimulationState(wellId: string): ActiveSimulationState | undefined {
    return this.simulations.get(wellId);
  }

  getAllSimulations(): ActiveSimulationState[] {
    return Array.from(this.simulations.values());
  }

  /**
   * Advance one simulation tick, apply scenario transitions, validate quality, and dispatch sample
   */
  private stepSimulation(sim: ActiveSimulationState): void {
    sim.stepIndex++;

    // Depth progression proportional to ROP
    const depthIncrement = (sim.baseParams.rop / 3600) * (sim.intervalMs / 1000) * sim.speedMultiplier;
    sim.currentDepth = Number((sim.currentDepth + Math.max(0.05, depthIncrement)).toFixed(2));

    // Progress fraction (0.0 to 1.0)
    const progress = Math.min(1.0, sim.stepIndex / sim.totalSteps);

    // Compute parameter modifications according to the active scenario
    const sample = this.generateSampleForScenario(sim, progress);

    // Validate sensor bounds and data quality
    this.validateSampleQuality(sample);

    this.samplesDispatched++;
    this.lastSampleTime = new Date();

    if (this.sampleCallback) {
      try {
        this.sampleCallback(sample);
      } catch (err) {
        this.logger.error(`Error in sample callback for ${sim.wellId}:`, err);
      }
    }

    if (sim.stepIndex >= sim.totalSteps || sim.currentDepth >= sim.endDepth) {
      this.logger.log(`Simulation reached target depth/steps for ${sim.wellId}. Ending session.`);
      this.stopSimulation(sim.wellId);
    }
  }

  /**
   * Scenario generator applying realistic physics perturbations
   */
  private generateSampleForScenario(sim: ActiveSimulationState, progress: number): RealtimeDrillingSample {
    const noise = (magnitude: number) => (Math.random() - 0.5) * magnitude;
    const base = sim.baseParams;
    const now = new Date();

    let rop = base.rop + noise(1.2);
    let torque = base.torque + noise(0.8);
    let drag = base.drag + noise(1.5);
    let hookload = base.hookload + noise(15);
    let rpm = base.rpm + noise(2);
    let wob = base.wob + noise(5);
    let spp = base.spp + noise(3);
    let flowIn = base.flowIn + noise(20);
    let flowOut = base.flowOut + noise(20);
    let pitVolume = base.pitVolume + noise(0.2);
    let mudWeight = base.mudWeight + noise(0.01);
    let drillingState = DrillingState.DRILLING;

    switch (sim.scenario) {
      case SimulationScenario.STUCK_PIPE_PRECURSOR: {
        // Steps 0-25: Normal drilling
        // Steps 25-60: Gradual torque increase (+30%), ROP drop (-25%), drag increase (+20%)
        // Steps 60-80: Critical precursor (Torque spikes, high drag, hookload fluctuations)
        if (progress > 0.25) {
          const factor = Math.min(1.0, (progress - 0.25) / 0.5);
          torque = base.torque * (1 + 0.35 * factor) + noise(1.2);
          rop = Math.max(2, base.rop * (1 - 0.30 * factor) + noise(0.8));
          drag = base.drag * (1 + 0.28 * factor) + noise(2.0);
          hookload = base.hookload + factor * 60 * Math.sin(sim.stepIndex);
        }
        break;
      }

      case SimulationScenario.TORQUE_SPIKE: {
        if (progress > 0.3 && progress < 0.7) {
          torque = base.torque * 1.5 + noise(2.5);
          rpm = Math.max(50, base.rpm * 0.85 + noise(4));
        }
        break;
      }

      case SimulationScenario.ROP_DROP: {
        if (progress > 0.25) {
          rop = Math.max(2, base.rop * 0.4 + noise(0.5));
          wob = base.wob * 1.25 + noise(8);
        }
        break;
      }

      case SimulationScenario.LOST_CIRCULATION: {
        if (progress > 0.2) {
          const factor = Math.min(1.0, (progress - 0.2) / 0.5);
          flowOut = Math.max(800, base.flowOut * (1 - 0.35 * factor) + noise(25));
          pitVolume = Math.max(80, base.pitVolume - factor * 8.5 + noise(0.3));
          spp = Math.max(120, base.spp * (1 - 0.15 * factor) + noise(2));
        }
        break;
      }

      case SimulationScenario.KICK_PRECURSOR: {
        if (progress > 0.25) {
          const factor = Math.min(1.0, (progress - 0.25) / 0.5);
          flowOut = base.flowOut * (1 + 0.25 * factor) + noise(30);
          pitVolume = base.pitVolume + factor * 5.2 + noise(0.4);
          spp = Math.max(140, base.spp * (1 - 0.12 * factor) + noise(2));
        }
        break;
      }

      case SimulationScenario.PRESSURE_ANOMALY: {
        if (progress > 0.3) {
          spp = base.spp * 1.35 + noise(8);
        }
        break;
      }

      case SimulationScenario.FORMATION_INSTABILITY: {
        if (progress > 0.3) {
          torque = base.torque * 1.28 + noise(2.0);
          drag = base.drag * 1.32 + noise(3.0);
          rop = base.rop * 0.75 + noise(1.0);
        }
        break;
      }

      case SimulationScenario.NORMAL_DRILLING:
      default:
        // Pure steady state with realistic sensor jitter
        break;
    }

    return {
      wellId: sim.wellId,
      timestamp: now,
      measuredDepth: sim.currentDepth,
      trueVerticalDepth: Number((sim.currentDepth * 0.98).toFixed(2)),
      formationId: 'Formation Gamma',
      rop: Number(rop.toFixed(2)),
      wob: Number(wob.toFixed(2)),
      rpm: Number(rpm.toFixed(1)),
      torque: Number(torque.toFixed(2)),
      hookload: Number(hookload.toFixed(1)),
      standpipePressure: Number(spp.toFixed(1)),
      flowIn: Number(flowIn.toFixed(1)),
      flowOut: Number(flowOut.toFixed(1)),
      pitVolume: Number(pitVolume.toFixed(2)),
      mudWeightIn: Number(mudWeight.toFixed(2)),
      mudWeightOut: Number((mudWeight + 0.02).toFixed(2)),
      drag: Number(drag.toFixed(2)),
      drillingState,
      source: 'SYNTHETIC_DEMONSTRATION_STREAM',
      quality: SensorQuality.GOOD,
      qualityIssues: [],
    };
  }

  /**
   * Validate sensor bounds and populate quality flags
   */
  private validateSampleQuality(sample: RealtimeDrillingSample): void {
    const issues: string[] = [];

    if (sample.rop !== null && sample.rop !== undefined) {
      if (sample.rop < SENSOR_BOUNDS.ROP.MIN) {
        issues.push(`ROP is negative (${sample.rop} m/hr)`);
        sample.quality = SensorQuality.INVALID;
      } else if (sample.rop > SENSOR_BOUNDS.ROP.MAX) {
        issues.push(`ROP exceeds physical threshold (${sample.rop} m/hr)`);
        sample.quality = SensorQuality.SUSPECT;
      }
    }

    if (sample.rpm !== null && sample.rpm !== undefined) {
      if (sample.rpm < SENSOR_BOUNDS.RPM.MIN) {
        issues.push(`RPM is negative (${sample.rpm} rpm)`);
        sample.quality = SensorQuality.INVALID;
      }
    }

    if (sample.mudWeightIn !== null && sample.mudWeightIn !== undefined) {
      if (
        sample.mudWeightIn < SENSOR_BOUNDS.MUD_WEIGHT.MIN ||
        sample.mudWeightIn > SENSOR_BOUNDS.MUD_WEIGHT.MAX
      ) {
        issues.push(`Mud weight out of operational bounds (${sample.mudWeightIn} sg)`);
        if (sample.quality !== SensorQuality.INVALID) {
          sample.quality = SensorQuality.SUSPECT;
        }
      }
    }

    if (issues.length > 0) {
      sample.qualityIssues = issues;
    }
  }
}
