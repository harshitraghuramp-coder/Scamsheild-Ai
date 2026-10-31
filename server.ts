import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AnalyzeMessageSchema,
  AnalyzeUrlSchema,
  AnalyzeScreenshotSchema,
  AnalyzePhoneCallSchema,
  AnalyzeAppSchema,
  ThreatIntelQuerySchema,
  ScamTrackerFeedQuerySchema,
  AnalysisResult,
  AppAuthenticityResult,
  DISCLAIMER_TEXT,
  RiskLevel,
  ScamType,
  ScanTimings,
} from './server/types.ts';
import { analyzeMessageDeterministic } from './server/heuristics/message-checker.ts';
import { analyzeUrlDeterministic } from './server/heuristics/url-checker.ts';
import { analyzePhoneCallDeterministic } from './server/heuristics/phone-call-checker.ts';
import {
  parseAndValidateAppInput,
  retrieveAppMetadata,
  analyzeAppDeterministic,
} from './server/heuristics/app-checker.ts';
import { threatIntelService } from './server/threat-intel/feed.ts';
import { liveScamTrackerService } from './server/threat-intel/live-scam-tracker.ts';
import { geminiAnalyzerProvider } from './server/ai/gemini-provider.ts';
import { scanCache } from './server/cache/scan-cache.ts';
import { aiCircuitBreaker } from './server/ai/circuit-breaker.ts';
import cookieParser from 'cookie-parser';
import authRouter from './server/auth/routes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware for parsing JSON requests with 15MB limit for screenshots and cookies
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Mount ScamShield Secure Identity Authentication Router
app.use('/api/auth', authRouter);

// Helper to generate unique scan IDs
function generateScanId(): string {
  return 'SCAM-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
}

