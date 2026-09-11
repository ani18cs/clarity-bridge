import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  Phone, 
  Mail, 
  Globe, 
  AlertCircle, 
  Clock, 
  Flame,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';

const PRIORITY_STYLES = {
  Urgent: {
    bg: 'bg-red-50 border-red-200 text-red-900',
    tag: 'bg-red-600 text-white',
    icon: Flame,
    label: 'URGENT'
  },
  High: {
    bg: 'bg-amber-50 border-amber-200 text-amber-900',
    tag: 'bg-amber-600 text-white',
    icon: AlertCircle,
    label: 'HIGH PRIORITY'
  },
  Medium: {
    bg: 'bg-blue-50 border-blue-200 text-blue-900',
    tag: 'bg-blue-600 text-white',
    icon: Clock,
    label: 'MEDIUM'
  },
  Low: {
    bg: 'bg-slate-50 border-slate-200 text-slate-800',
    tag: 'bg-slate-600 text-white',
    icon: Clock,
    label: 'LOW'
  }
};

export default function ActionPlanView({ actionPlan = {} }) {
  const steps = actionPlan.steps || [];
  const contacts = actionPlan.contacts || [];
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const toggleStep = (id) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section aria-labelledby="action-plan-title" className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 id="action-plan-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Prioritized Action Plan
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            {actionPlan.summary || 'Follow these ordered steps to protect your rights and resolve obligations.'}
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
          {completedSteps.size} of {steps.length} Completed
        </div>
      </div>

      {/* Action Steps List */}
      <div className="space-y-3.5">
        {steps.map((step, idx) => {
          const priority = step.priority || 'Medium';
          const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;
          const PriorityIcon = style.icon;
          const isDone = completedSteps.has(step.id || idx);

          return (
            <div
              key={step.id || idx}
              className={`rounded-2xl border p-5 transition-all ${
                isDone 
                  ? 'bg-slate-50/80 border-slate-200 opacity-60' 
                  : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                
                {/* Checkbox and Step Title */}
                <div className="flex items-start space-x-3.5 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id || idx)}
                    className="mt-1 text-slate-400 hover:text-brand-600 transition-colors focus-visible:ring-2 focus-visible:ring-brand-600 rounded-md"
                    aria-label={isDone ? `Mark step ${idx + 1} as incomplete` : `Mark step ${idx + 1} as completed`}
                  >
                    {isDone ? (
                      <CheckSquare className="w-5 h-5 text-brand-600 fill-brand-50" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${style.tag}`}>
                        <PriorityIcon className="w-3 h-3 mr-1" aria-hidden="true" />
                        <span>{style.label}</span>
                      </span>

                      {step.deadline && (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                          <Calendar className="w-3 h-3" aria-hidden="true" />
                          <span>Deadline: {step.deadline}</span>
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {step.description}
                    </p>

                    {step.contact && (
                      <div className="mt-3 inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                        <Phone className="w-3.5 h-3.5 text-brand-600" aria-hidden="true" />
                        <span>Direct Action Contact: {step.contact}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Verified Official Contacts Directory */}
      {contacts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 mb-3">
            <UserCheck className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <span>Verified Authority & Support Directory</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contacts.map((contact, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="font-bold text-slate-900 text-sm">{contact.name}</div>
                {contact.phone && (
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <a href={`tel:${contact.phone}`} className="font-medium hover:text-brand-600 underline">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <a href={`mailto:${contact.email}`} className="font-medium hover:text-brand-600 underline truncate">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.website && (
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 hover:underline flex items-center space-x-1 truncate">
                      <span>{contact.website.replace(/^https?:\/\//, '')}</span>
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
