/**
 * Live Scam Tracker Unit & Verification Tests
 * Tests counting logic, deduplication, category filtering, regional queries, and expired alerts.
 */

import { LiveScamTrackerService } from '../server/threat-intel/live-scam-tracker.ts';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n--- Running Live Scam Tracker Test Suite ---\n');

const tracker = new LiveScamTrackerService();

// Test 1: Verify Initial Stats Computation & Deduplication
console.log('1. Testing Stats Computation & Deduplication:');
const stats = tracker.getStats();

assert(typeof stats.activeAlerts === 'number' && stats.activeAlerts > 0, `Active alerts count is valid (${stats.activeAlerts})`);
assert(typeof stats.uniqueCampaignsCount === 'number' && stats.uniqueCampaignsCount > 0, `Unique campaigns count is valid (${stats.uniqueCampaignsCount})`);
assert(typeof stats.totalCorrelatedReports === 'number' && stats.totalCorrelatedReports > stats.activeAlerts, `Total correlated reports (${stats.totalCorrelatedReports}) strictly exceeds active campaigns (${stats.activeAlerts})`);
assert(stats.uniqueCampaignsCount <= stats.activeAlerts, `Unique campaigns (${stats.uniqueCampaignsCount}) <= active alert items (${stats.activeAlerts})`);
assert(stats.recentlyResolvedAlerts >= 2, `Recently resolved/expired alerts tracked (${stats.recentlyResolvedAlerts})`);

// Test 2: Verify Active Alert Criteria (Expired & Resolved Exclusion)
console.log('\n2. Testing Expired & Resolved Alert Exclusion:');
const feedResolved = tracker.getFilteredFeed({ status: 'RESOLVED_EXPIRED' });
assert(feedResolved.items.length >= 2, `Resolved/expired items found in feed (${feedResolved.items.length})`);

for (const item of feedResolved.items) {
  assert(item.isExpired === true || item.isResolved === true, `Item #${item.id} is marked expired or resolved`);
  assert(!tracker.isActiveAlert(item), `Item #${item.id} is correctly excluded by isActiveAlert()`);
}

// Test 3: Category Filtering & Trending Calculation
console.log('\n3. Testing Category Statistics & Filtering:');
const categories = tracker.getCategoryStatistics();
assert(categories.length === 12, `Exactly 12 distinct scam categories tracked (found ${categories.length})`);

const digitalArrestStats = categories.find((c) => c.category === 'Digital Arrest Scams');
assert(digitalArrestStats !== undefined, 'Digital Arrest Scams category exists in tracker');
assert(digitalArrestStats.trend === 'surging', 'Digital Arrest Scams correctly flagged as surging');

// Query filtered feed for UPI Payment Scams
const upiFeed = tracker.getFilteredFeed({ category: 'UPI Payment Scams' });
assert(upiFeed.items.length > 0, `Found UPI Payment Scam alerts (${upiFeed.items.length})`);
for (const item of upiFeed.items) {
  assert(item.category === 'UPI Payment Scams', `Item #${item.id} matches category UPI Payment Scams`);
}

// Test 4: Risk Level Filtering
console.log('\n4. Testing Risk Level Filtering:');
const criticalFeed = tracker.getFilteredFeed({ riskLevel: 'CRITICAL' });
assert(criticalFeed.items.length > 0, `Critical alerts retrieved (${criticalFeed.items.length})`);
for (const item of criticalFeed.items) {
  assert(item.riskLevel === 'CRITICAL', `Item #${item.id} is confirmed CRITICAL`);
}

// Test 5: Regional Threat Aggregation
console.log('\n5. Testing Regional Intelligence & State Mapping:');
const regions = tracker.getRegionalThreatData();
assert(regions.length >= 8, `At least 8 states/jurisdictions tracked (found ${regions.length})`);

const mhData = regions.find((r) => r.regionCode === 'MH');
assert(mhData !== undefined, 'Maharashtra regional data found');
assert(mhData.reportCount > 0, `Maharashtra report count > 0 (${mhData.reportCount})`);
assert(mhData.cyberHelpline.includes('1930'), 'Maharashtra regional helpline includes 1930');

// Test 6: Ingestion & Deduplication Invalidation
console.log('\n6. Testing Community Ingestion & Dynamic Updates:');
const initialActive = tracker.getStats().activeAlerts;
const newReport = tracker.ingestReport({
  title: 'Test Impersonation APK Campaign',
  category: 'Fake Shopping Applications',
  description: 'Fake discount portal testing',
  campaignKey: 'CAMP-TEST-XYZ',
  affectedRegion: 'Maharashtra',
  regionCode: 'MH',
});

assert(newReport.id.startsWith('ST-2026-'), `New report ID assigned: ${newReport.id}`);
assert(newReport.verificationStatus === 'UNVERIFIED_SUBMISSION', 'New report flagged as UNVERIFIED_SUBMISSION');

const updatedStats = tracker.getStats();
assert(updatedStats.activeAlerts === initialActive + 1, `Active alerts dynamically updated from ${initialActive} to ${updatedStats.activeAlerts}`);

console.log('\n🎉 ALL LIVE SCAM TRACKER TESTS PASSED SUCCESSFULLY!\n');