// Route: Analyze Raw Message / Text (Optimized with Caching, Deduplication, and Fine-Grained Timings)
app.post('/api/analyze/message', async (req: Request, res: Response): Promise<void> => {
  const t0 = performance.now();
  try {
    const parseResult = AnalyzeMessageSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid input payload' });
      return;
    }

    const { content, categoryContext, bypassCache } = parseResult.data;

    // Generate safe SHA-256 cache key
    const cacheKey = scanCache.generateKey('message', content, categoryContext);

    // 1. Check Safe Bounded In-Memory Cache
    if (!bypassCache) {
      const cached = scanCache.get(cacheKey);
      if (cached) {
        const t_total_ms = Math.round((performance.now() - t0) * 10) / 10;
        const timing: ScanTimings = {
          t_preprocess_ms: 0,
          t_cache_ms: t_total_ms,
          t_ai_ms: 0,
          t_parse_ms: 0,
          t_total_ms,
          cache_status: 'HIT',
          circuit_state: aiCircuitBreaker.getState(),
        };
        cached.timing = timing;

        res.setHeader('Server-Timing', `cache;dur=${t_total_ms};desc="Cache Hit", total;dur=${t_total_ms}`);
        console.log(`[ScanMetric] type=message id=${cached.id} risk=${cached.riskLevel} cache=HIT total=${t_total_ms}ms circuit=${timing.circuit_state}`);
        res.json(cached);
        return;
      }
    }

    // 2. Coalesce concurrent identical requests (Singleflight)
    const { result, isCoalesced } = await scanCache.coalesce(cacheKey, async () => {
      const t_prep_start = performance.now();

      // Run Deterministic Heuristic Engine
      const deterministic = analyzeMessageDeterministic(content, categoryContext);
      const t_preprocess_ms = Math.round((performance.now() - t_prep_start) * 10) / 10;

      // Run AI Provider Call with Circuit Breaker and strict timeout
      let aiResult: Partial<AnalysisResult> | null = null;
      let mode: 'ai_enhanced' | 'heuristic_fallback' = 'heuristic_fallback';
      let t_ai_ms = 0;

      if (process.env.GEMINI_API_KEY && aiCircuitBreaker.getState() !== 'OPEN') {
        const t_ai_start = performance.now();
        try {
          aiResult = await geminiAnalyzerProvider.analyzeMessage({
            content,
            categoryContext,
          });
          mode = 'ai_enhanced';
        } catch (aiErr: any) {
          console.warn(`[AI Provider Fallback] Reason: ${aiErr.message || 'Error/Timeout'}. Fast deterministic engine engaged.`);
        } finally {
          t_ai_ms = Math.round((performance.now() - t_ai_start) * 10) / 10;
        }
      }

      // Composite Merging & Postprocessing
      const t_parse_start = performance.now();
      let finalRiskScore = deterministic.riskScore;
      let finalRiskLevel: RiskLevel = deterministic.riskLevel;
      let finalScamType: ScamType = deterministic.scamType;
      let finalSummary = deterministic.summary;
      let finalRedFlags = [...deterministic.redFlags];
      let finalTactics = [...deterministic.psychologicalTactics];
      let finalActions = [...deterministic.recommendedActions];
      let confidence = deterministic.confidence;

      if (aiResult) {
        finalRiskScore = Math.max(deterministic.riskScore, aiResult.riskScore ?? 0);
        if (finalRiskScore >= 80) finalRiskLevel = 'CRITICAL';
        else if (finalRiskScore >= 55) finalRiskLevel = 'HIGH';
        else if (finalRiskScore >= 25) finalRiskLevel = 'MEDIUM';
        else finalRiskLevel = 'LOW';

        if (aiResult.scamType && aiResult.scamType !== 'Unclassified') {
          finalScamType = aiResult.scamType;
        }
        if (aiResult.summary) finalSummary = aiResult.summary;
        if (aiResult.confidence) confidence = aiResult.confidence;

        if (aiResult.redFlags) {
          for (const flag of aiResult.redFlags) {
            if (!finalRedFlags.some((f) => f.title.toLowerCase() === flag.title.toLowerCase())) {
              finalRedFlags.push(flag);
            }
          }
        }
        if (aiResult.psychologicalTactics) {
          for (const t of aiResult.psychologicalTactics) {
            if (!finalTactics.includes(t)) finalTactics.push(t);
          }
        }
        if (aiResult.recommendedActions && aiResult.recommendedActions.length > 0) {
          finalActions = aiResult.recommendedActions;
        }
      }

      const t_parse_ms = Math.round((performance.now() - t_parse_start) * 10) / 10;
      const t_total_ms = Math.round((performance.now() - t0) * 10) / 10;

      const timing: ScanTimings = {
        t_preprocess_ms,
        t_cache_ms: 0,
        t_ai_ms,
        t_parse_ms,
        t_total_ms,
        cache_status: bypassCache ? 'BYPASS' : 'MISS',
        circuit_state: aiCircuitBreaker.getState(),
      };

      const responsePayload: AnalysisResult = {
        id: generateScanId(),
        timestamp: new Date().toISOString(),
        targetType: 'message',
        scamType: finalScamType,
        riskScore: finalRiskScore,
        riskLevel: finalRiskLevel,
        confidence,
        summary: finalSummary,
        redFlags: finalRedFlags,
        psychologicalTactics: finalTactics,
        technicalIndicators: deterministic.technicalIndicators,
        extractedEntities: deterministic.extractedEntities,
        recommendedActions: finalActions,
        sourceAnalysisMode: mode,
        disclaimer: DISCLAIMER_TEXT,
        timing,
      };

      return responsePayload;
    });

    const totalDur = Math.round((performance.now() - t0) * 10) / 10;
    if (result.timing) {
      result.timing.t_total_ms = totalDur;
    }

    res.setHeader(
      'Server-Timing',
      `prep;dur=${result.timing?.t_preprocess_ms || 0};desc="Preprocess", ai;dur=${result.timing?.t_ai_ms || 0};desc="AI Provider", parse;dur=${result.timing?.t_parse_ms || 0};desc="Parser", total;dur=${totalDur}`
    );

    console.log(
      `[ScanMetric] type=message id=${result.id} risk=${result.riskLevel} cache=${result.timing?.cache_status} coalesced=${isCoalesced} total=${totalDur}ms ai=${result.timing?.t_ai_ms}ms circuit=${result.timing?.circuit_state}`
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing message:', error);
    res.status(500).json({ error: error.message || 'Internal server error while analyzing message' });
  }
});

