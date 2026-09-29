/**
 * NWIS Stage 03 Verification Suite: Real-Time Intelligence, Anomaly Engines, Risk Fusion & Alerts
 * Oil India Limited (OIL) — Problem Statement SIH26121
 */

import {
  calculateRollingMean,
  calculateRollingStd,
  calculateRollingMedian,
  calculateMedianAbsoluteDeviation,
  calculateRollingSlope,
  calculateZScore,
  calculateRobustZScore,
  calculatePercentageChange,
} from '../packages/utils/src/feature-math';

import {
  RealtimeDrillingSample,
  RealtimeFeatureData,
  SensorQuality,
  AlertSeverity,
  AlertStatus,
  DrillingState,
  RiskType,
  SimulationScenario,
} from '../packages/types/src';

import { FeatureEngineService } from '../apps/api/src/realtime/features/feature-engine.service';
import { AnomalyEngineService } from '../apps/api/src/realtime/anomaly/anomaly-engine.service';
import { StuckPipeRiskEngine } from '../apps/api/src/realtime/risk/stuck-pipe-risk.engine';
import { LostCirculationRiskEngine } from '../apps/api/src/realtime/risk/lost-circulation-risk.engine';
import { KickRiskEngine } from '../apps/api/src/realtime/risk/kick-risk.engine';
import { TorqueRiskEngine } from '../apps/api/src/realtime/risk/torque-risk.engine';
import { CementingRiskEngine } from '../apps/api/src/realtime/risk/cementing-risk.engine';
import { SyntheticLiveStreamAdapter } from '../apps/api/src/realtime/adapters/synthetic-live-stream.adapter';
import { ERTMACAdapter } from '../apps/api/src/realtime/adapters/ertmac-live.adapter';
import { WITSMLLiveAdapter } from '../apps/api/src/realtime/adapters/witsml-live.adapter';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `— ${details}` : ''}`);
    failedTests++;
  }
}

async function runStage03Verification() {
  console.log('\n================================================================');
  console.log('  NWIS STAGE 03 COMPREHENSIVE AUTOMATED VERIFICATION SUITE');
  console.log('  Real-Time Drilling Intelligence, Precedents & Explainable Risk');
  console.log('================================================================\n');

  // --- SECTION 1: FEATURE ENGINEERING MATH TESTS ---
  console.log('--- 1. Feature Engineering Statistical Math Tests ---');
  {
    const values = [10, 12, 14, 16, 18];
    const mean = calculateRollingMean(values);
    assert(mean === 14, 'calculateRollingMean computes exact arithmetic mean');

    const std = calculateRollingStd(values, mean);
    assert(Math.abs(std - 3.162) < 0.01, 'calculateRollingStd computes sample standard deviation');

    const median = calculateRollingMedian(values);
    assert(median === 14, 'calculateRollingMedian computes median for odd sequence');

    const evenValues = [10, 12, 16, 18];
    assert(calculateRollingMedian(evenValues) === 14, 'calculateRollingMedian computes median for even sequence');

    const mad = calculateMedianAbsoluteDeviation(values, median);
    assert(mad === 2, 'calculateMedianAbsoluteDeviation computes correct MAD');

    const slopePoints = [
      { timestampSec: 0, value: 10 },
      { timestampSec: 10, value: 20 },
      { timestampSec: 20, value: 30 },
    ];
    const slope = calculateRollingSlope(slopePoints);
    assert(Math.abs(slope - 1.0) < 1e-4, 'calculateRollingSlope computes linear slope dy/dt');

    const zScore = calculateZScore(20.324, 14, 3.162);
    assert(zScore > 1.99 && zScore < 2.01, 'calculateZScore computes accurate z-score');

    const robustZ = calculateRobustZScore(18, 14, 2);
    assert(Math.abs(robustZ - 1.349) < 0.01, 'calculateRobustZScore computes MAD-normalized score');

    const pctChange = calculatePercentageChange(25, 20);
    assert(pctChange === 25, 'calculatePercentageChange computes exact percentage deviation');
  }

  // --- SECTION 2: ADAPTER ABSTRACTIONS & PLACEHOLDERS ---
  console.log('\n--- 2. Stream Adapter Abstractions & OIL eRTMAC Placeholders ---');
  {
    const ertmac = new ERTMACAdapter();
    assert(ertmac.adapterName.includes('OIL-eRTMAC'), 'ERTMACAdapter has explicit OIL name');
    const ertmacStatus = ertmac.getStatus();
    assert(ertmacStatus.sourceType === 'PRODUCTION_ERTMAC_STANDBY', 'ERTMACAdapter declares PRODUCTION_ERTMAC_STANDBY');
    assert(ertmacStatus.statusMessage.includes('SyntheticLiveStreamAdapter'), 'ERTMAC documents fallback to synthetic adapter');

    const witsml = new WITSMLLiveAdapter();
    assert(witsml.adapterName.includes('WITSML'), 'WITSMLLiveAdapter instantiated');
    assert(witsml.getStatus().sourceType === 'WITSML_LIVE_STANDBY', 'WITSMLLiveAdapter declares WITSML_LIVE_STANDBY');

    const synthetic = new SyntheticLiveStreamAdapter();
    await synthetic.connect();
    assert(synthetic.getStatus().connected === true, 'SyntheticLiveStreamAdapter connects cleanly');
    await synthetic.disconnect();
  }

  // --- SECTION 3: FEATURE ENGINE WINDOWING & NORMALIZATION ---
  console.log('\n--- 3. Feature Engine Service (Rolling Windows & Baselines) ---');
  {
    const engine = new FeatureEngineService();
    const now = new Date();

    // Ingest 5 samples for OIL-SYN-020
    const samples: RealtimeDrillingSample[] = [
      { wellId: 'OIL-SYN-020', timestamp: new Date(now.getTime() - 4000), measuredDepth: 3200.0, torque: 15.0, rop: 18.0, drag: 22.0, formationId: 'Formation Gamma' },
      { wellId: 'OIL-SYN-020', timestamp: new Date(now.getTime() - 3000), measuredDepth: 3200.2, torque: 16.0, rop: 17.5, drag: 23.0, formationId: 'Formation Gamma' },
      { wellId: 'OIL-SYN-020', timestamp: new Date(now.getTime() - 2000), measuredDepth: 3200.4, torque: 17.5, rop: 16.0, drag: 25.0, formationId: 'Formation Gamma' },
      { wellId: 'OIL-SYN-020', timestamp: new Date(now.getTime() - 1000), measuredDepth: 3200.6, torque: 19.5, rop: 14.0, drag: 27.0, formationId: 'Formation Gamma' },
      { wellId: 'OIL-SYN-020', timestamp: now, measuredDepth: 3200.8, torque: 21.0, rop: 12.0, drag: 29.5, formationId: 'Formation Gamma' },
    ];

    let lastFeatures: RealtimeFeatureData[] = [];
    for (const s of samples) {
      lastFeatures = engine.processSample(s);
    }

    assert(lastFeatures.length > 0, 'FeatureEngineService generates multi-window features');
    const f30 = lastFeatures.find((f) => f.windowSeconds === 30) || lastFeatures[0];
    assert(f30.torqueMean !== null && f30.torqueMean! > 15, 'FeatureEngineService calculates rolling torque mean');
    assert(f30.torqueSlope !== null && f30.torqueSlope! > 0, 'FeatureEngineService detects positive torque slope');
    assert(f30.ropSlope !== null && f30.ropSlope! < 0, 'FeatureEngineService detects negative ROP slope');
    assert(f30.formationBaselineDeviation?.torquePct !== undefined, 'FeatureEngineService calculates baseline deviation');
  }

  // --- SECTION 4: ANOMALY ENGINE SERVICE ---
  console.log('\n--- 4. Anomaly Engine Service (Z-Score & Trend Detection) ---');
  {
    const anomalyEngine = new AnomalyEngineService();
    const abnormalSample: RealtimeDrillingSample = {
      wellId: 'OIL-SYN-020',
      timestamp: new Date(),
      measuredDepth: 3210,
      torque: 22.5, // 50% above baseline 15
      rop: 10.0, // 44% below baseline 18
      drag: 31.0, // 40% above baseline 22
      formationId: 'Formation Gamma',
    };

    const abnormalFeatures: RealtimeFeatureData[] = [
      {
        wellId: 'OIL-SYN-020',
        timestamp: new Date(),
        windowSeconds: 60,
        torqueMean: 15.0,
        torqueZScore: 3.2,
        torqueRobustZ: 3.5,
        ropMean: 18.0,
        ropSlope: -0.08,
        dragMean: 22.0,
        formationBaselineDeviation: {
          torquePct: 50.0,
          ropPct: -44.4,
          dragPct: 40.9,
        },
      },
    ];

    const anomalies = anomalyEngine.detectAnomalies(abnormalSample, abnormalFeatures);
    assert(anomalies.length >= 2, 'AnomalyEngine detects multiple corroborated anomalies');
    const torqueAnomaly = anomalies.find((a) => a.parameter === 'TORQUE');
    assert(torqueAnomaly !== undefined, 'AnomalyEngine flags TORQUE anomaly');
    assert(
      torqueAnomaly?.severity === AlertSeverity.CRITICAL || torqueAnomaly?.severity === AlertSeverity.WARNING,
      'TORQUE anomaly categorized as WARNING/CRITICAL'
    );
    assert(torqueAnomaly?.confidence !== undefined && torqueAnomaly.confidence >= 0.8, 'Anomaly returns confidence >= 0.8');
  }

  // --- SECTION 5: MODULAR RISK ENGINES ---
  console.log('\n--- 5. Modular Risk Engines Evaluation ---');
  {
    const sample: RealtimeDrillingSample = {
      wellId: 'OIL-SYN-020',
      timestamp: new Date(),
      measuredDepth: 3215,
      torque: 21.0,
      rop: 12.5,
      drag: 29.0,
      flowIn: 2400,
      flowOut: 2400,
      pitVolume: 120,
      drillingState: DrillingState.DRILLING,
      formationId: 'Formation Gamma',
    };

    const features: RealtimeFeatureData[] = [
      {
        wellId: 'OIL-SYN-020',
        timestamp: new Date(),
        windowSeconds: 60,
        torqueMean: 15.0,
        ropMean: 18.0,
        dragMean: 22.0,
        formationBaselineDeviation: {
          torquePct: 40.0,
          ropPct: -30.5,
          dragPct: 31.8,
        },
      },
    ];

    const mockPrecedents = [
      {
        wellId: 'OIL-SYN-003',
        wellName: 'OIL-SYN-003',
        eventType: 'STUCK_PIPE',
        severity: 'CRITICAL',
        depth: 3211,
        title: 'Differential sticking in Formation Gamma',
        similarityScore: 0.92,
      },
      {
        wellId: 'OIL-SYN-007',
        wellName: 'OIL-SYN-007',
        eventType: 'STUCK_PIPE',
        severity: 'CRITICAL',
        depth: 3208,
        title: 'Mechanically stuck pipe in Formation Gamma',
        similarityScore: 0.88,
      },
    ];

    // Stuck Pipe Engine
    const stuckEngine = new StuckPipeRiskEngine();
    const stuckRisk = stuckEngine.evaluate({
      sample,
      features,
      anomalies: [],
      precedents: mockPrecedents,
    });

    assert(stuckRisk !== null, 'StuckPipeRiskEngine produces RiskAssessmentData');
    assert(stuckRisk?.severity === AlertSeverity.WARNING || stuckRisk?.severity === AlertSeverity.CRITICAL, 'Stuck pipe risk classified as WARNING/CRITICAL');
    assert(stuckRisk?.score !== undefined && stuckRisk.score >= 60, `Stuck pipe risk score elevated (${stuckRisk?.score}/100)`);
    assert(stuckRisk?.contributingFactors.length! >= 3, 'Stuck pipe risk returns contributing factor breakdown');
    assert(
      stuckRisk?.recommendedReview.includes('Review approved stuck-pipe prevention procedure'),
      'Stuck pipe risk produces approved procedure review recommendations'
    );

    // Lost Circulation Engine
    const lostEngine = new LostCirculationRiskEngine();
    const lostSample: RealtimeDrillingSample = {
      ...sample,
      flowIn: 2400,
      flowOut: 1800, // 600 L/min deficit
      pitVolume: 114, // 6 m3 loss
    };
    const lostFeatures: RealtimeFeatureData[] = [
      {
        wellId: 'OIL-SYN-020',
        timestamp: new Date(),
        windowSeconds: 60,
        pitVolumeChange: -6.0,
        flowDifference: -600,
      },
    ];
    const lostRisk = lostEngine.evaluate({
      sample: lostSample,
      features: lostFeatures,
      anomalies: [],
      precedents: [],
    });
    assert(lostRisk !== null, 'LostCirculationRiskEngine produces RiskAssessmentData on flow deficit');
    assert(lostRisk?.score! >= 50, `Lost circulation score elevated (${lostRisk?.score}/100)`);

    // Kick Risk Engine
    const kickEngine = new KickRiskEngine();
    const kickSample: RealtimeDrillingSample = {
      ...sample,
      flowIn: 2400,
      flowOut: 2850, // 450 L/min surge
      pitVolume: 125, // 5 m3 gain
    };
    const kickFeatures: RealtimeFeatureData[] = [
      {
        wellId: 'OIL-SYN-020',
        timestamp: new Date(),
        windowSeconds: 60,
        pitVolumeChange: 5.0,
        flowDifference: 450,
      },
    ];
    const kickRisk = kickEngine.evaluate({
      sample: kickSample,
      features: kickFeatures,
      anomalies: [],
      precedents: [],
    });
    assert(kickRisk !== null, 'KickRiskEngine produces RiskAssessmentData on flow surge');
    assert(kickRisk?.score! >= 50, `Kick risk score elevated (${kickRisk?.score}/100)`);
  }

  // --- SECTION 6: MANDATORY SECTION 55 INSUFFICIENT DATA RULE ---
  console.log('\n--- 6. Mandatory "Insufficient Data" Protection Rule ---');
  {
    const lostEngine = new LostCirculationRiskEngine();
    const missingFlowOutSample: RealtimeDrillingSample = {
      wellId: 'OIL-SYN-020',
      timestamp: new Date(),
      measuredDepth: 3200,
      flowIn: 2400,
      flowOut: null, // SENSOR MISSING!
    };

    const result = lostEngine.evaluate({
      sample: missingFlowOutSample,
      features: [],
      anomalies: [],
    });

    assert(result !== null, 'LostCirculationRiskEngine handles missing flow-out');
    assert(result?.score === 0, 'Risk score is 0 when critical sensor is missing');
    assert(
      result?.signals[0].includes('INSUFFICIENT DATA'),
      'Explicitly outputs "INSUFFICIENT DATA: Flow-out sensor unavailable"'
    );
    assert(
      result?.evidence.reason.includes('Flow-out data unavailable for the current interval'),
      'Strictly adheres to Section 55 requirement without fabricating results'
    );
  }

  // --- SECTION 7: SECTION 73 FALSE POSITIVE ISOLATION TEST ---
  console.log('\n--- 7. False Positive Isolation Test (Section 73) ---');
  {
    // Scenario: Torque increases, BUT ROP remains normal, drag remains normal, and historical precedent is weak
    const singleSignalSample: RealtimeDrillingSample = {
      wellId: 'OIL-SYN-020',
      timestamp: new Date(),
      measuredDepth: 3200,
      torque: 18.5, // mild elevation ~23%
      rop: 18.0, // normal
      drag: 22.0, // normal
      formationId: 'Formation Gamma',
    };

    const singleSignalFeatures: RealtimeFeatureData[] = [
      {
        wellId: 'OIL-SYN-020',
        timestamp: new Date(),
        windowSeconds: 60,
        formationBaselineDeviation: {
          torquePct: 23.3,
          ropPct: 0.0, // perfectly normal
          dragPct: 0.0, // perfectly normal
        },
      },
    ];

    const stuckEngine = new StuckPipeRiskEngine();
    const result = stuckEngine.evaluate({
      sample: singleSignalSample,
      features: singleSignalFeatures,
      anomalies: [],
      precedents: [], // No offset precedents
    });

    // Score must be below CRITICAL / WARNING threshold (<= 35)
    assert(
      result === null || result.severity === AlertSeverity.NORMAL || result.severity === AlertSeverity.WATCH,
      `Isolated single signal does NOT trigger false WARNING/CRITICAL alert (Score: ${result?.score ?? 0})`
    );
    assert(
      (result?.score ?? 0) < 60,
      'Multi-signal corroboration requirement prevents single-sensor false alarm'
    );
  }

  // --- SECTION 8: SYNTHETIC DRILLING SIMULATOR SCENARIOS ---
  console.log('\n--- 8. Synthetic Drilling Simulator Scenario Execution ---');
  {
    const simulator = new SyntheticLiveStreamAdapter();
    await simulator.connect();

    const dispatchedSamples: RealtimeDrillingSample[] = [];
    simulator.onSample((s) => {
      dispatchedSamples.push(s);
    });

    // Start 100x accelerated replay of STUCK_PIPE_PRECURSOR
    const session = simulator.startSimulation('OIL-SYN-020', SimulationScenario.STUCK_PIPE_PRECURSOR, {
      startDepth: 3200,
      endDepth: 3205,
      speedMultiplier: 100,
      intervalSeconds: 1,
      totalSteps: 15,
    });

    assert(session.wellId === 'OIL-SYN-020', 'Simulator session targets OIL-SYN-020');
    assert(session.scenario === SimulationScenario.STUCK_PIPE_PRECURSOR, 'Simulator runs STUCK_PIPE_PRECURSOR scenario');

    // Wait for ticks to process
    await new Promise((resolve) => setTimeout(resolve, 350));

    assert(dispatchedSamples.length >= 2, `Simulator dispatched ${dispatchedSamples.length} telemetry samples`);
    const lastSample = dispatchedSamples[dispatchedSamples.length - 1];
    assert(lastSample.quality === SensorQuality.GOOD, 'Synthetic samples pass physical quality checks');
    assert(lastSample.measuredDepth > 3200, `Depth progressed to ${lastSample.measuredDepth}m`);

    simulator.stopSimulation('OIL-SYN-020');
    await simulator.disconnect();
  }

  // --- SUMMARY ---
  console.log('\n================================================================');
  console.log(`  STAGE 03 VERIFICATION COMPLETE`);
  console.log(`  Total Checks Passed : ${passedTests}`);
  console.log(`  Total Checks Failed : ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runStage03Verification().catch((err) => {
  console.error('Unhandled error during Stage 03 verification:', err);
  process.exit(1);
});
