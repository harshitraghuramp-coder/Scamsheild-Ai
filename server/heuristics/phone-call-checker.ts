import { RedFlag, TechnicalIndicator, RecommendedAction, RiskLevel, ScamType, ExtractedEntities } from '../types.ts';
import { extractEntities } from './message-checker.ts';

interface CallPattern {
  id: string;
  name: string;
  category: ScamType;
  regex: RegExp;
  weight: number;
  tactics: string[];
  redFlagTitle: string;
  redFlagDescription: string;
}

const CALL_SCAM_PATTERNS: CallPattern[] = [
  // 1. Police & Law Enforcement Impersonation ("Digital Arrest")
  {
    id: 'POLICE_NARCOTICS_IMPERSONATION',
    name: 'Police / Law Enforcement Impersonation',
    category: 'Police & Legal Threat Impersonation',
    regex: /(narcotics\s+control|police\s+(officer|inspector|headquarters)|customs\s+(officer|department)|arrest\s+warrant|digital\s+arrest|federal\s+investigation|fbi\s+agent|interpol|parcel\s+intercepted\s+with\s+(drugs|passports|contraband|weapons)|stay\s+on\s+this\s+(call|line|skype|video)|police\s+will\s+arrive\s+at\s+your\s+house)/i,
    weight: 55,
    tactics: ['Intimidation', 'Authority Impersonation', 'Isolation', 'Coercion'],
    redFlagTitle: 'Law Enforcement / Police Impersonation Trap',
    redFlagDescription: 'Police officers and federal law enforcement agencies NEVER interrogate suspects over phone/video calls, NEVER place people under "digital arrest", and NEVER demand funds over the phone.'
  },

  // 2. Bank Voice Phishing (Vishing) & OTP Demands
  {
    id: 'BANK_VISHING_OTP_SOLICITATION',
    name: 'Bank Fraud Department Vishing & OTP Solicitation',
    category: 'Fake Bank Support Call',
    regex: /(calling\s+from\s+(the\s+)?(fraud|security)\s+department|unauthorized\s+(charge|swipe|transaction|debit).*?(confirm|reverse|cancel)|read\s+back\s+(the\s+)?(6-digit|otp|security\s+code|verification\s+code)|tell\s+me\s+your\s+(pin|cvv|security\s+code)|do\s+not\s+hang\s+up\s+while\s+the\s+otp\s+is\s+sent)/i,
    weight: 50,
    tactics: ['Urgency', 'Authority Impersonation', 'Request for Confidential Information'],
    redFlagTitle: 'Voice Solicitation of One-Time Password (OTP)',
    redFlagDescription: 'Legitimate banks NEVER telephone customers to ask for their OTP, PIN, or CVV. The caller is attempting to authorize a fraudulent outgoing transfer using your code.'
  },

  // 3. Safe Government Escrow / Fund Relocation Trap
  {
    id: 'SAFE_ESCROW_ACCOUNT_TRAP',
    name: 'Safe Escrow / "Government Safe Account" Transfer',
    category: 'Financial & Payment Scam',
    regex: /(move|transfer|liquidate|send)\s+(your\s+)?(funds|money|savings|balance)\s+(to\s+a\s+)?(safe|temporary|government|reserve|secure|verified)\s+(account|rbi|escrow|vault|holding\s+account)/i,
    weight: 55,
    tactics: ['Deception', 'False Safety Anchor', 'Urgency'],
    redFlagTitle: 'Instruction to Transfer Funds to "Safe Holding Account"',
    redFlagDescription: 'No legitimate financial institution or government body will ever instruct you to transfer your money to another "safe" or "escrow" account.'
  },

  // 4. Fake Tech Support & Remote Desktop Coercion
  {
    id: 'TECH_SUPPORT_VOICE_TAKEOVER',
    name: 'Tech Support Voice Coercion',
    category: 'Fake Customer Support',
    regex: /(microsoft|windows|apple|geek\s+squad).*?(support|technician).*?(virus|hacked|ip\s+address|trojan).*?(download|open|press\s+windows\s*\+\s*r|install\s+(anydesk|teamviewer|quicksupport|ultraviewer))/i,
    weight: 50,
    tactics: ['Authority Impersonation', 'Intimidation', 'Device Takeover'],
    redFlagTitle: 'Unsolicited Tech Support Screen Takeover',
    redFlagDescription: 'Operating system vendors and retailers never place cold calls to warn about viruses or instruct users to install remote management software.'
  },

  // 5. IRS / Tax / Legal Deficit Threat Call
  {
    id: 'GOVERNMENT_TAX_THREAT_CALL',
    name: 'Government Tax / Legal Threat Call',
    category: 'Extortion & Blackmail',
    regex: /(irs|internal\s+revenue|tax\s+audit|customs\s+fine|unpaid\s+tax\s+deficit).*?(arrest|sheriff|jail|penalty).*?(settle|pay\s+(via|with)|gift\s+card|electronic\s+voucher|wire)/i,
    weight: 50,
    tactics: ['Intimidation', 'Urgency', 'Coercion'],
    redFlagTitle: 'Threat of Immediate Arrest for Tax Deficit',
    redFlagDescription: 'Tax authorities communicate exclusively through postal mail and never threaten immediate arrest over the phone or demand gift cards or electronic transfers.'
  },

  // 6. Kidnapping / AI Voice Cloning Family Bail Emergency
  {
    id: 'FAMILY_BAIL_VOICE_EMERGENCY',
    name: 'Family Emergency / Bail Bond Voice Scam',
    category: 'Phone Call & Voice Vishing',
    regex: /(i\s+was\s+in\s+a\s+(car\s+accident|crash|fight)|police\s+arrested\s+me|need\s+(bail|lawyer|attorney)\s+money|don\'?t\s+tell\s+(mom|dad)|send\s+cash\s+courier|wire\s+\$?\d{3,5})/i,
    weight: 50,
    tactics: ['Emotional Manipulation', 'Urgency', 'Isolation'],
    redFlagTitle: 'High-Urgency Family Emergency / Bail Trap',
    redFlagDescription: 'Attackers (frequently utilizing AI voice clones or emotional panic) claim a family member is injured or jailed to extort immediate cash bail.'
  },

  // 7. Fake Job Recruiter Over-the-Phone Advance Fee
  {
    id: 'PHONE_JOB_ADVANCE_FEE',
    name: 'Job Recruiter Phone Advance Fee',
    category: 'Internship & Job Fraud',
    regex: /(calling\s+for\s+(your\s+)?(job|internship|application)|guarantee\s+\$?\d{2,4}\s*(an\s+hour|daily)|pay\s+(the\s+)?(background|application|training|onboarding)\s+fee\s+over\s+the\s+phone)/i,
    weight: 45,
    tactics: ['Greed', 'Advance Fee Trap'],
    redFlagTitle: 'Employment Fee Solicited Over the Phone',
    redFlagDescription: 'Authentic recruiters never demand candidate payment over the phone for background investigations or onboarding setups.'
  }
];

export function analyzePhoneCallDeterministic(
  transcript: string,
  callerContext?: string,
  callerIdOrNumber?: string
): {
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
  for (const pattern of CALL_SCAM_PATTERNS) {
    if (pattern.regex.test(transcript)) {
      baseScore += pattern.weight;
      redFlags.push({
        title: pattern.redFlagTitle,
        description: pattern.redFlagDescription,
        severity: pattern.weight >= 50 ? 'critical' : 'high'
      });
      technicalIndicators.push({
        type: pattern.id,
        indicator: pattern.name,
        explanation: `Matches established vishing voice signature for ${pattern.category}`,
        riskWeight: pattern.weight
      });
      pattern.tactics.forEach((t) => tacticsSet.add(t));
      if (primaryType === 'Low Threat / Informational' || pattern.weight >= 50) {
        primaryType = pattern.category;
      }
    }
  }

  // Caller ID / Number checks
  if (callerIdOrNumber) {
    const cleanNumber = callerIdOrNumber.replace(/[\s\-\(\)\.]/g, '');
    // Check if international or spoofed format
    if (/^\+?(870|881|882|232|249|260|263)/.test(cleanNumber)) {
      baseScore += 20;
      redFlags.push({
        title: 'High-Risk International Caller ID',
        description: `Caller number '${callerIdOrNumber}' originates from a region known for automated toll-fraud robocalling.`,
        severity: 'high'
      });
      tacticsSet.add('Spoofed Origin');
    }
  }

  // Check for isolation pressure ("do not hang up", "stay on the line", "don't talk to anyone")
  if (/(do\s+not\s+(hang\s+up|disconnect)|stay\s+on\s+the\s+line|don\'?t\s+tell\s+(anyone|your\s+bank|your\s+family)|confidential\s+matter)/i.test(transcript)) {
    baseScore += 20;
    tacticsSet.add('Isolation');
    redFlags.push({
      title: 'Coercive Isolation & Call Continuation Pressure',
      description: 'The caller repeatedly demands that you remain on the line and keep the call secret to prevent you from conferring with trusted family or official bank staff.',
      severity: 'high'
    });
  }

  // Extract entities
  const entities = extractEntities(transcript);

  // Cap score
  const finalScore = Math.min(100, Math.max(0, baseScore));

  let riskLevel: RiskLevel = 'LOW';
  if (finalScore >= 80) riskLevel = 'CRITICAL';
  else if (finalScore >= 55) riskLevel = 'HIGH';
  else if (finalScore >= 25) riskLevel = 'MEDIUM';

  const tactics = Array.from(tacticsSet);

  let summary = '';
  if (finalScore >= 75) {
    summary = `CRITICAL VOICE THREAT: This conversation exhibits severe characteristics of ${primaryType}. The caller is utilizing ${tactics.join(', ') || 'psychological intimidation'} to coerce compliance or elicit sensitive security credentials.`;
  } else if (finalScore >= 45) {
    summary = `HIGH RISK CALL: Significant indicators of social engineering detected (${primaryType}). Do NOT follow the caller's instructions or reveal personal or financial information.`;
  } else if (finalScore >= 20) {
    summary = `ELEVATED CAUTION: Some suspicious solicitation or pressure tactics were noted during this dialogue. Verify the caller's identity independently before taking any action.`;
  } else {
    summary = `LOW SUSPICION: No prominent vishing or intimidation patterns detected in this transcript. Remember that callers can sound convincing; never share OTPs or passwords.`;
  }

  const recommendedActions: RecommendedAction[] = [];
  if (finalScore >= 50) {
    recommendedActions.push(
      { step: 1, action: 'HANG UP IMMEDIATELY. Do not remain on the line or argue with the caller.', priority: 'immediate' },
      { step: 2, action: 'Never read back OTP verification codes, PINs, or banking passwords over the phone.', priority: 'immediate' },
      { step: 3, action: 'If the caller claimed to be police, bank fraud department, or government, look up the official public phone number and call them directly.', priority: 'immediate' },
      { step: 4, action: 'If remote access tools (AnyDesk, TeamViewer) were opened during the call, disconnect your internet immediately and uninstall them.', priority: 'recommended' },
      { step: 5, action: 'Block the caller number and report the incident to the FTC (ReportFraud.ftc.gov) or local cyber crime portal.', priority: 'optional' }
    );
  } else {
    recommendedActions.push(
      { step: 1, action: 'Never provide passwords, OTPs, or financial account details on incoming calls.', priority: 'immediate' },
      { step: 2, action: 'When in doubt, hang up and initiate contact through verified corporate customer service numbers.', priority: 'recommended' }
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