// Route: Analyze URL
app.post('/api/analyze/url', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = AnalyzeUrlSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid URL payload' });
      return;
    }

    const { url } = parseResult.data;

    // 1. Run Deterministic Heuristic Engine
    const deterministic = analyzeUrlDeterministic(url);

    // 2. Attempt AI Enrichment
    let aiResult: Partial<AnalysisResult> | null = null;
    let mode: 'ai_enhanced' | 'heuristic_fallback' = 'heuristic_fallback';

    if (process.env.GEMINI_API_KEY) {
      try {
        aiResult = await geminiAnalyzerProvider.analyzeUrl({
          url,
          deterministicData: deterministic,
        });
        mode = 'ai_enhanced';
      } catch (aiErr) {
        console.warn('Gemini URL analysis failed, falling back to heuristics:', aiErr);
      }
    }

    let finalRiskScore = deterministic.riskScore;
    let finalRiskLevel: RiskLevel = deterministic.riskLevel;
    let finalScamType: ScamType = deterministic.scamType;
    let finalRedFlags = [...deterministic.redFlags];
    let finalTactics: string[] = [];
    let finalActions = [...deterministic.recommendedActions];
    let confidence: 'Low' | 'Medium' | 'High' = finalRiskScore > 50 ? 'High' : 'Medium';

    let finalSummary = '';
    if (finalRiskScore >= 75) {
      finalSummary = `CRITICAL THREAT: Destination URL exhibits high-severity threat markers (${deterministic.redFlags.map((r) => r.title).join(', ')}). High probability of brand impersonation or credential interception.`;
    } else if (finalRiskScore >= 45) {
      finalSummary = `SUSPICIOUS DOMAIN: Potential risks detected including ${deterministic.details.tld ? `risky TLD .${deterministic.details.tld}` : ''} and suspicious path identifiers. Exercise high caution.`;
    } else {
      finalSummary = `LOW APPARENT RISK: URL structure passed standard reputation heuristics. Verify that the domain owner matches the expected organization.`;
    }

    if (aiResult) {
      finalRiskScore = Math.max(deterministic.riskScore, aiResult.riskScore ?? 0);
      if (finalRiskScore >= 80) finalRiskLevel = 'CRITICAL';
      else if (finalRiskScore >= 55) finalRiskLevel = 'HIGH';
      else if (finalRiskScore >= 25) finalRiskLevel = 'MEDIUM';
      else finalRiskLevel = 'LOW';

      if (aiResult.summary) finalSummary = aiResult.summary;
      if (aiResult.scamType) finalScamType = aiResult.scamType;
      if (aiResult.confidence) confidence = aiResult.confidence;

      if (aiResult.redFlags) {
        for (const flag of aiResult.redFlags) {
          if (!finalRedFlags.some((f) => f.title.toLowerCase() === flag.title.toLowerCase())) {
            finalRedFlags.push(flag);
          }
        }
      }
      if (aiResult.psychologicalTactics) {
        finalTactics = aiResult.psychologicalTactics;
      }
      if (aiResult.recommendedActions && aiResult.recommendedActions.length > 0) {
        finalActions = aiResult.recommendedActions;
      }
    }

    const responsePayload: AnalysisResult = {
      id: generateScanId(),
      timestamp: new Date().toISOString(),
      targetType: 'url',
      scamType: finalScamType,
      riskScore: finalRiskScore,
      riskLevel: finalRiskLevel,
      confidence,
      summary: finalSummary,
      redFlags: finalRedFlags,
      psychologicalTactics: finalTactics,
      technicalIndicators: deterministic.technicalIndicators,
      extractedEntities: {
        urls: [url],
        emails: [],
        phones: [],
        paymentMethods: [],
      },
      recommendedActions: finalActions,
      sourceAnalysisMode: mode,
      disclaimer: DISCLAIMER_TEXT,
    };

    res.json(responsePayload);
  } catch (error: any) {
    console.error('Error analyzing URL:', error);
    res.status(500).json({ error: error.message || 'Internal server error while analyzing URL' });
  }
});

