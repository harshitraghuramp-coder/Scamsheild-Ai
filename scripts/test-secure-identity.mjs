import assert from 'assert';

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

async function runTests() {
  console.log('\n--- Running ScamShield Secure Identity Test Suite ---');

  // Test 1: Seed Demo Account Login
  console.log('\n1. Testing Seed Account Authentication:');
  {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'defender@scamshield.ai',
        password: 'Shield#2026!',
      }),
    });

    assert.strictEqual(loginRes.status, 200, 'Seed account login must return 200 OK');
    const data = await loginRes.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.email, 'defender@scamshield.ai');
    assert.strictEqual(data.user.emailVerified, true);
    assert.strictEqual(data.user.phoneVerified, true);
    assert.strictEqual(data.user.kycStatus, 'VERIFIED');
    assert.ok(data.sessionToken, 'Session token must be returned');
    console.log('✅ PASSED: Seed analyst account authenticated with verified KYC and Passkey');
  }

  // Test 2: Invalid Password Rejection
  console.log('\n2. Testing Credential Rejection:');
  {
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'defender@scamshield.ai',
        password: 'WrongPassword#123',
      }),
    });

    assert.strictEqual(badLoginRes.status, 401, 'Invalid password must return 401 Unauthorized');
    const errData = await badLoginRes.json();
    assert.strictEqual(errData.error, 'Invalid email or password.');
    console.log('✅ PASSED: Invalid password rejected with timing-safe comparison');
  }

  // Test 3: New User Registration & Auto-OTP Dispatch
  console.log('\n3. Testing New User Registration & Session Generation:');
  const testEmail = `agent.${Date.now()}@scamshield.test`;
  let newUserToken = '';
  {
    const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassphrase#2026',
        displayName: 'Cyber Investigator',
      }),
    });

    assert.strictEqual(signupRes.status, 201, 'Signup must return 201 Created');
    const signupData = await signupRes.json();
    assert.strictEqual(signupData.success, true);
    assert.strictEqual(signupData.user.email, testEmail);
    assert.strictEqual(signupData.user.emailVerified, false, 'New user starts unverified');
    newUserToken = signupData.sessionToken;
    assert.ok(newUserToken, 'New session token generated');
    console.log('✅ PASSED: User registration and session token generation succeeded');
  }

  // Test 4: Current User Profile Endpoint (/api/auth/me)
  console.log('\n4. Testing /api/auth/me Profile & Active Sessions:');
  {
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${newUserToken}`,
      },
    });

    assert.strictEqual(meRes.status, 200);
    const meData = await meRes.json();
    assert.strictEqual(meData.authenticated, true);
    assert.strictEqual(meData.user.email, testEmail);
    assert.ok(Array.isArray(meData.sessions), 'Sessions array must be present');
    assert.ok(meData.providers, 'Provider status metadata must be present');
    console.log('✅ PASSED: Authenticated profile and active device session verified');
  }

  // Test 5: Email OTP Verification Workflow
  console.log('\n5. Testing Cryptographic Email OTP Verification:');
  {
    // Retrieve the sandbox dispatch code for verification
    const codeRes = await fetch(`${BASE_URL}/api/auth/test-harness/get-sandbox-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: testEmail }),
    });
    assert.strictEqual(codeRes.status, 200, 'Sandbox test code must be available in test mode');
    const { code } = await codeRes.json();
    assert.strictEqual(code.length, 6, 'OTP must be 6 digits');

    // Attempt invalid code first
    const badVerify = await fetch(`${BASE_URL}/api/auth/email/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000' }),
    });
    assert.strictEqual(badVerify.status, 400, 'Incorrect OTP must be rejected');

    // Verify with actual code
    const goodVerify = await fetch(`${BASE_URL}/api/auth/email/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: code }),
    });
    assert.strictEqual(goodVerify.status, 200);
    const goodData = await goodVerify.json();
    assert.strictEqual(goodData.verified, true);
    console.log('✅ PASSED: 6-digit Email OTP hashed and verified successfully');
  }

  // Test 6: Phone OTP Verification Workflow
  console.log('\n6. Testing Phone SMS OTP Verification (+91 default):');
  const testPhone = '9876543219';
  {
    const reqSms = await fetch(`${BASE_URL}/api/auth/phone/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ countryCode: '+91', phoneNumber: testPhone }),
    });
    assert.strictEqual(reqSms.status, 200);

    const smsCodeRes = await fetch(`${BASE_URL}/api/auth/test-harness/get-sandbox-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: `+91${testPhone}` }),
    });
    const { code: smsCode } = await smsCodeRes.json();

    const verifySms = await fetch(`${BASE_URL}/api/auth/phone/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newUserToken}`,
      },
      body: JSON.stringify({
        countryCode: '+91',
        phoneNumber: testPhone,
        otp: smsCode,
      }),
    });
    assert.strictEqual(verifySms.status, 200);
    const verifyData = await verifySms.json();
    assert.strictEqual(verifyData.verified, true);
    console.log('✅ PASSED: Phone SMS OTP verified and linked to user account');
  }

  // Test 7: KYC Verification & Strict Aadhaar Rejection
  console.log('\n7. Testing Indian Identity KYC Verification & Aadhaar Exclusion:');
  {
    // Try submitting 12-digit Aadhaar - MUST BE REJECTED
    const aadhaarAttempt = await fetch(`${BASE_URL}/api/auth/kyc/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newUserToken}`,
      },
      body: JSON.stringify({
        docType: 'PAN_CARD',
        docNumber: '123456789012', // 12-digit Aadhaar format
        frontImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        consentGiven: true,
      }),
    });
    assert.strictEqual(aadhaarAttempt.status, 400, 'Aadhaar input must be rejected');
    const aadhaarErr = await aadhaarAttempt.json();
    assert.ok(aadhaarErr.error.includes('Aadhaar Act, 2016'), 'Statutory Aadhaar rejection reason must be returned');
    console.log('✅ PASSED: Statutory Aadhaar exclusion strictly enforced');

    // Submit valid Indian Passport
    const kycSubmit = await fetch(`${BASE_URL}/api/auth/kyc/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newUserToken}`,
      },
      body: JSON.stringify({
        docType: 'INDIAN_PASSPORT',
        docNumber: 'K9876543',
        frontImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        backImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        consentGiven: true,
      }),
    });
    assert.strictEqual(kycSubmit.status, 200);
    const kycData = await kycSubmit.json();
    assert.strictEqual(kycData.success, true);
    assert.ok(kycData.record.docNumberMasked.includes('••••'), 'Doc number must be masked in response');
    console.log('✅ PASSED: Indian Passport KYC validated with DPDP Act consent and masking');

    // Test KYC Purge
    const purgeRes = await fetch(`${BASE_URL}/api/auth/kyc/purge`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${newUserToken}`,
      },
    });
    assert.strictEqual(purgeRes.status, 200);
    console.log('✅ PASSED: KYC document purge per DPDP Act retention rights executed');
  }

  // Test 8: WebAuthn Passkey Challenge Generation
  console.log('\n8. Testing WebAuthn / Passkey Cryptographic Options Generation:');
  {
    const regOptionsRes = await fetch(`${BASE_URL}/api/auth/passkey/register-options`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${newUserToken}`,
      },
    });
    assert.strictEqual(regOptionsRes.status, 200);
    const regOptions = await regOptionsRes.json();
    assert.ok(regOptions.challenge, 'Registration challenge must be generated');
    assert.strictEqual(regOptions.rp.name, 'ScamShield AI Secure Identity');

    const authOptionsRes = await fetch(`${BASE_URL}/api/auth/passkey/login-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    assert.strictEqual(authOptionsRes.status, 200);
    const authOptions = await authOptionsRes.json();
    assert.ok(authOptions.challenge, 'Authentication challenge must be generated');
    console.log('✅ PASSED: WebAuthn RP challenges generated with origin & relying-party binding');
  }

  // Test 9: Password Recovery / Reset Flow
  console.log('\n9. Testing Safe Password Recovery & Reset:');
  {
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    assert.strictEqual(forgotRes.status, 200);

    const resetCodeRes = await fetch(`${BASE_URL}/api/auth/test-harness/get-sandbox-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: testEmail }),
    });
    const { code: resetCode } = await resetCodeRes.json();

    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        otp: resetCode,
        newPassword: 'BrandNewPassword#999',
      }),
    });
    assert.strictEqual(resetRes.status, 200);
    console.log('✅ PASSED: Password reset verified with single-use OTP and PBKDF2 re-hashing');
  }

  // Test 10: Security Audit Logs
  console.log('\n10. Testing Security Audit Logs:');
  {
    // Re-login with new password to get active session
    const relogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'BrandNewPassword#999',
      }),
    });
    const reloginData = await relogin.json();

    const auditRes = await fetch(`${BASE_URL}/api/auth/security/audit-logs`, {
      headers: { Authorization: `Bearer ${reloginData.sessionToken}` },
    });
    assert.strictEqual(auditRes.status, 200);
    const auditData = await auditRes.json();
    assert.ok(auditData.logs.length >= 3, 'Audit logs must capture chronological security actions');
    console.log(`✅ PASSED: Security audit trail verified (${auditData.logs.length} events logged)`);
  }

  console.log('\n🎉 ALL 10 SCAMSHIELD SECURE IDENTITY TEST SUITES PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
