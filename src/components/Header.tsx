import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { Shield, Sparkles, Activity } from 'lucide-react';

interface HeaderProps {
  onGoToScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGoToScanner }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070B14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={onGoToScanner}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#070B14] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            {/* Live pulsating status dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-white font-mono">
                SCAMSHIELD<span className="text-cyan-400">AI</span>
              </span>
              <span className="hidden md:inline-flex px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
                v2.4
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 tracking-wide hidden sm:block">
              Think Before You Click.
            </p>
          </div>
        </div>

        {/* Right side live status & PWA button */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B132B] border border-slate-800 text-xs text-slate-300 font-mono">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">Threat Shield:</span>
            <span className="text-emerald-400 font-bold">148.9K Active</span>
          </div>

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
