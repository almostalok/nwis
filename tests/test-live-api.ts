async function testApi() {
  console.log('Testing Live Realtime API Endpoints on http://localhost:4000 ...');
  
  // 1. Run simulation with high speed to trigger the precursor phase
  const startRes = await fetch('http://localhost:4000/api/v1/realtime/simulator/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wellId: 'OIL-SYN-020',
      scenario: 'STUCK_PIPE_PRECURSOR',
      speedMultiplier: 50,
      startDepth: 3200,
      endDepth: 3220,
      totalSteps: 25,
    }),
  });

  console.log('Start Simulation Status:', (await startRes.json()).status);

  // Wait 3.5 seconds for ~40-50 ticks to cross the anomaly and warning thresholds
  console.log('Streaming telemetry ticks...');
  await new Promise((r) => setTimeout(r, 3500));

  // 2. Query latest sample
  const latestRes = await fetch('http://localhost:4000/api/v1/realtime/wells/OIL-SYN-020/latest');
  const latestData = await latestRes.json();
  console.log('Latest Sample Depth:', latestData?.measuredDepth, 'm, Torque:', latestData?.torque, 'kNm, Drag:', latestData?.drag, 'kN');

  // 3. Query alerts
  const alertsRes = await fetch('http://localhost:4000/api/v1/alerts');
  const alertsData = await alertsRes.json();
  console.log('Alerts Count:', alertsData?.length);

  if (alertsData && alertsData.length > 0) {
    const alertId = alertsData[0].id;
    console.log('✓ Found Alert:', alertId, '| Title:', alertsData[0].title, '| Status:', alertsData[0].status, '| Score:', alertsData[0].score);

    // 4. Test Acknowledge
    const ackRes = await fetch(`http://localhost:4000/api/v1/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: 'Lead Drilling Engineer', note: 'Acknowledged in automated test' }),
    });
    const ackData = await ackRes.json();
    console.log('✓ Acknowledged Result Status:', ackData.status);

    // 5. Test Resolve
    const resRes = await fetch(`http://localhost:4000/api/v1/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: 'Lead Drilling Engineer', note: 'Resolved in automated test' }),
    });
    const resData = await resRes.json();
    console.log('✓ Resolved Result Status:', resData.status);
  }

  // 6. Stop simulation
  await fetch('http://localhost:4000/api/v1/realtime/simulator/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wellId: 'OIL-SYN-020' }),
  });
  console.log('Simulation stopped cleanly.');
}

testApi().catch((err) => {
  console.error('Error during API test:', err);
  process.exit(1);
});

