import { AnalysisResult, ScanHistoryItem } from '../types';

const STORAGE_KEY = 'scamshield_scan_history_v1';
const PRIVACY_SETTING_KEY = 'scamshield_history_enabled';

export function isHistoryEnabled(): boolean {
  try {
    const val = localStorage.getItem(PRIVACY_SETTING_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setHistoryEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(PRIVACY_SETTING_KEY, enabled ? 'true' : 'false');
    if (!enabled) {
      clearHistory();
    }
  } catch (err) {
    console.error('Failed to update history preference', err);
  }
}

export function getScanHistory(): ScanHistoryItem[] {
  if (!isHistoryEnabled()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as ScanHistoryItem[];
  } catch (e) {
    console.error('Failed to parse scan history from localStorage', e);
    return [];
  }
}

export function saveScanToHistory(result: AnalysisResult, inputSnippet: string): void {
  if (!isHistoryEnabled()) return;
  try {
    const history = getScanHistory();
    const item: ScanHistoryItem = {
      ...result,
      inputSnippet: inputSnippet || result.summary.slice(0, 80),
    };

    // Prepend new item and keep maximum 50 most recent items to prevent storage bloat
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save scan to localStorage', e);
  }
}

export function deleteScanFromHistory(id: string): ScanHistoryItem[] {
  try {
    const history = getScanHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete scan from localStorage', e);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}

export function exportHistoryAsJson(): void {
  const history = getScanHistory();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `scamshield-report-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
