import React from 'react';
import {
  HelpCircle,
  PhoneCall,
  ExternalLink,
  ShieldAlert,
  LifeBuoy,
  CheckCircle,
  FileText,
  Mail,
  Building
} from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
            <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Support & Official Remediation Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Help & <span className="text-cyan-400">Cyber Support</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Direct access to official law enforcement channels, cyber emergency helplines, and comprehensive incident response resources.
          </p>
        </div>
      </div>

      {/* Emergency Immediate Action Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/60 via-[#0B152B] to-slate-900 border border-rose-500/40 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-rose-300 font-bold text-xs uppercase font-mono">
          <PhoneCall className="w-4 h-4 animate-pulse" />
          <span>Immediate Cyber Incident Helplines</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          If money was unauthorizedly deducted or transferred under coercion, call the national cybercrime helpline immediately. The first 2 hours are the &quot;Golden Period&quot; for freezing bank accounts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="tel:1930"
            className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition flex items-center justify-between shadow-lg shadow-rose-600/30"
          >
            <div>
              <div className="text-xs font-mono uppercase font-bold text-rose-100">India National Helpline</div>
              <div className="text-xl font-mono font-extrabold">Dial 1930</div>
              <div className="text-[10px] text-rose-100">National Cybercrime Reporting Portal</div>
            </div>
            <PhoneCall className="w-6 h-6 shrink-0" />
          </a>

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white transition flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-mono uppercase font-bold text-slate-400">Official Web Portal</div>
              <div className="text-base font-bold text-cyan-300">cybercrime.gov.in</div>
              <div className="text-[10px] text-slate-400">Ministry of Home Affairs, Govt. of India</div>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-400 shrink-0" />
          </a>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#070B14] border border-slate-800/80 space-y-1">
            <h3 className="text-xs font-bold text-white">How does ScamShield AI evaluate scam probability?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ScamShield runs a multi-layered analysis pipeline combining deterministic heuristics (evaluating domain age, URL homoglyphs, urgency patterns, phone spoofing cues, and APK permissions) with Gemini AI reasoning to detect novel social engineering vectors.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#070B14] border border-slate-800/80 space-y-1">
            <h3 className="text-xs font-bold text-white">What is a &quot;Digital Arrest&quot; and is it real?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              &quot;Digital Arrest&quot; is completely fake. No police agency, court, or investigative bureau (CBI, ED, NIA, Mumbai Police) in India arrests anyone via video call or demands money to be transferred to RBI &quot;supervisory accounts&quot;. Hang up immediately.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#070B14] border border-slate-800/80 space-y-1">
            <h3 className="text-xs font-bold text-white">Is my scanning data sent to advertisers or saved?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No. ScamShield AI never sells or shares your inputs. All scan history is stored locally in your browser&apos;s sandbox and can be wiped with one tap in Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
