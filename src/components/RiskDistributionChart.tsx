import React from 'react';
import { ScanHistoryItem } from '../types';
import { ShieldCheck, AlertTriangle, ShieldAlert, Flame, BarChart2, Activity } from 'lucide-react';

interface RiskDistributionChartProps {
  history: ScanHistoryItem[];
  compact?: boolean;
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ history, compact = false }) => {
  const total = history.length;

  const lowCount = history.filter((item) => item.riskLevel === 'LOW').length;
  const mediumCount = history.filter((item) => item.riskLevel === 'MEDIUM').length;
  const highCount = history.filter((item) => item.riskLevel === 'HIGH').length;
  const criticalCount = history.filter((item) => item.riskLevel === 'CRITICAL').length;

  const lowPct = total > 0 ? Math.round((lowCount / total) * 100) : 0;
  const mediumPct = total > 0 ? Math.round((mediumCount / total) * 100) : 0;
  const highPct = total > 0 ? Math.round((highCount / total) * 100) : 0;
  const criticalPct = total > 0 ? Math.round((criticalCount / total) * 100) : 0;

  const avgScore =
    total > 0 ? Math.round(history.reduce((sum, item) => sum + item.riskScore, 0) / total) : 0;

  const dangerousCount = highCount + criticalCount;
  const threatRate = total > 0 ? Math.round((dangerousCount / total) * 100) : 0;

  if (compact) {
    return (
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 font-bold text-slate-300">
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Risk Distribution ({total} Scans)</span>
          </span>
          <span className="text-cyan-400">Avg Threat: {avgScore}/100</span>
        </div>

        {/* CSS Segmented Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
          {total === 0 ? (
            <div className="w-full h-full bg-slate-700/50 flex items-center justify-center text-[9px] text-slate-400">
              No scans recorded
            </div>
          ) : (
            <>
              {lowPct > 0 && (
                <div
                  style={{ width: `${lowPct}%` }}
                  className="bg-emerald-500 h-full transition-all duration-700 ease-out"
                  title={`Safe / Low Risk: ${lowCount} (${lowPct}%)`}
                />
              )}
              {mediumPct > 0 && (
                <div
                  style={{ width: `${mediumPct}%` }}
                  className="bg-amber-500 h-full transition-all duration-700 ease-out"
                  title={`Medium Risk: ${mediumCount} (${mediumPct}%)`}
                />
              )}
              {highPct > 0 && (
                <div
                  style={{ width: `${highPct}%` }}
                  className="bg-orange-500 h-full transition-all duration-700 ease-out"
                  title={`High Risk: ${highCount} (${highPct}%)`}
                />
              )}
              {criticalPct > 0 && (
                <div
                  style={{ width: `${criticalPct}%` }}
                  className="bg-rose-500 h-full transition-all duration-700 ease-out"
                  title={`Critical Threat: ${criticalCount} (${criticalPct}%)`}
                />
              )}
            </>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Safe: {lowCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Med: {mediumCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>High: {highCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Crit: {criticalCount}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 pt-5 border-t border-slate-800/80 space-y-4">
      {/* Title & Stats Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Audit Telemetry & Risk Distribution
            </h3>
            <p className="text-[11px] text-slate-400">
              Distribution of verified threat ratings across your local scan history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Total Scans: <strong className="text-white ml-1">{total}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Avg Threat Score: <strong className="text-cyan-400 ml-1">{avgScore}/100</strong>
          </span>
        </div>
      </div>

      {/* Segmented CSS-Based Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3.5 rounded-xl bg-slate-950 p-0.5 border border-slate-800 flex overflow-hidden shadow-inner">
          {total === 0 ? (
            <div className="w-full h-full bg-slate-800/50 rounded-lg flex items-center justify-center text-[10px] text-slate-500 font-mono">
              Awaiting first scan — No risk distribution data yet
            </div>
          ) : (
            <>
              {lowPct > 0 && (
                <div
                  style={{ width: `${lowPct}%` }}
                  className="bg-emerald-500 h-full rounded-l-md transition-all duration-700 ease-out hover:opacity-90 relative group cursor-pointer"
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/40 whitespace-nowrap z-20">
                    Safe: {lowCount} ({lowPct}%)
                  </span>
                </div>
              )}

              {mediumPct > 0 && (
                <div
                  style={{ width: `${mediumPct}%` }}
                  className="bg-amber-500 h-full transition-all duration-700 ease-out hover:opacity-90 relative group cursor-pointer"
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/40 whitespace-nowrap z-20">
                    Medium: {mediumCount} ({mediumPct}%)
                  </span>
                </div>
              )}

              {highPct > 0 && (
                <div
                  style={{ width: `${highPct}%` }}
                  className="bg-orange-500 h-full transition-all duration-700 ease-out hover:opacity-90 relative group cursor-pointer"
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-orange-300 text-[10px] font-mono px-2 py-0.5 rounded border border-orange-500/40 whitespace-nowrap z-20">
                    High Risk: {highCount} ({highPct}%)
                  </span>
                </div>
              )}

              {criticalPct > 0 && (
                <div
                  style={{ width: `${criticalPct}%` }}
                  className="bg-rose-500 h-full rounded-r-md transition-all duration-700 ease-out hover:opacity-90 relative group cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-rose-300 text-[10px] font-mono px-2 py-0.5 rounded border border-rose-500/40 whitespace-nowrap z-20">
                    Critical: {criticalCount} ({criticalPct}%)
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 4 Interactive Risk Level Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Low / Safe */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe / Low</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {lowPct}%
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {lowCount} <span className="text-[10px] font-normal text-slate-500">scans</span>
          </div>
        </div>

        {/* Medium */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Medium Risk</span>
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {mediumPct}%
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {mediumCount} <span className="text-[10px] font-normal text-slate-500">scans</span>
          </div>
        </div>

        {/* High */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-orange-500/40 transition">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
              <span>High Risk</span>
            </span>
            <span className="text-xs font-mono font-bold text-orange-400">
              {highPct}%
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {highCount} <span className="text-[10px] font-normal text-slate-500">scans</span>
          </div>
        </div>

        {/* Critical */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Critical Fraud</span>
            </span>
            <span className="text-xs font-mono font-bold text-rose-400">
              {criticalPct}%
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {criticalCount} <span className="text-[10px] font-normal text-slate-500">scans</span>
          </div>
        </div>
      </div>
    </div>
  );
};
