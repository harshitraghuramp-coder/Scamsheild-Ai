import { z } from 'zod';

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
  riskWeight: number; // 0-100
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
  riskScore: number; // 0 - 100
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
  timing?: ScanTimings;
  callerIdOrNumber?: string;
  appDetails?: AppAuthenticityResult;
  explainableReport?: ExplainableEvidenceReport;
  originalInputPreview?: string;
}

// Zod schemas for input validation
export const AnalyzeMessageSchema = z.object({
  content: z.string().min(3, 'Message must be at least 3 characters long').max(15000, 'Message is too long'),
  categoryContext: z.enum(['general', 'job_offer', 'sms_whatsapp', 'bank_payment', 'customer_support', 'email']).optional().default('general'),
  bypassCache: z.boolean().optional().default(false),
});

export const AnalyzeUrlSchema = z.object({
  url: z.string().min(3, 'URL is required').max(2000, 'URL exceeds maximum length'),
  bypassCache: z.boolean().optional().default(false),
});

export const AnalyzeScreenshotSchema = z.object({
  imageBase64: z.string().min(10, 'Valid base64 image data is required'),
  mimeType: z.string().regex(/^image\/(png|jpeg|jpg|webp)$/i, 'Only PNG, JPEG, and WebP images are supported'),
  extractedOcrText: z.string().optional(),
  bypassCache: z.boolean().optional().default(false),
});

export const AnalyzePhoneCallSchema = z.object({
  transcript: z.string().min(5, 'Call transcript or dialogue must be at least 5 characters long').max(20000, 'Transcript exceeds maximum limit'),
  callerContext: z.enum([
    'general',
    'bank_fraud_dept',
    'police_law_enforcement',
    'tech_support_call',
    'job_recruiter_call',
    'government_tax_customs',
    'family_emergency_bail'
  ]).optional().default('general'),
  callerIdOrNumber: z.string().max(100).optional(),
  callDurationSeconds: z.number().optional(),
  bypassCache: z.boolean().optional().default(false),
});

export const AnalyzeAppSchema = z.object({
  urlOrPackageId: z.string().min(2, 'App URL, package name, or App Store ID is required').max(2000, 'Input exceeds maximum length'),
  storeHint: z.enum(['google_play', 'apple_app_store', 'auto']).optional().default('auto'),
  bypassCache: z.boolean().optional().default(false),
});

export const ThreatIntelQuerySchema = z.object({
  query: z.string().min(1, 'Target query is required'),
});

// Live Scam Tracker Domain Types & Zod Schemas
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

export const ScamTrackerFeedQuerySchema = z.object({
  category: z.string().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'ALL']).optional().default('ALL'),
  status: z.enum(['VERIFIED_ALERT', 'UNVERIFIED_SUBMISSION', 'RESOLVED_EXPIRED', 'ALL']).optional().default('ALL'),
  region: z.string().optional().default('ALL'),
  search: z.string().optional(),
  sortBy: z.enum(['latest', 'highest_risk', 'most_reported']).optional().default('latest'),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const DISCLAIMER_TEXT =
  'ScamShield AI provides probabilistic heuristic and AI analysis. Never guarantee scam detection or assume content is 100% safe simply because no indicators were flagged. Always verify independently through official channels.';

