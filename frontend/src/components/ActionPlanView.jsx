import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Phone, 
  Mail, 
  Globe, 
  ArrowUpRight,
  UserCheck
} from 'lucide-react';

const safeText = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    return val.value || val.source_text || JSON.stringify(val);
  }
  return String(val);
};

export default function ActionPlanView({ 
  actionPlan = {}, 
  documentType = 'document' 
}) {
  const steps = actionPlan.steps || [];
  const contacts = actionPlan.contacts || [];
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const isNoticeOrBill = /eviction|notice|bill|invoice|urgent|solicitation|contract/i.test(documentType || '');

  const toggleStep = (id) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getBadgeClass = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'urgent':
        return 'bg-coral text-white';
      case 'high':
      case 'soon':
        return 'bg-marigold text-ink';
      case 'low':
        return 'bg-grass text-grass-dark';
      default:
        return 'bg-periwinkle text-white';
    }
  };

  return (
    <section aria-labelledby="action-plan-title" className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 id="action-plan-title" className="font-display font-extrabold text-2xl sm:text-3xl text-ink">
            {isNoticeOrBill ? 'Prioritized Action Plan' : 'Document Guide & Action Steps'}
          </h2>
          <p className="text-sm sm:text-base text-[#454264] mt-0.5 font-medium">
            {actionPlan.summary || 'Follow these ordered steps to understand, reference, or act upon this document.'}
          </p>
        </div>
        <div className="text-xs font-bold px-3.5 py-1.5 bg-white text-ink rounded-full border-2 border-ink shadow-neo-xs">
          {completedSteps.size} of {steps.length} Completed
        </div>
      </div>

      {/* Action Steps List with Mockup Visual Style */}
      <div className="space-y-3.5">
        {steps.map((step, idx) => {
          const isDone = completedSteps.has(step.id || idx);
          const badgeStyle = getBadgeClass(step.priority);

          return (
            <div
              key={step.id || idx}
              className={`rounded-2xl border-2.5 border-ink p-5 transition-all relative ${
                isDone 
                  ? 'bg-slate-100 opacity-60' 
                  : 'bg-white shadow-neo-sm hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start gap-3.5">
                
                {/* Complete Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleStep(step.id || idx)}
                  className="mt-1 text-slate-400 hover:text-periwinkle transition-colors focus-visible:ring-0 rounded-md"
                  aria-label={isDone ? `Mark step ${idx + 1} as incomplete` : `Mark step ${idx + 1} as completed`}
                >
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-periwinkle fill-periwinkle-pale" />
                  ) : (
                    <Square className="w-5 h-5 text-ink" />
                  )}
                </button>

                <div className="flex-1">
                  
                  {/* Priority & Deadline Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-extrabold px-3 py-0.5 rounded-full border-2 border-ink ${badgeStyle}`}>
                      {safeText(step.priority) || 'STEP'}
                    </span>

                    {step.deadline && (
                      <span className="text-xs font-bold text-ink bg-card-marigold border-2 border-ink px-3 py-0.5 rounded-full">
                        📅 {safeText(step.deadline)}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-base font-bold ${isDone ? 'line-through text-slate-500' : 'text-ink'}`}>
                    {safeText(step.title)}
                  </h3>
                  
                  <p className="text-sm text-[#454264] mt-1 leading-relaxed font-medium">
                    {safeText(step.description)}
                  </p>

                  {step.contact && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-periwinkle-deep bg-periwinkle-pale px-3 py-1.5 rounded-xl border-2 border-ink shadow-neo-xs">
                      <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Contact / Reference: {safeText(step.contact)}</span>
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verified Authority & Support Directory */}
      {contacts.length > 0 && (
        <div className="mt-6 pt-6 border-t-2 border-ink/10">
          <h3 className="font-display font-extrabold text-lg text-ink flex items-center gap-2 mb-3">
            <UserCheck className="w-5 h-5 text-periwinkle" aria-hidden="true" />
            <span>Extracted Contacts Directory</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {contacts.map((contact, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border-2 border-ink shadow-neo-xs space-y-1.5 text-xs">
                <div className="font-bold text-ink text-sm">{safeText(contact.name)}</div>
                {contact.phone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <a href={`tel:${safeText(contact.phone)}`} className="font-semibold text-periwinkle hover:underline">
                      {safeText(contact.phone)}
                    </a>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <a href={`mailto:${safeText(contact.email)}`} className="font-semibold text-periwinkle hover:underline truncate">
                      {safeText(contact.email)}
                    </a>
                  </div>
                )}
                {contact.website && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <a href={safeText(contact.website)} target="_blank" rel="noopener noreferrer" className="font-semibold text-periwinkle hover:underline flex items-center gap-1 truncate">
                      <span>{safeText(contact.website).replace(/^https?:\/\//, '')}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
}
