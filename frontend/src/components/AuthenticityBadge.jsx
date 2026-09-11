import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Users, 
  Calendar, 
  Cpu, 
  FileText, 
  Flag,
  Share2,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import FraudReportModal from './FraudReportModal';
import CommunityScamModal from './CommunityScamModal';

const safeText = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    return val.value || val.source_text || JSON.stringify(val);
  }
  return String(val);
};

export default function AuthenticityBadge({ authenticity = {}, analysisData = {}, user = null }) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [isFraudModalOpen, setIsFraudModalOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);

  const verdict = authenticity.verdict || 'Verified';
  const confidence = Math.round((authenticity.confidence || 0.85) * 100);
  const reasons = authenticity.reasons || [];
  const signals = authenticity.itemizedSignals || [];

  let stampColor = 'bg-card-grass text-grass-dark';
  let verdictTitle = 'This looks like a verified, legitimate document';
  let verdictBadge = 'VERIFIED';
  let cardBg = 'bg-card-grass border-ink';
  const isHighRisk = verdict === 'Likely Fraudulent';
  const isCaution = verdict === 'Use Caution';
  const isManualReview = verdict === 'Needs Manual Review';

  if (isHighRisk) {
    stampColor = 'bg-coral text-white';
    verdictTitle = 'Warning: High risk of fraud, coercion, or scam';
    verdictBadge = 'LIKELY\nFRAUD';
    cardBg = 'bg-card-coral border-ink';
  } else if (isCaution) {
    stampColor = 'bg-card-marigold text-ink';
    verdictTitle = 'This looks mostly authentic — with points to double-check';
    verdictBadge = 'USE\nCAUTION';
    cardBg = 'bg-card-marigold border-ink';
  } else if (isManualReview) {
    stampColor = 'bg-card-periwinkle text-periwinkle-dark';
    verdictTitle = 'Uncertain Signals: Manual Verification Recommended';
    verdictBadge = 'NEEDS\nREVIEW';
    cardBg = 'bg-card-periwinkle border-ink';
  }

  const getSignalIcon = (iconName) => {
    switch (iconName) {
      case 'shield-alert': return <AlertOctagon className="w-4 h-4 text-coral" />;
      case 'shield-check': return <ShieldCheck className="w-4 h-4 text-grass-dark" />;
      case 'alert-triangle': return <AlertTriangle className="w-4 h-4 text-coral" />;
      case 'alert-octagon': return <AlertOctagon className="w-4 h-4 text-coral" />;
      case 'calendar-x': return <Calendar className="w-4 h-4 text-coral" />;
      case 'calendar-check': return <Calendar className="w-4 h-4 text-grass-dark" />;
      case 'cpu': return <Cpu className="w-4 h-4 text-marigold-deep" />;
      case 'users': return <Users className="w-4 h-4 text-periwinkle-deep" />;
      case 'check-circle': return <CheckCircle2 className="w-4 h-4 text-grass-dark" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <>
      <section 
        aria-label="Document authenticity and fraud risk assessment"
        className={`rounded-neo border-3 ${cardBg} p-6 sm:p-8 shadow-neo transition-all space-y-5`}
      >
        {/* Top Verdict Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-4 border-b-2 border-ink/20">
          
          <div className="flex items-start sm:items-center gap-4">
            {/* Retro Rotated Double-Border Stamp */}
            <div className={`stamp-badge ${stampColor}`}>
              <span className="font-display font-black text-xs uppercase tracking-wider text-center whitespace-pre-line">
                {verdictBadge}
              </span>
              <span className="text-[10px] opacity-80 mt-0.5">{confidence}% Signal</span>
            </div>

            {/* Verdict Copy */}
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-ink/70 mb-0.5">
                Authenticity & Risk Verdict
              </div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-ink leading-tight">
                {verdictTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#454264] font-medium mt-1">
                {reasons[0] || 'Evaluated across sender domains, statutory authority registries, and community fraud pools.'}
              </p>
            </div>
          </div>

          {/* Action CTAs for High-Risk / Caution / Needs Review */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            {(isHighRisk || isCaution) && (
              <button
                type="button"
                onClick={() => setIsFraudModalOpen(true)}
                className="btn-neo btn-coral-neo btn-neo-sm flex items-center gap-1.5 text-xs font-black shadow-neo-xs"
                aria-label="Open fraud complaint drafting tool"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>🚨 Report this notice</span>
              </button>
            )}

            {isHighRisk && (
              <button
                type="button"
                onClick={() => setIsCommunityModalOpen(true)}
                className="btn-neo btn-periwinkle-neo btn-neo-sm flex items-center gap-1.5 text-xs font-black shadow-neo-xs"
                aria-label="Contribute anonymized pattern to community scam database"
              >
                <Users className="w-3.5 h-3.5" />
                <span>📢 Add to Community Pool</span>
              </button>
            )}
          </div>

        </div>

        {/* Feature 4: "Why this verdict?" Expandable Transparency Panel */}
        <div className="bg-white/90 backdrop-blur-sm border-2.5 border-ink rounded-2xl shadow-neo-xs overflow-hidden">
          
          {/* Accordion Toggle Header */}
          <button
            type="button"
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-periwinkle"
            aria-expanded={isAccordionOpen}
            aria-controls="transparency-signals-panel"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                <span>🔍 Why this verdict?</span>
                <span className="text-xs font-medium text-[#454264] normal-case hidden sm:inline">
                  (Itemized signal breakdown across multi-source verification checks)
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-ink">
              <span>{isAccordionOpen ? 'Hide signals' : 'View signals'}</span>
              {isAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {/* Accordion Content: Itemized Signal Rows */}
          {isAccordionOpen && (
            <div id="transparency-signals-panel" className="p-4 border-t-2 border-ink/10 space-y-2.5 animate-fadeIn">
              {signals.length > 0 ? (
                signals.map((signal, idx) => {
                  const isSuspicious = signal.direction === 'indicates_suspicion';
                  const isSafe = signal.direction === 'supports_authenticity';
                  
                  return (
                    <div 
                      key={signal.id || idx}
                      className={`p-3 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
                        isSuspicious 
                          ? 'bg-card-coral/40 border-coral/50 text-ink' 
                          : isSafe 
                            ? 'bg-card-grass/40 border-grass/50 text-ink' 
                            : 'bg-slate-50 border-ink/20 text-ink'
                      }`}
                    >
                      {/* Left: Icon + Signal Name + Explanation */}
                      <div className="flex items-start gap-2.5 flex-1">
                        <div className="p-1 rounded-lg bg-white border border-ink/20 flex-shrink-0 mt-0.5">
                          {getSignalIcon(signal.icon)}
                        </div>
                        <div>
                          <div className="font-extrabold text-ink text-xs sm:text-sm">
                            {safeText(signal.name)}
                          </div>
                          <p className="text-slate-700 font-medium mt-0.5 leading-snug">
                            {safeText(signal.explanation)}
                          </p>
                        </div>
                      </div>

                      {/* Right: Accessible Text + Icon Direction Tag */}
                      <div className="flex-shrink-0 self-start sm:self-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-black ${
                          isSuspicious
                            ? 'bg-card-coral text-coral-dark border-coral'
                            : isSafe
                              ? 'bg-card-grass text-grass-dark border-grass'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          {isSuspicious ? (
                            <>
                              <XCircle className="w-3 h-3 text-coral" aria-hidden="true" />
                              <span>CONCERNS AUTHENTICITY</span>
                            </>
                          ) : isSafe ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-grass-dark" aria-hidden="true" />
                              <span>SUPPORTS AUTHENTICITY</span>
                            </>
                          ) : (
                            <>
                              <Info className="w-3 h-3 text-slate-500" aria-hidden="true" />
                              <span>NEUTRAL SIGNAL</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Fallback bullet list if signals array is empty */
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800">
                  {reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-ink">•</span>
                      <span>{safeText(r)}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Official Self-Verification Portal Direct Links */}
              <div className="mt-3 pt-3 border-t border-ink/10 flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#454264]">
                <span className="text-ink font-black">Official Portals:</span>
                <a 
                  href="https://www.incometax.gov.in/iec/foportal/help/authenticate-notice-faq" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card-periwinkle border border-ink/30 text-periwinkle-dark hover:underline"
                >
                  <span>Income Tax DIN Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href="https://services.gst.gov.in/services/searchtpbypan" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card-grass border border-ink/30 text-grass-dark hover:underline"
                >
                  <span>GST Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href="https://sachet.rbi.org.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card-marigold border border-ink/30 text-marigold-deep hover:underline"
                >
                  <span>RBI Sachet (NBFCs)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href="https://cybercrime.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card-coral border border-ink/30 text-coral-dark hover:underline"
                >
                  <span>Cyber Crime 1930</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

        </div>

      </section>

      {/* Fraud Reporting Complaint Draft Modal */}
      <FraudReportModal
        isOpen={isFraudModalOpen}
        onClose={() => setIsFraudModalOpen(false)}
        analysisData={{ ...analysisData, authenticity }}
        user={user}
      />

      {/* Community Scam Pattern Contribution Modal */}
      <CommunityScamModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        analysisData={{ ...analysisData, authenticity }}
      />
    </>
  );
}
