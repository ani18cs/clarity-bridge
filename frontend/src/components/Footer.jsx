import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t-3 border-ink py-8 sm:py-10 mt-16 text-center text-xs sm:text-sm text-[#454264] font-medium">
      <div className="max-w-6xl mx-auto px-4 space-y-2">
        <p>
          <strong className="font-display font-extrabold text-ink text-base">ClarityBridge</strong> — Translating confusing notices into clear, verified, grounded action.
        </p>
        <p className="text-xs text-slate-500">
          Powered by Gemini 2.5 Multimodal AI with Grounded Extraction. DPDP Act 2023 Compliant • Ephemeral Processing • Zero PII Retention.
        </p>
      </div>
    </footer>
  );
}
