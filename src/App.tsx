import React, { useState, useEffect } from 'react';
import { AnalysisResult, ScanHistoryItem } from './types';
import { saveScanToHistory, getScanHistory } from './services/historyStorage';
import { Header } from './components/Header';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { MessageScanner } from './components/scanners/MessageScanner';
import { UrlScanner } from './components/scanners/UrlScanner';
import { ScreenshotScanner } from './components/scanners/ScreenshotScanner';
import { PhoneCallScanner } from './components/scanners/PhoneCallScanner';
import { AppAuthenticityScanner } from './components/scanners/AppAuthenticityScanner';
import { AnalysisReportCard } from './components/AnalysisReportCard';
import { HistoryView } from './components/views/HistoryView';
import { EncyclopediaView } from './components/views/EncyclopediaView';
import { VigilanceDrillView } from './components/views/VigilanceDrillView';
import { EmergencyPlaybookView } from './components/views/EmergencyPlaybookView';
import { EmergencyHelpView } from './components/views/EmergencyHelpView';
import { ThreatIntelView } from './components/views/ThreatIntelView';
import { LiveScamTrackerView } from './components/views/LiveScamTrackerView';
import { ProjectCoverageView } from './components/views/ProjectCoverageView';
import { RealTimeProtectionView } from './components/views/RealTimeProtectionView';
import { SecurityCheckupView } from './components/views/SecurityCheckupView';
import { FamilyProtectionView } from './components/views/FamilyProtectionView';
import { CommunityReportsView } from './components/views/CommunityReportsView';
import { SecurityReportsView } from './components/views/SecurityReportsView';
import { LearningCoachView } from './components/views/LearningCoachView';
import { ProfileView } from './components/views/ProfileView';
import { SecurityDashboardView } from './components/views/SecurityDashboardView';
import { SettingsView } from './components/views/SettingsView';
import { HelpSupportView } from './components/views/HelpSupportView';
import { AuthModal } from './components/auth/AuthModal';
import { DemoModeIndicator } from './components/auth/DemoModeIndicator';
import { useAuth } from './context/AuthContext';
import { RiskDistributionChart } from './components/RiskDistributionChart';
import { ReportModal } from './components/ReportModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  Smartphone,
  Globe,
  FileImage,
  MessageSquare,
  PhoneCall,
  Sparkles,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const { isDemoMode, activeDemoProfile } = useAuth();
  const [currentNav, setCurrentNav] = useState<NavItemKey>('dashboard');
  const [scannerSubTab, setScannerSubTab] = useState<'message' | 'url' | 'app' | 'screenshot' | 'phone'>('app');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [modalResult, setModalResult] = useState<AnalysisResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  // Automatically navigate to demo profile's specialized default workspace
  useEffect(() => {
    if (activeDemoProfile?.defaultNav) {
      setCurrentNav(activeDemoProfile.defaultNav as NavItemKey);
      if (activeDemoProfile.defaultNav === 'app_authenticity') {
        setScannerSubTab('app');
      } else if (activeDemoProfile.defaultNav === 'phone_call_detector') {
        setScannerSubTab('phone');
      } else if (activeDemoProfile.defaultNav === 'message_scanner') {
        setScannerSubTab('message');
      } else if (activeDemoProfile.defaultNav === 'url_analyzer') {
        setScannerSubTab('url');
      }
    }
  }, [activeDemoProfile?.id]);

  // Sync scan count on mount and updates
  const refreshHistoryCount = () => {
    const list = getScanHistory();
    setScanHistory(list);
    setHistoryCount(list.length);
  };

  useEffect(() => {
    refreshHistoryCount();
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleScanComplete = (result: AnalysisResult, inputSnippet: string) => {
    setCurrentResult(result);
    saveScanToHistory(result, inputSnippet);
    refreshHistoryCount();

    if (result.riskLevel === 'CRITICAL') {
      addToast('error', `Critical Threat Detected: ${result.scamType}`);
    } else if (result.riskLevel === 'HIGH') {
      addToast('error', `High Risk Detected: ${result.scamType}`);
    } else {
      addToast('success', `Scan complete: ${result.riskLevel} risk level assessed.`);
    }
  };

  const handleResetScan = () => {
    setCurrentResult(null);
    setError(null);
  };

  const handleSelectHistoryScan = (item: ScanHistoryItem) => {
    setModalResult(item);
  };

  // Central Navigation Handler
  const handleNavChange = (key: NavItemKey) => {
    setCurrentNav(key);
    setError(null);

    // Synchronize scanner sub-tab when direct scanner items are picked
    if (key === 'dashboard') {
      // Keep existing scanner subtab or default to app
    } else if (key === 'message_scanner') {
      setScannerSubTab('message');
      setCurrentResult(null);
    } else if (key === 'url_analyzer') {
      setScannerSubTab('url');
      setCurrentResult(null);
    } else if (key === 'screenshot_scanner') {
      setScannerSubTab('screenshot');
      setCurrentResult(null);
    } else if (key === 'phone_call_detector') {
      setScannerSubTab('phone');
      setCurrentResult(null);
    } else if (key === 'app_authenticity') {
      setScannerSubTab('app');
      setCurrentResult(null);
    }
  };

  // Determine whether current view should show the main scanner component
  const isScannerActive =
    currentNav === 'dashboard' ||
    currentNav === 'message_scanner' ||
    currentNav === 'url_analyzer' ||
    currentNav === 'screenshot_scanner' ||
    currentNav === 'phone_call_detector';

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col bg-grid-cyber">
      {/* Top Header */}
      <Header
        onGoToScanner={() => handleNavChange('dashboard')}
        onGoToEmergencyHelp={() => handleNavChange('emergency_help')}
        onGoToSecurityDashboard={() => handleNavChange('security_identity')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Persistent Demo Mode Indicator Banner */}
      <DemoModeIndicator />

      {/* Main Body with Left Sidebar */}
      <div className="flex-1 flex flex-row w-full min-h-[calc(100vh-4rem)]">
        {/* Navigation Sidebar */}
        <Sidebar
          currentNav={currentNav}
          onNavChange={handleNavChange}
          historyCount={historyCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl mx-auto w-full">
          {/* Global Alert Banner if error occurs */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-200 font-bold ml-2 shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* MAIN: SCANNER & DASHBOARD VIEWS */}
          {isScannerActive && (
            <div className="space-y-6">
              {/* Emergency Quick Assistance Callout */}
              {!currentResult && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/50 via-[#0B152B] to-slate-900 border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-rose-950/15">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400 mt-0.5 md:mt-0">
                      <PhoneCall className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-rose-300 uppercase tracking-wider font-mono">
                          Under Threat, Blackmail, or Pressure?
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          1930 Cybercrime Helpline
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        &quot;You&apos;re not alone. Stay calm. We&apos;ll help you take the next step.&quot; Facing fake digital arrest, money transferred, or leaked OTPs? Get guided emergency containment.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                    <a
                      href="tel:1930"
                      className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md shadow-rose-600/30"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call 1930</span>
                    </a>
                    <button
                      onClick={() => handleNavChange('emergency_help')}
                      className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
                    >
                      <span>Emergency Center</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Welcome Dashboard Header (Only shown when not showing result) */}
              {!currentResult && (
                <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

                  <div className="relative z-10 max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>AI-Powered Cybersecurity Defense Engine</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Detect Deception. <span className="text-cyan-400">Think Before You Click.</span>
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      ScamShield AI inspects suspicious phone calls & voice vishing, job offers, phishing emails, bank suspension SMS, payment demands, and malicious domains using deterministic cybersecurity heuristics combined with Gemini AI threat forensics.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        <span className="text-cyan-300 font-bold">Voice Vishing & Call Forensics</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Multi-Vector Inspection</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span>Client OCR + Vision</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Statistics Section visualizing risk level distribution */}
                  <div className="relative z-10">
                    <RiskDistributionChart history={scanHistory} />
                  </div>
                </div>
              )}

              {/* If an audit result exists, show compact summary stats + report card */}
              {currentResult ? (
                <div className="space-y-4">
                  <RiskDistributionChart history={scanHistory} compact={true} />
                  <AnalysisReportCard
                    result={currentResult}
                    onReset={handleResetScan}
                    showReset={true}
                  />
                </div>
              ) : (
                /* Scanner Sub-Tabs & Input Card */
                <div className="p-6 rounded-3xl bg-[#0B132B]/70 border border-slate-800 backdrop-blur-md space-y-6">
                  {/* Scanner Mode Selector */}
                  <div className="flex flex-wrap border-b border-slate-800 pb-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setScannerSubTab('app');
                        setCurrentNav('app_authenticity');
                        setError(null);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        scannerSubTab === 'app'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-cyan-400" />
                      <span>App Authenticity</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                        NEW
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScannerSubTab('phone');
                        setCurrentNav('phone_call_detector');
                        setError(null);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        scannerSubTab === 'phone'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <PhoneCall className="w-4 h-4 text-cyan-400" />
                      <span>Phone Call & Vishing</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScannerSubTab('message');
                        setCurrentNav('message_scanner');
                        setError(null);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        scannerSubTab === 'message'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message & Email Scanner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScannerSubTab('url');
                        setCurrentNav('url_analyzer');
                        setError(null);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        scannerSubTab === 'url'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span>URL Security Checker</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScannerSubTab('screenshot');
                        setCurrentNav('screenshot_scanner');
                        setError(null);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        scannerSubTab === 'screenshot'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <FileImage className="w-4 h-4" />
                      <span>Screenshot Scanner</span>
                    </button>
                  </div>

                  {/* Active Scanner Sub-component */}
                  {scannerSubTab === 'app' && (
                    <AppAuthenticityScanner
                      onScanComplete={handleScanComplete}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      setError={setError}
                    />
                  )}

                  {scannerSubTab === 'phone' && (
                    <PhoneCallScanner
                      onScanComplete={handleScanComplete}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      setError={setError}
                    />
                  )}

                  {scannerSubTab === 'message' && (
                    <MessageScanner
                      onScanComplete={handleScanComplete}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      setError={setError}
                    />
                  )}

                  {scannerSubTab === 'url' && (
                    <UrlScanner
                      onScanComplete={handleScanComplete}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      setError={setError}
                    />
                  )}

                  {scannerSubTab === 'screenshot' && (
                    <ScreenshotScanner
                      onScanComplete={handleScanComplete}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      setError={setError}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* MAIN: APP AUTHENTICITY ANALYZER (Dedicated View) */}
          {currentNav === 'app_authenticity' && (
            <div className="space-y-6">
              {currentResult && currentResult.targetType === 'app' ? (
                <div className="space-y-4">
                  <RiskDistributionChart history={scanHistory} compact={true} />
                  <AnalysisReportCard
                    result={currentResult}
                    onReset={handleResetScan}
                    showReset={true}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Dedicated Header for App Authenticity */}
                  <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
                    <div className="relative z-10 max-w-2xl space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
                        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Mobile Threat Defense & Store Forensics</span>
                      </div>

                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        AI App Authenticity <span className="text-cyan-400">& Risk Analyzer</span>
                      </h1>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Investigate potentially fake, fraudulent, or impersonating mobile applications before installing them.
                        Inspects Google Play Store & Apple App Store listings, official developer credentials, registered business entities, and sensitive trojan permissions (Accessibility hijacking, SMS interception, overlays).
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-[#0B132B]/70 border border-slate-800 backdrop-blur-md">
                    <AppAuthenticityScanner
                      onScanComplete={handleScanComplete}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      setError={setError}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROTECTION: EMERGENCY CYBER HELP */}
          {currentNav === 'emergency_help' && <EmergencyHelpView />}

          {/* PROTECTION: REAL-TIME PROTECTION */}
          {currentNav === 'real_time_protection' && <RealTimeProtectionView />}

          {/* PROTECTION: PERSONAL SECURITY CHECKUP */}
          {currentNav === 'security_checkup' && <SecurityCheckupView />}

          {/* PROTECTION: FAMILY PROTECTION */}
          {currentNav === 'family_protection' && <FamilyProtectionView />}

          {/* INTELLIGENCE: LIVE SCAM TRACKER */}
          {currentNav === 'live_scam_tracker' && <LiveScamTrackerView />}

          {/* INTELLIGENCE: SCAM INCIDENT TRACKER */}
          {currentNav === 'incident_tracker' && (
            <HistoryView onSelectScan={handleSelectHistoryScan} />
          )}

          {/* INTELLIGENCE: THREAT INTELLIGENCE */}
          {currentNav === 'threat_intelligence' && <ThreatIntelView />}

          {/* INTELLIGENCE: COMMUNITY REPORTS */}
          {currentNav === 'community_reports' && <CommunityReportsView />}

          {/* INTELLIGENCE: SECURITY REPORTS */}
          {currentNav === 'security_reports' && <SecurityReportsView />}

          {/* LEARNING: AI LEARNING COACH */}
          {currentNav === 'learning_coach' && <LearningCoachView />}

          {/* LEARNING: CYBERSECURITY QUIZ */}
          {currentNav === 'cybersecurity_quiz' && <VigilanceDrillView />}

          {/* LEARNING: AWARENESS CENTER */}
          {currentNav === 'awareness_center' && <EncyclopediaView />}

          {/* PREFERENCES: SECURE IDENTITY */}
          {currentNav === 'security_identity' && <SecurityDashboardView />}

          {/* PREFERENCES: PROFILE */}
          {currentNav === 'profile' && <ProfileView />}

          {/* PREFERENCES: SETTINGS */}
          {currentNav === 'settings' && (
            <SettingsView onHistoryCleared={refreshHistoryCount} />
          )}

          {/* PREFERENCES: HELP & SUPPORT */}
          {currentNav === 'help_support' && <HelpSupportView />}
        </main>
      </div>

      {/* Footer Disclaimer & Legal */}
      <footer className="border-t border-slate-800/80 bg-[#070B14]/90 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-400">SCAMSHIELD AI</span>
            <span>—</span>
            <span>Think Before You Click.</span>
          </div>

          <p className="text-center sm:text-right max-w-xl text-[11px] leading-relaxed text-slate-500">
            Automated heuristic & AI assessment. Never guarantee scam detection or assume content is 100% safe. Always verify independently through official channels.
          </p>
        </div>
      </footer>

      {/* ScamShield Secure Identity Authentication Modal */}
      <AuthModal />

      {/* Inspection Modal for History Items */}
      <ReportModal
        result={modalResult}
        onClose={() => setModalResult(null)}
      />

      {/* Connectivity Indicator */}
      <OfflineIndicator />

      {/* Toast Notification Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
