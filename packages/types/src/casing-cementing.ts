export interface CasingSection {
  id: string;
  wellId: string;
  section: string; // e.g., "SURFACE", "INTERMEDIATE", "PRODUCTION", "LINER"
  casingSize: number; // inches, e.g. 13.375, 9.625, 7.0
  settingDepth: number; // meters canonical
  topDepth: number;
  bottomDepth: number;
  grade?: string | null; // e.g. "L-80", "P-110"
  weight?: number | null; // lb/ft
  cementTop?: number | null;
  cementBottom?: number | null;
  sourceDocumentId?: string | null;
  createdAt?: Date | string;
}

export interface CementingJob {
  id: string;
  wellId: string;
  casingId?: string | null;
  jobDate?: Date | string | null;
  topDepth: number;
  bottomDepth: number;
  cementVolume?: number | null; // m3
  cementDensity?: number | null; // specific gravity (sg)
  slurryType?: string | null; // e.g. "Class G neat", "Thixotropic"
  displacementVolume?: number | null;
  jobStatus: string; // SUCCESS, PARTIAL_RETURNS, TOC_REVISED, REMEDIAL_REQUIRED
  remarks?: string | null;
  sourceDocumentId?: string | null;
  createdAt?: Date | string;
}
