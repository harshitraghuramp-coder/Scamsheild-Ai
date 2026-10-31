import React, { useState } from 'react';
import {
  User,
  Shield,
  Award,
  CheckCircle,
  Globe,
  Bell,
  Lock,
  Smartphone,
  Save
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const [name, setName] = useState('Cyber Defender');
  const [jurisdiction, setJurisdiction] = useState('India (Helpline 1930 / cybercrime.gov.in)');
  const [defenseLevel, setDefenseLevel] = useState('HIGH');
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/20">
              <div className="w-full h-full bg-[#070B14] rounded-[14px] flex items-center justify-center">
                <User className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>Zero-Trust Shield Tier</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {name}
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Jurisdiction: {jurisdiction.split(' ')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
              Status: Fully Hardened
            </span>
          </div>
        </div>
      </div>

      {savedAlert && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Profile preferences saved to local secure store.</span>
        </div>
      )}

      {/* Defense Stats Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0B132B]/80 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Total Scans Run</span>
          <div className="text-2xl font-extrabold text-white font-mono">24</div>
          <span className="text-[10px] text-emerald-400 font-mono">100% on-device</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B132B]/80 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Threats Blocked</span>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">11</div>
          <span className="text-[10px] text-slate-400 font-mono">Across 5 channels</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B132B]/80 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Drill Accuracy</span>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">92%</div>
          <span className="text-[10px] text-purple-300 font-mono">Master tier</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B132B]/80 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Emergency 1930</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">Ready</div>
          <span className="text-[10px] text-emerald-300 font-mono">Pre-dialed</span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
          Threat Defense Identity & Jurisdiction
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
              Active Legal Jurisdiction & Helpline
            </label>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="India (Helpline 1930 / cybercrime.gov.in)">India (National Cybercrime 1930)</option>
              <option value="United States (IC3 / FTC 1-877-382-4357)">United States (FBI IC3 / FTC)</option>
              <option value="United Kingdom (Action Fraud 0300 123 2040)">United Kingdom (Action Fraud)</option>
              <option value="International / Global">International / Interpol</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
            Paranoia & Strictness Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['STANDARD', 'HIGH', 'MAXIMUM ZERO-TRUST'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDefenseLevel(lvl)}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  defenseLevel === lvl
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
