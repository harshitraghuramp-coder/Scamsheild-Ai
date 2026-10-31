import { DemoProfile, UserAccount } from './types.ts';

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: 'basic_user',
    name: 'Alex Chen (Basic User)',
    email: 'alex.basic@scamshield.sandbox',
    avatarIcon: 'User',
    badge: 'ESSENTIAL TIER · DEMO DATA',
    accessLevel: 'Essential Protection Tier',
    description:
      'Standard user experience focusing on everyday digital safety: scanning suspicious SMS/WhatsApp messages, testing unverified web links, and learning foundational cyber hygiene.',
    features: [
      'Dashboard Threat Summary',
      'SMS & WhatsApp Message Scanner',
      'Phishing URL Analyzer',
      'Cybersecurity Awareness Center',
      'Sample Incident Reports',
    ],
    allowedNavs: [
      'dashboard',
      'message_scanner',
      'url_analyzer',
      'awareness_center',
      'incident_tracker',
      'security_identity',
    ],
    defaultNav: 'dashboard',
    sampleScenarios: [
      {
        title: 'Electricity Bill Disconnection SMS',
        category: 'Fake Utility Notice',
        description:
          'DEMO SAMPLE: Urgent notification alleging electric supply will be terminated unless a third-party APK/link is accessed.',
        type: 'message',
        sampleInput:
          'Dear Consumer, Your electricity bill for Rs 3420 is pending. Tonight at 9:30 PM power will be disconnected from substation. Call electricity officer immediately at 98210-XXXXX or download support apk at http://bijli-bill-update.xyz',
        expectedRisk: 'HIGH',
      },
      {
        title: 'Suspicious Bank KYC Suspension Link',
        category: 'Phishing URL',
        description:
          'DEMO SAMPLE: Impersonation domain copying nationalized banking aesthetics to harvest net-banking OTPs.',
        type: 'url',
        sampleInput: 'https://secure-sbi-kyc-reactivate.xyz/login?ref=sms_alert',
        expectedRisk: 'CRITICAL',
      },
    ],
  },
  {
    id: 'security_enthusiast',
    name: 'Priya Nair (Security Enthusiast)',
    email: 'priya.enthusiast@scamshield.sandbox',
    avatarIcon: 'ShieldCheck',
    badge: 'FORENSICS TIER · DEMO DATA',
    accessLevel: 'Advanced Forensics Tier',
    description:
      'Power user equipped with full multi-modal analysis capabilities: inspecting suspicious mobile APKs, OCR visual screenshot forensics, voice vishing phone call transcripts, and interacting with the AI Learning Coach.',
    features: [
      'All 5 Scanner Modalities (Message, URL, App, Screenshot, Phone)',
      'App Authenticity & Trojan APK Inspector',
      'Voice Vishing & Call Transcript Detector',
      'Explainable AI Forensics & IOC Breakdown',
      'Interactive AI Learning Coach & Vigilance Drills',
    ],
    allowedNavs: [
      'dashboard',
      'message_scanner',
      'url_analyzer',
      'screenshot_scanner',
      'phone_call_detector',
      'app_authenticity',
      'learning_coach',
      'cybersecurity_quiz',
      'awareness_center',
      'security_identity',
    ],
    defaultNav: 'app_authenticity',
    sampleScenarios: [
      {
        title: 'Instant Loan Trojan Application (Fake APK)',
        category: 'Malicious App Impersonation',
        description:
          'DEMO SAMPLE: Unverified Play Store APK claiming 5-minute loans while demanding SMS read, Contacts, and Accessibility overlay permissions.',
        type: 'app',
        sampleInput: 'https://play.google.com/store/apps/details?id=com.quickcash.instantrupeeloan.fintech',
        expectedRisk: 'CRITICAL',
      },
      {
        title: 'CBI Courier Vishing Call Transcript',
        category: 'Voice Vishing / Digital Arrest Call',
        description:
          'DEMO SAMPLE: Automated voice extortion claiming an intercepted package containing passports and contraband.',
        type: 'phone',
        sampleInput:
          'This is Inspector Sharma from Crime Branch Mumbai. A Fedex parcel registered with your Aadhaar ID was confiscated at Customs containing 5 fake passports and 140 grams of contraband. The Supreme Court has issued an immediate Digital Arrest notice. Do not disconnect this call or local police will raid your premises in 30 minutes. You must immediately verify your assets via RTGS to RBI holding account.',
        expectedRisk: 'CRITICAL',
      },
    ],
  },
  {
    id: 'victim_simulation',
    name: 'Rahul Verma (Scam Victim Simulation)',
    email: 'rahul.victim@scamshield.sandbox',
    avatarIcon: 'LifeBuoy',
    badge: 'EMERGENCY SIMULATION · DEMO DATA',
    accessLevel: 'Emergency Cyber Help & Containment',
    description:
      'Supportive crisis containment environment designed for individuals currently threatened or panicked: digital arrest extortion guidance, emergency 1930 helpline workflow, fraudulent payment recovery steps, and evidence freezing.',
    features: [
      'Emergency Cyber Help Guided Assistant',
      '1930 Cybercrime Helpline One-Tap Flow',
      'Digital Arrest Extortion Defense Playbook',
      'Fraudulent UPI / Net-Banking Incident Tracker',
      'Legal & Bank Evidence Preservation Checklist',
    ],
    allowedNavs: [
      'emergency_help',
      'dashboard',
      'incident_tracker',
      'awareness_center',
      'security_identity',
    ],
    defaultNav: 'emergency_help',
    sampleScenarios: [
      {
        title: 'Digital Arrest Threat Containment Scenario',
        category: 'Active Threat Containment',
        description:
          'DEMO SAMPLE: Victim facing live video-call coercion from fraudsters masquerading as police officers.',
        type: 'emergency',
        sampleInput:
          'Scammer is currently on video call in police uniform claiming I am under digital house arrest and demanding ₹1,50,000 security deposit.',
        expectedRisk: 'CRITICAL',
      },
      {
        title: 'UPI Fraud Payment Incident (€48,000 INR Transfer)',
        category: 'Fraudulent Payment Recovery',
        description:
          'DEMO SAMPLE: Accidental transfer sent under extortion pressure; requires immediate Golden Hour 1930 bank transaction freeze.',
        type: 'emergency',
        sampleInput:
          'Transferred ₹48,000 via Google Pay to fraudster UPI ID cyber-police-holding@okhdfcbank at 09:15 AM today.',
        expectedRisk: 'HIGH',
      },
    ],
  },
  {
    id: 'intelligence_viewer',
    name: 'Dr. Arvind Mehta (Threat Intel Viewer)',
    email: 'arvind.intel@scamshield.sandbox',
    avatarIcon: 'Radar',
    badge: 'INTEL PREVIEW · DEMO DATA',
    accessLevel: 'Threat Intelligence & Moderation Preview',
    description:
      'National fraud intelligence dashboard experience: exploring the Live Scam Tracker with 12 distinct categories, state-by-state geographic heatmaps for India, verified vs unverified feeds, and community report queues.',
    features: [
      'Live Scam Tracker Dashboard & KPI Metrics',
      'Interactive India Regional Threat Map (9+ Jurisdictions)',
      '12 Active Fraud Categories & Surge Trends',
      'Community Incident Submissions Queue (Simulation)',
      'Threat Intelligence Feeds & IOC Correlation',
    ],
    allowedNavs: [
      'live_scam_tracker',
      'threat_intelligence',
      'community_reports',
      'security_reports',
      'dashboard',
      'security_identity',
    ],
    defaultNav: 'live_scam_tracker',
    sampleScenarios: [
      {
        title: 'National Digital Arrest Campaign Cluster #ST-2026-9101',
        category: 'Active Campaign Analysis',
        description:
          'DEMO SAMPLE: Correlated multi-state syndicate impersonating ED and CBI officials across Maharashtra and Delhi NCR.',
        type: 'message',
        sampleInput: 'Campaign ID: ST-2026-9101 · IOC: skype://cbi-investigation-cell · Reported Victims: 342',
        expectedRisk: 'CRITICAL',
      },
    ],
  },
];

