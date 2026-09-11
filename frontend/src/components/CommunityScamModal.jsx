import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Users, 
  Lock, 
  CheckCircle, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import api from '../utils/api';

export default function CommunityScamModal({ isOpen, onClose, analysisData = {} }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleConfirmContribute = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        documentType: analysisData.documentType || 'suspicious_solicitation',
        issuingAuthorityClaimed: analysisData.issuingAuthorityClaimed || 'Unknown Impersonator',
        threatPhrases: analysisData.authenticity?.reasons || [],
        paymentMethodsRequested: analysisData.extractedFields?.paymentMethodsRequested || [],
        suspiciousKeywords: analysisData.claimsToCheck || [],
        summary: analysisData.summary || ''
      };

      const res = await api.post('/community-scam/report', payload);
      if (res.data?.success) {
        setSubmitted(true);
      } else {
        throw new Error(res.data?.message || 'Failed to submit scam pattern.');
      }
    } catch (err) {
      console.error('Community scam submission error:', err);
      setError(err.response?.data?.message || 'Failed to record pattern. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-scam-modal-title"
    >
      <div className="bg-white rounded-neo border-3 border-ink shadow-neo w-full max-w-lg p-6 sm:p-8 relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg border-2 border-ink bg-slate-100 hover:bg-slate-200 text-ink shadow-neo-xs transition-all"
          aria-label="Close community scam pool dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-periwinkle text-white border-2 border-ink flex items-center justify-center shadow-neo-xs font-black">
              <Users className="w-5 h-5" />
            </div>
            <h3 id="community-scam-modal-title" className="font-display font-black text-xl sm:text-2xl text-ink">
              Contribute to Community Defense
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#454264] font-medium">
            Help protect fellow citizens from receiving the same scam by contributing its signature to our collective pattern database.
          </p>
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="space-y-4 py-4 animate-fadeIn text-center">
            <div className="w-14 h-14 rounded-full bg-grass text-white border-3 border-ink shadow-neo mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-black text-lg text-ink">
                Thank You for Protecting the Community!
              </h4>
              <p className="text-xs sm:text-sm text-[#454264] font-medium">
                The anonymized fraud signature has been safely stored in the shared Community Scam Database. Other users will now be proactively alerted when similar notices appear.
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn-neo btn-grass-neo btn-neo-md w-full"
            >
              <span>Done</span>
            </button>
          </div>
        ) : (
          /* Pre-Submission & Mandatory Data Scope Disclosure */
          <div className="space-y-5">
            
            {/* Clear Data-Scope Disclosure Box */}
            <div className="p-4 bg-periwinkle-pale border-2.5 border-ink rounded-2xl space-y-2.5 shadow-neo-xs">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-periwinkle-deep">
                <Lock className="w-4 h-4" />
                <span>Mandatory Data Privacy & PII Scrubbing Notice</span>
              </div>
              <p className="text-xs text-ink font-medium leading-relaxed">
                By taking this action, you are contributing an <strong>anonymized fraud pattern</strong> to a shared database used across ClarityBridge users.
              </p>
              <ul className="text-xs text-[#3a3752] font-medium space-y-1 pl-4 list-disc">
                <li>Your original document image and raw files are <strong>NEVER stored or shared</strong>.</li>
                <li>Our strict PII scrubber strips all phone numbers, email addresses, Indian PAN, Aadhaar numbers, and bank accounts.</li>
                <li>Only the claimed authority (<em>{analysisData.issuingAuthorityClaimed || 'Unknown'}</em>), payment channels, and threat language patterns are saved.</li>
              </ul>
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="p-3 bg-card-coral border-2 border-ink rounded-xl text-xs font-bold text-coral flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="btn-neo btn-ghost-neo btn-neo-sm"
              >
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmContribute}
                disabled={submitting}
                className="btn-neo btn-periwinkle-neo btn-neo-sm flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? 'Anonymizing & Submitting…' : 'Confirm & Contribute Pattern'}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
