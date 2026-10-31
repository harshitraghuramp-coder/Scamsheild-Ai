import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DemoProfile } from '../../services/authApi';
import {
  User,
  ShieldCheck,
  LifeBuoy,
  Radar,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  Info,
  X,
  Play,
} from 'lucide-react';

interface DemoProfileSelectorProps {
  onSelectProfile?: (profile: DemoProfile) => void;
  onClose?: () => void;
  onBack?: () => void;
}

export const DemoProfileSelector: React.FC<DemoProfileSelectorProps> = ({
  onSelectProfile,
  onClose,
  onBack,
}) => {
  const { demoProfilesList, launchDemoProfile } = useAuth();
  const [selectedProfileId, setSelectedProfileId] = useState<string>('basic_user');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const getProfileIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-cyan-400" />;
      case 'LifeBuoy':
        return <LifeBuoy className="w-6 h-6 text-rose-400" />;
      case 'Radar':
        return <Radar className="w-6 h-6 text-purple-400" />;
      default:
        return <User className="w-6 h-6 text-blue-400" />;
    }
  };

  const getIconContainerColor = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return 'bg-cyan-950/80 border-cyan-800 text-cyan-400';
      case 'LifeBuoy':
        return 'bg-rose-950/80 border-rose-800 text-rose-400';
      case 'Radar':
        return 'bg-purple-950/80 border-purple-800 text-purple-400';
      default:
        return 'bg-blue-950/80 border-blue-800 text-blue-400';
    }
  };

  const handleLaunch = async (profile: DemoProfile) => {
    setIsLaunching(true);
    setLaunchingId(profile.id);
    try {
      await launchDemoProfile(profile.id);
      if (onSelectProfile) onSelectProfile(profile);
    } finally {
      setIsLaunching(false);
      setLaunchingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Sandbox Evaluation</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
          Explore Demo Profiles
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          Evaluate ScamShield AI without signing up. Select a predefined role loaded with realistic, clearly-labeled simulated incident data and dedicated tool permissions.
        </p>
      </div>

      {/* Statutory Simulation Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed text-amber-300/90">
          <strong>DEMO DATA DISCLAIMER:</strong> All sample messages, extortion transcripts, and threat alerts are fictional simulations for demonstration. Demo mode operates in an isolated environment and never contacts actual police departments or modifies production records.
        </p>
      </div>

      {/* 4 Demo Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demoProfilesList.map((profile) => {
          const isSelected = selectedProfileId === profile.id;
          const isCurrentLaunching = launchingId === profile.id;

          return (
            <div
              key={profile.id}
              onClick={() => setSelectedProfileId(profile.id)}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer text-left relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-br from-[#0B152B] to-[#0A1024] border-cyan-400/80 shadow-xl shadow-cyan-950/50 ring-1 ring-cyan-400/30'
                  : 'bg-[#070B14]/80 border-slate-800 hover:border-slate-700 hover:bg-[#0A1024]/60'
              }`}
            >
              {/* Top Accent Line */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
              )}

              <div className="space-y-3">
                {/* Header with Avatar & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-lg ${getIconContainerColor(
                        profile.avatarIcon
                      )}`}
                    >
                      {getProfileIcon(profile.avatarIcon)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                        {profile.name}
                      </h3>
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold block mt-0.5">
                        {profile.accessLevel}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
                    DEMO
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed">
                  {profile.description}
                </p>

                {/* Features Pill List */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                    Enabled Features:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {profile.features.slice(0, 3).map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-1.5 font-mono">
                        <CheckCircle className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                    {profile.features.length > 3 && (
                      <li className="text-[10px] text-slate-500 font-mono pl-4.5">
                        + {profile.features.length - 3} more capabilities
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  Default View: <span className="text-slate-300">{profile.defaultNav}</span>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunch(profile);
                  }}
                  disabled={isLaunching}
                  className={`py-2 px-3.5 rounded-xl font-bold text-xs tracking-wide transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                    isSelected
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {isCurrentLaunching ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch Demo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Back / Close button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            &larr; Back to Regular Sign In
          </button>
        ) : (
          <span />
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition cursor-pointer"
          >
            Continue as Guest &rarr;
          </button>
        )}
      </div>
    </div>
  );
};
