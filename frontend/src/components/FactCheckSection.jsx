import React, { useState } from 'react';
import { 
  CheckCircle, 
  HelpCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Search 
} from 'lucide-react';

const STATUS_CONFIG = {
  Verified: {
    icon: CheckCircle,
    label: 'Verified Claim',
    tag: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    iconColor: 'text-emerald-600'
  },
  Contradicted: {
    icon: XCircle,
    label: 'Contradicted Claim',
    tag: 'bg-red-100 text-red-900 border-red-300',
    iconColor: 'text-red-600'
  },
  Unverifiable: {
    icon: HelpCircle,
    label: 'Unverifiable / Case-Specific',
    tag: 'bg-blue-100 text-blue-900 border-blue-300',
    iconColor: 'text-blue-600'
  }
};

export default function FactCheckSection({ factChecks = [] }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!factChecks || factChecks.length === 0) return null;

  return (
    <section 
      aria-labelledby="fact-check-title"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors focus-visible:ring-2 focus-visible:ring-brand-600"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Search className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 id="fact-check-title" className="text-lg font-bold text-slate-900">
              Claim Fact-Check Annotations ({factChecks.length})
            </h3>
            <p className="text-xs text-slate-500">
              Cross-referenced via Google Search Grounding and Public Legal Repositories
            </p>
          </div>
        </div>

        <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-3">
          {factChecks.map((item, idx) => {
            const status = item.status || 'Unverifiable';
            const config = STATUS_CONFIG[status] || STATUS_CONFIG.Unverifiable;
            const Icon = config.icon;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs sm:text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.tag}`}>
                    <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} aria-hidden="true" />
                    <span>{config.label.toUpperCase()}</span>
                  </span>

                  {item.source && (
                    <a
                      href={item.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-700 hover:underline"
                    >
                      <span>View Corroborating Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="font-semibold text-slate-900 text-sm">
                  "{item.claim}"
                </div>

                {item.notes && (
                  <p className="text-slate-600 leading-relaxed">
                    {item.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
}
