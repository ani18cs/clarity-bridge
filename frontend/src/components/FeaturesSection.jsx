import React from 'react';

const FEATURES = [
  {
    icon: '🗣️',
    title: 'Any input, your way',
    desc: 'Photo, PDF, pasted text, or just describe it out loud — one pipeline handles all of it.',
    bg: 'bg-white'
  },
  {
    icon: '🕵️',
    title: 'Real or fake?',
    desc: 'Flags scam patterns, mismatched senders, and AI-generated red flags before you act on anything.',
    bg: 'bg-card-marigold'
  },
  {
    icon: '🔎',
    title: 'Fact-checked claims',
    desc: 'Amounts, deadlines, and cited authorities get checked against public sources — not just trusted blindly.',
    bg: 'bg-card-grass'
  },
  {
    icon: '🗂️',
    title: 'PDF you can keep',
    desc: 'Every action plan downloads as a clean PDF — bring it to the office, the call, or the courthouse.',
    bg: 'bg-card-coral'
  },
  {
    icon: '🔊',
    title: 'Read aloud, any language',
    desc: 'Built for low-literacy and low-vision users first, from the ground up — not bolted on after.',
    bg: 'bg-periwinkle-pale'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-12 border-t-2 border-ink/10" id="how">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink mb-3">
          One bridge, every kind of document
        </h2>
        <p className="text-[#454264] text-base sm:text-lg">
          Government notices, eviction letters, benefit forms, research papers, syllabi, bills, suspicious texts — if it's confusing or official-looking, ClarityBridge can take a look.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feat, idx) => (
          <div
            key={idx}
            className={`border-2.5 border-ink rounded-2xl p-6 shadow-neo-sm ${feat.bg} transition-transform hover:-translate-y-1`}
          >
            <div 
              className="w-12 h-12 rounded-xl bg-ink text-white flex items-center justify-center text-2xl mb-4 shadow-sm"
              aria-hidden="true"
            >
              {feat.icon}
            </div>
            <h3 className="font-display font-extrabold text-lg text-ink mb-2">
              {feat.title}
            </h3>
            <p className="text-sm text-[#3a3752] font-medium leading-relaxed">
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
