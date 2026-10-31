import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  LogOut,
  Users,
  AlertTriangle,
  Info,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const DemoModeIndicator: React.FC = () => {
  const { isDemoMode, user, activeDemoProfile, exitDemoMode, openAuthModal } = useAuth();

  if (!isDemoMode || !user) return null;

  const profileName = activeDemoProfile?.name || user.displayName || 'Demo Visitor';
  const accessLevel = activeDemoProfile?.accessLevel || 'Simulated Access';

  return (
    <div className="w-full bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/40 px-4 py-2 text-xs font-mono select-none sticky top-16 z-30 shadow-lg shadow-amber-950/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left: Demo Mode Pulse & Profile Info */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold tracking-wider text-[10px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            <span>DEMO MODE ACTIVE</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-200 text-[11px]">
            <span className="text-slate-400">Profile:</span>
            <span className="font-bold text-white text-xs">{profileName}</span>
            <span className="text-amber-400/80 hidden md:inline">({accessLevel})</span>
          </div>

          <span className="hidden lg:inline text-slate-500">·</span>

          <span className="text-[10px] text-amber-200/70 hidden lg:inline">
            All reports and threat feeds are fictional simulations for hackathon evaluation.
          </span>
        </div>

        {/* Right: Actions (Switch Profile, Exit Demo) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openAuthModal('demo_selector')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[11px] transition flex items-center gap-1 cursor-pointer"
            title="Switch to another demo profile"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Switch Profile</span>
          </button>

          <button
            onClick={exitDemoMode}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 hover:text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
            title="Exit Demo Mode and return to sign in"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400" />
            <span>Exit Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
