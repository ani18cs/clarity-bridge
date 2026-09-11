import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Shield, CheckCircle2 } from 'lucide-react';

const STATUS_STAGES = [
  { text: 'Reading document and verifying image clarity…', icon: '📄' },
  { text: 'Extracting grounded dates, amounts, and reference IDs…', icon: '🔍' },
  { text: 'Cross-checking sender against official registries…', icon: '🏛️' },
  { text: 'Running fraud heuristics and DIN/GSTIN validation…', icon: '🛡️' },
  { text: 'Synthesizing plain-language summary & action plan…', icon: '✨' }
];

export default function ProcessingView() {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STATUS_STAGES.length);
    }, 2200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 92) {
          return prev + Math.floor(Math.random() * 6) + 2;
        }
        return prev;
      });
    }, 450);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const currentStage = STATUS_STAGES[stageIndex];

  return (
    <div className="bg-white border-3 border-ink rounded-neo-lg shadow-neo overflow-hidden max-w-2xl mx-auto text-center animate-fadeIn">
      
      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b-3 border-ink bg-periwinkle-pale text-left">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-ink bg-coral" aria-hidden="true" />
          <span className="w-3.5 h-3.5 rounded-full border-2 border-ink bg-marigold" aria-hidden="true" />
          <span className="w-3.5 h-3.5 rounded-full border-2 border-ink bg-grass" aria-hidden="true" />
          <span className="ml-2 font-bold text-xs sm:text-sm text-ink">ClarityBridge — Multimodal Analysis Engine</span>
        </div>
        <span className="text-[11px] font-black uppercase text-periwinkle-deep px-2.5 py-0.5 rounded-full bg-white border border-ink/30">
          Stage {stageIndex + 1} of {STATUS_STAGES.length}
        </span>
      </div>

      {/* Body */}
      <div className="p-8 sm:p-12 space-y-6">
        
        {/* Animated Icon Container */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-marigold/30 animate-ping opacity-75" />
          <div 
            className="relative w-20 h-20 rounded-full bg-marigold border-3 border-ink flex items-center justify-center text-4xl shadow-neo-sm transition-transform duration-300 transform scale-105"
            aria-hidden="true"
          >
            {currentStage.icon}
          </div>
        </div>

        {/* Dynamic Status Text */}
        <div className="space-y-1.5 min-h-[70px]">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-ink leading-snug transition-all">
            {currentStage.text}
          </h2>
          <p className="text-xs sm:text-sm text-[#454264] font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-periwinkle animate-spin" />
            <span>Gemini Multimodal AI • Grounded Zero-Guess Verification</span>
          </p>
        </div>

        {/* Progress Track */}
        <div className="space-y-2">
          <div className="w-full max-w-sm mx-auto h-4 rounded-full border-2.5 border-ink bg-slate-100 overflow-hidden shadow-inner p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-periwinkle to-grass rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 95)}%` }}
            />
          </div>
          <div className="text-[11px] font-extrabold text-ink/70">
            {Math.min(progress, 95)}% Processing Complete
          </div>
        </div>

        {/* Reassurance Footer */}
        <div className="p-3 bg-periwinkle-pale rounded-xl border-1.5 border-ink/20 max-w-md mx-auto text-xs text-[#5b5878] font-medium flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-periwinkle-deep flex-shrink-0" />
          <span>DPDP Act 2023 Compliant • Ephemeral In-Memory Processing</span>
        </div>

      </div>

    </div>
  );
}
