import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageSquare, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';
import api from '../utils/api';

export default function ShareModal({ isOpen, onClose, analysisData }) {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  // Initialize or fetch share link if not already fetched
  const handleGenerateShare = async () => {
    if (shareData) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/share', analysisData);
      if (response.data?.success && response.data?.data) {
        setShareData(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to generate share link.');
      }
    } catch (err) {
      console.error('Share generation error:', err);
      setError(err.response?.data?.message || 'Could not generate shareable link.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger on modal mount
  React.useEffect(() => {
    if (isOpen && !shareData) {
      handleGenerateShare();
    }
  }, [isOpen]);

  const shareUrl = shareData?.shareUrl || (typeof window !== 'undefined' ? `${window.location.origin}/shared/${shareData?.shareId || ''}` : '');
  const summarySnippet = analysisData?.summary ? analysisData.summary.substring(0, 120) + '...' : 'Document analysis breakdown';
  const whatsappText = `*ClarityBridge Document Summary*\n\n"${summarySnippet}"\n\nView the full structured action plan here (7-day link):\n${shareUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      alert('Could not copy link to clipboard.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ClarityBridge Analysis - ${analysisData.documentType || 'Document'}`,
          text: `Review this structured action plan and authenticity verdict on ClarityBridge:`,
          url: shareUrl
        });
      } catch (e) {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="bg-white rounded-neo border-3 border-ink shadow-neo w-full max-w-lg p-6 sm:p-8 relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg border-2 border-ink bg-slate-100 hover:bg-slate-200 text-ink shadow-neo-xs transition-all"
          aria-label="Close share dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-periwinkle text-white border-2 border-ink flex items-center justify-center shadow-neo-xs font-black">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 id="share-modal-title" className="font-display font-black text-xl sm:text-2xl text-ink">
              Share Document Result
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#454264] font-medium">
            Generate a secure, time-limited link to share this action plan with a friend, caregiver, or advocate.
          </p>
        </div>

        {/* Security & Scoped Nature Disclosure */}
        <div className="p-3.5 bg-periwinkle-pale border-2 border-ink rounded-2xl text-xs text-ink font-medium flex items-start gap-2.5 shadow-neo-xs">
          <ShieldCheck className="w-4 h-4 text-periwinkle-deep flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-periwinkle-deep">Privacy Protected: </span>
            <span>This link is read-only, expires in 7 days, and requires NO login. It will never expose your account or other documents.</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-ink">
            <Loader2 className="w-6 h-6 animate-spin text-periwinkle" />
            <p className="text-xs font-bold">Creating secure shareable view…</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 bg-card-coral border-2 border-ink rounded-xl text-xs font-bold text-coral">
            {error}
          </div>
        )}

        {/* Share Options */}
        {shareData && !loading && (
          <div className="space-y-4">
            
            {/* Copyable Link Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-ink/70">
                Shareable Web Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-50 border-2 border-ink rounded-xl px-3 py-2 text-xs sm:text-sm text-ink font-mono font-medium focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="btn-neo btn-periwinkle-neo btn-neo-sm flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Quick Share Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              
              {/* WhatsApp Share */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#25D366] text-ink font-extrabold text-xs sm:text-sm rounded-2xl border-2.5 border-ink shadow-neo-xs hover:shadow-neo hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 transition-all no-underline"
              >
                <MessageSquare className="w-4 h-4 text-ink" />
                <span>Share to WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-ink/70 ml-0.5" />
              </a>

              {/* Native Web Share (Mobile / Chrome) */}
              {typeof navigator !== 'undefined' && !!navigator.share && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="btn-neo btn-marigold-neo btn-neo-sm flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-ink" />
                  <span>Other Apps…</span>
                </button>
              )}

            </div>

            {/* Expiry Badge */}
            <div className="flex items-center justify-between text-[11px] text-[#454264] font-bold pt-2 border-t border-ink/10">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Expires: {new Date(shareData.expiresAt).toLocaleDateString()}</span>
              </span>
              <span className="text-slate-400">ID: {shareData.shareId}</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