// Route: Analyze Screenshot (Multimodal Vision / OCR text)
app.post('/api/analyze/screenshot', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = AnalyzeScreenshotSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid image payload' });
      return;
    }

    const { imageBase64, mimeType, extractedOcrText } = parseResult.data;

    let aiResult: Partial<AnalysisResult> | null = null;
    let mode: 'ai_enhanced' | 'heuristic_fallback' = 'heuristic_fallback';

    // 1. Try Gemini Multimodal Image Inspection
    if (process.env.GEMINI_API_KEY) {
      try {
        aiResult = await geminiAnalyzerProvider.analyzeMultimodal({
          imageBase64,
          mimeType,
          extractedOcrText,
        });
        mode = 'ai_enhanced';
      } catch (err) {
        console.warn('Gemini multimodal failed, falling back to OCR text heuristics:', err);
      }
    }

    // 2. If Gemini unavailable or if OCR text exists, evaluate with text heuristics
    const ocrText = (extractedOcrText || '').trim();
    const deterministic = analyzeMessageDeterministic(ocrText || 'Screenshot analysis');

    let finalRiskScore = aiResult?.riskScore ?? deterministic.riskScore;
    let finalRiskLevel: RiskLevel = (aiResult?.riskLevel as RiskLevel) || deterministic.riskLevel;
    let finalScamType: ScamType = (aiResult?.scamType as ScamType) || deterministic.scamType;
    let finalSummary = aiResult?.summary || deterministic.summary;
    let finalRedFlags = aiResult?.redFlags || deterministic.redFlags;
    let finalTactics = aiResult?.psychologicalTactics || deterministic.psychologicalTactics;
    let finalActions = aiResult?.recommendedActions || deterministic.recommendedActions;

    // If both worked, take maximum risk score
    if (aiResult && deterministic.riskScore > (aiResult.riskScore ?? 0)) {
      finalRiskScore = deterministic.riskScore;
      finalRiskLevel = deterministic.riskLevel;
    }

    const responsePayload: AnalysisResult = {
      id: generateScanId(),
      timestamp: new Date().toISOString(),
      targetType: 'screenshot',
      scamType: finalScamType,
      riskScore: finalRiskScore,
      riskLevel: finalRiskLevel,
      confidence: aiResult?.confidence || deterministic.confidence,
      summary: finalSummary,
      redFlags: finalRedFlags,
      psychologicalTactics: finalTactics,
      technicalIndicators: deterministic.technicalIndicators,
      extractedEntities: deterministic.extractedEntities,
      recommendedActions: finalActions,
      sourceAnalysisMode: mode,
      disclaimer: DISCLAIMER_TEXT,
    };

    res.json(responsePayload);
  } catch (error: any) {
    console.error('Error analyzing screenshot:', error);
    res.status(500).json({ error: error.message || 'Internal server error while analyzing screenshot' });
  }
});

