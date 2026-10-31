import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Flame,
  Award,
  AlertTriangle
} from 'lucide-react';

interface PsychologicalTactic {
  title: string;
  trigger: string;
  howScammersUseIt: string;
  counterScript: string;
}

const TACTICS: PsychologicalTactic[] = [
  {
    title: 'Manufactured Urgency',
    trigger: 'Time Scarcity / Panic',
    howScammersUseIt: '"Your account will be suspended in 15 minutes", "Arrest warrant will be executed within 1 hour". Shuts down analytical thinking.',
    counterScript: '"I never make financial decisions or share credentials under time pressure. I will contact the organization independently via their official hotline."'
  },
  {
    title: 'Fabricated Authority',
    trigger: 'Obedience to Hierarchy',
    howScammersUseIt: 'Posing as CBI Inspectors, Supreme Court Registrar, RBI auditors, or FedEx Customs Officials to demand deference.',
    counterScript: '"Legitimate law enforcement serves physical notices in person through local police stations, never demanding money or online video trials."'
  },
  {
    title: 'Forced Isolation',
    trigger: 'Removal of Second Opinions',
    howScammersUseIt: '"Do not disconnect this call", "Do not tell your family, this is a secret national security investigation under Section 144".',
    counterScript: '"Any demand that I hide a financial transaction from my family or legal counsel is the definitive signature of fraud. Disconnecting now."'
  },
  {
    title: 'Unearned Windfall / Greed',
    trigger: 'Too-Good-To-Be-True Reward',
    howScammersUseIt: '"Earn ₹8,000/day by liking YouTube videos", "You won a lottery in UK", "Guaranteed 40% monthly returns on crypto mining".',
    counterScript: '"There are no guaranteed 40% returns without risk. Legitimate companies never pay high wages for effortless button clicks."'
  }
];

export const LearningCoachView: React.FC = () => {
  const [selectedTactic, setSelectedTactic] = useState<PsychologicalTactic>(TACTICS[0]);
  const [userInput, setUserInput] = useState('');
  const [coachFeedback, setCoachFeedback] = useState<string | null>(null);

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const lower = userInput.toLowerCase();
    if (lower.includes('no') || lower.includes('verify') || lower.includes('hang up') || lower.includes('official') || lower.includes('police station') || lower.includes('safe word') || lower.includes('1930')) {
      setCoachFeedback('Excellent defense instinct! You refused immediate compliance, asserted verification boundaries, and broke their psychological trance. In real life, hanging up is your strongest superpower.');
    } else {
      setCoachFeedback('Good effort, but remember: scammers want to keep you talking to wear down your willpower. Keep responses short and definitive: "I will verify independently with official authorities." Then hang up.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Behavioral Cyber Defense</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            AI <span className="text-cyan-400">Learning Coach</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Scams don&apos;t hack computers — they hack human psychology. Master the 4 cognitive vulnerabilities criminals exploit and practice counter-scripts to stay unshakeable.
          </p>
        </div>
      </div>

      {/* Grid of 4 Psychological Levers */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
          Cognitive Exploitation Levers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TACTICS.map((tactic) => (
            <div
              key={tactic.title}
              onClick={() => {
                setSelectedTactic(tactic);
                setCoachFeedback(null);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedTactic.title === tactic.title
                  ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg'
                  : 'bg-[#0B132B]/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-white">{tactic.title}</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {tactic.trigger}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                {tactic.howScammersUseIt}
              </p>
              <div className="p-3 rounded-xl bg-[#070B14] border border-slate-800/80 text-xs text-cyan-300 font-mono">
                <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">
                  Mental Counter-Script:
                </span>
                &quot;{tactic.counterScript}&quot;
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Objection Handling Sandbox */}
      <div className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase font-mono">
          <Sparkles className="w-4 h-4" />
          <span>Interactive Response Drill: {selectedTactic.title}</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200">
          <span className="font-bold uppercase font-mono block text-[10px] text-rose-400 mb-1">
            Incoming Scammer Pressure:
          </span>
          &quot;This is Officer Sharma from Crime Branch. We have issued an arrest warrant. You must stay on video call and transfer ₹50,000 to the verification vault within 20 minutes or our team will raid your house!&quot;
        </div>

        <form onSubmit={handleEvaluate} className="space-y-3">
          <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block">
            How would you respond before hanging up?
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your response (e.g. 'I will verify this at my local police station...')"
              className="flex-1 bg-[#070B14] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
            >
              Analyze Response
            </button>
          </div>
        </form>

        {coachFeedback && (
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/50 text-xs text-cyan-200 space-y-1 animate-in fade-in">
            <div className="font-bold font-mono uppercase text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Coach Evaluation</span>
            </div>
            <p className="leading-relaxed">{coachFeedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};
