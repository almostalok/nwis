import { AuditAction } from './enums';

export interface AuditLogRecord {
  id: string;
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  timestamp: Date | string;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface CreateAuditLogDto {
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}
