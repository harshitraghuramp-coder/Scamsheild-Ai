import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Globe,
  FileImage,
  PhoneCall,
  Smartphone,
  LifeBuoy,
  ShieldCheck,
  CheckCircle2,
  Users,
  History,
  Activity,
  Flame,
  FileText,
  Brain,
  HelpCircle,
  BookOpen,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Radar,
  KeyRound,
  X
} from 'lucide-react';

export type NavItemKey =
  // MAIN
  | 'dashboard'
  | 'message_scanner'
  | 'url_analyzer'
  | 'screenshot_scanner'
  | 'phone_call_detector'
  | 'app_authenticity'
  // PROTECTION
  | 'emergency_help'
  | 'real_time_protection'
  | 'security_checkup'
  | 'family_protection'
  // INTELLIGENCE
  | 'live_scam_tracker'
  | 'incident_tracker'
  | 'threat_intelligence'
  | 'community_reports'
  | 'security_reports'
  // LEARNING
  | 'learning_coach'
  | 'cybersecurity_quiz'
  | 'awareness_center'
  // PREFERENCES
  | 'security_identity'
  | 'profile'
  | 'settings'
  | 'help_support';

export interface NavSection {
  title: string;
  items: {
    key: NavItemKey;
    label: string;
    icon: React.ElementType;
    badgeText?: string;
    badgeCount?: number;
    badgeColor?: string;
  }[];
}

