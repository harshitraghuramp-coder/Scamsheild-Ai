import React, { useState } from 'react';
import { analyzeAppApi } from '../../services/api';
import { AnalysisResult, AppAuthenticityResult } from '../../types';
import {
  Smartphone,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

interface AppAuthenticityScannerProps {
  onScanComplete: (result: AnalysisResult, inputSnippet: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
}

const SAMPLE_APPS = [
  {
    title: 'WhatsApp Official (Meta)',
    store: 'Google Play',
    type: 'legit',
    badge: 'Official Benchmark',
    url: 'https://play.google.com/store/apps/details?id=com.whatsapp',
  },
  {
    title: 'WhatsChat Gold (Lookalike & SMS)',
    store: 'Google Play',
    type: 'fake',
    badge: 'Typosquat & Trojan',
    url: 'https://play.google.com/store/apps/details?id=com.whvtsapp.gold.messenger.free',
  },
  {
    title: 'Chase Instant Cash Loan',
    store: 'Google Play',
    type: 'fake',
    badge: 'SpyLoan Impersonator',
    url: 'https://play.google.com/store/apps/details?id=com.chase.instant.quickloan.finance',
  },
  {
    title: 'MetaMask Pro Wallet',
    store: 'Google Play',
    type: 'fake',
    badge: 'Crypto Drainer',
    url: 'https://play.google.com/store/apps/details?id=io.metamask.prowallet.crypto',
  },
  {
    title: 'PayPal Official (Apple iOS)',
    store: 'App Store',
    type: 'legit',
    badge: 'Official iOS',
    url: 'https://apps.apple.com/us/app/paypal-send-shop-manage/id283646709',
  },
];

export const AppAuthenticityScanner: React.FC<AppAuthenticityScannerProps> = ({
  onScanComplete,
  isLoading,
  setIsLoading,
  setError,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [storeFilter, setStoreFilter] = useState<'auto' | 'google_play' | 'apple_app_store'>('auto');
  const [progressStep, setProgressStep] = useState(0);

  // Live input analyzer for UI feedback
  const getParsedTargetPreview = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 3) return null;

    if (trimmed.includes('play.google.com')) {
      const match = trimmed.match(/id=([a-zA-Z0-9._]+)/i);
      return {
        store: 'Google Play Store',
        icon: '▶',
        id: match ? match[1] : 'parsing package...',
        isValid: !!match,
      };
    }

    if (trimmed.includes('apps.apple.com') || trimmed.includes('itunes.apple.com')) {
      const match = trimmed.match(/id(\d+)/i);
      return {
        store: 'Apple App Store',
        icon: '',
        id: match ? `id${match[1]}` : 'parsing track ID...',
        isValid: !!match,
      };
    }

    if (/^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+$/.test(trimmed)) {
      return {
        store: storeFilter === 'apple_app_store' ? 'Apple App Store' : 'Google Play Store (Package Name)',
        icon: storeFilter === 'apple_app_store' ? '' : '▶',
        id: trimmed,
        isValid: true,
      };
    }

    if (/^id?\d{7,12}$/i.test(trimmed)) {
      return {
        store: 'Apple App Store (Track ID)',
        icon: '',
        id: trimmed,
        isValid: true,
      };
    }

    return {
      store: 'Unrecognized URL / Format',
      icon: '?',
      id: trimmed,
      isValid: false,
    };
  };

  const preview = getParsedTargetPreview(inputUrl);

  const handleScan = async (overrideUrl?: string) => {
    const targetToScan = (overrideUrl || inputUrl).trim();
    if (!targetToScan) {
      setError('Please provide a Google Play Store or Apple App Store URL or package ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgressStep(1);

    // Staged progress simulation for deep investigation UX
    const step2Timer = setTimeout(() => setProgressStep(2), 600);
    const step3Timer = setTimeout(() => setProgressStep(3), 1200);

    try {
      const result: AppAuthenticityResult = await analyzeAppApi(
        targetToScan,
        storeFilter,
        false
      );

      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setProgressStep(4);

      onScanComplete(result, targetToScan);
    } catch (err: any) {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setError(
        err.message || 'Investigation failed. Verify that the URL matches an official Google Play or Apple App Store app.'
      );
    } finally {
      setIsLoading(false);
      setProgressStep(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feature Intro Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">App Authenticity & Risk Forensics</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-900/60 border border-cyan-700/60 text-[10px] font-mono text-cyan-300">
                Play Store & App Store
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Investigate fake, malicious, or impersonating mobile apps before installation. Analyzes developer credibility, permission scope (Accessibility/SMS), and trademark spoofing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="text-emerald-400">●</span> SSRF-Protected
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="text-cyan-400">●</span> Zero-Execution
          </span>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Mobile App URL or Identifier</span>
            <span className="text-[10px] text-slate-500 normal-case font-normal">
              (Google Play Store or Apple App Store link)
            </span>
          </label>

          {/* Store selector toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setStoreFilter('auto')}
              className={`px-2 py-0.5 rounded-lg transition ${
                storeFilter === 'auto' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auto-Detect
            </button>
            <button
              type="button"
              onClick={() => setStoreFilter('google_play')}
              className={`px-2 py-0.5 rounded-lg transition ${
                storeFilter === 'google_play' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ▶ Google Play
            </button>
            <button
              type="button"
              onClick={() => setStoreFilter('apple_app_store')}
              className={`px-2 py-0.5 rounded-lg transition ${
                storeFilter === 'apple_app_store' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
               App Store
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleScan();
              }
            }}
            placeholder="e.g. https://play.google.com/store/apps/details?id=com.whatsapp or https://apps.apple.com/app/id283646709"
            disabled={isLoading}
            className="w-full px-4 py-3.5 pr-28 rounded-2xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 font-mono transition shadow-inner"
          />

          <button
            type="button"
            onClick={() => handleScan()}
            disabled={isLoading || !inputUrl.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Inspect App</span>
              </>
            )}
          </button>
        </div>

        {/* Live Input Target Breakdown */}
        {preview && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-400">{preview.icon}</span>
              <span className="text-slate-400">Target Store:</span>
              <span className="font-semibold text-slate-200">{preview.store}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Parsed ID:</span>
              <span className="font-mono text-cyan-300 font-bold">{preview.id}</span>
              {preview.isValid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading Progress State */}
      {isLoading && (
        <div className="p-5 rounded-2xl bg-[#0B132B]/90 border border-cyan-500/40 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Multi-Stage App Authenticity Forensics in Progress</span>
            </span>
            <span className="text-slate-400">Step {progressStep || 1}/3</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 transition-all duration-300"
              style={{ width: `${(progressStep / 3) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 pt-1">
            <div className={`p-2 rounded-lg border ${progressStep >= 1 ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-200' : 'bg-slate-900/40 border-slate-800'}`}>
              1. Store metadata & developer identity
            </div>
            <div className={`p-2 rounded-lg border ${progressStep >= 2 ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-200' : 'bg-slate-900/40 border-slate-800'}`}>
              2. Permissions & trademark typosquatting
            </div>
            <div className={`p-2 rounded-lg border ${progressStep >= 3 ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-200' : 'bg-slate-900/40 border-slate-800'}`}>
              3. Gemini AI threat analysis & scoring
            </div>
          </div>
        </div>
      )}

      {/* Sample Benchmark Apps for Fast Testing */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Curated Benchmark Test Scenarios</span>
          </span>
          <span className="text-[11px] text-slate-500">Click to run instant investigation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SAMPLE_APPS.map((app, index) => (
            <button
              key={index}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setInputUrl(app.url);
                handleScan(app.url);
              }}
              className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-left transition duration-200 group cursor-pointer space-y-1.5 disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {app.store}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    app.type === 'legit'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {app.badge}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition line-clamp-1">
                {app.title}
              </div>

              <div className="text-[10px] font-mono text-slate-500 truncate">
                {app.url.replace(/^https?:\/\/[^/]+/i, '')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Security Guidance Note */}
      <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="text-slate-300 font-semibold">Security Boundary: </span>
          ScamShield AI inspects public store metadata and developer signatures. It never downloads, installs, or executes binaries on your system, avoiding any risk of malware infection.
        </div>
      </div>
    </div>
  );
};