// Route: Analyze Phone Call Transcript & Vishing Pattern
app.post('/api/analyze/phone-call', async (req: Request, res: Response): Promise<void> => {
  const t0 = performance.now();
  try {
    const parseResult = AnalyzePhoneCallSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid call transcript payload' });
      return;
    }

    const { transcript, callerContext, callerIdOrNumber, bypassCache } = parseResult.data;

    // Generate safe SHA-256 cache key
    const cacheKey = scanCache.generateKey('phone_call', transcript, `${callerContext}:${callerIdOrNumber || ''}`);

    // 1. Check Safe Bounded In-Memory Cache
    if (!bypassCache) {
      const cached = scanCache.get(cacheKey);
      if (cached) {
        const t_total_ms = Math.round((performance.now() - t0) * 10) / 10;
        const timing: ScanTimings = {
          t_preprocess_ms: 0,
          t_cache_ms: t_total_ms,
          t_ai_ms: 0,
          t_parse_ms: 0,
          t_total_ms,
          cache_status: 'HIT',
          circuit_state: aiCircuitBreaker.getState(),
        };
        cached.timing = timing;
        res.setHeader('Server-Timing', `cache;dur=${t_total_ms};desc="Cache Hit", total;dur=${t_total_ms}`);
        res.json(cached);
        return;
      }
    }

    // 2. Coalesce concurrent identical requests (Singleflight)
    const { result } = await scanCache.coalesce(cacheKey, async () => {
      const t_prep_start = performance.now();

      // Run Deterministic Heuristic Engine
      const deterministic = analyzePhoneCallDeterministic(transcript, callerContext, callerIdOrNumber);
      const t_preprocess_ms = Math.round((performance.now() - t_prep_start) * 10) / 10;

      // Run AI Provider Call with Circuit Breaker and strict timeout
      let aiResult: Partial<AnalysisResult> | null = null;
      let mode: 'ai_enhanced' | 'heuristic_fallback' = 'heuristic_fallback';
      let t_ai_ms = 0;

      if (process.env.GEMINI_API_KEY && aiCircuitBreaker.getState() !== 'OPEN') {
        const t_ai_start = performance.now();
        try {
          aiResult = await geminiAnalyzerProvider.analyzePhoneCall({
            transcript,
            callerContext,
            callerIdOrNumber,
          });
          mode = 'ai_enhanced';
        } catch (aiErr: any) {
          console.warn(`[AI Phone Fallback] Reason: ${aiErr.message || 'Error/Timeout'}. Fast deterministic engine engaged.`);
        } finally {
          t_ai_ms = Math.round((performance.now() - t_ai_start) * 10) / 10;
        }
      }

      // Composite Merging & Postprocessing
      const t_parse_start = performance.now();
      let finalRiskScore = deterministic.riskScore;
      let finalRiskLevel: RiskLevel = deterministic.riskLevel;
      let finalScamType: ScamType = deterministic.scamType;
      let finalSummary = deterministic.summary;
      let finalRedFlags = [...deterministic.redFlags];
      let finalTactics = [...deterministic.psychologicalTactics];
      let finalActions = [...deterministic.recommendedActions];
      let confidence = deterministic.confidence;

      if (aiResult) {
        finalRiskScore = Math.max(deterministic.riskScore, aiResult.riskScore ?? 0);
        if (finalRiskScore >= 80) finalRiskLevel = 'CRITICAL';
        else if (finalRiskScore >= 55) finalRiskLevel = 'HIGH';
        else if (finalRiskScore >= 25) finalRiskLevel = 'MEDIUM';
        else finalRiskLevel = 'LOW';

        if (aiResult.summary) finalSummary = aiResult.summary;
        if (aiResult.scamType) finalScamType = aiResult.scamType;
        if (aiResult.confidence) confidence = aiResult.confidence;

        if (aiResult.redFlags) {
          for (const flag of aiResult.redFlags) {
            if (!finalRedFlags.some((f) => f.title.toLowerCase() === flag.title.toLowerCase())) {
              finalRedFlags.push(flag);
            }
          }
        }
        if (aiResult.psychologicalTactics) {
          finalTactics = Array.from(new Set([...finalTactics, ...aiResult.psychologicalTactics]));
        }
        if (aiResult.recommendedActions && aiResult.recommendedActions.length > 0) {
          finalActions = aiResult.recommendedActions;
        }
      }

      const t_parse_ms = Math.round((performance.now() - t_parse_start) * 10) / 10;
      const t_total_ms = Math.round((performance.now() - t0) * 10) / 10;

      const timing: ScanTimings = {
        t_preprocess_ms,
        t_cache_ms: 0,
        t_ai_ms,
        t_parse_ms,
        t_total_ms,
        cache_status: 'MISS',
        circuit_state: aiCircuitBreaker.getState(),
      };

      const finalResult: AnalysisResult = {
        id: generateScanId(),
        timestamp: new Date().toISOString(),
        targetType: 'phone_call',
        scamType: finalScamType,
        riskScore: finalRiskScore,
        riskLevel: finalRiskLevel,
        confidence,
        summary: finalSummary,
        redFlags: finalRedFlags,
        psychologicalTactics: finalTactics,
        technicalIndicators: deterministic.technicalIndicators,
        extractedEntities: deterministic.extractedEntities,
        recommendedActions: finalActions,
        sourceAnalysisMode: mode,
        disclaimer: DISCLAIMER_TEXT,
        timing,
        callerIdOrNumber: callerIdOrNumber?.trim() || undefined,
      };

      // Store in safe cache
      scanCache.set(cacheKey, finalResult);

      return finalResult;
    });

    const totalDur = Math.round((performance.now() - t0) * 10) / 10;
    res.setHeader(
      'Server-Timing',
      `preprocess;dur=${result.timing?.t_preprocess_ms || 0}, ai;dur=${result.timing?.t_ai_ms || 0}, total;dur=${totalDur}`
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing phone call:', error);
    res.status(500).json({ error: error.message || 'Internal server error while analyzing phone call' });
  }
});

