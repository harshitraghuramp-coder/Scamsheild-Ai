# ScamShield AI — AI-Powered Cybersecurity Scanner & Fraud Prevention Platform

> **"Think Before You Click."** — Multi-vector scam detection, voice phishing forensics, malicious URL inspection, mobile app authenticity verification, and panic-free emergency victim assistance.

---

## 🚨 Emergency Cyber Help – Panic-Free Assistance

Victims of cyber scams frequently face severe psychological terror, isolation, and extortion — from fabricated "Digital Arrest" threats by impersonated CBI/ED officers to frantic panic after unauthorized bank transfers.

The **Emergency Cyber Help Center** acts as a supportive emergency guidance hub designed with a calm, empathetic, and blameless user experience to help victims take the exact right next steps immediately.

### 🌟 Key Pillars

1. **Reassuring Emergency Dashboard**:
   - Anchored with the message: *"You're not alone. Stay calm. We'll help you take the next step."*
   - Dedicated rapid-containment playbooks for 8 critical emergency scenarios:
     - **Fake Police & Digital Arrest Threats**: Debunking fabricated warrants, video call interrogations, and bogus RBI escrow demands.
     - **Money Already Transferred**: Immediate "Golden Hour" (<2 hours) containment protocol for inter-bank freezes via 1930.
     - **Threatening Calls & Intimidation**: Safety instructions for handling persistent caller extortion.
     - **Blackmail & Sextortion**: Stopping communication, preserving unedited chat evidence, and preventing extortion payments.
     - **OTP, PIN or Password Disclosed**: Account freezing steps, net banking credential resets, and 2FA revocation.
     - **Unknown App / Screen-Sharing Trojan**: Device isolation (Airplane mode / Wi-Fi off), Accessibility permission revoke, and safe removal.
     - **Fraudulent Payment Requests**: Verifying UPI collect requests and fake QR code refund scams.
     - **Suspicious Messages & Fake Legal Notices**: Independent registry verification and avoidance of links.

