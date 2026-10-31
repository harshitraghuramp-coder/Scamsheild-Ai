import {
  ExplainableEvidenceReport,
  ExplainableEvidenceItem,
  UncertaintyNote,
  RiskLevel,
  ScamType,
  RedFlag,
  TechnicalIndicator,
  RecommendedAction,
  ExtractedEntities
} from '../types.ts';

interface BuildReportParams {
  targetType: 'message' | 'url' | 'screenshot' | 'phone_call' | 'app';
  scamType: ScamType;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: 'Low' | 'Medium' | 'High';
  redFlags: RedFlag[];
  technicalIndicators: TechnicalIndicator[];
  psychologicalTactics: string[];
  recommendedActions: RecommendedAction[];
  extractedEntities?: ExtractedEntities;
  threatHit?: any | null;
  sourceAnalysisMode: 'ai_enhanced' | 'heuristic_fallback';
  callerIdOrNumber?: string;
  appDetails?: any;
}

export function buildExplainableEvidenceReport(params: BuildReportParams): ExplainableEvidenceReport {
  const {
    targetType,
    scamType,
    riskScore,
    riskLevel,
    confidence,
    redFlags,
    technicalIndicators,
    psychologicalTactics,
    recommendedActions,
    threatHit,
    sourceAnalysisMode,
    callerIdOrNumber,
    appDetails,
  } = params;

  // 1. Calibrated Risk Rationale
  let calibrationRationale = '';
  if (riskLevel === 'CRITICAL') {
    calibrationRationale = `Classified as CRITICAL risk (${riskScore}/100) based on high-severity threat markers directly correlated with credential theft, unauthorized financial access, active extortion, or verified threat feed blacklist matches. High likelihood of imminent harm if user complies.`;
  } else if (riskLevel === 'HIGH') {
    calibrationRationale = `Classified as HIGH risk (${riskScore}/100) with substantial deceptive indicators detected (score range 50-74). Triggers include known impersonation patterns, pressure tactics, or off-platform redirection without immediate confirmed malware signature.`;
  } else if (riskLevel === 'MEDIUM') {
    calibrationRationale = `Classified as MEDIUM risk (${riskScore}/100). The target exhibits suspicious anomalies (e.g. unsolicited contact, non-standard domain extension, or general urgency) but lacks definitive malicious payload proof. Caution is advised pending independent verification.`;
  } else {
    calibrationRationale = `Classified as LOW apparent risk (${riskScore}/100). Standard threat patterns, malicious keywords, and known deceptive signatures were not triggered. Note: Low risk is not a guarantee of safety. Zero-trust principles still apply.`;
  }

  // 2. Observable Facts (Deterministic, Empirical)
  const observableFacts: ExplainableEvidenceItem[] = [];

  // Add from Technical Indicators
  for (const ind of technicalIndicators) {
    observableFacts.push({
      category: 'OBSERVABLE_FACT',
      indicator: ind.indicator,
      finding: ind.explanation,
      confidenceReasoning: `Deterministic heuristic verification (Rule: ${ind.type})`,
      sourceOrRule: ind.type,
      severity: ind.riskWeight >= 50 ? 'critical' : ind.riskWeight >= 30 ? 'high' : 'medium',
    });
  }

  // Specific target facts
  if (targetType === 'phone_call' && callerIdOrNumber) {
    observableFacts.push({
      category: 'OBSERVABLE_FACT',
      indicator: `Caller ID: ${callerIdOrNumber}`,
      finding: `Inbound communication logged from ${callerIdOrNumber}. Inbound CLI is vulnerable to VoIP PBX spoofing.`,
      confidenceReasoning: 'Telephony signaling fact',
      sourceOrRule: 'TELEPHONY_CLI_RECORD',
      severity: 'medium',
    });
  }

  if (targetType === 'app' && appDetails?.appMetadata) {
    const meta = appDetails.appMetadata;
    observableFacts.push({
      category: 'OBSERVABLE_FACT',
      indicator: `Store Status: ${meta.storeListingStatus}`,
      finding: `Application ${meta.storeListingStatus === 'STORE_VERIFIED_LISTING' ? 'has an active listing' : 'is unlisted or removed'} on ${meta.store === 'google_play' ? 'Google Play Store' : 'Apple App Store'}.`,
      confidenceReasoning: 'Public official store lookup query',
      sourceOrRule: 'STORE_REGISTRY_API',
      severity: meta.storeListingStatus === 'STORE_VERIFIED_LISTING' ? 'low' : 'critical',
    });
  }

  // 3. Model Inferences (Contextual / Social Engineering)
  const modelInferences: ExplainableEvidenceItem[] = [];

  for (const tactic of psychologicalTactics) {
    modelInferences.push({
      category: 'MODEL_INFERENCE',
      indicator: `Psychological Vector: ${tactic}`,
      finding: `Contextual evaluation identified deliberate use of ${tactic.toLowerCase()} to bypass analytical skepticism and force rapid compliance.`,
      confidenceReasoning: sourceAnalysisMode === 'ai_enhanced' ? 'Gemini 2.5 Flash contextual semantic inference' : 'Heuristic intent classifier',
      sourceOrRule: 'SOCIAL_ENGINEERING_TAXONOMY',
      severity: riskLevel === 'CRITICAL' ? 'critical' : riskLevel === 'HIGH' ? 'high' : 'medium',
    });
  }

  // Contextual Red Flags
  for (const rf of redFlags) {
    if (!observableFacts.some(f => f.indicator.toLowerCase() === rf.title.toLowerCase())) {
      modelInferences.push({
        category: 'MODEL_INFERENCE',
        indicator: rf.title,
        finding: rf.description,
        confidenceReasoning: 'Evaluated against known fraud campaign playbooks',
        sourceOrRule: 'FORENSIC_FLAG',
        severity: rf.severity,
      });
    }
  }

  // 4. Intelligence Matches
  const threatIntelMatches: ExplainableEvidenceItem[] = [];
  if (threatHit) {
    threatIntelMatches.push({
      category: 'INTELLIGENCE_MATCH',
      indicator: threatHit.indicator || 'Domain / Host Match',
      finding: `Confirmed entry in threat database: ${threatHit.threatCategory} (${threatHit.description})`,
      confidenceReasoning: `Source feed: ${threatHit.source} (Confidence: ${threatHit.confidence}%)`,
      sourceOrRule: threatHit.source,
      severity: 'critical',
    });
  }

  // 5. Uncertainties and Missing Information (Honest Technical Boundaries)
  const uncertaintiesAndGaps: UncertaintyNote[] = [];

  if (targetType === 'message') {
    uncertaintiesAndGaps.push({
      aspect: 'Sender True Digital Identity',
      explanation: 'SMS sender IDs and email display headers can be spoofed using rogue SMS gateways or unauthenticated SMTP relays.',
      howToVerifyIndependently: 'Inspect raw RFC 5322 email headers (SPF, DKIM, DMARC alignment) or verify via official customer support channels.'
    });
    uncertaintiesAndGaps.push({
      aspect: 'Behind-the-Scenes Server Actions',
      explanation: 'Scanner analyzes visible text; dynamic server-side redirects (cloaking) triggered only for specific IP ranges cannot be guaranteed from message text alone.',
      howToVerifyIndependently: 'Do not click the link. If investigating, use an isolated sandboxed virtual environment.'
    });
  } else if (targetType === 'url') {
    uncertaintiesAndGaps.push({
      aspect: 'WHOIS & Server Geolocation Privacy',
      explanation: 'Registrant contact information is typically masked behind WHOIS privacy guard proxies (e.g. Withheld for Privacy, Domains By Proxy).',
      howToVerifyIndependently: 'Check domain registration date via ICANN WHOIS Lookup tool. Newly registered domains (<90 days) carrying popular brand names are high-risk.'
    });
    uncertaintiesAndGaps.push({
      aspect: 'Time-of-Scan Payload Delivery',
      explanation: 'Malicious actors frequently serve benign holding pages to security scanners and only serve phishing kits to mobile user-agents with specific referrers.',
      howToVerifyIndependently: 'Rely on official bookmarks rather than clicking links received via SMS, Telegram, or email.'
    });
  } else if (targetType === 'phone_call') {
    uncertaintiesAndGaps.push({
      aspect: 'Caller CLI & Physical Geolocation',
      explanation: 'Calling Line Identification (CLI) can be freely spoofed by VoIP SIP providers. Displayed numbers do not establish physical caller location.',
      howToVerifyIndependently: 'Hang up and initiate an outbound call using the official phone number printed on the back of your bank debit card or published on official government websites.'
    });
    uncertaintiesAndGaps.push({
      aspect: 'Audio Synthesis Verification',
      explanation: 'Text transcripts cannot verify vocal timbre or acoustic artifacts associated with generative voice clones (ElevenLabs, Bark).',
      howToVerifyIndependently: 'Use a pre-established offline family safe word or verify through a known second contact.'
    });
  } else if (targetType === 'app') {
    uncertaintiesAndGaps.push({
      aspect: 'Dynamic Runtime Code Loading',
      explanation: 'Malicious Android apps can pass basic static store checks and subsequently download malicious payload DEX/ELF files from remote command-and-control servers.',
      howToVerifyIndependently: 'Audit device permissions in system settings. Revoke Accessibility and Notification Listener permissions if the app is not an accessibility utility.'
    });
  }

  // 6. External References
  const externalReferences: string[] = [
    'National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in)',
    'Indian Cyber Crime Coordination Centre (I4C) Threat Advisories',
    'CERT-In Phishing & Malware Security Bulletins (cert-in.org.in)',
    'Reserve Bank of India (RBI) Cautionary Sachet Notice on Digital Fraud',
    'Department of Telecommunications (DoT) Sanchar Saathi / Chakshu Portal'
  ];

  return {
    overallRiskClassification: riskLevel,
    calibrationRationale,
    observableFacts,
    modelInferences,
    threatIntelMatches,
    uncertaintiesAndGaps,
    containmentPlaybook: recommendedActions,
    externalReferences,
  };
}
