import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export default function AuthenticityBadge({ authenticity = {} }) {
  const verdict = authenticity.verdict || 'Verified';
  const confidence = Math.round((authenticity.confidence || 0.85) * 100);
  const reasons = authenticity.reasons || [];

  let badgeConfig = {
    title: 'Verified Official Document',
    subtitle: 'Low risk of fraud or impersonation',
    bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
    badgeBg: 'bg-emerald-600 text-white',
    icon: ShieldCheck,
    tagColor: 'text-emerald-700'
  };

  if (verdict === 'Likely Fraudulent') {
    badgeConfig = {
      title: 'Likely Fraudulent / Scam Notice',
      subtitle: 'High probability of fraudulent solicitation or impersonation',
      bg: 'bg-red-50 border-red-300 text-red-950',
      badgeBg: 'bg-red-600 text-white',
      icon: ShieldAlert,
      tagColor: 'text-red-700'
    };
  } else if (verdict === 'Use Caution') {
    badgeConfig = {
      title: 'Use Caution / Unverified Claims',
      subtitle: 'Contains irregular contact channels, missing seals, or ambiguous sender info',
      bg: 'bg-amber-50 border-amber-300 text-amber-950',
      badgeBg: 'bg-amber-600 text-white',
      icon: AlertTriangle,
      tagColor: 'text-amber-700'
    };
  }

  const IconComponent = badgeConfig.icon;

  return (
    <section 
      aria-label="Document authenticity and fraud risk assessment"
      className={`rounded-2xl border p-5 sm:p-6 transition-all ${badgeConfig.bg}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        
        {/* Left: Icon and Title */}
        <div className="flex items-center space-x-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${badgeConfig.badgeBg}`}>
            <IconComponent className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                Authenticity Verdict:
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${badgeConfig.badgeBg}`}>
                {verdict.toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
              {badgeConfig.title}
            </h2>
          </div>
        </div>

        {/* Right: Confidence Metric */}
        <div className="sm:text-right">
          <div className="text-xs opacity-75 font-semibold">Signal Confidence</div>
          <div className="text-2xl font-black">{confidence}%</div>
        </div>

      </div>

      {/* Rationale Bullet Points */}
      <div className="mt-4 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Evaluation Rationale & Signals Detected</span>
        </h4>
        <ul className="space-y-1.5 text-xs sm:text-sm font-medium">
          {reasons.map((reason, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-slate-500 font-bold mt-0.5">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

    </section>
  );
}
