import React, { useState, useEffect } from 'react';
import { AnalysisResult, ScanHistoryItem } from './types';
import { saveScanToHistory, getScanHistory } from './services/historyStorage';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { MessageScanner } from './components/scanners/MessageScanner';
import { UrlScanner } from './components/scanners/UrlScanner';
import { ScreenshotScanner } from './components/scanners/ScreenshotScanner';
import { PhoneCallScanner } from './components/scanners/PhoneCallScanner';
import { AnalysisReportCard } from './components/AnalysisReportCard';
import { HistoryView } from './components/views/HistoryView';
import { EncyclopediaView } from './components/views/EncyclopediaView';
import { VigilanceDrillView } from './components/views/VigilanceDrillView';
import { EmergencyPlaybookView } from './components/views/EmergencyPlaybookView';
import { ThreatIntelView } from './components/views/ThreatIntelView';
import { ProjectCoverageView } from './components/views/ProjectCoverageView';
import { RiskDistributionChart } from './components/RiskDistributionChart';
import { ReportModal } from './components/ReportModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  ShieldAlert,
  Globe,
  FileImage,
  MessageSquare,
  PhoneCall,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  History,
  Info,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('scanner');
  const [scannerSubTab, setScannerSubTab] = useState<'message' | 'url' | 'screenshot' | 'phone'>('message');

  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [modalResult, setModalResult] = useState<AnalysisResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

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

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col bg-grid-cyber">
      {/* Top Header */}
      <Header onGoToScanner={() => setCurrentTab('scanner')} />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(t) => {
            setCurrentTab(t);
            setError(null);
          }}
          historyCount={historyCount}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Global Alert Banner if error occurs */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-200 font-bold ml-2 shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: THREAT SCANNER */}
          {currentTab === 'scanner' && (
            <div className="space-y-6">
              {/* Welcome Dashboard Header (Only shown when not showing result) */}
              {!currentResult && (
                <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
                  {/* Subtle decorative glow */}
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
                      <button
                        onClick={() => setCurrentTab('coverage')}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer text-xs"
                      >
                        <span>View 4-Channel Coverage Matrix</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
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
                        setScannerSubTab('phone');
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
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                        NEW
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScannerSubTab('message');
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

          {/* TAB: PROJECT COVERAGE & ARCHITECTURE */}
          {currentTab === 'coverage' && (
            <ProjectCoverageView
              onNavigateToScanner={(sub) => {
                setCurrentTab('scanner');
                setScannerSubTab(sub);
                setCurrentResult(null);
              }}
            />
          )}

          {/* TAB 2: SCAN HISTORY */}
          {currentTab === 'history' && (
            <HistoryView onSelectScan={handleSelectHistoryScan} />
          )}

          {/* TAB 3: SCAM ENCYCLOPEDIA */}
          {currentTab === 'encyclopedia' && <EncyclopediaView />}

          {/* TAB 4: VIGILANCE DRILL */}
          {currentTab === 'drill' && <VigilanceDrillView />}

          {/* TAB 5: EMERGENCY PLAYBOOK */}
          {currentTab === 'playbook' && <EmergencyPlaybookView />}

          {/* TAB 6: THREAT INTELLIGENCE */}
          {currentTab === 'intel' && <ThreatIntelView />}
        </main>
      </div>

      {/* Footer Disclaimer & Legal */}
      <footer className="border-t border-slate-800/80 bg-[#070B14]/80 py-6 mt-auto">
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
