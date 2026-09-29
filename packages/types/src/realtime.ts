import {
  SensorQuality,
  AlertSeverity,
  AlertStatus,
  DrillingState,
  RiskType,
  SimulationScenario,
  SimulationState,
} from './enums';

export interface RealtimeDrillingSample {
  id?: string;
  wellId: string;
  timestamp: string | Date;
  measuredDepth: number;
  trueVerticalDepth?: number | null;
  formationId?: string | null;
  rop?: number | null;
  wob?: number | null;
  rpm?: number | null;
  torque?: number | null;
  hookload?: number | null;
  blockPosition?: number | null;
  blockVelocity?: number | null;
  standpipePressure?: number | null;
  annularPressure?: number | null;
  flowIn?: number | null;
  flowOut?: number | null;
  pumpRate?: number | null;
  pitVolume?: number | null;
  mudWeightIn?: number | null;
  mudWeightOut?: number | null;
  mudTemperature?: number | null;
  ecd?: number | null;
  drag?: number | null;
  bitDepth?: number | null;
  bitSize?: number | null;
  pumpPressure?: number | null;
  connectionState?: string | null;
  rotaryState?: string | null;
  circulationState?: string | null;
  drillingState?: DrillingState;
  source?: string;
  quality?: SensorQuality;
  qualityIssues?: string[] | null;
  createdAt?: string | Date;
}

export interface RealtimeFeatureData {
  id?: string;
  wellId: string;
  timestamp: string | Date;
  windowSeconds: number;
  torqueMean?: number | null;
  torqueStd?: number | null;
  torqueSlope?: number | null;
  torqueZScore?: number | null;
  torqueRobustZ?: number | null;
  ropMean?: number | null;
  ropSlope?: number | null;
  ropZScore?: number | null;
  dragMean?: number | null;
  dragSlope?: number | null;
  sppMean?: number | null;
  sppSlope?: number | null;
  flowDifference?: number | null;
  pitVolumeChange?: number | null;
  mudWeightChange?: number | null;
  wobNormalized?: number | null;
  rpmNormalized?: number | null;
  connectionVsDrilling?: string | null;
  formationBaselineDeviation?: Record<string, number> | null;
  rawFeatures?: Record<string, any> | null;
}

export interface AnomalyData {
  id?: string;
  wellId: string;
  timestamp: string | Date;
  depth: number;
  formation?: string | null;
  parameter: string; // TORQUE, ROP, DRAG, FLOW_OUT, SPP
  observedValue: number;
  expectedValue: number;
  deviation: number; // percentage or normalized difference
  severity: AlertSeverity;
  method: string; // ROLLING_Z_SCORE, ROBUST_Z, TREND_SLOPE, MULTIVARIATE_RULE
  confidence: number;
  evidence?: any;
}

export interface ContributingFactor {
  factor: string;
  weight: number;
  contribution: number;
  description: string;
}

export interface RiskAssessmentData {
  id?: string;
  wellId: string;
  riskType: RiskType;
  score: number; // 0-100 Decision support risk score
  severity: AlertSeverity;
  confidence: number; // 0.0 - 1.0 confidence in available evidence
  depth: number;
  formation?: string | null;
  signals: string[];
  evidence: Record<string, any>;
  contributingFactors: ContributingFactor[];
  historicalContext?: {
    precedentCount: number;
    similarWells: string[];
    topPrecedentEvents?: any[];
  } | null;
  recommendedReview: string;
  modelVersion?: string;
  featureVersion?: string;
  timestamp?: string | Date;
}

export interface HistoricalEvidenceItem {
  wellId: string;
  wellName?: string;
  formationName?: string;
  depth: number;
  eventType: string;
  severity?: string;
  similarityScore: number;
  sourceDocument?: string;
  documentType?: string;
  pageNumber?: number;
  summary?: string;
}

export interface AlertData {
  id: string;
  wellId: string;
  riskType: RiskType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  score: number;
  confidence: number;
  detectedAt: string | Date;
  detectedDepth: number;
  formationId?: string | null;
  triggerSignals: string[];
  historicalEvidence?: HistoricalEvidenceItem[] | null;
  sourceEvidence?: Record<string, any> | null;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | Date | null;
  resolvedBy?: string | null;
  resolvedAt?: string | Date | null;
  resolutionNote?: string | null;
  dismissedBy?: string | null;
  dismissedAt?: string | Date | null;
  dismissalReason?: string | null;
  peakScore: number;
  lastTriggeredAt: string | Date;
  modelVersion: string;
  featureVersion: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AlertEventData {
  id: string;
  alertId: string;
  action: string;
  actor: string;
  previousState?: string | null;
  newState: string;
  score?: number | null;
  reason?: string | null;
  metadata?: any;
  timestamp: string | Date;
}

export interface ContextSnapshotData {
  id?: string;
  alertId?: string | null;
  wellId: string;
  timestamp: string | Date;
  depth: number;
  formation?: string | null;
  drillingState: string;
  currentParameters: Record<string, any>;
  recentFeatures: Record<string, any>;
  activeAnomalies: AnomalyData[];
  activeRisks: RiskAssessmentData[];
  similarWells: any[];
  historicalPrecedents: any[];
  sourceDocuments: any[];
  modelVersion: string;
  configVersion: string;
}

export interface SimulationConfig {
  wellId: string;
  scenario: SimulationScenario;
  startDepth?: number;
  endDepth?: number;
  intervalSeconds?: number;
  speedMultiplier?: number;
}

export interface SimulationStatus {
  sessionId?: string;
  wellId: string;
  scenario: SimulationScenario;
  state: SimulationState;
  startDepth: number;
  currentDepth: number;
  endDepth: number;
  intervalSeconds: number;
  speedMultiplier: number;
  stepIndex: number;
  totalSteps: number;
  startedAt?: string | Date;
  completedAt?: string | Date | null;
}

export interface SensorQualityStatus {
  parameter: string;
  quality: SensorQuality;
  lastValue?: number | null;
  lastTimestamp?: string | Date;
  statusMessage?: string;
}

export interface StreamPayload {
  type:
    | 'drilling.sample'
    | 'drilling.feature.updated'
    | 'anomaly.detected'
    | 'risk.updated'
    | 'alert.created'
    | 'alert.updated'
    | 'alert.resolved'
    | 'context.updated'
    | 'simulation.started'
    | 'simulation.stopped'
    | 'simulation.paused'
    | 'simulation.resumed'
    | 'stream.status';
  wellId: string;
  timestamp: string | Date;
  data: any;
}
