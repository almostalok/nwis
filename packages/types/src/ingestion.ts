import { DataSourceType, QualityStatus } from './enums';

export interface IngestionJob {
  id: string;
  sourceType: DataSourceType;
  sourceIdentifier: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
  totalRecords: number;
  processedRecords: number;
  validRecords: number;
  invalidRecords: number;
  errors: IngestionError[];
  startedAt: Date | string;
  completedAt?: Date | string | null;
  metadata?: Record<string, any>;
}

export interface IngestionError {
  rowNumber?: number;
  recordIdentifier?: string;
  field?: string;
  message: string;
  rawData?: any;
  severity: 'WARNING' | 'ERROR';
}

export interface IngestionResult<T = any> {
  success: boolean;
  jobId: string;
  processedCount: number;
  validCount: number;
  errorCount: number;
  errors: IngestionError[];
  data?: T[];
}

export interface RawDatasetBatch {
  sourceName: string;
  sourceType: DataSourceType;
  entityType: 'WELL' | 'TRAJECTORY' | 'FORMATION' | 'DRILLING_SAMPLE' | 'MUD_SAMPLE' | 'EVENT' | 'CASING' | 'CEMENTING';
  rawPayload: any;
  metadata?: Record<string, any>;
}
