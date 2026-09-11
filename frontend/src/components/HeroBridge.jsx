import React from 'react';

export default function HeroBridge({ onSelectMode }) {
  return (
    <section className="pt-8 sm:pt-12 pb-10 relative">
      
      {/* Tag badge */}
      <div className="inline-flex items-center gap-2 bg-card-marigold border-2 border-ink rounded-full px-4 py-1.5 font-bold text-xs sm:text-sm text-ink mb-6 shadow-neo-xs">
        <span>✨ No lawyer required</span>
      </div>

      {/* Main Heading */}
      <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.08] tracking-tight max-w-2xl mb-4">
        Confusing letter?<br />
        Let's <span className="relative inline-block whitespace-nowrap">
          cross that bridge
          <svg className="absolute left-0 -bottom-2 w-full h-3.5 text-marigold" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true">
            <path d="M2 10 Q75 2 150 8 T298 6" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </span>.
      </h1>

      <p className="text-base sm:text-lg md:text-xl text-[#454264] max-w-2xl mb-8 leading-relaxed font-normal">
        Snap a photo, paste a message, or just talk it out. ClarityBridge reads any official (or suspicious) document and hands you back plain steps you can actually trust.
      </p>

      {/* Hero Quick Actions */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-12">
        <button 
          type="button" 
          onClick={() => onSelectMode('camera')}
          className="btn-neo btn-primary-neo"
        >
          <span>📸 Try with a photo</span>
        </button>
        <button 
          type="button" 
          onClick={() => onSelectMode('voice')}
          className="btn-neo btn-marigold-neo"
        >
          <span>🎙️ Try with your voice</span>
        </button>
        <button 
          type="button" 
          onClick={() => onSelectMode('upload')}
          className="btn-neo btn-ghost-neo"
        >
          <span>📎 Upload PDF/File</span>
        </button>
      </div>

      {/* Animated Bridge Illustration Scene */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-end relative pt-2">
        
        {/* Left Shore: Confusing */}
        <div className="md:col-span-4 bg-card-coral border-3 border-ink rounded-neo p-5 sm:p-6 shadow-neo transform md:-rotate-2 transition-transform hover:rotate-0">
          <div className="text-2xl sm:text-3xl mb-2.5 tracking-widest" aria-hidden="true">
            📄😵💸
          </div>
          <h3 className="font-display font-extrabold text-xl text-ink mb-1">
            Confusing
          </h3>
          <p className="text-xs sm:text-sm text-[#3a3752] font-medium leading-relaxed">
            Dense legal jargon, a scary deadline, and no idea if it's even real.
          </p>
        </div>

        {/* Center: Bridge Path with Moving Traveler */}
        <div className="md:col-span-4 flex items-center justify-center py-2" aria-hidden="true">
          <svg viewBox="0 0 240 90" className="w-full max-w-[240px] h-auto overflow-visible">
            <path 
              id="bridgeArchPath" 
              d="M10 80 Q120 -10 230 80" 
              fill="none" 
              stroke="#1C1B2E" 
              strokeWidth="4" 
              strokeDasharray="1 12" 
              strokeLinecap="round"
            />
            <circle r="8" fill="#5B5FEF" stroke="#1C1B2E" strokeWidth="2.5">
              <animateMotion dur="3.2s" repeatCount="indefinite" path="M10 80 Q120 -10 230 80" />
            </circle>
          </svg>
        </div>

        {/* Right Shore: Clear */}
        <div className="md:col-span-4 bg-card-grass border-3 border-ink rounded-neo p-5 sm:p-6 shadow-neo transform md:rotate-2 transition-transform hover:rotate-0">
          <div className="text-2xl sm:text-3xl mb-2.5 tracking-widest" aria-hidden="true">
            ✅📅☎️
          </div>
          <h3 className="font-display font-extrabold text-xl text-ink mb-1">
            Clear
          </h3>
          <p className="text-xs sm:text-sm text-[#08281c] font-medium leading-relaxed">
            Three plain steps, a real deadline, and a verdict you can trust.
          </p>
        </div>

      </div>

    </section>
  );
}
