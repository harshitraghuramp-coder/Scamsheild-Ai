import React, { useState } from 'react';
import {
  Shield,
  PhoneCall,
  MessageSquare,
  Globe,
  FileImage,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  ExternalLink,
  Target,
  Compass,
  Mic,
  Server,
  Lock,
  Radio,
  ArrowRight
} from 'lucide-react';

interface ProjectCoverageViewProps {
  onNavigateToScanner?: (subTab: 'message' | 'url' | 'screenshot' | 'phone') => void;
}

export const ProjectCoverageView: React.FC<ProjectCoverageViewProps> = ({ onNavigateToScanner }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'phone' | 'message' | 'url' | 'screenshot'>('all');

  const coverageMatrix = [
    {
      id: 'phone',
      channel: 'Phone Calls & Voice Vishing',
      icon: PhoneCall,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      threats: [
        'Fake Bank Fraud Department calls & OTP extortion',
        'Police / Narcotics / Customs "Digital Arrest" scams',
        'Unsolicited Microsoft/Apple tech support screen takeover',
        'IRS / Tax evasion arrest & gift card demand calls',
        'AI voice cloning family emergency & bail extortion',
        'Work-from-home job recruiter upfront fee calls',
      ],
      heuristics: [
        'Voice social engineering pattern matching (urgency, intimidation, isolation)',
        'OTP / PIN / CVV verbal solicitation traps',
        'Government "safe account" / escrow fund transfer keywords',
        'Remote desktop utility triggers (AnyDesk, TeamViewer)',
        'Spoofed caller ID and restricted number risk weighing',
      ],
      aiForensics: [
        'Gemini 3.8 Flash low-latency speech dialogue classification',
        'Psychological pressure and coercion intent detection',
        'Authority impersonation credibility scoring',
        'Contextual emergency action recommendations',
      ],
      remediation: [
        'Immediate hang-up directives',
        'Public official phone number lookup guidance',
        'Network disconnect for remote access software',
        'Carrier number blocking and FTC report generation',
      ],
      status: 'Live & Operational',
    },
    {
      id: 'message',
      channel: 'Messages, Emails & SMS',
      icon: MessageSquare,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/40',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
      threats: [
        'Fake internship & work-from-home offers demanding deposits',
        'Urgent bank KYC suspension & account lock smishing',
        'Postal package undelivered customs fee smishing (USPS, FedEx)',
        'Pegasus spyware webcam sextortion & crypto blackmail',
        'WhatsApp / Telegram romance & crypto liquidity pools',
        'Geek Squad / Norton auto-renewal invoice traps',
      ],
      heuristics: [
        'Token analysis for Telegram HR redirects & deposit requests',
        'Crypto address detection (BTC, ETH, TRC20)',
        'Embedded URL extraction with cross-modular safety audit',
        'Account termination urgency & countdown clock triggers',
        'Gift card and wire transfer payment indicators',
      ],
      aiForensics: [
        'Semantic scam type categorization across 14 vectors',
        'Grammatical and synthetic phrasing anomaly scoring',
        'Psychological manipulation tactic cataloging',
        'Targeted vulnerability assessment',
      ],
      remediation: [
        'Official institution verification protocol',
        'Do-not-reply rules & anti-engagement guidance',
        'Financial institution fraud report generation',
        'Evidence preservation checklist',
      ],
      status: 'Live & Operational',
    },
    {
      id: 'url',
      channel: 'URLs & Deceptive Domains',
      icon: Globe,
      color: 'text-indigo-400',
      borderColor: 'border-indigo-500/40',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
      threats: [
        'Punycode & lookalike homograph attacks (e.g. рaypal vs paypal)',
        'High-risk suspicious top-level domains (.top, .buzz, .rest)',
        'Credential harvesting phishing portals & cloned bank logins',
        'Brand spoofing in subdomains (chase.login-secure.xyz)',
        'Multi-stage open redirects & obfuscated IP hostnames',
      ],
      heuristics: [
        'Shannon character entropy calculation on hostname',
        'Excessive subdomain depth and IP address host detection',
        'Known high-risk TLD reputation penalties',
        'Hyphen density and brand typosquatting distance checks',
        'Real-time IOC signature lookup in Threat Intel database',
      ],
      aiForensics: [
        'Domain intent & context analysis against known brand trademarks',
        'Deceptive path inspection and masquerading evaluation',
        'Phishing kit fingerprint identification',
      ],
      remediation: [
        'Browser tab closure & cache clearing directives',
        'Credential change alert if password was previously entered',
        'Google Safe Browsing & registrar abuse report links',
      ],
      status: 'Live & Operational',
    },
    {
      id: 'screenshot',
      channel: 'Screenshots & Visual Proof',
      icon: FileImage,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      threats: [
        'Fake bank transfer confirmation receipts & altered wire slips',
        'Spoofed WhatsApp and iMessage chat screenshots',
        'Phishing web page mockups and fake password dialogs',
        'Counterfeit tech support popups and blue screen warnings',
        'Fraudulent job recruitment letters with fake corporate logos',
      ],
      heuristics: [
        'Client-side Tesseract.js optical character recognition (OCR)',
        'Extracted text pipelined to deterministic scam checker',
        'Entity extraction (amounts, contact numbers, crypto wallets)',
      ],
      aiForensics: [
        'Gemini Multimodal Vision inspection of UI layouts and branding',
        'Visual mismatch detection between claimed brand and visual styling',
        'Cross-examination of extracted text and visual design cues',
      ],
      remediation: [
        'Bank statement cross-verification instructions',
        'Official HR portal inquiry guide',
        'Reverse image verification and file deletion advice',
      ],
      status: 'Live & Operational',
    },
  ];

  const filteredMatrix =
    activeFilter === 'all' ? coverageMatrix : coverageMatrix.filter((c) => c.id === activeFilter);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* 1. PROJECT OVERVIEW */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cybersecurity Architecture & Project Blueprint</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            SCAMSHIELD <span className="text-cyan-400">AI</span>
            <span className="block text-lg font-sans font-normal text-slate-300 mt-1">
              "Think Before You Click. Think Before You Speak."
            </span>
          </h1>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            <p>
              <strong>ScamShield AI</strong> is a full-stack, AI-powered cybersecurity defense platform built to protect everyday users and organizations from the modern spectrum of digital fraud. Rather than relying on simple blacklist lookup tables, ScamShield AI combines deterministic heuristic rules, live threat intelligence signatures, and Gemini AI forensic reasoning.
            </p>
            <p>
              In addition to inspecting <strong>phishing messages, fraudulent job offers, malicious URLs, and deceptive screenshots</strong>, ScamShield AI provides advanced <strong>AI-Powered Phone Call & Voice Vishing Scam Detection</strong>. The platform identifies social engineering manipulation tactics (such as panic inducement, intimidation, impersonation, and isolation) in real-time conversations, explains exactly <em>why</em> content appears dangerous, and prescribes immediate, life-saving containment steps.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-xl font-mono font-bold text-cyan-400">4</span>
              <p className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">Attack Vectors</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-xl font-mono font-bold text-emerald-400">&lt;5ms</span>
              <p className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">Median Latency</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-xl font-mono font-bold text-blue-400">148K+</span>
              <p className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">Active Signatures</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-xl font-mono font-bold text-purple-400">100%</span>
              <p className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">Zero Telemetry</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAJOR FEATURES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
            Major System Features
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#0B132B]/70 border border-cyan-500/30 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm font-mono">
              <PhoneCall className="w-4 h-4" />
              <span>AI-Powered Phone Call Scam Detection</span>
              <span className="ml-auto text-[10px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded">NEW</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Analyzes incoming phone call dialogues, voice messages, and vishing transcripts. Flags digital arrest coercion, fake law enforcement narcotics seizures, bank OTP solicitations, tech support screen capture traps, and voice-cloned kidnapping scams.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B132B]/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm font-mono">
              <MessageSquare className="w-4 h-4" />
              <span>Message & Email Phishing Scanner</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deep inspection of text messages, emails, and chat messages. Automatically extracts embedded URLs, identifies Telegram recruiters demanding deposits, flags crypto blackmail, and detects spoofed bank KYC suspensions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B132B]/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm font-mono">
              <Globe className="w-4 h-4" />
              <span>URL Security & Typosquatting Checker</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Performs Shannon entropy analysis, checks punycode homographs, evaluates suspicious top-level domains, unpacks credential harvester structures, and cross-references live threat intelligence indicators.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B132B]/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-mono">
              <FileImage className="w-4 h-4" />
              <span>Multimodal Screenshot Scanner</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Accepts screenshots of text messages, receipts, invoices, and popups. Combines client-side Tesseract.js OCR with Gemini multimodal visual reasoning to detect deceptive visual cues and fraudulent invoice charges.
            </p>
          </div>
        </div>
      </div>

      {/* 3. UNIQUENESS & ARCHITECTURAL ADVANTAGES */}
      <div className="p-6 rounded-3xl bg-[#091024] border border-cyan-500/20 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
            Uniqueness: Multi-Channel Protection
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold font-mono">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Full Omni-Channel Coverage</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unlike single-purpose tools (browser extensions for URLs or SMS spam filters), ScamShield AI protects across all <strong>4 primary threat channels: Voice, Text, Web, and Visuals</strong> in a single cohesive dashboard.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold font-mono">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Deterministic + AI Hybrid Engine</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sub-5ms deterministic rules guarantee zero-latency immediate detection for high-severity threat signatures, while Gemini 3.8 Flash provides nuanced contextual reasoning with graceful circuit-breaker fallback.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold font-mono">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Zero-Telemetry & Safe Caching</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              User messages, phone numbers, and call transcripts are never permanently stored on servers. Audit history remains exclusively on the client device, while cache keys use one-way SHA-256 hashes.
            </p>
          </div>
        </div>
      </div>

      {/* 4. TECHNOLOGY STACK & PLANNED SPEECH-TO-TEXT INTEGRATION */}
      <div className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
            Technology Stack & Integrations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase">Frontend Architecture</h3>
            <ul className="text-xs text-slate-300 space-y-1 font-mono">
              <li>• React 19 + TypeScript</li>
              <li>• Vite 8 SPA</li>
              <li>• Tailwind CSS v4</li>
              <li>• Lucide Icons & Motion</li>
              <li>• Progressive Web App (PWA)</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase">Backend & Performance</h3>
            <ul className="text-xs text-slate-300 space-y-1 font-mono">
              <li>• Node.js + Express + tsx</li>
              <li>• Zod Strict Schema Validation</li>
              <li>• SHA-256 In-Memory Cache</li>
              <li>• Request Coalescing (Singleflight)</li>
              <li>• AI Circuit Breaker (2.5s SLA)</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase">AI & Forensics</h3>
            <ul className="text-xs text-slate-300 space-y-1 font-mono">
              <li>• Gemini 3.8 Flash (Thinking: LOW)</li>
              <li>• Strict JSON Structured Outputs</li>
              <li>• Client-side Tesseract.js OCR</li>
              <li>• Native URL Entropy Parsing</li>
              <li>• 148K+ Signature Threat Feed</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/40 bg-cyan-950/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-cyan-300 uppercase">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>Speech-to-Text Integration</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Currently operational with browser-native <strong>Web Speech API</strong> for live speech-to-text dictation.
            </p>
            <p className="text-[11px] text-cyan-300 font-mono mt-1">
              <strong>Planned Integration:</strong> Server-side streaming Whisper/Gemini multimodal audio API for direct live call audio stream interception and telephony webhook bridging.
            </p>
          </div>
        </div>
      </div>

      {/* 5. PROJECT COVERAGE TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
                Comprehensive Project Coverage Table
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Detailed threat vectors, heuristic detection layers, AI forensics, and containment protocols across all 4 channels.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                activeFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Channels (4)
            </button>
            <button
              onClick={() => setActiveFilter('phone')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                activeFilter === 'phone'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Phone Calls
            </button>
            <button
              onClick={() => setActiveFilter('message')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                activeFilter === 'message'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveFilter('url')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                activeFilter === 'url'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              URLs
            </button>
            <button
              onClick={() => setActiveFilter('screenshot')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                activeFilter === 'screenshot'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Screenshots
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredMatrix.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className={`p-6 rounded-2xl bg-[#0B132B]/90 border ${item.borderColor} space-y-4 shadow-lg backdrop-blur-md transition-all`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <IconComponent className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                        {item.channel}
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${item.badgeColor}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {onNavigateToScanner && (
                    <button
                      onClick={() => onNavigateToScanner(item.id as any)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 transition cursor-pointer"
                    >
                      <span>Launch Scanner</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
                  {/* Threats */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="font-mono uppercase font-bold text-rose-400 text-[11px] block">
                      Targeted Threat Vectors
                    </span>
                    <ul className="space-y-1.5 text-slate-300 leading-snug">
                      {item.threats.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 shrink-0 font-bold">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Heuristic Checks */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="font-mono uppercase font-bold text-amber-400 text-[11px] block">
                      Heuristic & Deterministic Checks
                    </span>
                    <ul className="space-y-1.5 text-slate-300 leading-snug">
                      {item.heuristics.map((h, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 shrink-0 font-bold">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Forensics */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="font-mono uppercase font-bold text-cyan-400 text-[11px] block">
                      AI Forensics & Semantic Model
                    </span>
                    <ul className="space-y-1.5 text-slate-300 leading-snug">
                      {item.aiForensics.map((a, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-cyan-400 shrink-0 font-bold">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Remediation */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="font-mono uppercase font-bold text-emerald-400 text-[11px] block">
                      Safety Remediation & Actions
                    </span>
                    <ul className="space-y-1.5 text-slate-300 leading-snug">
                      {item.remediation.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 shrink-0 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. FUTURE SCOPE */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#0E1A38] to-[#070B14] border border-cyan-500/30 space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
            Future Scope & Strategic Roadmap
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold font-mono">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Call Scam Detection</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Direct mobile operating system call screening extension and VoIP SIP trunk integration capable of buffering live voice audio streams and displaying real-time heads-up warning banners during active calls.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Multilingual Voice & Dialect Analysis</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Expanding voice reasoning across 18+ world languages and regional dialects (Hindi, Spanish, Tagalog, Mandarin, Cantonese, Arabic) to counteract geographically tailored extortion rings and digital arrest schemes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold font-mono">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Caller Reputation & STIR/SHAKEN Checks</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Carrier-level STIR/SHAKEN cryptographic attestation lookup, global VoIP provider risk classification, and crowd-sourced community reporting network with instant FBI IC3 and FTC automated filing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
