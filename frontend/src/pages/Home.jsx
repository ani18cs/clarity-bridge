import React, { useState, useRef } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { useSpeech } from '../hooks/useSpeech';

import HeroBridge from '../components/HeroBridge';
import FeaturesSection from '../components/FeaturesSection';
import UploadZone from '../components/UploadZone';
import ProcessingView from '../components/ProcessingView';
import SummaryCard from '../components/SummaryCard';
import AuthenticityBadge from '../components/AuthenticityBadge';
import ActionPlanView from '../components/ActionPlanView';
import FactCheckSection from '../components/FactCheckSection';
import DisclaimerBanner from '../components/DisclaimerBanner';
import ErrorBoundary from '../components/ErrorBoundary';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Home({ user, currentLanguage, onLanguageChange, onSubmissionCompleted }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [activeUploadMode, setActiveUploadMode] = useState('upload');
  const [isTranslating, setIsTranslating] = useState(false);

  const baseResultRef = useRef(null);
  const uploadSectionRef = useRef(null);
  const { isPlaying, speechLoading, speakText, stopSpeaking } = useSpeech();

  const handleSelectHeroMode = (mode) => {
    setActiveUploadMode(mode);
    if (uploadSectionRef.current) {
      uploadSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler for dynamic translation on results screen
  const handleLanguageChangeOnResults = async (newLang) => {
    onLanguageChange(newLang);
    if (!analysisResult) return;

    setIsTranslating(true);
    stopSpeaking();
    try {
      const baseData = baseResultRef.current || analysisResult;
      const response = await api.post('/translate', {
        analysisData: baseData,
        targetLanguage: newLang
      });
      if (response.data?.success && response.data?.data) {
        setAnalysisResult(response.data.data);
      }
    } catch (err) {
      console.warn('Dynamic translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  };

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
        baseResultRef.current = response.data.data;
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
    <div className="relative overflow-hidden">
      
      {/* Background SVG Doodle Pattern */}
      <svg className="absolute top-0 left-0 right-0 w-full h-[640px] pointer-events-none opacity-40 z-0" viewBox="0 0 1080 640" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
        <g className="text-periwinkle-deep opacity-20" transform="translate(60,40) rotate(-8)">
          <rect x="0" y="0" width="46" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="3"/>
          <path d="M0 4 L23 22 L46 4" fill="none" stroke="currentColor" strokeWidth="3"/>
        </g>
        <g className="text-periwinkle-deep opacity-20" transform="translate(900,90) rotate(10)">
          <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3"/>
          <line x1="25" y1="25" x2="38" y2="38" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </g>
        <g className="text-periwinkle-deep opacity-20" transform="translate(180,220) rotate(6)">
          <path d="M2 18 L14 30 L34 4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <g className="text-periwinkle-deep opacity-20" transform="translate(760,260) rotate(-14)">
          <rect x="0" y="0" width="34" height="34" rx="17" fill="none" stroke="currentColor" strokeWidth="3"/>
          <text x="17" y="24" fontSize="20" textAnchor="middle" fill="currentColor" fontFamily="Baloo 2" fontWeight="bold">!</text>
        </g>
        <g className="text-periwinkle-deep opacity-20" transform="translate(980,420) rotate(-4)">
          <rect x="0" y="0" width="46" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="3"/>
          <path d="M0 4 L23 22 L46 4" fill="none" stroke="currentColor" strokeWidth="3"/>
        </g>
        <g className="text-periwinkle-deep opacity-20" transform="translate(40,470) rotate(12)">
          <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3"/>
          <line x1="25" y1="25" x2="38" y2="38" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </g>
        <g className="text-periwinkle-deep opacity-20" transform="translate(500,60) rotate(4)">
          <path d="M2 18 L14 30 L34 4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </svg>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-12 relative z-10">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-card-coral border-2.5 border-ink text-ink flex items-start gap-3 shadow-neo-xs animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-coral mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm">Document Analysis Notice</h4>
              <p className="text-xs sm:text-sm mt-0.5 font-medium">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-xs font-black text-coral hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Hero & Bridge Illustration (Shown when not in results view) */}
        {!analysisResult && (
          <HeroBridge onSelectMode={handleSelectHeroMode} />
        )}

        {/* 2. Interactive Ingestion / Upload Screen */}
        {!isAnalyzing && !analysisResult && (
          <div ref={uploadSectionRef}>
            <UploadZone
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
              initialMode={activeUploadMode}
            />
          </div>
        )}

        {/* 3. Processing Screen */}
        {isAnalyzing && (
          <ProcessingView />
        )}

        {/* 4. Results Screen */}
        {!isAnalyzing && analysisResult && (
          <ErrorBoundary onReset={resetAnalysis}>
            <div className="space-y-8 animate-fadeIn">
              
              {/* Top Back / Reset Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={resetAnalysis}
                  className="btn-neo btn-ghost-neo btn-neo-sm flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>↺ Try another document</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#454264] hidden md:inline">
                    Translate Output:
                  </span>
                  <LanguageSwitcher
                    currentLanguage={currentLanguage}
                    onLanguageChange={handleLanguageChangeOnResults}
                    variant="prominent"
                  />
                  {isTranslating && (
                    <span className="text-xs font-bold text-periwinkle animate-pulse">
                      Translating…
                    </span>
                  )}
                </div>
              </div>

              {/* Authenticity Stamp Badge & Signals */}
              <AuthenticityBadge
                authenticity={analysisResult.authenticity}
                analysisData={analysisResult}
                user={user}
              />

              {/* Plain-Language Summary with TTS & PDF buttons */}
              <SummaryCard
                summary={analysisResult.summary}
                documentType={analysisResult.documentType}
                issuingAuthorityClaimed={analysisResult.issuingAuthorityClaimed}
                documentPurpose={analysisResult.documentPurpose}
                extractedFields={analysisResult.extractedFields}
                language={analysisResult.language || currentLanguage}
                fullAnalysisData={analysisResult}
                onDownloadPdf={handleDownloadPdf}
                isDownloadingPdf={isDownloadingPdf}
                onSpeak={() => speakText(analysisResult.summary, analysisResult.language || currentLanguage)}
                isPlayingAudio={isPlaying}
                isSpeechLoading={speechLoading}
              />

              {/* Structured Prioritized Action Plan / Document Guide */}
              <ActionPlanView
                actionPlan={analysisResult.actionPlan}
                documentType={analysisResult.documentType}
              />

              {/* Fact-Check Speech Bubbles Section */}
              <FactCheckSection
                factChecks={analysisResult.factChecks}
              />

              {/* Bottom Actions Toolbar */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="btn-neo btn-grass-neo btn-neo-sm"
                >
                  <span>⬇️ Download PDF Plan</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => speakText(analysisResult.summary, analysisResult.language)}
                  className="btn-neo btn-marigold-neo btn-neo-sm"
                >
                  <span>🔊 Read this aloud</span>
                </button>
                <button 
                  type="button" 
                  onClick={resetAnalysis}
                  className="btn-neo btn-ghost-neo btn-neo-sm"
                >
                  <span>↺ Try another</span>
                </button>
              </div>

              {/* Legal / Civic Disclaimer Banner */}
              <DisclaimerBanner />

            </div>
          </ErrorBoundary>
        )}

        {/* 5. Features Grid Section (Shown on home view) */}
        {!analysisResult && !isAnalyzing && (
          <FeaturesSection />
        )}

      </main>
    </div>
  );
}
