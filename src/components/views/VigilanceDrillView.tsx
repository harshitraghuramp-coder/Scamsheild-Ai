import React, { useState } from 'react';
import { QuizScenario } from '../../types';
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';

const SCENARIOS: QuizScenario[] = [
  {
    id: 's1',
    title: 'Urgent Bank Profile Update SMS',
    sender: 'SMS: +1 (833) 491-0192 (Sender ID: CHASE-SEC)',
    content: `CHASE ALERT: Your online banking profile has been locked following 3 failed password attempts in Amsterdam, NL. Restore access immediately to avoid card cancellation: https://chase-online-account-unlock.top/verify?ref=8910`,
    isScam: true,
    scamCategory: 'Bank KYC Smishing',
    clues: [
      'Sender uses non-official 10-digit number rather than Chase verified 5-digit shortcode (24273).',
      'The URL domain ends with .top instead of official chase.com.',
      'Manufactures extreme urgency regarding card cancellation.'
    ],
    explanation: 'Scam. Legitimate banks never use .top domains to unlock accounts. Always type your bank\'s URL directly into your browser or call the number on the back of your card.',
    realWorldImpact: 'Victims who submit credentials lose online banking access within minutes and face wire transfers or Zelle drains.'
  },
  {
    id: 's2',
    title: 'Google Security Key Sign-in Alert',
    sender: 'Email: no-reply@accounts.google.com',
    content: `New sign-in on Windows. Your Google Account user@gmail.com was just signed in to from Chrome on Windows in Chicago, IL. If this was you, you don't need to do anything. If this wasn't you, review your recent activity at https://myaccount.google.com/notifications`,
    isScam: false,
    clues: [
      'Sender domain matches official @accounts.google.com with valid SPF/DKIM authentication.',
      'Destination link leads to genuine myaccount.google.com.',
      'Does not pressure you to call an unknown 1-800 number or provide a password.'
    ],
    explanation: 'Legitimate. This is an authentic Google security notification pointing directly to official Google settings without coercive panic language.',
    realWorldImpact: 'Checking legitimate alerts allows you to quickly terminate rogue sessions if an unauthorized party indeed gained access.'
  },
  {
    id: 's3',
    title: 'Remote Software Internship Recruiter',
    sender: 'LinkedIn InMail: Sarah Davis (Global Talent HR)',
    content: `Hi there! We reviewed your profile and want to offer you our Remote Software Developer Internship ($45/hr). No technical interview needed! Please add our hiring coordinator @GlobalTech_Sarah_HR on Telegram right away to process your laptop setup. You'll need to submit a refundable $150 equipment courier fee before 5 PM.`,
    isScam: true,
    scamCategory: 'Employment Advance Fee Scam',
    clues: [
      'No technical interview or code assessment for a $45/hour developer role.',
      'Redirects off professional platform to Telegram encrypted messaging.',
      'Demands candidate pay an upfront "equipment courier fee".'
    ],
    explanation: 'Scam. Real software companies never charge interns for equipment or onboarding, and never conduct recruitment exclusively over anonymous Telegram chat handles.',
    realWorldImpact: 'Students lose hundreds of dollars and their personal identity documents (SSN, passport) submitted during "fake onboarding".'
  },
  {
    id: 's4',
    title: 'Geek Squad $499 Auto-Renewal Notice',
    sender: 'Email: billing-desk891@gmail.com (Display: Geek Squad Billing)',
    content: `Thank you for your business! Your annual Geek Squad Protection plan has automatically renewed. We have debited $499.00 USD from your account. If you did not authorize this subscription, please call our 24/7 cancellation desk immediately at +1-888-492-0193. Do NOT reply to this email.`,
    isScam: true,
    scamCategory: 'Refund & Screen Takeover Scam',
    clues: [
      'Sent from a personal free @gmail.com address rather than bestbuy.com.',
      'Provides a toll-free number rather than a dispute portal.',
      'Forces you to call in panic to cancel an imaginary charge.'
    ],
    explanation: 'Scam. The classic Geek Squad / Norton refund scam. Calling the number connects you to a fake support team who will coerce you into installing AnyDesk to compromise your PC.',
    realWorldImpact: 'Victims often lose thousands of dollars via manipulated bank HTML and coerced wire transfers.'
  },
  {
    id: 's5',
    title: 'GitHub Password Reset Confirmation',
    sender: 'Email: support@github.com',
    content: `We received a request to reset your GitHub password for username "dev-coder". If you initiated this request, click the link below to set a new password: https://github.com/password_reset?token=9ab38210. If you did not make this request, you can safely ignore this email.`,
    isScam: false,
    clues: [
      'Originates from official support@github.com.',
      'Link points strictly to official github.com domain over HTTPS.',
      'Standard neutral security phrasing ("If you did not make this request, safely ignore").'
    ],
    explanation: 'Legitimate. A standard transactional password reset link from GitHub. If you did not trigger it, someone may have typed your username by mistake.',
    realWorldImpact: 'Recognizing standard transactional emails prevents unnecessary panic while encouraging users to audit their 2FA settings.'
  },
  {
    id: 's6',
    title: 'USPS Package Address Issue',
    sender: 'SMS: +1 (202) 555-0143',
    content: `USPS: Your parcel cannot be delivered because the shipping address is missing a street number. Please update your details within 12 hours or item will be returned: https://usps-tracking-package-redelivery.buzz/claim`,
    isScam: true,
    scamCategory: 'Postal Delivery Smishing',
    clues: [
      'USPS does not send tracking notices from consumer phone numbers unless requested by the recipient.',
      'The domain uses .buzz instead of official usps.com.',
      '12-hour ultimatum to induce hasty action.'
    ],
    explanation: 'Scam. USPS smishing designed to steal credit card information under the guise of paying a nominal $2 redelivery fee.',
    realWorldImpact: 'Victims incur unauthorized monthly subscriptions and compromised credit card numbers.'
  },
  {
    id: 's7',
    title: 'Police Narcotics "Digital Arrest" Call',
    sender: 'Phone Call: +91 22 2262 0111 (Display: Mumbai Cyber Crime Unit)',
    content: `Caller: "This is Inspector Sharma from Narcotics Cyber Cell. A courier parcel with 250g MDMA was intercepted with your Aadhaar ID. A non-bailable arrest warrant has been issued. You are placed under Digital Arrest. Do not hang up or tell your family. Connect on Skype video now and transfer your bank balance to the RBI verification safe account to clear your name."`,
    isScam: true,
    scamCategory: 'Police Impersonation & Digital Arrest Call',
    clues: [
      'No law enforcement agency in the world enforces "Digital Arrest" over phone or video.',
      'Caller demands that you stay on the line and forbids talking to family or legal counsel (isolation tactic).',
      'Demands money transfer to a supposed "government verification safe account".'
    ],
    explanation: 'Scam. Transnational organized syndicates use spoofed caller IDs and fake police uniforms on video to intimidate victims into liquidating their savings under threat of imaginary arrest.',
    realWorldImpact: 'Victims of digital arrest scams have lost tens of thousands of dollars in panic before contacting real police.'
  }
];

