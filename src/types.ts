export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ScamType =
  | 'Internship & Job Fraud'
  | 'Phishing & Credential Theft'
  | 'Financial & Payment Scam'
  | 'SMS & WhatsApp Fraud'
  | 'Fake Customer Support'
  | 'Extortion & Blackmail'
  | 'Delivery & Customs Smishing'
  | 'Crypto & Investment Fraud'
  | 'Malicious / Deceptive URL'
  | 'Phone Call & Voice Vishing'
  | 'Police & Legal Threat Impersonation'
  | 'Fake Bank Support Call'
  | 'Fake Mobile App & Impersonation'
  | 'Malicious App & Spyware'
  | 'Low Threat / Informational'
  | 'Unclassified';

export interface RedFlag {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface TechnicalIndicator {
  type: string;
  indicator: string;
  explanation: string;
  riskWeight: number;
}

export interface RecommendedAction {
  step: number;
  action: string;
  priority: 'immediate' | 'recommended' | 'optional';
}

export interface ExtractedEntities {
  urls: string[];
  emails: string[];
  phones: string[];
  paymentMethods: string[];
}

export interface ScanTimings {
  t_preprocess_ms: number;
  t_cache_ms: number;
  t_ai_ms: number;
  t_parse_ms: number;
  t_total_ms: number;
  cache_status: 'HIT' | 'MISS' | 'BYPASS';
  circuit_state?: string;
}

export interface SensitivePermission {
  permission: string;
  riskLevel: 'critical' | 'high' | 'medium';
  rationale: string;
}

export interface UserReviewPattern {
  topic: string;
  sentiment: 'positive' | 'concerning' | 'suspicious' | 'neutral';
  detail: string;
}

export interface AppStoreMetadata {
  store: 'google_play' | 'apple_app_store';
  storeListingStatus: 'STORE_VERIFIED_LISTING' | 'UNLISTED_OR_REMOVED' | 'UNVERIFIED_SOURCE';
  appName: string;
  appIconUrl?: string;
  packageNameOrId: string;
  category: string;
  currentVersion: string;
  appSize?: string;
  appDescription: string;

  // Developer Information
  developerName: string;
  developerWebsite?: string;
  developerEmail?: string;
  developerAddress?: string;
  developerCountry?: string; // "Not publicly verified" if unknown
  parentCompany?: string; // "Not publicly verified" if unknown
  developerOtherApps?: string[];

  // Publication Information
  originalReleaseDate?: string; // e.g. "2015-08-12" or "Not publicly verified"
  lastUpdatedDate?: string; // e.g. "2024-09-10"
  currentVersionReleaseDate?: string;

  // Trust and Reputation
  averageRating?: number; // e.g. 4.7
  reviewCount?: number; // e.g. 152000
  downloadRange?: string; // e.g. "100M+ downloads"
  privacyPolicyUrl?: string;

