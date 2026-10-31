import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Circle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Lock,
  Smartphone,
  PhoneCall,
  Key
} from 'lucide-react';

interface CheckItem {
  id: string;
  category: string;
  title: string;
  desc: string;
  impactScore: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'critical';
}

export const SecurityCheckupView: React.FC = () => {
  const [items, setItems] = useState<CheckItem[]>([
    {
      id: 'c1',
      category: 'Emergency Readiness',
      title: 'Save Official 1930 Helpline to Phone Contacts',
      desc: 'Save "National Cybercrime Helpline - 1930" on your mobile so you can dial it instantly within the 2-hour golden period if funds are transferred.',
      impactScore: 20,
      completed: true,
      priority: 'critical'
    },
    {
      id: 'c2',
      category: 'Authentication',
      title: 'Hardware / App-based 2FA on Primary Email',
      desc: 'Avoid SMS-only 2FA which is vulnerable to SIM swap attacks; use Google Authenticator, YubiKey, or built-in passkeys.',
      impactScore: 20,
      completed: true,
      priority: 'critical'
    },
    {
      id: 'c3',
      category: 'Mobile Security',
      title: 'Audit Accessibility & SMS Permissions',
      desc: 'Ensure no untrusted utility, battery saver, or cleaner apps have Android Accessibility or Notification Listener permissions.',
      impactScore: 15,
      completed: false,
      priority: 'high'
    },
    {
      id: 'c4',
      category: 'Financial Defense',
      title: 'Configure Daily UPI & Netbanking Limits',
      desc: 'Limit single-day UPI transfers on PhonePe/GPay/Paytm to prevent catastrophic loss if coerced by digital arrest imposters.',
      impactScore: 15,
      completed: true,
      priority: 'high'
    },
    {
      id: 'c5',
      category: 'Telecom Security',
      title: 'SIM Card PIN & Carrier Porting Lock',
      desc: 'Set a 4-digit SIM PIN to prevent criminals from moving your phone number into another handset to intercept SMS OTPs.',
      impactScore: 15,
      completed: false,
      priority: 'medium'
    },
    {
      id: 'c6',
      category: 'Family Protocol',
      title: 'Establish a Family Safe Word for Emergency Calls',
      desc: 'Agree on a secret verbal code with parents and children to immediately defeat AI voice cloning kidnapper scams.',
      impactScore: 15,
      completed: false,
      priority: 'high'
    }
  ]);

  const toggleItem = (id: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const totalScore = items.reduce((acc, curr) => acc + (curr.completed ? curr.impactScore : 0), 0);
  const maxScore = items.reduce((acc, curr) => acc + curr.impactScore, 0);
  const scorePercent = Math.round((totalScore / maxScore) * 100);

  const getScoreBadge = () => {
    if (scorePercent >= 80) return { label: 'Strong Security Posture', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' };
    if (scorePercent >= 50) return { label: 'Moderate Vulnerability Exposure', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40' };
    return { label: 'High Fraud Risk Exposure', color: 'text-rose-400 bg-rose-950/60 border-rose-500/40' };
  };

  const badge = getScoreBadge();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hardening Audit & Checklist</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Personal <span className="text-cyan-400">Security Checkup</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Cybercriminals exploit common misconfigurations like unlimited daily UPI ceilings, missing SIM PINs, and single-factor email passwords. Complete these steps to harden your perimeter.
            </p>
          </div>

          {/* Live Score Dial */}
          <div className="p-5 rounded-2xl bg-[#070B14]/80 border border-slate-800 text-center shrink-0 w-full md:w-56 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Hardening Score
            </span>
            <div className="flex items-baseline justify-center gap-1 font-mono">
              <span className="text-4xl font-extrabold text-white">{scorePercent}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold border ${badge.color}`}>
              {badge.label}
            </div>
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Interactive Hardening Tasks ({items.filter(i => i.completed).length}/{items.length} Completed)
          </h2>
          <span className="text-[11px] text-cyan-400 font-mono">Click to toggle status</span>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
              item.completed
                ? 'bg-[#0B132B]/40 border-slate-800/60 opacity-80'
                : 'bg-[#0B132B]/90 border-slate-700/80 hover:border-cyan-500/40 shadow-lg'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 hover:text-cyan-400" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                  {item.category}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase ${
                  item.priority === 'critical'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  +{item.impactScore} pts
                </span>
              </div>
              <h3 className={`text-sm font-bold ${item.completed ? 'text-slate-300 line-through' : 'text-white'}`}>
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
