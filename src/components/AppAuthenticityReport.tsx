import React, { useState } from 'react';
import { AppAuthenticityResult } from '../types';
import { RiskGauge } from './RiskGauge';
import { ExplainableEvidenceReportView } from './ExplainableEvidenceReportView';
import {
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Calendar,
  Star,
  Lock,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Info,
  Globe,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Download,
  FileText,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

interface AppAuthenticityReportProps {
  result: AppAuthenticityResult;
  onReset?: () => void;
  showReset?: boolean;
}

export const AppAuthenticityReport: React.FC<AppAuthenticityReportProps> = ({
  result,
  onReset,
  showReset = true,
}) => {
  const [copied, setCopied] = useState(false);
  const { appMetadata, developerVerification, permissionRiskSummary, authenticityChecks } = result;

  const handleCopyReport = () => {
    const reportText = `[SCAMSHIELD AI - APP AUTHENTICITY INVESTIGATION REPORT]
Target: ${appMetadata.appName} (${appMetadata.packageNameOrId})
Store: ${appMetadata.store === 'apple_app_store' ? 'Apple App Store' : 'Google Play Store'}
Listing Status: ${appMetadata.storeListingStatus}

RISK EVALUATION:
Risk Level: ${result.riskLevel}
Risk Score: ${result.riskScore}/100
Authenticity Assessment: ${result.summary}

DEVELOPER & COMPANY:
Developer: ${appMetadata.developerName}
Parent Organization: ${appMetadata.parentCompany || 'Not publicly verified'}
Registered Country: ${appMetadata.developerCountry || 'Not publicly verified'}
Developer Identity Status: ${developerVerification.identityStatus}
Domain Match: ${developerVerification.domainMatch ? 'VERIFIED' : 'UNVERIFIED / MISMATCH'}

PERMISSIONS:
Sensitive Permissions Count: ${permissionRiskSummary.sensitiveCount}
Critical Findings:
${permissionRiskSummary.criticalFindings.join('\n')}

AUTHENTICITY CHECKS:
${authenticityChecks.map((c) => `[${c.status}] ${c.name}: ${c.details} (${c.evidence})`).join('\n')}

RECOMMENDED ACTIONS:
${result.recommendedActions.map((a) => `${a.step}. [${a.priority.toUpperCase()}] ${a.action}`).join('\n')}

DISCLAIMER:
${result.disclaimer}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-500',
          label: 'CRITICAL THREAT',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          dot: 'bg-orange-500',
          label: 'HIGH RISK',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-500',
          label: 'MODERATE RISK',
        };
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-500',
          label: 'LOW APPARENT RISK',
        };
    }
  };

  const getCheckStatusBadge = (status: string) => {
    switch (status) {
      case 'PASSED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>PASSED</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>FAILED</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>WARNING</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            <span>UNVERIFIED</span>
          </span>
        );
    }
  };

  const riskBadge = getRiskBadge(result.riskLevel);

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B132B]/90 border border-cyan-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-300">
                {result.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${riskBadge.dot} animate-pulse`} />
                <span>{riskBadge.label}</span>
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Target: <span className="font-semibold text-white">{appMetadata.appName}</span> ({appMetadata.packageNameOrId})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition cursor-pointer"
            title="Copy entire audit dossier to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy Report'}</span>
          </button>

          {showReset && onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New App Scan</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: APP OVERVIEW */}
      <div className="p-6 rounded-3xl bg-[#0B132B]/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">1</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">App Overview</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-900 border border-slate-700 text-slate-300">
            {appMetadata.store === 'apple_app_store' ? ' Apple App Store' : '▶ Google Play Store'}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* App Icon */}
          <div className="shrink-0">
            {appMetadata.appIconUrl ? (
              <img
                src={appMetadata.appIconUrl}
                alt={appMetadata.appName}
                className="w-20 h-20 rounded-2xl border border-slate-700 object-cover shadow-lg bg-slate-900"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl border border-slate-700 bg-slate-900/80 flex items-center justify-center text-slate-500">
                <Smartphone className="w-8 h-8 text-slate-600" />
              </div>
            )}
          </div>

          {/* Core App Information Grid */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-white">{appMetadata.appName}</h3>
                {appMetadata.storeListingStatus === 'STORE_VERIFIED_LISTING' ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Active Store Listing</span>
                  </span>
                ) : appMetadata.storeListingStatus === 'UNLISTED_OR_REMOVED' ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3 text-rose-400" />
                    <span>Unlisted / Store Record Not Found</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    Unverified Source
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-cyan-400 mt-0.5 select-all">
                {appMetadata.packageNameOrId}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Category</span>
                <span className="font-semibold text-slate-200 truncate block">{appMetadata.category}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Version</span>
                <span className="font-semibold text-slate-200 truncate block">{appMetadata.currentVersion}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">App Size</span>
                <span className="font-semibold text-slate-200 truncate block">{appMetadata.appSize || 'Unavailable'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Traction</span>
                <span className="font-semibold text-slate-200 truncate block">{appMetadata.downloadRange || 'Store private'}</span>
              </div>
            </div>

            {appMetadata.appDescription && (
              <p className="text-xs text-slate-400 line-clamp-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                {appMetadata.appDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: DEVELOPER DETAILS & RELEASE HISTORY (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 2: DEVELOPER & COMPANY DETAILS */}
        <div className="p-6 rounded-3xl bg-[#0B132B]/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">2</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Developer & Company Details</h2>
            </div>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Publisher / Developer Name</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{appMetadata.developerName}</span>
                {developerVerification.identityStatus === 'VERIFIED_OFFICIAL' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Official Brand Owner
                  </span>
                ) : developerVerification.identityStatus === 'SUSPICIOUS_IDENTITY' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                    Suspected Lookalike
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                    Standard Publisher
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Parent Organization</span>
                <span className="font-semibold text-slate-300 block">
                  {appMetadata.parentCompany || 'Not publicly verified'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Registered Location / Country</span>
                <span className="font-semibold text-slate-300 block">
                  {appMetadata.developerCountry || 'Not publicly verified'}
                </span>
              </div>
            </div>

            {/* Developer Contact & Links */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div className="flex items-center gap-2 text-slate-400">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Developer Website:</span>
                </div>
                {appMetadata.developerWebsite ? (
                  <a
                    href={appMetadata.developerWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono truncate max-w-[180px]"
                  >
                    <span className="truncate">{appMetadata.developerWebsite.replace(/^https?:\/\//i, '')}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-500 italic">Information unavailable</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Contact Email:</span>
                </div>
                {appMetadata.developerEmail ? (
                  <span className="text-slate-200 font-mono truncate max-w-[180px]">
                    {appMetadata.developerEmail}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Not publicly disclosed</span>
                )}
              </div>

              {appMetadata.developerAddress && appMetadata.developerAddress !== 'Information unavailable' && (
                <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>Registered Business Address:</span>
                  </div>
                  <span className="text-slate-300">{appMetadata.developerAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: RELEASE AND UPDATE HISTORY */}
        <div className="p-6 rounded-3xl bg-[#0B132B]/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">3</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Release & Update History</h2>
            </div>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Original Release Date</span>
              <div className="flex items-center gap-2 text-slate-200">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold">
                  {appMetadata.originalReleaseDate || 'Not publicly verified'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Store publication date (not to be confused with developer corporate incorporation date).
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Last Updated Date</span>
              <div className="flex items-center gap-2 text-slate-200">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold">
                  {appMetadata.lastUpdatedDate || 'Information unavailable'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Current Version Release Date</span>
              <span className="font-semibold text-slate-300 block">
                {appMetadata.currentVersionReleaseDate || 'Varies by device / store roll-out'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Frequent updates from verified developers demonstrate active security maintenance; brand new listings with unverified owners require heightened vigilance.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4 & 5: RATINGS & PERMISSIONS (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 4: RATINGS AND REVIEWS */}
        <div className="p-6 rounded-3xl bg-[#0B132B]/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">4</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Ratings, Reviews & Traction</h2>
            </div>
            <Star className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-center shrink-0 pr-4 border-r border-slate-800">
                <div className="text-3xl font-extrabold text-amber-300">
                  {appMetadata.averageRating !== undefined ? appMetadata.averageRating.toFixed(1) : '--'}
                </div>
                <div className="flex items-center gap-0.5 text-amber-400 justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        (appMetadata.averageRating || 0) >= i ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">out of 5 stars</span>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-white">
                  {appMetadata.reviewCount !== undefined ? `${appMetadata.reviewCount.toLocaleString()} Reviews` : 'Reviews unlisted'}
                </div>
                <div className="text-slate-400 text-xs">
                  Download scale: <span className="text-cyan-300 font-semibold">{appMetadata.downloadRange || 'Store private'}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Verified store community ratings and aggregate feedback.
                </div>
              </div>
            </div>

            {/* Recurring Negative or Suspicious Patterns */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Review Sentiment Patterns</span>
              {appMetadata.userReviewPatterns && appMetadata.userReviewPatterns.length > 0 ? (
                appMetadata.userReviewPatterns.map((pat, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      pat.sentiment === 'concerning'
                        ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                        : pat.sentiment === 'suspicious'
                        ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    {pat.sentiment === 'concerning' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold block">{pat.topic}</span>
                      <span className="text-[11px] leading-relaxed block mt-0.5">{pat.detail}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 italic">
                  No automated complaint anomalies flagged in public reviews.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: PERMISSIONS AND PRIVACY */}
        <div className="p-6 rounded-3xl bg-[#0B132B]/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">5</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Permissions & Privacy</h2>
            </div>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-3 text-xs">
            {/* Permission Summary Stat */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">Declared Runtime Permissions:</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono text-xs bg-slate-800 text-slate-300">
                  {permissionRiskSummary.totalRequested} total
                </span>
                {permissionRiskSummary.sensitiveCount > 0 ? (
                  <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {permissionRiskSummary.sensitiveCount} Sensitive
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded font-mono text-xs bg-emerald-500/20 text-emerald-300">
                    Safe Baseline
                  </span>
                )}
              </div>
            </div>

            {/* Sensitive Permissions breakdown */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Sensitive or Excessive Scopes</span>
              {appMetadata.sensitivePermissions.length > 0 ? (
                appMetadata.sensitivePermissions.map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                      s.riskLevel === 'critical'
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                        : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono font-bold text-[11px] block">
                        {s.permission.replace('android.permission.', '')}
                      </span>
                      <span className="text-[11px] leading-relaxed block mt-0.5 opacity-90">
                        {s.rationale}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No high-risk trojan permissions (Accessibility hijacking, SMS interception) declared.</span>
                </div>
              )}
            </div>

            {/* Privacy Policy Link */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Privacy Policy:</span>
              {appMetadata.privacyPolicyUrl ? (
                <a
                  href={appMetadata.privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-xs truncate max-w-[180px]"
                >
                  <span className="truncate">View Policy</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>No Policy Declared</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: AUTHENTICITY CHECKS MATRIX */}
      <div className="p-6 rounded-3xl bg-[#0B132B]/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">6</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Authenticity Checks Matrix</h2>
          </div>
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {authenticityChecks.map((check) => (
            <div
              key={check.id}
              className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-200">{check.name}</span>
                {getCheckStatusBadge(check.status)}
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {check.details}
              </p>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 font-mono text-[10px] text-slate-400">
                <span className="text-slate-500">Evidence: </span>
                <span>{check.evidence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 7: RISK ASSESSMENT */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] border border-cyan-500/30 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">7</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Risk Assessment & AI Forensics</h2>
          </div>
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Gauge Widget */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#070B14]/80 border border-slate-800">
            <RiskGauge
              score={result.riskScore}
              level={result.riskLevel}
              confidence={result.confidence}
              mode={result.sourceAnalysisMode}
            />
            <div className="text-center mt-3">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Threat Category</span>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">{result.scamType}</div>
            </div>
          </div>

          {/* AI Forensic Summary */}
          <div className="lg:col-span-2 space-y-3">
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Forensic Investigation Summary</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-700/60 ml-auto">
                  Mode: {result.sourceAnalysisMode === 'ai_enhanced' ? 'Gemini 3.8 Flash' : 'Deterministic Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Top Red Flags */}
            {result.redFlags.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Identified Warning Signs ({result.redFlags.length})</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {result.redFlags.map((rf, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        rf.severity === 'critical'
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                          : rf.severity === 'high'
                          ? 'bg-orange-950/40 border-orange-500/40 text-orange-200'
                          : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{rf.title}</span>
                        </span>
                        <span className="uppercase text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40">
                          {rf.severity}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90 pl-5">
                        {rf.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Differentiator: Explainable Scam Evidence Report */}
      {result.explainableReport && (
        <ExplainableEvidenceReportView
          report={result.explainableReport}
          targetType="app"
        />
      )}

      {/* SECTION 8: SAFETY RECOMMENDATIONS */}
      <div className="p-6 rounded-3xl bg-[#0B132B]/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">8</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Recommended Safety Actions</h2>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="space-y-2 text-xs">
          {result.recommendedActions.map((action) => (
            <div
              key={action.step}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
                {action.step}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                    action.priority === 'immediate'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : action.priority === 'recommended'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {action.priority}
                  </span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed font-medium">
                  {action.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 9: SOURCES AND VERIFICATION DETAILS */}
      <div className="p-6 rounded-3xl bg-[#070B14] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">9</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Sources & Verification Transparency</h2>
          </div>
          <FileText className="w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Verified Store Data */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Store-Provided Facts</span>
            </span>
            <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
              {result.verifiableFacts.length > 0 ? (
                result.verifiableFacts.map((fact, i) => <li key={i}>{fact}</li>)
              ) : (
                <li className="text-slate-500 italic">No external facts independently corroborated.</li>
              )}
              {result.storeProvidedDetails.slice(0, 4).map((det, i) => (
                <li key={`store-${i}`} className="text-slate-400">{det}</li>
              ))}
            </ul>
          </div>

          {/* Unverified / Unavailable Details */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Unverified / Information Unavailable</span>
            </span>
            <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
              {result.unverifiedInformation.length > 0 ? (
                result.unverifiedInformation.map((unv, i) => <li key={i}>{unv}</li>)
              ) : (
                <li className="text-slate-500 italic">All key corporate metadata fields matched official records.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Global Legal & Technical Disclaimer */}
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-bold">Forensic Integrity Disclaimer: </span>
          {result.disclaimer}
        </div>
      </div>
    </div>
  );
};
