import { QualityStatus } from './enums';

export interface DrillingParameterSample {
  id: string;
  wellId: string;
  timestamp: Date | string;
  measuredDepth: number; // in meters canonical
  rop?: number | null; // Rate of Penetration (m/h)
  wob?: number | null; // Weight on Bit (kN or klbs canonical)
  rpm?: number | null; // Rotary RPM
  torque?: number | null; // Torque (kN.m)
  hookLoad?: number | null; // Hook Load (kN)
  standpipePressure?: number | null; // Standpipe Pressure (bar)
  flowRate?: number | null; // Flow Rate (lpm)
  blockPosition?: number | null; // Block Position (m)
  blockSpeed?: number | null; // Block Speed (m/s)
  additionalTags?: Record<string, number | string | boolean> | null; // Extensible tags
  qualityStatus?: QualityStatus;
  createdAt?: Date | string;
}

export interface CreateDrillingParameterSampleDto {
  timestamp: string;
  measuredDepth: number;
  rop?: number | null;
  wob?: number | null;
  rpm?: number | null;
  torque?: number | null;
  hookLoad?: number | null;
  standpipePressure?: number | null;
  flowRate?: number | null;
  blockPosition?: number | null;
  blockSpeed?: number | null;
  additionalTags?: Record<string, number | string | boolean> | null;
  qualityStatus?: QualityStatus;
}
