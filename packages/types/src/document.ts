import { DocumentProcessingStatus, DocumentType } from './enums';

export interface DocumentChunkRecord {
  id: string;
  documentId: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
  section?: string | null;
  startOffset?: number | null;
  endOffset?: number | null;
  tokenCount?: number | null;
  embedding?: number[] | null;
  metadata?: Record<string, any> | null;
  createdAt: Date | string;
}

export interface HistoricalEventEvidenceRecord {
  id: string;
  eventId: string;
  documentId: string;
  pageNumber: number;
  textExcerpt: string;
  confidence: number;
  createdAt: Date | string;
  documentTitle?: string;
  fileName?: string;
}

export interface ExtractedEntityRecord {
  id: string;
  documentId: string;
  entityType: string;
  value: string;
  normalizedValue?: string | null;
  confidence: number;
  pageNumber: number;
  textSpan?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date | string;
}

export interface DocumentRecord {
  id: string;
  wellId?: string | null;
  documentType: DocumentType;
  title: string;
  fileName: string;
  mimeType: string;
  storagePath: string;
  documentDate?: Date | string | null;
  pageCount?: number | null;
  processingStatus: DocumentProcessingStatus;
  extractionStatus?: string | null;
  ocrConfidence?: number | null;
  checksum?: string | null;
  sourceSystem?: string | null;
  metadata?: Record<string, any> | null;
  chunks?: DocumentChunkRecord[];
  evidence?: HistoricalEventEvidenceRecord[];
  extractedEntities?: ExtractedEntityRecord[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateDocumentDto {
  wellId?: string | null;
  documentType: DocumentType;
  title: string;
  fileName: string;
  mimeType: string;
  storagePath: string;
  documentDate?: string | null;
  pageCount?: number | null;
  processingStatus?: DocumentProcessingStatus;
  extractionStatus?: string | null;
  ocrConfidence?: number | null;
  checksum?: string | null;
  sourceSystem?: string | null;
  metadata?: Record<string, any> | null;
}
