import React from 'react';

export default function DisclaimerBanner() {
  return (
    <aside 
      aria-label="Civic, legal and data privacy disclaimer"
      className="bg-white border-2 border-dashed border-ink/40 rounded-2xl p-5 text-xs text-[#5b5878] font-medium leading-relaxed shadow-neo-xs"
    >
      <p>
        <strong>Civic & DPDP Act 2023 Notice:</strong> ClarityBridge is an assistive comprehension and triage tool — it is not a lawyer, chartered accountant, or government agency. Authenticity assessments and fact-checks are advisory risk signals, not legal determinations. In accordance with the Digital Personal Data Protection (DPDP) Act 2023 and UIDAI regulations, all documents are processed ephemerally with automatic 4-digit Aadhaar masking and zero persistent PII storage. Always verify statutory notices directly with official portals.
      </p>
    </aside>
  );
}
