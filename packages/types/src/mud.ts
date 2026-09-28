import { QualityStatus } from './enums';

export interface MudSample {
  id: string;
  wellId: string;
  timestamp: Date | string;
  measuredDepth: number; // in meters canonical
  mudWeight?: number | null; // specific gravity (sg) canonical (e.g. 1.15)
  plasticViscosity?: number | null; // cP
  yieldPoint?: number | null; // lb/100ft2
  funnelViscosity?: number | null; // sec/qt
  fluidLoss?: number | null; // ml/30min
  ph?: number | null;
  chlorides?: number | null; // mg/l
  solids?: number | null; // % vol
  flowRate?: number | null; // lpm
  pitVolume?: number | null; // m3
  gasReading?: number | null; // units or %
  additionalProperties?: Record<string, number | string | boolean> | null;
  qualityStatus?: QualityStatus;
  createdAt?: Date | string;
}

export interface CreateMudSampleDto {
  timestamp: string;
  measuredDepth: number;
  mudWeight?: number | null;
  plasticViscosity?: number | null;
  yieldPoint?: number | null;
  funnelViscosity?: number | null;
  fluidLoss?: number | null;
  ph?: number | null;
  chlorides?: number | null;
  solids?: number | null;
  flowRate?: number | null;
  pitVolume?: number | null;
  gasReading?: number | null;
  additionalProperties?: Record<string, number | string | boolean> | null;
  qualityStatus?: QualityStatus;
}
