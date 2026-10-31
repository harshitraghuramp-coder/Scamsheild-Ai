import React, { useState } from 'react';
import {
  LifeBuoy,
  PhoneCall,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Lock,
  Clock,
  Heart,
  HelpCircle,
  ArrowRight,
  FileText,
  UserCheck,
  Building,
  RefreshCw,
  Send,
  Info,
  ChevronRight,
  WifiOff,
  Flame,
  FileCheck
} from 'lucide-react';

export type EmergencyCategory =
  | 'digital_arrest'
  | 'money_transferred'
  | 'threatening_call'
  | 'extortion_blackmail'
  | 'otp_password_leaked'
  | 'unknown_app_installed'
  | 'fraudulent_payment'
  | 'fake_legal_notice';

interface GuidedAnswers {
  primaryIssue: EmergencyCategory | '';
  threatenedArrest: 'yes' | 'no' | 'not_sure' | '';
  moneyTransferred: 'within_2h' | 'today' | 'days_ago' | 'no' | '';
  sensitiveInfoShared: 'yes_otp_pass' | 'entered_website' | 'no' | '';
  remoteAppInstalled: 'yes' | 'no' | 'not_sure' | '';
  activelyPressured: 'yes_calling_now' | 'messaged_recently' | 'stopped' | '';
}

