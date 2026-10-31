import React, { useState } from 'react';
import {
  LifeBuoy,
  AlertTriangle,
  KeyRound,
  CreditCard,
  MonitorX,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  Lock,
  WifiOff
} from 'lucide-react';

interface EmergencyScenario {
  id: string;
  title: string;
  icon: any;
  severity: 'critical' | 'high';
  first60Seconds: string[];
  actionSteps: string[];
  preventativeMeasures: string[];
}

const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  {
    id: 'targeted_phone_call',
    title: 'I received a coercive scam call (police digital arrest or bank fraud)',
    icon: PhoneCall,
    severity: 'critical',
    first60Seconds: [
      'HANG UP IMMEDIATELY. Do not apologize, argue, or ask for their badge number. Terminate the connection right away.',
      'Do not panic. "Digital arrest" is a completely fictitious concept created by organized cybercrime syndicates.',
      'If you were coerced into staying on Skype or video, close the application and disconnect your camera.'
    ],
    actionSteps: [
      'If you transferred funds to a "safe escrow" or "government holding vault", call your bank fraud division immediately to request an emergency wire stop.',
      'If the caller had you install remote software (AnyDesk, TeamViewer), disconnect your Wi-Fi immediately and uninstall the program.',
      'Block the phone number on your mobile handset and carrier account.',
      'File an immediate cyber fraud report with the FTC (ReportFraud.ftc.gov) or your national cybercrime portal.'
    ],
    preventativeMeasures: [
      'Remember: Authentic police, court officers, and bank fraud managers NEVER interrogate citizens on Skype or demand funds over the phone.'
    ]
  },
  {
    id: 'entered_credentials',
    title: 'I entered my password or banking login on a suspicious site',
    icon: KeyRound,
    severity: 'critical',
    first60Seconds: [
      'DO NOT use the compromised device to change passwords if you suspect keyloggers. Use a separate smartphone or trusted computer.',
      'Log into your official banking or email provider immediately from the clean device and change your master password.',
      'Select "Log out of all other sessions / devices" in your account security settings.'
    ],
    actionSteps: [
      'Contact your bank\'s 24/7 emergency fraud hotline (call the number on the back of your physical card).',
      'Request a temporary freeze on wire transfers, Zelle, and debit card transactions.',
      'Switch your two-factor authentication from SMS to an authenticator app (Google Authenticator, Bitwarden, or YubiKey).',
      'Check account forwarding rules and recovery email addresses to ensure attackers did not add backdoors.'
    ],
    preventativeMeasures: [
      'Enable passkeys or FIDO2 hardware security keys which are cryptographically immune to reverse-proxy phishing.',
      'Use a password manager that autofills credentials ONLY on verified root domains.'
    ]
  },
  {
    id: 'shared_otp',
    title: 'I shared an OTP, PIN, or 2FA code with someone',
    icon: Lock,
    severity: 'critical',
    first60Seconds: [
      'The attacker is currently using that code right now. Immediately call your bank or service provider fraud division.',
      'Tell the operator: "I inadvertently provided a one-time verification code to a suspected social engineering attacker. Please freeze all outgoing funds immediately."'
    ],
    actionSteps: [
      'Request that the bank cancel any newly registered beneficiaries or external linked accounts.',
      'Change your telephone carrier account PIN to prevent SIM swapping.',
      'Review recent transaction ledger for unauthorized pending debits.'
    ],
    preventativeMeasures: [
      'Remember: No authentic bank representative will ever ask you to read back a verification code.'
    ]
  },
  {
    id: 'sent_money_or_crypto',
    title: 'I transferred funds, crypto, or bought gift cards for a scammer',
    icon: CreditCard,
    severity: 'critical',
    first60Seconds: [
      'If sent via bank wire or credit card, call your bank immediately to request a wire recall or fraud chargeback.',
      'If paid via gift cards, call the gift card issuer (Apple, Google, Steam) immediately with the serial numbers. If the funds have not yet been drained from the card balance, the merchant can freeze the redemption.'
    ],
    actionSteps: [
      'Document all transaction hashes, wallet addresses, chat transcripts, phone numbers, and recipient names.',
      'File an official report with the FBI IC3 (Internet Crime Complaint Center) and the FTC (ReportFraud.ftc.gov).',
      'Beware of "Recovery Scammers" who contact you claiming they can hack the blockchain and recover your funds for a fee. NO ONE can reverse blockchain transactions.'
    ],
    preventativeMeasures: [
      'Treat irreversible payment channels (Crypto, Gift Cards, Western Union) with zero trust.'
    ]
  },
  {
    id: 'installed_remote_tool',
    title: 'I installed AnyDesk, TeamViewer, or allowed screen access',
    icon: MonitorX,
    severity: 'critical',
    first60Seconds: [
      'IMMEDIATELY turn off Wi-Fi or unplug your computer\'s Ethernet cable to sever the remote attacker\'s connection.',
      'Power off the computer if you suspect files are actively being transferred.'
    ],
    actionSteps: [
      'Uninstall AnyDesk, TeamViewer, UltraViewer, or Zoho Assist from your applications list.',
      'Boot into Safe Mode and run a full system scan using Windows Defender or Malwarebytes.',
      'From a separate clean device, change your banking and email passwords immediately.',
      'Check your downloads folder and delete any recent .exe, .dmg, or .bat scripts downloaded during the session.'
    ],
    preventativeMeasures: [
      'Never allow unsolicited tech support agents to control your desktop.'
    ]
  },
  {
    id: 'clicked_link_only',
    title: 'I clicked a suspicious link but did NOT enter any information',
    icon: AlertTriangle,
    severity: 'high',
    first60Seconds: [
      'Close the browser tab immediately.',
      'Check your browser\'s downloads manager (Ctrl+J or Cmd+Shift+J) to verify no automatic payload or APK was downloaded.'
    ],
    actionSteps: [
      'Clear browser cookies, cache, and site permissions for that domain.',
      'Ensure your mobile OS and web browser are updated with the latest security patches.',
      'Be alert for an increase in targeted follow-up phishing calls or SMS.'
    ],
    preventativeMeasures: [
      'Use DNS-level content filtering (e.g. Cloudflare 1.1.1.2 for Families or Quad9) to block malicious hosts automatically.'
    ]
  }
];