export const VigilanceDrillView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, boolean>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);

  const currentScenario = SCENARIOS[currentIndex];
  const isFinished = currentIndex >= SCENARIOS.length;

  const handleSelectAnswer = (choiceIsScam: boolean) => {
    if (showAnswer) return;

    const isCorrect = choiceIsScam === currentScenario.isScam;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: choiceIsScam,
    }));

    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setShowAnswer(false);
    setScore(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span>Vigilance Drill: Scam or Legitimate?</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test your forensic instincts against real-world scenarios. Identify deceptive cues before making a high-risk click.
          </p>
        </div>

        {!isFinished && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Scenario</span>
            <span className="text-cyan-400 font-bold">{currentIndex + 1}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{SCENARIOS.length}</span>
          </div>
        )}
      </div>

      {!isFinished ? (
        /* Scenario Card */
        <div className="p-6 rounded-2xl bg-[#0B132B]/90 border border-cyan-500/30 backdrop-blur-md space-y-6">
          {/* Title and Sender Header */}
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
              Scenario #{currentIndex + 1}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {currentScenario.title}
            </h3>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="text-slate-500">Header:</span>
              <span className="text-cyan-300">{currentScenario.sender}</span>
            </div>
          </div>

          {/* Scenario Text Mock */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-line shadow-inner">
            {currentScenario.content}
          </div>

          {/* User Choices */}
          {!showAnswer ? (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                What is your forensic verdict?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectAnswer(false)}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 font-bold text-sm transition cursor-pointer hover:cyber-glow-cyan"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Legitimate Communication</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAnswer(true)}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 font-bold text-sm transition cursor-pointer hover:cyber-glow-red"
                >
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>Fraudulent Scam / Phishing</span>
                </button>
              </div>
            </div>
          ) : (
            /* Answer Forensic Breakdown */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  userAnswers[currentIndex] === currentScenario.isScam
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                }`}
              >
                {userAnswers[currentIndex] === currentScenario.isScam ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {userAnswers[currentIndex] === currentScenario.isScam
                      ? 'Correct Forensic Evaluation!'
                      : 'Incorrect Assessment — High Risk Misclassification!'}
                  </div>
                  <div className="text-xs mt-1 text-slate-300">
                    Actual Status: <strong className="text-white uppercase">{currentScenario.isScam ? 'Scam / Phishing Attack' : 'Legitimate Official Notice'}</strong>
                  </div>
                </div>
              </div>

              {/* Clues */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Forensic Indicators in this Scenario:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {currentScenario.clues.map((clue, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{clue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Real World Impact */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-700/40 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-indigo-300 uppercase text-[11px] block">
                  Real-World Risk & Impact:
                </span>
                <p>{currentScenario.realWorldImpact}</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <span>{currentIndex + 1 < SCENARIOS.length ? 'Next Scenario' : 'View Final Score'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Completion Summary Screen */
        <div className="p-8 rounded-2xl bg-[#0B132B]/90 border border-cyan-500/30 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/20">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white">Drill Complete</h3>
            <p className="text-xs text-slate-400 mt-1">
              Here is your cybersecurity vigilance ranking:
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-sm mx-auto space-y-2">
            <div className="text-4xl font-extrabold font-mono text-cyan-300">
              {score} / {SCENARIOS.length}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {score === SCENARIOS.length
                ? 'Cyber Sentinel (Master Vigilance)'
                : score >= 4
                ? 'Vigilant Defender (Above Average)'
                : 'Vulnerable User (Practice Needed)'}
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Scammers constantly alter domains and tone. Remember the golden rule: Never click unsolicited links, never share OTPs, and always independently navigate to the verified corporate portal.
          </p>

          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Drill</span>
          </button>
        </div>
      )}
    </div>
  );
};
