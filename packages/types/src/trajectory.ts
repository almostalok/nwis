export interface WellTrajectoryPoint {
  id: string;
  wellId: string;
  measuredDepth: number; // in meters canonical
  trueVerticalDepth: number; // in meters canonical
  inclination: number; // degrees (0 - 180)
  azimuth: number; // degrees (0 - 360)
  latitude?: number | null;
  longitude?: number | null;
  northing?: number | null;
  easting?: number | null;
  dogLegSeverity?: number | null; // deg/30m
  timestamp?: Date | string | null;
  createdAt?: Date | string;
}

export interface CreateTrajectoryPointDto {
  measuredDepth: number;
  trueVerticalDepth: number;
  inclination: number;
  azimuth: number;
  latitude?: number | null;
  longitude?: number | null;
  northing?: number | null;
  easting?: number | null;
  dogLegSeverity?: number | null;
  timestamp?: string | null;
}
