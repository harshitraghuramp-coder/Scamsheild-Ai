import React, { useState } from 'react';
import { EncyclopediaEntry } from '../../types';
import {
  BookOpen,
  Briefcase,
  Smartphone,
  CreditCard,
  Headphones,
  Key,
  Flame,
  Truck,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  PhoneCall
} from 'lucide-react';

const ENCYCLOPEDIA_ENTRIES: EncyclopediaEntry[] = [
  {
    id: 'voice_vishing_digital_arrest',
    title: 'Phone Vishing & "Digital Arrest" Coercion',
    category: 'Voice Telephony & Law Enforcement',
    iconName: 'phone',
    severity: 'critical',
    summary: 'High-intimidation voice calls where fraudsters impersonate federal police, customs, or bank fraud units, threatening immediate imprisonment or placing victims under fabricated "digital arrest" unless funds are wired to an escrow account.',
    howItWorks: [
      'Victim receives an incoming call from a spoofed government or police department phone number.',
      'Caller claims an international courier parcel with narcotics, weapons, or fake passports was intercepted in the victim\'s name.',
      'The caller transfers to a "senior cyber inspector" on Skype/video call featuring fake police stations and uniforms.',
      'Victim is declared under "Digital Arrest", ordered not to disconnect or alert family, and coerced into transferring their entire bank savings to a "Reserve Bank of India verification holding vault".'
    ],
    telltaleSigns: [
      'Caller claims to have placed you under "Digital Arrest" (this legal concept does not exist anywhere in the world).',
      'Demands that you remain on video/audio line continuously and forbids you from calling family or lawyers.',
      'Instructs you to liquidate fixed deposits, mutual funds, or bank accounts to "verify financial integrity".',
      'Caller threatens immediate physical arrest by local police unless money is transferred within hours.'
    ],
    exampleMessage: '"This is Inspector Sharma from Narcotics Cyber Cell. An arrest warrant has been signed against you for money laundering. You are under Digital Arrest. Do not disconnect this line. Transfer 4,50,000 rupees to the government verification account immediately to avoid imprisonment."',
    attackerTactics: ['Extreme Intimidation', 'Fabricated Authority', 'Isolation', 'Time Compression Panic'],
    countermeasures: [
      'Hang up immediately. No legitimate police, FBI, or court holds online trials or demands deposits over video.',
      'Never transfer funds to any "government safe vault" or "verification escrow" account.',
      'Call the official local police precinct directly using a verified public phone directory.'
    ]
  },
  {
    id: 'internship_fraud',
    title: 'Fraudulent Internship & Task Scams',
    category: 'Employment & Career',
    iconName: 'briefcase',
    severity: 'critical',
    summary: 'Predatory schemes targeting students and jobseekers with fake remote offers, advance fees, or small payouts for trivial tasks that escalate into crypto deposit traps.',
    howItWorks: [
      'Unsolicited recruiter contact on LinkedIn, WhatsApp, or Telegram offering high pay ($30-$80/hr) with no technical interview.',
      'Victim is directed to a Telegram channel for "task training" (e.g. liking YouTube videos or booking hotel reviews).',
      'Initial micro-payouts ($10-$30) build trust to induce the illusion of legitimate work.',
      'The "manager" demands a "refundable deposit" or equipment fee ($150-$2,000) for training materials or laptops, which is permanently stolen.'
    ],
    telltaleSigns: [
      'Interviews conducted exclusively over Telegram or WhatsApp text chat.',
      'Recruiter uses a free webmail address (@gmail.com) rather than corporate email.',
      'Demands candidate pay for background checks, laptops, or software licenses upfront.',
      'Offers guaranteed exorbitant salaries for low-skill remote data entry.'
    ],
    exampleMessage: '"Congratulations! You are selected for our Remote Junior Analyst role at $3,500/month. Please message HR Director @ApexRecruiter on Telegram to receive your MacBook equipment dispatch form. A $150 registration deposit is required."',
    attackerTactics: ['Greed', 'Sunk Cost Fallacy', 'Isolation from Corporate Verification'],
    countermeasures: [
      'Verify the job opening directly on the organization\'s official careers portal.',
      'Never send money, buy gift cards, or deposit crypto for a job offer.',
      'Search the recruiter\'s name on LinkedIn and contact the corporate HR department.'
    ]
  },
  {
    id: 'pig_butchering',
    title: 'Pig Butchering (Sha Zhu Pan) & Crypto Fraud',
    category: 'Investment & Romance',
    iconName: 'creditcard',
    severity: 'critical',
    summary: 'Long-con financial fraud orchestrated by organized transnational crime rings who groom victims through romance or friendship before introducing a fraudulent investment exchange.',
    howItWorks: [
      'Scammer initiates contact via a "wrong number" SMS, dating app, or LinkedIn connection.',
      'Builds emotional rapport and trust over weeks without mentioning money.',
      'Casually shares screenshots of huge profits from crypto trading or liquidity mining.',
      'Guides the victim to deposit funds onto a rigged exchange app that displays fabricated gains.',
      'When victim attempts to withdraw funds, the platform demands exorbitant "tax fees", then cuts contact.'
    ],
    telltaleSigns: [
      'Stranger claims to have dialed wrong number, but insists on continuing friendly conversation.',
      'Claims to possess inside information on cryptocurrency arbitrage or forex algorithms.',
      'Directs victim to download trading apps outside official Google Play or Apple App Store.',
      'Refuses in-person meetings or live video calls.'
    ],
    exampleMessage: '"Hi Thomas, sorry to bother you! My assistant gave me this number for our golf tee time. Oh, you are not Thomas? What a pleasant coincidence! I am Chloe, managing a DeFi investment desk in Singapore..."',
    attackerTactics: ['False Intimacy', 'Greed', 'Social Isolation', 'Emotional Blackmail'],
    countermeasures: [
      'Never invest money based on advice from online contacts you have not met in person.',
      'Verify exchange platforms with regulatory bodies (CFTC, SEC, FCA).',
      'Cut contact immediately if an online acquaintance asks you to transfer cryptocurrency.'
    ]
  },
  {
    id: 'bank_kyc_smishing',
    title: 'Bank KYC & Account Suspension Smishing',
    category: 'Banking & Financial',
    iconName: 'smartphone',
    severity: 'critical',
    summary: 'Automated SMS messages mimicking major retail banks (Chase, Wells Fargo, BofA) warning of immediate account suspension to harvest online banking passwords and 2FA tokens.',
    howItWorks: [
      'Attacker sends mass SMS using spoofed sender IDs or alphanumeric headers.',
      'Message warns of an urgent unauthorized charge, frozen debit card, or expired KYC compliance.',
      'Victim clicks the embedded shortened link leading to an exact replica of the bank\'s login screen.',
      'A reverse-proxy backend intercepts credentials and immediately requests the SMS OTP to complete bank transfer.'
    ],
    telltaleSigns: [
      'Extreme artificial urgency ("Action required within 12 hours").',
      'URL has misspelled brand names or non-standard TLDs (.top, .xyz, .click).',
      'SMS asks you to click a link to cancel a transaction rather than calling the official number on your debit card.'
    ],
    exampleMessage: '"BANK ALERT: Your account is scheduled for termination due to unverified KYC documents. Prevent immediate card suspension by updating your credentials at: https://chase-online-account-unlock.top/auth"',
    attackerTactics: ['Fear of Financial Loss', 'Panic Inducement', 'Authority Impersonation'],
    countermeasures: [
      'Never click links in bank SMS messages.',
      'Always type the bank\'s official URL directly into your browser or use the official mobile app.',
      'Call the phone number printed on the back of your physical debit or credit card.'
    ]
  },
  {
    id: 'fake_customer_support',
    title: 'Fake Tech Support & Bogus Invoice Scams',
    category: 'Impersonation & Device Takeover',
    iconName: 'headphones',
    severity: 'critical',
    summary: 'Deceptive invoices for subscriptions (Geek Squad, Norton, McAfee, PayPal) tricking victims into calling fake call centers that coerce victims into installing remote desktop malware.',
    howItWorks: [
      'Victim receives an email receipt claiming hundreds of dollars were debited for a tech subscription.',
      'The receipt prominent displays a "Toll-Free Dispute Helpline".',
      'When called, the fake support agent claims they can issue an immediate refund.',
      'Agent instructs victim to install AnyDesk or TeamViewer to connect to their PC.',
      'Agent edits HTML in the browser to make it appear an extra $5,000 was refunded by accident, demanding victim return the "difference" via cash, wire, or gift cards.'
    ],
    telltaleSigns: [
      'Email claims automatic renewal for software you never bought.',
      'Support agent insists on remote access into your PC to issue a financial refund.',
      'Support agent becomes hostile, frantic, or tells you to keep the call secret from your bank teller.'
    ],
    exampleMessage: '"Geek Squad #INV-4921: Your annual protection plan renewed for $499.00. If you did not authorize this auto-debit, call our billing desk immediately at +1-888-492-0193 to cancel."',
    attackerTactics: ['Manufactured Debt Panic', 'Hostile Device Takeover', 'Intimidation'],
    countermeasures: [
      'Never call phone numbers listed in unverified renewal emails.',
      'Check your actual bank statement; if no pending charge exists, delete the email.',
      'Never allow unsolicited callers to install remote desktop software on your device.'
    ]
  },
  {
    id: 'package_delivery_smishing',
    title: 'Postal & Package Delivery Smishing',
    category: 'Logistics & Retail',
    iconName: 'truck',
    severity: 'high',
    summary: 'Fake parcel notices claiming customs fees or incomplete street addresses to harvest payment cards and sign victims up for recurring unauthorized subscriptions.',
    howItWorks: [
      'Victim receives SMS purporting to be USPS, FedEx, DHL, or Royal Mail.',
      'Claims a package is held at a regional sorting warehouse due to missing house numbers or a $2.49 redelivery fee.',
      'The link directs to a postal tracking lookalike that prompts for full address and credit card info.',
      'Card details are stolen and used for fraudulent charges or dark-web sale.'
    ],
    telltaleSigns: [
      'SMS received when you haven\'t ordered a package or from a random 10-digit consumer phone number.',
      'Link uses non-official domains (e.g. usps-tracking-package-redelivery.buzz instead of usps.com).',
      'Demands credit card payment for a package you were already expecting with free shipping.'
    ],
    exampleMessage: '"USPS Notice: Your shipment #940019 cannot be delivered due to an incorrect postal address. Please update your details and settle customs fee ($2.49) within 12h: https://usps-redelivery.xyz"',
    attackerTactics: ['Curiosity Bait', 'Convenience Exploitation', 'Low Price Anchor ($2 fee)'],
    countermeasures: [
      'Track shipments only using the tracking number copied into the official carrier website (usps.com, fedex.com).',
      'Remember that genuine carriers leave a physical paper notice on your door for failed deliveries.'
    ]
  },
  {
    id: 'quishing_scams',
    title: 'Quishing (Malicious QR Code Phishing)',
    category: 'Physical & Digital Hybrid',
    iconName: 'qrcode',
    severity: 'high',
    summary: 'Replacing legitimate QR codes on parking meters, restaurants, EV chargers, or corporate emails with stickers pointing to credential-stealing or payment-rerouting websites.',
    howItWorks: [
      'Attacker pastes a printed QR code sticker over authentic municipal parking payment meters or restaurant table codes.',
      'Victim scans the code expecting a payment portal.',
      'The camera opens a phishing portal that captures credit card credentials or prompts downloading malicious configuration profiles.'
    ],
    telltaleSigns: [
      'Physical QR code is clearly a sticker placed over another surface.',
      'Scanning the QR code opens an unrecognized domain rather than the municipal or vendor app.',
      'Demands unnecessary account creation or app installation to view a simple menu or pay a meter.'
    ],
    exampleMessage: '"Scan here to pay parking fee via contactless mobile portal. Avoid immediate municipal towing fine."',
    attackerTactics: ['Frictionless Scanning', 'URL Obscuration', 'Urgency at Point of Service'],
    countermeasures: [
      'Check if the QR code is a sticker peeling over the original sign.',
      'Preview the full URL shown by your phone camera before tapping.',
      'Use official city parking apps downloaded directly from app stores.'
    ]
  }
];

