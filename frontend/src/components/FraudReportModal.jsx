import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink, 
  PhoneCall, 
  ShieldAlert, 
  Building, 
  UserCheck 
} from 'lucide-react';

export default function FraudReportModal({ isOpen, onClose, analysisData = {}, user = null }) {
  const [includePersonalDetails, setIncludePersonalDetails] = useState(false);
  const [customName, setCustomName] = useState(user?.displayName || '');
  const [customPhone, setCustomPhone] = useState('');
  const [customEmail, setCustomEmail] = useState(user?.email || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const docType = analysisData.documentType || 'Suspicious Document';
  const authority = analysisData.issuingAuthorityClaimed || 'Unknown Impersonator';
  const fields = analysisData.extractedFields || {};
  const amount = fields.amountDue || 'Unspecified / Demanded payment';
  const paymentMethods = fields.paymentMethodsRequested?.join(', ') || 'Irregular payment channels / Gift cards / Crypto';
  const contactInfo = [fields.contactPhone, fields.contactEmail, fields.contactWebsite].filter(Boolean).join(' | ') || 'Not specified';
  const reasons = analysisData.authenticity?.reasons || [];

  const isFinancialOrLoanDoc = /bank|nbfc|loan|recovery|finance|credit|money|rbi/i.test(`${docType} ${authority} ${analysisData.summary || ''}`);

  // Formulate pre-filled incident complaint text formatted for government cybercrime portals
  const generateDraft = () => {
    let text = `=== INCIDENT COMPLAINT REPORT DRAFT ===\n\n`;
    text += `1. INCIDENT CATEGORY:\nFraudulent Document / Impersonation / Financial Coercion\n\n`;
    text += `2. CLAIMED ISSUING ENTITY / SENDER:\n${authority}\n\n`;
    text += `3. DOCUMENT TYPE IDENTIFIED:\n${docType.replace(/_/g, ' ').toUpperCase()}\n\n`;
    text += `4. CONTACT DETAILS USED BY SOLICITOR:\n${contactInfo}\n\n`;
    text += `5. DEMANDED AMOUNT / FINANCIAL PRESSURE:\n${amount} via ${paymentMethods}\n\n`;
    text += `6. SPECIFIC RED FLAGS IDENTIFIED:\n`;
    reasons.forEach((r, idx) => {
      text += `  • ${r}\n`;
    });
    text += `\n7. INCIDENT SUMMARY:\n${analysisData.summary || 'Received fraudulent notice demanding urgent payment under false pretenses.'}\n\n`;

    if (includePersonalDetails && (customName || customEmail || customPhone)) {
      text += `8. COMPLAINANT CONTACT DETAILS (VOLUNTARY):\n`;
      if (customName) text += `Name: ${customName}\n`;
      if (customPhone) text += `Phone: ${customPhone}\n`;
      if (customEmail) text += `Email: ${customEmail}\n`;
      text += `\n`;
    }

    text += `[Drafted via ClarityBridge Assistive Triage Engine for submission to official authorities]`;
    return text;
  };

  const complaintDraft = generateDraft();

  const handleCopyDraft = async () => {
    try {
      await navigator.clipboard.writeText(complaintDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      alert('Could not copy draft to clipboard.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fraud-report-modal-title"
    >
      <div className="bg-white rounded-neo border-3 border-ink shadow-neo w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg border-2 border-ink bg-slate-100 hover:bg-slate-200 text-ink shadow-neo-xs transition-all"
          aria-label="Close fraud reporting dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-coral text-white border-2 border-ink flex items-center justify-center shadow-neo-xs font-black">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="fraud-report-modal-title" className="font-display font-black text-xl sm:text-2xl text-ink">
              Fraud Complaint Drafting Aid
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#454264] font-medium">
            Generate an organized complaint report to easily copy-paste onto official Indian cybercrime and banking grievance portals.
          </p>
        </div>

        {/* STRICT AGENCY DISCLAIMER (OWASP LLM 2026 Security Rule) */}
        <div className="p-4 bg-card-marigold border-2.5 border-ink rounded-2xl text-xs sm:text-sm text-ink font-medium flex items-start gap-3 shadow-neo-xs">
          <ShieldAlert className="w-5 h-5 text-marigold-deep flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-ink">Drafting Aid Notice: </span>
            <span>This tool compiles your incident details into a standardized format — <strong>you must submit it yourself</strong> on the official government portals below. ClarityBridge never auto-submits reports on your behalf.</span>
          </div>
        </div>

        {/* Optional User Contact Details Toggle */}
        <div className="p-4 bg-slate-50 border-2 border-ink rounded-2xl space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-bold text-ink">
            <input
              type="checkbox"
              checked={includePersonalDetails}
              onChange={(e) => setIncludePersonalDetails(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-ink text-periwinkle focus:ring-periwinkle"
            />
            <span>Include my personal contact details in this draft (Optional)</span>
          </label>

          {includePersonalDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 animate-fadeIn">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white border-2 border-ink rounded-xl px-3 py-1.5 text-xs font-medium text-ink"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-white border-2 border-ink rounded-xl px-3 py-1.5 text-xs font-medium text-ink"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Contact Email</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full bg-white border-2 border-ink rounded-xl px-3 py-1.5 text-xs font-medium text-ink"
                />
              </div>
            </div>
          )}
        </div>

        {/* Pre-filled Draft Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-ink/80">
              Generated Complaint Draft (Ready to Copy)
            </label>
            <button
              onClick={handleCopyDraft}
              className="btn-neo btn-grass-neo btn-neo-sm flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Draft'}</span>
            </button>
          </div>

          <textarea
            readOnly
            value={complaintDraft}
            rows={8}
            className="w-full bg-slate-900 text-green-300 font-mono text-xs sm:text-sm p-4 rounded-2xl border-2.5 border-ink focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Official Reporting Portals Section */}
        <div className="space-y-3 pt-2">
          <h4 className="font-display font-extrabold text-base text-ink flex items-center gap-2">
            <Building className="w-4 h-4 text-periwinkle-deep" />
            <span>Official Indian Grievance & Reporting Channels</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* National Cyber Crime Reporting Portal */}
            <div className="p-4 bg-white border-2 border-ink rounded-2xl shadow-neo-xs flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-display font-extrabold text-sm text-ink">National Cyber Crime Portal</span>
                  <span className="px-2 py-0.5 bg-card-coral text-coral-dark text-[10px] font-black rounded-full border border-ink">
                    Primary Portal
                  </span>
                </div>
                <p className="text-xs text-[#454264] font-medium leading-normal">
                  Official MHA portal for reporting financial cyber fraud, impersonation, and phishing scams.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-black text-coral pt-1">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>National Helpline: 1930</span>
                </div>
              </div>

              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neo btn-periwinkle-neo btn-neo-sm flex items-center justify-center gap-1.5 text-xs no-underline"
              >
                <span>Open cybercrime.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* RBI Sachet Portal (If loan / banking fraud) */}
            <div className={`p-4 bg-white border-2 border-ink rounded-2xl shadow-neo-xs flex flex-col justify-between gap-3 ${isFinancialOrLoanDoc ? 'ring-2 ring-marigold' : ''}`}>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-display font-extrabold text-sm text-ink">RBI Sachet Portal</span>
                  {isFinancialOrLoanDoc && (
                    <span className="px-2 py-0.5 bg-card-marigold text-marigold-deep text-[10px] font-black rounded-full border border-ink">
                      Recommended for Loan/Bank Notices
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#454264] font-medium leading-normal">
                  Reserve Bank of India portal to report unauthorized financial entities, fake recovery agents, and illegal loan apps.
                </p>
              </div>

              <a
                href="https://sachet.rbi.org.in"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neo btn-marigold-neo btn-neo-sm flex items-center justify-center gap-1.5 text-xs no-underline"
              >
                <span>Open sachet.rbi.org.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
