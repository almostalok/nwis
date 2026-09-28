import {
  EventSeverity,
  EventType,
  QualityStatus,
  WellStatus,
  WellType,
  DocumentType,
  DocumentProcessingStatus,
} from '@nwis/types';

export interface SyntheticWellData {
  wellId: string;
  name: string;
  field: string;
  operator: string;
  wellType: WellType;
  status: WellStatus;
  spudDate: string;
  completionDate: string | null;
  totalDepth: number;
  latitude: number;
  longitude: number;
  formations: Array<{
    formationName: string;
    topDepth: number;
    bottomDepth: number;
    topTVD: number;
    bottomTVD: number;
    lithology: string;
    reservoir: boolean;
    confidence: number;
  }>;
  trajectories: Array<{
    measuredDepth: number;
    trueVerticalDepth: number;
    inclination: number;
    azimuth: number;
    latitude: number;
    longitude: number;
    dogLegSeverity: number;
  }>;
  drillingSamples: Array<{
    timestamp: string;
    measuredDepth: number;
    rop: number;
    wob: number;
    rpm: number;
    torque: number;
    hookLoad: number;
    standpipePressure: number;
    flowRate: number;
    blockPosition: number;
    blockSpeed: number;
    additionalTags?: Record<string, any>;
  }>;
  mudSamples: Array<{
    timestamp: string;
    measuredDepth: number;
    mudWeight: number;
    plasticViscosity: number;
    yieldPoint: number;
    funnelViscosity: number;
    fluidLoss: number;
    ph: number;
    chlorides: number;
    solids: number;
    flowRate: number;
    pitVolume: number;
    gasReading: number;
  }>;
  events: Array<{
    eventType: EventType;
    severity: EventSeverity;
    startDepth: number;
    endDepth: number | null;
    startTime: string;
    endTime: string | null;
    formationName: string;
    description: string;
    rootCause: string;
    mitigation: string;
    outcome: string;
    confidence: number;
    sourceDocumentRef?: string;
    sourcePage?: number;
  }>;
  casingSections: Array<{
    section: string;
    casingSize: number;
    settingDepth: number;
    topDepth: number;
    bottomDepth: number;
    grade: string;
    weight: number;
    cementTop: number;
    cementBottom: number;
  }>;
  cementingJobs: Array<{
    jobDate: string;
    topDepth: number;
    bottomDepth: number;
    cementVolume: number;
    cementDensity: number;
    slurryType: string;
    displacementVolume: number;
    jobStatus: string;
    remarks: string;
  }>;
  documents: Array<{
    documentType: DocumentType;
    title: string;
    fileName: string;
    mimeType: string;
    storagePath: string;
    documentDate: string;
    pageCount: number;
  }>;
}