export const EncyclopediaView: React.FC = () => {
  const [selectedEntry, setSelectedEntry] = useState<EncyclopediaEntry>(ENCYCLOPEDIA_ENTRIES[0]);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>Scam Defense Encyclopedia</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Comprehensive forensic breakdown of the most dangerous online fraud vectors active today. Learn how attackers weaponize psychology, social engineering, and technical deception.
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation List */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1 mb-2">
            Select Threat Vector:
          </span>

          {ENCYCLOPEDIA_ENTRIES.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                selectedEntry.id === entry.id
                  ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,229,255,0.15)] text-white'
                  : 'bg-[#0B132B]/60 border-slate-800 text-slate-300 hover:bg-[#0B132B] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    selectedEntry.id === entry.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{entry.title}</div>
                  <div className="text-[11px] text-slate-400">{entry.category}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                    entry.severity === 'critical'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      : 'bg-orange-500/15 border-orange-500/30 text-orange-300'
                  }`}
                >
                  {entry.severity}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </button>
          ))}
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-7 space-y-5 p-6 rounded-2xl bg-[#0B132B]/80 border border-cyan-500/20 backdrop-blur-md">
          {/* Header */}
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                {selectedEntry.category}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                {selectedEntry.severity} Severity
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {selectedEntry.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              {selectedEntry.summary}
            </p>
          </div>

          {/* Real-World Bait Sample */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Real-World Bait Sample:</span>
            </span>
            <blockquote className="text-xs font-mono text-slate-200 bg-slate-900/60 p-3 rounded-lg border-l-2 border-rose-500 italic leading-relaxed">
              {selectedEntry.exampleMessage}
            </blockquote>
          </div>

          {/* How the attack unfolds */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              How the Attack Unfolds:
            </h4>
            <div className="space-y-2">
              {selectedEntry.howItWorks.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Telltale Red Flags */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Telltale Forensic Red Flags:
            </h4>
            <ul className="space-y-1.5">
              {selectedEntry.telltaleSigns.map((sign, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Manipulation Tactics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              Psychological Manipulation Applied:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedEntry.attackerTactics.map((tactic, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-950/60 border border-indigo-700/50 text-indigo-300"
                >
                  {tactic}
                </span>
              ))}
            </div>
          </div>

          {/* Defensive Countermeasures */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Recommended Countermeasures:</span>
            </h4>
            <ul className="space-y-1.5">
              {selectedEntry.countermeasures.map((cm, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>{cm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
