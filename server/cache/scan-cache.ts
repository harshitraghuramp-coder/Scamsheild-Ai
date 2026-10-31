import crypto from 'crypto';
import { AnalysisResult } from '../types.js';

export interface CacheEntry {
  keyHash: string;
  result: AnalysisResult;
  timestamp: number;
  expiresAt: number;
  hits: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  ttlMs: number;
  hitRatio: number;
}

export class ScanCache {
  private cache = new Map<string, CacheEntry>();
  private inFlight = new Map<string, Promise<AnalysisResult>>();
  private readonly maxSize: number;
  private readonly ttlMs: number;
  private hits = 0;
  private misses = 0;
  private enabled = true;

  constructor(maxSize = 500, ttlSeconds = 600) {
    this.maxSize = maxSize;
    this.ttlMs = ttlSeconds * 1000;
  }

  /**
   * Generates a safe SHA-256 hash key without exposing user content.
   */
  public generateKey(type: string, content: string, context = ''): string {
    const normalized = content.trim().toLowerCase().replace(/\s+/g, ' ');
    return crypto
      .createHash('sha256')
      .update(`${type}:${context}:${normalized}`)
      .digest('hex');
  }

  public get(key: string): AnalysisResult | null {
    if (!this.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    entry.hits++;
    this.hits++;

    // Return cloned object with updated timestamp for this specific request
    return {
      ...entry.result,
      id: 'CACHE-' + key.slice(0, 8).toUpperCase(),
      timestamp: new Date().toISOString(),
    };
  }

  public set(key: string, result: AnalysisResult): void {
    if (!this.enabled) return;

    // Evict oldest entries if capacity exceeded (LRU)
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const now = Date.now();
    this.cache.set(key, {
      keyHash: key,
      result,
      timestamp: now,
      expiresAt: now + this.ttlMs,
      hits: 0,
    });
  }

  /**
   * In-flight coalescing: coalesces identical concurrent scans to a single execution
   */
  public async coalesce(
    key: string,
    fetcher: () => Promise<AnalysisResult>
  ): Promise<{ result: AnalysisResult; isCoalesced: boolean }> {
    const existingPromise = this.inFlight.get(key);
    if (existingPromise) {
      const result = await existingPromise;
      return { result, isCoalesced: true };
    }

    const task = fetcher()
      .then((res) => {
        this.set(key, res);
        return res;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, task);
    const result = await task;
    return { result, isCoalesced: false };
  }

  public clear(): void {
    this.cache.clear();
    this.inFlight.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.clear();
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      maxSize: this.maxSize,
      ttlMs: this.ttlMs,
      hitRatio: total > 0 ? Number((this.hits / total).toFixed(3)) : 0,
    };
  }
}

export const scanCache = new ScanCache(500, 600); // 500 items, 10 min TTL