// 20 Synthetic Wells clustered in NWIS-DEMO-FIELD (~27.28°N to ~27.45°N, 95.25°E to 95.48°E)
export const SYNTHETIC_WELLS: SyntheticWellData[] = [
  {
    wellId: 'OIL-SYN-001',
    name: 'NWIS Discovery Well 01',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.EXPLORATION,
    status: WellStatus.COMPLETED,
    spudDate: '2023-01-15T00:00:00Z',
    completionDate: '2023-04-20T00:00:00Z',
    totalDepth: 4150.0,
    latitude: 27.325,
    longitude: 95.312,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 450, topTVD: 0, bottomTVD: 450, lithology: 'Clay & Silt', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 450, bottomDepth: 1150, topTVD: 450, bottomTVD: 1150, lithology: 'Variegated Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1150, bottomDepth: 2350, topTVD: 1150, bottomTVD: 2320, lithology: 'Coarse Sandstone with Shale breaks', reservoir: true, confidence: 0.98 },
      { formationName: 'Surma Group', topDepth: 2350, bottomDepth: 2850, topTVD: 2320, bottomTVD: 2800, lithology: 'Alternating Sandstone & Shale', reservoir: false, confidence: 0.92 },
      { formationName: 'Barail Sandstone', topDepth: 2850, bottomDepth: 3450, topTVD: 2800, bottomTVD: 3380, lithology: 'Fine Sandstone & Carbonaceous Shale', reservoir: true, confidence: 0.97 },
      { formationName: 'Kopili Shale', topDepth: 3450, bottomDepth: 3950, topTVD: 3380, bottomTVD: 3860, lithology: 'Dark Splintery Shale', reservoir: false, confidence: 0.94 },
      { formationName: 'Jaintia Limestone', topDepth: 3950, bottomDepth: 4150, topTVD: 3860, bottomTVD: 4050, lithology: 'Fossiliferous Limestone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [
      { measuredDepth: 0, trueVerticalDepth: 0, inclination: 0, azimuth: 0, latitude: 27.325, longitude: 95.312, dogLegSeverity: 0 },
      { measuredDepth: 1000, trueVerticalDepth: 1000, inclination: 1.2, azimuth: 45, latitude: 27.3251, longitude: 95.3121, dogLegSeverity: 0.04 },
      { measuredDepth: 2000, trueVerticalDepth: 1995, inclination: 4.8, azimuth: 62, latitude: 27.3254, longitude: 95.3125, dogLegSeverity: 0.11 },
      { measuredDepth: 3000, trueVerticalDepth: 2980, inclination: 8.5, azimuth: 75, latitude: 27.326, longitude: 95.3134, dogLegSeverity: 0.12 },
      { measuredDepth: 4150, trueVerticalDepth: 4050, inclination: 12.0, azimuth: 80, latitude: 27.3272, longitude: 95.3151, dogLegSeverity: 0.09 },
    ],
    drillingSamples: [
      { timestamp: '2023-02-10T08:00:00Z', measuredDepth: 1250, rop: 16.5, wob: 95, rpm: 120, torque: 9.8, hookLoad: 750, standpipePressure: 165, flowRate: 2400, blockPosition: 14.5, blockSpeed: 0.05 },
      { timestamp: '2023-02-25T14:00:00Z', measuredDepth: 2400, rop: 14.2, wob: 110, rpm: 115, torque: 11.2, hookLoad: 890, standpipePressure: 185, flowRate: 2200, blockPosition: 8.2, blockSpeed: 0.04 },
      { timestamp: '2023-03-15T18:00:00Z', measuredDepth: 3200, rop: 11.8, wob: 125, rpm: 110, torque: 13.5, hookLoad: 1020, standpipePressure: 210, flowRate: 2100, blockPosition: 18.0, blockSpeed: 0.03 },
    ],
    mudSamples: [
      { timestamp: '2023-02-10T08:00:00Z', measuredDepth: 1250, mudWeight: 1.14, plasticViscosity: 18, yieldPoint: 16, funnelViscosity: 48, fluidLoss: 7.2, ph: 9.2, chlorides: 2200, solids: 8.5, flowRate: 2400, pitVolume: 65, gasReading: 12 },
      { timestamp: '2023-03-15T18:00:00Z', measuredDepth: 3200, mudWeight: 1.28, plasticViscosity: 24, yieldPoint: 22, funnelViscosity: 58, fluidLoss: 5.4, ph: 9.8, chlorides: 3800, solids: 14.2, flowRate: 2100, pitVolume: 62, gasReading: 45 },
    ],
    events: [
      {
        eventType: EventType.NPT,
        severity: EventSeverity.LOW,
        startDepth: 1420,
        endDepth: 1420,
        startTime: '2023-02-12T04:00:00Z',
        endTime: '2023-02-12T10:00:00Z',
        formationName: 'Tipam Sandstone',
        description: 'Waiting on weather during severe monsoon squall. Drilling suspended safely.',
        rootCause: 'Severe electrical storm and torrential rainfall exceeding rig lightning threshold.',
        mitigation: 'Suspended drilling, spaced out drillstring, closed annular preventer as precautionary measure.',
        outcome: 'Resumed drilling after storm cleared; no equipment damage or downhole issues.',
        confidence: 0.98,
      },
    ],
    casingSections: [
      { section: 'CONDUCTOR', casingSize: 20.0, settingDepth: 95, topDepth: 0, bottomDepth: 95, grade: 'K-55', weight: 94.0, cementTop: 0, cementBottom: 95 },
      { section: 'SURFACE', casingSize: 13.375, settingDepth: 1140, topDepth: 0, bottomDepth: 1140, grade: 'K-55', weight: 54.5, cementTop: 0, cementBottom: 1140 },
      { section: 'INTERMEDIATE', casingSize: 9.625, settingDepth: 2840, topDepth: 0, bottomDepth: 2840, grade: 'L-80', weight: 40.0, cementTop: 800, cementBottom: 2840 },
      { section: 'PRODUCTION', casingSize: 7.0, settingDepth: 4140, topDepth: 2650, bottomDepth: 4140, grade: 'P-110', weight: 29.0, cementTop: 2650, cementBottom: 4140 },
    ],
    cementingJobs: [
      { jobDate: '2023-02-05T00:00:00Z', topDepth: 0, bottomDepth: 1140, cementVolume: 42.0, cementDensity: 1.58, slurryType: 'Class G with 2% Bentonite', displacementVolume: 28.5, jobStatus: 'SUCCESS', remarks: 'Good returns to surface.' },
      { jobDate: '2023-03-08T00:00:00Z', topDepth: 800, bottomDepth: 2840, cementVolume: 35.5, cementDensity: 1.65, slurryType: 'Class G Neat + FL Additive', displacementVolume: 32.0, jobStatus: 'SUCCESS', remarks: 'Full returns throughout job.' },
    ],
    documents: [
      { documentType: DocumentType.WCR, title: 'Well Completion Report - OIL-SYN-001', fileName: 'OIL-SYN-001-WCR.txt', mimeType: 'text/plain', storagePath: 'wells/OIL-SYN-001/OIL-SYN-001-WCR.txt', documentDate: '2023-04-28T00:00:00Z', pageCount: 42 },
    ],
  },
  {
    wellId: 'OIL-SYN-002',
    name: 'NWIS Duliajan North 02',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.DRILLING,
    spudDate: '2024-02-01T00:00:00Z',
    completionDate: null,
    totalDepth: 3950.0,
    latitude: 27.338,
    longitude: 95.328,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 420, topTVD: 0, bottomTVD: 420, lithology: 'Clay & Silt', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 420, bottomDepth: 1100, topTVD: 420, bottomTVD: 1100, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1100, bottomDepth: 2300, topTVD: 1100, bottomTVD: 2290, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Surma Group', topDepth: 2300, bottomDepth: 2800, topTVD: 2290, bottomTVD: 2780, lithology: 'Sand/Shale sequence', reservoir: false, confidence: 0.92 },
      { formationName: 'Barail Sandstone', topDepth: 2800, bottomDepth: 3400, topTVD: 2780, bottomTVD: 3370, lithology: 'Hydrocarbon Bearing Sandstone', reservoir: true, confidence: 0.96 },
      { formationName: 'Kopili Shale', topDepth: 3400, bottomDepth: 3950, topTVD: 3370, bottomTVD: 3900, lithology: 'Overpressured Dark Shale', reservoir: false, confidence: 0.93 },
    ],
    trajectories: [
      { measuredDepth: 0, trueVerticalDepth: 0, inclination: 0, azimuth: 0, latitude: 27.338, longitude: 95.328, dogLegSeverity: 0 },
      { measuredDepth: 1200, trueVerticalDepth: 1200, inclination: 1.0, azimuth: 30, latitude: 27.3381, longitude: 95.3281, dogLegSeverity: 0.03 },
      { measuredDepth: 2500, trueVerticalDepth: 2490, inclination: 5.5, azimuth: 45, latitude: 27.3385, longitude: 95.3286, dogLegSeverity: 0.10 },
      { measuredDepth: 3500, trueVerticalDepth: 3480, inclination: 7.2, azimuth: 50, latitude: 27.3391, longitude: 95.3294, dogLegSeverity: 0.05 },
    ],
    drillingSamples: [
      { timestamp: '2024-03-01T10:00:00Z', measuredDepth: 1800, rop: 18.2, wob: 85, rpm: 125, torque: 8.5, hookLoad: 800, standpipePressure: 155, flowRate: 2500, blockPosition: 12.0, blockSpeed: 0.06 },
      { timestamp: '2024-03-20T16:00:00Z', measuredDepth: 3100, rop: 12.5, wob: 115, rpm: 110, torque: 12.8, hookLoad: 960, standpipePressure: 195, flowRate: 2150, blockPosition: 6.5, blockSpeed: 0.03 },
    ],
    mudSamples: [
      { timestamp: '2024-03-20T16:00:00Z', measuredDepth: 3100, mudWeight: 1.25, plasticViscosity: 22, yieldPoint: 20, funnelViscosity: 54, fluidLoss: 5.8, ph: 9.5, chlorides: 3400, solids: 12.5, flowRate: 2150, pitVolume: 58, gasReading: 28 },
    ],
    events: [],
    casingSections: [
      { section: 'SURFACE', casingSize: 13.375, settingDepth: 1090, topDepth: 0, bottomDepth: 1090, grade: 'K-55', weight: 54.5, cementTop: 0, cementBottom: 1090 },
      { section: 'INTERMEDIATE', casingSize: 9.625, settingDepth: 2790, topDepth: 0, bottomDepth: 2790, grade: 'L-80', weight: 40.0, cementTop: 650, cementBottom: 2790 },
    ],
    cementingJobs: [
      { jobDate: '2024-02-18T00:00:00Z', topDepth: 0, bottomDepth: 1090, cementVolume: 39.0, cementDensity: 1.58, slurryType: 'Class G Neat', displacementVolume: 26.0, jobStatus: 'SUCCESS', remarks: 'Good job.' },
    ],
    documents: [
      { documentType: DocumentType.DDR, title: 'Daily Drilling Report - OIL-SYN-002 (Active)', fileName: 'OIL-SYN-002-DDR.txt', mimeType: 'text/plain', storagePath: 'wells/OIL-SYN-002/OIL-SYN-002-DDR.txt', documentDate: '2024-03-25T00:00:00Z', pageCount: 5 },
    ],
  },
  {
    // HISTORICAL PRECEDENT WELL 1: STUCK PIPE in Barail Sandstone at ~3210m
    wellId: 'OIL-SYN-003',
    name: 'NWIS Precedent Well 03 (Stuck Pipe)',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.COMPLETED,
    spudDate: '2023-03-10T00:00:00Z',
    completionDate: '2023-07-02T00:00:00Z',
    totalDepth: 4250.0,
    latitude: 27.315,
    longitude: 95.305,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 460, topTVD: 0, bottomTVD: 460, lithology: 'Clay & Silt', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 460, bottomDepth: 1180, topTVD: 460, bottomTVD: 1180, lithology: 'Variegated Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1180, bottomDepth: 2380, topTVD: 1180, bottomTVD: 2350, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Surma Group', topDepth: 2380, bottomDepth: 2880, topTVD: 2350, bottomTVD: 2830, lithology: 'Shale with Siltstone', reservoir: false, confidence: 0.93 },
      { formationName: 'Barail Sandstone', topDepth: 2880, bottomDepth: 3480, topTVD: 2830, bottomTVD: 3410, lithology: 'Fine Sandstone & Carbonaceous Shale interbeds', reservoir: true, confidence: 0.97 },
      { formationName: 'Kopili Shale', topDepth: 3480, bottomDepth: 4000, topTVD: 3410, bottomTVD: 3910, lithology: 'Splintery Shale', reservoir: false, confidence: 0.94 },
      { formationName: 'Jaintia Limestone', topDepth: 4000, bottomDepth: 4250, topTVD: 3910, bottomTVD: 4150, lithology: 'Hard Limestone', reservoir: true, confidence: 0.95 },
    ],
    trajectories: [
      { measuredDepth: 0, trueVerticalDepth: 0, inclination: 0, azimuth: 0, latitude: 27.315, longitude: 95.305, dogLegSeverity: 0 },
      { measuredDepth: 1500, trueVerticalDepth: 1498, inclination: 2.2, azimuth: 70, latitude: 27.3152, longitude: 95.3053, dogLegSeverity: 0.05 },
      { measuredDepth: 2800, trueVerticalDepth: 2790, inclination: 6.8, azimuth: 82, latitude: 27.3158, longitude: 95.3065, dogLegSeverity: 0.11 },
      { measuredDepth: 3210, trueVerticalDepth: 3192, inclination: 7.9, azimuth: 84, latitude: 27.3163, longitude: 95.3073, dogLegSeverity: 0.08 },
      { measuredDepth: 4250, trueVerticalDepth: 4150, inclination: 9.1, azimuth: 88, latitude: 27.3175, longitude: 95.3092, dogLegSeverity: 0.04 },
    ],
    drillingSamples: [
      // Normal drilling precursor
      { timestamp: '2023-04-14T06:00:00Z', measuredDepth: 3180, rop: 14.5, wob: 110, rpm: 120, torque: 11.5, hookLoad: 920, standpipePressure: 190, flowRate: 2200, blockPosition: 15.0, blockSpeed: 0.04 },
      // STUCK PIPE PRECURSOR: Torque spikes from 11.5 -> 22.0 -> 34.5 kN.m, ROP drops from 14.5 -> 5.2 -> 0.8 m/h, drag increases!
      { timestamp: '2023-04-14T09:30:00Z', measuredDepth: 3198, rop: 9.2, wob: 125, rpm: 115, torque: 18.4, hookLoad: 980, standpipePressure: 205, flowRate: 2200, blockPosition: 11.2, blockSpeed: 0.03 },
      { timestamp: '2023-04-14T11:15:00Z', measuredDepth: 3208, rop: 4.1, wob: 135, rpm: 95, torque: 26.8, hookLoad: 1080, standpipePressure: 220, flowRate: 2150, blockPosition: 4.5, blockSpeed: 0.01 },
      { timestamp: '2023-04-14T12:00:00Z', measuredDepth: 3210, rop: 0.5, wob: 140, rpm: 40, torque: 34.5, hookLoad: 1250, standpipePressure: 245, flowRate: 1900, blockPosition: 2.1, blockSpeed: 0.0 },
    ],
    mudSamples: [
      { timestamp: '2023-04-14T06:00:00Z', measuredDepth: 3180, mudWeight: 1.26, plasticViscosity: 24, yieldPoint: 21, funnelViscosity: 55, fluidLoss: 6.2, ph: 9.4, chlorides: 3600, solids: 13.8, flowRate: 2200, pitVolume: 60, gasReading: 32 },
      { timestamp: '2023-04-14T12:30:00Z', measuredDepth: 3210, mudWeight: 1.27, plasticViscosity: 28, yieldPoint: 26, funnelViscosity: 62, fluidLoss: 8.5, ph: 9.2, chlorides: 3900, solids: 16.5, flowRate: 1900, pitVolume: 59, gasReading: 58 },
    ],
    events: [
      {
        eventType: EventType.STUCK_PIPE,
        severity: EventSeverity.HIGH,
        startDepth: 3210,
        endDepth: 3210,
        startTime: '2023-04-14T12:15:00Z',
        endTime: '2023-04-16T18:00:00Z',
        formationName: 'Barail Sandstone',
        description: 'Mechanical sticking occurred at 3210m MD while drilling interbedded carbonaceous shale in Barail Sandstone. String unable to reciprocate or rotate. Maximum overpull reached 60 tonnes above normal hookload.',
        rootCause: 'Differential sticking compounded by reactive shale spalling and inadequate mud lubricity in permeable sandstone transition zone.',
        mitigation: 'Spotted 12 m3 oil-based lubricant pill, established low-rate circulation, and applied controlled jarring down and up with hydraulic jars.',
        outcome: 'String freed after 54 hours of jarring and soaking pill. Reamed interval 3150-3220m with wiper trip; raised mud weight to 1.30 sg.',
        confidence: 0.99,
        sourceDocumentRef: 'synthetic-well-003-ddr.txt',
        sourcePage: 2,
      },
    ],
    casingSections: [
      { section: 'SURFACE', casingSize: 13.375, settingDepth: 1170, topDepth: 0, bottomDepth: 1170, grade: 'K-55', weight: 54.5, cementTop: 0, cementBottom: 1170 },
      { section: 'INTERMEDIATE', casingSize: 9.625, settingDepth: 2870, topDepth: 0, bottomDepth: 2870, grade: 'L-80', weight: 40.0, cementTop: 750, cementBottom: 2870 },
      { section: 'PRODUCTION', casingSize: 7.0, settingDepth: 4240, topDepth: 2680, bottomDepth: 4240, grade: 'P-110', weight: 29.0, cementTop: 2680, cementBottom: 4240 },
    ],
    cementingJobs: [
      { jobDate: '2023-03-25T00:00:00Z', topDepth: 0, bottomDepth: 1170, cementVolume: 43.0, cementDensity: 1.58, slurryType: 'Class G Neat', displacementVolume: 29.0, jobStatus: 'SUCCESS', remarks: 'Good job.' },
    ],
    documents: [
      { documentType: DocumentType.DDR, title: 'Daily Drilling Report - OIL-SYN-003 (Stuck Pipe Incident)', fileName: 'synthetic-well-003-ddr.txt', mimeType: 'text/plain', storagePath: 'samples/synthetic-well-003-ddr.txt', documentDate: '2023-04-15T00:00:00Z', pageCount: 4 },
      { documentType: DocumentType.WCR, title: 'Well Completion Report - OIL-SYN-003', fileName: 'synthetic-well-003-wcr.txt', mimeType: 'text/plain', storagePath: 'samples/synthetic-well-003-wcr.txt', documentDate: '2023-07-15T00:00:00Z', pageCount: 38 },
    ],
  },
  {
    wellId: 'OIL-SYN-004',
    name: 'NWIS Nahorkatiya East 04',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.COMPLETED,
    spudDate: '2023-05-01T00:00:00Z',
    completionDate: '2023-08-10T00:00:00Z',
    totalDepth: 4100.0,
    latitude: 27.342,
    longitude: 95.341,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 430, topTVD: 0, bottomTVD: 430, lithology: 'Clay & Silt', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 430, bottomDepth: 1120, topTVD: 430, bottomTVD: 1120, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1120, bottomDepth: 2320, topTVD: 1120, bottomTVD: 2300, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Surma Group', topDepth: 2320, bottomDepth: 2820, topTVD: 2300, bottomTVD: 2790, lithology: 'Sandstone/Shale', reservoir: false, confidence: 0.92 },
      { formationName: 'Barail Sandstone', topDepth: 2820, bottomDepth: 3420, topTVD: 2790, bottomTVD: 3370, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
      { formationName: 'Kopili Shale', topDepth: 3420, bottomDepth: 3920, topTVD: 3370, bottomTVD: 3860, lithology: 'Shale', reservoir: false, confidence: 0.93 },
      { formationName: 'Jaintia Limestone', topDepth: 3920, bottomDepth: 4100, topTVD: 3860, bottomTVD: 4030, lithology: 'Limestone', reservoir: true, confidence: 0.95 },
    ],
    trajectories: [
      { measuredDepth: 0, trueVerticalDepth: 0, inclination: 0, azimuth: 0, latitude: 27.342, longitude: 95.341, dogLegSeverity: 0 },
      { measuredDepth: 2000, trueVerticalDepth: 1996, inclination: 3.5, azimuth: 40, latitude: 27.3423, longitude: 95.3414, dogLegSeverity: 0.05 },
      { measuredDepth: 4100, trueVerticalDepth: 4030, inclination: 10.5, azimuth: 55, latitude: 27.3435, longitude: 95.3432, dogLegSeverity: 0.08 },
    ],
    drillingSamples: [
      { timestamp: '2023-06-12T08:00:00Z', measuredDepth: 2100, rop: 17.5, wob: 90, rpm: 120, torque: 10.1, hookLoad: 810, standpipePressure: 170, flowRate: 2350, blockPosition: 10.0, blockSpeed: 0.05 },
    ],
    mudSamples: [
      { timestamp: '2023-06-12T08:00:00Z', measuredDepth: 2100, mudWeight: 1.18, plasticViscosity: 19, yieldPoint: 17, funnelViscosity: 50, fluidLoss: 6.8, ph: 9.3, chlorides: 2600, solids: 9.5, flowRate: 2350, pitVolume: 64, gasReading: 15 },
    ],
    events: [],
    casingSections: [
      { section: 'SURFACE', casingSize: 13.375, settingDepth: 1110, topDepth: 0, bottomDepth: 1110, grade: 'K-55', weight: 54.5, cementTop: 0, cementBottom: 1110 },
      { section: 'INTERMEDIATE', casingSize: 9.625, settingDepth: 2810, topDepth: 0, bottomDepth: 2810, grade: 'L-80', weight: 40.0, cementTop: 700, cementBottom: 2810 },
    ],
    cementingJobs: [],
    documents: [],
  },
  {
    // HISTORICAL PRECEDENT WELL 2: LOST CIRCULATION in Tipam Sandstone at ~2120m
    wellId: 'OIL-SYN-005',
    name: 'NWIS Precedent Well 05 (Lost Circulation)',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.COMPLETED,
    spudDate: '2023-06-01T00:00:00Z',
    completionDate: '2023-09-18T00:00:00Z',
    totalDepth: 4050.0,
    latitude: 27.355,
    longitude: 95.335,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 440, topTVD: 0, bottomTVD: 440, lithology: 'Clay & Silt', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 440, bottomDepth: 1140, topTVD: 440, bottomTVD: 1140, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1140, bottomDepth: 2340, topTVD: 1140, bottomTVD: 2310, lithology: 'Porous Coarse Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Surma Group', topDepth: 2340, bottomDepth: 2840, topTVD: 2310, bottomTVD: 2800, lithology: 'Sand/Shale', reservoir: false, confidence: 0.92 },
      { formationName: 'Barail Sandstone', topDepth: 2840, bottomDepth: 3440, topTVD: 2800, bottomTVD: 3380, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [
      { measuredDepth: 0, trueVerticalDepth: 0, inclination: 0, azimuth: 0, latitude: 27.355, longitude: 95.335, dogLegSeverity: 0 },
      { measuredDepth: 2120, trueVerticalDepth: 2095, inclination: 4.0, azimuth: 35, latitude: 27.3554, longitude: 95.3355, dogLegSeverity: 0.06 },
    ],
    drillingSamples: [
      // LOST CIRCULATION PRECURSOR: Flow rate normal, then returns drop, pit volume decreases!
      { timestamp: '2023-07-08T04:00:00Z', measuredDepth: 2110, rop: 18.0, wob: 85, rpm: 120, torque: 9.5, hookLoad: 780, standpipePressure: 165, flowRate: 2400, blockPosition: 12.0, blockSpeed: 0.05 },
      { timestamp: '2023-07-08T05:30:00Z', measuredDepth: 2122, rop: 22.5, wob: 75, rpm: 120, torque: 8.2, hookLoad: 770, standpipePressure: 135, flowRate: 2400, blockPosition: 6.0, blockSpeed: 0.07 },
    ],
    mudSamples: [
      { timestamp: '2023-07-08T04:00:00Z', measuredDepth: 2110, mudWeight: 1.16, plasticViscosity: 18, yieldPoint: 16, funnelViscosity: 48, fluidLoss: 6.5, ph: 9.2, chlorides: 2400, solids: 9.0, flowRate: 2400, pitVolume: 65, gasReading: 10 },
      { timestamp: '2023-07-08T06:00:00Z', measuredDepth: 2125, mudWeight: 1.15, plasticViscosity: 17, yieldPoint: 15, funnelViscosity: 46, fluidLoss: 7.0, ph: 9.2, chlorides: 2400, solids: 8.8, flowRate: 1400, pitVolume: 42, gasReading: 8 },
    ],
    events: [
      {
        eventType: EventType.LOST_CIRCULATION,
        severity: EventSeverity.HIGH,
        startDepth: 2125,
        endDepth: 2135,
        startTime: '2023-07-08T05:45:00Z',
        endTime: '2023-07-09T14:00:00Z',
        formationName: 'Tipam Sandstone',
        description: 'Sudden loss of mud returns (pit volume lost: 23 m3 in 20 minutes) encountered upon penetrating highly permeable fractured sandstone interval at 2125m MD in Tipam Sandstone.',
        rootCause: 'Encountered high permeability thief zone with micro-fractures in upper Tipam Sandstone.',
        mitigation: 'Pumps reduced to minimum rate. Spotted 18 m3 coarse LCM (nut plug, mica, calcium carbonate) pill in two stages. Allowed 4 hours soaking.',
        outcome: 'Partial returns resumed after first pill; full circulation restored with second pill. Mud weight optimized from 1.16 to 1.12 sg.',
        confidence: 0.98,
        sourceDocumentRef: 'synthetic-well-005-mud.txt',
        sourcePage: 1,
      },
    ],
    casingSections: [],
    cementingJobs: [],
    documents: [
      { documentType: DocumentType.MUD_REPORT, title: 'Mud Logging Report - OIL-SYN-005 (Lost Circulation Incident)', fileName: 'synthetic-well-005-mud.txt', mimeType: 'text/plain', storagePath: 'samples/synthetic-well-005-mud.txt', documentDate: '2023-07-09T00:00:00Z', pageCount: 8 },
    ],
  },
  {
    wellId: 'OIL-SYN-006',
    name: 'NWIS Moran Central 06',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.COMPLETED,
    spudDate: '2023-07-15T00:00:00Z',
    completionDate: '2023-10-30T00:00:00Z',
    totalDepth: 4180.0,
    latitude: 27.295,
    longitude: 95.275,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 460, topTVD: 0, bottomTVD: 460, lithology: 'Clay & Silt', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 460, bottomDepth: 1190, topTVD: 460, bottomTVD: 1190, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1190, bottomDepth: 2390, topTVD: 1190, bottomTVD: 2360, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Barail Sandstone', topDepth: 2890, bottomDepth: 3490, topTVD: 2840, bottomTVD: 3420, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [
      { measuredDepth: 0, trueVerticalDepth: 0, inclination: 0, azimuth: 0, latitude: 27.295, longitude: 95.275, dogLegSeverity: 0 },
      { measuredDepth: 4180, trueVerticalDepth: 4100, inclination: 7.8, azimuth: 45, latitude: 27.2965, longitude: 95.277, dogLegSeverity: 0.06 },
    ],
    drillingSamples: [],
    mudSamples: [],
    events: [],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
  {
    // HISTORICAL PRECEDENT WELL 3: STUCK PIPE in Barail Sandstone at ~3180m (MATCHES WELL 003 & 012!)
    wellId: 'OIL-SYN-007',
    name: 'NWIS Precedent Well 07 (Barail Stuck Pipe Precedent)',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.APPRAISAL,
    status: WellStatus.COMPLETED,
    spudDate: '2023-08-20T00:00:00Z',
    completionDate: '2023-12-15T00:00:00Z',
    totalDepth: 4300.0,
    latitude: 27.318,
    longitude: 95.308,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 455, topTVD: 0, bottomTVD: 455, lithology: 'Clay & Silt', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 455, bottomDepth: 1170, topTVD: 455, bottomTVD: 1170, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1170, bottomDepth: 2370, topTVD: 1170, bottomTVD: 2340, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Surma Group', topDepth: 2370, bottomDepth: 2870, topTVD: 2340, bottomTVD: 2820, lithology: 'Shale/Sand', reservoir: false, confidence: 0.93 },
      { formationName: 'Barail Sandstone', topDepth: 2870, bottomDepth: 3470, topTVD: 2820, bottomTVD: 3400, lithology: 'Interbedded Sandstone & Carbonaceous Shale', reservoir: true, confidence: 0.97 },
      { formationName: 'Kopili Shale', topDepth: 3470, bottomDepth: 3980, topTVD: 3400, bottomTVD: 3890, lithology: 'Shale', reservoir: false, confidence: 0.94 },
    ],
    trajectories: [
      { measuredDepth: 0, trueVerticalDepth: 0, inclination: 0, azimuth: 0, latitude: 27.318, longitude: 95.308, dogLegSeverity: 0 },
      { measuredDepth: 3180, trueVerticalDepth: 3160, inclination: 6.5, azimuth: 78, latitude: 27.3188, longitude: 95.3094, dogLegSeverity: 0.08 },
    ],
    drillingSamples: [
      // Exact precedent precursor: Torque ↑ from 11 to 32 kN.m, ROP ↓ from 15 to 0.4 m/h
      { timestamp: '2023-10-05T08:00:00Z', measuredDepth: 3150, rop: 15.2, wob: 105, rpm: 120, torque: 10.8, hookLoad: 910, standpipePressure: 185, flowRate: 2200, blockPosition: 14.0, blockSpeed: 0.04 },
      { timestamp: '2023-10-05T10:30:00Z', measuredDepth: 3172, rop: 7.8, wob: 120, rpm: 110, torque: 19.5, hookLoad: 990, standpipePressure: 200, flowRate: 2200, blockPosition: 8.5, blockSpeed: 0.02 },
      { timestamp: '2023-10-05T12:00:00Z', measuredDepth: 3180, rop: 0.4, wob: 135, rpm: 35, torque: 32.0, hookLoad: 1210, standpipePressure: 235, flowRate: 1950, blockPosition: 3.0, blockSpeed: 0.0 },
    ],
    mudSamples: [
      { timestamp: '2023-10-05T12:00:00Z', measuredDepth: 3180, mudWeight: 1.26, plasticViscosity: 26, yieldPoint: 24, funnelViscosity: 60, fluidLoss: 8.2, ph: 9.3, chlorides: 3750, solids: 15.0, flowRate: 1950, pitVolume: 61, gasReading: 48 },
    ],
    events: [
      {
        eventType: EventType.STUCK_PIPE,
        severity: EventSeverity.HIGH,
        startDepth: 3180,
        endDepth: 3180,
        startTime: '2023-10-05T12:10:00Z',
        endTime: '2023-10-07T09:00:00Z',
        formationName: 'Barail Sandstone',
        description: 'Drillstring stuck at 3180m MD in Barail Sandstone carbonaceous shale interval during connection. Erratic torque and drag preceded sticking. High overpull required.',
        rootCause: 'Differential sticking across permeable sandstone boundary with reactive shale cuttings settling around BHA during pump shutdown.',
        mitigation: 'Pumped 10 m3 lubricating hydrocarbon pill. Jarred down repeatedly with 40-tonne impacts; rotated string after 36 hours of soaking.',
        outcome: 'String successfully freed. Wiper trip performed and mud conditioned with enhanced glycol shale inhibitor.',
        confidence: 0.99,
        sourceDocumentRef: 'synthetic-well-007-ddr.txt',
        sourcePage: 2,
      },
    ],
    casingSections: [],
    cementingJobs: [],
    documents: [
      { documentType: DocumentType.DDR, title: 'Daily Drilling Report - OIL-SYN-007 (Stuck Pipe Precedent)', fileName: 'synthetic-well-007-ddr.txt', mimeType: 'text/plain', storagePath: 'samples/synthetic-well-007-ddr.txt', documentDate: '2023-10-06T00:00:00Z', pageCount: 3 },
    ],
  },
  {
    wellId: 'OIL-SYN-008',
    name: 'NWIS Tengakhat South 08',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.COMPLETED,
    spudDate: '2023-09-01T00:00:00Z',
    completionDate: '2023-12-28T00:00:00Z',
    totalDepth: 4120.0,
    latitude: 27.375,
    longitude: 95.362,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 435, topTVD: 0, bottomTVD: 435, lithology: 'Clay & Silt', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 435, bottomDepth: 1130, topTVD: 435, bottomTVD: 1130, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1130, bottomDepth: 2330, topTVD: 1130, bottomTVD: 2310, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Barail Sandstone', topDepth: 2830, bottomDepth: 3430, topTVD: 2800, bottomTVD: 3380, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [],
    drillingSamples: [],
    mudSamples: [],
    events: [],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
  {
    // HISTORICAL PRECEDENT WELL 4: GAS KICK in Kopili Shale at ~3650m
    wellId: 'OIL-SYN-009',
    name: 'NWIS Precedent Well 09 (Gas Kick Incident)',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.EXPLORATION,
    status: WellStatus.COMPLETED,
    spudDate: '2023-10-01T00:00:00Z',
    completionDate: '2024-02-15T00:00:00Z',
    totalDepth: 4380.0,
    latitude: 27.310,
    longitude: 95.295,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 460, topTVD: 0, bottomTVD: 460, lithology: 'Clay', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 460, bottomDepth: 1180, topTVD: 460, bottomTVD: 1180, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1180, bottomDepth: 2380, topTVD: 1180, bottomTVD: 2350, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Surma Group', topDepth: 2380, bottomDepth: 2880, topTVD: 2350, bottomTVD: 2830, lithology: 'Shale', reservoir: false, confidence: 0.92 },
      { formationName: 'Barail Sandstone', topDepth: 2880, bottomDepth: 3480, topTVD: 2830, bottomTVD: 3410, lithology: 'Sandstone', reservoir: true, confidence: 0.97 },
      { formationName: 'Kopili Shale', topDepth: 3480, bottomDepth: 4050, topTVD: 3410, bottomTVD: 3960, lithology: 'Abnormally Pressured Marine Shale', reservoir: false, confidence: 0.95 },
      { formationName: 'Jaintia Limestone', topDepth: 4050, bottomDepth: 4380, topTVD: 3960, bottomTVD: 4280, lithology: 'Limestone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [
      { measuredDepth: 0, trueVerticalDepth: 0, inclination: 0, azimuth: 0, latitude: 27.31, longitude: 95.295, dogLegSeverity: 0 },
      { measuredDepth: 3650, trueVerticalDepth: 3580, inclination: 6.2, azimuth: 55, latitude: 27.3106, longitude: 95.296, dogLegSeverity: 0.07 },
    ],
    drillingSamples: [
      // KICK PRECURSOR: Flow rate increased, Pit gain observed, Standpipe pressure drops slightly
      { timestamp: '2023-12-04T02:00:00Z', measuredDepth: 3640, rop: 8.5, wob: 110, rpm: 100, torque: 12.0, hookLoad: 980, standpipePressure: 215, flowRate: 2000, blockPosition: 12.0, blockSpeed: 0.03 },
      { timestamp: '2023-12-04T03:15:00Z', measuredDepth: 3652, rop: 18.0, wob: 105, rpm: 105, torque: 13.5, hookLoad: 960, standpipePressure: 198, flowRate: 2350, blockPosition: 5.0, blockSpeed: 0.05 },
    ],
    mudSamples: [
      { timestamp: '2023-12-04T02:00:00Z', measuredDepth: 3640, mudWeight: 1.30, plasticViscosity: 26, yieldPoint: 22, funnelViscosity: 58, fluidLoss: 5.2, ph: 9.6, chlorides: 4100, solids: 15.2, flowRate: 2000, pitVolume: 58, gasReading: 45 },
      { timestamp: '2023-12-04T03:30:00Z', measuredDepth: 3652, mudWeight: 1.23, plasticViscosity: 24, yieldPoint: 20, funnelViscosity: 52, fluidLoss: 6.5, ph: 9.4, chlorides: 4200, solids: 14.5, flowRate: 2350, pitVolume: 64, gasReading: 850 },
    ],
    events: [
      {
        eventType: EventType.KICK,
        severity: EventSeverity.CRITICAL,
        startDepth: 3652,
        endDepth: 3652,
        startTime: '2023-12-04T03:20:00Z',
        endTime: '2023-12-05T16:00:00Z',
        formationName: 'Kopili Shale',
        description: 'Gas kick taken at 3652m MD in Kopili Shale transition. Pit volume gained 3.8 m3 in 12 minutes with gas reading spiking to 850 units. Shut in on annular BOP.',
        rootCause: 'Unexpected abnormal pore pressure pocket encountered in lower Kopili marine shale exceeding hydrostatic head of 1.30 sg mud.',
        mitigation: 'Space out drill string, shut in annular preventer, recorded SIDPP = 24 bar, SICP = 32 bar. Circulated out influx using Drillers Method and raised mud weight to 1.38 sg.',
        outcome: 'Gas influx killed safely through choke manifold without loss of well control or secondary influx. Resumed drilling with 1.40 sg mud.',
        confidence: 0.99,
      },
    ],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
  {
    wellId: 'OIL-SYN-010',
    name: 'NWIS Dikom Northwest 10',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.COMPLETED,
    spudDate: '2023-10-15T00:00:00Z',
    completionDate: '2024-01-20T00:00:00Z',
    totalDepth: 3980.0,
    latitude: 27.360,
    longitude: 95.310,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 440, topTVD: 0, bottomTVD: 440, lithology: 'Clay', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 440, bottomDepth: 1140, topTVD: 440, bottomTVD: 1140, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1140, bottomDepth: 2340, topTVD: 1140, bottomTVD: 2310, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Barail Sandstone', topDepth: 2840, bottomDepth: 3440, topTVD: 2800, bottomTVD: 3380, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [],
    drillingSamples: [],
    mudSamples: [],
    events: [],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
  {
    wellId: 'OIL-SYN-011',
    name: 'NWIS Chabua East 11',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.COMPLETED,
    spudDate: '2023-11-01T00:00:00Z',
    completionDate: '2024-02-28T00:00:00Z',
    totalDepth: 4160.0,
    latitude: 27.380,
    longitude: 95.285,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 450, topTVD: 0, bottomTVD: 450, lithology: 'Clay', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 450, bottomDepth: 1150, topTVD: 450, bottomTVD: 1150, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1150, bottomDepth: 2350, topTVD: 1150, bottomTVD: 2320, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Barail Sandstone', topDepth: 2850, bottomDepth: 3450, topTVD: 2810, bottomTVD: 3390, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [],
    drillingSamples: [],
    mudSamples: [],
    events: [],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
  {
    // HISTORICAL PRECEDENT WELL 5: STUCK PIPE in Barail Sandstone at ~3205m (THIRD PRECEDENT WELL!)
    wellId: 'OIL-SYN-012',
    name: 'NWIS Precedent Well 12 (Barail Correlation Precedent)',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.COMPLETED,
    spudDate: '2023-11-20T00:00:00Z',
    completionDate: '2024-03-10T00:00:00Z',
    totalDepth: 4220.0,
    latitude: 27.319,
    longitude: 95.311,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 455, topTVD: 0, bottomTVD: 455, lithology: 'Clay & Silt', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 455, bottomDepth: 1175, topTVD: 455, bottomTVD: 1175, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1175, bottomDepth: 2375, topTVD: 1175, bottomTVD: 2345, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Surma Group', topDepth: 2375, bottomDepth: 2875, topTVD: 2345, bottomTVD: 2825, lithology: 'Shale/Sand', reservoir: false, confidence: 0.93 },
      { formationName: 'Barail Sandstone', topDepth: 2875, bottomDepth: 3475, topTVD: 2825, bottomTVD: 3405, lithology: 'Fine Sandstone & Carbonaceous Shale interbeds', reservoir: true, confidence: 0.97 },
      { formationName: 'Kopili Shale', topDepth: 3475, bottomDepth: 3990, topTVD: 3405, bottomTVD: 3900, lithology: 'Dark Shale', reservoir: false, confidence: 0.94 },
      { formationName: 'Jaintia Limestone', topDepth: 3990, bottomDepth: 4220, topTVD: 3900, bottomTVD: 4120, lithology: 'Limestone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [
      { measuredDepth: 0, trueVerticalDepth: 0, inclination: 0, azimuth: 0, latitude: 27.319, longitude: 95.311, dogLegSeverity: 0 },
      { measuredDepth: 3205, trueVerticalDepth: 3185, inclination: 7.1, azimuth: 80, latitude: 27.3198, longitude: 95.3125, dogLegSeverity: 0.08 },
    ],
    drillingSamples: [
      // REPEATED HISTORICAL PRECEDENT PATTERN: Torque ↑ from 11.2 to 33.8 kN.m, ROP ↓ from 14.8 to 0.6 m/h at ~3205m MD!
      { timestamp: '2024-01-10T07:00:00Z', measuredDepth: 3175, rop: 14.8, wob: 110, rpm: 120, torque: 11.2, hookLoad: 915, standpipePressure: 188, flowRate: 2200, blockPosition: 14.5, blockSpeed: 0.04 },
      { timestamp: '2024-01-10T09:45:00Z', measuredDepth: 3195, rop: 8.5, wob: 122, rpm: 110, torque: 20.1, hookLoad: 995, standpipePressure: 204, flowRate: 2180, blockPosition: 9.0, blockSpeed: 0.02 },
      { timestamp: '2024-01-10T11:30:00Z', measuredDepth: 3205, rop: 0.6, wob: 138, rpm: 35, torque: 33.8, hookLoad: 1230, standpipePressure: 240, flowRate: 1920, blockPosition: 2.8, blockSpeed: 0.0 },
    ],
    mudSamples: [
      { timestamp: '2024-01-10T12:00:00Z', measuredDepth: 3205, mudWeight: 1.26, plasticViscosity: 27, yieldPoint: 25, funnelViscosity: 61, fluidLoss: 8.4, ph: 9.3, chlorides: 3800, solids: 15.5, flowRate: 1920, pitVolume: 60, gasReading: 52 },
    ],
    events: [
      {
        eventType: EventType.STUCK_PIPE,
        severity: EventSeverity.HIGH,
        startDepth: 3205,
        endDepth: 3205,
        startTime: '2024-01-10T11:40:00Z',
        endTime: '2024-01-12T08:30:00Z',
        formationName: 'Barail Sandstone',
        description: 'Third recorded stuck pipe occurrence in Barail Sandstone at 3205m MD, showing identical signature to Well 003 (3210m) and Well 007 (3180m). Drillstring locked tight during bottom-up circulation.',
        rootCause: 'Differential and mechanical sticking across Barail Sandstone carbonaceous shale boundary zone. Geomechanical stress concentration.',
        mitigation: 'Spotted 14 m3 low-viscosity surfactant soaking pill, applied continuous jarring. Cooled wellbore through intermittent circulation.',
        outcome: 'Freed pipe after 45 hours. Sidetrack avoided. Replaced BHA stabilizers with spiral design for subsequent wells.',
        confidence: 0.99,
        sourceDocumentRef: 'synthetic-well-012-ddr.txt',
        sourcePage: 1,
      },
    ],
    casingSections: [],
    cementingJobs: [],
    documents: [
      { documentType: DocumentType.DDR, title: 'Daily Drilling Report - OIL-SYN-012 (Correlation Precedent)', fileName: 'synthetic-well-012-ddr.txt', mimeType: 'text/plain', storagePath: 'samples/synthetic-well-012-ddr.txt', documentDate: '2024-01-11T00:00:00Z', pageCount: 4 },
    ],
  },
  {
    wellId: 'OIL-SYN-013',
    name: 'NWIS Bogapani South 13',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.COMPLETED,
    spudDate: '2023-12-01T00:00:00Z',
    completionDate: '2024-03-25T00:00:00Z',
    totalDepth: 4080.0,
    latitude: 27.270,
    longitude: 95.340,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 445, topTVD: 0, bottomTVD: 445, lithology: 'Clay', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 445, bottomDepth: 1145, topTVD: 445, bottomTVD: 1145, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1145, bottomDepth: 2345, topTVD: 1145, bottomTVD: 2315, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Barail Sandstone', topDepth: 2845, bottomDepth: 3445, topTVD: 2805, bottomTVD: 3385, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [],
    drillingSamples: [],
    mudSamples: [],
    events: [],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
  {
    // HISTORICAL PRECEDENT WELL 6: LOST CIRCULATION in Tipam Sandstone at ~2115m (MATCHES WELL 005!)
    wellId: 'OIL-SYN-014',
    name: 'NWIS Precedent Well 14 (Tipam Losses Precedent)',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.COMPLETED,
    spudDate: '2024-01-05T00:00:00Z',
    completionDate: '2024-04-18T00:00:00Z',
    totalDepth: 4020.0,
    latitude: 27.352,
    longitude: 95.338,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 435, topTVD: 0, bottomTVD: 435, lithology: 'Clay', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 435, bottomDepth: 1135, topTVD: 435, bottomTVD: 1135, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1135, bottomDepth: 2335, topTVD: 1135, bottomTVD: 2305, lithology: 'Porous Sandstone with Fractures', reservoir: true, confidence: 0.98 },
      { formationName: 'Barail Sandstone', topDepth: 2835, bottomDepth: 3435, topTVD: 2795, bottomTVD: 3375, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [],
    drillingSamples: [],
    mudSamples: [],
    events: [
      {
        eventType: EventType.LOST_CIRCULATION,
        severity: EventSeverity.HIGH,
        startDepth: 2115,
        endDepth: 2128,
        startTime: '2024-02-14T08:00:00Z',
        endTime: '2024-02-15T12:00:00Z',
        formationName: 'Tipam Sandstone',
        description: 'Lost circulation occurred at 2115m MD in fractured upper Tipam Sandstone (matching Well 005 at 2125m). Total losses of 19 m3 recorded before pump shutdown.',
        rootCause: 'Regional fracture system in Tipam Sandstone correlated with Well 005 fault block.',
        mitigation: 'Pumped engineered bridging pill with fibers and mica. Reduced mud weight to 1.13 sg.',
        outcome: 'Circulation regained after 28 hours with 100% returns.',
        confidence: 0.98,
      },
    ],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
  {
    wellId: 'OIL-SYN-015',
    name: 'NWIS Tinsukia West 15',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.EXPLORATION,
    status: WellStatus.COMPLETED,
    spudDate: '2024-01-15T00:00:00Z',
    completionDate: '2024-05-02T00:00:00Z',
    totalDepth: 4420.0,
    latitude: 27.420,
    longitude: 95.390,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 465, topTVD: 0, bottomTVD: 465, lithology: 'Clay', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 465, bottomDepth: 1195, topTVD: 465, bottomTVD: 1195, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1195, bottomDepth: 2395, topTVD: 1195, bottomTVD: 2365, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Barail Sandstone', topDepth: 2895, bottomDepth: 3495, topTVD: 2845, bottomTVD: 3425, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
      { formationName: 'Jaintia Limestone', topDepth: 4010, bottomDepth: 4420, topTVD: 3920, bottomTVD: 4310, lithology: 'Limestone', reservoir: true, confidence: 0.95 },
    ],
    trajectories: [],
    drillingSamples: [],
    mudSamples: [],
    events: [],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
  {
    // HISTORICAL PRECEDENT WELL 7: FORMATION INSTABILITY (Shale sloughing) in Girujan Clay at ~950m
    wellId: 'OIL-SYN-016',
    name: 'NWIS Makum North 16 (Shale Instability)',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.COMPLETED,
    spudDate: '2024-02-01T00:00:00Z',
    completionDate: '2024-05-15T00:00:00Z',
    totalDepth: 3950.0,
    latitude: 27.410,
    longitude: 95.420,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 450, topTVD: 0, bottomTVD: 450, lithology: 'Clay', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 450, bottomDepth: 1180, topTVD: 450, bottomTVD: 1180, lithology: 'Water-sensitive Swelling Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1180, bottomDepth: 2380, topTVD: 1180, bottomTVD: 2350, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Barail Sandstone', topDepth: 2880, bottomDepth: 3480, topTVD: 2830, bottomTVD: 3410, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [],
    drillingSamples: [],
    mudSamples: [],
    events: [
      {
        eventType: EventType.FORMATION_INSTABILITY,
        severity: EventSeverity.MEDIUM,
        startDepth: 950,
        endDepth: 980,
        startTime: '2024-02-18T14:00:00Z',
        endTime: '2024-02-20T06:00:00Z',
        formationName: 'Girujan Clay',
        description: 'Severe shale sloughing and hole pack-off experienced while drilling 17-1/2" hole through Girujan Clay. Shakers overwhelmed with splintery cavings.',
        rootCause: 'Smectite-rich clay hydration due to low KCl inhibition and extended open-hole exposure time.',
        mitigation: 'Increased KCl concentration from 3% to 7%, added polyamine shale encapsulator, and raised circulation rate to clean annulus.',
        outcome: 'Hole stabilized after wiper trip and mud conditioning; successfully ran 13-3/8" casing to 1175m.',
        confidence: 0.97,
      },
    ],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
  {
    wellId: 'OIL-SYN-017',
    name: 'NWIS Bordubi 17',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.DRILLING,
    spudDate: '2024-03-01T00:00:00Z',
    completionDate: null,
    totalDepth: 3880.0,
    latitude: 27.305,
    longitude: 95.335,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 440, topTVD: 0, bottomTVD: 440, lithology: 'Clay', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 440, bottomDepth: 1140, topTVD: 440, bottomTVD: 1140, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1140, bottomDepth: 2340, topTVD: 1140, bottomTVD: 2310, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Barail Sandstone', topDepth: 2840, bottomDepth: 3440, topTVD: 2800, bottomTVD: 3380, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [],
    drillingSamples: [],
    mudSamples: [],
    events: [],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
  {
    wellId: 'OIL-SYN-018',
    name: 'NWIS Zaloni Deep 18',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.EXPLORATION,
    status: WellStatus.PLANNED,
    spudDate: '2024-06-01T00:00:00Z',
    completionDate: null,
    totalDepth: 4500.0,
    latitude: 27.330,
    longitude: 95.265,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 460, topTVD: 0, bottomTVD: 460, lithology: 'Clay', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 460, bottomDepth: 1180, topTVD: 460, bottomTVD: 1180, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1180, bottomDepth: 2380, topTVD: 1180, bottomTVD: 2350, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Barail Sandstone', topDepth: 2880, bottomDepth: 3480, topTVD: 2830, bottomTVD: 3410, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
      { formationName: 'Kopili Shale', topDepth: 3480, bottomDepth: 4000, topTVD: 3410, bottomTVD: 3910, lithology: 'Shale', reservoir: false, confidence: 0.94 },
      { formationName: 'Jaintia Limestone', topDepth: 4000, bottomDepth: 4500, topTVD: 3910, bottomTVD: 4390, lithology: 'Limestone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [],
    drillingSamples: [],
    mudSamples: [],
    events: [],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
  {
    wellId: 'OIL-SYN-019',
    name: 'NWIS Shalmari South 19',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.COMPLETED,
    spudDate: '2024-02-10T00:00:00Z',
    completionDate: '2024-05-20T00:00:00Z',
    totalDepth: 4110.0,
    latitude: 27.280,
    longitude: 95.315,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 445, topTVD: 0, bottomTVD: 445, lithology: 'Clay', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 445, bottomDepth: 1150, topTVD: 445, bottomTVD: 1150, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1150, bottomDepth: 2350, topTVD: 1150, bottomTVD: 2320, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Barail Sandstone', topDepth: 2850, bottomDepth: 3450, topTVD: 2810, bottomTVD: 3390, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
    ],
    trajectories: [],
    drillingSamples: [],
    mudSamples: [],
    events: [],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
  {
    wellId: 'OIL-SYN-020',
    name: 'NWIS Deohal Step-out 20',
    field: 'NWIS-DEMO-FIELD',
    operator: 'Oil India Limited (Synthetic Operations)',
    wellType: WellType.APPRAISAL,
    status: WellStatus.DRILLING,
    spudDate: '2024-03-15T00:00:00Z',
    completionDate: null,
    totalDepth: 4280.0,
    latitude: 27.345,
    longitude: 95.375,
    formations: [
      { formationName: 'Alluvium', topDepth: 0, bottomDepth: 450, topTVD: 0, bottomTVD: 450, lithology: 'Clay', reservoir: false, confidence: 1.0 },
      { formationName: 'Girujan Clay', topDepth: 450, bottomDepth: 1160, topTVD: 450, bottomTVD: 1160, lithology: 'Claystone', reservoir: false, confidence: 0.95 },
      { formationName: 'Tipam Sandstone', topDepth: 1160, bottomDepth: 2360, topTVD: 1160, bottomTVD: 2330, lithology: 'Sandstone', reservoir: true, confidence: 0.98 },
      { formationName: 'Surma Group', topDepth: 2360, bottomDepth: 2860, topTVD: 2330, bottomTVD: 2810, lithology: 'Shale/Sand', reservoir: false, confidence: 0.92 },
      { formationName: 'Barail Sandstone', topDepth: 2860, bottomDepth: 3460, topTVD: 2810, bottomTVD: 3390, lithology: 'Sandstone', reservoir: true, confidence: 0.96 },
      { formationName: 'Kopili Shale', topDepth: 3460, bottomDepth: 3970, topTVD: 3390, bottomTVD: 3880, lithology: 'Shale', reservoir: false, confidence: 0.94 },
    ],
    trajectories: [
      { measuredDepth: 0, trueVerticalDepth: 0, inclination: 0, azimuth: 0, latitude: 27.345, longitude: 95.375, dogLegSeverity: 0 },
      { measuredDepth: 2200, trueVerticalDepth: 2195, inclination: 3.8, azimuth: 50, latitude: 27.3454, longitude: 95.3755, dogLegSeverity: 0.05 },
    ],
    drillingSamples: [
      { timestamp: '2024-03-24T10:00:00Z', measuredDepth: 2200, rop: 16.0, wob: 95, rpm: 120, torque: 9.8, hookLoad: 830, standpipePressure: 175, flowRate: 2300, blockPosition: 11.5, blockSpeed: 0.05 },
    ],
    mudSamples: [
      { timestamp: '2024-03-24T10:00:00Z', measuredDepth: 2200, mudWeight: 1.18, plasticViscosity: 20, yieldPoint: 17, funnelViscosity: 51, fluidLoss: 6.2, ph: 9.3, chlorides: 2700, solids: 9.8, flowRate: 2300, pitVolume: 62, gasReading: 14 },
    ],
    events: [],
    casingSections: [],
    cementingJobs: [],
    documents: [],
  },
];
