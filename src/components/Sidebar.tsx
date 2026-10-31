import React from 'react';
import {
  ShieldAlert,
  History,
  BookOpen,
  HelpCircle,
  LifeBuoy,
  Activity,
  Shield,
  Layers
} from 'lucide-react';

export type TabType = 'scanner' | 'history' | 'coverage' | 'encyclopedia' | 'drill' | 'playbook' | 'intel';

interface SidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  historyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, historyCount }) => {
  const navItems = [
    {
      id: 'scanner' as TabType,
      label: 'Threat Scanner',
      icon: ShieldAlert,
      description: 'Voice, Text, URL & Visual',
    },
    {
      id: 'coverage' as TabType,
      label: 'Coverage & Scope',
      icon: Layers,
      badgeText: '4 CHANNELS',
      description: 'Architecture & matrix',
    },
    {
      id: 'history' as TabType,
      label: 'Scan History',
      icon: History,
      badge: historyCount > 0 ? historyCount : undefined,
      description: 'Local audit trail',
    },
    {
      id: 'encyclopedia' as TabType,
      label: 'Scam Encyclopedia',
      icon: BookOpen,
      description: 'Threat vector catalog',
    },
    {
      id: 'drill' as TabType,
      label: 'Vigilance Drill',
      icon: HelpCircle,
      description: 'Interactive scenario test',
    },
    {
      id: 'playbook' as TabType,
      label: 'Incident Playbook',
      icon: LifeBuoy,
      description: 'Emergency response steps',
    },
    {
      id: 'intel' as TabType,
      label: 'Threat Intelligence',
      icon: Activity,
      description: 'Feeds & IOC lookup',
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-800/80 bg-[#070B14]/60 p-4 space-y-6 min-h-[calc(100vh-4rem)]">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3">
            Navigation Hub
          </span>
          <nav className="space-y-1 mt-2">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <div>
                      <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeText && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {item.badgeText}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Safety Rule Card in Sidebar */}
        <div className="mt-auto p-4 rounded-xl bg-[#0B132B]/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>Zero-Trust Rule</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Never authorize bank transactions, share OTPs, or click unverified links from unsolicited messages. Always verify via official channels.
          </p>
        </div>
      </aside>

      {/* Mobile Top Navigation Pills */}
      <div className="lg:hidden w-full border-b border-slate-800 bg-[#070B14] p-2.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 rounded-full ${isActive ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
