import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { useSpeech } from '../hooks/useSpeech';

import UploadZone from '../components/UploadZone';
import ProcessingView from '../components/ProcessingView';
import SummaryCard from '../components/SummaryCard';
import AuthenticityBadge from '../components/AuthenticityBadge';
import ActionPlanView from '../components/ActionPlanView';
import FactCheckSection from '../components/FactCheckSection';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Home({ currentLanguage, onLanguageChange, onSubmissionCompleted }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const { isPlaying, speechLoading, speakText, stopSpeaking } = useSpeech();

  // Handler for analyzing new document
  const handleAnalyze = async (formData) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    stopSpeaking();

    try {
      const response = await api.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.success && response.data?.data) {
        setAnalysisResult(response.data.data);
        if (onSubmissionCompleted) {
          onSubmissionCompleted(response.data.data);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response.data?.message || 'Failed to analyze document.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      const msg = err.response?.data?.message || err.message || 'An error occurred during analysis. Please check your file and try again.';
      setErrorMessage(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler for PDF download
  const handleDownloadPdf = async () => {
    if (!analysisResult) return;
    setIsDownloadingPdf(true);

    try {
      const response = await api.post('/pdf', analysisResult, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const fileName = `ClarityBridge_Action_Plan_${analysisResult.id || Date.now()}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Could not download PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const resetAnalysis = () => {
    stopSpeaking();
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start space-x-3 shadow-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Document Analysis Notice</h4>
            <p className="text-xs sm:text-sm mt-0.5">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs font-semibold text-red-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Ingestion / Upload Screen */}
      {!isAnalyzing && !analysisResult && (
        <UploadZone
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
        />
      )}

      {/* 2. Processing Screen */}
      {isAnalyzing && (
        <ProcessingView />
      )}

      {/* 3. Results Screen */}
      {!isAnalyzing && analysisResult && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Top Back / Reset Toolbar */}
          <div className="flex items-center justify-between">
            <button
              onClick={resetAnalysis}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-all focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Analyze Another Document</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Processed with Gemini 2.5 Multimodal Engine
            </span>
          </div>

          {/* Authenticity Badge & Signals (Top Priority) */}
          <AuthenticityBadge
            authenticity={analysisResult.authenticity}
          />

          {/* Plain-Language Summary with TTS & PDF buttons */}
          <SummaryCard
            summary={analysisResult.summary}
            documentType={analysisResult.documentType}
            issuingAuthorityClaimed={analysisResult.issuingAuthorityClaimed}
            extractedFields={analysisResult.extractedFields}
            onDownloadPdf={handleDownloadPdf}
            isDownloadingPdf={isDownloadingPdf}
            onSpeak={() => speakText(analysisResult.summary, analysisResult.language)}
            isPlayingAudio={isPlaying}
            isSpeechLoading={speechLoading}
          />

          {/* Structured Prioritized Action Plan */}
          <ActionPlanView
            actionPlan={analysisResult.actionPlan}
          />

          {/* Fact-Check Section */}
          <FactCheckSection
            factChecks={analysisResult.factChecks}
          />

          {/* Legal / Civic Disclaimer Banner */}
          <DisclaimerBanner />

        </div>
      )}

    </main>
  );
}
