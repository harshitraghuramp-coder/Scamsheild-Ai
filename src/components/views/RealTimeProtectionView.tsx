import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Bell,
  RefreshCw,
  Lock,
  Globe,
  Smartphone,
  PhoneCall,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';

interface GuardModule {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  status: 'ACTIVE' | 'IDLE' | 'LEARNING';
  blockedCount: number;
}

export const RealTimeProtectionView: React.FC = () => {
  const [guards, setGuards] = useState<GuardModule[]>([
    {
      id: 'phish',
      name: 'Anti-Phishing Browser Sentinel',
      category: 'URL & Web Defense',
      description: 'Intercepts deceptive homograph domains, credential-harvesting login clones, and unverified TLDs before navigation.',
      icon: Globe,
      enabled: true,
      status: 'ACTIVE',
      blockedCount: 42
    },
    {
      id: 'call',
      name: 'Voice Vishing & Call Guardian',
      category: 'Telephony & Audio',
      description: 'Monitors caller IDs for spoofed government/bank prefixes and screens incoming calls against the 1930 fraud database.',
      icon: PhoneCall,
      enabled: true,
      status: 'ACTIVE',
      blockedCount: 19
    },
    {
      id: 'apk',
      name: 'Malicious App & Sideload Interceptor',
      category: 'Mobile Application',
      description: 'Scrutinizes app installation packages for accessibility hijacking, overlay attacks, and unauthorized SMS reading services.',
      icon: Smartphone,
      enabled: true,
      status: 'ACTIVE',
      blockedCount: 8
    },
    {
      id: 'clipboard',
      name: 'Clipboard & OTP Leak Protection',
      category: 'Identity Guard',
      description: 'Alerts if a temporary one-time password (OTP) or card PIN is copied to an untrusted web form or chat window.',
      icon: Lock,
      enabled: true,
      status: 'ACTIVE',
      blockedCount: 14
    },
    {
      id: 'zero_trust',
      name: 'Zero-Trust Communication Filter',
      category: 'Heuristic Engine',
      description: 'Enforces strict sender verification on WhatsApp, Telegram, and SMS messages claiming to represent banks or legal authorities.',
      icon: ShieldAlert,
      enabled: false,
      status: 'IDLE',
      blockedCount: 0
    }
  ]);

  const [simulatedAlert, setSimulatedAlert] = useState<string | null>(null);

  const toggleGuard = (id: string) => {
    setGuards(prev =>
      prev.map(g => (g.id === id ? { ...g, enabled: !g.enabled, status: !g.enabled ? 'ACTIVE' : 'IDLE' } : g))
    );
  };

  const runSimulation = () => {
    setSimulatedAlert('Simulating incoming deceptive phishing SMS with fake bank link...');
    setTimeout(() => {
      setSimulatedAlert('Intercepted! [Phishing Blocked] Suspicious domain "hdfc-netbanking-verify.xyz" blocked by Anti-Phishing Sentinel.');
      setGuards(prev =>
        prev.map(g => (g.id === 'phish' ? { ...g, blockedCount: g.blockedCount + 1 } : g))
      );
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Shield Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Real-Time <span className="text-cyan-400">Threat Protection</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Continuous background vigilance engines inspecting URLs, caller identities, sideloaded applications, and clipboard OTPs. All telemetry is processed on-device with zero cloud telemetry logging.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 font-bold">Engine Status: All Core Shields Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Signatures: 148,920 updated 12m ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Test Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B132B]/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Interception Simulator</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Test how real-time protection shields against deceptive links and spoofed calls in a safe sandbox.
          </p>
        </div>
        <button
          onClick={runSimulation}
          className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Simulate Attack</span>
        </button>
      </div>

      {simulatedAlert && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/50 text-cyan-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{simulatedAlert}</span>
          </div>
          <button
            onClick={() => setSimulatedAlert(null)}
            className="text-cyan-400 hover:text-white font-bold ml-2 shrink-0 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Protective Guard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guards.map((guard) => {
          const IconComp = guard.icon;
          return (
            <div
              key={guard.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                guard.enabled
                  ? 'bg-[#0B132B]/80 border-slate-700/80'
                  : 'bg-[#070B14]/60 border-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    guard.enabled ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                      {guard.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {guard.name}
                    </h3>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => toggleGuard(guard.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    guard.enabled ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                  aria-label={`Toggle ${guard.name}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      guard.enabled ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                {guard.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${guard.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className={guard.enabled ? 'text-emerald-400' : 'text-slate-500'}>
                    {guard.status}
                  </span>
                </div>
                <div className="text-slate-400">
                  Threats Blocked: <span className="font-bold text-cyan-300">{guard.blockedCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
