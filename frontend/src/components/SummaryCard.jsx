import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Download, 
  FileText, 
  Building2, 
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function SummaryCard({
  summary = '',
  documentType = 'document',
  issuingAuthorityClaimed = '',
  extractedFields = {},
  onDownloadPdf,
  isDownloadingPdf,
  onSpeak,
  isPlayingAudio,
  isSpeechLoading
}) {
  const docTypeLabel = (documentType || 'Official Notice').replace(/_/g, ' ').toUpperCase();

  return (
    <section 
      aria-labelledby="summary-card-title"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1 bg-brand-100 text-brand-900 rounded-lg flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-brand-700" aria-hidden="true" />
            <span>{docTypeLabel}</span>
          </span>

          {issuingAuthorityClaimed && (
            <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span className="truncate max-w-[200px]">{issuingAuthorityClaimed}</span>
            </span>
          )}

          {extractedFields.noticeDate && (
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Notice Date: {extractedFields.noticeDate}</span>
            </span>
          )}
        </div>

        {/* Action Controls: Read Aloud & Download PDF */}
        <div className="flex items-center space-x-2.5">
          
          {/* Read Aloud Button */}
          <button
            type="button"
            onClick={onSpeak}
            disabled={isSpeechLoading}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-brand-600 ${
              isPlayingAudio
                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
            aria-label={isPlayingAudio ? 'Stop reading summary aloud' : 'Read plain-language summary aloud'}
          >
            {isSpeechLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            ) : isPlayingAudio ? (
              <VolumeX className="w-4 h-4 text-amber-700" />
            ) : (
              <Volume2 className="w-4 h-4 text-brand-600" />
            )}
            <span>{isPlayingAudio ? 'Stop Audio' : 'Read Aloud'}</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-600"
            aria-label="Download branded PDF action plan"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF Plan'}</span>
          </button>

        </div>

      </div>

      {/* Plain Language Summary Paragraph */}
      <div className="space-y-2">
        <h2 id="summary-card-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-brand-500" aria-hidden="true" />
          <span>Plain-Language Summary</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
          {summary}
        </p>
      </div>

      {/* Extracted Obligation & Amounts Highlight */}
      {(extractedFields.amountDue || extractedFields.dueDate || extractedFields.caseOrReferenceNumber) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          {extractedFields.amountDue && (
            <div className="p-3.5 bg-brand-50/60 rounded-xl border border-brand-200">
              <span className="text-[11px] font-bold text-brand-800 uppercase">Amount Cited</span>
              <p className="text-base font-extrabold text-brand-950 mt-0.5">{extractedFields.amountDue}</p>
            </div>
          )}
          {extractedFields.dueDate && (
            <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-200">
              <span className="text-[11px] font-bold text-red-800 uppercase">Action Deadline</span>
              <p className="text-base font-extrabold text-red-950 mt-0.5">{extractedFields.dueDate}</p>
            </div>
          )}
          {extractedFields.caseOrReferenceNumber && (
            <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 uppercase">Case / Ref #</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">{extractedFields.caseOrReferenceNumber}</p>
            </div>
          )}
        </div>
      )}

    </section>
  );
}
