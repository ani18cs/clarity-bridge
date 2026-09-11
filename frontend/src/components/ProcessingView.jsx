import React, { useState, useEffect } from 'react';
import { 
  FileSearch, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Loader2
} from 'lucide-react';

const STAGES = [
  { id: 1, text: 'Ingesting & OCR scanning document with Gemini 2.5 multimodal...', icon: FileSearch },
  { id: 2, text: 'Executing 4-tier authenticity heuristic & scam pattern scan...', icon: ShieldCheck },
  { id: 3, text: 'Fact-checking key claims and statutory citations against public records...', icon: CheckCircle2 },
  { id: 4, text: 'Formulating prioritized action plan, deadlines, and verified contacts...', icon: Sparkles },
];

export default function ProcessingView() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStageIndex(1), 1200);
    const timer2 = setTimeout(() => setCurrentStageIndex(2), 2600);
    const timer3 = setTimeout(() => setCurrentStageIndex(3), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const activeStage = STAGES[currentStageIndex];

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center">
      
      {/* Animated Spinner & Brand Beacon */}
      <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-brand-200/50 animate-ping opacity-75" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
          <Loader2 className="w-10 h-10 animate-spin" aria-hidden="true" />
        </div>
      </div>

      {/* Screen Reader Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {activeStage.text}
      </div>

      {/* Visual Pipeline Stage Header */}
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Analyzing Your Document
      </h2>
      <p className="text-base font-medium text-brand-700 min-h-[1.75rem] transition-all">
        {activeStage.text}
      </p>

      {/* Stage Tracker Cards */}
      <div className="mt-8 space-y-3 text-left max-w-md mx-auto">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div
              key={stage.id}
              className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
                isDone 
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : isCurrent 
                  ? 'bg-white border-brand-400 shadow-md shadow-brand-500/10 text-slate-900 scale-[1.02]' 
                  : 'bg-slate-50 border-slate-200/60 text-slate-400 opacity-60'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-xs font-bold">{stage.id}</span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-semibold truncate">
                {stage.text.split('...')[0]}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 mt-8">
        Privacy safeguard active: Document text is never logged or exposed.
      </p>
    </div>
  );
}
