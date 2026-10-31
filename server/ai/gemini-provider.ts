import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { IAIAnalyzerProvider, MessageAnalysisInput, MultimodalAnalysisInput, UrlAnalysisInput } from './provider.js';
import { AnalysisResult, RiskLevel, ScamType, DISCLAIMER_TEXT } from '../types.js';
import { aiCircuitBreaker } from './circuit-breaker.js';

export class GeminiAnalyzerProvider implements IAIAnalyzerProvider {
  public name = 'Google Gemini (gemini-3.8-flash)';
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  private isConfigured(): boolean {
    return !!this.ai && !!process.env.GEMINI_API_KEY;
  }

  public async analyzeMessage(input: MessageAnalysisInput): Promise<Partial<AnalysisResult>> {
    if (!this.isConfigured() || !this.ai) {
      throw new Error('Gemini API is not configured on the server.');
    }

    return aiCircuitBreaker.execute(async (signal) => {
      const systemPrompt = `You are ScamShield AI. Detect online scams, phishing, social engineering, credential theft, advance fees, or extortion.
Rules:
1. Explain concisely WHY content appears suspicious with forensic rationale.
2. Recommend concrete safety actions.
3. NEVER guarantee scam detection or claim safe.
4. Categorize psychological tactics.
5. Return concise JSON matching schema without unnecessary prose.`;

      const userPrompt = `Content:
"""
${input.content.slice(0, 3000)}
"""
Context: ${input.categoryContext || 'general'}`;

      const response = await this.ai!.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scamType: { type: Type.STRING },
              riskScore: { type: Type.INTEGER },
              riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
              confidence: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              summary: { type: Type.STRING },
              redFlags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
                  },
                  required: ['title', 'description', 'severity'],
                },
              },
              psychologicalTactics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    step: { type: Type.INTEGER },
                    action: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['immediate', 'recommended', 'optional'] },
                  },
                  required: ['step', 'action', 'priority'],
                },
              },
            },
            required: [
              'scamType',
              'riskScore',
              'riskLevel',
              'confidence',
              'summary',
              'redFlags',
              'psychologicalTactics',
              'recommendedActions',
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from AI model');
      }

      const parsed = JSON.parse(text);
      return {
        scamType: parsed.scamType as ScamType,
        riskScore: Math.min(100, Math.max(0, parsed.riskScore)),
        riskLevel: parsed.riskLevel as RiskLevel,
        confidence: parsed.confidence,
        summary: parsed.summary,
        redFlags: parsed.redFlags,
        psychologicalTactics: parsed.psychologicalTactics,
        recommendedActions: parsed.recommendedActions,
        sourceAnalysisMode: 'ai_enhanced',
        disclaimer: DISCLAIMER_TEXT,
      };
    });
  }

  public async analyzeUrl(input: UrlAnalysisInput): Promise<Partial<AnalysisResult>> {
    if (!this.isConfigured() || !this.ai) {
      throw new Error('Gemini API is not configured on the server.');
    }

    return aiCircuitBreaker.execute(async (signal) => {
      const systemPrompt = `You are ScamShield AI. Analyze destination URL for brand spoofing, phishing, and credential harvesting. Return concise JSON.`;

      const userPrompt = `URL: ${input.url}
Heuristics:
${JSON.stringify(input.deterministicData, null, 2)}`;

      const response = await this.ai!.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scamType: { type: Type.STRING },
              riskScore: { type: Type.INTEGER },
              riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
              confidence: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              summary: { type: Type.STRING },
              redFlags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
                  },
                  required: ['title', 'description', 'severity'],
                },
              },
              psychologicalTactics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    step: { type: Type.INTEGER },
                    action: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['immediate', 'recommended', 'optional'] },
                  },
                  required: ['step', 'action', 'priority'],
                },
              },
            },
            required: [
              'scamType',
              'riskScore',
              'riskLevel',
              'confidence',
              'summary',
              'redFlags',
              'psychologicalTactics',
              'recommendedActions',
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from AI model');
      }

      const parsed = JSON.parse(text);
      return {
        scamType: parsed.scamType as ScamType,
        riskScore: Math.min(100, Math.max(0, parsed.riskScore)),
        riskLevel: parsed.riskLevel as RiskLevel,
        confidence: parsed.confidence,
        summary: parsed.summary,
        redFlags: parsed.redFlags,
        psychologicalTactics: parsed.psychologicalTactics,
        recommendedActions: parsed.recommendedActions,
        sourceAnalysisMode: 'ai_enhanced',
        disclaimer: DISCLAIMER_TEXT,
      };
    });
  }

  public async analyzeMultimodal(input: MultimodalAnalysisInput): Promise<Partial<AnalysisResult>> {
    if (!this.isConfigured() || !this.ai) {
      throw new Error('Gemini API is not configured on the server.');
    }

    return aiCircuitBreaker.execute(async (signal) => {
      const imagePart = {
        inlineData: {
          mimeType: input.mimeType,
          data: input.imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      };

      const textPrompt = `Analyze this suspicious screenshot. OCR Text: "${(input.extractedOcrText || '').slice(0, 1000)}". Identify scam type, risk level, psychological triggers, and immediate safety actions. Return concise JSON.`;

      const response = await this.ai!.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [imagePart, { text: textPrompt }],
        },
        config: {
          systemInstruction: 'You are ScamShield AI. Forensic image analysis for scams. Return concise JSON.',
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scamType: { type: Type.STRING },
              riskScore: { type: Type.INTEGER },
              riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
              confidence: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              summary: { type: Type.STRING },
              redFlags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
                  },
                  required: ['title', 'description', 'severity'],
                },
              },
              psychologicalTactics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    step: { type: Type.INTEGER },
                    action: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['immediate', 'recommended', 'optional'] },
                  },
                  required: ['step', 'action', 'priority'],
                },
              },
            },
            required: [
              'scamType',
              'riskScore',
              'riskLevel',
              'confidence',
              'summary',
              'redFlags',
              'psychologicalTactics',
              'recommendedActions',
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from AI model');
      }

      const parsed = JSON.parse(text);
      return {
        scamType: parsed.scamType as ScamType,
        riskScore: Math.min(100, Math.max(0, parsed.riskScore)),
        riskLevel: parsed.riskLevel as RiskLevel,
        confidence: parsed.confidence,
        summary: parsed.summary,
        redFlags: parsed.redFlags,
        psychologicalTactics: parsed.psychologicalTactics,
        recommendedActions: parsed.recommendedActions,
        sourceAnalysisMode: 'ai_enhanced',
        disclaimer: DISCLAIMER_TEXT,
      };
    });
  }

  public async analyzePhoneCall(input: {
    transcript: string;
    callerContext?: string;
    callerIdOrNumber?: string;
  }): Promise<Partial<AnalysisResult>> {
    if (!this.isConfigured() || !this.ai) {
      throw new Error('Gemini API is not configured on the server.');
    }

    return aiCircuitBreaker.execute(async (signal) => {
      const systemPrompt = `You are ScamShield AI, specialized in Voice Phishing (Vishing) and Phone Scam forensics.
Analyze the telephone conversation transcript for indicators of:
- Fake bank fraud department calls & OTP/credential solicitation
- Police / law enforcement impersonation ("digital arrest", narcotics seizures, fake warrants)
- Fake tech support calls (AnyDesk/TeamViewer remote takeovers)
- Intimidation, arrest threats, fake IRS/tax deficits
- Kidnapping / emergency bail extortion using voice clones
- Fake job offers with upfront fees over the phone

Identify social engineering tactics (Urgency, Intimidation, Impersonation, Request for Confidential Info, Isolation).
Recommend immediate, actionable safety measures (e.g. hang up, call official bank number, report to authorities).
Never guarantee that a call is safe. Return concise JSON.`;

      const userPrompt = `Caller ID: ${input.callerIdOrNumber || 'Unknown / Withheld'}
Context Hint: ${input.callerContext || 'general'}
Transcript:
"""
${input.transcript.slice(0, 4000)}
"""`;

      const response = await this.ai!.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scamType: { type: Type.STRING },
              riskScore: { type: Type.INTEGER },
              riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
              confidence: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              summary: { type: Type.STRING },
              redFlags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
                  },
                  required: ['title', 'description', 'severity'],
                },
              },
              psychologicalTactics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    step: { type: Type.INTEGER },
                    action: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['immediate', 'recommended', 'optional'] },
                  },
                  required: ['step', 'action', 'priority'],
                },
              },
            },
            required: [
              'scamType',
              'riskScore',
              'riskLevel',
              'confidence',
              'summary',
              'redFlags',
              'psychologicalTactics',
              'recommendedActions',
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from AI model');
      }

      const parsed = JSON.parse(text);
      return {
        scamType: parsed.scamType as ScamType,
        riskScore: Math.min(100, Math.max(0, parsed.riskScore)),
        riskLevel: parsed.riskLevel as RiskLevel,
        confidence: parsed.confidence,
        summary: parsed.summary,
        redFlags: parsed.redFlags,
        psychologicalTactics: parsed.psychologicalTactics,
        recommendedActions: parsed.recommendedActions,
        sourceAnalysisMode: 'ai_enhanced',
        disclaimer: DISCLAIMER_TEXT,
      };
    });
  }
}

export const geminiAnalyzerProvider = new GeminiAnalyzerProvider();
