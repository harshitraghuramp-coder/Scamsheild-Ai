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

export interface AnalysisResult {
  id: string;
  timestamp: string;
  targetType: 'message' | 'url' | 'screenshot' | 'phone_call';
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

export const ThreatIntelQuerySchema = z.object({
  query: z.string().min(1, 'Target query is required'),
});

export const DISCLAIMER_TEXT =
  'ScamShield AI provides probabilistic heuristic and AI analysis. Never guarantee scam detection or assume content is 100% safe simply because no indicators were flagged. Always verify independently through official channels.';
