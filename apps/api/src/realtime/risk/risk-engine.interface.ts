import {
  RealtimeDrillingSample,
  RealtimeFeatureData,
  AnomalyData,
  RiskAssessmentData,
  RiskType,
} from '@nwis/types';

export interface RiskEvaluationContext {
  sample: RealtimeDrillingSample;
  features: RealtimeFeatureData[];
  anomalies: AnomalyData[];
  precedents?: any[];
  similarWells?: any[];
}

export interface RiskEngine {
  readonly riskType: RiskType;
  evaluate(context: RiskEvaluationContext): RiskAssessmentData | null;
}
