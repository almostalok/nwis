/**
 * NWIS Stage 04 Integration Suite: Final Integration, Hardening, Model Governance & Safety Mandate
 * Oil India Limited (OIL) — Problem Statement SIH26121
 */

import { HealthService } from '../apps/api/src/health/health.service';
import { ModelsService } from '../apps/api/src/models/models.service';
import { ReportsService } from '../apps/api/src/reports/reports.service';
import { WellsService } from '../apps/api/src/wells/wells.service';
import { DataQualityService } from '../apps/api/src/data-quality/data-quality.service';
import { DrillingSimulatorService } from '../apps/api/src/realtime/simulator/drilling-simulator.service';
import { FeatureEngineService } from '../apps/api/src/realtime/features/feature-engine.service';
import { SyntheticLiveStreamAdapter } from '../apps/api/src/realtime/adapters/synthetic-live-stream.adapter';
import { StreamEventService } from '../apps/api/src/realtime/stream/stream-event.service';
import { AnomalyEngineService } from '../apps/api/src/realtime/anomaly/anomaly-engine.service';
import { StuckPipeRiskEngine } from '../apps/api/src/realtime/risk/stuck-pipe-risk.engine';
import { LostCirculationRiskEngine } from '../apps/api/src/realtime/risk/lost-circulation-risk.engine';
import { KickRiskEngine } from '../apps/api/src/realtime/risk/kick-risk.engine';
import { TorqueRiskEngine } from '../apps/api/src/realtime/risk/torque-risk.engine';
import { CementingRiskEngine } from '../apps/api/src/realtime/risk/cementing-risk.engine';
import { RiskFusionEngine } from '../apps/api/src/realtime/risk/risk-fusion.engine';
import { AlertEngineService } from '../apps/api/src/realtime/alerts/alert-engine.service';
import { PrecedentEngineService } from '../apps/api/src/intelligence/precedent-engine.service';
import { HybridSearchService } from '../apps/api/src/intelligence/hybrid-search.service';
import { DocumentChunkerService } from '../apps/api/src/knowledge/chunker.service';
import { DocumentExtractorService } from '../apps/api/src/knowledge/pdf-extractor.service';
import { KnowledgeService } from '../apps/api/src/knowledge/knowledge.service';
import { EventDeduplicationService } from '../apps/api/src/knowledge/event-deduplication.service';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `— ${details}` : ''}`);
    failedTests++;
  }
}

async function runStage04Suite() {
  console.log('================================================================');
  console.log('  NWIS STAGE 04 INTEGRATION & HARDENING VERIFICATION SUITE');
  console.log('  Oil India Limited (OIL) — Problem Statement SIH26121');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Section 1: Health Probes & Dependency Architecture
  // -------------------------------------------------------------
  console.log('--- Section 1: System Health Probes & Subsystems ---');
  const healthService = new HealthService();

  const health = await healthService.checkHealth();
  assert(health.status === 'HEALTHY', 'checkHealth returns HEALTHY status');
  assert(health.checks.database.status === 'UP', 'PostgreSQL database probe reports UP');
  assert(typeof health.checks.database.latencyMs === 'number', 'Database latency is measured in ms');
  assert(health.checks.memory.heapUsedMb > 0, 'Memory usage tracking active');

  const liveness = await healthService.checkLiveness();
  assert(liveness.status === 'OK', 'checkLiveness probe returns OK');

  const readiness = await healthService.checkReadiness();
  assert(readiness.status === 'READY', 'checkReadiness probe returns READY');
  assert(readiness.database === 'CONNECTED', 'checkReadiness confirms database CONNECTED');

  const dependencies = healthService.getDependencies();
  assert(dependencies.subsystems.length >= 4, 'Reports all key subsystems (PostGIS, Vector, Realtime, Risk)');
  assert(dependencies.oilCompatibility.includes('eRTMAC'), 'OIL eRTMAC compatibility declared');
  assert(dependencies.role.includes('Decision-Support'), 'Declares Decision-Support Advisory System role');

  // -------------------------------------------------------------
  // Section 2: Model Registry, Benchmarks & Safety Mandate
  // -------------------------------------------------------------
  console.log('\n--- Section 2: Model Registry, Benchmarks & Safety Governance ---');
  const modelsService = new ModelsService();

  const allModels = modelsService.getAllModels();
  assert(allModels.length === 6, 'All 6 hazard risk and NLP models registered');

  const stuckPipeModel = modelsService.getModelById('stuck-pipe-fusion-engine');
  assert(stuckPipeModel.category === 'HAZARD_RISK', 'Stuck pipe model registered under HAZARD_RISK');
  assert(stuckPipeModel.metrics.f1Score > 0.90, 'Stuck pipe model achieves >90% validated F1 score');
  assert(stuckPipeModel.metrics.precision > 0.90, 'Stuck pipe model precision exceeds 90%');
  assert(stuckPipeModel.metrics.recall > 0.90, 'Stuck pipe model recall exceeds 90%');
  assert(stuckPipeModel.metrics.meanLeadTimeMinutes! >= 20, 'Stuck pipe mean early warning lead time exceeds 20 minutes');
  assert(stuckPipeModel.metrics.falseAlarmRatePercent < 5.0, 'Stuck pipe false alarm rate is below 5.0% threshold');
  assert(stuckPipeModel.driftStatus.state === 'STABLE', 'Kolmogorov-Smirnov data drift status is STABLE');

  // Verify Safety Mandate on all models
  allModels.forEach((m) => {
    assert(m.safetyMandate.isAutonomous === false, `Model [${m.id}] enforces isAutonomous = false`);
    assert(m.safetyMandate.advisoryOnly === true, `Model [${m.id}] enforces advisoryOnly = true`);
    assert(m.safetyMandate.controlRigHardware === false, `Model [${m.id}] enforces controlRigHardware = false`);
  });

  const embedderModel = modelsService.getModelById('hybrid-semantic-embedder');
  assert(embedderModel.category === 'SEMANTIC_NLP', '64-dim embedder categorized under SEMANTIC_NLP');
  assert(embedderModel.metrics.f1Score > 0.90, 'Semantic embedder retrieval F1 exceeds 90%');

  // -------------------------------------------------------------
  // Section 3: Executive Reporting & Intelligence Dossiers
  // -------------------------------------------------------------
  console.log('\n--- Section 3: Executive Reporting & Intelligence Dossiers ---');
  const wellsService = new WellsService();
  const dataQualityService = new DataQualityService();
  const reportsService = new ReportsService(wellsService, dataQualityService);

  const dailyReport = await reportsService.generateDailyOperationalReport();
  assert(dailyReport.wellsCount >= 20, 'Daily report counts all 20 OIL wells');
  assert(dailyReport.drillingWellsCount > 0, 'Daily report identifies active drilling wells');
  assert(typeof dailyReport.dataQualityScore === 'number', 'Daily report includes data quality score');
  assert(dailyReport.markdownReport.toUpperCase().includes('OIL INDIA LIMITED'), 'Daily report markdown formatted with OIL header');

  const wellReport = await reportsService.generateWellIntelligenceReport('OIL-SYN-001');
  assert(wellReport.wellId === 'OIL-SYN-001', 'Well intelligence dossier generated for OIL-SYN-001');
  assert(wellReport.formations.length > 0, 'Well dossier includes stratigraphic formations');
  assert(wellReport.nearbyOffsetWells.length > 0, 'Well dossier includes nearby offset wells within radius');
  assert(wellReport.markdownReport.includes('STRATIGRAPHIC COLUMN'), 'Well dossier contains stratigraphic column section');
  assert(wellReport.markdownReport.includes('HISTORICAL OFFSET PRECEDENTS'), 'Well dossier contains historical precedent section');

  // -------------------------------------------------------------
  // Section 4: Simulator Reset & State Isolation
  // -------------------------------------------------------------
  console.log('\n--- Section 4: Simulator Reset & State Isolation ---');
  const syntheticAdapter = new SyntheticLiveStreamAdapter();
  const featureEngine = new FeatureEngineService();
  const streamService = new StreamEventService();
  const anomalyEngine = new AnomalyEngineService();
  const stuckPipeEngine = new StuckPipeRiskEngine();
  const lostCircEngine = new LostCirculationRiskEngine();
  const kickEngine = new KickRiskEngine();
  const torqueEngine = new TorqueRiskEngine();
  const cementingEngine = new CementingRiskEngine();
  const precedentEngine = new PrecedentEngineService(wellsService);
  const riskFusion = new RiskFusionEngine(
    stuckPipeEngine,
    lostCircEngine,
    kickEngine,
    torqueEngine,
    cementingEngine,
    precedentEngine
  );
  const alertEngine = new AlertEngineService(streamService);

  const simulator = new DrillingSimulatorService(
    syntheticAdapter,
    featureEngine,
    anomalyEngine,
    riskFusion,
    alertEngine,
    streamService
  );

  const resetResult = simulator.resetAllSimulations();
  assert(resetResult.status === 'ALL_RESET', 'resetAllSimulations successfully clears all active sessions');
  assert(typeof resetResult.stoppedCount === 'number', 'Reports number of cleared simulation sessions');

  // -------------------------------------------------------------
  // Section 5: Data Quality & ISO 19157 Assurance
  // -------------------------------------------------------------
  console.log('\n--- Section 5: Data Quality & ISO 19157 Standards Assurance ---');
  const qualityReport = await dataQualityService.getReport();
  assert(qualityReport.overallScore >= 0.95, 'Overall data quality score exceeds 95% threshold');
  assert(qualityReport.totalRecords > 100, 'Quality audit evaluates canonical records across all entities');
  assert(qualityReport.wellsEvaluated === 20, 'All 20 OIL wells evaluated for positional & depth validity');
  assert(qualityReport.statusBreakdown.VALID > 0, 'Breakdown records VALID entries');

  // -------------------------------------------------------------
  // Section 6: Knowledge Human-in-the-Loop Verification
  // -------------------------------------------------------------
  console.log('\n--- Section 6: Knowledge Entity Human Verification ---');
  const extractor = new DocumentExtractorService();
  const chunker = new DocumentChunkerService();
  const dedup = new EventDeduplicationService();
  const knowledgeService = new KnowledgeService(extractor, chunker, dedup);

  const docList = await knowledgeService.listDocuments();
  assert(Array.isArray(docList), 'KnowledgeService lists indexed technical documents');

  // -------------------------------------------------------------
  // FINAL SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`  STAGE 04 SUITE SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runStage04Suite().catch((err) => {
  console.error('Unhandled failure in Stage 04 test suite:', err);
  process.exit(1);
});