// Route: Analyze Mobile App Authenticity & Store Forensics
app.post('/api/analyze/app', async (req: Request, res: Response): Promise<void> => {
  const t0 = performance.now();
  try {
    const parseResult = AnalyzeAppSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid app analysis payload' });
      return;
    }

    const { urlOrPackageId, storeHint, bypassCache } = parseResult.data;

    // Validate and parse target safely (SSRF safe)
    let target;
    try {
      target = parseAndValidateAppInput(urlOrPackageId, storeHint);
    } catch (valErr: any) {
      res.status(400).json({ error: valErr.message || 'Invalid store URL or package identifier' });
      return;
    }

    // Cache key
    const cacheKey = scanCache.generateKey('app', target.packageOrId, target.store);

    if (!bypassCache) {
      const cached = scanCache.get(cacheKey);
      if (cached) {
        const t_total_ms = Math.round((performance.now() - t0) * 10) / 10;
        const timing: ScanTimings = {
          t_preprocess_ms: 0,
          t_cache_ms: t_total_ms,
          t_ai_ms: 0,
          t_parse_ms: 0,
          t_total_ms,
          cache_status: 'HIT',
          circuit_state: aiCircuitBreaker.getState(),
        };
        cached.timing = timing;
        res.setHeader('Server-Timing', `cache;dur=${t_total_ms};desc="Cache Hit", total;dur=${t_total_ms}`);
        res.json(cached);
        return;
      }
    }

    // Singleflight coalescing
    const { result } = await scanCache.coalesce(cacheKey, async () => {
      const t_prep_start = performance.now();

      // Retrieve store metadata (Apple lookup API / Google Play HTML / benchmark fallback)
      const appMetadata = await retrieveAppMetadata(target);

      // Deterministic heuristics
      const deterministic = analyzeAppDeterministic(appMetadata);
      const t_preprocess_ms = Math.round((performance.now() - t_prep_start) * 10) / 10;

      // Gemini AI enhancement
      let aiResult: (Partial<AnalysisResult> & { aiForensicFindings?: string[] }) | null = null;
      let mode: 'ai_enhanced' | 'heuristic_fallback' = 'heuristic_fallback';
      let t_ai_ms = 0;

      if (process.env.GEMINI_API_KEY && aiCircuitBreaker.getState() !== 'OPEN') {
        const t_ai_start = performance.now();
        try {
          aiResult = await geminiAnalyzerProvider.analyzeApp({
            appMetadata,
            deterministicData: deterministic,
          });
          mode = 'ai_enhanced';
        } catch (aiErr: any) {
          console.warn(`[AI App Provider Fallback] Reason: ${aiErr.message || 'Error/Timeout'}. Fast deterministic engine engaged.`);
        } finally {
          t_ai_ms = Math.round((performance.now() - t_ai_start) * 10) / 10;
        }
      }

      // Merge results
      const t_parse_start = performance.now();
      let finalRiskScore = deterministic.riskScore;
      let finalRiskLevel: RiskLevel = deterministic.riskLevel;
      let finalScamType: ScamType = deterministic.scamType;
      let finalSummary = deterministic.summary;
      let finalRedFlags = [...deterministic.redFlags];
      let finalTactics = [...deterministic.psychologicalTactics];
      let finalActions = [...deterministic.recommendedActions];
      let confidence = deterministic.confidence;
      let forensicFindings = [...deterministic.aiForensicFindings];

      if (aiResult) {
        finalRiskScore = Math.max(deterministic.riskScore, aiResult.riskScore ?? 0);
        if (finalRiskScore >= 75) finalRiskLevel = 'CRITICAL';
        else if (finalRiskScore >= 50) finalRiskLevel = 'HIGH';
        else if (finalRiskScore >= 25) finalRiskLevel = 'MEDIUM';
        else finalRiskLevel = 'LOW';

        if (aiResult.scamType && aiResult.scamType !== 'Unclassified') {
          finalScamType = aiResult.scamType;
        }
        if (aiResult.summary) finalSummary = aiResult.summary;
        if (aiResult.confidence) confidence = aiResult.confidence;

        if (aiResult.redFlags) {
          for (const flag of aiResult.redFlags) {
            if (!finalRedFlags.some((f) => f.title.toLowerCase() === flag.title.toLowerCase())) {
              finalRedFlags.push(flag);
            }
          }
        }
        if (aiResult.psychologicalTactics) {
          finalTactics = Array.from(new Set([...finalTactics, ...aiResult.psychologicalTactics]));
        }
        if (aiResult.recommendedActions && aiResult.recommendedActions.length > 0) {
          finalActions = aiResult.recommendedActions;
        }
        if (aiResult.aiForensicFindings) {
          forensicFindings = Array.from(new Set([...forensicFindings, ...aiResult.aiForensicFindings]));
        }
      }

      const t_parse_ms = Math.round((performance.now() - t_parse_start) * 10) / 10;
      const t_total_ms = Math.round((performance.now() - t0) * 10) / 10;

      const timing: ScanTimings = {
        t_preprocess_ms,
        t_cache_ms: 0,
        t_ai_ms,
        t_parse_ms,
        t_total_ms,
        cache_status: 'MISS',
        circuit_state: aiCircuitBreaker.getState(),
      };

      const finalAppResult: AppAuthenticityResult = {
        ...deterministic,
        id: generateScanId(),
        timestamp: new Date().toISOString(),
        targetType: 'app',
        scamType: finalScamType,
        riskScore: finalRiskScore,
        riskLevel: finalRiskLevel,
        confidence,
        summary: finalSummary,
        redFlags: finalRedFlags,
        psychologicalTactics: finalTactics,
        recommendedActions: finalActions,
        aiForensicFindings: forensicFindings,
        sourceAnalysisMode: mode,
        disclaimer: DISCLAIMER_TEXT,
        timing,
      };

      // Store in bounded cache
      scanCache.set(cacheKey, finalAppResult);

      return finalAppResult;
    });

    const totalDur = Math.round((performance.now() - t0) * 10) / 10;
    res.setHeader(
      'Server-Timing',
      `preprocess;dur=${result.timing?.t_preprocess_ms || 0}, ai;dur=${result.timing?.t_ai_ms || 0}, total;dur=${totalDur}`
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing mobile app:', error);
    res.status(500).json({ error: error.message || 'Internal server error while analyzing mobile app' });
  }
});

