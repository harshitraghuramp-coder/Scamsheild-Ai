import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Trash2,
  Download,
  Bell,
  Cpu,
  Lock,
  CheckCircle,
  Database,
  Volume2
} from 'lucide-react';
import { clearHistory, getScanHistory, exportHistoryAsJson } from '../../services/historyStorage';

interface SettingsViewProps {
  onHistoryCleared?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onHistoryCleared }) => {
  const [engineMode, setEngineMode] = useState<'hybrid' | 'gemini_only' | 'heuristics_only'>('hybrid');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoSaveHistory, setAutoSaveHistory] = useState(true);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleClear = () => {
    clearHistory();
    setClearConfirm(false);
    setStatusMessage('All local scan history and forensic records have been permanently cleared.');
    if (onHistoryCleared) onHistoryCleared();
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExport = () => {
    exportHistoryAsJson();
    setStatusMessage('Audit logs exported successfully.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>Engine Configuration & Local Privacy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            System <span className="text-cyan-400">Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Customize AI scanning pipelines, local cryptographic privacy storage, and acoustic notification triggers. ScamShield operates under strict zero-telemetry principles.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Engine Selection */}
      <div className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs uppercase font-mono">
          <Cpu className="w-4 h-4" />
          <span>Forensic Engine Pipeline</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => setEngineMode('hybrid')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              engineMode === 'hybrid'
                ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                : 'bg-[#070B14] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs">Hybrid Mode (Recommended)</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Deterministic rule checks + Gemini 2.5 Flash for deep semantic verification.
            </p>
          </div>

          <div
            onClick={() => setEngineMode('gemini_only')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              engineMode === 'gemini_only'
                ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                : 'bg-[#070B14] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs">AI Deep Forensics Only</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Full cognitive analysis of deceptive nuance, tone, and psychological manipulation.
            </p>
          </div>

          <div
            onClick={() => setEngineMode('heuristics_only')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              engineMode === 'heuristics_only'
                ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                : 'bg-[#070B14] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs">Fast Heuristics Mode</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Zero-latency offline pattern matching using local cybersecurity indicators.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications & Toggles */}
      <div className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs uppercase font-mono">
          <Volume2 className="w-4 h-4" />
          <span>Audio Warnings & Alert Triggers</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <div className="text-xs font-bold text-white">Critical Threat Audio Alarm</div>
            <div className="text-[11px] text-slate-400">Play an alert chime when a scan detects Critical Risk or Digital Arrest coercion.</div>
          </div>
          <button
            onClick={() => setSoundAlerts(!soundAlerts)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              soundAlerts ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                soundAlerts ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-xs font-bold text-white">Auto-Archive Scans to Local Storage</div>
            <div className="text-[11px] text-slate-400">Preserve audit trail on device for reporting to cybercrime authorities.</div>
          </div>
          <button
            onClick={() => setAutoSaveHistory(!autoSaveHistory)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              autoSaveHistory ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                autoSaveHistory ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Local Storage & Privacy Management */}
      <div className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs uppercase font-mono">
          <Database className="w-4 h-4" />
          <span>Local Forensic Audit Data</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          All scan results, OCR transcriptions, and app authenticity audits are stored exclusively inside your browser&apos;s localStorage. We never store inputs on cloud servers.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Trail (JSON)</span>
          </button>

          {!clearConfirm ? (
            <button
              onClick={() => setClearConfirm(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Scan Records</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-rose-600/30"
              >
                Confirm Permanent Delete
              </button>
              <button
                onClick={() => setClearConfirm(false)}
                className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
