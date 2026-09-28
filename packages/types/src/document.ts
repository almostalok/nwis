import { DocumentProcessingStatus, DocumentType } from './enums';

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
  checksum?: string | null;
  sourceSystem?: string | null;
  metadata?: Record<string, any> | null;
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
  checksum?: string | null;
  sourceSystem?: string | null;
  metadata?: Record<string, any> | null;
}
