import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  ThumbsUp,
  PlusCircle,
  Search,
  CheckCircle,
  Clock,
  ShieldAlert,
  RefreshCw,
  Info,
  ShieldCheck
} from 'lucide-react';
import { fetchScamTrackerFeed, submitCommunityScamReport } from '../../services/api';
import { ScamAlertItem } from '../../types';

interface DisplayReportItem {
  id: string;
  senderOrNumber: string;
  category: string;
  location: string;
  dateReported: string;
  description: string;
  verifiedCount: number;
  hasUserUpvoted?: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  verificationStatus: 'VERIFIED_ALERT' | 'UNVERIFIED_SUBMISSION' | 'RESOLVED_EXPIRED';
  source: string;
}

const FALLBACK_REPORTS: DisplayReportItem[] = [
  {
    id: 'cr-1',
    senderOrNumber: '+91 92891 04412 (Fake CBI / Mumbai Police)',
    category: 'Digital Arrest Scams',
    location: 'National / Delhi NCR / Mumbai',
    dateReported: '14 minutes ago',
    description: 'Caller in fake police uniform on Skype/WhatsApp claims passport was found in narcotics parcel shipped to Cambodia. Pressures victim into transferring funds for "RBI asset verification".',
    verifiedCount: 142,
    severity: 'CRITICAL',
    verificationStatus: 'VERIFIED_ALERT',
    source: 'I4C Advisory & State Cyber Cell',
  },
  {
    id: 'cr-2',
    senderOrNumber: 'SMS Header: VM-PWRDIS / +91 93108 20194',
    category: 'UPI Payment Scams',
    location: 'Maharashtra / Uttar Pradesh',
    dateReported: '42 minutes ago',
    description: 'Urgent SMS: "Dear consumer, electricity will be disconnected tonight at 9:30 PM due to unpaid bill. Call officer at 93108... immediately." Leads to APK download of screen-stealer.',
    verifiedCount: 89,
    severity: 'HIGH',
    verificationStatus: 'VERIFIED_ALERT',
    source: 'Discom Consumer Warning',
  },
  {
    id: 'cr-3',
    senderOrNumber: 'Telegram: @GlobalTech_Talent_Recruiter',
    category: 'Fake Job and Internship Offers',
    location: 'Pan-India',
    dateReported: '2 hours ago',
    description: 'Recruiter promises ₹150 for liking 3 YouTube videos, pays ₹450 to gain trust, then demands ₹5,000 "crypto merchant deposit" to unlock higher daily earnings.',
    verifiedCount: 215,
    severity: 'HIGH',
    verificationStatus: 'VERIFIED_ALERT',
    source: 'National Cyber Crime Portal',
  },
];

