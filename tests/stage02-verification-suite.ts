/**
 * NWIS Stage 02 — Automated Verification Test Suite
 *
 * Covers:
 * 1. Document Extraction & Page-Boundary Preservation
 * 2. Semantic Chunking & Local Embedding Vectors
 * 3. Domain Entity Extraction (Wells, Depths, Formations, Events, Mitigations)
 * 4. Multi-Factor Well Similarity & Explainability
 * 5. Precedent Engine Detection (Scenario: SYN-020 at 3200m in Barail/Gamma)
 * 6. Hybrid Search (Vector + Keyword + Metadata)
 * 7. Grounded RAG Assistant & Source Citations
 * 8. Critical Anti-Hallucination Guardrails (Non-existent wells, impossible depths)
 */

import { DomainNLPUtils, VectorUtils, SpatialUtils } from '../packages/utils/src';
import { EventType, EventSeverity } from '../packages/types/src';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✔ ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✘ FAILED: ${testName}`);
    if (details) console.error('    Details:', details);
  }
}

async function runStage02Suite() {
  console.log('============================================================');
  console.log('NWIS Stage 02 — AI Intelligence & Precedent Engine Test Suite');
  console.log('============================================================');

  // --- SUITE 1: Vector Utilities & Embeddings ---
  console.log('\n--- 1. Vector Operations & Semantic Embeddings ---');
  const vec1 = VectorUtils.generateLocalEmbedding('stuck pipe drill string torque spike', 64);
  const vec2 = VectorUtils.generateLocalEmbedding('drill string became stuck after torque increased', 64);
  const vec3 = VectorUtils.generateLocalEmbedding('lost circulation mud losses fractured clay', 64);
  const vecZero = VectorUtils.generateLocalEmbedding('', 64);

  const simRelated = VectorUtils.cosineSimilarity(vec1, vec2);
  const simUnrelated = VectorUtils.cosineSimilarity(vec1, vec3);

  assert(vec1.length === 64, 'Embedding dimensions match requested 64-dim vector');
  assert(simRelated > 0.5, `Semantically related drilling terms have high cosine similarity (${simRelated.toFixed(3)})`);
  assert(simRelated > simUnrelated, `Related terms score higher than unrelated terms (${simRelated.toFixed(3)} > ${simUnrelated.toFixed(3)})`);
  assert(VectorUtils.cosineSimilarity(vec1, vecZero) === 0, 'Empty vector comparison returns 0');

  // --- SUITE 2: Domain NLP Entity Extraction ---
  console.log('\n--- 2. Domain NLP Entity Extraction ---');
  const sampleNarrative = `
    At approximately 3210 m MD, an increase in torque was observed up to 34.5 kN.m.
    ROP decreased from 14 m/h to 4.1 m/h. Drill string subsequently became stuck in Barail Sandstone.
    Action: Spotted 12 m3 organic lubricant soaking pill across BHA and jarred upward.
    Outcome: Recovered full rotation after 18 hours.
    Lesson Learned: Maintain low-rate circulation during connection in reactive carbonaceous shale.
  `;

  const extracted = DomainNLPUtils.extractAll(sampleNarrative);

  assert(extracted.depths.some((d) => d.value === 3210), 'Extracted measured depth 3210m MD');
  assert(extracted.formations.some((f) => f.name.includes('Barail')), 'Extracted formation name Barail Sandstone');
  assert(extracted.events.some((e) => e.eventType === EventType.STUCK_PIPE), 'Extracted operational event STUCK_PIPE');
  assert(
    extracted.events.some((e) => e.precedingIndicators?.includes('TORQUE_SPIKE') && e.precedingIndicators?.includes('ROP_DECREASE')),
    'Extracted precursor indicators (TORQUE_SPIKE, ROP_DECREASE)',
  );
  assert(extracted.mitigations.length > 0, 'Extracted mitigation action');
  assert(extracted.lessonsLearned.length > 0, 'Extracted explicit operational lessons learned');

  // --- SUITE 3: HTTP API Precedent Engine (SYN-020 Scenario) ---
  console.log('\n--- 3. Precedent Engine Live API Tests ---');
  const precedentRes = await fetch('http://localhost:4000/api/v1/intelligence/precedents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wellId: 'OIL-SYN-020',
      targetDepth: 3200,
      formationName: 'Formation Gamma',
      parameters: { torque: 34, rop: 4 },
    }),
  });
  const precedentData = await precedentRes.json();

  assert(precedentRes.status === 200 || precedentRes.status === 201, 'Precedent Engine endpoint returns HTTP 200/201');
  assert(precedentData.detectedCount >= 3, `Detected 3 or more historical precedents (Found: ${precedentData.detectedCount})`);

  const precedentWells = precedentData.precedents?.map((p: any) => p.wellId) || [];
  assert(
    precedentWells.includes('OIL-SYN-003') && precedentWells.includes('OIL-SYN-007') && precedentWells.includes('OIL-SYN-012'),
    'Historical precedents correctly include offset wells OIL-SYN-003, OIL-SYN-007, and OIL-SYN-012',
  );

  const topPrecedent = precedentData.precedents[0];
  assert(topPrecedent.similarityScore > 0.6, `Top precedent has strong similarity score (${(topPrecedent.similarityScore * 100).toFixed(0)}%)`);
  assert(topPrecedent.relevanceExplanation.length > 0, 'Precedent provides human-explainable relevance reasons');
  assert(topPrecedent.evidence.length > 0, 'Precedent attaches document evidence citations');

  // --- SUITE 4: Multi-Factor Well Similarity & Comparison ---
  console.log('\n--- 4. Well Similarity & Cross-Well Comparison ---');
  const compRes = await fetch('http://localhost:4000/api/v1/intelligence/compare?wellA=OIL-SYN-020&wellB=OIL-SYN-003');
  const compData = await compRes.json();

  assert(compRes.status === 200, 'Cross-well comparison endpoint returns HTTP 200');
  assert(compData.distanceKm > 0 && compData.distanceKm < 20, `Calculated geodesic distance between wells (${compData.distanceKm} km)`);
  assert(compData.similarityScore > 0.7, `Computed high overall similarity (${(compData.similarityScore * 100).toFixed(0)}%)`);
  assert(compData.similarityBreakdown.formation > 0, 'Evaluated formation overlap in breakdown');
  assert(compData.formationOverlap.shared.length > 0, 'Identified shared geological formations');
  assert(compData.explanations.length > 0, 'Generated transparent similarity explanations');

  // --- SUITE 5: Hybrid Search LIVE API ---
  console.log('\n--- 5. Hybrid Search Live API Tests ---');
  const searchRes = await fetch('http://localhost:4000/api/v1/intelligence/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'stuck pipe torque spike',
      depth: 3200,
    }),
  });
  const searchData = await searchRes.json();

  assert(searchRes.status === 200 || searchRes.status === 201, 'Hybrid search endpoint returns HTTP 200/201');
  assert(searchData.totalFound > 0, `Hybrid search found matching records (Count: ${searchData.totalFound})`);
  assert(searchData.results[0].relevanceScore > 0.5, 'Top search result has high relevance score');
  assert(searchData.results[0].sourceDocument !== null, 'Search result cites source document');

  // --- SUITE 6: Grounded RAG Assistant & Anti-Hallucination ---
  console.log('\n--- 6. Grounded RAG Assistant & Anti-Hallucination Guardrails ---');

  // Grounded question
  const ragRes1 = await fetch('http://localhost:4000/api/v1/intelligence/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'What happened in comparable wells around 3200m depth?',
      currentWellId: 'OIL-SYN-020',
      currentDepth: 3200,
    }),
  });
  const ragData1 = await ragRes1.json();

  assert(ragData1.grounded === true, 'Valid query marked as grounded (grounded: true)');
  assert(ragData1.evidenceSources.length > 0, 'RAG response includes verified document evidence citations');
  assert(ragData1.answer.includes('OIL-SYN-003') || ragData1.answer.includes('OIL-SYN-012'), 'Answer cites specific comparable wells');

  // Anti-hallucination test 1: Non-existent well
  const ragRes2 = await fetch('http://localhost:4000/api/v1/intelligence/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'What was the mud weight in well OIL-SYN-999?',
    }),
  });
  const ragData2 = await ragRes2.json();

  assert(ragData2.grounded === false, 'Non-existent well query correctly flagged as ungrounded (grounded: false)');
  assert(
    ragData2.answer.includes('No matching evidence was found') && ragData2.answer.includes('OIL-SYN-999'),
    'Non-existent well premise explicitly rejected without fabrication',
  );

  // Anti-hallucination test 2: Impossible depth
  const ragRes3 = await fetch('http://localhost:4000/api/v1/intelligence/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'What happened at 9000m depth in OIL-SYN-001?',
      currentWellId: 'OIL-SYN-001',
      currentDepth: 9000,
    }),
  });
  const ragData3 = await ragRes3.json();

  assert(ragData3.grounded === false, 'Impossible depth query correctly flagged as ungrounded (grounded: false)');
  assert(
    ragData3.answer.includes('No matching evidence was found') && ragData3.answer.includes('exceeds the well boundaries'),
    'Impossible depth premise rejected based on well total depth',
  );

  // --- SUITE 7: Knowledge Base & Document Chunks ---
  console.log('\n--- 7. Document Intelligence & Semantic Chunks ---');
  const docRes = await fetch('http://localhost:4000/api/v1/knowledge/documents');
  const docData = await docRes.json();

  assert(Array.isArray(docData) && docData.length > 0, `Indexed drilling reports exist (Count: ${docData.length})`);
  const sampleDocs = docData.filter((d: any) => d.storagePath?.startsWith('data/samples'));
  assert(sampleDocs.length >= 5, `All 5 sample drilling reports found in knowledge base (Found: ${sampleDocs.length})`);
  assert(sampleDocs.every((d: any) => d.processingStatus === 'COMPLETED'), 'All sample documents processed to COMPLETED state');
  assert(sampleDocs.every((d: any) => d._count.chunks > 0), 'All sample documents have semantic chunks created');

  console.log('\n------------------------------------------------------------');
  console.log(`Test Summary: ${passedTests} Passed, ${failedTests} Failed (Total: ${totalTests})`);
  if (failedTests === 0) {
    console.log('Status: STAGE 02 VERIFICATION SUCCESSFUL');
  } else {
    console.error('Status: STAGE 02 VERIFICATION FAILED');
    process.exit(1);
  }
  console.log('============================================================');
}

runStage02Suite().catch((err) => {
  console.error('Suite crashed:', err);
  process.exit(1);
});
