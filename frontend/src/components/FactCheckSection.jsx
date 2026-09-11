import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const safeText = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    return val.value || val.source_text || JSON.stringify(val);
  }
  return String(val);
};

export default function FactCheckSection({ factChecks = [] }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!factChecks || factChecks.length === 0) return null;

  const getBubbleStyle = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'verified':
        return {
          bg: 'bg-card-grass',
          border: 'border-ink',
          tagText: 'text-[#0d7a4d]',
          tagLabel: '✔ Verified —'
        };
      case 'contradicted':
        return {
          bg: 'bg-card-coral',
          border: 'border-ink',
          tagText: 'text-[#c23b3b]',
          tagLabel: '✘ Contradicted —'
        };
      default:
        return {
          bg: 'bg-card-marigold',
          border: 'border-ink',
          tagText: 'text-[#a8720b]',
          tagLabel: '? Unverifiable —'
        };
    }
  };

  return (
    <section aria-labelledby="factcheck-heading" className="bg-white rounded-neo border-3 border-ink shadow-neo overflow-hidden">
      
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-periwinkle-pale/40 transition-colors"
        aria-expanded={isOpen}
      >
        <div>
          <h3 id="factcheck-heading" className="font-display font-extrabold text-xl sm:text-2xl text-ink">
            Fact-Check Annotations ({factChecks.length})
          </h3>
          <p className="text-xs sm:text-sm text-[#454264] font-medium mt-0.5">
            Cross-referenced against public records, institutional directories, and statutory registries.
          </p>
        </div>

        <div className="w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center bg-white shadow-neo-xs">
          {isOpen ? <ChevronUp className="w-4 h-4 text-ink" /> : <ChevronDown className="w-4 h-4 text-ink" />}
        </div>
      </button>

      {/* Bubble List */}
      {isOpen && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t-2 border-ink/10 space-y-3">
          {factChecks.map((item, idx) => {
            const style = getBubbleStyle(item.status);

            return (
              <div
                key={idx}
                className={`factcheck-bubble ${style.bg} ${style.border} space-y-1.5`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`font-black text-xs uppercase tracking-wider ${style.tagText}`}>
                    {style.tagLabel}
                  </span>

                  {item.source && (
                    <a
                      href={item.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-periwinkle-deep hover:underline"
                    >
                      <span>Source Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="font-bold text-ink text-sm sm:text-base">
                  "{safeText(item.claim)}"
                </div>

                {item.notes && (
                  <p className="text-xs sm:text-sm text-[#3a3752] font-medium leading-relaxed">
                    {safeText(item.notes)}
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