export const CommunityReportsView: React.FC = () => {
  const [reports, setReports] = useState<DisplayReportItem[]>(FALLBACK_REPORTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newSender, setNewSender] = useState('');
  const [newCategory, setNewCategory] = useState('Digital Arrest Scams');
  const [newLocation, setNewLocation] = useState('Pan-India');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAlert, setSubmittedAlert] = useState<string | null>(null);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const res = await fetchScamTrackerFeed({ limit: 30 });
      if (res && res.items && res.items.length > 0) {
        const mapped: DisplayReportItem[] = res.items.map(item => ({
          id: item.id,
          senderOrNumber: item.indicators && item.indicators.length > 0 ? item.indicators[0] : item.title,
          category: item.category,
          location: item.affectedRegion || 'Pan-India',
          dateReported: new Date(item.lastReportedDate).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          description: item.description,
          verifiedCount: item.reportCount || 1,
          severity: item.riskLevel,
          verificationStatus: item.verificationStatus,
          source: item.source,
        }));
        setReports(mapped);
      }
    } catch {
      // Retain fallback reports on network hiccup
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleUpvote = (id: string) => {
    setReports(prev =>
      prev.map(r => {
        if (r.id === id) {
          const upvoted = !r.hasUserUpvoted;
          return {
            ...r,
            hasUserUpvoted: upvoted,
            verifiedCount: upvoted ? r.verifiedCount + 1 : r.verifiedCount - 1,
          };
        }
        return r;
      })
    );
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSender.trim() || !newDesc.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await submitCommunityScamReport({
        title: `Community Warning: ${newSender.trim()}`,
        category: newCategory,
        description: newDesc.trim(),
        indicators: [newSender.trim()],
        affectedRegion: newLocation.trim() || 'Pan-India',
      });

      const newLocalItem: DisplayReportItem = {
        id: res.reportId || `cr-${Date.now()}`,
        senderOrNumber: newSender.trim(),
        category: newCategory,
        location: newLocation.trim() || 'Pan-India',
        dateReported: 'Just now',
        description: newDesc.trim(),
        verifiedCount: 1,
        hasUserUpvoted: true,
        severity: 'HIGH',
        verificationStatus: 'UNVERIFIED_SUBMISSION',
        source: 'ScamShield Community Submission',
      };

      setReports(prev => [newLocalItem, ...prev]);
      setNewSender('');
      setNewDesc('');
      setShowSubmitModal(false);
      setSubmittedAlert('Report recorded! Placed under community radar marked as UNVERIFIED SUBMISSION.');
      setTimeout(() => setSubmittedAlert(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit community report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = reports.filter(r =>
    r.senderOrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Crowdsourced Cyber Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Community <span className="text-cyan-400">Scam Reports</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time fraud warnings submitted and correlated by citizens across regions. New user submissions are clearly designated as unverified until multiple independent reports match.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadFeed}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Refresh Live Feed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Scam Report</span>
            </button>
          </div>
        </div>
      </div>

      {submittedAlert && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{submittedAlert}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by phone number, sender ID, location, or keyword (e.g. 'CBI', 'Electricity', 'Telegram')..."
          className="w-full bg-[#0B132B]/80 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
        />
      </div>

      {/* Report Cards Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0B132B]/40 border border-slate-800 text-center text-slate-400 text-xs italic">
            No community reports matching &quot;{searchTerm}&quot;.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800/80 space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs text-white">
                    {item.senderOrNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {item.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    item.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {item.severity}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                    item.verificationStatus === 'VERIFIED_ALERT'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950/80 text-amber-300 border-amber-800'
                  }`}>
                    {item.verificationStatus === 'VERIFIED_ALERT' ? 'Verified Advisory' : 'Unverified Community Submission'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{item.dateReported}</span>
                  <span>•</span>
                  <span>{item.location}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{item.verifiedCount} citizens correlated this incident</span>
                  <span className="text-slate-500 ml-2">({item.source})</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpvote(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    item.hasUserUpvoted
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{item.hasUserUpvoted ? 'Confirmed' : 'I also encountered this'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-400" />
                <span>Submit New Community Scam Report</span>
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
              <strong>Notice:</strong> Submissions are ingested into ScamShield community intelligence with status <code>UNVERIFIED_SUBMISSION</code> until reviewed or matched by multiple independent victims. Do not submit sensitive passwords or banking PINs.
            </div>

            <form onSubmit={handleSubmitNew} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Suspicious Caller ID / Sender Header / Link
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98765 43210, SMS header, or fraudulent domain"
                  value={newSender}
                  onChange={(e) => setNewSender(e.target.value)}
                  className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Scam Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Digital Arrest Scams">Digital Arrest & Police Threat</option>
                    <option value="UPI Payment Scams">UPI Payment & Electricity Threat</option>
                    <option value="Fake Job and Internship Offers">Part-Time Task & Job Scam</option>
                    <option value="Fake Bank Calls">Fake Bank Support & OTP Vishing</option>
                    <option value="Phishing Websites">Phishing Website / Credential Harvest</option>
                    <option value="Delivery and Customs Smishing">Delivery & Customs Smishing</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Affected Region
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Delhi NCR, Maharashtra, Pan-India"
                    className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Description of Threat & Demands
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe what the scammer claimed, demanded funds, APKs sent, or coercion used..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to Threat Radar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
