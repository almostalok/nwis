import { WellStatus, WellType, QualityStatus } from './enums';

export interface Well {
  id: string;
  wellId: string;
  name: string;
  field: string;
  operator: string;
  wellType: WellType;
  status: WellStatus;
  spudDate?: Date | string | null;
  completionDate?: Date | string | null;
  totalDepth: number; // in meters canonical
  latitude: number;
  longitude: number;
  qualityStatus: QualityStatus;
  qualityScore: number;
  sourceId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateWellDto {
  wellId: string;
  name: string;
  field: string;
  operator?: string;
  wellType: WellType;
  status: WellStatus;
  spudDate?: string | null;
  completionDate?: string | null;
  totalDepth: number;
  latitude: number;
  longitude: number;
  qualityStatus?: QualityStatus;
  qualityScore?: number;
  sourceId?: string | null;
}

export interface NearbyWellsQueryDto {
  latitude: number;
  longitude: number;
  radiusKm: number;
  formation?: string;
  status?: WellStatus;
  wellType?: WellType;
  limit?: number;
}

export interface NearbyWellResult {
  id: string;
  wellId: string;
  name: string;
  field: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  totalDepth: number;
  status: WellStatus;
  wellType: WellType;
  formationSummary: string[];
  eventCount: number;
}
