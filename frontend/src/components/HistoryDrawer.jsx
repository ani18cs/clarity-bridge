import React from 'react';
import { X, Calendar, FileText, ChevronRight, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function HistoryDrawer({
  isOpen,
  onClose,
  history = [],
  onSelectSubmission
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-all duration-300 transform"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 id="history-title" className="text-lg font-bold text-slate-900">
              Document History
            </h2>
            <p className="text-xs text-slate-500">Your past analyzed notices & plans</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
            aria-label="Close history drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Submissions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No document submissions yet.</p>
              <p className="text-xs mt-1">Uploaded documents and action plans will appear here.</p>
            </div>
          ) : (
            history.map((item) => {
              const verdict = item.authenticity?.verdict || 'Verified';
              let verdictBadge = 'bg-emerald-100 text-emerald-800';
              if (verdict === 'Likely Fraudulent') verdictBadge = 'bg-red-100 text-red-800';
              else if (verdict === 'Use Caution') verdictBadge = 'bg-amber-100 text-amber-800';

              const dateStr = item.createdAt 
                ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent';

              return (
                <div
                  key={item.id}
                  onClick={() => { onSelectSubmission(item); onClose(); }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/20 cursor-pointer transition-all space-y-2 group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase">
                      {(item.documentType || 'Notice').replace(/_/g, ' ')}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${verdictBadge}`}>
                      {verdict}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </span>
                    <span className="text-brand-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                      View Plan <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