interface SidebarProps {
  currentNav: NavItemKey;
  onNavChange: (key: NavItemKey) => void;
  historyCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentNav,
  onNavChange,
  historyCount,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const sections: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard
        },
        {
          key: 'message_scanner',
          label: 'Message Scanner',
          icon: MessageSquare
        },
        {
          key: 'url_analyzer',
          label: 'URL Analyzer',
          icon: Globe
        },
        {
          key: 'screenshot_scanner',
          label: 'Screenshot Scanner',
          icon: FileImage
        },
        {
          key: 'phone_call_detector',
          label: 'Phone Call Scam Detector',
          icon: PhoneCall
        },
        {
          key: 'app_authenticity',
          label: 'App Authenticity Analyzer',
          icon: Smartphone,
          badgeText: 'NEW',
          badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800'
        }
      ]
    },
    {
      title: 'PROTECTION',
      items: [
        {
          key: 'emergency_help',
          label: 'Emergency Cyber Help',
          icon: LifeBuoy,
          badgeText: '1930',
          badgeColor: 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
        },
        {
          key: 'real_time_protection',
          label: 'Real-Time Protection',
          icon: ShieldCheck
        },
        {
          key: 'security_checkup',
          label: 'Personal Security Checkup',
          icon: CheckCircle2
        },
        {
          key: 'family_protection',
          label: 'Family Protection',
          icon: Users
        }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        {
          key: 'live_scam_tracker',
          label: 'Live Scam Tracker',
          icon: Radar,
          badgeText: 'LIVE',
          badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800'
        },
        {
          key: 'incident_tracker',
          label: 'Scam Incident Tracker',
          icon: History,
          badgeCount: historyCount > 0 ? historyCount : undefined
        },
        {
          key: 'threat_intelligence',
          label: 'Threat Intelligence',
          icon: Activity,
          badgeText: 'LIVE',
          badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800'
        },
        {
          key: 'community_reports',
          label: 'Community Reports',
          icon: Flame
        },
        {
          key: 'security_reports',
          label: 'Security Reports',
          icon: FileText
        }
      ]
    },
    {
      title: 'LEARNING',
      items: [
        {
          key: 'learning_coach',
          label: 'AI Learning Coach',
          icon: Brain
        },
        {
          key: 'cybersecurity_quiz',
          label: 'Cybersecurity Quiz',
          icon: HelpCircle
        },
        {
          key: 'awareness_center',
          label: 'Awareness Center',
          icon: BookOpen
        }
      ]
    },
    {
      title: 'PREFERENCES',
      items: [
        {
          key: 'security_identity',
          label: 'Secure Identity',
          icon: KeyRound,
          badgeText: 'VAULT',
          badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800'
        },
        {
          key: 'profile',
          label: 'Profile',
          icon: User
        },
        {
          key: 'settings',
          label: 'Settings',
          icon: Settings
        },
        {
          key: 'help_support',
          label: 'Help & Support',
          icon: HelpCircle
        }
      ]
    }
  ];

  const handleItemClick = (key: NavItemKey) => {
    onNavChange(key);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full select-none">
      {/* Top Branding Section */}
      <div className={`p-4 border-b border-slate-800/80 flex items-center justify-between ${isCollapsed ? 'justify-center px-2' : ''}`}>
        <div
          onClick={() => handleItemClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#070B14] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-sm text-white font-mono">
                  SCAMSHIELD<span className="text-cyan-400">AI</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 tracking-wide truncate">
                Think Before You Click.
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle button on desktop */}
        <button
          onClick={onToggleCollapse}
          className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-slate-700 ${
            isCollapsed ? 'mt-3' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar (260px)' : 'Collapse sidebar (76px)'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Close button on mobile */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Scrollable Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-4 no-scrollbar">
        {sections.map((section, sIdx) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed ? (
              <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-500 px-2.5 pt-2 pb-1">
                {section.title}
              </div>
            ) : (
              sIdx > 0 && <div className="border-t border-slate-800/60 my-2 mx-1" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const IconComp = item.icon;
                const isActive = currentNav === item.key;

                return (
                  <div key={item.key} className="relative group">
                    <button
                      onClick={() => handleItemClick(item.key)}
                      className={`w-full flex items-center rounded-xl transition-all duration-200 cursor-pointer ${
                        isCollapsed
                          ? 'justify-center p-2.5'
                          : 'justify-between px-3 py-2 text-left'
                      } ${
                        isActive
                          ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-semibold shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComp
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-cyan-400'
                              : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        {!isCollapsed && (
                          <span className={`text-xs truncate ${isActive ? 'text-white font-medium' : 'text-slate-300'}`}>
                            {item.label}
                          </span>
                        )}
                      </div>

                      {!isCollapsed && (
                        <div className="shrink-0 flex items-center gap-1 ml-1.5">
                          {item.badgeCount !== undefined && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {item.badgeCount}
                            </span>
                          )}
                          {item.badgeText && (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${
                                item.badgeColor || 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              }`}
                            >
                              {item.badgeText}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Floating Tooltip when Collapsed */}
                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-xs font-medium text-slate-100">{item.label}</span>
                        {item.badgeText && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${
                              item.badgeColor || 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            }`}
                          >
                            {item.badgeText}
                          </span>
                        )}
                        {item.badgeCount !== undefined && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {item.badgeCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Emergency 1930 / Zero-Trust Footnote */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070B14]/80">
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/40 via-[#0B132B] to-slate-900 border border-rose-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-rose-300 flex items-center gap-1">
                <LifeBuoy className="w-3 h-3 text-rose-400" />
                <span>Cyber Helpline</span>
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-rose-500/20 text-rose-200">24x7</span>
            </div>
            <a
              href="tel:1930"
              className="block w-full py-1.5 px-2 text-center rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs transition shadow-md shadow-rose-600/20"
            >
              Dial 1930
            </a>
          </div>
        ) : (
          <a
            href="tel:1930"
            className="flex items-center justify-center w-full py-2 rounded-xl bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white transition"
            title="Dial 1930 Helpline"
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
          </a>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-slate-800/80 bg-[#080E1E] transition-all duration-300 ease-in-out sticky top-0 h-screen z-30 ${
          isCollapsed ? 'w-[76px]' : 'w-[260px]'
        }`}
      >
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Slide-over */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Menu Panel */}
          <div className="relative w-[280px] max-w-[85vw] bg-[#080E1E] border-r border-slate-800 shadow-2xl h-full flex flex-col z-50 animate-in slide-in-from-left duration-250">
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
};
