import { EventSeverity, EventType, QualityStatus } from './enums';

export interface SimilarityWeights {
  spatialWeight: number;      // default: 0.20
  formationWeight: number;    // default: 0.30
  depthWeight: number;        // default: 0.20
  trajectoryWeight: number;   // default: 0.10
  operationalWeight: number;  // default: 0.10
  reservoirWeight: number;    // default: 0.10
}

export interface SimilarityBreakdown {
  spatial: number;       // 0 - 1
  formation: number;     // 0 - 1
  depth: number;         // 0 - 1
  trajectory: number;    // 0 - 1
  operational: number;   // 0 - 1
  reservoir: number;     // 0 - 1
}

export interface WellSimilarityScore {
  targetWellId: string;
  candidateWellId: string;
  candidateWellName: string;
  distanceKm: number;
  overallSimilarity: number; // 0 - 1 (or 0 - 100%)
  breakdown: SimilarityBreakdown;
  sharedFormations: string[];
  depthOverlapMeters: number;
  explanation: string[];
}

export interface CrossWellComparison {
  wellA: {
    id: string;
    wellId: string;
    name: string;
    totalDepth: number;
    formations: string[];
    eventCount: number;
    nptHours: number;
  };
  wellB: {
    id: string;
    wellId: string;
    name: string;
    totalDepth: number;
    formations: string[];
    eventCount: number;
    nptHours: number;
  };
  distanceKm: number;
  similarityScore: number;
  similarityBreakdown: SimilarityBreakdown;
  formationOverlap: {
    shared: string[];
    uniqueToA: string[];
    uniqueToB: string[];
  };
  depthCorrelation: {
    depthOverlapMeters: number;
    correlationRatio: number;
  };
  historicalEventsComparison: {
    eventsA: any[];
    eventsB: any[];
    sharedEventTypes: EventType[];
  };
  explanations: string[];
}

export interface PrecedentQueryDto {
  wellId?: string;
  targetDepth: number;
  formationName?: string;
  radiusKm?: number;
  parameters?: {
    torque?: number;
    rop?: number;
    wob?: number;
    rpm?: number;
    standpipePressure?: number;
  };
}

export interface PrecedentEvidenceItem {
  id: string;
  documentTitle: string;
  fileName: string;
  pageNumber: number;
  textExcerpt: string;
  confidence: number;
}

export interface DetectedPrecedent {
  id: string;
  wellId: string;
  wellName: string;
  distanceKm: number;
  similarityScore: number;
  eventType: EventType;
  severity: EventSeverity;
  depth: number;
  formation: string;
  precedingIndicators: string[];
  description: string;
  rootCause?: string | null;
  mitigation?: string | null;
  outcome?: string | null;
  evidence: PrecedentEvidenceItem[];
  relevanceExplanation: string[];
}

export interface PrecedentDetectionResult {
  currentContext: {
    wellId?: string;
    targetDepth: number;
    formation: string;
    observedIndicators?: string[];
  };
  detectedCount: number;
  precedents: DetectedPrecedent[];
  summary: string;
}

export interface HybridSearchQueryDto {
  query: string;
  wellId?: string;
  radiusKm?: number;
  formation?: string;
  depth?: number;
  eventType?: EventType;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  entityType: 'EVENT' | 'CHUNK' | 'DOCUMENT';
  relevanceScore: number;
  wellId?: string | null;
  wellName?: string | null;
  formation?: string | null;
  depth?: number | null;
  title: string;
  snippet: string;
  sourceDocument?: string | null;
  pageNumber?: number | null;
  highlights?: string[];
  metadata?: Record<string, any> | null;
}

export interface HybridSearchResult {
  query: string;
  totalFound: number;
  results: SearchResultItem[];
  appliedFilters: {
    wellId?: string;
    radiusKm?: number;
    formation?: string;
    depth?: number;
    eventType?: string;
  };
}

export interface RAGQueryDto {
  question: string;
  currentWellId?: string;
  currentDepth?: number;
  currentFormation?: string;
}

export interface RAGEvidenceSource {
  documentTitle: string;
  fileName: string;
  pageNumber: number;
  excerpt: string;
  wellId?: string;
  wellName?: string;
}

export interface RAGResponse {
  answer: string;
  grounded: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceSources: RAGEvidenceSource[];
  relatedPrecedents?: DetectedPrecedent[];
  reasoning: string[];
}

export interface WellIntelligenceSummary {
  wellId: string;
  wellName: string;
  field: string;
  totalDepth: number;
  formations: string[];
  majorEvents: {
    eventType: EventType;
    count: number;
  }[];
  riskIntervals: {
    startDepth: number;
    endDepth: number;
    formation: string;
    riskFactor: string;
    severity: EventSeverity;
  }[];
  documentCount: number;
  comparableWellsCount: number;
}
