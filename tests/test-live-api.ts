async function testApi() {
  console.log('Testing Live Realtime API Endpoints on http://localhost:4000 ...');

  // 0. Authenticate as Lead Drilling Engineer to obtain JWT
  console.log('Authenticating as engineer@nwis.oil.in...');
  const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'engineer@nwis.oil.in', password: 'password123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('✓ Successfully authenticated. User:', loginData.user?.name, '| Role:', loginData.user?.role);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 1. Run simulation with high speed to trigger the precursor phase
  const startRes = await fetch('http://localhost:4000/api/v1/realtime/simulator/start', {
    method: 'POST',
    headers: authHeaders,
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

    // 4. Test Unauthenticated Acknowledge should be rejected with 401
    const unauthAckRes = await fetch(`http://localhost:4000/api/v1/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'Attempting unauthenticated mutation' }),
    });
    console.log('✓ Unauthenticated Mutation Status (Expected 401):', unauthAckRes.status);

    // 5. Test Authenticated Acknowledge
    const ackRes = await fetch(`http://localhost:4000/api/v1/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ note: 'Acknowledged in automated test' }),
    });
    const ackData = await ackRes.json();
    console.log('✓ Acknowledged Result Status:', ackData.status);

    // 6. Test Authenticated Resolve
    const resRes = await fetch(`http://localhost:4000/api/v1/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ note: 'Resolved in automated test' }),
    });
    const resData = await resRes.json();
    console.log('✓ Resolved Result Status:', resData.status);
  }

  // 7. Stop simulation
  await fetch('http://localhost:4000/api/v1/realtime/simulator/stop', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ wellId: 'OIL-SYN-020' }),
  });
    body: JSON.stringify({ wellId: 'OIL-SYN-020' }),
  });
  console.log('Simulation stopped cleanly.');
}

testApi().catch((err) => {
  console.error('Error during API test:', err);
  process.exit(1);
});

