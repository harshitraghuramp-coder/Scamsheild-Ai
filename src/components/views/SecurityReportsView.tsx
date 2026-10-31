import React, { useState } from 'react';
import {
  FileText,
  Download,
  AlertTriangle,
  Shield,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Printer
} from 'lucide-react';

interface Briefing {
  id: string;
  code: string;
  title: string;
  date: string;
  severity: 'CRITICAL' | 'HIGH' | 'ADVISORY';
  author: string;
  summary: string;
  keyTactics: string[];
  remediation: string;
}

const BRIEFINGS: Briefing[] = [
  {
    id: 'b-1',
    code: 'SS-ADV-2025-01',
    title: 'Anatomy of Digital Arrest Scams: Psychological Coercion & Fake Judicial Seals',
    date: 'Q1 2025 / Active Threat',
    severity: 'CRITICAL',
    author: 'ScamShield Threat Research Lab',
    summary: 'Digital Arrest is a sophisticated extortion vector where criminal syndicates impersonate law enforcement, customs (CBI, ED, Mumbai Police), and judges via Skype or WhatsApp video calls. Victims are forced to remain on video surveillance under threat of immediate arrest.',
    keyTactics: [
      'Fake Supreme Court and CBI letterheads stamped with forged seals',
      'Actors in replica police uniforms seated in front of institutional backdrops',
      'Demand for funds to be transferred to "RBI Secret Supervisory Vaults" for currency verification',
      'Absolute prohibition against hanging up, speaking to family, or seeking local police guidance'
    ],
    remediation: 'No law enforcement or judicial body in India or internationally conducts arrests or trials over video calls. Hang up immediately, notify 1930, and file a formal report on cybercrime.gov.in.'
  },
  {
    id: 'b-2',
    code: 'SS-ADV-2025-02',
    title: 'Generative Voice Cloning & Vishing: High-Pressure Distress Scenarios',
    date: 'Q1 2025 / Emerging Threat',
    severity: 'HIGH',
    author: 'ScamShield Audio Intelligence Unit',
    summary: 'Scammers harvest 3-5 seconds of vocal audio from public Instagram reels, YouTube shorts, or voice messages to synthesize an authentic facsimile of a family member crying or begging for ransom after an alleged accident or arrest.',
    keyTactics: [
      'Caller panics the recipient within the first 5 seconds to bypass critical analytical reasoning',
      'Demands immediate cash handoff or instant UPI transfers before the hospital or police take action',
      'Refuses to allow direct call-backs to the alleged victim'
    ],
    remediation: 'Enforce a pre-arranged Family Safe Word. Disconnect the call and dial the loved one directly on their known personal number or verify through mutual friends.'
  },
  {
    id: 'b-3',
    code: 'SS-ADV-2025-03',
    title: 'Malicious Utility APKs & Android Accessibility API Abuse',
    date: 'Monthly Surveillance',
    severity: 'CRITICAL',
    author: 'ScamShield Mobile Malware Team',
    summary: 'Deceptive APKs masquerading as "Electricity Bill Pay" or "Bank KYC Update" lure victims into enabling Android Accessibility Service. Once granted, malware reads SMS OTPs, intercepts screen interactions, and executes background financial transfers.',
    keyTactics: [
      'Distribution via WhatsApp APK attachments or deceptive SMS links',
      'Persistent system prompts instructing user to enable Accessibility settings',
      'Silent background intercept of two-factor authentication codes and banking credentials'
    ],
    remediation: 'Never sideload APKs from WhatsApp or web links. Only install verified apps from Google Play Store or Apple App Store. Periodically audit Accessibility permissions under Settings > Accessibility.'
  }
];

export const SecurityReportsView: React.FC = () => {
  const [selectedBriefing, setSelectedBriefing] = useState<Briefing>(BRIEFINGS[0]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cybersecurity Threat Advisories</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Official <span className="text-cyan-400">Security Reports</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Curated intelligence briefings dissecting active fraud syndicates, engineering techniques, and tactical defense measures for security practitioners and citizens.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Export Briefing PDF</span>
          </button>
        </div>
      </div>

      {/* Grid of Briefings & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Briefing List */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            Intelligence Briefings
          </h2>
          {BRIEFINGS.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBriefing(b)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedBriefing.id === b.id
                  ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg text-white'
                  : 'bg-[#0B132B]/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-cyan-400">
                  {b.code}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  b.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {b.severity}
                </span>
              </div>
              <h3 className="text-xs font-bold leading-snug line-clamp-2">
                {b.title}
              </h3>
              <p className="text-[10px] text-slate-500 mt-2 font-mono">
                {b.date} • {b.author}
              </p>
            </div>
          ))}
        </div>

        {/* Right Column: In-depth Detail Card */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-6">
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400">{selectedBriefing.code}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">{selectedBriefing.date}</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              {selectedBriefing.title}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Published by {selectedBriefing.author}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
              Executive Summary
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedBriefing.summary}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-rose-300 font-bold">
              Syndicate Modus Operandi & Indicators
            </h3>
            <ul className="space-y-2">
              {selectedBriefing.keyTactics.map((tactic, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{tactic}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Official Defense Guidance</span>
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              {selectedBriefing.remediation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
