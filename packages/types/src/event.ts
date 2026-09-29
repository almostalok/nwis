import { EventSeverity, EventType, QualityStatus } from './enums';

export interface OperationalEvent {
  id: string;
  wellId: string;
  eventType: EventType;
  severity: EventSeverity;
  startDepth: number; // in meters canonical
  endDepth?: number | null; // in meters canonical
  startTime?: Date | string | null;
  endTime?: Date | string | null;
  formationId?: string | null;
  description: string;
  rootCause?: string | null;
  mitigation?: string | null;
  outcome?: string | null;
  confidence: number; // 0.0 - 1.0

  // Provenance fields
  sourceDocumentId?: string | null;
  sourcePage?: number | null;
  sourceLocation?: string | null;
  extractionMethod?: string | null; // MANUAL, HEURISTIC, LLM_PIPELINE
  extractionConfidence?: number | null;
  verifiedBy?: string | null;
  verifiedAt?: Date | string | null;

  // Quality metadata
  qualityStatus: QualityStatus;
  qualityScore: number;

  // Stage 02 Intelligence & Precedent fields
  precedingIndicators?: string[] | null;
  problemDescription?: string | null;
  mitigationAction?: string | null;
  lessonsLearned?: string | null;
  dedupKey?: string | null;
  evidence?: any[];

  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateOperationalEventDto {
  wellId: string;
  eventType: EventType;
  severity: EventSeverity;
  startDepth: number;
  endDepth?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  formationId?: string | null;
  description: string;
  rootCause?: string | null;
  mitigation?: string | null;
  outcome?: string | null;
  confidence?: number;
  sourceDocumentId?: string | null;
  sourcePage?: number | null;
  sourceLocation?: string | null;
  extractionMethod?: string | null;
  extractionConfidence?: number | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  qualityStatus?: QualityStatus;
  qualityScore?: number;
  precedingIndicators?: string[] | null;
  problemDescription?: string | null;
  mitigationAction?: string | null;
  lessonsLearned?: string | null;
  dedupKey?: string | null;
}

export interface DepthEventsQueryDto {
  formation?: string;
  minDepth?: number;
  maxDepth?: number;
  eventType?: EventType;
  severity?: EventSeverity;
  limit?: number;
  offset?: number;
}

export interface NearDepthQueryDto {
  targetDepth: number;
  toleranceMeters?: number; // default +/- 50m
  formation?: string;
  eventType?: EventType;
  excludeWellId?: string;
}