// Route: Threat Intelligence Feed Status
app.get('/api/threat-intel/status', (_req: Request, res: Response): void => {
  res.json(threatIntelService.getStatus());
});

// Route: Direct Threat Intelligence Query
app.post('/api/threat-intel/query', (req: Request, res: Response): void => {
  const parse = ThreatIntelQuerySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Missing query target' });
    return;
  }
  const result = threatIntelService.checkIndicator(parse.data.query);
  res.json({
    query: parse.data.query,
    found: !!result,
    record: result,
  });
});

// Route: Cache & Performance Telemetry Stats
app.get('/api/cache/stats', (_req: Request, res: Response): void => {
  res.json({
    cache: scanCache.getStats(),
    circuitBreaker: aiCircuitBreaker.getStatus(),
  });
});

// Route: Clear Cache (User-controlled / benchmark testing)
app.post('/api/cache/clear', (_req: Request, res: Response): void => {
  scanCache.clear();
  aiCircuitBreaker.reset();
  res.json({ success: true, message: 'Scan cache cleared and circuit breaker reset' });
});

// ==========================================
// LIVE SCAM TRACKER API ENDPOINTS
// ==========================================

// Route: Get Scam Tracker Summary Statistics & Category Breakdown
app.get('/api/scam-tracker/stats', (_req: Request, res: Response): void => {
  try {
    const stats = liveScamTrackerService.getStats();
    const categories = liveScamTrackerService.getCategoryStatistics();
    res.json({
      success: true,
      stats,
      categories,
    });
  } catch (err: any) {
    console.error('Error fetching scam tracker stats:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve live scam tracker metrics' });
  }
});

