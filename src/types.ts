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

export interface AnalysisResult {
  id: string;
  timestamp: string;
  targetType: 'message' | 'url' | 'screenshot' | 'phone_call';
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
