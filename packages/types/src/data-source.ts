import { DataSourceType } from './enums';

export interface DataSourceRecord {
  id: string;
  name: string;
  type: DataSourceType;
  description?: string | null;
  version?: string | null;
  connectionType?: string | null;
  active: boolean;
  metadata?: Record<string, any> | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateDataSourceDto {
  name: string;
  type: DataSourceType;
  description?: string | null;
  version?: string | null;
  connectionType?: string | null;
  active?: boolean;
  metadata?: Record<string, any> | null;
}
