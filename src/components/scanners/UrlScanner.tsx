import React, { useState } from 'react';
import { analyzeUrlApi } from '../../services/api';
import { AnalysisResult } from '../../types';
import { Globe, ShieldAlert, Sparkles, RefreshCw, Lock, Unlock, AlertTriangle } from 'lucide-react';

interface UrlScannerProps {
  onScanComplete: (result: AnalysisResult, inputSnippet: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
}

const SAMPLE_URLS = [
  {
    title: 'PayPal Phishing',
    tld: '.xyz',
    url: 'https://paypal-security-center-update.xyz/login/verify-account',
  },
  {
    title: 'Wells Fargo Phish',
    tld: '.com',
    url: 'https://secure-login-wellsfargo-verify.com/auth/login.php',
  },
  {
    title: 'Direct IP Login Trap',
    tld: 'IP',
    url: 'http://185.220.101.42/bank/secure/login',
  },
  {
    title: 'Chase 2FA Smish Host',
    tld: '.top',
    url: 'https://chase-online-account-unlock.top/verify?auth=79102',
  },
  {
    title: 'USPS Fake Redelivery',
    tld: '.buzz',
    url: 'https://usps-tracking-package-redelivery.buzz/claim',
  },
  {
    title: 'Netflix Billing Stealer',
    tld: '.fit',
    url: 'https://netflix-billing-reactivation.fit/update-billing',
  },
];

export const UrlScanner: React.FC<UrlScannerProps> = ({
  onScanComplete,
  isLoading,
  setIsLoading,
  setError,
}) => {
  const [url, setUrl] = useState('');

  // Live URL breakdown helper
  const getUrlPreview = (input: string) => {
    if (!input || input.length < 4) return null;
    let normalized = input.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
    try {
      const parsed = new URL(normalized);
      const isHttps = parsed.protocol === 'https:';
      const parts = parsed.hostname.split('.');
      const tld = parts.length > 1 ? parts[parts.length - 1] : '';
      return {
        protocol: parsed.protocol,
        isHttps,
        hostname: parsed.hostname,
        pathname: parsed.pathname,
        tld,
        subdomains: Math.max(0, parts.length - 2),
      };
    } catch {
      return null;
    }
  };

  const preview = getUrlPreview(url);

  const handleScan = async () => {
    if (!url.trim() || url.trim().length < 3) {
      setError('Please provide a valid URL or domain address to analyze.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await analyzeUrlApi(url.trim());
      onScanComplete(result, url.trim());
    } catch (err: any) {
      console.error('URL scan failed:', err);
      setError(err.message || 'Failed to inspect URL. Check network connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reputation Integration & Sandboxing Notice */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Zero-Execution Sandbox:</strong> ScamShield AI inspects syntax & signatures server-side. URLs are never automatically opened or pinged from your browser.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Threat DB: Active
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700" title="External Safe Browsing API key not set in environment; engine uses deterministic heuristics and verified threat signatures">
            External API: Fallback Engine
          </span>
        </div>
      </div>

      {/* Input Field Card */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Enter Suspicious URL or Hostname</span>
        </label>

        <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1 rounded-2xl border border-slate-800 bg-[#0B132B]/80 focus-within:border-cyan-500/50 focus-within:cyber-glow-cyan transition-all flex items-center px-4">
            <Globe className="w-5 h-5 text-slate-500 shrink-0 mr-3" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="e.g. https://paypal-security-center-update.xyz or chs-login.net"
              className="w-full bg-transparent py-3.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
              disabled={isLoading}
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="text-xs text-slate-500 hover:text-slate-300 font-sans cursor-pointer ml-2"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleScan}
            disabled={isLoading || !url.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditing Host...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Inspect URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Structural Inspector Preview */}
      {preview && (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-sans font-bold">
            <span>Syntax Breakdown</span>
            <span className="text-cyan-400">Pre-Scan Telemetry</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Protocol</span>
              <span className={`font-bold flex items-center gap-1 ${preview.isHttps ? 'text-emerald-400' : 'text-rose-400'}`}>
                {preview.isHttps ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {preview.protocol}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Target Host</span>
              <span className="text-slate-200 truncate block font-bold" title={preview.hostname}>
                {preview.hostname}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">TLD Extension</span>
              <span className="text-cyan-300 font-bold">
                .{preview.tld || 'none'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Subdomain Count</span>
              <span className={preview.subdomains >= 3 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                {preview.subdomains} {preview.subdomains >= 3 ? '(High Depth)' : ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sample Suspicious URLs */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Known Phishing / Threat Test Link:</span>
          </span>
          <span className="text-[11px] text-slate-500">Simulated live feed targets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_URLS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setUrl(sample.url)}
              className="text-left p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/80 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                  {sample.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400">
                  {sample.tld}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate group-hover:text-slate-300">
                {sample.url}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
