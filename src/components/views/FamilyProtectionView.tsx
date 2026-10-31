import React, { useState } from 'react';
import {
  Users,
  Shield,
  PhoneCall,
  KeyRound,
  Download,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Printer,
  Copy,
  Check,
  Eye,
  EyeOff,
  LifeBuoy
} from 'lucide-react';

const RANDOM_ADJECTIVES = ['SILVER', 'GOLDEN', 'CRIMSON', 'EMERALD', 'SAPPHIRE', 'COBALT', 'AMBER', 'TITANIUM'];
const RANDOM_NOUNS = ['FALCON', 'RIVER', 'SHIELD', 'SUMMIT', 'CEDAR', 'HARBOR', 'HORIZON', 'SENTINEL'];

function generateRandomSafeWord(): string {
  const adj = RANDOM_ADJECTIVES[Math.floor(Math.random() * RANDOM_ADJECTIVES.length)];
  const noun = RANDOM_NOUNS[Math.floor(Math.random() * RANDOM_NOUNS.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${adj}-${noun}-${num}`;
}

export const FamilyProtectionView: React.FC = () => {
  const [safeWord, setSafeWord] = useState<string>('SILVER-FALCON-42');
  const [showSafeWord, setShowSafeWord] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [customWord, setCustomWord] = useState<string>('');

  const handlePrintCard = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(safeWord);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNew = () => {
    const newWord = generateRandomSafeWord();
    setSafeWord(newWord);
    setIsEditing(false);
  };

  const handleSaveCustom = () => {
    if (customWord.trim()) {
      setSafeWord(customWord.trim().toUpperCase());
      setIsEditing(false);
    }
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
            Seniors and teenagers are prime targets for AI voice cloning kidnapping extortion, fake digital arrest intimidation, and deceptive screen-share takeovers (AnyDesk / RustDesk). Establish zero-trust family verification protocols.
          </p>
        </div>
      </div>

      {/* Safe Word Protocol Card */}
      <div className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-cyan-400 font-bold text-xs uppercase font-mono">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <span>Anti-Voice-Cloning Family Safe Word</span>
          </div>
          <span className="text-[10px] text-slate-400 lowercase font-sans">
            Never store on cloud notes or messaging bios
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Scammers synthesize authentic vocal facsimiles using 3 seconds of audio from social media. If someone calls crying claiming a loved one is in hospital or police lockup, <strong>demand the family safe word</strong> before taking any action or sending money.
        </p>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#070B14] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 w-full md:w-auto">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
              Active Family Safe Word
            </span>

            {isEditing ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  placeholder="e.g. CRIMSON-SHIELD-99"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/50 text-white font-mono text-sm uppercase focus:outline-none"
                />
                <button
                  onClick={handleSaveCustom}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="font-mono text-xl font-extrabold text-cyan-300 tracking-wider">
                {showSafeWord ? safeWord : '••••••••••••••••'}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSafeWord(!showSafeWord)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              {showSafeWord ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showSafeWord ? 'Hide' : 'Reveal'}</span>
            </button>

            <button
              onClick={handleGenerateNew}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              title="Generate a randomized high-entropy phonetic safe phrase"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Randomize</span>
            </button>

            <button
              onClick={() => {
                setCustomWord(safeWord);
                setIsEditing(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Customize
            </button>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Senior & Vulnerable Member Protection Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B132B]/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>Strict Screen-Sharing Ban</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            Never install AnyDesk, TeamViewer, or RustDesk on Parents&apos; Devices
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Over 68% of senior digital theft involves an imposter posing as bank KYC support or electricity department instructing them to install a remote desktop app to &quot;verify details&quot;.
          </p>
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 font-mono">
            Mandate: Official banks and utility discoms NEVER ask customers to install remote screen-share software.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B132B]/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono uppercase">
            <Shield className="w-4 h-4" />
            <span>Dual-Confirmation Transfer Protocol</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            Mandate 2nd Family Member Confirmation for Unplanned Transfers
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Require any unexpected transfer request to be verbally confirmed over a separate outbound telephone call with a second family member before authorizing.
          </p>
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-mono">
            Rule: Always originate the phone call yourself. Never trust the incoming telephone channel.
          </div>
        </div>
      </div>

      {/* Printable Emergency Help Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B132B] to-[#0A1024] border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Printable Emergency Card for Household & Wallet</span>
          </h3>
          <p className="text-xs text-slate-400">
            Compact emergency reference with National Cyber Helpline 1930, bank card freeze steps, and zero-panic instructions.
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
