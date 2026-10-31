import { AnalysisResult } from '../types.ts';

export interface MessageAnalysisInput {
  content: string;
  categoryContext?: string;
}

export interface UrlAnalysisInput {
  url: string;
  deterministicData?: any;
}

export interface MultimodalAnalysisInput {
  imageBase64: string;
  mimeType: string;
  extractedOcrText?: string;
}

export interface PhoneCallAnalysisInput {
  transcript: string;
  callerContext?: string;
  callerIdOrNumber?: string;
}

export interface AppAnalysisInput {
  appMetadata: any;
  deterministicData?: any;
}

export interface IAIAnalyzerProvider {
  name: string;
  analyzeMessage(input: MessageAnalysisInput): Promise<Partial<AnalysisResult>>;
  analyzeUrl(input: UrlAnalysisInput): Promise<Partial<AnalysisResult>>;
  analyzeMultimodal(input: MultimodalAnalysisInput): Promise<Partial<AnalysisResult>>;
  analyzePhoneCall(input: PhoneCallAnalysisInput): Promise<Partial<AnalysisResult>>;
  analyzeApp(input: AppAnalysisInput): Promise<Partial<AnalysisResult>>;
}
