import React, { useState, useRef, useEffect } from 'react';
import { analyzePhoneCallApi } from '../../services/api';
import { AnalysisResult } from '../../types';
import {
  PhoneCall,
  Mic,
  MicOff,
  Sparkles,
  RefreshCw,
  AlertCircle,
  X,
  RotateCcw,
  ShieldAlert,
  Zap,
  PhoneIncoming,
  Volume2
} from 'lucide-react';

interface PhoneCallScannerProps {
  onScanComplete: (result: AnalysisResult, inputSnippet: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
}

const SAMPLE_CALLS = [
  {
    title: 'Police Narcotics & Digital Arrest',
    badge: 'Police Impersonation',
    context: 'police_law_enforcement',
    callerId: '+91 22 2262 0111 (Spoofed Police HQ)',
    transcript: `Caller: "This is Inspector Vijay Rathore from the Narcotics Control Bureau, Cyber Cell Headquarters. Am I speaking with the registered owner of this mobile number?"
Victim: "Yes, who is this?"
Caller: "A consignment dispatched under your Aadhaar and passport number from FedEx Mumbai to Taiwan was intercepted. It contains 16 fake passports, 5 bank passbooks, and 250 grams of MDMA narcotics. A non-bailable arrest warrant has been issued against you under the NDPS Act."
Victim: "I never sent any parcel! This must be a mistake!"
Caller: "You are placed under immediate Digital Arrest. You are forbidden to disconnect this call or contact anyone. Connect to Skype video immediately for biometric statement recording. To clear your financial integrity, you must liquidate your bank savings and transfer 3,50,000 rupees to the Reserve Bank of India verification escrow account right now."`,
  },
  {
    title: 'Bank Fraud Dept & OTP Phishing',
    badge: 'Bank Vishing',
    context: 'bank_fraud_dept',
    callerId: '+1 (800) 935-9935 (Spoofed Chase)',
    transcript: `Caller: "Hello, this is Marcus Vance calling from Chase Bank Enterprise Fraud Prevention Unit. We have detected a suspicious real-time debit card authorization of $849.50 at an Apple Store in Miami, Florida. Did you authorize this transaction?"
Victim: "No! I am in Chicago right now!"
Caller: "Understood, ma'am. We are initiating an emergency block on your debit card. To cancel this charge and block the merchant terminal, our automated security system has just generated a 6-digit one-time cancellation token to your mobile phone. Do not hang up. Please read back that 6-digit code to me now so I can reverse the transfer."`,
  },
  {
    title: 'Tech Support Screen Takeover',
    badge: 'Remote Access Scam',
    context: 'tech_support_call',
    callerId: '+1 (888) 492-0193 (Toll Free)',
    transcript: `Caller: "Warning alert! This is Senior Network Engineer Alex from Microsoft Windows Global Security Department. Our central telemetry servers are receiving continuous malicious Trojan malware alerts from your personal Windows machine."
Victim: "How do you know my machine is infected?"
Caller: "Your unique Windows License ID has been compromised and is broadcasting unauthorized banking botnet traffic. Press the Windows key plus R on your keyboard right now. Type 'anydesk.com' and click Run. Our certified engineer will take remote control of your computer to flush the hackers out of your registry and verify your online banking is safe."`,
  },
  {
    title: 'IRS Tax Arrest & Gift Card Extortion',
    badge: 'Govt Extortion',
    context: 'government_tax_customs',
    callerId: '+1 (202) 555-0149 (Washington DC)',
    transcript: `Caller: "This is Officer David Robinson from the Internal Revenue Service Criminal Investigation Division. There is a federal indictment and tax evasion audit filed under your Social Security Number for unpaid back taxes totaling $4,850."
Victim: "I already filed my taxes this year through my CPA!"
Caller: "Your CPA miscalculated. A federal magistrate has signed an arrest warrant. If you do not resolve this balance in the next 45 minutes, two county sheriff deputies will arrive at your workplace to take you into custody. Stay on the line, drive to the nearest Target or Walmart, purchase five $500 Apple Gift Cards as a temporary federal bond, and read the serial numbers to me over the phone."`,
  },
  {
    title: 'AI Voice Clone Family Emergency',
    badge: 'Voice Clone Bail',
    context: 'family_emergency_bail',
    callerId: 'Unknown / Blocked Caller',
    transcript: `[Crying voice sounding identical to grandson]: "Grandma? Grandma, please help me! I'm in terrible trouble! Please don't tell mom and dad..."
Victim: "Michael? Is that you? What happened?!"
[Deep voice interrupts]: "Ma'am, this is Public Defender Arthur Miller. Your grandson was a passenger in a vehicle that was involved in an accident. The police found illegal contraband in the trunk and he is currently detained at the county precinct. The judge has set cash bail at $7,500. You need to withdraw cash immediately. A bonded courier will arrive at your residence to collect the bail envelope within the hour."`,
  },
  {
    title: 'Recruiter Work-From-Home Fee',
    badge: 'Job Fraud Call',
    context: 'job_recruiter_call',
    callerId: '+1 (415) 880-9214 (San Francisco)',
    transcript: `Caller: "Good afternoon! I am Jessica from Apex Talent Partners. We reviewed your resume online and you have been accepted for an immediate remote Executive Assistant position at $55 per hour with full health benefits."
Victim: "I don't recall applying, but that sounds great."
Caller: "The position starts this Monday. We will be mailing you a company check for $3,500 to purchase your dedicated home office server and encrypted laptop. However, our company policy requires you to pay a one-time refundable courier insurance fee of $185 via Zelle or Apple Cash before we can dispatch the welcome package. Can you send that now while we are on the line?"`,
  },
];

export const PhoneCallScanner: React.FC<PhoneCallScannerProps> = ({
  onScanComplete,
  isLoading,
  setIsLoading,
  setError,
}) => {
  const [transcript, setTranscript] = useState('');
  const [callerId, setCallerId] = useState('');
  const [callerContext, setCallerContext] = useState('general');
  const [bypassCache, setBypassCache] = useState(false);
  const [scanStage, setScanStage] = useState('Analyzing voice transcript...');
  const [isRecording, setIsRecording] = useState(false);
  const [sttSupported, setSttSupported] = useState(true);
  const [sttStatus, setSttStatus] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Setup Web Speech API for speech-to-text dictation
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSttSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setSttStatus('Listening... Speak the caller dialogue clearly.');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript((prev) => (prev ? prev + ' ' : '') + event.results[i][0].transcript);
          } else {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        if (currentTranscript) {
          setSttStatus(`Transcribing: "${currentTranscript.slice(-40)}"`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setSttStatus('Microphone permission was denied. Please allow microphone access or paste transcript.');
        } else {
          setSttStatus(`Speech recognition stopped: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setSttStatus((prev) => (prev?.includes('denied') ? prev : null));
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition setup error:', e);
      setSttSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!sttSupported || !recognitionRef.current) {
      setError('Live speech-to-text is not supported in this browser. Please type or paste the call dialogue directly.');
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(err);
      }
      setIsRecording(false);
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsRecording(false);
      }
    }
  };

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!transcript.trim()) {
      setError('Please enter, record, or paste a phone call transcript or conversation dialogue.');
      return;
    }
    if (transcript.trim().length < 5) {
      setError('Call transcript is too short to evaluate. Please provide more dialogue context.');
      return;
    }

    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsRecording(false);
    }

    setError(null);
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setScanStage('Inspecting voice social engineering & intimidation patterns...');
    const stageTimer1 = setTimeout(() => {
      setScanStage('Evaluating bank OTP, digital arrest, and extortion vectors...');
    }, 450);

    const stageTimer2 = setTimeout(() => {
      setScanStage('Synthesizing risk level and emergency counter-measures...');
    }, 950);

    try {
      const result = await analyzePhoneCallApi(
        transcript.trim(),
        callerContext,
        callerId.trim() || undefined,
        bypassCache,
        controller.signal
      );
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      onScanComplete(result, transcript);
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      if (err.name === 'AbortError') {
        console.log('Phone scan request cancelled by user');
        return;
      }
      console.error('Phone scan error:', err);
      setError(err.message || 'Failed to inspect phone call transcript. Please try again.');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setError('Scan was cancelled.');
    }
  };

  const loadSample = (sample: typeof SAMPLE_CALLS[0]) => {
    setTranscript(sample.transcript);
    setCallerContext(sample.context);
    setCallerId(sample.callerId);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#091024] border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                AI Voice & Phone Call Scam Analyzer
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                NEW VISHING SHIELD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Detect fake bank calls, digital arrest extortion, OTP theft, and voice cloning in phone conversations.
            </p>
          </div>
        </div>

        {/* Live Speech-to-Text Button */}
        {sttSupported && (
          <button
            type="button"
            onClick={toggleRecording}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-900/50'
                : 'bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 text-white" />
                <span>Stop Dictation</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-cyan-400" />
                <span>Dictate / Live Audio</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Dictation Status Banner */}
      {sttStatus && (
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400 shrink-0 animate-bounce" />
            <span className="font-mono">{sttStatus}</span>
          </div>
          <button
            type="button"
            onClick={() => setSttStatus(null)}
            className="text-cyan-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Presets Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <PhoneIncoming className="w-3.5 h-3.5 text-cyan-400" />
            Test Real-World Phone Scam Scenarios:
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">Click any scenario to load dialogue</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SAMPLE_CALLS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(sample)}
              className="p-3 text-left rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 hover:bg-[#0E1A38] transition group cursor-pointer"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {sample.title}
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-300 shrink-0">
                  {sample.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono line-clamp-2">
                "{sample.transcript.slice(0, 95)}..."
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleScan} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Caller Context Hint */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-300 flex items-center gap-1.5">
              <span>Caller Claim / Scenario Context:</span>
            </label>
            <select
              value={callerContext}
              onChange={(e) => setCallerContext(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
            >
              <option value="general">Auto-Detect / General Phone Conversation</option>
              <option value="police_law_enforcement">Police / Narcotics / Digital Arrest Threat</option>
              <option value="bank_fraud_dept">Bank Security / Fraud Dept / OTP Verification</option>
              <option value="tech_support_call">Microsoft / Apple / Tech Support Remote Access</option>
              <option value="government_tax_customs">IRS / Tax / Customs Seizure Threat</option>
              <option value="family_emergency_bail">Family Kidnap / Emergency Bail (Voice Clone)</option>
              <option value="job_recruiter_call">Work-From-Home Recruiter / Upfront Fee</option>
            </select>
          </div>

          {/* Caller ID / Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-300 flex items-center gap-1.5">
              <span>Caller ID or Number Displayed (Optional):</span>
            </label>
            <input
              type="text"
              value={callerId}
              onChange={(e) => setCallerId(e.target.value)}
              placeholder="e.g. +1 (800) 935-9935, 'Restricted', or Unknown"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition"
            />
          </div>
        </div>

        {/* Call Transcript Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="font-mono uppercase text-slate-300 flex items-center gap-1.5">
              <span>Phone Call Dialogue or Transcript:</span>
              <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500">
                {transcript.length} characters
              </span>
              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  className="text-[11px] text-slate-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={6}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste what the caller said, or describe the phone call interaction...
Example: 'Caller claimed to be Officer Sharma from Mumbai Police. Said a parcel with contraband was booked under my name and demanded I stay on the line and transfer money to RBI verification account.'"
              className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 text-sm font-sans leading-relaxed transition resize-none"
            />

            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-[11px] font-mono text-rose-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Recording Speech...</span>
              </div>
            )}
          </div>
        </div>

        {/* Cache Bypass and Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={bypassCache}
              onChange={(e) => setBypassCache(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Bypass Cache (Force Live AI Re-Analysis)</span>
          </label>

          <div className="flex items-center gap-3">
            {isLoading && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl border border-rose-500/40 hover:bg-rose-950/30 text-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !transcript.trim()}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isLoading || !transcript.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                  <span>{scanStage}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Analyze Call for Vishing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
