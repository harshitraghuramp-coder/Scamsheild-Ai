import { RedFlag, TechnicalIndicator, RecommendedAction, RiskLevel, ScamType, ExtractedEntities } from '../types.js';
import { analyzeUrlDeterministic } from './url-checker.js';

interface ScamPattern {
  id: string;
  name: string;
  category: ScamType;
  regex: RegExp;
  weight: number;
  tactics: string[];
  redFlagTitle: string;
  redFlagDescription: string;
}

const KNOWN_SCAM_PATTERNS: ScamPattern[] = [
  // Job & Internship Scams
  {
    id: 'JOB_PAYMENT_UPFRONT',
    name: 'Job / Internship Upfront Fee',
    category: 'Internship & Job Fraud',
    regex: /(registration\s+fee|training\s+deposit|equipment\s+fee|background\s+check\s+fee|deposit\s+required|deposit\s+of\s+(\$|usd)?\s*\d+|pay\s+(\$|usd|inr|eur|crypto)?\s*\d+|(\$|usd)?\s*\d+\s*(refundable\s+)?(deposit|fee))/i,
    weight: 45,
    tactics: ['Greed', 'Advance Fee Trap'],
    redFlagTitle: 'Advance Fee Demanded for Employment',
    redFlagDescription: 'Legitimate employers and internship providers NEVER charge candidates for training, equipment, background checks, or software onboarding.'
  },
  {
    id: 'TELEGRAM_WHATSAPP_HIRING',
    name: 'Off-Platform HR Redirection (Telegram / WhatsApp)',
    category: 'Internship & Job Fraud',
    regex: /(contact\s+.*?(hr|recruiter|manager|director|coordinator).*?(telegram|whatsapp|signal|t\.me|wa\.me)|add\s+@[\w\d_]+|telegram\s*:\s*@[\w\d_]+|@[\w\d_]+\s+on\s+telegram|message\s+\+?\d{8,}\s+on\s+whatsapp)/i,
    weight: 40,
    tactics: ['Isolation', 'Off-Platform Steering'],
    redFlagTitle: 'Recruitment Redirected to Encrypted Chat',
    redFlagDescription: 'Scammers steer candidates away from verifiable email domains or official portals to Telegram/WhatsApp where communication cannot be traced or held accountable by corporate HR.'
  },
  {
    id: 'TASK_SCAM_DAILY_PAY',
    name: 'Unrealistic Pay for Trivial Remote Tasks',
    category: 'Internship & Job Fraud',
    regex: /(earn\s+\$?\d{2,4}\s*(daily|per\s+day|an\s+hour)|part-?time\s+job\s+for\s+(students|anyone)|like\s+(youtube\s+videos|posts|tiktok)|review\s+(hotels|apps|products)\s+for\s+(money|usdt)|simple\s+tasks?\s+earn)/i,
    weight: 40,
    tactics: ['Greed', 'Sunk Cost Manipulation'],
    redFlagTitle: 'Task Scam / Guaranteed High Daily Income',
    redFlagDescription: 'Offers promising hundreds of dollars daily for simple actions like liking videos or clicking reviews are textbook Task Scams designed to entrap victims into depositing cryptocurrency.'
  },

  // Phishing & Credential Theft
  {
    id: 'OTP_PASSWORD_SOLICITATION',
    name: 'OTP / Credential Harvesting',
    category: 'Phishing & Credential Theft',
    regex: /(share|send|provide|verify|confirm|enter)\s+(your\s+)?(otp|one-?time\s+password|security\s+code|2fa\s+code|verification\s+code|pin\s+number|banking\s+password)/i,
    weight: 50,
    tactics: ['Urgency', 'Authority Impersonation'],
    redFlagTitle: 'Explicit OTP or PIN Request',
    redFlagDescription: 'Banks, universities, and legitimate security teams will NEVER solicit your One-Time Password (OTP), security code, or account password.'
  },
  {
    id: 'ACCOUNT_SUSPENSION_URGENCY',
    name: 'Urgent Account Termination Threat',
    category: 'Phishing & Credential Theft',
    regex: /(account|profile|card|access)\s+(will\s+be\s+|has\s+been\s+|is\s+)?(suspended|terminated|frozen|closed|locked)\s*(in|within)?\s*\d*\s*(hours?|hrs?|mins?|minutes?|days?)?|immediate\s+action\s+required\s+to\s+prevent\s+closure|unauthorized\s+(activity|sign-?in|access)\s+detected/i,
    weight: 45,
    tactics: ['Urgency', 'Fear'],
    redFlagTitle: 'Manufactured Account Termination Deadline',
    redFlagDescription: 'Artificial time limits (e.g. "frozen within 24 hours") create panic and induce impulsive clicking before you have time to verify the claim.'
  },

  // Fake Customer Support & Invoices
  {
    id: 'FAKE_INVOICE_REFUND',
    name: 'Bogus Invoice / Auto-Renewal Alert',
    category: 'Fake Customer Support',
    regex: /(geek\s+squad|norton|mcafee|paypal|best\s+buy|crypto\s+desk).*?(auto-?renew(ed|al)?|charged|debited|\$\s*\d{3,4}(\.\d{2})?).*?(call|contact|toll-?free|helpline|\+?1-?8\d{2})/i,
    weight: 45,
    tactics: ['Fear', 'Authority Impersonation'],
    redFlagTitle: 'Unsolicited Auto-Debit Renewal Invoice',
    redFlagDescription: 'Scammers send fake confirmation notices with exorbitant charges to panic you into calling a rogue call center where operators attempt remote desktop compromise.'
  },
  {
    id: 'REMOTE_DESKTOP_ACCESS',
    name: 'Remote Desktop Software Coercion',
    category: 'Fake Customer Support',
    regex: /(install|download|open)\s+(anydesk|teamviewer|ultraviewer|quicksupport|zoho\s+assist|screen\s+share)/i,
    weight: 50,
    tactics: ['Deception', 'Hostile Device Takeover'],
    redFlagTitle: 'Request for Remote Access Software',
    redFlagDescription: 'Legitimate customer support will never cold-call or message you demanding you install AnyDesk or TeamViewer to process a refund or fix security.'
  },

  // Financial & Non-Standard Payment Methods
  {
    id: 'UNCONVENTIONAL_PAYMENT_METHODS',
    name: 'Irreversible Payment Vectors',
    category: 'Financial & Payment Scam',
    regex: /(pay\s+(using|with|via)|buy|purchase)\s+(gift\s*cards?|apple\s*gift\s*cards?|steam\s*cards?|google\s*play\s*cards?|western\s*union|moneygram|bitcoin\s*atm|usdt\s*(trc20|erc20)?)/i,
    weight: 45,
    tactics: ['Anonymity', 'No Chargeback Protection'],
    redFlagTitle: 'Irreversible / Gift Card Payment Demanded',
    redFlagDescription: 'Gift cards, cryptocurrency ATMs, and wire transfers cannot be reversed. Any organization or individual requesting payment via gift cards is a scam.'
  },

  // Package Delivery / Logistics Smishing
  {
    id: 'PACKAGE_DELIVERY_SMISHING',
    name: 'Package Redelivery Fee Bait',
    category: 'Delivery & Customs Smishing',
    regex: /(package|parcel|shipment|delivery)\s+(could\s+not\s+be\s+delivered|held\s+at\s+terminal|incomplete\s+address|requires\s+customs\s+fee|update\s+postal\s+details).*?(http|link|tracking)/i,
    weight: 40,
    tactics: ['Urgency', 'Curiosity Bait'],
    redFlagTitle: 'Postal Smishing (Fake Parcel Hold Notice)',
    redFlagDescription: 'Fraudsters blast automated SMS messages claiming an imaginary package has delivery issues to harvest credit card numbers for "redelivery fees".'
  },

  // Blackmail & Extortion
  {
    id: 'SEXTORTION_PEGASUS_BLACKMAIL',
    name: 'Extortion / Webcam Video Blackmail',
    category: 'Extortion & Blackmail',
    regex: /(recorded\s+you\s+(via|on)\s+(webcam|camera)|compromised\s+your\s+(device|phone|router)|installed\s+(pegasus|trojan|malware)|send\s+\$?\d{3,5}\s*(in|worth\s+of)?\s*(btc|bitcoin)|send\s+to\s+this\s+wallet\s*:\s*[13bc1][a-zA-HJ-NP-Z0-9]{25,62})/i,
    weight: 55,
    tactics: ['Terror', 'Shame & Coercion'],
    redFlagTitle: 'Mass-Blasted Extortion / Webcam Blackmail',
    redFlagDescription: 'Empty threats asserting your webcam recorded compromising footage. These are sent in bulk using leaked password databases with zero actual access to your device.'
  },

  // SMS Family Emergency ("Hi Mum / Dad")
  {
    id: 'FAMILY_EMERGENCY_IMPERSONATION',
    name: 'Impersonation of Family Member',
    category: 'SMS & WhatsApp Fraud',
    regex: /(hi\s+(mum|mom|dad|grandma|grandpa)|this\s+is\s+my\s+new\s+number|i\s+dropped\s+my\s+phone\s+in\s+water|lost\s+my\s+phone.*?(can\s+you\s+pay|urgent\s+bill|need\s+money))/i,
    weight: 45,
    tactics: ['Emotional Manipulation', 'Urgency'],
    redFlagTitle: 'Family Emergency Impersonation Trap',
    redFlagDescription: 'Scammers pretend to be a family member who dropped their phone and urgently needs money to pay an emergency bill before you can verify.'
  }
];

