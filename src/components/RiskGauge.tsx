import React from 'react';
import { RiskLevel } from '../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, Flame } from 'lucide-react';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  confidence?: 'Low' | 'Medium' | 'High';
  mode?: 'ai_enhanced' | 'heuristic_fallback';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level, confidence = 'High', mode = 'ai_enhanced' }) => {
  // SVG circular progress calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorScheme = {
    stroke: '#10B981', // emerald
    bgGlow: 'rgba(16, 185, 129, 0.15)',
    textColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    icon: ShieldCheck,
    label: 'LOW SUSPICION',
    sublabel: 'No prominent indicators flagged',
  };

  if (level === 'MEDIUM') {
    colorScheme = {
      stroke: '#F59E0B', // amber
      bgGlow: 'rgba(245, 158, 11, 0.2)',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      icon: AlertTriangle,
      label: 'MEDIUM RISK',
      sublabel: 'Suspicious traits detected',
    };
  } else if (level === 'HIGH') {
    colorScheme = {
      stroke: '#F97316', // orange
      bgGlow: 'rgba(249, 115, 22, 0.25)',
      textColor: 'text-orange-400',
      badgeBg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
      icon: ShieldAlert,
      label: 'HIGH RISK',
      sublabel: 'Likely scam / deceptive attack',
    };
  } else if (level === 'CRITICAL') {
    colorScheme = {
      stroke: '#EF4444', // crimson red
      bgGlow: 'rgba(239, 68, 68, 0.35)',
      textColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse',
      icon: Flame,
      label: 'CRITICAL THREAT',
      sublabel: 'Severe indicators of fraud',
    };
  }

  const IconComponent = colorScheme.icon;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800/80 backdrop-blur-md">
      {/* Circular Progress Gauge */}
      <div className="relative flex items-center justify-center">
        <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 130 130">
          {/* Background Track */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke="#1E293B"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated Gauge Arc */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke={colorScheme.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${colorScheme.stroke})`,
            }}
          />
        </svg>

        {/* Center Score & Icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold font-mono tracking-tight ${colorScheme.textColor}`}>
            {score}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Threat Score
          </span>
        </div>
      </div>

      {/* Details & Badges */}
      <div className="flex-1 text-center sm:text-left space-y-2.5">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colorScheme.badgeBg}`}>
            <IconComponent className="w-3.5 h-3.5" />
            {colorScheme.label}
          </span>

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
            Confidence: <strong className="ml-1 text-white">{confidence}</strong>
          </span>

          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/40 border border-cyan-800/40 text-cyan-300">
            {mode === 'ai_enhanced' ? 'Gemini 3.8 Flash + Heuristics' : 'Deterministic Heuristics Engine'}
          </span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          {colorScheme.sublabel}
        </p>

        <p className="text-xs text-slate-400">
          Composite score derived from forensic syntax parsing, linguistic manipulation vectors, domain authority, and threat intelligence telemetry.
        </p>
      </div>
    </div>
  );
};
