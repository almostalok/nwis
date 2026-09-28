import { QualityStatus } from './enums';

export interface DataQualityMetadata {
  qualityStatus: QualityStatus;
  qualityScore: number; // 0.0 - 1.0
  validationStatus: string;
  source: string;
  confidence: number;
  anomalyFlags?: string[];
  lastAssessedAt?: Date | string;
}

export interface DataQualityReport {
  overallScore: number;
  totalRecords: number;
  statusBreakdown: Record<QualityStatus, number>;
  anomaliesCount: number;
  wellsEvaluated: number;
  formationsEvaluated: number;
  eventsEvaluated: number;
  samplesEvaluated: number;
  recentFlags: Array<{
    entityType: string;
    entityId: string;
    field: string;
    issue: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
}
