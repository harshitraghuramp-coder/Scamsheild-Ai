import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { RiskGauge } from './RiskGauge';
import { AppAuthenticityReport } from './AppAuthenticityReport';
import {
  AlertOctagon,
  Brain,
  Cpu,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  ShieldAlert,
  Info,
  ExternalLink,
  Phone,
  Mail,
  CreditCard,
  Link as LinkIcon,
  FileText,
  Zap
} from 'lucide-react';

interface AnalysisReportCardProps {
  result: AnalysisResult;
  onReset?: () => void;
  showReset?: boolean;
}

export const AnalysisReportCard: React.FC<AnalysisReportCardProps> = ({ result, onReset, showReset = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    const textToCopy = `[SCAMSHIELD AI AUDIT REPORT]
Scan ID: ${result.id}
Scam Category: ${result.scamType}
Risk Score: ${result.riskScore}/100 (${result.riskLevel})
Confidence: ${result.confidence}

Forensic Summary:
${result.summary}

Top Red Flags:
${result.redFlags.map((rf, i) => `${i + 1}. [${rf.severity.toUpperCase()}] ${rf.title}: ${rf.description}`).join('\n')}

Recommended Safety Actions:
${result.recommendedActions.map((ra) => `${ra.step}. [${ra.priority.toUpperCase()}] ${ra.action}`).join('\n')}

Disclaimer:
${result.disclaimer}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-300';
      case 'high':
        return 'bg-orange-500/15 border-orange-500/30 text-orange-300';
      case 'medium':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
      default:
        return 'bg-slate-700/50 border-slate-600 text-slate-300';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'immediate':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'recommended':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  if (result.targetType === 'app') {
    const appResult = (result.appDetails || result) as any;
    if (appResult && appResult.appMetadata) {
      return (
        <AppAuthenticityReport
          result={appResult}
          onReset={onReset}
          showReset={showReset}
        />
      );
    }
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B132B]/90 border border-cyan-500/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-300">
              {result.id}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            {result.timing && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300"
                title={`Prep: ${result.timing.t_preprocess_ms}ms | AI: ${result.timing.t_ai_ms}ms | Parse: ${result.timing.t_parse_ms}ms | Total: ${result.timing.t_total_ms}ms`}
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                {result.timing.cache_status === 'HIT' ? (
                  <span className="text-emerald-400 font-semibold">Cached ({result.timing.t_total_ms}ms)</span>
                ) : (
                  <span>{result.timing.t_total_ms}ms</span>
                )}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <span>{result.scamType}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition cursor-pointer"
            title="Copy full forensic report to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            <span>{copied ? 'Copied' : 'Copy Report'}</span>
          </button>

          {showReset && onReset && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 transition cursor-pointer"
            >
              New Scan
            </button>
          )}
        </div>
      </div>

      {/* Target Preview if available */}
      {(result.originalInputPreview || result.callerIdOrNumber) && (
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2.5">
          {result.targetType === 'phone_call' ? (
            <Phone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          ) : (
            <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 overflow-hidden text-ellipsis">
            {result.callerIdOrNumber && (
              <span className="inline-flex items-center gap-1.5 mr-3 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-800/70 text-cyan-300 font-bold text-[11px]">
                <Phone className="w-3 h-3 text-cyan-400" />
                <span>Caller: {result.callerIdOrNumber}</span>
              </span>
            )}
            {result.originalInputPreview && (
              <span>
                <span className="text-slate-500 mr-2 uppercase text-[10px] tracking-wider font-sans font-bold">
                  {result.targetType === 'phone_call' ? 'Call Dialogue:' : 'Input Sample:'}
                </span>
                <span className="text-slate-200">{result.originalInputPreview}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Threat Gauge */}
      <RiskGauge
        score={result.riskScore}
        level={result.riskLevel}
        confidence={result.confidence}
        mode={result.sourceAnalysisMode}
      />

      {/* Emergency Distress & Helpline Assistance for High/Critical Risk */}
      {(result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-[#130E20] to-[#0A1024] border border-rose-500/40 shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-300">
              <Phone className="w-4 h-4 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300 font-mono">
                  Immediate Emergency Assistance
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/25 text-rose-200 border border-rose-500/40">
                  Dial 1930
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                If someone is threatening your arrest, demanding extortion money, or you transferred funds, <strong>stay calm and do not send money</strong>. Official police never arrest via video call.
              </p>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-2.5">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 1930 Helpline</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>cybercrime.gov.in</span>
            </a>
          </div>
        </div>
      )}

      {/* Forensic Summary */}
      <div className="p-5 rounded-2xl bg-[#0B132B]/60 border border-slate-800 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Forensic Analysis Summary
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed">
          {result.summary}
        </p>
      </div>

      {/* Red Flags Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4" />
          Identified Forensic Red Flags ({result.redFlags.length})
        </h3>

        {result.redFlags.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 italic">
            No specific high-severity red flags triggered by automated rules. Continue to exercise normal digital vigilance.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {result.redFlags.map((flag, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    {flag.title}
                  </h4>
                  <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${getSeverityBadgeClass(flag.severity)}`}>
                    {flag.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {flag.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Psychological Manipulation Tactics */}
      {result.psychologicalTactics.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0B132B]/60 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Psychological Manipulation Vectors
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Social engineering relies on cognitive vulnerabilities rather than software bugs. The following manipulation vectors were detected:
          </p>
          <div className="flex flex-wrap gap-2">
            {result.psychologicalTactics.map((tactic, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-950/60 border border-indigo-700/50 text-indigo-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                {tactic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Technical Indicators & Forensics */}
      {result.technicalIndicators && result.technicalIndicators.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0B132B]/60 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Technical Indicators & Rule Matches
          </h3>
          <div className="space-y-2">
            {result.technicalIndicators.map((ind, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
                <div className="space-y-0.5">
                  <div className="font-mono text-cyan-300 font-semibold">{ind.indicator}</div>
                  <div className="text-slate-400 text-[11px]">{ind.explanation}</div>
                </div>
                <div className="shrink-0 flex items-center gap-2 mt-1 sm:mt-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {ind.type}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-400">
                    +{ind.riskWeight} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Entities */}
      {result.extractedEntities && (
        result.extractedEntities.urls.length > 0 ||
        result.extractedEntities.emails.length > 0 ||
        result.extractedEntities.phones.length > 0 ||
        result.extractedEntities.paymentMethods.length > 0
      ) && (
        <div className="p-5 rounded-2xl bg-[#0B132B]/60 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            Extracted Communication & Payment Artifacts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {result.extractedEntities.urls.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Target URLs ({result.extractedEntities.urls.length})</span>
                </div>
                <ul className="space-y-1 font-mono text-[11px] text-slate-300 break-all">
                  {result.extractedEntities.urls.map((u, i) => (
                    <li key={i} className="hover:text-cyan-300">{u}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.extractedEntities.paymentMethods.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payment Channels Mentioned</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.extractedEntities.paymentMethods.map((pm, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
                      {pm}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.extractedEntities.emails.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Addresses</span>
                </div>
                <ul className="space-y-1 font-mono text-[11px] text-slate-300">
                  {result.extractedEntities.emails.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.extractedEntities.phones.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Numbers</span>
                </div>
                <ul className="space-y-1 font-mono text-[11px] text-slate-300">
                  {result.extractedEntities.phones.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommended Safety Actions */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B132B] to-[#0A1024] border border-cyan-500/30 cyber-glow-cyan">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          Recommended Safety Playbook
        </h3>
        <div className="space-y-2.5">
          {result.recommendedActions.map((action) => (
            <div
              key={action.step}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {action.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-200">
                    {action.action}
                  </span>
                  <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${getPriorityBadgeClass(action.priority)}`}>
                    {action.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strict Mandatory Disclaimer Box */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-200 mr-1">Safety Notice & Disclaimer:</span>
          {result.disclaimer}
        </div>
      </div>
    </div>
  );
};
