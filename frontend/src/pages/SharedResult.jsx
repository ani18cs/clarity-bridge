import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  ArrowLeft, 
  Clock, 
  FileText, 
  Loader2, 
  AlertCircle,
  Volume2,
  VolumeX,
  Download
} from 'lucide-react';
import api from '../utils/api';
import AuthenticityBadge from '../components/AuthenticityBadge';
import ActionPlanView from '../components/ActionPlanView';
import FactCheckSection from '../components/FactCheckSection';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { useSpeech } from '../hooks/useSpeech';

export default function SharedResult({ shareId, onHomeClick }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isPlaying, speechLoading, speakText, stopSpeaking } = useSpeech();

  useEffect(() => {
    const fetchSharedDoc = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/share/${shareId}`);
        if (res.data?.success && res.data?.data) {
          setData(res.data.data);
        } else {
          throw new Error(res.data?.message || 'Shared link not found or expired.');
        }
      } catch (err) {
        console.error('Fetch shared doc error:', err);
        setError(err.response?.data?.message || 'This shared document link has expired or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedDoc();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-periwinkle" />
        <h3 className="font-display font-black text-xl text-ink">Loading Shared Document Analysis…</h3>
        <p className="text-xs text-[#454264]">Retrieving verified breakdown and action steps.</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-card-coral text-coral border-3 border-ink shadow-neo mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-black text-2xl text-ink">Link Unavailable</h2>
          <p className="text-sm text-[#454264] font-medium">
            {error || 'This shared link has expired or was removed to protect user privacy.'}
          </p>
        </div>
        <button
          onClick={onHomeClick}
          className="btn-neo btn-periwinkle-neo btn-neo-md"
        >
          <span>Go to ClarityBridge Home</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn">
      
      {/* Top Banner: Prominent Civic Shared Context & Disclaimer */}
      <div className="p-4 sm:p-5 bg-periwinkle-pale border-3 border-ink rounded-neo shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-periwinkle text-white text-[11px] font-black uppercase rounded-full border border-ink shadow-neo-xs">
              Shared View
            </span>
            <span className="text-xs font-bold text-periwinkle-deep">
              ClarityBridge Read-Only Report
            </span>
          </div>
          <h1 className="font-display font-black text-lg sm:text-xl text-ink">
            Shared Document Analysis & Action Plan
          </h1>
          <p className="text-xs text-[#3a3752] font-medium leading-relaxed">
            {data.disclaimer || 'Shared via ClarityBridge — an assistive translation/triage tool, not a lawyer or government agency.'}
          </p>
        </div>

        <button
          onClick={onHomeClick}
          className="btn-neo btn-grass-neo btn-neo-sm flex-shrink-0 self-start sm:self-center flex items-center gap-2"
        >
          <span>Analyze Your Own Document</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Authenticity Badge & Signals */}
      <AuthenticityBadge
        authenticity={data.authenticity}
        analysisData={data}
      />

      {/* Summary Section */}
      <section className="bg-white rounded-neo border-3 border-ink shadow-neo p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b-2 border-ink/10">
          <span className="text-xs font-black uppercase text-periwinkle tracking-wider">
            {data.documentType?.replace(/_/g, ' ').toUpperCase() || 'DOCUMENT'}
          </span>

          <button
            onClick={() => speakText(data.summary, data.language)}
            disabled={speechLoading}
            className="btn-neo btn-marigold-neo btn-neo-sm flex items-center gap-1.5"
          >
            {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Stop Audio' : '🔊 Listen'}</span>
          </button>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-black text-2xl text-ink">Plain-Language Summary</h2>
          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
            {data.summary}
          </p>
        </div>
      </section>

      {/* Action Plan */}
      <ActionPlanView
        actionPlan={data.actionPlan}
        documentType={data.documentType}
      />

      {/* Fact Checks */}
      <FactCheckSection
        factChecks={data.factChecks}
      />

      {/* Disclaimer */}
      <DisclaimerBanner />

    </div>
  );
}