/**
 * Build an isolated, secure UserAccount for a demo profile.
 * Demo accounts NEVER grant actual production privileges and are explicitly flagged with isDemo = true.
 */
export function buildDemoUserAccount(profile: DemoProfile): UserAccount {
  return {
    id: `DEMO-${profile.id.toUpperCase()}`,
    email: profile.email,
    displayName: profile.name,
    role: 'DEMO_USER',
    isDemo: true,
    demoProfileId: profile.id,
    emailVerified: true,
    emailVerifiedAt: '2026-10-31T00:00:00.000Z',
    phone: '+919999900000',
    phoneVerified: true,
    phoneVerifiedAt: '2026-10-31T00:00:00.000Z',
    passkeys: [
      {
        id: `demo-passkey-${profile.id}`,
        publicKey: 'mock-demo-fido2-key-simulation-only',
        counter: 1,
        friendlyName: 'Demo Biometric Authenticator (Simulated)',
        deviceType: 'platform',
        createdAt: '2026-10-31T00:00:00.000Z',
        lastUsedAt: new Date().toISOString(),
      },
    ],
    kycStatus: profile.id === 'intelligence_viewer' || profile.id === 'security_enthusiast' ? 'VERIFIED' : 'NOT_STARTED',
    kycRecord:
      profile.id === 'intelligence_viewer' || profile.id === 'security_enthusiast'
        ? {
            id: `KYC-DEMO-${profile.id.toUpperCase()}`,
            userId: `DEMO-${profile.id.toUpperCase()}`,
            docType: 'INDIAN_PASSPORT',
            docNumberMasked: '•••• •••• 9999',
            status: 'VERIFIED',
            frontUploaded: true,
            backUploaded: true,
            submittedAt: '2026-10-31T00:00:00.000Z',
            reviewedAt: '2026-10-31T00:00:00.000Z',
            consentTimestamp: '2026-10-31T00:00:00.000Z',
            providerReferenceId: `DEMO-REG-KYC-${profile.id.toUpperCase()}`,
            authenticityScore: 99,
          }
        : undefined,
    twoFactorEnforced: false,
    createdAt: '2026-10-31T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  };
}
