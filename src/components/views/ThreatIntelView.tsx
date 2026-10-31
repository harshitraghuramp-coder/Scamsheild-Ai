import React, { useState, useEffect } from 'react';
import { fetchThreatIntelStatus, queryThreatIntel } from '../../services/api';
import { ThreatIntelStatus, ThreatIntelRecord } from '../../types';
import {
  Activity,
  Shield,
  Database,
  Search,
  CheckCircle,
  AlertTriangle,
  Server,
  Cpu,
  RefreshCw,
  Lock,
  ExternalLink
} from 'lucide-react';

export const ThreatIntelView: React.FC = () => {
  const [status, setStatus] = useState<ThreatIntelStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [queryInput, setQueryInput] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<{ query: string; found: boolean; record: ThreatIntelRecord | null } | null>(null);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await fetchThreatIntelStatus();
      setStatus(data);
    } catch (e) {
      console.error('Failed to load threat intel status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    try {
      setQueryLoading(true);
      const res = await queryThreatIntel(queryInput.trim());
      setQueryResult(res);
    } catch (e) {
      console.error('Threat intel lookup failed', e);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Threat Intelligence & Engine Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed metrics, signature database health, and live IOC (Indicator of Compromise) lookups.
          </p>
        </div>

        <button
          onClick={loadStatus}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0B132B]/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Signatures</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {status ? status.totalActiveSignatures.toLocaleString() : '148,920'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Simulated Live Stream Sync
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B132B]/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Detection Engine</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            Hybrid AI+Rules
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Gemini 3.8 Flash & Deterministic
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B132B]/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Threat Feed Status</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
            Operational
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            5 Integrated Feeds
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B132B]/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Local Privacy</span>
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-300">
            Zero-Telemetry
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Client-side data isolation
          </div>
        </div>
      </div>

      {/* Live Indicator Lookup Tool */}
      <div className="p-6 rounded-2xl bg-[#0B132B]/80 border border-cyan-500/20 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400" />
          Live Threat IOC Lookup Tool
        </h3>
        <p className="text-xs text-slate-400">
          Query suspicious domain names, IP addresses, or URLs against our threat database:
        </p>

        <form onSubmit={handleQuery} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 flex items-center">
            <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="e.g. paypal-security-center-update.xyz or chase-online-account-unlock.top"
              className="w-full bg-transparent py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={queryLoading || !queryInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50"
          >
            {queryLoading ? 'Searching...' : 'Query Database'}
          </button>
        </form>

        {queryResult && (
          <div className="mt-4 p-4 rounded-xl border animate-in fade-in duration-200">
            {queryResult.found && queryResult.record ? (
              <div className="space-y-3 bg-rose-950/20 border-rose-500/40 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
                    <AlertTriangle className="w-4 h-4" />
                    Threat Match Found: {queryResult.record.threatCategory}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-500/50">
                    {queryResult.record.confidence}% Malicious Confidence
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Indicator:</span>{' '}
                    <span className="font-mono text-slate-200">{queryResult.record.indicator}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Source:</span>{' '}
                    <span className="text-cyan-300">{queryResult.record.source}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  {queryResult.record.description}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No active match found for <strong>{queryResult.query}</strong> in current blacklist feeds. Note that newly registered zero-day phishing sites may not yet be indexed.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Modules & Feeds Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Protection Modules:
          </h4>
          <ul className="space-y-2 text-xs text-slate-300 font-mono">
            {(status?.activeProtectionModules || [
              'Domain Typosquatting Analyzer',
              'Homograph Punycode Detector',
              'Subdomain Depth Scanner',
              'High-Risk TLD Classifier',
              'Brand Spoofing Correlation'
            ]).map((mod, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>{mod}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Feed Aggregators & Signals:
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {(status?.feedSources || [
              'ScamShield Global Intel Network',
              'PhishTank Verified Phishes API',
              'URLhaus Abuse.ch Tracker',
              'OpenPhish Automated Feed',
              'Web3 Anti-Drainer Intelligence'
            ]).map((src, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>{src}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
