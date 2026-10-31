import React, { useState, useRef, useEffect } from 'react';
import { analyzeMessageApi } from '../../services/api';
import { AnalysisResult } from '../../types';
import { ShieldAlert, Sparkles, RefreshCw, AlertCircle, Send, X, RotateCcw, Zap } from 'lucide-react';

interface MessageScannerProps {
  onScanComplete: (result: AnalysisResult, inputSnippet: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
}

const SAMPLE_SCAMS = [
  {
    title: 'Fake Internship Offer',
    badge: 'Job Scam',
    category: 'job_offer',
    text: `Congratulations! Your profile has been shortlisted for our Remote Software Engineering Internship at Global Tech Innovations.

Stipend: $2,800/month (Remote).
Hours: Flexible 15-20 hrs/week.

To finalize onboarding and dispatch your official company MacBook Pro & ergonomic workstation, contact HR Director Sarah Davis immediately on Telegram: @GlobalTech_Sarah_HR.

Note: You are required to submit a refundable equipment deposit of $150 via USDT (TRC-20) or Apple Gift Card before 5:00 PM today to guarantee dispatch.`,
  },
  {
    title: 'Bank KYC Urgent SMS',
    badge: 'Smishing',
    category: 'sms_whatsapp',
    text: `URGENT BANK ALERT: Your Online Banking profile has been flagged for unauthorized access from an unrecognized device in Frankfurt, Germany.

Your checking and savings accounts will be permanently locked within 24 hours to prevent fraud.

Restore your verified status and update KYC credentials immediately at:
https://chase-online-account-unlock.top/verify?auth=79102

Do not ignore. Case ID: #98421-US.`,
  },
  {
    title: 'Geek Squad Invoice Scam',
    badge: 'Fake Support',
    category: 'customer_support',
    text: `INVOICE CONFIRMATION #GS-9940182
Date: October 30, 2026
Merchant: Geek Squad Total Tech Care & Network Security

Dear Valued Customer,
Your annual subscription for Total Protection 360 has auto-renewed successfully.
Amount Debited: $499.00 USD
Payment Method: Auto-debit from your registered checking account.

If you did not authorize this charge or wish to dispute and receive a full refund, please call our 24/7 Billing Helpline immediately at: +1 (888) 492-0193.
Our support agents will assist you in installing AnyDesk to reverse the bank transfer.`,
  },
  {
    title: 'USPS Package Hold Fee',
    badge: 'Postal Phishing',
    category: 'sms_whatsapp',
    text: `USPS NOTICE: Your package with tracking #US9400192842 has arrived at our regional distribution center but cannot be dispatched due to an incomplete delivery address and an unpaid customs handling fee of $2.49.

Please verify your street address and settle the fee within 12 hours or the package will be returned to the international sender:
https://usps-tracking-package-redelivery.buzz/claim`,
  },
  {
    title: 'Webcam Blackmail / Extortion',
    badge: 'Extortion',
    category: 'email',
    text: `I have bad news for you. Several months ago, I infected your operating system with Pegasus spyware through an exploit in your web browser.

I gained full remote access to your device, recorded footage from your webcam while you were visiting adult websites, and downloaded all your contacts, email conversations, and social media passwords.

I have compiled a split-screen video of you. If you do not want this video sent to all your family, coworkers, and contacts, transfer exactly $1,500 worth of Bitcoin (BTC) to my wallet address within 48 hours:
bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`,
  },
  {
    title: 'WhatsApp Pig Butchering',
    badge: 'Crypto Fraud',
    category: 'sms_whatsapp',
    text: `Hello David! Are you still joining us for golf this Sunday at Pebble Beach? Oh, I'm so sorry, is this not David? My assistant must have entered the wrong phone number!

Anyway, it's fate that we connected. I am Jessica from Singapore, managing an algorithmic crypto arbitrage fund in New York. We're earning guaranteed 18% weekly returns on gold-backed tokens through a private liquidity pool. Let's chat on WhatsApp!`,
  },
];

export const MessageScanner: React.FC<MessageScannerProps> = ({
  onScanComplete,
  isLoading,
  setIsLoading,
  setError,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [bypassCache, setBypassCache] = useState(false);
  const [scanStage, setScanStage] = useState<string>('Checking message patterns...');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up any in-flight request when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleCancelScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setError('Scan was cancelled.');
  };

  const handleScan = async (forceBypass = false) => {
    if (!content.trim() || content.trim().length < 3) {
      setError('Please enter or paste a message (at least 3 characters) to inspect.');
      return;
    }

    // Cancel any previous in-flight scan
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setError(null);
    setIsLoading(true);
    setScanStage('Checking message patterns...');

    // Stage progression without fake percentage bars
    const timer1 = setTimeout(() => {
      setScanStage('Evaluating suspicious indicators...');
    }, 350);

    const timer2 = setTimeout(() => {
      setScanStage('Preparing your safety report...');
    }, 1100);

    try {
      const result = await analyzeMessageApi(
        content.trim(),
        category,
        forceBypass || bypassCache,
        abortController.signal
      );
      onScanComplete(result, content.trim());
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Scan request aborted by user');
        return;
      }
      console.error('Scan failed:', err);
      setError(err.message || 'Failed to inspect message. Check connection and try again.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleApplySample = (sample: (typeof SAMPLE_SCAMS)[0]) => {
    if (isLoading) return;
    setContent(sample.text);
    setCategory(sample.category);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          <span>Message Source / Context</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'general', label: 'Auto-Detect' },
            { id: 'job_offer', label: 'Internship / Job' },
            { id: 'sms_whatsapp', label: 'SMS / WhatsApp' },
            { id: 'bank_payment', label: 'Bank / Payment' },
            { id: 'customer_support', label: 'Tech Support' },
            { id: 'email', label: 'Phishing Email' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={isLoading}
              onClick={() => setCategory(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50 ${
                category === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Text Area */}
      <div className="relative rounded-2xl border border-slate-800 bg-[#0B132B]/80 focus-within:border-cyan-500/50 focus-within:cyber-glow-cyan transition-all">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste suspicious email text, WhatsApp message, SMS, job offer letter, or payment request here...&#10;&#10;e.g. 'Congratulations! You are shortlisted for an internship, please message HR on Telegram and pay equipment fee...'"
          rows={7}
          className="w-full bg-transparent p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-y min-h-[160px] leading-relaxed"
          disabled={isLoading}
        />

        {/* Live scanning stage banner if loading */}
        {isLoading && (
          <div className="px-4 py-2.5 bg-cyan-950/40 border-t border-cyan-800/40 flex items-center justify-between text-xs text-cyan-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span className="font-medium font-mono">{scanStage}</span>
            </div>
            <button
              type="button"
              onClick={handleCancelScan}
              className="text-slate-400 hover:text-rose-400 text-[11px] underline font-sans cursor-pointer"
            >
              Cancel Scan
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl text-xs">
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>{content.length} characters</span>
            {content.length > 0 && !isLoading && (
              <button
                type="button"
                onClick={() => setContent('')}
                className="hover:text-rose-400 transition cursor-pointer font-sans"
              >
                Clear
              </button>
            )}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-300 font-sans">
              <input
                type="checkbox"
                checked={bypassCache}
                onChange={(e) => setBypassCache(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 w-3 h-3 cursor-pointer"
              />
              <span className="text-[11px]">Bypass Cache</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <button
                type="button"
                onClick={handleCancelScan}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-500/40 bg-rose-950/30 hover:bg-rose-900/40 text-xs font-bold text-rose-300 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleScan(false)}
                disabled={isLoading || !content.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-200 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Inspect Message</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preset Scam Library */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Real-World Scam Preset:</span>
          </span>
          <span className="text-[11px] text-slate-500">Fast-tested against cached & heuristic rules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SAMPLE_SCAMS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleApplySample(sample)}
              className="text-left p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/80 transition group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 group-hover:bg-cyan-950">
                  {sample.badge}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                {sample.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