export const EmergencyPlaybookView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(EMERGENCY_SCENARIOS[0].id);

  const selectedScenario = EMERGENCY_SCENARIOS.find((s) => s.id === activeTab) || EMERGENCY_SCENARIOS[0];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-rose-400" />
            <span>Emergency Incident Response Playbook</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immediate tactical steps if you suspect your account, credentials, or device have been compromised.
          </p>
        </div>
        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold shrink-0">
          First 60 Seconds Protocol
        </span>
      </div>

      {/* Scenario Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {EMERGENCY_SCENARIOS.map((scenario) => {
          const IconComp = scenario.icon;
          const isActive = activeTab === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => setActiveTab(scenario.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] text-white'
                  : 'bg-[#0B132B]/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <IconComp className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-500'}`} />
                <span className="text-[10px] uppercase font-mono font-bold text-rose-400">
                  {scenario.severity}
                </span>
              </div>
              <div className="text-xs font-semibold line-clamp-2">
                {scenario.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Action Checklist */}
      <div className="p-6 rounded-2xl bg-[#0B132B]/90 border border-rose-500/30 backdrop-blur-md space-y-6">
        <div>
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block mb-1">
            Immediate Response Protocol:
          </span>
          <h3 className="text-xl font-bold text-white">
            {selectedScenario.title}
          </h3>
        </div>

        {/* First 60 Seconds Urgent Box */}
        <div className="p-5 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-3 cyber-glow-red">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>The First 60 Seconds (Act Now):</span>
          </div>
          <div className="space-y-2">
            {selectedScenario.first60Seconds.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-rose-100">
                <span className="w-5 h-5 rounded-full bg-rose-500/30 text-rose-200 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  !
                </span>
                <span className="leading-relaxed font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Steps */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Remediation Checklist:
          </h4>
          <div className="space-y-2">
            {selectedScenario.actionSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200">
                <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prevention */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5 text-xs text-slate-300">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">
            Future Hardening:
          </span>
          {selectedScenario.preventativeMeasures.map((pm, idx) => (
            <p key={idx} className="text-slate-300">• {pm}</p>
          ))}
        </div>
      </div>

      {/* Official Reporting Hotlines Card */}
      <div className="p-6 rounded-2xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <PhoneCall className="w-4 h-4" />
          Official Cybercrime Reporting Portals & Hotlines
        </h3>
        <p className="text-xs text-slate-400">
          Reporting scams helps federal agencies seize malicious infrastructure, blacklist phishing domains, and initiate asset freezes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white">FBI IC3</div>
            <div className="text-slate-400 text-[11px]">Internet Crime Complaint Center</div>
            <div className="font-mono text-cyan-400 text-[11px]">ic3.gov</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white">FTC Fraud Reporting</div>
            <div className="text-slate-400 text-[11px]">Federal Trade Commission</div>
            <div className="font-mono text-cyan-400 text-[11px]">reportfraud.ftc.gov</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white">Google Safe Browsing</div>
            <div className="text-slate-400 text-[11px]">Phishing Domain Takedown</div>
            <div className="font-mono text-cyan-400 text-[11px]">safebrowsing.google.com</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white">APWG Phishing Desk</div>
            <div className="text-slate-400 text-[11px]">Anti-Phishing Working Group</div>
            <div className="font-mono text-cyan-400 text-[11px]">reportphishing@apwg.org</div>
          </div>
        </div>
      </div>
    </div>
  );
};
