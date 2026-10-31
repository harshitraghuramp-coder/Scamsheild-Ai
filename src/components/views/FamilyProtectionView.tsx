import React, { useState } from 'react';
import {
  Users,
  Shield,
  PhoneCall,
  KeyRound,
  Download,
  AlertTriangle,
  CheckCircle,
  EyeOff,
  Printer
} from 'lucide-react';

export const FamilyProtectionView: React.FC = () => {
  const [safeWord, setSafeWord] = useState('BLUE-FALCON');
  const [showSafeWord, setShowSafeWord] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePrintCard = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(safeWord);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multi-Generation Defense</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Family <span className="text-cyan-400">Cyber Protection</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Seniors and teenagers are the primary targets of AI voice cloning kidnapping scams, fake pension updates, and deceptive screen-share theft (AnyDesk / RustDesk). Arm your family with collective protocols.
          </p>
        </div>
      </div>

      {/* Safe Word Protocol Card */}
      <div className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs uppercase font-mono">
          <KeyRound className="w-4 h-4" />
          <span>Anti-Voice-Cloning Safe Word Protocol</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Scammers now clone voices in under 3 seconds using audio from public videos or voice notes. If an unexpected caller claims a family member is arrested, in hospital, or kidnapped, ask for the secret safe word before sending any money.
        </p>

        <div className="p-4 rounded-2xl bg-[#070B14] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
              Your Confidential Family Safe Word
            </span>
            <div className="font-mono text-lg font-extrabold text-cyan-300 tracking-wider">
              {showSafeWord ? safeWord : '••••••••••••'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSafeWord(!showSafeWord)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              {showSafeWord ? 'Hide Word' : 'Reveal Word'}
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>
      </div>

      {/* Senior Protection Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B132B]/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>Senior Screen-Sharing Ban</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            Never install AnyDesk, TeamViewer, or RustDesk on Parents&apos; Phones
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Over 68% of senior digital theft involves an imposter posing as bank KYC support or electricity department instructing them to install a remote desktop app to &quot;verify details&quot;.
          </p>
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 font-mono">
            Rule: Legitimate banks NEVER ask you to install remote control apps.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B132B]/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono uppercase">
            <Shield className="w-4 h-4" />
            <span>Dual-Confirmation Transfer Rule</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            Mandate 2nd Family Member Confirmation for &gt; ₹5,000 / $100
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Require any unexpected transfer request to be verbally confirmed over a separate outbound phone call with a second family member before authorizing.
          </p>
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-mono">
            Always originate the call yourself — never trust an incoming call.
          </div>
        </div>
      </div>

      {/* Printable Emergency Help Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B132B] to-[#0A1024] border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Printable Emergency Card for Refrigerator / Wallet</span>
          </h3>
          <p className="text-xs text-slate-400">
            Contains 1930 Cybercrime Helpline number, bank card cancellation protocols, and panic-free instructions.
          </p>
        </div>
        <button
          onClick={handlePrintCard}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Emergency Card</span>
        </button>
      </div>
    </div>
  );
};
