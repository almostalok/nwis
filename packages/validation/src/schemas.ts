import { z } from 'zod';
import {
  AuditAction,
  DataSourceType,
  DocumentProcessingStatus,
  DocumentType,
  EventSeverity,
  EventType,
  QualityStatus,
  UserRole,
  WellStatus,
  WellType,
} from '@nwis/types';

// ================= WELL SCHEMAS =================
export const createWellSchema = z.object({
  wellId: z.string().min(3).max(64).regex(/^[A-Za-z0-9_-]+$/, 'Well ID must contain only alphanumeric characters, dashes, and underscores'),
  name: z.string().min(2).max(128),
  field: z.string().min(2).max(128),
  operator: z.string().min(2).max(128).default('Oil India Limited (Synthetic)'),
  wellType: z.nativeEnum(WellType),
  status: z.nativeEnum(WellStatus),
  spudDate: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
  completionDate: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
  totalDepth: z.number().positive('Total depth must be greater than 0'),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  qualityStatus: z.nativeEnum(QualityStatus).default(QualityStatus.VALID),
  qualityScore: z.number().min(0).max(1).default(1.0),
  sourceId: z.string().uuid().nullable().optional(),
});

export const nearbyWellsQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(500, 'Radius cannot exceed 500 km'),
  formation: z.string().optional(),
  status: z.nativeEnum(WellStatus).optional(),
  wellType: z.nativeEnum(WellType).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ================= TRAJECTORY SCHEMAS =================
export const createTrajectoryPointSchema = z.object({
  measuredDepth: z.number().min(0, 'Measured depth cannot be negative'),
  trueVerticalDepth: z.number().min(0, 'TVD cannot be negative'),
  inclination: z.number().min(0).max(180, 'Inclination must be between 0 and 180 degrees'),
  azimuth: z.number().min(0).max(360, 'Azimuth must be between 0 and 360 degrees'),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  northing: z.number().nullable().optional(),
  easting: z.number().nullable().optional(),
  dogLegSeverity: z.number().min(0).nullable().optional(),
  timestamp: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
});

// ================= FORMATION SCHEMAS =================
export const createFormationIntervalSchema = z
  .object({
    formationName: z.string().min(1).max(128),
    topDepth: z.number().min(0, 'Top depth cannot be negative'),
    bottomDepth: z.number().min(0, 'Bottom depth cannot be negative'),
    topTVD: z.number().min(0).nullable().optional(),
    bottomTVD: z.number().min(0).nullable().optional(),
    lithology: z.string().min(1).max(128),
    reservoir: z.boolean().default(false),
    confidence: z.number().min(0).max(1).default(1.0),
    sourceId: z.string().uuid().nullable().optional(),
    qualityStatus: z.nativeEnum(QualityStatus).default(QualityStatus.VALID),
  })
  .refine((data) => data.bottomDepth > data.topDepth, {
    message: 'Bottom depth must be strictly greater than top depth',
    path: ['bottomDepth'],
  });

// ================= DRILLING PARAMETER SCHEMAS =================
export const createDrillingParameterSampleSchema = z.object({
  timestamp: z.string().datetime({ offset: true }),
  measuredDepth: z.number().min(0, 'Measured depth cannot be negative'),
  rop: z.number().min(0, 'ROP cannot be negative').nullable().optional(),
  wob: z.number().min(0, 'WOB cannot be negative').nullable().optional(),
  rpm: z.number().min(0, 'RPM cannot be negative').nullable().optional(),
  torque: z.number().min(0, 'Torque cannot be negative').nullable().optional(),
  hookLoad: z.number().min(0, 'Hook load cannot be negative').nullable().optional(),
  standpipePressure: z.number().min(0, 'Standpipe pressure cannot be negative').nullable().optional(),
  flowRate: z.number().min(0, 'Flow rate cannot be negative').nullable().optional(),
  blockPosition: z.number().nullable().optional(),
  blockSpeed: z.number().nullable().optional(),
  additionalTags: z.record(z.union([z.number(), z.string(), z.boolean()])).nullable().optional(),
  qualityStatus: z.nativeEnum(QualityStatus).default(QualityStatus.VALID),
});

// ================= MUD SAMPLE SCHEMAS =================
export const createMudSampleSchema = z.object({
  timestamp: z.string().datetime({ offset: true }),
  measuredDepth: z.number().min(0, 'Measured depth cannot be negative'),
  mudWeight: z.number().positive('Mud weight must be positive').nullable().optional(),
  plasticViscosity: z.number().min(0).nullable().optional(),
  yieldPoint: z.number().min(0).nullable().optional(),
  funnelViscosity: z.number().min(0).nullable().optional(),
  fluidLoss: z.number().min(0).nullable().optional(),
  ph: z.number().min(0).max(14).nullable().optional(),
  chlorides: z.number().min(0).nullable().optional(),
  solids: z.number().min(0).max(100).nullable().optional(),
  flowRate: z.number().min(0).nullable().optional(),
  pitVolume: z.number().min(0).nullable().optional(),
  gasReading: z.number().min(0).nullable().optional(),
  additionalProperties: z.record(z.union([z.number(), z.string(), z.boolean()])).nullable().optional(),
  qualityStatus: z.nativeEnum(QualityStatus).default(QualityStatus.VALID),
});

