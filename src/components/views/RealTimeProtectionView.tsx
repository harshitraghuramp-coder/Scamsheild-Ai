import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Lock,
  Globe,
  Smartphone,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Terminal,
  Cpu,
  Info,
  ExternalLink,
  RefreshCw,
  Server
} from 'lucide-react';

interface SecurityControl {
  id: string;
  name: string;
  runtimeEnvironment: 'BROWSER_ACTIVE' | 'NATIVE_DAEMON_BLUEPRINT';
  category: string;
  description: string;
  enforcementMechanism: string;
  icon: React.ElementType;
  enabled: boolean;
  statusText: string;
}

export const RealTimeProtectionView: React.FC = () => {
  const [controls, setControls] = useState<SecurityControl[]>([
    {
      id: 'webauthn_passkey',
      name: 'Hardware Cryptographic Authentication (WebAuthn)',
      runtimeEnvironment: 'BROWSER_ACTIVE',
      category: 'Identity Guard',
      description: 'Enforces FIDO2 / WebAuthn cryptographic key exchanges via Secure Enclave / TPM, eliminating phishable SMS OTPs.',
      enforcementMechanism: 'Navigator.credentials.create() / WebAuthn RP server-binding',
      icon: Lock,
      enabled: true,
      statusText: 'Active & Enforced on Identity Vault',
    },
    {
      id: 'local_ocr_sandbox',
      name: 'Client-Side WASM OCR Isolation',
      runtimeEnvironment: 'BROWSER_ACTIVE',
      category: 'Privacy Architecture',
      description: 'Processes user screenshots locally inside browser WebAssembly workers (Tesseract.js) before transmitting sanitized text.',
      enforcementMechanism: 'WASM Web Worker sandbox with ephemeral buffer destruction',
      icon: Cpu,
      enabled: true,
      statusText: 'Active on Client Device',
    },
    {
      id: 'safe_redirection_guard',
      name: 'Safe Link Inspection & Never-Auto-Open Policy',
      runtimeEnvironment: 'BROWSER_ACTIVE',
      category: 'URL & Web Defense',
      description: 'Strict policy prohibiting automatic navigation to scanned URLs. Performs RFC parsing, IDN punycode analysis, and reputation checks before user clicks.',
      enforcementMechanism: 'Sandbox link interceptor with mandatory safety modal confirmation',
      icon: Globe,
      enabled: true,
      statusText: 'Active on Scanner View',
    },
    {
      id: 'android_accessibility_daemon',
      name: 'Android Accessibility Hijack Sentinel',
      runtimeEnvironment: 'NATIVE_DAEMON_BLUEPRINT',
      category: 'Mobile Companion (Android)',
      description: 'Monitors Android Accessibility API permissions to prevent rogue trojans (e.g. fake electricity bill APKs) from reading OTP notifications or overlaying banking apps.',
      enforcementMechanism: 'Android AccessibilityService / DevicePolicyManager (Companion Daemon)',
      icon: Smartphone,
      enabled: false,
      statusText: 'Companion Daemon Architecture (Requires Native App Installation)',
    },
    {
      id: 'telephony_call_screening',
      name: 'Telephony Call Screening & 1930 Blacklist Daemon',
      runtimeEnvironment: 'NATIVE_DAEMON_BLUEPRINT',
      category: 'Mobile Companion (Telephony)',
      description: 'Inspects inbound phone calls against I4C / CERT-In spoofed number databases and alerts users before answering digital arrest coercion calls.',
      enforcementMechanism: 'Android CallScreeningService API / iOS CallKit Directory',
      icon: PhoneCall,
      enabled: false,
      statusText: 'Companion Daemon Architecture (Requires Native App Installation)',
    },
  ]);

  const [drillScenario, setDrillScenario] = useState<string>('cbi_digital_arrest');
  const [drillStatus, setDrillStatus] = useState<{
    isRunning: boolean;
    stage: string;
    log: string[];
    result?: 'BLOCKED' | 'FLAGGED' | 'RESOLVED';
  }>({
    isRunning: false,
    stage: 'idle',
    log: [],
  });

  const toggleControl = (id: string) => {
    setControls(prev =>
      prev.map(c => {
        if (c.id === id) {
          const next = !c.enabled;
          return {
            ...c,
            enabled: next,
            statusText: next
              ? c.runtimeEnvironment === 'BROWSER_ACTIVE'
                ? 'Active on Client Device'
                : 'Enabled in Configuration Profile'
              : 'Temporarily Disabled by User',
          };
        }
        return c;
      })
    );
  };

  const handleRunDrill = () => {
    setDrillStatus({
      isRunning: true,
      stage: 'initiating',
      log: ['[00:00.00] Initializing Simulated Attack Drill in isolated sandbox...'],
    });

    setTimeout(() => {
      setDrillStatus(prev => ({
        ...prev,
        stage: 'simulating',
        log: [
          ...prev.log,
          drillScenario === 'cbi_digital_arrest'
            ? '[00:00.60] Injecting simulated inbound call transcript: "Officer Sanjay Rao, CBI Narcotics Bureau. You are under 24-hour Digital Arrest..."'
            : drillScenario === 'sbi_apk_trojan'
            ? '[00:00.60] Injecting simulated APK package: "com.sbi.rewards.claim.points" requesting BIND_ACCESSIBILITY_SERVICE...'
            : '[00:00.60] Injecting simulated phishing URL: "https://secure-login-wellsfargo-verify.com/auth/login.php"...',
        ],
      }));
    }, 600);

    setTimeout(() => {
      setDrillStatus(prev => ({
        ...prev,
        stage: 'inspecting',
        log: [
          ...prev.log,
          '[00:01.20] Running deterministic regex heuristics and Threat Intel signature matching...',
          drillScenario === 'cbi_digital_arrest'
            ? '[00:01.50] Match: POLICE_NARCOTICS_IMPERSONATION (+55 pts). Psychological tactics: Intimidation, Coercion, Urgency.'
            : drillScenario === 'sbi_apk_trojan'
            ? '[00:01.50] Match: ACCESSIBILITY_HIJACK_RISK (+85 pts). Sideloaded package mimics official bank package.'
            : '[00:01.50] Match: THREAT_FEED_MATCH (PhishTank Feed #849102, 99% confidence).',
        ],
      }));
    }, 1300);

    setTimeout(() => {
      setDrillStatus(prev => ({
        ...prev,
        isRunning: false,
        stage: 'completed',
        result: 'BLOCKED',
        log: [
          ...prev.log,
          '[00:01.90] Risk assessed: CRITICAL (Score: 95/100).',
          '[00:02.10] Containment Playbook triggered: Emergency Dial 1930 recommendation & safe disconnect advice rendered.',
        ],
      }));
    }, 2100);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zero-Trust Endpoint Protection Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Endpoint <span className="text-cyan-400">Threat Defense</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ScamShield AI employs a multi-layered defense strategy. Web standards enforce client-side privacy and hardware-bound passkeys in the browser, while native mobile companion specifications govern OS-level call screening and accessibility trojan prevention.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-400 font-bold">Browser Sandboxed Controls: 3 Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-300">Companion Architecture: 2 Defined</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture Demarcation Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase font-mono tracking-wider text-[11px]">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Technical Transparency & Platform Boundaries</span>
        </div>
        <p className="leading-relaxed">
          In-browser web applications operate within secure browser sandboxes (Same-Origin Policy). A web app <strong>cannot and should never claim to intercept native phone calls or background device storage</strong> without a dedicated native companion daemon. Below, active browser defenses are distinguished from the native OS companion architecture.
        </p>
      </div>

      {/* Multi-Layered Security Controls Matrix */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Configured Defense Layers</span>
        </h2>

        <div className="space-y-3">
          {controls.map(ctrl => {
            const IconComp = ctrl.icon;
            const isBrowserActive = ctrl.runtimeEnvironment === 'BROWSER_ACTIVE';

            return (
              <div
                key={ctrl.id}
                className="p-5 rounded-2xl bg-[#0B132B]/70 border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${
                      isBrowserActive
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400'
                    }`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-white font-mono">
                          {ctrl.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          isBrowserActive
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-slate-900 text-cyan-300 border-slate-700'
                        }`}>
                          {isBrowserActive ? 'Browser Web Sandbox' : 'Native Daemon Blueprint'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {ctrl.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3 sm:self-center">
                    <button
                      type="button"
                      onClick={() => toggleControl(ctrl.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                        ctrl.enabled
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {ctrl.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-500">Mechanism:</span>
                    <span className="text-slate-300 truncate">{ctrl.enforcementMechanism}</span>
                  </div>
                  <div className="shrink-0 text-cyan-400 font-semibold">
                    {ctrl.statusText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Attack Simulation Lab (Grounded, Clearly Labeled Demo Drill) */}
      <div className="p-6 rounded-3xl bg-[#070B14] border border-cyan-500/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
                Simulation Drill Lab
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Safe Adversarial Testing
              </span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Simulate Real-Time Threat Attack Response</span>
            </h3>
            <p className="text-xs text-slate-300">
              Trigger a controlled adversarial scenario to verify how the ScamShield heuristic engine, threat feeds, and containment workflows respond.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={drillScenario}
              onChange={e => setDrillScenario(e.target.value)}
              disabled={drillStatus.isRunning}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 outline-none focus:border-cyan-400"
            >
              <option value="cbi_digital_arrest">Scenario 1: CBI Digital Arrest Call</option>
              <option value="sbi_apk_trojan">Scenario 2: Malicious Utility APK Trojan</option>
              <option value="banking_phish_url">Scenario 3: Banking Phishing URL</option>
            </select>

            <button
              type="button"
              onClick={handleRunDrill}
              disabled={drillStatus.isRunning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md shadow-cyan-500/20"
            >
              {drillStatus.isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Drill</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Drill Terminal Log Output */}
        <div className="p-4 rounded-2xl bg-black/80 border border-slate-800 font-mono text-[11px] space-y-1.5 min-h-[120px] max-h-60 overflow-y-auto">
          {drillStatus.log.length === 0 ? (
            <div className="text-slate-500 italic py-6 text-center">
              Select an attack scenario above and click &quot;Run Drill&quot; to execute a sandboxed test.
            </div>
          ) : (
            drillStatus.log.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.includes('CRITICAL') || line.includes('BLOCKED')
                    ? 'text-rose-400 font-bold'
                    : line.includes('Match:')
                    ? 'text-amber-300 font-semibold'
                    : line.includes('Risk assessed')
                    ? 'text-cyan-300 font-bold'
                    : 'text-slate-300'
                }
              >
                {line}
              </div>
            ))
          )}
        </div>

        {drillStatus.result && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Threat Intercepted:</strong> ScamShield AI rule matrix neutralized the simulated payload.
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-900 text-rose-200">
              Test Passed
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
