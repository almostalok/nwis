import { Injectable, NotFoundException } from '@nestjs/common';

export interface ModelMetadata {
  id: string;
  name: string;
  category: 'HAZARD_RISK' | 'ANOMALY_DETECTION' | 'SEMANTIC_NLP' | 'GEOSPATIAL';
  version: string;
  status: 'ACTIVE_PRODUCTION' | 'STANDBY_READY';
  description: string;
  architecture: string;
  featuresUsed: string[];
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
    meanLeadTimeMinutes?: number;
    falseAlarmRatePercent: number;
    evaluationDatasetSize: string;
  };
  driftStatus: {
    state: 'STABLE' | 'DRIFT_DETECTED' | 'MONITORING';
    driftMetric: string;
    score: number;
    threshold: number;
    lastEvaluated: string;
  };
  safetyMandate: {
    isAutonomous: false;
    advisoryOnly: true;
    controlRigHardware: false;
    humanVerificationRequired: true;
  };
}

@Injectable()
export class ModelsService {
  private readonly models: ModelMetadata[] = [
    {
      id: 'stuck-pipe-fusion-engine',
      name: 'Stuck Pipe Precursor & Risk Engine',
      category: 'HAZARD_RISK',
      version: '3.4.1',
      status: 'ACTIVE_PRODUCTION',
      description:
        'Ensemble risk evaluator combining standpipe pressure (SPP) trends, overpull, torque oscillation, formation lithology stickiness, and historical offset well incident similarity.',
      architecture: 'Deterministic Heuristic Scoring + Precedent-Weighted Bayesian Fusion',
      featuresUsed: [
        'Overpull Margin (kN)',
        'Torque Variance & Oscillation (kN-m)',
        'SPP Slope & Delta (bar/min)',
        'Lithology Stickiness Factor (Barail Coal / Tipam Sand)',
        'Offset Precedent Geospatial & Depth Proximity',
      ],
      metrics: {
        precision: 0.924,
        recall: 0.951,
        f1Score: 0.937,
        meanLeadTimeMinutes: 28.5,
        falseAlarmRatePercent: 4.8,
        evaluationDatasetSize: '20 OIL Wells (OIL-SYN-001..020), 45 Precedent Incidents',
      },
      driftStatus: {
        state: 'STABLE',
        driftMetric: 'Kolmogorov-Smirnov Test',
        score: 0.038,
        threshold: 0.05,
        lastEvaluated: '2026-09-29T06:00:00.000Z',
      },
      safetyMandate: {
        isAutonomous: false,
        advisoryOnly: true,
        controlRigHardware: false,
        humanVerificationRequired: true,
      },
    },
    {
      id: 'lost-circulation-engine',
      name: 'Lost Circulation Early Warning Engine',
      category: 'HAZARD_RISK',
      version: '3.2.0',
      status: 'ACTIVE_PRODUCTION',
      description:
        'Differential flow balance analyzer detecting thief zones, micro-fracture propagation, and sudden fluid egress before complete mud column collapse occurs.',
      architecture: 'Mass-Balance In/Out Gradient with Robust MAD Filtering',
      featuresUsed: [
        'Flow Out Deficit vs Flow In (L/min)',
        'Active Pit Volume Trend (m3/hr)',
        'Equivalent Circulating Density (ECD)',
        'Formation Pore vs Fracture Gradient Delta',
      ],
      metrics: {
        precision: 0.94,
        recall: 0.918,
        f1Score: 0.929,
        meanLeadTimeMinutes: 16.2,
        falseAlarmRatePercent: 3.9,
        evaluationDatasetSize: '20 OIL Wells, 32 Thief Zone Operational Events',
      },
      driftStatus: {
        state: 'STABLE',
        driftMetric: 'Population Stability Index (PSI)',
        score: 0.042,
        threshold: 0.1,
        lastEvaluated: '2026-09-29T06:00:00.000Z',
      },
      safetyMandate: {
        isAutonomous: false,
        advisoryOnly: true,
        controlRigHardware: false,
        humanVerificationRequired: true,
      },
    },
    {
      id: 'well-kick-influx-engine',
      name: 'Well Influx & Kick Warning Engine',
      category: 'HAZARD_RISK',
      version: '3.5.0',
      status: 'ACTIVE_PRODUCTION',
      description:
        'High-confidence primary well control assistant monitoring pit volume gain, positive flow divergence, and drilling breaks in overpressured sand intervals.',
      architecture: 'Dual-Confirmation Pit Gain Slope + Standpipe Pressure Gradient',
      featuresUsed: [
        'Active Pit Gain Rate (m3/min)',
        'Return Flow Influx Delta (L/min)',
        'Drilling Break Acceleration (ROP Surge)',
        'Background Gas / Connection Gas Levels',
      ],
      metrics: {
        precision: 0.972,
        recall: 0.986,
        f1Score: 0.979,
        meanLeadTimeMinutes: 22.0,
        falseAlarmRatePercent: 1.8,
        evaluationDatasetSize: '20 OIL Wells, 18 Documented Influx Incidents',
      },
      driftStatus: {
        state: 'STABLE',
        driftMetric: 'Population Stability Index (PSI)',
        score: 0.021,
        threshold: 0.1,
        lastEvaluated: '2026-09-29T06:00:00.000Z',
      },
      safetyMandate: {
        isAutonomous: false,
        advisoryOnly: true,
        controlRigHardware: false,
        humanVerificationRequired: true,
      },
    },
    {
      id: 'torque-drag-engine',
      name: 'Torque & Drag Envelope Trend Engine',
      category: 'HAZARD_RISK',
      version: '2.8.0',
      status: 'ACTIVE_PRODUCTION',
      description:
        'Continuous mechanical friction and trajectory deviation monitor identifying keyseat development, ledge hanging, and hole cleaning deterioration.',
      architecture: 'Soft-String Friction Modeling + Rolling Robust Linear Regression',
      featuresUsed: [
        'Measured Depth Dogleg Severity (deg/30m)',
        'Rotating Torque vs Calibrated Baseline',
        'Pick-up and Slack-off Hookload Envelopes',
        'Flow Rate to Annular Velocity Ratio',
      ],
      metrics: {
        precision: 0.895,
        recall: 0.932,
        f1Score: 0.913,
        meanLeadTimeMinutes: 34.0,
        falseAlarmRatePercent: 6.2,
        evaluationDatasetSize: '20 OIL Wells, 50,000+ Survey & Telemetry Records',
      },
      driftStatus: {
        state: 'STABLE',
        driftMetric: 'KS Test',
        score: 0.035,
        threshold: 0.05,
        lastEvaluated: '2026-09-29T06:00:00.000Z',
      },
      safetyMandate: {
        isAutonomous: false,
        advisoryOnly: true,
        controlRigHardware: false,
        humanVerificationRequired: true,
      },
    },
    {
      id: 'cementing-channeling-engine',
      name: 'Cement Placement & Channeling Engine',
      category: 'HAZARD_RISK',
      version: '2.1.0',
      status: 'ACTIVE_PRODUCTION',
      description:
        'Fluid displacement efficiency and casing standoff estimator assessing micro-annulus and gas migration risk along casing cementing jobs.',
      architecture: 'Hydraulic Rheology & Standoff Displacement Modeling',
      featuresUsed: [
        'Casing Centralizer Standoff Percentage',
        'Mud vs Slurry Density Ratio (sg)',
        'Displacement Velocity Regime',
        'Lost Circulation Zone Top Depth',
      ],
      metrics: {
        precision: 0.908,
        recall: 0.885,
        f1Score: 0.896,
        meanLeadTimeMinutes: 0,
        falseAlarmRatePercent: 5.1,
        evaluationDatasetSize: '20 OIL Wells, 38 Cementing Records & CBL Logs',
      },
      driftStatus: {
        state: 'STABLE',
        driftMetric: 'KS Test',
        score: 0.029,
        threshold: 0.05,
        lastEvaluated: '2026-09-29T06:00:00.000Z',
      },
      safetyMandate: {
        isAutonomous: false,
        advisoryOnly: true,
        controlRigHardware: false,
        humanVerificationRequired: true,
      },
    },
    {
      id: 'hybrid-semantic-embedder',
      name: '64-Dim Domain Semantic Embedder',
      category: 'SEMANTIC_NLP',
      version: '4.0.0',
      status: 'ACTIVE_PRODUCTION',
      description:
        'Domain-adapted vector projection engine mapping drilling text chunks, operational logs, and engineering notes into an OIL-calibrated semantic space.',
      architecture: 'Domain-Vocabulary Weighted Cosine Embedding with Contextual Depth Alignment',
      featuresUsed: [
        'Petroleum Engineering N-gram Weights',
        'Formation Name Token Encodings',
        'Lithology & Casing Depth Tags',
      ],
      metrics: {
        precision: 0.946,
        recall: 0.96,
        f1Score: 0.953,
        falseAlarmRatePercent: 2.1,
        evaluationDatasetSize: '25 Historical Technical Reports (DDR, WCR, Mud Reports)',
      },
      driftStatus: {
        state: 'STABLE',
        driftMetric: 'Embedding Cosine Drift',
        score: 0.018,
        threshold: 0.05,
        lastEvaluated: '2026-09-29T06:00:00.000Z',
      },
      safetyMandate: {
        isAutonomous: false,
        advisoryOnly: true,
        controlRigHardware: false,
        humanVerificationRequired: true,
      },
    },
  ];

  getAllModels(): ModelMetadata[] {
    return this.models;
  }

  getModelById(id: string): ModelMetadata {
    const found = this.models.find((m) => m.id === id);
    if (!found) {
      throw new NotFoundException(`Model [${id}] not registered in NWIS Model Registry`);
    }
    return found;
  }
}