export function extractEntities(text: string): ExtractedEntities {
  // URLs
  const urlRegex = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`\[\]]+/gi;
  const urls = Array.from(new Set(text.match(urlRegex) || []));

  // Emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const emails = Array.from(new Set(text.match(emailRegex) || []));

  // Phone numbers (international and local formats)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phones = Array.from(new Set(text.match(phoneRegex) || []));

  // Payment methods
  const paymentKeywords = [
    'gift card', 'apple card', 'steam card', 'google play', 'bitcoin', 'btc',
    'usdt', 'crypto', 'wire transfer', 'western union', 'moneygram', 'zelle',
    'cash app', 'venmo', 'credit card'
  ];
  const lower = text.toLowerCase();
  const paymentMethods = paymentKeywords.filter((kw) => lower.includes(kw));

  return { urls, emails, phones, paymentMethods };
}

export function analyzeMessageDeterministic(content: string, contextCategory?: string): {
  riskScore: number;
  riskLevel: RiskLevel;
  scamType: ScamType;
  confidence: 'Low' | 'Medium' | 'High';
  summary: string;
  redFlags: RedFlag[];
  psychologicalTactics: string[];
  technicalIndicators: TechnicalIndicator[];
  extractedEntities: ExtractedEntities;
  recommendedActions: RecommendedAction[];
} {
  const redFlags: RedFlag[] = [];
  const technicalIndicators: TechnicalIndicator[] = [];
  const tacticsSet = new Set<string>();
  let baseScore = 0;
  let primaryType: ScamType = 'Low Threat / Informational';

  // Pattern evaluations
  for (const pattern of KNOWN_SCAM_PATTERNS) {
    if (pattern.regex.test(content)) {
      baseScore += pattern.weight;
      redFlags.push({
        title: pattern.redFlagTitle,
        description: pattern.redFlagDescription,
        severity: pattern.weight >= 45 ? 'critical' : 'high'
      });
      technicalIndicators.push({
        type: pattern.id,
        indicator: pattern.name,
        explanation: `Matches established signature for ${pattern.category}`,
        riskWeight: pattern.weight
      });
      pattern.tactics.forEach((t) => tacticsSet.add(t));
      if (primaryType === 'Low Threat / Informational' || pattern.weight >= 45) {
        primaryType = pattern.category;
      }
    }
  }

  // Extract entities
  const entities = extractEntities(content);

  // Link risk multipliers
  if (entities.urls.length > 0) {
    baseScore += 10;
    technicalIndicators.push({
      type: 'CONTAINS_EMBEDDED_LINKS',
      indicator: `${entities.urls.length} link(s) detected`,
      explanation: 'Message incorporates external web links for redirect or landing page capture',
      riskWeight: 15
    });
  }

  // Check for suspicious URL domains inside message
  for (const u of entities.urls) {
    if (/(bit\.ly|tinyurl|is\.gd|t\.co|cutt\.ly|rb\.gy)/i.test(u)) {
      baseScore += 15;
      redFlags.push({
        title: 'URL Shortener Camouflage',
        description: `Link '${u}' uses a URL shortener service to conceal the destination server from security filters.`,
        severity: 'high'
      });
      tacticsSet.add('Obfuscation');
    }

    // Run deterministic URL inspection on the embedded link
    try {
      const urlCheck = analyzeUrlDeterministic(u);
      if (urlCheck.riskScore >= 40) {
        baseScore += Math.round(urlCheck.riskScore * 0.6);
        for (const rf of urlCheck.redFlags) {
          if (!redFlags.some((f) => f.title === rf.title)) {
            redFlags.push(rf);
          }
        }
        for (const ti of urlCheck.technicalIndicators) {
          if (!technicalIndicators.some((t) => t.indicator === ti.indicator)) {
            technicalIndicators.push(ti);
          }
        }
        if (primaryType === 'Low Threat / Informational') {
          primaryType = urlCheck.scamType;
        }
      }
    } catch {
      // Ignore URL parsing errors for conversational strings
    }
  }

  // Cap score to 0 - 100
  const finalScore = Math.min(100, Math.max(0, baseScore));

  let riskLevel: RiskLevel = 'LOW';
  if (finalScore >= 80) riskLevel = 'CRITICAL';
  else if (finalScore >= 55) riskLevel = 'HIGH';
  else if (finalScore >= 25) riskLevel = 'MEDIUM';

  const tactics = Array.from(tacticsSet);

  // Summary generation
  let summary = '';
  if (finalScore >= 75) {
    summary = `CRITICAL WARNING: This message exhibits ${redFlags.length} strong signature(s) of ${primaryType}. The sender is likely using ${tactics.join(', ') || 'psychological pressure'} to execute fraudulent activity or steal credentials.`;
  } else if (finalScore >= 45) {
    summary = `HIGH RISK DETECTED: Multiple indicators suggest a deceptive attempt involving ${primaryType}. Exercise extreme caution and do not follow any external links or contact requests.`;
  } else if (finalScore >= 20) {
    summary = `ELEVATED CAUTION: Some suspicious patterns or solicitation tactics were detected. Confirm authenticity through secondary verified channels before responding.`;
  } else {
    summary = `LOW THREAT PROFILE: No prominent scam signatures were identified in this sample. However, always remain vigilant as modern attackers continually adapt their language.`;
  }

  const recommendedActions: RecommendedAction[] = [];
  if (finalScore >= 50) {
    recommendedActions.push(
      { step: 1, action: 'Do NOT click any links, reply to the message, or provide personal/financial information.', priority: 'immediate' },
      { step: 2, action: 'Never share One-Time Passwords (OTPs), PINs, or verification codes under any circumstance.', priority: 'immediate' },
      { step: 3, action: 'If this claims to be from a company you do business with, navigate directly to their official portal or call their published customer support number.', priority: 'recommended' },
      { step: 4, action: 'Block the sender and report the message as spam/phishing within your email or messaging client.', priority: 'recommended' }
    );
  } else {
    recommendedActions.push(
      { step: 1, action: 'Always inspect the sender address and domain carefully before clicking.', priority: 'recommended' },
      { step: 2, action: 'Maintain two-factor authentication (preferring app-based authenticators or security keys over SMS).', priority: 'optional' }
    );
  }

  return {
    riskScore: finalScore,
    riskLevel,
    scamType: primaryType,
    confidence: redFlags.length > 1 ? 'High' : (redFlags.length === 1 ? 'Medium' : 'Low'),
    summary,
    redFlags,
    psychologicalTactics: tactics,
    technicalIndicators,
    extractedEntities: entities,
    recommendedActions,
  };
}
