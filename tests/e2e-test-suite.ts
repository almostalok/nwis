import { prisma, spatialRepository } from '@nwis/database';
import { UnitNormalizer, EventNormalizer, SpatialUtils } from '@nwis/utils';
import {
  createWellSchema,
  createFormationIntervalSchema,
  createOperationalEventSchema,
  nearbyWellsQuerySchema,
} from '@nwis/validation';
import { EventType, WellStatus, WellType, DataSourceType } from '@nwis/types';
import { IngestionService } from '../apps/api/src/ingestion/ingestion.service';
import * as dotenv from 'dotenv';

dotenv.config();

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('   NWIS STAGE 01 — AUTOMATED VERIFICATION SUITE       ');
  console.log('======================================================\n');

  // 1. DATABASE & SEED DATA INTEGRITY
  console.log('[1/7] Testing Database Seed & Record Counts...');
  const wellCount = await prisma.well.count();
  assert(wellCount >= 20, `Database contains at least 20 wells (Found: ${wellCount})`);

  const formationCount = await prisma.formationInterval.count();
  assert(formationCount >= 50, `Database contains formations across wells (Found: ${formationCount})`);

  const eventCount = await prisma.operationalEvent.count();
  assert(eventCount >= 5, `Database contains precedent events (Found: ${eventCount})`);

  const usersCount = await prisma.user.count();
  assert(usersCount >= 6, `Database contains 6 RBAC personas (Found: ${usersCount})`);

  // 2. GEOSPATIAL POSTGIS / SPATIAL RADIUS SEARCH
  console.log('\n[2/7] Testing PostGIS / Spatial Radius Queries...');
  // Query wells within 10 km of OIL-SYN-001 (lat: 27.325, lng: 95.312)
  const nearby = await spatialRepository.findNearbyWells({
    latitude: 27.325,
    longitude: 95.312,
    radiusKm: 10,
    limit: 20,
  });

  assert(nearby.length > 0, `Nearby radius search returned wells within 10km (Found: ${nearby.length})`);
  assert(nearby[0].wellId === 'OIL-SYN-001', `First result is the search origin well OIL-SYN-001 (Distance: ${nearby[0].distanceKm} km)`);
  assert(nearby[0].distanceKm <= 0.05, `Origin well distance is approximately 0 km (${nearby[0].distanceKm} km)`);

  // Distance monotonicity check
  let isSorted = true;
  for (let i = 1; i < nearby.length; i++) {
    if (nearby[i].distanceKm < nearby[i - 1].distanceKm) {
      isSorted = false;
      break;
    }
  }
  assert(isSorted, `Nearby wells are correctly sorted in ascending order of proximity`);

  // Radius filtering with formation constraint
  const nearbyBarail = await spatialRepository.findNearbyWells({
    latitude: 27.325,
    longitude: 95.312,
    radiusKm: 15,
    formation: 'Barail',
  });
  assert(
    nearbyBarail.length > 0 && nearbyBarail.every((w) => w.formationSummary.some((f) => f.includes('Barail'))),
    `Spatial radius query with formation filter ('Barail') correctly filters results`
  );

  // 3. HISTORICAL PRECEDENT CORRELATION (SECTION 25 & 30)
  console.log('\n[3/7] Testing Historical Precedent Discovery & Correlation...');
  // Well 003, Well 007, and Well 012 in Barail Sandstone at ~3200m depth
  const stuckPipePrecedents = await prisma.operationalEvent.findMany({
    where: {
      eventType: EventType.STUCK_PIPE,
      startDepth: { gte: 3150, lte: 3250 },
      formation: { formationName: { contains: 'Barail' } },
    },
    include: { well: true, formation: true },
  });

  assert(
    stuckPipePrecedents.length >= 3,
    `Discovered 3 recurrent stuck pipe precedents in Barail Sandstone (~3200m MD) (Found: ${stuckPipePrecedents.length})`
  );

  const precedentWellIds = stuckPipePrecedents.map((p) => p.well.wellId);
  assert(
    precedentWellIds.includes('OIL-SYN-003') &&
      precedentWellIds.includes('OIL-SYN-007') &&
      precedentWellIds.includes('OIL-SYN-012'),
    `Precedent wells correctly identify OIL-SYN-003, OIL-SYN-007, and OIL-SYN-012`
  );

  // Lost circulation precedent in Tipam Sandstone (~2120m)
  const lossPrecedents = await prisma.operationalEvent.findMany({
    where: {
      eventType: EventType.LOST_CIRCULATION,
      startDepth: { gte: 2100, lte: 2150 },
    },
    include: { well: true },
  });
  assert(
    lossPrecedents.length >= 2,
    `Discovered recurrent lost circulation precedents in Tipam Sandstone (~2120m MD) (Found: ${lossPrecedents.length})`
  );

  // 4. CANONICAL UNIT NORMALIZATION (SECTION 26)
  console.log('\n[4/7] Testing Canonical Unit Normalization...');
  assert(UnitNormalizer.depthToMeters(10000, 'ft') === 3048, `Depth: 10,000 ft -> 3048 m`);
  assert(UnitNormalizer.depthToMeters(3048, 'm') === 3048, `Depth: 3,048 m -> 3048 m`);
  assert(UnitNormalizer.pressureToBar(3000, 'psi') === 206.84, `Pressure: 3,000 psi -> 206.84 bar`);
  assert(UnitNormalizer.pressureToBar(20000, 'kpa') === 200, `Pressure: 20,000 kPa -> 200 bar`);
  assert(UnitNormalizer.torqueToKNm(15000, 'ft-lb') === 20.337, `Torque: 15,000 ft-lb -> 20.337 kN.m`);
  assert(UnitNormalizer.temperatureToCelsius(212, 'f') === 100.0, `Temperature: 212 °F -> 100.0 °C`);
  assert(UnitNormalizer.mudWeightToSG(10, 'ppg') === 1.198, `Mud Weight: 10 ppg -> 1.198 sg`);
  assert(UnitNormalizer.flowRateToLPM(600, 'gpm') === 2271.2, `Flow Rate: 600 gpm -> 2271.2 lpm`);

  // 5. EVENT TERMINOLOGY & SYNONYM MAPPING (SECTION 26)
  console.log('\n[5/7] Testing Event Terminology Normalizer...');
  assert(EventNormalizer.normalize('stuck pipe').eventType === EventType.STUCK_PIPE, `"stuck pipe" -> STUCK_PIPE`);
  assert(EventNormalizer.normalize('differential sticking in hole').eventType === EventType.STUCK_PIPE, `"differential sticking in hole" -> STUCK_PIPE`);
  assert(EventNormalizer.normalize('severe mud loss encountered').eventType === EventType.LOST_CIRCULATION, `"severe mud loss encountered" -> LOST_CIRCULATION`);
  assert(EventNormalizer.normalize('gas influx and pit gain').eventType === EventType.KICK, `"gas influx and pit gain" -> KICK`);
  assert(EventNormalizer.normalize('parted drill string in hole').eventType === EventType.FISHING, `"parted drill string in hole" -> FISHING`);
  assert(EventNormalizer.normalize('tight hole with sloughing shale').eventType === EventType.FORMATION_INSTABILITY, `"tight hole with sloughing shale" -> FORMATION_INSTABILITY`);
  assert(EventNormalizer.normalize('rotary torque spike on bottom').eventType === EventType.TORQUE_SPIKE, `"rotary torque spike on bottom" -> TORQUE_SPIKE`);

  // 6. SCHEMA VALIDATION & ANOMALY REJECTION (SECTION 31)
  console.log('\n[6/7] Testing Zod Schema Validation...');
  // Valid well
  const validWell = createWellSchema.safeParse({
    wellId: 'OIL-SYN-TEST',
    name: 'Test Validation Well',
    field: 'NWIS-DEMO-FIELD',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.DRILLING,
    totalDepth: 3500,
    latitude: 27.32,
    longitude: 95.31,
  });
  assert(validWell.success, `Valid well data passes schema validation`);

  // Invalid coordinates (lat > 90)
  const invalidLat = createWellSchema.safeParse({
    wellId: 'OIL-SYN-BAD-LAT',
    name: 'Bad Lat Well',
    field: 'NWIS-DEMO-FIELD',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.DRILLING,
    totalDepth: 3500,
    latitude: 105.0, // Invalid > 90
    longitude: 95.31,
  });
  assert(!invalidLat.success, `Rejects latitude > 90°`);

  // Invalid depth (negative)
  const negativeDepth = createWellSchema.safeParse({
    wellId: 'OIL-SYN-BAD-DEPTH',
    name: 'Bad Depth Well',
    field: 'NWIS-DEMO-FIELD',
    wellType: WellType.DEVELOPMENT,
    status: WellStatus.DRILLING,
    totalDepth: -450, // Invalid negative
    latitude: 27.32,
    longitude: 95.31,
  });
  assert(!negativeDepth.success, `Rejects negative total depth`);

  // Invalid formation (top >= bottom)
  const invertedFormation = createFormationIntervalSchema.safeParse({
    formationName: 'Bad Formation',
    topDepth: 3500,
    bottomDepth: 3200, // Inverted!
    lithology: 'Sandstone',
  });
  assert(!invertedFormation.success, `Rejects inverted formation interval (topDepth >= bottomDepth)`);

  // 7. INGESTION PIPELINE EXECUTION (SECTION 18)
  console.log('\n[7/7] Testing Canonical Ingestion Pipeline...');
  const ingestionService = new IngestionService();

  const testCsvPayload = `wellId,name,field,operator,wellType,status,spudDate,completionDate,totalDepth,latitude,longitude
OIL-SYN-TEST-99,NWIS Automated Ingestion Test,NWIS-DEMO-FIELD,Oil India Limited (Synthetic Operations),DEVELOPMENT,PLANNED,2024-05-01T00:00:00Z,,4100.0,27.333,95.315
OIL-SYN-INVALID-LAT,Invalid Lat Well,NWIS-DEMO-FIELD,Oil India Limited (Synthetic Operations),DEVELOPMENT,PLANNED,2024-05-01T00:00:00Z,,4100.0,150.0,95.315`;

  const importResult = await ingestionService.importData({
    sourceName: 'TEST-PIPELINE-SOURCE',
    sourceType: DataSourceType.CSV,
    entityType: 'WELL',
    payload: testCsvPayload,
  });

  assert(importResult.processedCount === 2, `Ingestion pipeline processed 2 records`);
  assert(importResult.validCount === 1, `Ingestion pipeline accepted 1 valid record`);
  assert(importResult.errorCount === 1, `Ingestion pipeline rejected 1 invalid record without crashing`);

  // Verify record reached database
  const ingestedWell = await prisma.well.findUnique({
    where: { wellId: 'OIL-SYN-TEST-99' },
  });
  assert(ingestedWell !== null && ingestedWell.wellId === 'OIL-SYN-TEST-99', `Accepted record persisted in database`);

  // Clean up test record
  if (ingestedWell) {
    await prisma.well.delete({ where: { id: ingestedWell.id } });
  }

  // SUMMARY
  console.log('\n======================================================');
  console.log(`VERIFICATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .catch((err) => {
    console.error('Test suite failed with unexpected error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
