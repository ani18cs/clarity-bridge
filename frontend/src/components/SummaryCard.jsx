import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Download, 
  Loader2,
  FileText, 
  Building2, 
  Calendar, 
  Compass, 
  ListChecks, 
  Coins, 
  Hash, 
  Share2, 
  Globe,
  AlertTriangle,
  Camera,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  User,
  UserCheck,
  Scale
} from 'lucide-react';
import ShareModal from './ShareModal';
import { getLanguageLabel } from '../utils/languages';

export default function SummaryCard({
  summary = '',
  documentType = 'document',
  issuingAuthorityClaimed = '',
  documentPurpose = '',
  extractedFields = {},
  language = 'en',
  fullAnalysisData = null,
  onDownloadPdf,
  isDownloadingPdf,
  onSpeak,
  isPlayingAudio,
  isSpeechLoading
}) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const docTypeLabel = (documentType || 'General Document').replace(/_/g, ' ').toUpperCase();

  // Helper to extract field value & confidence cleanly whether object or string
  const getFieldInfo = (field) => {
    if (!field) return { value: null, source_text: null, confidence: 'high' };
    if (typeof field === 'object' && field !== null) {
      let val = field.value !== undefined ? field.value : (field.source_text || null);
      if (typeof val === 'object' && val !== null) {
        val = typeof val.value === 'string' ? val.value : JSON.stringify(val);
      }
      return {
        value: val || null,
        source_text: typeof field.source_text === 'object' ? JSON.stringify(field.source_text) : (field.source_text || null),
        confidence: field.confidence || 'high'
      };
    }
    return { value: typeof field === 'object' ? JSON.stringify(field) : String(field), source_text: null, confidence: 'high' };
  };

  const amountInfo = getFieldInfo(extractedFields.amountDue);
  const dateInfo = getFieldInfo(extractedFields.dueDate || extractedFields.noticeDate);
  const refInfo = getFieldInfo(extractedFields.caseOrReferenceNumber);
  const dinInfo = getFieldInfo(extractedFields.din);
  const gstinInfo = getFieldInfo(extractedFields.gstin);
  const panInfo = getFieldInfo(extractedFields.pan);
  const aadhaarInfo = getFieldInfo(extractedFields.aadhaar);

  const recipientInfo = getFieldInfo(extractedFields.recipientName);
  const recipientAddrInfo = getFieldInfo(extractedFields.recipientAddress);
  const senderClientInfo = getFieldInfo(extractedFields.senderClientName);
  const senderClientAddrInfo = getFieldInfo(extractedFields.senderClientAddress);
  const underlyingAgreementInfo = getFieldInfo(extractedFields.underlyingAgreement);
  const subjectInfo = getFieldInfo(extractedFields.subject);

  const qualityWarning = fullAnalysisData?.qualityWarning || fullAnalysisData?.imageQuality?.warning;
  const needsRetake = fullAnalysisData?.qualityWarning?.needsRetake || fullAnalysisData?.imageQuality?.needsRetake;

  return (
    <>
      <section 
        aria-labelledby="summary-card-title"
        className="bg-white rounded-neo border-3 border-ink shadow-neo p-6 sm:p-8 space-y-6"
      >
        {/* Retake / Quality Warning Banner */}
        {needsRetake && (
          <div className="p-4 rounded-2xl bg-card-coral border-2.5 border-ink flex items-start gap-3 text-xs sm:text-sm text-ink shadow-neo-xs animate-fadeIn">
            <Camera className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-extrabold text-coral-dark uppercase">Low Image Resolution / Blurry Scan Detected: </span>
              <span className="font-semibold text-ink leading-relaxed">
                {qualityWarning?.reason || 'The uploaded document image has low clarity or blur. For 100% accurate grounded extraction, we recommend retaking the photo with good lighting and flat alignment.'}
              </span>
            </div>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-ink/10">
          
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="px-3.5 py-1.5 bg-periwinkle text-white rounded-full border-2 border-ink shadow-neo-xs flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{docTypeLabel}</span>
            </span>

            {issuingAuthorityClaimed && issuingAuthorityClaimed !== 'Identified in Document Content' && (
              <span className="px-3.5 py-1.5 bg-white text-ink rounded-full border-2 border-ink shadow-neo-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span className="truncate max-w-[280px]">Issuer: {issuingAuthorityClaimed}</span>
              </span>
            )}

            {dateInfo.value && dateInfo.value !== 'Not stated in document' && (
              <span className="px-3.5 py-1.5 bg-card-marigold text-ink rounded-full border-2 border-ink shadow-neo-xs flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                <span>Date: {dateInfo.value}</span>
              </span>
            )}

            {/* Language Tag */}
            <span className="px-3 py-1.5 bg-slate-100 text-ink rounded-full border-2 border-ink shadow-neo-xs flex items-center gap-1.5 font-bold">
              <Globe className="w-3.5 h-3.5 text-periwinkle" aria-hidden="true" />
              <span>{getLanguageLabel(language)}</span>
            </span>
          </div>

          {/* Action Controls: Share, Read Aloud & Download PDF */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Share Result Button */}
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="btn-neo btn-periwinkle-neo btn-neo-sm flex items-center gap-1.5 shadow-neo-xs"
              aria-label="Share document analysis via WhatsApp or link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>🔗 Share</span>
            </button>

            {/* Read Aloud Button */}
            <button
              type="button"
              onClick={onSpeak}
              disabled={isSpeechLoading}
              className={`btn-neo btn-marigold-neo btn-neo-sm ${isPlayingAudio ? 'animate-pulse' : ''}`}
              aria-label={isPlayingAudio ? 'Stop reading summary aloud' : 'Read plain-language summary aloud'}
            >
              {isSpeechLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-ink" />
              ) : isPlayingAudio ? (
                <VolumeX className="w-4 h-4 text-ink" />
              ) : (
                <Volume2 className="w-4 h-4 text-ink" />
              )}
              <span>{isPlayingAudio ? 'Stop Audio' : '🔊 Read aloud'}</span>
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isDownloadingPdf}
              className="btn-neo btn-grass-neo btn-neo-sm"
              aria-label="Download branded PDF action plan"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-ink" />
              ) : (
                <Download className="w-4 h-4 text-ink" />
              )}
              <span>{isDownloadingPdf ? 'Generating…' : '⬇️ Download PDF'}</span>
            </button>

          </div>

        </div>

        {/* Purpose & Intended Use-Case Banner */}
        {documentPurpose && (
          <div className="p-4 rounded-2xl bg-periwinkle-pale border-2.5 border-ink flex items-start gap-3 text-xs sm:text-sm text-ink shadow-neo-xs">
            <Compass className="w-5 h-5 text-periwinkle-deep flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-bold text-periwinkle-deep">Primary Purpose & Context: </span>
              <span className="font-medium text-[#3a3752] leading-relaxed">{documentPurpose}</span>
            </div>
          </div>
        )}

        {/* Parties & Underlying Reference Banner */}
        {(recipientInfo.value || senderClientInfo.value || underlyingAgreementInfo.value || subjectInfo.value) && (
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 border-2.5 border-ink shadow-neo-xs space-y-3.5">
            <h3 className="font-display font-extrabold text-base sm:text-lg text-ink flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-700" />
              <span>Document Parties & Legal Reference</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Issued On Behalf Of / Sender Client */}
              {senderClientInfo.value && (
                <div className="p-3.5 bg-white border-2 border-ink rounded-xl space-y-1 shadow-neo-xs">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-periwinkle-deep" />
                    <span>Issued On Behalf Of (Client / Sender)</span>
                  </span>
                  <p className="text-sm font-black text-ink">
                    {senderClientInfo.value}
                  </p>
                  {senderClientAddrInfo.value && (
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {senderClientAddrInfo.value}
                    </p>
                  )}
                </div>
              )}

              {/* Addressed To / Recipient */}
              {recipientInfo.value && (
                <div className="p-3.5 bg-white border-2 border-ink rounded-xl space-y-1 shadow-neo-xs">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-grass-dark" />
                    <span>Addressed To (Recipient)</span>
                  </span>
                  <p className="text-sm font-black text-ink">
                    {recipientInfo.value}
                  </p>
                  {recipientAddrInfo.value && (
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {recipientAddrInfo.value}
                    </p>
                  )}
                </div>
              )}

              {/* Underlying Agreement / Transaction in Dispute */}
              {underlyingAgreementInfo.value && (
                <div className="p-3.5 bg-white border-2 border-ink rounded-xl space-y-1 shadow-neo-xs md:col-span-2">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-marigold-deep" />
                    <span>Underlying Agreement / Contract in Dispute</span>
                  </span>
                  <p className="text-sm font-black text-ink">
                    {underlyingAgreementInfo.value}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plain Language Summary */}
        <div className="space-y-2">
          <h2 id="summary-card-title" className="font-display font-extrabold text-2xl sm:text-3xl text-ink">
            Plain-Language Translation
          </h2>
          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
            {summary}
          </p>
        </div>

        {/* 1. Legal Implications & Risks ("What This Means for You") */}
        {fullAnalysisData?.legalImplications && fullAnalysisData.legalImplications.length > 0 && (
          <div className="p-5 sm:p-6 rounded-2xl bg-card-coral/30 border-2.5 border-ink shadow-neo-xs space-y-3.5">
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-coral-dark" />
              <span>What This Means For You (Legal & Financial Implications)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fullAnalysisData.legalImplications.map((imp, idx) => (
                <div key={idx} className="p-3.5 bg-white border-2 border-ink rounded-xl space-y-1 shadow-neo-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-ink">{imp.risk}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                      imp.severity === 'High' ? 'bg-card-coral text-coral-dark border-coral' : 'bg-card-marigold text-marigold-deep border-marigold'
                    }`}>
                      {imp.severity || 'Caution'} Risk
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {imp.consequence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Citizen Rights & Statutory Protections ("Your Rights & Defenses") */}
        {fullAnalysisData?.citizenRights && fullAnalysisData.citizenRights.length > 0 && (
          <div className="p-5 sm:p-6 rounded-2xl bg-card-grass/30 border-2.5 border-ink shadow-neo-xs space-y-3.5">
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-grass-dark" />
              <span>Your Statutory Rights & Legal Protections</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fullAnalysisData.citizenRights.map((rt, idx) => (
                <div key={idx} className="p-3.5 bg-white border-2 border-ink rounded-xl space-y-1.5 shadow-neo-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-ink">{rt.right}</span>
                    {rt.statute && (
                      <span className="text-[10px] font-bold text-grass-dark bg-card-grass px-2 py-0.5 rounded-full border border-grass truncate max-w-[180px]">
                        {rt.statute}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {rt.remedy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Legalese & Statutory Terms Explained (Jargon Demystifier) */}
        {fullAnalysisData?.jargonDemystified && fullAnalysisData.jargonDemystified.length > 0 && (
          <div className="p-5 sm:p-6 rounded-2xl bg-periwinkle-pale border-2.5 border-ink shadow-neo-xs space-y-3.5">
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-periwinkle-deep" />
              <span>Legalese & Statutory Terms Explained in Simple Language</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fullAnalysisData.jargonDemystified.map((jg, idx) => (
                <div key={idx} className="p-3.5 bg-white border-2 border-ink rounded-xl space-y-1 shadow-neo-xs">
                  <span className="font-extrabold text-xs sm:text-sm text-periwinkle-deep block">
                    📖 {jg.term}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {jg.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Extracted Financials, Dates, Reference IDs & Statutory Number Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          {/* Financial Figure */}
          <div className="p-4 bg-card-grass border-2 border-ink rounded-2xl shadow-neo-xs">
            <span className="text-[11px] font-extrabold text-ink uppercase flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-grass-dark" />
              <span>Financial Figure / Amount</span>
            </span>
            <p className="font-display font-extrabold text-xl text-ink mt-1">
              {amountInfo.value || <span className="text-slate-500 text-sm font-semibold italic">Not stated in document</span>}
            </p>
            {amountInfo.confidence === 'low' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-coral-dark mt-1">
                <AlertTriangle className="w-3 h-3 text-coral" />
                <span>Could not verify from document</span>
              </span>
            )}
          </div>

          {/* Identified Date / Deadline */}
          <div className="p-4 bg-card-marigold border-2 border-ink rounded-2xl shadow-neo-xs">
            <span className="text-[11px] font-extrabold text-ink uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-marigold-deep" />
              <span>Identified Date / Deadline</span>
            </span>
            <p className="font-display font-extrabold text-xl text-ink mt-1">
              {dateInfo.value || <span className="text-slate-500 text-sm font-semibold italic">Not stated in document</span>}
            </p>
            {dateInfo.confidence === 'low' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-coral-dark mt-1">
                <AlertTriangle className="w-3 h-3 text-coral" />
                <span>Could not verify from document</span>
              </span>
            )}
          </div>

          {/* Reference / DIN / GSTIN ID */}
          <div className="p-4 bg-periwinkle-pale border-2 border-ink rounded-2xl shadow-neo-xs">
            <span className="text-[11px] font-extrabold text-ink uppercase flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-periwinkle-deep" />
              <span>Reference / DIN / Case ID</span>
            </span>
            <p className="font-display font-extrabold text-base sm:text-lg text-ink mt-1 truncate">
              {dinInfo.value || refInfo.value || gstinInfo.value || (
                <span className="text-slate-500 text-sm font-semibold italic">Not stated in document</span>
              )}
            </p>
            {dinInfo.value && (
              <span className="inline-block text-[10px] font-extrabold text-periwinkle-deep uppercase mt-0.5">
                ITD DIN: {dinInfo.value}
              </span>
            )}
            {aadhaarInfo.value && (
              <span className="block text-[10px] font-extrabold text-slate-700 uppercase mt-0.5">
                Aadhaar: {aadhaarInfo.value} (Masked u/s UIDAI)
              </span>
            )}
          </div>

        </div>

      </section>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        analysisData={fullAnalysisData || {
          summary,
          documentType,
          issuingAuthorityClaimed,
          documentPurpose,
          extractedFields,
          language
        }}
      />
    </>
  );
}