2. **One-Tap Cybercrime Assistance (India)**:
   - **Call 1930**: Direct integration with the device telephone dialer (`tel:1930`) connecting to the Ministry of Home Affairs (MHA) National Cybercrime Reporting Portal helpline for financial cyber fraud.
   - **Report Online**: Direct link to the official [cybercrime.gov.in](https://cybercrime.gov.in) portal.
   - **Emergency Response Directory**: Clear explanations and dial links for **112** (National Emergency), **1091** (Women in Distress), and **14440** (RBI Banking Fraud Awareness).
   - **Legal Compliance**: Transparently clarifies that ScamShield AI provides emergency guidance and evidence preparation, and does not itself directly contact law enforcement or file cases without authorized government protocols.

3. **Panic-Free Guided Assistant**:
   - Step-by-step interactive questionnaire asking simple, non-technical questions (*What happened? Were you threatened with arrest? Was money transferred and when? Was sensitive info shared? Was a remote app installed? Are they calling you right now?*).
   - Automatically generates a prioritized, non-shaming emergency action plan tailored to the victim's exact answers.

4. **Structured Incident Dossier Builder**:
   - Helps victims generate a standardized, professional incident report for submission to banks, police, or cybercrime.gov.in.
   - Captures incident category, date/time, monetary loss, transaction IDs/UTRs, bank/UPI details, suspect info, and narrative.
   - 100% Client-Side Privacy: Incident details are never transmitted to any server or database.
   - One-tap copy to clipboard and `.txt` dossier download.

---

## 📡 LIVE SCAM TRACKER – Active Scam Intelligence Dashboard

The **Live Scam Tracker** serves as a real-time cybersecurity situation room tracking active fraud campaigns, emerging attack vectors, and regional deception syndicates across India.

### 🌟 Key Capabilities

1. **Main Dashboard KPI Metrics**:
   - **Active Scam Alerts**: Live count of active, corroborated scam campaigns.
   - **Newly Reported Scams**: Campaigns detected or reported within the last 48 hours.
   - **Trending Scam Categories**: Attack categories exhibiting surging week-over-week velocity (e.g. Digital Arrest +38%, Electricity Bill UPI +29%).
   - **Reports Received Today**: Number of victim incidents registered across feeds and community telemetry.
   - **High-Risk Alerts**: Critical and high-severity campaigns requiring immediate public defense.
   - **Recently Resolved / Expired**: Defanged campaigns, domain takedowns, and sinkholed infrastructure.

2. **Strict Deduplication & Truth-in-Metrics**:
   - Distinguishes **Unique Active Campaigns** from **Total Correlated Reports**.
   - For example: 340 individual victim reports alleging a fake CBI courier narcotics arrest call are deduplicated under a single campaign key, avoiding artificial inflation.
   - Transparent counting logic: Only unexpired, un-neutralized reports within the source's active operational window are counted as active.

3. **12 Explicitly Tracked Attack Categories**:
   - Digital Arrest Scams
   - UPI Payment Scams
   - Fake Bank Calls
   - OTP Theft
   - Fake Job and Internship Offers
   - Investment and Trading Scams
   - Phishing Websites
   - Fake Shopping Applications
   - Loan App Scams
   - Social Media Impersonation
   - Cryptocurrency Scams
   - Tech Support Scams

4. **Geographic Scam Intelligence (Interactive India Map)**:
   - Interactive SVG map displaying confirmed incidents by state and union territory.
   - **Zero IP Inference Guarantee**: Location data is compiled exclusively from verified state cyber police releases (e.g., Maharashtra Cyber, Delhi Police IFSO, Karnataka CID, Telangana Cyber Bureau) and official FIR/advisory registries. ScamShield AI *never* infers or fabricates victim locations from IP addresses without justified evidence.
   - Regional Cyber Helpline directory (e.g. 1930 / state numbers) pre-configured with telephone dialer links.

5. **Multi-Source Data Integrity**:
   - Official Government Advisories: Indian Cyber Crime Coordination Centre (I4C), CERT-In, Reserve Bank of India (RBI Sachet), NPCI, and TRAI.
   - Transparent verification tiers:
     - `VERIFIED_ALERT`: Corroborated by official government or police advisories.
     - `UNVERIFIED_SUBMISSION`: Moderated community report undergoing multi-source verification.
     - `RESOLVED_EXPIRED`: Neutralized or archived campaigns.
   - Resilient fallback: If live data feeds are unreachable, the UI clearly displays *"Live data unavailable"* rather than fabricating simulated telemetry.

---

## 📱 AI App Authenticity & Risk Analyzer

The **App Authenticity Analyzer** empowers users to investigate potentially fake, fraudulent, impersonating, or malicious mobile applications on the **Google Play Store** and **Apple App Store** *before* downloading or installing them.

### 🔍 Key Capabilities
1. **Store URL & Package Inspection**:
   - Supports Google Play Store URLs (`https://play.google.com/store/apps/details?id=...`), Apple App Store URLs (`https://apps.apple.com/app/id...`), and direct Android package names or iOS bundle IDs.
   - Built-in SSRF protection with strict hostname whitelisting (`play.google.com`, `apps.apple.com`, `itunes.apple.com`).
   - Zero-execution architecture: Never downloads, executes, or runs untrusted binaries (.apk or .ipa).

2. **9-Section Investigation Dossier**:
   - **App Overview**: Official title, icon, package/bundle ID, declared category, version, application size, and store listing status.
   - **Developer & Company Details**: Developer name, official website, contact email, registered business location/country, parent organization, corporate domain matching, and publisher app catalog.
   - **Release & Update History**: Original store publication date, last update timestamp, and maintenance cadence.
   - **Ratings, Reviews & Traction**: Average star rating, review volume, download scale estimate, and recurring negative review/bot pattern flags.
   - **Permissions & Privacy**: Full declared permissions catalog with critical sensitivity audits (Accessibility service hijack, SMS read/receive, system alert overlay, contact scraping, background location).
   - **Authenticity Checks Matrix**: Brand impersonation checks, package name typosquatting, developer credential validation, and threat feed IOC correlation.
   - **Risk Assessment & AI Forensics**: Quantitative risk score (0–100), risk tier (Low, Moderate, High, Critical), Gemini 3.8 Flash forensic reasoning, and categorized warning signs.
   - **Safety Recommendations**: Prioritized, actionable advice (e.g. permission revocation, quarantine guidance, official download channels).
   - **Sources & Verification Transparency**: Clear segregation between verified store facts, AI-generated forensic deductions, and unverified/unavailable information.

---

## 🔍 Technologically Credible Differentiator: Explainable Scam Evidence Report

A critical failure of first-generation security tools is presenting arbitrary numerical scores ("92% Risk") without defensible justification or actionable explanations. This fosters alert fatigue, false positives, and legal liability.

**ScamShield AI's Explainable Scam Evidence Engine** dissects every scan across all 5 modalities (`message`, `url`, `screenshot`, `phone_call`, `app`) into a four-dimensional forensic report:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        EXPLAINABLE SCAM EVIDENCE MATRIX                                │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ 1. OBSERVABLE HARD FACTS      │ Verifiable, deterministic traits.                      │
│    (Deterministic Evidence)   │ e.g. Regex match on extortion keywords, URL entropy    │
│                               │ >4.2, missing HTTPS, unlisted App Store package ID.    │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2. CONTEXTUAL MODEL INFERENCES│ Psychological manipulation & intent vectors.          │
│    (AI Forensic Analysis)     │ e.g. "False urgency coercing immediate UPI transfer",   │
│                               │ "Impersonation of law enforcement without official PR"│
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3. THREAT INTEL IOC MATCHES   │ Corroborated hits against active threat feeds.         │
│    (Cross-Source Intel)       │ e.g. URLhaus sinkhole, OpenPhish, NPCI advisories,     │
│                               │ regional cyber cell syndicate clusters.                │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4. TECHNICAL UNCERTAINTIES    │ Honest disclosure of what cannot be proved.            │
│    (Gaps & Limitations)       │ e.g. "Domain age could not be queried without WHOIS",  │
│                               │ "Sender spoofing possible without raw telecom headers" │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

### Every Report Guarantees:
- **Calibrated Risk Rationale**: Replaces pseudo-probability percentages with clear natural-language rationale explaining *why* the severity tier was assigned.
- **Categorized Warning Indicators**: Color-coded, severity-ranked breakdown of individual red flags.
- **Immediate Containment Playbook**: Ordered, prioritized actions the user must take right now (e.g., *Freeze netbanking via 1930*, *Disconnect Wi-Fi / Enable Airplane Mode*, *Revoke Accessibility permissions*).
- **Official Regulatory References**: Citations to relevant enforcement bodies (I4C, RBI Master Directions, CERT-In, TRAI UCC, IPC / BNS extortion sections).

---

## 🛡️ 5-Channel Protection Coverage & Zero-Trust Architecture

| Vector | Capabilities | Engine & Sandbox Model |
|---|---|---|
| **🚨 Emergency Help** | Panic-free victim assistance, 1930 helpline dialer, guided containment, incident dossier builder | Client-Side Guidance + 1930/MHA Directory |
| **📱 Mobile Apps** | Google Play & Apple App Store authenticity, developer verification, accessibility trojan detection | Deterministic Metadata Parser + Gemini 2.5 Flash |
| **📞 Phone Calls** | Voice phishing (vishing) transcripts, digital arrest coercion, bank fraud department imposters | Deterministic Regex + Gemini 2.5 Flash Forensics |
| **💬 Messages** | SMS, WhatsApp, email, fake internship deposits, crypto blackmail, delivery customs fees | Deterministic Heuristics + Gemini 2.5 Flash |
| **🌐 URLs & Domains** | Typosquatting, Shannon entropy, Punycode homographs, credential harvesters, threat feeds | Local Heuristics + Threat Intel Feed |
| **🖼️ Visuals & OCR** | Deceptive screenshot inspection, bank receipt tampering, client-side Tesseract.js OCR | Client-Side WASM OCR + Multimodal Gemini Vision |

### Honest Endpoint Boundary: Web Sandbox vs. Native Daemon Companion

Unlike misleading apps that claim an in-browser web app can intercept incoming cellular phone calls or read SMS silently in the background (which the W3C web sandbox explicitly forbids for security), ScamShield AI operates on a strictly honest, zero-trust architecture:

1. **In-Browser Web Application (Active Now)**:
   - **Zero-Execution Sandbox**: Never auto-opens, downloads, or executes submitted URLs or binaries.
   - **Client-Side WASM OCR**: Tesseract.js processes screenshot images locally on the CPU without sending images over the network unless advanced multimodal AI reasoning is explicitly triggered.
   - **FIDO2 / WebAuthn Hardware Binding**: Cryptographic authentication bound to the device's hardware enclave (Apple Secure Enclave, Android Titan M2).
   - **Local Encrypted Storage**: Incident dossiers, safe words, and history stay strictly within browser `localStorage` and `IndexedDB`. Zero server telemetry.

2. **Native Sentinel Companion Specifications (Production Blueprint)**:
   - **Android Sentinel Service**: Utilizes `CallScreeningService` API to intercept incoming numbers and check against local threat IOC hashes without logging call audio.
   - **Accessibility & SMS Filter**: Uses `NotificationListenerService` and `SMS_RECEIVED` intents to alert users of urgent extortion text strings in real time.
   - **Network Protection**: Local VPN packet filter (`VpnService`) sinkholing known phishing DNS lookups.

---

## 🔒 Security & Data Integrity

- **Privacy-First Zero Telemetry**: All incident summaries and scan histories remain strictly inside the user's browser (localStorage / IndexedDB). No victim PII is logged on the server.
- **Factual Precision**: If developer country, company registration, or original publication date cannot be verified independently, it is explicitly presented as *"Not publicly verified"* or *"Information unavailable"*.
- **No False Equivalencies**: Store publication dates are never confused with corporate legal registration dates.
- **Fair Risk Scoring**: An app is never classified as fake solely because it has few downloads, a low rating, or a new release date.
- **DPDP Act 2023 Compliance**: Users maintain full right to erasure; identity verification metadata can be permanently purged in one click.
- **Statutory Aadhaar Exclusion**: Under the *Aadhaar Act, 2016*, no 12-digit UID numbers are accepted, stored, or processed.

---

## 🏗️ Architecture & Integrations

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                SCAMSHIELD AI PIPELINE                           │
│                                                                                 │
│   [ Client Browser ]                                                            │
│          │                                                                      │
│          ▼ HTTPS (POST /api/analyze/*)                                          │
│   [ Express Server Proxy ] ─── (Zero Client API Keys)                           │
│          │                                                                      │
│          ▼                                                                      │
│   [ Singleflight Scan Cache ] ─── (Cache Hit? Return in ~2ms)                   │
│          │                                                                      │
│          ▼ Cache Miss                                                           │
│   [ Deterministic Heuristics Engine ]                                           │
│   ├─ Regex & Extortion Pattern Matcher                                          │
│   ├─ Shannon Entropy & Punycode URL Parser                                      │
│   ├─ App Store Metadata Scraper (SSRF-Isolated)                                 │
│   └─ Local Threat Intel IOC DB                                                  │
│          │                                                                      │
│          ▼                                                                      │
│   [ Circuit Breaker: Gemini 2.5 Flash ] ─── (Tripped? Fallback to Heuristics)   │
│          │                                                                      │
│          ▼                                                                      │
│   [ Composite Decision Engine ]                                                 │
│          │                                                                      │
│          ▼                                                                      │
│   [ Explainable Evidence Report Builder ]                                       │
│   (Facts + Inferences + Threat Intel + Technical Uncertainties + Playbook)     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Implemented Integrations
- **National Cybercrime Helpline 1930**: Device dialer integration and official portal guidance (`cybercrime.gov.in`).
- **Apple iTunes Lookup API**: Official unauthenticated lookup for iOS app metadata, ratings, bundle IDs, release dates, and file sizes.
- **Google Play Store Extractor**: Safe server-side JSON-LD and OpenGraph structured data parsing with strict SSRF domain isolation.
- **Google Gemini 2.5 Flash**: Server-side structured AI reasoning for threat forensics, vishing transcript analysis, and risk scoring via the modern `@google/genai` SDK.
- **Circuit Breaker & Safe Cache**: Resilient in-memory bounded cache with singleflight request deduplication and automated failover to deterministic heuristics.
- **Threat Intelligence Network**: Curated active threat signatures across URLhaus, PhishTank, and OpenPhish with real-time dynamic reporting.

### Future Roadmap Enhancements
- Direct Citizen Financial Cyber Fraud Reporting Management System (CFCFRMS) API integration when publicly available to banks/fintechs.
- Automated FIR / Complaint draft generation with export to PDF containing signed SHA-256 evidence hashes.
- Multilingual audio reassurance in regional Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Kannada) for victims in panic.
- Live APK static bytecode manifest extraction for sideloaded files (sandboxed cloud analysis).

---

## 🛡️ ScamShield Secure Identity & Multi-Factor Security Vault

**ScamShield Secure Identity** provides an enterprise-grade cybersecurity identity and authentication experience designed around zero-trust and defense-in-depth principles.

### Key Capabilities
1. **Passwordless FIDO2 / WebAuthn Passkeys**:
   - Native browser integration via `@simplewebauthn/browser` and `@simplewebauthn/server`.
   - Supports platform biometric authenticators (Apple Touch ID, Face ID, Windows Hello, Android Biometrics) and hardware security tokens (YubiKey 5 Series).
   - Challenge-response verification with cryptographic origin and relying-party ID validation.
   - Replay attack protection with 5-minute challenge expiration. Private keys never leave the user's secure hardware enclave.

2. **Cryptographic Email & Phone OTP Verification**:
   - 6-digit cryptographically generated one-time security codes.
   - Zero Plaintext Storage: OTPs are hashed using salted SHA-256 before storage in memory or database.
   - 60-second resend cooldown timer and anti-SMS bombing rate limiting (max 5 attempts).
   - Single-use invalidation upon verification or after 10-minute expiration.
   - Configured for real external delivery providers (Resend API, SMTP, Twilio SMS, Fast2SMS India) with transparent status reporting.

3. **Official Indian Identity Document Verification (KYC)**:
   - **Supported Documents**: Indian Passport, Driving Licence (MoRTH / Parivahan Sarathi), Voter ID (ECI EPIC), and PAN Card (Income Tax Department).
   - **Strict Statutory UIDAI / Aadhaar Exclusion**: Under the *Aadhaar Act, 2016* and Supreme Court directives, ScamShield AI explicitly does not collect, store, or process 12-digit Aadhaar numbers or biometrics. Any attempt to upload or enter an Aadhaar format is rejected with a statutory notice.
   - **Data Rights & Purge**: Users can permanently delete and purge all uploaded identity certificates at any time under the *Digital Personal Data Protection (DPDP) Act, 2023*.
   - **Non-Coercive KYC**: Identity verification is strictly optional; standard scam detection tools remain 100% accessible without KYC.

4. **Security Audit Log & Active Device Management**:
   - Comprehensive audit trail recording all sign-ins, OTP dispatches, passkey additions, and KYC verification events with timestamps, IP addresses, and user-agents.
   - Active device session inspection with "Sign Out From All Devices" revocation action.

---

## 👥 DEMO PROFILES – Explore ScamShield AI

For hackathon judges, security researchers, and first-time evaluators who want to test the full breadth of ScamShield AI without creating a personal account, **Demo Profiles** provides an instant, isolated sandbox evaluation experience.

### Predefined Demo Profiles
1. **Profile 1: Basic User (Alex Chen)**
   - **Access Level**: Essential Protection Tier
   - **Included Tools**: Main Dashboard, SMS & WhatsApp Message Scanner, Phishing URL Analyzer, Awareness Center, Sample Scam Reports.
   - **Preloaded Scenario**: Electricity bill disconnection threat SMS and fake banking KYC reactivate URL.

2. **Profile 2: Security Enthusiast (Priya Nair)**
   - **Access Level**: Advanced Forensics Tier
   - **Included Tools**: All 5 Scanner Modalities (Message, URL, App Authenticity, Screenshot, Phone Call), Explainable AI, Learning Coach, Cybersecurity Quiz.
   - **Preloaded Scenario**: Malicious APK Trojan inspection ("QuickLoan Pro") and CBI Courier vishing call transcript.

3. **Profile 3: Scam Victim Simulation (Rahul Verma)**
   - **Access Level**: Emergency Cyber Help & Containment
   - **Included Tools**: Emergency Cyber Help Dashboard, 1930 Helpline dialer flow, Digital Arrest Extortion Defense Playbook, Fraudulent UPI Incident Dossier Builder.
   - **Preloaded Scenario**: Active ₹48,000 INR extortion containment and Golden Hour bank freeze checklist.

4. **Profile 4: Threat Intel Viewer (Dr. Arvind Mehta)**
   - **Access Level**: Threat Intelligence & Moderation Preview
   - **Included Tools**: Live Scam Tracker, 12 Category Analytics, Regional Heatmap of India (9+ Jurisdictions), Community Reports Queue (Simulation).
   - **Preloaded Scenario**: Correlated National Digital Arrest syndicate cluster #ST-2026-9101 with IOC signatures.

### ⚠️ Demo Data & Safety Disclaimer
- **Simulated Synthetic Data**: Every sample message, scam report, threat count, and extortion notice loaded in Demo Mode is a clearly marked fictional simulation (`[DEMO DATA · SIMULATION ONLY]`).
- **Strict Role Isolation**: Demo sessions use the `DEMO_USER` role. Demo mode never grants production administrative privileges, cannot modify real user credentials, and cannot contact real law enforcement or government databases.
- **Persistent Exit Controls**: An amber "DEMO MODE ACTIVE" indicator banner remains pinned to the viewport, allowing users to switch demo profiles or exit to the standard sign-in screen at any time.

---

## 💻 Development & Automated Test Suites

```bash
# Install dependencies
npm install

# Start development server on Port 3000
npm run dev

# Run TypeScript Linter
npm run lint

# Compile production bundle
npm run build

# Run Live Scam Tracker Tests (Stats, deduplication, categories, regions)
npm run test:tracker

# Run Secure Identity Tests (PBKDF2, sessions, Email OTP, Phone OTP, Passkeys, KYC, Aadhaar exclusion)
npm run test:auth

# Run Demo Profiles Tests (All 4 profiles, access tiers, launch, and exit)
npm run test:demo

# Run Latency & Cache Singleflight Benchmark
node scripts/benchmark-scans.mjs
```

---

## 🎯 Hackathon Evaluator & Technical Defense Guide

### 1. "Is this just an LLM wrapper?"
**No.** ScamShield AI implements a multi-layer defense-in-depth pipeline:
- **Deterministic Heuristic Gatekeepers**: Runs first to identify RFC 3986 violations, Punycode homographs, Shannon entropy anomalies, and known Indian extortion patterns (Digital Arrest, CBI narcotics, MSEDCL power cuts).
- **Sub-5ms Singleflight Cache**: Deterministic requests and duplicate submissions are coalesced and resolved in `~2.3ms` without invoking the LLM, reducing inference costs and latency by orders of magnitude.
- **Circuit Breaker Pattern**: If Gemini API encounters timeouts or is unconfigured, the system fails open safely to deterministic heuristics with 0% downtime.
- **Explainable Evidence Engine**: Rather than echoing prompt completions, it cross-references hard deterministic regex matches against LLM psychological deductions and active threat IOC feeds to produce auditable evidence.

### 2. "Why don't you automatically intercept cellular phone calls or SMS?"
**Because an in-browser web app cannot do so without violating the W3C security sandbox.** Many hackathon projects make false claims about browser capabilities. We deliberately provide:
1. An honest **Web Sandbox Architecture** (WASM OCR, FIDO2 WebAuthn, Safe Navigation Sandbox, Emergency Incident Dossier).
2. A formal **Companion Native Sentinel Blueprint** (`CallScreeningService`, `NotificationListenerService`) for Android/iOS native deployment.

### 3. "How do you handle Indian Statutory Privacy (DPDP & Aadhaar)?"
- **Statutory Aadhaar Exclusion**: Under the *Aadhaar Act 2016* and Supreme Court precedent, we explicitly refuse and reject 12-digit Aadhaar numbers and biometrics. We accept only standard KYC alternatives (Passport, Driving Licence, Voter ID, PAN).
- **DPDP Act 2023 Compliance**: Users have unconditional right to data erasure; all session and verification artifacts can be wiped instantaneously.
- **Zero Server Telemetry**: Incident reports, safe words, and scan history remain client-side in browser storage. No victim data is ever monetized or leaked.

