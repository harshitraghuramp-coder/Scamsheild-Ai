import { AnalysisResult, AppAuthenticityResult, ThreatIntelStatus, ThreatIntelRecord } from '../types';

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

export async function analyzeAppApi(
  urlOrPackageId: string,
  storeHint: 'google_play' | 'apple_app_store' | 'auto' = 'auto',
  bypassCache: boolean = false,
  signal?: AbortSignal
): Promise<AppAuthenticityResult> {
  const response = await fetch('/api/analyze/app', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urlOrPackageId, storeHint, bypassCache }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned error ${response.status}`);
  }

  const data: AppAuthenticityResult = await response.json();
  data.originalInputPreview = urlOrPackageId;
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

// Live Scam Tracker API Functions
import type {
  ScamTrackerStats,
  CategoryStat,
  ScamAlertItem,
  RegionalThreatData,
} from '../types';

export async function fetchScamTrackerStats(): Promise<{
  success: boolean;
  stats: ScamTrackerStats;
  categories: CategoryStat[];
}> {
  const response = await fetch('/api/scam-tracker/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch live scam tracker statistics');
  }
  return response.json();
}

export async function fetchScamTrackerFeed(params?: {
  category?: string;
  riskLevel?: string;
  status?: string;
  region?: string;
  search?: string;
  sortBy?: 'latest' | 'highest_risk' | 'most_reported';
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  items: ScamAlertItem[];
  totalCount: number;
  hasMore: boolean;
}> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'ALL') query.set('category', params.category);
  if (params?.riskLevel && params.riskLevel !== 'ALL') query.set('riskLevel', params.riskLevel);
  if (params?.status && params.status !== 'ALL') query.set('status', params.status);
  if (params?.region && params.region !== 'ALL') query.set('region', params.region);
  if (params?.search) query.set('search', params.search);
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset !== undefined) query.set('offset', String(params.offset));

  const url = `/api/scam-tracker/feed${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch live scam feed');
  }
  return response.json();
}

export async function fetchScamTrackerRegions(): Promise<{
  success: boolean;
  regions: RegionalThreatData[];
  sourceNotice: string;
}> {
  const response = await fetch('/api/scam-tracker/regions');
  if (!response.ok) {
    throw new Error('Failed to fetch regional threat distribution');
  }
  return response.json();
}

export async function refreshScamTrackerFeeds(): Promise<{
  success: boolean;
  message: string;
  stats: ScamTrackerStats;
  categories: CategoryStat[];
}> {
  const response = await fetch('/api/scam-tracker/refresh', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to refresh live scam intelligence feeds');
  }
  return response.json();
}

export async function submitCommunityScamReport(payload: {
  title: string;
  category: string;
  description: string;
  indicators?: string[];
  affectedRegion?: string;
}): Promise<{ success: boolean; message: string; reportId: string }> {
  const response = await fetch('/api/scam-tracker/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit report');
  }
  return response.json();
}