// Route: Get Filtered Live Scam Feed Items
app.get('/api/scam-tracker/feed', (req: Request, res: Response): void => {
  try {
    const parsedQuery = ScamTrackerFeedQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      res.status(400).json({
        success: false,
        error: parsedQuery.error.issues[0]?.message || 'Invalid feed query parameters',
      });
      return;
    }

    const { items, totalCount, hasMore } = liveScamTrackerService.getFilteredFeed(parsedQuery.data);
    res.json({
      success: true,
      items,
      totalCount,
      hasMore,
      query: parsedQuery.data,
    });
  } catch (err: any) {
    console.error('Error querying scam tracker feed:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve scam tracker feed' });
  }
});

// Route: Get Geographic Intelligence & State-wise Scam Data
app.get('/api/scam-tracker/regions', (_req: Request, res: Response): void => {
  try {
    const regions = liveScamTrackerService.getRegionalThreatData();
    res.json({
      success: true,
      regions,
      sourceNotice: 'Locations reflect official state cyber crime division releases and verified advisory reports. ScamShield AI never infers victim location from IP addresses.',
    });
  } catch (err: any) {
    console.error('Error fetching regional threat data:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve regional threat intelligence' });
  }
});

// Route: Trigger Live Feed Refresh
app.post('/api/scam-tracker/refresh', (_req: Request, res: Response): void => {
  try {
    const updatedStats = liveScamTrackerService.refresh();
    const categories = liveScamTrackerService.getCategoryStatistics();
    res.json({
      success: true,
      message: 'Live scam intelligence feeds synchronized successfully',
      stats: updatedStats,
      categories,
    });
  } catch (err: any) {
    console.error('Error refreshing scam tracker feeds:', err);
    res.status(500).json({ success: false, error: 'Failed to refresh scam intelligence feeds' });
  }
});

// Route: Ingest Community Report (marked UNVERIFIED_SUBMISSION)
app.post('/api/scam-tracker/report', (req: Request, res: Response): void => {
  try {
    const { title, category, description, indicators, affectedRegion } = req.body || {};
    if (!title || !category || !description) {
      res.status(400).json({ success: false, error: 'Title, category, and description are required' });
      return;
    }

    const ingested = liveScamTrackerService.ingestReport({
      title: String(title).slice(0, 150),
      category,
      description: String(description).slice(0, 1000),
      indicators: Array.isArray(indicators) ? indicators.map(String).slice(0, 5) : [],
      affectedRegion: affectedRegion ? String(affectedRegion).slice(0, 60) : 'Pan-India',
      verificationStatus: 'UNVERIFIED_SUBMISSION',
      riskLevel: 'MEDIUM',
    });

    res.json({
      success: true,
      message: 'Community scam report recorded under moderation review.',
      reportId: ingested.id,
    });
  } catch (err: any) {
    console.error('Error ingesting scam report:', err);
    res.status(500).json({ success: false, error: 'Failed to record community report' });
  }
});

// Vite Dev vs Production Handling
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In dev, use Vite's connect instance as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ScamShield AI] Server running on http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('[ScamShield AI] Fatal server startup error:', err);
  process.exit(1);
});
