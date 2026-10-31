import React, { useState, useEffect } from 'react';
import { ScanHistoryItem } from '../../types';
import {
  getScanHistory,
  deleteScanFromHistory,
  clearHistory,
  exportHistoryAsJson,
  isHistoryEnabled,
  setHistoryEnabled
} from '../../services/historyStorage';
import {
  History,
  Trash2,
  Download,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Lock,
  Globe,
  FileText,
  FileImage,
  PhoneCall
} from 'lucide-react';

interface HistoryViewProps {
  onSelectScan: (item: ScanHistoryItem) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectScan }) => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [historyActive, setHistoryActive] = useState<boolean>(true);

  const loadData = () => {
    setHistory(getScanHistory());
    setHistoryActive(isHistoryEnabled());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteScanFromHistory(id);
    setHistory(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to permanently clear your local scan history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const toggleHistoryActive = () => {
    const next = !historyActive;
    setHistoryEnabled(next);
    setHistoryActive(next);
    if (!next) setHistory([]);
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.scamType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.inputSnippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = filterLevel === 'all' || item.riskLevel.toLowerCase() === filterLevel.toLowerCase();
    const matchesType = filterType === 'all' || item.targetType === filterType;

    return matchesSearch && matchesLevel && matchesType;
  });

  const getRiskBadge = (level: string, score: number) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <Flame className="w-3 h-3 text-rose-400" />
            CRITICAL ({score})
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
            <ShieldAlert className="w-3 h-3 text-orange-400" />
            HIGH ({score})
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            MEDIUM ({score})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            LOW ({score})
          </span>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone_call':
        return <PhoneCall className="w-4 h-4 text-cyan-400" />;
      case 'url':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'screenshot':
        return <FileImage className="w-4 h-4 text-indigo-400" />;
      default:
        return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Recent Threat Scans ({history.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Scans are stored exclusively on this local browser device for your forensic reference.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={toggleHistoryActive}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              historyActive
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            {historyActive ? 'History Enabled' : 'History Paused'}
          </button>

          {history.length > 0 && (
            <>
              <button
                onClick={exportHistoryAsJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 text-xs font-semibold transition cursor-pointer"
                title="Download JSON audit log"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-900/30 text-xs font-semibold transition cursor-pointer"
                title="Erase all stored scan reports"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative rounded-xl border border-slate-800 bg-[#0B132B]/60 flex items-center px-3.5 sm:col-span-1">
          <Search className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, IDs, or categories..."
            className="w-full bg-transparent py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Risk Filter */}
        <div className="rounded-xl border border-slate-800 bg-[#0B132B]/60 flex items-center px-3">
          <Filter className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full bg-transparent py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-200">All Risk Levels</option>
            <option value="critical" className="bg-slate-900 text-rose-400">Critical Threat</option>
            <option value="high" className="bg-slate-900 text-orange-400">High Risk</option>
            <option value="medium" className="bg-slate-900 text-amber-400">Medium Risk</option>
            <option value="low" className="bg-slate-900 text-emerald-400">Low Suspicion</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="rounded-xl border border-slate-800 bg-[#0B132B]/60 flex items-center px-3">
          <Filter className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-transparent py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-200">All Target Types</option>
            <option value="phone_call" className="bg-slate-900 text-cyan-300">Phone Call / Voice</option>
            <option value="message" className="bg-slate-900 text-slate-200">Message / Email</option>
            <option value="url" className="bg-slate-900 text-slate-200">URL / Domain</option>
            <option value="screenshot" className="bg-slate-900 text-slate-200">Screenshot</option>
          </select>
        </div>
      </div>

      {/* List of Scans */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-800 bg-[#0B132B]/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">No Scan Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {history.length === 0
              ? 'Run an audit using the Message, URL, or Screenshot scanners to view past forensic reports here.'
              : 'No scans match your current filter or search criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectScan(item)}
              className="p-4 rounded-xl border border-slate-800 bg-[#0B132B]/70 hover:bg-[#0B132B] hover:border-cyan-500/40 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="p-1 rounded bg-slate-900 border border-slate-800">
                    {getTypeIcon(item.targetType)}
                  </span>
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {item.id}
                  </span>
                  <span className="text-xs font-semibold text-white truncate">
                    {item.scamType}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(item.timestamp).toLocaleDateString()} at{' '}
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 truncate font-mono">
                  {item.inputSnippet}
                </p>

                <p className="text-xs text-slate-400 line-clamp-1">
                  {item.summary}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {getRiskBadge(item.riskLevel, item.riskScore)}

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition cursor-pointer"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