export const EmergencyHelpView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assistant' | 'call' | 'report'>('dashboard');
  const [selectedScenario, setSelectedScenario] = useState<EmergencyCategory | null>(null);

  // Guided Assistant State
  const [assistantStep, setAssistantStep] = useState<number>(1);
  const [answers, setAnswers] = useState<GuidedAnswers>({
    primaryIssue: '',
    threatenedArrest: '',
    moneyTransferred: '',
    sensitiveInfoShared: '',
    remoteAppInstalled: '',
    activelyPressured: '',
  });

  // Incident Summary Builder State
  const [reportData, setReportData] = useState({
    incidentCategory: 'Financial Fraud & Payment Scam',
    incidentDateTime: new Date().toISOString().slice(0, 16),
    platform: 'WhatsApp / Phone Call',
    suspectPhoneOrId: '',
    suspectUpiOrBank: '',
    amountLost: '',
    transactionIdOrUtr: '',
    victimBank: '',
    narrativeDescription: '',
  });

  const [copiedSummary, setCopiedSummary] = useState(false);

  // 8 Primary Emergency Scenarios
  const EMERGENCY_SCENARIOS = [
    {
      id: 'digital_arrest' as EmergencyCategory,
      title: 'Fake Police / "Digital Arrest" Coercion',
      icon: ShieldAlert,
      badge: 'URGENT COERCION',
      badgeColor: 'bg-rose-950/90 text-rose-300 border-rose-800',
      description: 'Someone claiming to be CBI, Police, Customs, or Court ordering you to stay on video call.',
      immediateAdvice: [
        'DISCONNECT THE CALL IMMEDIATELY. Real police or CBI NEVER arrest anyone via Skype, WhatsApp video, or phone calls.',
        '"Digital arrest" is completely fictitious and does not exist in any legal system.',
        'Do not transfer money to any "RBI reserve account" or "clearing escrow" — these are fraudulent scam accounts.',
        'Call 1930 or report on cybercrime.gov.in right away.',
      ],
    },
    {
      id: 'money_transferred' as EmergencyCategory,
      title: 'Money Transferred / Payment Made',
      icon: Clock,
      badge: 'GOLDEN HOUR',
      badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-800',
      description: 'You sent funds via UPI, NetBanking, IMPS, or Card to an unverified recipient or scammer.',
      immediateAdvice: [
        'CALL 1930 RIGHT NOW. Within the first 2 hours (Golden Hour), the Indian Cybercrime Coordination Centre (I4C) can freeze beneficiary bank accounts before the money is withdrawn by mules.',
        'Call your bank immediately to request an emergency transaction freeze / stop-payment on the transaction ID (UTR).',
        'Preserve your transaction receipt, SMS confirmation, and bank statement.',
      ],
    },
    {
      id: 'otp_password_leaked' as EmergencyCategory,
      title: 'Shared OTP, PIN, or Password',
      icon: Lock,
      badge: 'ACCOUNT COMPROMISE',
      badgeColor: 'bg-cyan-950/90 text-cyan-300 border-cyan-800',
      description: 'You disclosed a one-time verification code, UPI PIN, or NetBanking password to someone.',
      immediateAdvice: [
        'Call your bank helpline immediately and request a complete block on Internet Banking, UPI, and debit cards.',
        'Log in from a clean device and immediately change your banking and email passwords.',
        'Never share any secondary "cancellation" or "refund" OTPs — scammers use them to approve pending drainer transactions.',
      ],
    },
    {
      id: 'unknown_app_installed' as EmergencyCategory,
      title: 'Installed Unknown App or Remote Tool',
      icon: WifiOff,
      badge: 'DEVICE TAKEOVER',
      badgeColor: 'bg-purple-950/90 text-purple-300 border-purple-800',
      description: 'You installed AnyDesk, TeamViewer, RustDesk, or a sideloaded .apk file at the scammer\'s request.',
      immediateAdvice: [
        'TURN ON AIRPLANE MODE or disconnect Wi-Fi and mobile data immediately to cut off the attacker\'s remote session.',
        'Open Settings → Apps and uninstall the remote desktop tool or suspicious APK.',
        'Check Settings → Accessibility and Settings → Device Administrators to revoke any elevated permissions.',
        'Call your bank from a separate phone to lock payment channels.',
      ],
    },
    {
      id: 'extortion_blackmail' as EmergencyCategory,
      title: 'Blackmail, Sextortion or Video Threat',
      icon: Flame,
      badge: 'INTIMIDATION',
      badgeColor: 'bg-rose-950/90 text-rose-300 border-rose-800',
      description: 'Scammer threatens to leak photos, videos, or contact your friends/family if you don\'t pay.',
      immediateAdvice: [
        'DO NOT PAY. Paying never stops extortion — it only signals that you have money and invites higher demands.',
        'Do not delete the chat history. Take screenshots of messages, profile links, and payment handles for police evidence.',
        'Block the blackmailer on all platforms and set your social media profiles to private.',
        'Report immediately to the Cybercrime Portal (https://cybercrime.gov.in) under the Anonymous / Women Cybercrime section.',
      ],
    },
    {
      id: 'threatening_call' as EmergencyCategory,
      title: 'Aggressive / Threatening Call in Progress',
      icon: PhoneCall,
      badge: 'ACTIVE CALL',
      badgeColor: 'bg-orange-950/90 text-orange-300 border-orange-800',
      description: 'Someone is calling right now claiming your courier contains narcotics or your SIM will be deactivated.',
      immediateAdvice: [
        'HANG UP. You are under no legal obligation to speak with unsolicited callers.',
        'Telecom departments (DoT) and courier companies (FedEx, DHL) do not call to threaten arrest or confiscate parcels over the phone.',
        'Block the caller\'s phone number on your handset.',
        'Verify your parcel status directly by visiting the official website of the courier company.',
      ],
    },
    {
      id: 'fraudulent_payment' as EmergencyCategory,
      title: 'Asked to Scan QR Code or Enter PIN to "Receive" Money',
      icon: Shield,
      badge: 'UPI FRAUD',
      badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-800',
      description: 'Buyer on OLX/Marketplace asks you to scan a QR code or enter your UPI PIN to receive payment.',
      immediateAdvice: [
        'STOP. Remember the Golden Rule of UPI: You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money.',
        'Entering your PIN ALWAYS debits (deducts) funds from your account.',
        'Decline the payment request in your UPI app (Google Pay, PhonePe, Paytm).',
      ],
    },
    {
      id: 'fake_legal_notice' as EmergencyCategory,
      title: 'Received Fake Legal Notice / Court Summons',
      icon: FileCheck,
      badge: 'LEGAL TRAP',
      badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-800',
      description: 'You received a PDF on WhatsApp or email with official-looking stamps demanding payment or court appearance.',
      immediateAdvice: [
        'Real courts and enforcement agencies never serve summons or arrest warrants over WhatsApp or personal email.',
        'Do not click links or call numbers written inside the PDF.',
        'Verify case numbers directly on the official e-Courts portal (services.ecourts.gov.in) or visit your local police station.',
      ],
    },
  ];

  // Helper to generate the structured cybercrime report text
  const generateReportSummary = () => {
    return `[CYBERCRIME COMPLAINT DOSSIER - PREPARED VIA SCAMSHIELD AI]
================================================================
Generated: ${new Date().toLocaleString()}
Official Submission Portal: https://cybercrime.gov.in | Helpline: 1930

1. INCIDENT OVERVIEW
- Category: ${reportData.incidentCategory}
- Date & Time: ${reportData.incidentDateTime.replace('T', ' ')}
- Platform / Medium: ${reportData.platform}

2. FINANCIAL LOSS DETAILS
- Total Amount Defrauded: ${reportData.amountLost ? `INR ${reportData.amountLost}` : 'No direct financial loss / attempted fraud'}
- Transaction ID / UTR: ${reportData.transactionIdOrUtr || 'N/A'}
- Victim Bank / App: ${reportData.victimBank || 'N/A'}
- Beneficiary (Scammer) Bank / UPI ID: ${reportData.suspectUpiOrBank || 'N/A'}

3. SUSPECT INFORMATION
- Phone Number / WhatsApp: ${reportData.suspectPhoneOrId || 'N/A'}
- Platform / Handle: ${reportData.platform}

4. CHRONOLOGICAL DESCRIPTION OF THE INCIDENT:
${reportData.narrativeDescription || 'Victim was contacted by the suspect who used deceptive tactics and urgency to solicit funds/credentials.'}

================================================================
NOTE FOR CYBER POLICE / BANK FRAUD TEAM:
This report was prepared by the citizen to facilitate rapid registration under Section 66C/66D of the IT Act. All screenshots, call recordings, and payment receipts have been preserved for investigation.`;
  };

  const handleCopyReport = () => {
    const text = generateReportSummary();
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleDownloadReport = () => {
    const text = generateReportSummary();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cybercrime-Report-${Date.now().toString().slice(-6)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetAssistant = () => {
    setAssistantStep(1);
    setAnswers({
      primaryIssue: '',
      threatenedArrest: '',
      moneyTransferred: '',
      sensitiveInfoShared: '',
      remoteAppInstalled: '',
      activelyPressured: '',
    });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 1. REASSURING EMERGENCY HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/40 bg-gradient-to-br from-[#0B1A24] via-[#091522] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/50 text-[11px] font-mono text-teal-300">
            <Heart className="w-3.5 h-3.5 text-teal-400 fill-teal-400/20" />
            <span>Emergency Cyber Help • Panic-Free Guidance Center</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            You're not alone. <span className="text-teal-300">Stay calm.</span>
            <br />
            We'll help you take the next step.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            If you are being pressured, threatened with arrest, or have transferred money, take a deep breath. Scammers rely on manufactured panic to prevent you from thinking clearly. We provide blameless, immediate first-aid steps to secure your accounts, freeze stolen funds, and prepare official cybercrime reports.
          </p>

          {/* Quick Call-to-Action Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-900/40 transition hover:scale-[1.02] cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-white animate-bounce" />
              <span>Call 1930 (Helpline)</span>
            </a>

            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-500/20 border border-teal-500/40 hover:bg-teal-500/30 text-teal-200 font-bold text-sm transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-teal-400" />
              <span>Report at cybercrime.gov.in</span>
            </a>

            <button
              onClick={() => {
                setActiveTab('assistant');
                resetAssistant();
              }}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-sm font-semibold transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Guided Panic-Free Triage</span>
            </button>
          </div>
        </div>

        {/* Golden Hour Reminder Card */}
        <div className="mt-6 p-4 rounded-2xl bg-[#06101A]/80 border border-teal-500/30 flex items-start gap-3 text-xs text-slate-300">
          <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-white">The "Golden Hour" Protocol: </span>
            If you transferred money within the last <strong>2 hours</strong>, calling <strong>1930</strong> immediately allows the Indian Cyber Crime Coordination Centre (I4C) to trigger automated inter-bank account freezes before scammers can withdraw cash at ATMs.
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[#0B132B]/80 border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Emergency Scenarios</span>
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'assistant'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Panic-Free Guided Assistant</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 font-mono">
            Interactive
          </span>
        </button>

        <button
          onClick={() => setActiveTab('call')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'call'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Official Helplines (1930 / 112)</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'report'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Prepare Incident Dossier</span>
        </button>
      </div>

      {/* 3. TAB CONTENT VIEWS */}

      {/* VIEW A: EMERGENCY SCENARIOS DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                Select What Is Happening
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any situation below to see immediate, life-saving steps designed to stop attackers in their tracks.
              </p>
            </div>
            <span className="text-xs font-mono text-teal-400 hidden sm:inline-block">
              8 Incident Types Covered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EMERGENCY_SCENARIOS.map((scenario) => {
              const IconComp = scenario.icon;
              const isSelected = selectedScenario === scenario.id;
              return (
                <div
                  key={scenario.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 space-y-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0E202C] border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.15)] ring-1 ring-teal-500'
                      : 'bg-[#0B132B]/80 border-slate-800 hover:border-slate-700'
                  }`}
                  onClick={() => setSelectedScenario(isSelected ? null : scenario.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {scenario.title}
                        </h3>
                        <span className={`inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.2 rounded border ${scenario.badgeColor}`}>
                          {scenario.badge}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-teal-400' : ''}`} />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {scenario.description}
                  </p>

                  {/* Expanded Immediate Advice */}
                  {isSelected && (
                    <div className="pt-3 border-t border-slate-800 space-y-3 animate-in fade-in duration-200">
                      <span className="text-[11px] uppercase font-mono font-bold text-teal-300 block">
                        Immediate Action Steps:
                      </span>
                      <div className="space-y-2">
                        {scenario.immediateAdvice.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex flex-wrap gap-2">
                        <a
                          href="tel:1930"
                          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call 1930 Now</span>
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('report');
                            setReportData((prev) => ({
                              ...prev,
                              incidentCategory: scenario.title,
                            }));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-400" />
                          <span>Prepare Complaint Dossier</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW B: PANIC-FREE GUIDED ASSISTANT */}
      {activeTab === 'assistant' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-mono font-bold">
                  Step {assistantStep} of 5
                </span>
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Panic-Free First-Aid Assistant
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Answer these simple questions. There is no judgment here. We will formulate your exact prioritized containment plan.
              </p>
            </div>

            <button
              onClick={resetAssistant}
              className="text-xs font-mono text-slate-400 hover:text-teal-300 transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Triage</span>
            </button>
          </div>

          {/* QUESTION 1 */}
          {assistantStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm sm:text-base font-bold text-white">
                1. What primarily happened?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { id: 'digital_arrest', label: 'Someone claimed I am under "Digital Arrest" or police investigation' },
                  { id: 'money_transferred', label: 'I transferred money / made a payment to someone' },
                  { id: 'otp_password_leaked', label: 'I shared my OTP, banking PIN, or password' },
                  { id: 'extortion_blackmail', label: 'Someone is blackmailing me with videos or private information' },
                  { id: 'unknown_app_installed', label: 'I installed AnyDesk, TeamViewer, or an unknown .apk' },
                  { id: 'fake_legal_notice', label: 'I received a suspicious legal notice, court warrant, or threat' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, primaryIssue: opt.id as EmergencyCategory }));
                      setAssistantStep(2);
                    }}
                    className={`p-4 rounded-2xl border text-left font-medium transition cursor-pointer ${
                      answers.primaryIssue === opt.id
                        ? 'bg-teal-500/20 border-teal-500 text-teal-200'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 2 */}
          {assistantStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm sm:text-base font-bold text-white">
                2. Did someone threaten you with arrest, CBI seizure, or criminal charges?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { val: 'yes', label: 'Yes, they said I am under investigation / arrest' },
                  { val: 'no', label: 'No, there were no police or arrest threats' },
                  { val: 'not_sure', label: 'Not sure / they claimed to be an official authority' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, threatenedArrest: opt.val as any }));
                      setAssistantStep(3);
                    }}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-white text-left font-medium transition cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 3 */}
          {assistantStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm sm:text-base font-bold text-white">
                3. Did you transfer any money or make any payment?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { val: 'within_2h', label: '⚡ YES, within the last 2 hours (Golden Hour!)' },
                  { val: 'today', label: 'YES, earlier today (more than 2 hours ago)' },
                  { val: 'days_ago', label: 'YES, yesterday or a few days ago' },
                  { val: 'no', label: 'NO, I did NOT send any money' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, moneyTransferred: opt.val as any }));
                      setAssistantStep(4);
                    }}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-white text-left font-medium transition cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 4 */}
          {assistantStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm sm:text-base font-bold text-white">
                4. Did you share an OTP, PIN, password, or install AnyDesk?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { val: 'yes_otp_pass', label: 'Yes, I shared an OTP or password verbally / via message' },
                  { val: 'entered_website', label: 'I typed my credentials into a suspicious website / form' },
                  { val: 'installed_app', label: 'I installed AnyDesk, TeamViewer, or an APK file' },
                  { val: 'no', label: 'No, I did not share passwords or install any software' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => {
                      setAnswers((prev) => ({
                        ...prev,
                        sensitiveInfoShared: opt.val.includes('otp') || opt.val.includes('website') ? 'yes_otp_pass' : 'no',
                        remoteAppInstalled: opt.val === 'installed_app' ? 'yes' : 'no',
                      }));
                      setAssistantStep(5);
                    }}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-white text-left font-medium transition cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 5 */}
          {assistantStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm sm:text-base font-bold text-white">
                5. Is the scammer still trying to contact or pressure you right now?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { val: 'yes_calling_now', label: '🔴 Yes, they are actively calling or messaging me' },
                  { val: 'messaged_recently', label: 'They contacted me recently, but not right now' },
                  { val: 'stopped', label: 'No, I disconnected or blocked them' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, activelyPressured: opt.val as any }));
                      setAssistantStep(6); // Go to results!
                    }}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-white text-left font-medium transition cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: CUSTOMIZED ASSISTANT RESULTS */}
          {assistantStep === 6 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-5 rounded-2xl bg-teal-950/40 border border-teal-500/40 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold font-mono text-teal-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Your Tailored Emergency Action Plan</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We have analyzed your answers. Follow these prioritized steps calmly. You have not committed any crime.
                </p>
              </div>

              {/* Priority 1: Immediate Safety & Containment */}
              <div className="space-y-3">
                <span className="text-xs uppercase font-mono font-bold text-rose-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Priority 1: Immediate Next 5 Minutes</span>
                </span>

                <div className="space-y-2 text-xs">
                  {answers.activelyPressured === 'yes_calling_now' && (
                    <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">!</span>
                      <div>
                        <span className="font-bold block">Disconnect the call immediately:</span>
                        <span>Hang up right now. Scammers keep you on the line so you cannot speak to your family or call your bank. Nothing will happen when you disconnect.</span>
                      </div>
                    </div>
                  )}

                  {answers.moneyTransferred === 'within_2h' && (
                    <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">!</span>
                      <div>
                        <span className="font-bold block">Call 1930 immediately (Golden Hour Active):</span>
                        <span>Because the transfer occurred within the last 2 hours, reporting on 1930 right now allows police to freeze the beneficiary account before the scammer withdraws the money.</span>
                        <div className="pt-2">
                          <a href="tel:1930" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs">
                            <PhoneCall className="w-3.5 h-3.5" /> Call 1930 Now
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {answers.remoteAppInstalled === 'yes' && (
                    <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">!</span>
                      <div>
                        <span className="font-bold block">Turn on Airplane Mode immediately:</span>
                        <span>Disconnecting mobile data and Wi-Fi terminates the scammer's remote screen view. Uninstall AnyDesk or TeamViewer once offline.</span>
                      </div>
                    </div>
                  )}

                  {answers.threatenedArrest === 'yes' && (
                    <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/40 text-teal-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                      <div>
                        <span className="font-bold block">Reassurance on "Digital Arrest":</span>
                        <span>There is no such thing as "Digital Arrest" under the Indian Penal Code or CrPC. Real police, CBI, and ED officers do not arrest people over Skype or ask them to transfer money to "reserve funds". You are completely safe from legal arrest.</span>
                      </div>
                    </div>
                  )}

                  {answers.sensitiveInfoShared === 'yes_otp_pass' && (
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">!</span>
                      <div>
                        <span className="font-bold block">Block NetBanking & Cards with your Bank:</span>
                        <span>Call your bank's 24/7 emergency debit/credit card blocking number. Change your NetBanking and email passwords from a safe device.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Priority 2: Evidence & Official Reporting */}
              <div className="space-y-3 pt-2">
                <span className="text-xs uppercase font-mono font-bold text-teal-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>Priority 2: Official Reporting & Documentation</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="font-bold text-white block">Step A: File Official Police Complaint</span>
                    <p className="text-slate-300 leading-relaxed">
                      Register your complaint on the National Cyber Crime Reporting Portal at <strong>cybercrime.gov.in</strong>. An official acknowledgment number will be issued.
                    </p>
                    <a
                      href="https://cybercrime.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 underline font-semibold mt-1"
                    >
                      <span>Open cybercrime.gov.in</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="font-bold text-white block">Step B: Prepare Your Incident Dossier</span>
                    <p className="text-slate-300 leading-relaxed">
                      Use our automated tool to build a structured incident summary with your transaction IDs, timestamps, and suspect phone numbers.
                    </p>
                    <button
                      onClick={() => setActiveTab('report')}
                      className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 underline font-semibold mt-1 cursor-pointer"
                    >
                      <span>Go to Dossier Builder</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  onClick={resetAssistant}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs hover:text-white transition"
                >
                  Start Over
                </button>
                <button
                  onClick={() => setActiveTab('report')}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
                >
                  <span>Build Police Report Summary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW C: OFFICIAL HELPLINES DIRECTORY */}
      {activeTab === 'call' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-teal-400" />
              <span>Official Government & Emergency Helplines</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tap any number below to open your device's dialer directly. All numbers are official government services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1930 Cyber Fraud Helpline */}
            <div className="p-5 rounded-2xl bg-[#0E202C] border border-teal-500/50 space-y-3 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    FINANCIAL FRAUD • INDIA
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">1930</h3>
                  <p className="text-xs text-teal-300 font-semibold">National Cybercrime Helpline</p>
                </div>

                <a
                  href="tel:1930"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-900/30 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 1930</span>
                </a>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800/80 leading-relaxed">
                <p><strong>Operated by:</strong> Ministry of Home Affairs (I4C)</p>
                <p><strong>Purpose:</strong> Immediate reporting of financial fraud, UPI scams, and unauthorized bank debits.</p>
                <p className="text-[11px] text-teal-200">
                  Tip: Have your Bank Account Number, Transaction ID (UTR), and Scammer's UPI / Mobile Number ready when calling.
                </p>
              </div>
            </div>

            {/* 112 National Emergency */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    IMMEDIATE PHYSICAL SAFETY
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">112</h3>
                  <p className="text-xs text-blue-300 font-semibold">National Emergency Response Number</p>
                </div>

                <a
                  href="tel:112"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 112</span>
                </a>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800 leading-relaxed">
                <p><strong>Operated by:</strong> Emergency Response Support System (ERSS)</p>
                <p><strong>Purpose:</strong> If someone is physically threatening your home, or claiming police are arriving at your residence immediately.</p>
              </div>
            </div>

            {/* 1091 Women Cyber Helpline */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    WOMEN & CHILD SAFETY
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">1091</h3>
                  <p className="text-xs text-purple-300 font-semibold">Women Helpline (Harassment & Blackmail)</p>
                </div>

                <a
                  href="tel:1091"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 1091</span>
                </a>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800 leading-relaxed">
                <p><strong>Purpose:</strong> Support for sextortion, non-consensual image sharing, online stalking, and matrimonial scams.</p>
              </div>
            </div>

            {/* 14440 RBI Financial Frauds */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    BANKING COMPLAINTS
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">14440</h3>
                  <p className="text-xs text-slate-300 font-semibold">Reserve Bank of India Helpline</p>
                </div>

                <a
                  href="tel:14440"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 14440</span>
                </a>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800 leading-relaxed">
                <p><strong>Purpose:</strong> Inquiries on banking fraud, unauthorized electronic fund debits, and Banking Ombudsman escalations.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW D: PREPARE STRUCTURED COMPLAINT DOSSIER */}
      {activeTab === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Form: Input Details */}
          <div className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Incident Summary Builder</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Fill in the details you have. This compiles a clean, professional report ready to paste into <strong>cybercrime.gov.in</strong>.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Incident Category</label>
                <select
                  value={reportData.incidentCategory}
                  onChange={(e) => setReportData({ ...reportData, incidentCategory: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-teal-400"
                >
                  <option value="Fake Police / Digital Arrest Coercion">Fake Police / Digital Arrest Coercion</option>
                  <option value="Financial Cyber Fraud (UPI / Bank)">Financial Cyber Fraud (UPI / Bank)</option>
                  <option value="Online Blackmail / Sextortion">Online Blackmail / Sextortion</option>
                  <option value="Fake Customer Care / AnyDesk Takeover">Fake Customer Care / AnyDesk Takeover</option>
                  <option value="Fake Job Offer / Telegram Task Scam">Fake Job Offer / Telegram Task Scam</option>
                  <option value="Courier / Customs Drugs Seizure Call">Courier / Customs Drugs Seizure Call</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Approx. Date & Time</label>
                  <input
                    type="datetime-local"
                    value={reportData.incidentDateTime}
                    onChange={(e) => setReportData({ ...reportData, incidentDateTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Platform Used</label>
                  <input
                    type="text"
                    value={reportData.platform}
                    onChange={(e) => setReportData({ ...reportData, platform: e.target.value })}
                    placeholder="e.g. WhatsApp, Phone Call, Telegram"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Amount Defrauded (INR)</label>
                  <input
                    type="text"
                    value={reportData.amountLost}
                    onChange={(e) => setReportData({ ...reportData, amountLost: e.target.value })}
                    placeholder="e.g. 25000 (leave blank if 0)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-teal-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Transaction ID / UTR</label>
                  <input
                    type="text"
                    value={reportData.transactionIdOrUtr}
                    onChange={(e) => setReportData({ ...reportData, transactionIdOrUtr: e.target.value })}
                    placeholder="12-digit UTR from your bank"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Suspect Phone / ID</label>
                  <input
                    type="text"
                    value={reportData.suspectPhoneOrId}
                    onChange={(e) => setReportData({ ...reportData, suspectPhoneOrId: e.target.value })}
                    placeholder="e.g. +91-9876543210 or handle"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-teal-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Suspect UPI / Bank Account</label>
                  <input
                    type="text"
                    value={reportData.suspectUpiOrBank}
                    onChange={(e) => setReportData({ ...reportData, suspectUpiOrBank: e.target.value })}
                    placeholder="e.g. fraudster@ybl or A/C no"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Chronological Description</label>
                <textarea
                  rows={4}
                  value={reportData.narrativeDescription}
                  onChange={(e) => setReportData({ ...reportData, narrativeDescription: e.target.value })}
                  placeholder="Describe what happened step by step: Who called, what did they claim, what did they ask you to do?"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-teal-400 text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Right Preview & Export */}
          <div className="p-6 rounded-3xl bg-[#070B14] border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-teal-300 uppercase">
                  Formatted Complaint Summary
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Ready for cybercrime.gov.in
                </span>
              </div>

              <textarea
                readOnly
                rows={14}
                value={generateReportSummary()}
                className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 text-[11px] font-mono text-slate-300 leading-relaxed outline-none resize-none select-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopyReport}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-teal-500/20"
                >
                  {copiedSummary ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSummary ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
                </button>

                <button
                  onClick={handleDownloadReport}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Download as text file for police record"
                >
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Download .txt</span>
                </button>
              </div>

              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                <span>Submit Complaint on Official Portal (cybercrime.gov.in)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <p className="text-[10px] text-slate-500 text-center">
                Privacy Assurance: All report details are formatted on your local browser. ScamShield AI never stores your confidential personal records.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
