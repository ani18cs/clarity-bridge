import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <aside 
      aria-label="Legal and financial disclaimer"
      className="rounded-2xl border border-slate-200/90 bg-slate-100/90 p-4 sm:p-5 text-xs text-slate-600 space-y-1.5"
    >
      <div className="flex items-center space-x-2 font-bold text-slate-800">
        <ShieldAlert className="w-4 h-4 text-slate-500" aria-hidden="true" />
        <span>Important Civic & Legal Disclaimer</span>
      </div>
      <p className="leading-relaxed">
        ClarityBridge helps you understand and act on documents — it is not a lawyer, accountant, or government agency, and does not replace professional legal or financial advice. Authenticity and fact-check results are risk signals based on available information, not a guarantee. When in doubt, contact the issuing authority directly using verified public directory phone numbers.
      </p>
    </aside>
  );
}
