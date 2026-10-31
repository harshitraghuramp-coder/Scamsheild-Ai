import { TechnicalIndicator, RedFlag, RecommendedAction, RiskLevel, ScamType, AnalysisResult, DISCLAIMER_TEXT } from '../types.js';
import { threatIntelService } from '../threat-intel/feed.js';

// Legitimate official domains for popular impersonated brands
const KNOWN_LEGIT_DOMAINS: Record<string, string[]> = {
  paypal: ['paypal.com', 'paypal.me'],
  apple: ['apple.com', 'icloud.com'],
  google: ['google.com', 'accounts.google.com', 'gmail.com'],
  microsoft: ['microsoft.com', 'live.com', 'outlook.com', 'office.com', 'login.microsoftonline.com'],
  amazon: ['amazon.com', 'amazon.co.uk', 'amazon.in', 'amazon.de', 'aws.amazon.com'],
  netflix: ['netflix.com'],
  chase: ['chase.com', 'jpmorganchase.com'],
  wellsfargo: ['wellsfargo.com'],
  bankofamerica: ['bankofamerica.com'],
  binance: ['binance.com'],
  coinbase: ['coinbase.com'],
  metamask: ['metamask.io'],
  whatsapp: ['whatsapp.com', 'wa.me'],
  telegram: ['telegram.org', 't.me'],
  usps: ['usps.com'],
  fedex: ['fedex.com'],
  dhl: ['dhl.com'],
  ups: ['ups.com'],
  instagram: ['instagram.com'],
  facebook: ['facebook.com', 'meta.com'],
};

// High-risk top-level domains commonly abused by malicious actors due to cheap/free registration
const HIGH_RISK_TLDS = new Set([
  'xyz', 'top', 'buzz', 'cam', 'work', 'click', 'fit', 'country', 'tk', 'ml', 'gq', 'cf',
  'rest', 'bid', 'racing', 'download', 'stream', 'club', 'monster', 'icu', 'vip', 'surf'
]);

const SUSPICIOUS_PATH_KEYWORDS = [
  'login', 'signin', 'auth', 'kyc', 'otp', '2fa', 'verify', 'verification', 'account-update',
  'unlock', 'suspend', 'restore', 'recover', 'wallet', 'token', 'claim', 'refund', 'invoice',
  'giftcard', 'payroll', 'wire', 're-auth', 'security-center'
];

export interface UrlCheckDetails {
  originalUrl: string;
  parsedProtocol: string;
  hostname: string;
  port: string;
  pathname: string;
  isHttps: boolean;
  isIpAddress: boolean;
  hasPunycode: boolean;
  tld: string;
  subdomainCount: number;
  detectedBrandSpoofing: string | null;
  suspiciousKeywordsInPath: string[];
}

