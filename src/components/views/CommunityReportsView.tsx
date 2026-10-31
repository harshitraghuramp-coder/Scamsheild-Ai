import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  ThumbsUp,
  PlusCircle,
  Search,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  PhoneCall,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface CommunityReportItem {
  id: string;
  senderOrNumber: string;
  category: string;
  location: string;
  dateReported: string;
  description: string;
  verifiedCount: number;
  hasUserUpvoted?: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

const INITIAL_REPORTS: CommunityReportItem[] = [
  {
    id: 'cr-1',
    senderOrNumber: '+91 92891 04412 (Fake CBI / Mumbai Police)',
    category: 'Digital Arrest & Video Extortion',
    location: 'National / Delhi NCR / Mumbai',
    dateReported: '14 minutes ago',
    description: 'Caller in fake police uniform on Skype/WhatsApp claims passport was found in narcotics parcel shipped to Cambodia. Pressures victim into transferring funds for "RBI asset verification".',
    verifiedCount: 142,
    severity: 'CRITICAL'
  },
  {
    id: 'cr-2',
    senderOrNumber: 'SMS Header: VM-PWRDIS / +91 93108 20194',
    category: 'Electricity Bill Disconnection Scam',
    location: 'Maharashtra / Gujarat / Karnataka',
    dateReported: '42 minutes ago',
    description: 'Urgent SMS: "Dear consumer, electricity will be disconnected tonight at 9:30 PM due to unpaid bill. Call officer at 93108... immediately." Leads to APK download of screen-stealer.',
    verifiedCount: 89,
    severity: 'HIGH'
  },
  {
    id: 'cr-3',
    senderOrNumber: 'Telegram: @GlobalTech_Talent_Recruiter',
    category: 'Part-Time YouTube Like / Hotel Review Fraud',
    location: 'Pan-India',
    dateReported: '2 hours ago',
    description: 'Recruiter promises ₹150 for liking 3 YouTube videos, pays ₹450 to gain trust, then demands ₹5,000 "crypto merchant deposit" to unlock higher daily earnings.',
    verifiedCount: 215,
    severity: 'HIGH'
  },
  {
    id: 'cr-4',
    senderOrNumber: 'https://fedex-customs-duty-clearance.info',
    category: 'Deceptive Delivery Smishing',
    location: 'Bangalore / Hyderabad',
    dateReported: '3 hours ago',
    description: 'SMS claiming package cannot be delivered due to missing house number, demanding ₹25 payment update fee. Harvests CVV and card credentials.',
    verifiedCount: 67,
    severity: 'HIGH'
  }
];

export const CommunityReportsView: React.FC = () => {
  const [reports, setReports] = useState<CommunityReportItem[]>(INITIAL_REPORTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newSender, setNewSender] = useState('');
  const [newCategory, setNewCategory] = useState('Digital Arrest');
  const [newDesc, setNewDesc] = useState('');
  const [submittedAlert, setSubmittedAlert] = useState(false);

  const handleUpvote = (id: string) => {
    setReports(prev =>
      prev.map(r => {
        if (r.id === id) {
          const upvoted = !r.hasUserUpvoted;
          return {
            ...r,
            hasUserUpvoted: upvoted,
            verifiedCount: upvoted ? r.verifiedCount + 1 : r.verifiedCount - 1
          };
        }
        return r;
      })
    );
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSender.trim() || !newDesc.trim()) return;

    const newReport: CommunityReportItem = {
      id: `cr-${Date.now()}`,
      senderOrNumber: newSender.trim(),
      category: newCategory,
      location: 'User Reported (Pending Geo-Tag)',
      dateReported: 'Just now',
      description: newDesc.trim(),
      verifiedCount: 1,
      hasUserUpvoted: true,
      severity: 'HIGH'
    };

    setReports([newReport, ...reports]);
    setNewSender('');
    setNewDesc('');
    setShowSubmitModal(false);
    setSubmittedAlert(true);
    setTimeout(() => setSubmittedAlert(false), 4000);
  };

  const filtered = reports.filter(r =>
    r.senderOrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Crowdsourced Early Warning System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Community <span className="text-cyan-400">Scam Reports</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time fraud warnings submitted and verified by citizens across regions. If you received a suspicious message or call, report it here to protect fellow users.
            </p>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Scam Report</span>
          </button>
        </div>
      </div>

      {submittedAlert && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Report submitted successfully! Added to community threat radar.</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by phone number, sender ID, or scam keyword (e.g. 'CBI', 'Electricity', 'FedEx')..."
          className="w-full bg-[#0B132B]/80 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
        />
      </div>

      {/* Report Cards Feed */}
      <div className="space-y-4">
        {filtered.map((item) => (
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
                <span>{item.verifiedCount} citizens confirmed receiving this</span>
              </div>

              <button
                onClick={() => handleUpvote(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  item.hasUserUpvoted
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{item.hasUserUpvoted ? 'Confirmed' : 'I also got this'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyan-400" />
              <span>Submit New Community Scam Report</span>
            </h2>
            <form onSubmit={handleSubmitNew} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Sender Number / ID / URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210, SMS header, or URL"
                  value={newSender}
                  onChange={(e) => setNewSender(e.target.value)}
                  className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Scam Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Digital Arrest">Digital Arrest & Police Threat</option>
                  <option value="Electricity Disconnection">Electricity / Utility Threat</option>
                  <option value="Part-Time Job">Telegram / Part-Time Job Scam</option>
                  <option value="Bank KYC Smishing">Bank KYC / Account Blocked SMS</option>
                  <option value="Fake Delivery Duty">Courier / Customs Duty Fee</option>
                  <option value="Other Deception">Other Deception Vector</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Description & What the Scammer Claimed
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the threat, what they demanded, links sent, or pressure applied..."
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  Broadcast Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
