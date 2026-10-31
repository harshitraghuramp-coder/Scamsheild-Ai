import React, { useState } from 'react';
import { ExplainableEvidenceReport, ExplainableEvidenceItem, UncertaintyNote, RiskLevel } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  FileSearch,
  Cpu,
  Brain,
  Database,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Eye,
  Lock
} from 'lucide-react';

interface ExplainableEvidenceReportViewProps {
  report?: ExplainableEvidenceReport;
  targetType?: string;
}

export const ExplainableEvidenceReportView: React.FC<ExplainableEvidenceReportViewProps> = ({
  report,
  targetType = 'message'
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'facts' | 'inferences' | 'intel' | 'uncertainties'>('all');
  const [expandedGap, setExpandedGap] = useState<number | null>(null);

  if (!report) {
    return null;
  }

  const allItems: ExplainableEvidenceItem[] = [
    ...report.observableFacts,
    ...report.modelInferences,
    ...report.threatIntelMatches
  ];

  const filteredItems = allItems.filter(item => {
    if (activeFilter === 'facts') return item.category === 'OBSERVABLE_FACT';
    if (activeFilter === 'inferences') return item.category === 'MODEL_INFERENCE';
    if (activeFilter === 'intel') return item.category === 'INTELLIGENCE_MATCH';
    return true;
  });

  const getRiskBorder = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'border-rose-500/50 bg-rose-950/20';
      case 'HIGH':
        return 'border-orange-500/50 bg-orange-950/20';
      case 'MEDIUM':
        return 'border-amber-500/50 bg-amber-950/20';
      default:
        return 'border-emerald-500/50 bg-emerald-950/20';
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'OBSERVABLE_FACT':
        return {
          label: 'Observable Fact',
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: Cpu
        };
      case 'MODEL_INFERENCE':
        return {
          label: 'Model Inference',
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          icon: Brain
        };
      case 'INTELLIGENCE_MATCH':
        return {
          label: 'Threat Feed Hit',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: Database
        };
      default:
        return {
          label: 'Indicator',
          color: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: Info
        };
    }
  };

  return (
    <div className="space-y-5 rounded-3xl border border-cyan-500/30 bg-[#0A1024]/90 p-5 sm:p-6 backdrop-blur-md shadow-xl">
      {/* Header with Title and Technical Differentiator Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              <FileSearch className="w-3 h-3 text-cyan-400" />
              <span>Evidence-First Architecture</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              ScamShield Explainability Protocol
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Explainable Scam Evidence Report</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Distinguishes verifiable empirical facts from probabilistic model inferences, explains calibrated classification rationale, and documents technical uncertainties.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-extrabold uppercase border ${getRiskBadge(report.overallRiskClassification)}`}>
            {report.overallRiskClassification} THREAT
          </span>
        </div>
      </div>

      {/* 1. Calibration Rationale Card */}
      <div className={`p-4 rounded-2xl border ${getRiskBorder(report.overallRiskClassification)} space-y-2`}>
        <div className="flex items-center justify-between text-xs font-mono uppercase font-bold text-slate-300">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Classification Calibration Rationale</span>
          </span>
          <span className="text-[10px] text-slate-400 lowercase font-sans">
            Score: calibrated across rule matrix
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-sans">
          {report.calibrationRationale}
        </p>
      </div>

      {/* 2. Tri-Tier Evidence Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-850 pb-3">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>All Evidence ({allItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('facts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeFilter === 'facts'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Observable Facts ({report.observableFacts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('inferences')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeFilter === 'inferences'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-indigo-400" />
          <span>Model Inferences ({report.modelInferences.length})</span>
        </button>

        {report.threatIntelMatches.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveFilter('intel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeFilter === 'intel'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-rose-400" />
            <span>Threat Feed Hits ({report.threatIntelMatches.length})</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveFilter('uncertainties')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeFilter === 'uncertainties'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Technical Uncertainties ({report.uncertaintiesAndGaps.length})</span>
        </button>
      </div>

      {/* 3. Evidence Matrix Cards */}
      {activeFilter !== 'uncertainties' ? (
        <div className="space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 italic">
              No evidence items matching the selected tier filter.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const meta = getCategoryBadge(item.category);
              const IconComp = meta.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${meta.color}`}>
                        <IconComp className="w-3 h-3" />
                        <span>{meta.label}</span>
                      </span>
                      <span className="text-xs font-bold text-slate-100 font-mono">
                        {item.indicator}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Rule: {item.sourceOrRule}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.finding}
                  </p>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 pt-0.5">
                    <span className="text-slate-500">Methodology:</span>
                    <span className="text-cyan-400">{item.confidenceReasoning}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* 4. Technical Uncertainties & Missing Information Guide */
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
            <span className="font-bold text-amber-300 mr-1">Honest Assessment Notice:</span>
            No automated security scanner can establish 100% certainty from isolated text or URLs alone. The following limitations apply to this scan:
          </div>

          <div className="space-y-2">
            {report.uncertaintiesAndGaps.map((gap, gIdx) => {
              const isExpanded = expandedGap === gIdx;
              return (
                <div
                  key={gIdx}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedGap(isExpanded ? null : gIdx)}
                    className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-200 hover:bg-slate-900 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{gap.aspect}</span>
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3.5 pt-0 border-t border-slate-800/60 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                          Technical Limitation:
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {gap.explanation}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#070B14] border border-cyan-500/30">
                        <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold mb-0.5">
                          How to Verify Independently:
                        </span>
                        <p className="text-slate-200 leading-relaxed">
                          {gap.howToVerifyIndependently}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. External Intelligence & Regulatory References */}
      {report.externalReferences.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
            <ExternalLink className="w-3 h-3 text-cyan-400" />
            <span>Authoritative Reference Frameworks</span>
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {report.externalReferences.map((ref, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300"
              >
                {ref}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