export function analyzeUrlDeterministic(rawUrl: string): {
  riskScore: number;
  riskLevel: RiskLevel;
  scamType: ScamType;
  details: UrlCheckDetails;
  redFlags: RedFlag[];
  technicalIndicators: TechnicalIndicator[];
  recommendedActions: RecommendedAction[];
  threatIntelHit: any | null;
} {
  let normalized = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    // If no scheme provided, default to inspecting as http/https
    normalized = 'https://' + normalized;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      riskScore: 85,
      riskLevel: 'HIGH',
      scamType: 'Malicious / Deceptive URL',
      details: {
        originalUrl: rawUrl,
        parsedProtocol: 'unknown',
        hostname: 'invalid-url',
        port: '',
        pathname: '',
        isHttps: false,
        isIpAddress: false,
        hasPunycode: false,
        tld: '',
        subdomainCount: 0,
        detectedBrandSpoofing: null,
        suspiciousKeywordsInPath: [],
      },
      redFlags: [
        {
          title: 'Malformed or Obfuscated URL',
          description: 'The provided link violates standard RFC URL formatting. Attackers frequently use malformed syntax to bypass standard security filters.',
          severity: 'high'
        }
      ],
      technicalIndicators: [
        {
          type: 'RFC_PARSER_FAILURE',
          indicator: rawUrl,
          explanation: 'Failed native URL parser validation',
          riskWeight: 80
        }
      ],
      recommendedActions: [
        { step: 1, action: 'Do NOT open or click this link under any circumstances.', priority: 'immediate' },
        { step: 2, action: 'Delete the message containing this malformed address.', priority: 'recommended' }
      ],
      threatIntelHit: null
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const search = parsed.search.toLowerCase();
  const fullPathAndQuery = pathname + search;

  const redFlags: RedFlag[] = [];
  const technicalIndicators: TechnicalIndicator[] = [];
  let score = 0;

  // 1. Threat Intel Check
  const threatHit = threatIntelService.checkIndicator(hostname) || threatIntelService.checkIndicator(rawUrl);
  if (threatHit) {
    score += 85;
    redFlags.push({
      title: `Known Threat Intel Match: ${threatHit.threatCategory}`,
      description: `Target domain is indexed in live security threat feeds (${threatHit.source}) with ${threatHit.confidence}% malicious confidence: ${threatHit.description}`,
      severity: 'critical'
    });
    technicalIndicators.push({
      type: 'THREAT_FEED_MATCH',
      indicator: threatHit.indicator,
      explanation: `Match in ${threatHit.source} - First recorded ${threatHit.firstSeen}`,
      riskWeight: 95
    });
  }

  // 2. Protocol Check
  const isHttps = parsed.protocol === 'https:';
  if (!isHttps) {
    score += 25;
    redFlags.push({
      title: 'Insecure Cleartext Protocol (HTTP)',
      description: 'The link transmits data without SSL/TLS encryption. Credential-harvesting and rogue gateways frequently rely on unencrypted connections.',
      severity: 'medium'
    });
    technicalIndicators.push({
      type: 'INSECURE_PROTOCOL',
      indicator: parsed.protocol,
      explanation: 'Plaintext HTTP transmission vulnerable to MITM interception and eavesdropping',
      riskWeight: 30
    });
  }

  // 3. Raw IP Hostname Check
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isIpv6 = hostname.startsWith('[') && hostname.endsWith(']');
  const isIpAddress = isIpv4 || isIpv6;

  if (isIpAddress) {
    score += 45;
    redFlags.push({
      title: 'Direct IP Address Hostname',
      description: 'The URL targets a bare numerical IP address rather than a registered domain name. Legitimate corporate and consumer services almost never use bare IPs for customer-facing portals.',
      severity: 'critical'
    });
    technicalIndicators.push({
      type: 'IP_LITERAL_HOST',
      indicator: hostname,
      explanation: 'Bare IP address host hides WHOIS domain ownership records and evades standard domain takedowns',
      riskWeight: 60
    });
  }

  // 4. Punycode / IDN Homograph Check
  const hasPunycode = hostname.includes('xn--') || /[^\x00-\x7F]/.test(hostname);
  if (hasPunycode) {
    score += 40;
    redFlags.push({
      title: 'IDN Homograph / Punycode Deception Detected',
      description: 'The domain contains internationalized characters or punycode prefix (xn--). Cybercriminals use visually identical foreign glyphs (e.g. Cyrillic "а" or "о") to deceive victims into thinking they are visiting authentic websites.',
      severity: 'critical'
    });
    technicalIndicators.push({
      type: 'HOMOGRAPH_ATTACK',
      indicator: hostname,
      explanation: 'Punycode or non-ASCII characters detected in domain name',
      riskWeight: 70
    });
  }

  // 5. TLD Risk Check
  const domainParts = hostname.split('.');
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : '';
  if (HIGH_RISK_TLDS.has(tld)) {
    score += 25;
    redFlags.push({
      title: `High-Risk Top-Level Domain (.${tld})`,
      description: `The .${tld} extension has a disproportionately high incidence of disposable phishing sites and malware distribution according to global registrar abuse statistics.`,
      severity: 'medium'
    });
    technicalIndicators.push({
      type: 'HIGH_RISK_TLD',
      indicator: `.${tld}`,
      explanation: `Registrar classification marked as high abuse-vector TLD (.${tld})`,
      riskWeight: 35
    });
  }

  // 6. Subdomain Camouflage (e.g., login.paypal.com.evil-domain.com)
  const subdomainCount = Math.max(0, domainParts.length - 2);
  if (subdomainCount >= 3) {
    score += 25;
    redFlags.push({
      title: 'Deep Multi-Subdomain Nesting',
      description: `This URL contains ${subdomainCount} subdomains. Attackers commonly chain subdomains so that mobile browser address bars truncate the real root domain.`,
      severity: 'high'
    });
    technicalIndicators.push({
      type: 'SUBDOMAIN_OBSCURATION',
      indicator: `${subdomainCount} subdomains`,
      explanation: 'Deep subdomain nesting designed to disguise the actual destination host on mobile screens',
      riskWeight: 40
    });
  }

  // 7. Brand Impersonation / Spoofing
  let detectedBrandSpoofing: string | null = null;
  for (const [brand, legitList] of Object.entries(KNOWN_LEGIT_DOMAINS)) {
    // Check if brand is in the hostname
    if (hostname.includes(brand)) {
      // Is it genuinely in one of the legit domains?
      const isLegit = legitList.some(
        (legit) => hostname === legit || hostname.endsWith('.' + legit)
      );

      if (!isLegit) {
        detectedBrandSpoofing = brand.toUpperCase();
        score += 55;
        redFlags.push({
          title: `Brand Impersonation Detected (${detectedBrandSpoofing})`,
          description: `The domain references '${brand}' but is NOT hosted on an official domain (${legitList.join(', ')}). This is a hallmark of targeted phishing and credential theft.`,
          severity: 'critical'
        });
        technicalIndicators.push({
          type: 'BRAND_SPOOFING',
          indicator: brand,
          explanation: `Domain includes '${brand}' but root authority does not match official registrars: ${legitList.join(' | ')}`,
          riskWeight: 80
        });
        break;
      }
    }
  }

  // 8. Suspicious Path & Query Keywords
  const foundKeywords: string[] = [];
  for (const kw of SUSPICIOUS_PATH_KEYWORDS) {
    if (fullPathAndQuery.includes(kw)) {
      foundKeywords.push(kw);
    }
  }
  if (foundKeywords.length > 0) {
    // If already has suspicious host indicators, keywords amplify the risk
    const weight = detectedBrandSpoofing || isIpAddress || HIGH_RISK_TLDS.has(tld) ? 20 : 10;
    score += weight;
    if (detectedBrandSpoofing || isIpAddress || foundKeywords.length >= 2) {
      redFlags.push({
        title: 'Sensitive Security Keywords in Path',
        description: `Path requests sensitive actions: [${foundKeywords.slice(0, 4).join(', ')}]. Paired with suspicious host indicators, this indicates a credential or token capture funnel.`,
        severity: detectedBrandSpoofing ? 'high' : 'medium'
      });
    }
    technicalIndicators.push({
      type: 'SENSITIVE_PATH_TERMS',
      indicator: foundKeywords.join(', '),
      explanation: 'Path segments target auth tokens, passwords, or financial verification workflows',
      riskWeight: 25
    });
  }

  // 9. Port Anomalies
  if (parsed.port && !['80', '443'].includes(parsed.port)) {
    score += 15;
    technicalIndicators.push({
      type: 'NON_STANDARD_PORT',
      indicator: `Port :${parsed.port}`,
      explanation: 'Service listening on unusual port, often bypassing standard enterprise proxy gateways',
      riskWeight: 20
    });
  }

  // Cap score to 0-100
  const finalScore = Math.min(100, Math.max(0, score));

  let riskLevel: RiskLevel = 'LOW';
  if (finalScore >= 80) riskLevel = 'CRITICAL';
  else if (finalScore >= 55) riskLevel = 'HIGH';
  else if (finalScore >= 25) riskLevel = 'MEDIUM';

  let scamType: ScamType = 'Low Threat / Informational';
  if (detectedBrandSpoofing) {
    scamType = 'Phishing & Credential Theft';
  } else if (threatHit) {
    scamType = 'Malicious / Deceptive URL';
  } else if (finalScore >= 55) {
    scamType = 'Malicious / Deceptive URL';
  }

  const recommendedActions: RecommendedAction[] = [];
  if (finalScore >= 55) {
    recommendedActions.push(
      { step: 1, action: 'Do NOT open this URL or submit any credentials, phone numbers, or credit card details.', priority: 'immediate' },
      { step: 2, action: 'If you already visited, close the tab and check if any files were downloaded.', priority: 'immediate' },
      { step: 3, action: 'If you typed passwords or payment info, navigate directly to the legitimate provider to reset your credentials immediately.', priority: 'recommended' },
      { step: 4, action: 'Report this URL to Google Safe Browsing and the Anti-Phishing Working Group (APWG).', priority: 'optional' }
    );
  } else if (finalScore >= 25) {
    recommendedActions.push(
      { step: 1, action: 'Examine the full address bar carefully before entering personal data.', priority: 'immediate' },
      { step: 2, action: 'Ensure the padlock icon is valid and verify the domain owner via certificate inspection.', priority: 'recommended' },
      { step: 3, action: 'When in doubt, use a bookmarked link or search engine to reach the organization.', priority: 'recommended' }
    );
  } else {
    recommendedActions.push(
      { step: 1, action: 'No prominent automated red flags detected, but maintain general vigilance.', priority: 'recommended' },
      { step: 2, action: 'Never provide OTPs or passwords via unsolicited links.', priority: 'recommended' }
    );
  }

  return {
    riskScore: finalScore,
    riskLevel,
    scamType,
    details: {
      originalUrl: rawUrl,
      parsedProtocol: parsed.protocol,
      hostname,
      port: parsed.port,
      pathname,
      isHttps,
      isIpAddress,
      hasPunycode,
      tld,
      subdomainCount,
      detectedBrandSpoofing,
      suspiciousKeywordsInPath: foundKeywords,
    },
    redFlags,
    technicalIndicators,
    recommendedActions,
    threatIntelHit: threatHit,
  };
}
