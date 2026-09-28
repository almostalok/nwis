import { QualityStatus } from './enums';

export interface FormationInterval {
  id: string;
  wellId: string;
  formationName: string;
  topDepth: number; // in meters canonical
  bottomDepth: number; // in meters canonical
  topTVD?: number | null;
  bottomTVD?: number | null;
  lithology: string; // e.g. Sandstone, Shale, Claystone, Limestone
  reservoir: boolean;
  confidence: number; // 0.0 - 1.0
  sourceId?: string | null;
  qualityStatus: QualityStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateFormationIntervalDto {
  formationName: string;
  topDepth: number;
  bottomDepth: number;
  topTVD?: number | null;
  bottomTVD?: number | null;
  lithology: string;
  reservoir?: boolean;
  confidence?: number;
  sourceId?: string | null;
  qualityStatus?: QualityStatus;
}
