import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { Shield, Sparkles, Activity, LifeBuoy, Menu, UserCheck, KeyRound, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onGoToScanner: () => void;
  onGoToEmergencyHelp?: () => void;
  onGoToSecurityDashboard?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoToScanner,
  onGoToEmergencyHelp,
  onGoToSecurityDashboard,
  onToggleMobileMenu
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070B14]/90 backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>
          )}

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
        </div>

        {/* Right side live status, Emergency Help button, Auth action & PWA button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onGoToEmergencyHelp && (
            <button
              onClick={onGoToEmergencyHelp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600/30 to-amber-600/30 hover:from-rose-600/40 hover:to-amber-600/40 border border-rose-500/50 text-rose-200 text-xs font-bold transition hover:scale-[1.02] cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.2)]"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="hidden sm:inline">Emergency Help (1930)</span>
              <span className="sm:hidden">1930</span>
            </button>
          )}

          {/* Secure Identity Auth Trigger */}
          {isAuthenticated && user ? (
            <button
              onClick={onGoToSecurityDashboard}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#0B132B] hover:bg-slate-800/90 border border-cyan-500/40 text-xs transition cursor-pointer"
              title="Open ScamShield Secure Identity Vault"
            >
              <div className="w-5 h-5 rounded-lg bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-300 font-mono text-[10px] font-bold">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline font-mono text-cyan-300 font-bold truncate max-w-[110px]">
                {user.displayName.split(' ')[0]}
              </span>
              {user.isDemo ? (
                <span className="hidden sm:inline px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  DEMO
                </span>
              ) : (
                <span className="hidden sm:inline px-1 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Secured
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Secure Identity</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}

          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B132B] border border-slate-800 text-xs text-slate-300 font-mono">
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