// ================= OPERATIONAL EVENT SCHEMAS =================
export const createOperationalEventSchema = z
  .object({
    wellId: z.string().uuid('Invalid well UUID'),
    eventType: z.nativeEnum(EventType),
    severity: z.nativeEnum(EventSeverity),
    startDepth: z.number().min(0, 'Start depth cannot be negative'),
    endDepth: z.number().min(0).nullable().optional(),
    startTime: z.string().datetime({ offset: true }).nullable().optional(),
    endTime: z.string().datetime({ offset: true }).nullable().optional(),
    formationId: z.string().uuid().nullable().optional(),
    description: z.string().min(5, 'Event description must be at least 5 characters'),
    rootCause: z.string().nullable().optional(),
    mitigation: z.string().nullable().optional(),
    outcome: z.string().nullable().optional(),
    confidence: z.number().min(0).max(1).default(1.0),
    sourceDocumentId: z.string().uuid().nullable().optional(),
    sourcePage: z.number().int().positive().nullable().optional(),
    sourceLocation: z.string().nullable().optional(),
    extractionMethod: z.string().nullable().optional(),
    extractionConfidence: z.number().min(0).max(1).nullable().optional(),
    verifiedBy: z.string().nullable().optional(),
    verifiedAt: z.string().datetime({ offset: true }).nullable().optional(),
    qualityStatus: z.nativeEnum(QualityStatus).default(QualityStatus.VALID),
    qualityScore: z.number().min(0).max(1).default(1.0),
  })
  .refine((data) => !data.endDepth || data.endDepth >= data.startDepth, {
    message: 'End depth must be greater than or equal to start depth',
    path: ['endDepth'],
  });

export const depthEventsQuerySchema = z.object({
  formation: z.string().optional(),
  minDepth: z.coerce.number().min(0).optional(),
  maxDepth: z.coerce.number().min(0).optional(),
  eventType: z.nativeEnum(EventType).optional(),
  severity: z.nativeEnum(EventSeverity).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const nearDepthQuerySchema = z.object({
  targetDepth: z.coerce.number().min(0, 'Target depth must be positive'),
  toleranceMeters: z.coerce.number().positive().default(50),
  formation: z.string().optional(),
  eventType: z.nativeEnum(EventType).optional(),
  excludeWellId: z.string().uuid().optional(),
});

// ================= CASING & CEMENTING SCHEMAS =================
export const createCasingSectionSchema = z
  .object({
    wellId: z.string().uuid(),
    section: z.string().min(1).max(64),
    casingSize: z.number().positive('Casing size must be positive'),
    settingDepth: z.number().positive('Setting depth must be positive'),
    topDepth: z.number().min(0),
    bottomDepth: z.number().min(0),
    grade: z.string().nullable().optional(),
    weight: z.number().positive().nullable().optional(),
    cementTop: z.number().min(0).nullable().optional(),
    cementBottom: z.number().min(0).nullable().optional(),
    sourceDocumentId: z.string().uuid().nullable().optional(),
  })
  .refine((data) => data.bottomDepth >= data.topDepth, {
    message: 'Bottom depth must be greater than or equal to top depth',
    path: ['bottomDepth'],
  });

export const createCementingJobSchema = z.object({
  wellId: z.string().uuid(),
  casingId: z.string().uuid().nullable().optional(),
  jobDate: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
  topDepth: z.number().min(0),
  bottomDepth: z.number().min(0),
  cementVolume: z.number().positive().nullable().optional(),
  cementDensity: z.number().positive().nullable().optional(),
  slurryType: z.string().nullable().optional(),
  displacementVolume: z.number().positive().nullable().optional(),
  jobStatus: z.string().default('SUCCESS'),
  remarks: z.string().nullable().optional(),
  sourceDocumentId: z.string().uuid().nullable().optional(),
});

// ================= AUTH SCHEMAS =================
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ================= INGESTION SCHEMAS =================
export const ingestionImportSchema = z.object({
  sourceName: z.string().min(1),
  sourceType: z.nativeEnum(DataSourceType),
  entityType: z.enum([
    'WELL',
    'TRAJECTORY',
    'FORMATION',
    'DRILLING_SAMPLE',
    'MUD_SAMPLE',
    'EVENT',
    'CASING',
    'CEMENTING',
  ]),
  payload: z.any(),
});