  // Permissions & Review indicators
  declaredPermissions: string[];
  sensitivePermissions: SensitivePermission[];
  userReviewPatterns: UserReviewPattern[];
}

export interface AppAuthenticityCheck {
  id: string;
  name: string;
  category: 'impersonation' | 'developer_identity' | 'permissions' | 'reputation' | 'threat_intel';
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'UNVERIFIED';
  details: string;
  evidence: string;
}

export interface DeveloperVerification {
  identityStatus: 'VERIFIED_OFFICIAL' | 'PARTIALLY_VERIFIED' | 'SUSPICIOUS_IDENTITY' | 'UNVERIFIED';
  summary: string;
  domainMatch: boolean;
  freeEmailWarning: boolean;
  companyRegistrationCheck: string;
}

export interface PermissionRiskSummary {
  totalRequested: number;
  sensitiveCount: number;
  excessiveRiskDetected: boolean;
  criticalFindings: string[];
}

export interface AppAuthenticityResult extends AnalysisResult {
  appMetadata: AppStoreMetadata;
  authenticityChecks: AppAuthenticityCheck[];
  developerVerification: DeveloperVerification;
  permissionRiskSummary: PermissionRiskSummary;
  verifiableFacts: string[];
  storeProvidedDetails: string[];
  aiForensicFindings: string[];
  unverifiedInformation: string[];
}

export interface ExplainableEvidenceItem {
  category: 'OBSERVABLE_FACT' | 'MODEL_INFERENCE' | 'INTELLIGENCE_MATCH';
  indicator: string;
  finding: string;
  confidenceReasoning: string;
  sourceOrRule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface UncertaintyNote {
  aspect: string;
  explanation: string;
  howToVerifyIndependently: string;
}

export interface ExplainableEvidenceReport {
  overallRiskClassification: RiskLevel;
  calibrationRationale: string;
  observableFacts: ExplainableEvidenceItem[];
  modelInferences: ExplainableEvidenceItem[];
  threatIntelMatches: ExplainableEvidenceItem[];
  uncertaintiesAndGaps: UncertaintyNote[];
  containmentPlaybook: RecommendedAction[];
  externalReferences: string[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  targetType: 'message' | 'url' | 'screenshot' | 'phone_call' | 'app';
  scamType: ScamType;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: 'Low' | 'Medium' | 'High';
  summary: string;
  redFlags: RedFlag[];
  psychologicalTactics: string[];
  technicalIndicators: TechnicalIndicator[];
  extractedEntities: ExtractedEntities;
  recommendedActions: RecommendedAction[];
  sourceAnalysisMode: 'ai_enhanced' | 'heuristic_fallback';
  disclaimer: string;
  originalInputPreview?: string;
  timing?: ScanTimings;
  callerIdOrNumber?: string;
  appDetails?: AppAuthenticityResult;
  explainableReport?: ExplainableEvidenceReport;
}

export interface ScanHistoryItem extends AnalysisResult {
  inputSnippet: string;
}

export interface ThreatIntelStatus {
  status: string;
  engineVersion: string;
  totalActiveSignatures: number;
  databaseRecords: number;
  lastSync: string;
  feedSources: string[];
  activeProtectionModules: string[];
}

export interface ThreatIntelRecord {
  indicator: string;
  type: string;
  threatCategory: string;
  source: string;
  confidence: number;
  firstSeen: string;
  description: string;
}

export interface QuizScenario {
  id: string;
  title: string;
  sender: string;
  content: string;
  isScam: boolean;
  scamCategory?: string;
  clues: string[];
  explanation: string;
  realWorldImpact: string;
}

export interface EncyclopediaEntry {
  id: string;
  title: string;
  category: string;
  iconName: string;
  severity: 'high' | 'critical';
  summary: string;
  howItWorks: string[];
  telltaleSigns: string[];
  exampleMessage: string;
  attackerTactics: string[];
  countermeasures: string[];
}

// Live Scam Tracker Domain Types
export type LiveScamCategory =
  | 'Digital Arrest Scams'
  | 'UPI Payment Scams'
  | 'Fake Bank Calls'
  | 'OTP Theft'
  | 'Fake Job and Internship Offers'
  | 'Investment and Trading Scams'
  | 'Phishing Websites'
  | 'Fake Shopping Applications'
  | 'Loan App Scams'
  | 'Social Media Impersonation'
  | 'Cryptocurrency Scams'
  | 'Tech Support Scams';

export type ScamVerificationStatus =
  | 'VERIFIED_ALERT'
  | 'UNVERIFIED_SUBMISSION'
  | 'RESOLVED_EXPIRED';

export interface ScamAlertItem {
  id: string;
  campaignKey: string;
  title: string;
  category: LiveScamCategory;
  description: string;
  riskLevel: RiskLevel;
  verificationStatus: ScamVerificationStatus;
  source: string;
  sourceType: 'GOVERNMENT_ADVISORY' | 'CERT_IN' | 'POLICE_CYBER_CELL' | 'FINANCIAL_REGULATOR' | 'COMMUNITY_MODERATED';
  sourceUrl?: string;
  firstReportedDate: string;
  lastReportedDate: string;
  affectedRegion: string;
  regionCode: string;
  reportCount: number;
  indicators: string[];
  telltaleSigns: string[];
  actionGuidance: string;
  isExpired: boolean;
  isResolved: boolean;
  resolvedDate?: string;
  resolutionNotes?: string;
}

export interface TrendingCategoryInfo {
  category: LiveScamCategory;
  activeCampaigns: number;
  reportCount: number;
  trend: 'surging' | 'rising' | 'stable' | 'declining';
  changePercent: number;
}

export interface ScamTrackerStats {
  activeAlerts: number;
  newlyReportedScams: number;
  trendingCategories: TrendingCategoryInfo[];
  reportsReceivedToday: number;
  highRiskAlerts: number;
  recentlyResolvedAlerts: number;
  totalCorrelatedReports: number;
  uniqueCampaignsCount: number;
  lastUpdated: string;
  dataSourceStatus: 'LIVE_ADVISORY_CONNECTED' | 'DEMO_DATA_FALLBACK';
  activeFeedSources: string[];
}

export interface CategoryStat {
  category: LiveScamCategory;
  activeCampaigns: number;
  totalReports: number;
  highRiskCount: number;
  trend: 'surging' | 'rising' | 'stable' | 'declining';
  weeklyChange: number;
}

export interface RegionalThreatData {
  regionCode: string;
  regionName: string;
  reportCount: number;
  activeCampaigns: number;
  topCategory: LiveScamCategory;
  riskLevel: RiskLevel;
  cyberHelpline: string;
  officialAdvisorySource: string;
  lastIncidentDate: string;
  statusSummary: string;
}

