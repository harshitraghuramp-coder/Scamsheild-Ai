import assert from 'assert';

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

async function runDemoProfileTests() {
  console.log('\n--- Running Demo Profiles – Explore ScamShield AI Test Suite ---');

  // Test 1: Fetch Predefined Demo Profiles List
  console.log('\n1. Testing GET /api/auth/demo/profiles:');
  const listRes = await fetch(`${BASE_URL}/api/auth/demo/profiles`);
  assert.strictEqual(listRes.status, 200);
  const listData = await listRes.json();
  assert.strictEqual(listData.success, true);
  assert.strictEqual(listData.profiles.length, 4, 'Must define exactly 4 demo profiles');
  assert.ok(listData.disclaimer.includes('DEMO MODE NOTICE'), 'Must contain simulation disclaimer');

  const profileIds = listData.profiles.map((p) => p.id);
  assert.ok(profileIds.includes('basic_user'), 'Basic User profile must exist');
  assert.ok(profileIds.includes('security_enthusiast'), 'Security Enthusiast profile must exist');
  assert.ok(profileIds.includes('victim_simulation'), 'Victim Simulation profile must exist');
  assert.ok(profileIds.includes('intelligence_viewer'), 'Intelligence Viewer profile must exist');
  console.log('✅ PASSED: All 4 demo profiles retrieved with descriptions, access tiers, and disclaimer');

  // Test 2: Launch Profile 1 - Basic User
  console.log('\n2. Testing Launch Profile 1: Basic User (Alex Chen):');
  {
    const launchRes = await fetch(`${BASE_URL}/api/auth/demo/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: 'basic_user' }),
    });
    assert.strictEqual(launchRes.status, 200);
    const data = await launchRes.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.role, 'DEMO_USER');
    assert.strictEqual(data.user.isDemo, true);
    assert.strictEqual(data.user.demoProfileId, 'basic_user');
    assert.strictEqual(data.demoProfile.defaultNav, 'dashboard');
    assert.ok(data.sessionToken, 'Demo session token issued');
    console.log('✅ PASSED: Basic User launched with isolated DEMO_USER session and dashboard routing');
  }

  // Test 3: Launch Profile 2 - Security Enthusiast
  console.log('\n3. Testing Launch Profile 2: Security Enthusiast (Priya Nair):');
  {
    const launchRes = await fetch(`${BASE_URL}/api/auth/demo/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: 'security_enthusiast' }),
    });
    assert.strictEqual(launchRes.status, 200);
    const data = await launchRes.json();
    assert.strictEqual(data.user.demoProfileId, 'security_enthusiast');
    assert.strictEqual(data.demoProfile.accessLevel, 'Advanced Forensics Tier');
    assert.ok(data.demoProfile.features.includes('App Authenticity & Trojan APK Inspector'));
    console.log('✅ PASSED: Security Enthusiast launched with multi-modal scanner permissions');
  }

  // Test 4: Launch Profile 3 - Scam Victim Simulation
  console.log('\n4. Testing Launch Profile 3: Scam Victim Simulation (Rahul Verma):');
  {
    const launchRes = await fetch(`${BASE_URL}/api/auth/demo/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: 'victim_simulation' }),
    });
    assert.strictEqual(launchRes.status, 200);
    const data = await launchRes.json();
    assert.strictEqual(data.user.demoProfileId, 'victim_simulation');
    assert.strictEqual(data.demoProfile.defaultNav, 'emergency_help');
    assert.strictEqual(data.demoProfile.accessLevel, 'Emergency Cyber Help & Containment');
    console.log('✅ PASSED: Victim Simulation launched with Emergency Cyber Help default view');
  }

  // Test 5: Launch Profile 4 - Intelligence Viewer
  console.log('\n5. Testing Launch Profile 4: Threat Intel Viewer (Dr. Arvind Mehta):');
  let intelSessionToken = '';
  {
    const launchRes = await fetch(`${BASE_URL}/api/auth/demo/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: 'intelligence_viewer' }),
    });
    assert.strictEqual(launchRes.status, 200);
    const data = await launchRes.json();
    assert.strictEqual(data.user.demoProfileId, 'intelligence_viewer');
    assert.strictEqual(data.demoProfile.defaultNav, 'live_scam_tracker');
    intelSessionToken = data.sessionToken;
    console.log('✅ PASSED: Intelligence Viewer launched with Live Scam Tracker default view');
  }

  // Test 6: Verify Demo Session Inspection (/api/auth/me)
  console.log('\n6. Testing /api/auth/me for Demo User Metadata:');
  {
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${intelSessionToken}` },
    });
    assert.strictEqual(meRes.status, 200);
    const meData = await meRes.json();
    assert.strictEqual(meData.authenticated, true);
    assert.strictEqual(meData.user.isDemo, true);
    assert.strictEqual(meData.user.role, 'DEMO_USER');
    console.log('✅ PASSED: Demo mode metadata correctly reflected in user session state');
  }

  // Test 7: Exit Demo Mode
  console.log('\n7. Testing POST /api/auth/demo/exit:');
  {
    const exitRes = await fetch(`${BASE_URL}/api/auth/demo/exit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${intelSessionToken}` },
    });
    assert.strictEqual(exitRes.status, 200);
    const exitData = await exitRes.json();
    assert.strictEqual(exitData.success, true);

    // Verify session revoked
    const postExitMe = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${intelSessionToken}` },
    });
    const postData = await postExitMe.json();
    assert.strictEqual(postData.authenticated, false, 'Revoked demo session must not authenticate');
    console.log('✅ PASSED: Demo session revoked cleanly and user returned to guest/unauthenticated state');
  }

  console.log('\n🎉 ALL 7 DEMO PROFILE SUITES PASSED SUCCESSFULLY!\n');
}

runDemoProfileTests().catch((err) => {
  console.error('\n❌ Demo Profiles Test Failure:', err);
  process.exit(1);
});
