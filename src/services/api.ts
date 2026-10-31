import { AnalysisResult, ThreatIntelStatus, ThreatIntelRecord } from '../types';

export async function analyzeMessageApi(
  content: string,
  categoryContext: string = 'general',
  bypassCache: boolean = false,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, categoryContext, bypassCache }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned error ${response.status}`);
  }

  const data: AnalysisResult = await response.json();
  data.originalInputPreview = content.slice(0, 150) + (content.length > 150 ? '...' : '');
  return data;
}

export async function analyzeUrlApi(
  url: string,
  bypassCache: boolean = false,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze/url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, bypassCache }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned error ${response.status}`);
  }

  const data: AnalysisResult = await response.json();
  data.originalInputPreview = url;
  return data;
}

export async function analyzeScreenshotApi(
  imageBase64: string,
  mimeType: string,
  extractedOcrText?: string
): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze/screenshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, extractedOcrText }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned error ${response.status}`);
  }

  const data: AnalysisResult = await response.json();
  data.originalInputPreview = extractedOcrText
    ? (extractedOcrText.slice(0, 120) + (extractedOcrText.length > 120 ? '...' : ''))
    : 'Screenshot Image Analysis';
  return data;
}

export async function analyzePhoneCallApi(
  transcript: string,
  callerContext: string = 'general',
  callerIdOrNumber?: string,
  bypassCache: boolean = false,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze/phone-call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, callerContext, callerIdOrNumber, bypassCache }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned error ${response.status}`);
  }

  const data: AnalysisResult = await response.json();
  data.originalInputPreview = transcript.slice(0, 140) + (transcript.length > 140 ? '...' : '');
  return data;
}

export async function fetchThreatIntelStatus(): Promise<ThreatIntelStatus> {
  const response = await fetch('/api/threat-intel/status');
  if (!response.ok) {
    throw new Error('Failed to fetch threat intelligence feed status');
  }
  return response.json();
}

export async function queryThreatIntel(query: string): Promise<{ query: string; found: boolean; record: ThreatIntelRecord | null }> {
  const response = await fetch('/api/threat-intel/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error('Threat intelligence query failed');
  }
  return response.json();
}

export async function fetchCacheStats(): Promise<{ cache: any; circuitBreaker: any }> {
  const response = await fetch('/api/cache/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch cache stats');
  }
  return response.json();
}

export async function clearCacheApi(): Promise<void> {
  const response = await fetch('/api/cache/clear', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to clear cache');
  }
}
