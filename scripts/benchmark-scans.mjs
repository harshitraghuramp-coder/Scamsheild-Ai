/**
 * Benchmark Script for ScamShield AI Message Scanning Performance
 * Executes representative scans, measures latencies, and computes statistical metrics.
 */

const BASE_URL = 'http://localhost:3000';

const TEST_CASES = [
  {
    name: '1. Fake Internship Telegram Scam',
    payload: {
      content: 'Shortlisted for Remote Software Internship. Contact HR @ApexRecruiter on Telegram. $150 deposit required.',
      categoryContext: 'job_offer'
    }
  },
  {
    name: '2. Urgent Bank KYC Suspension SMS',
    payload: {
      content: 'CHASE ALERT: Profile locked. Restore access within 24 hours at https://chase-online-account-unlock.top/verify',
      categoryContext: 'sms_whatsapp'
    }
  },
  {
    name: '3. Geek Squad Invoice & AnyDesk Bait',
    payload: {
      content: 'Your Geek Squad protection auto-renewed for $499. Call +1-888-492-0193 to cancel. Install AnyDesk for refund.',
      categoryContext: 'customer_support'
    }
  },
  {
    name: '4. USPS Package Customs Redelivery',
    payload: {
      content: 'USPS: Parcel held at terminal due to unpaid $2.49 redelivery fee. Update address: https://usps-tracking-package-redelivery.buzz/claim',
      categoryContext: 'sms_whatsapp'
    }
  },
  {
    name: '5. Pegasus Webcam Blackmail Email',
    payload: {
      content: 'I recorded you on webcam. Send $1,500 in Bitcoin to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh within 48h.',
      categoryContext: 'email'
    }
  },
  {
    name: '6. Benign Workplace Email',
    payload: {
      content: 'Hi everyone, quick reminder about our sprint review tomorrow morning at 10 AM in Conference Room B. See you there.',
      categoryContext: 'email'
    }
  },
  {
    name: '7. Repeated Job Offer (Cache Hit Test)',
    payload: {
      content: 'Shortlisted for Remote Software Internship. Contact HR @ApexRecruiter on Telegram. $150 deposit required.',
      categoryContext: 'job_offer'
    }
  },
  {
    name: '8. Repeated Bank KYC (Cache Hit Test)',
    payload: {
      content: 'CHASE ALERT: Profile locked. Restore access within 24 hours at https://chase-online-account-unlock.top/verify',
      categoryContext: 'sms_whatsapp'
    }
  },
  {
    name: '9. Long Form Corporate Phish Email',
    payload: {
      content: 'From: IT Helpdesk Administrator. Immediate Action Required: All university faculty and student credentials are undergoing mandatory SSL 3.0 identity recertification. Failure to authenticate your single sign-on credentials through our central portal within 12 hours will result in immediate mailbox deactivation, irreversible file purge from Google Drive, and revocation of VPN access tokens. Please navigate to http://secure-university-auth-portal.cam/sso/login.jsp to complete two-factor OTP re-enrollment.',
      categoryContext: 'email'
    }
  },
  {
    name: '10. Forced Fresh Scan (Cache Bypass Test)',
    payload: {
      content: 'USPS: Parcel held at terminal due to unpaid $2.49 redelivery fee. Update address: https://usps-tracking-package-redelivery.buzz/claim',
      categoryContext: 'sms_whatsapp',
      bypassCache: true
    }
  },
  {
    name: '11. Simultaneous Duplicate Request A (Coalescing Test)',
    payload: {
      content: 'WhatsApp message: Hey mom, my phone broke, please wire $450 to my friend via Zelle immediately for emergency tow truck.',
      categoryContext: 'sms_whatsapp'
    }
  },
  {
    name: '12. Simultaneous Duplicate Request B (Coalescing Test)',
    payload: {
      content: 'WhatsApp message: Hey mom, my phone broke, please wire $450 to my friend via Zelle immediately for emergency tow truck.',
      categoryContext: 'sms_whatsapp'
    }
  },
  {
    name: '13. Phone Vishing Digital Arrest Call',
    endpoint: '/api/analyze/phone-call',
    payload: {
      transcript: 'Caller: This is Officer Sharma from Narcotics Cyber Cell. A parcel with 250g MDMA was seized under your name. You are under Digital Arrest. Transfer 350000 rupees to the RBI verification escrow account now.',
      callerContext: 'police_law_enforcement',
      callerIdOrNumber: '+91 22 2262 0111'
    }
  },
  {
    name: '14. Phone Vishing Digital Arrest (Cache Hit Test)',
    endpoint: '/api/analyze/phone-call',
    payload: {
      transcript: 'Caller: This is Officer Sharma from Narcotics Cyber Cell. A parcel with 250g MDMA was seized under your name. You are under Digital Arrest. Transfer 350000 rupees to the RBI verification escrow account now.',
      callerContext: 'police_law_enforcement',
      callerIdOrNumber: '+91 22 2262 0111'
    }
  }
];

function calculatePercentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

async function runBenchmark() {
  console.log('=== ScamShield AI Performance Benchmark Suite ===\n');

  // Clear cache first for clean benchmark state
  try {
    await fetch(`${BASE_URL}/api/cache/clear`, { method: 'POST' });
    console.log('[Setup] Cache cleared and circuit breaker reset.\n');
  } catch (e) {
    console.warn('[Setup Warning] Could not clear cache via API:', e.message);
  }

  const results = [];
  let cacheHits = 0;
  let cacheMisses = 0;
  let errors = 0;

  for (let i = 0; i < TEST_CASES.length; i++) {
    const test = TEST_CASES[i];
    const endpoint = test.endpoint || '/api/analyze/message';
    const tStart = performance.now();

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.payload)
      });

      const tEnd = performance.now();
      const networkDuration = Math.round((tEnd - tStart) * 10) / 10;

      if (!response.ok) {
        errors++;
        console.log(`[FAIL] ${test.name} -> HTTP ${response.status} in ${networkDuration}ms`);
        continue;
      }

      const data = await response.json();
      const timing = data.timing || {};
      const cacheStatus = timing.cache_status || 'MISS';

      if (cacheStatus === 'HIT') cacheHits++;
      else cacheMisses++;

      results.push({
        name: test.name,
        networkMs: networkDuration,
        preprocessMs: timing.t_preprocess_ms || 0,
        aiMs: timing.t_ai_ms || 0,
        parseMs: timing.t_parse_ms || 0,
        backendTotalMs: timing.t_total_ms || networkDuration,
        cacheStatus,
        riskLevel: data.riskLevel,
        scamType: data.scamType
      });

      console.log(
        `[PASS] ${test.name.padEnd(52)} | Total: ${String(networkDuration).padStart(6)}ms | Cache: ${cacheStatus.padEnd(6)} | Risk: ${data.riskLevel.padEnd(8)} | Score: ${data.riskScore}`
      );
    } catch (err) {
      errors++;
      console.log(`[ERROR] ${test.name} -> ${err.message}`);
    }
  }

  // Summary Metrics
  const durations = results.map((r) => r.networkMs);
  const sum = durations.reduce((acc, d) => acc + d, 0);
  const avg = durations.length > 0 ? Math.round((sum / durations.length) * 10) / 10 : 0;
  const median = calculatePercentile(durations, 50);
  const p95 = calculatePercentile(durations, 95);
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  const hitRate = results.length > 0 ? Math.round((cacheHits / results.length) * 100) : 0;

  console.log('\n======================================================');
  console.log('              BENCHMARK SUMMARY REPORT                ');
  console.log('======================================================');
  console.log(`Total Test Runs      : ${durations.length}`);
  console.log(`Error / Timeout Rate : ${errors}/${TEST_CASES.length} (${errors === 0 ? '0%' : Math.round((errors / TEST_CASES.length) * 100) + '%'})`);
  console.log(`Cache Hit Rate       : ${cacheHits}/${results.length} (${hitRate}%)`);
  console.log('------------------------------------------------------');
  console.log(`Average Latency      : ${avg} ms`);
  console.log(`Median Latency (P50) : ${median} ms`);
  console.log(`95th-Percentile (P95): ${p95} ms`);
  console.log(`Min Latency (Cache)  : ${min} ms`);
  console.log(`Max Latency (Cold)   : ${max} ms`);
  console.log('======================================================\n');
}

runBenchmark().catch(console.error);
