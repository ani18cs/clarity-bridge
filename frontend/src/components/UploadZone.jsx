import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Mic, 
  MicOff, 
  FileText, 
  UploadCloud, 
  X, 
  Square, 
  ArrowRight,
  Sparkles,
  Globe
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const DEMO_SAMPLES = [
  {
    name: '📄 Income Tax Notice u/s 156 (Authentic)',
    content: `GOVERNMENT OF INDIA - INCOME TAX DEPARTMENT
Office of the Income Tax Officer, Ward 12(3), New Delhi
Notice Date: 12/08/2026
Document Identification Number (DIN): ITBA/AST/S/156/2026-27/104829104859
PAN: ABCDE1234F | Assessment Year: 2025-26

NOTICE OF DEMAND UNDER SECTION 156 OF THE INCOME TAX ACT, 1961
To: Shri Rajesh Sharma, 42 Barakhamba Road, Connaught Place, New Delhi

This is to notify that for the Assessment Year 2025-26, a sum of Rs. 18,450 (Rupees Eighteen Thousand Four Hundred Fifty only) has been determined to be payable by you pursuant to assessment order passed under section 143(3).
You are required to pay the said demand within thirty (30) days of the service of this notice via the official e-Filing portal at https://eportal.incometax.gov.in.
In case of grievance, file a rectification request u/s 154 or appeal before CIT(Appeals).
Contact: Incometax Helpdesk 1800-180-1961 | efilingwebmanager@incometax.gov.in`
  },
  {
    name: '🚨 Fake ITD Threat (Fraudulent)',
    content: `CENTRAL INCOME TAX RECOVERY POLICE FORCE - FINAL ARREST SUMMONS
URGENT NOTICE - CASE REF: ITD-DELHI-ARREST-9921
Dear Taxpayer,
Your PAN ABCDE1234F is implicated in money laundering and tax default of Rs 48,500. A non-bailable arrest warrant has been issued by Special Tax Court.
Police team will arrive at your registered residence within 2 hours.
DO NOT CONTACT LAWYER OR LOCAL POLICE.
To cancel this immediate arrest warrant, you must immediately purchase Rs 48,500 in Google Play / Apple Gift Cards or transfer to UPI ID: tax-settlement-officer@upi.
Call Emergency Settlement Inspector at +91-9876543210 immediately.`
  },
  {
    name: '⚖️ Cheque Bounce Notice u/s 138 (Legal)',
    content: `ADVOCATE ARUN MEHTA & ASSOCIATES
High Court Chambers, Fort, Mumbai - 400001
Date: 15/07/2026 | Ref No: AM/LEG/2026/884

LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881
To: Prime Solutions Pvt Ltd, Andheri East, Mumbai

Under instructions from our client M/s Zenith Enterprises, we hereby give you notice:
Cheque No. 492011 dated 01/07/2026 drawn on HDFC Bank for Rs. 2,50,000/- was returned unpaid by the bank with the memo 'Funds Insufficient' on 08/07/2026.
You are hereby called upon to pay the entire amount of Rs. 2,50,000 within fifteen (15) days of receipt of this notice, failing which our client shall initiate criminal prosecution against you under Section 138 of the Negotiable Instruments Act without further reference.
Advocate Contact: +91-22-22661234 | legal@mehta-associates.in`
  },
  {
    name: '💡 State Electricity Notice (Official)',
    content: `MAHARASHTRA STATE ELECTRICITY DISTRIBUTION CO. LTD. (MSEDCL)
Sub-Division Office, Pune Urban Circle
Consumer No: 019284729102 | Bill Date: 05/09/2026

DISCONNECTION NOTICE UNDER SECTION 56(1) OF ELECTRICITY ACT, 2003
Dear Consumer,
Your electricity bill for the billing cycle of August 2026 remains unpaid in the amount of Rs. 3,420.00.
Please take notice that power supply to your premises will be disconnected after fifteen (15) days from this notice if payment is not credited.
You can pay online at https://www.mahadiscom.in or via the Mahavitaran Mobile App.
Customer Care Helpline: 1912 / 1800-233-3435 | customercare@mahadiscom.in`
  }
];

export default function UploadZone({ 
  onAnalyze, 
  isAnalyzing, 
  currentLanguage, 
  onLanguageChange,
  initialMode = 'upload'
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState(initialMode); // 'upload' | 'camera' | 'voice' | 'text'
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialMode && initialMode !== activeTab) {
      setActiveTab(initialMode);
      if (initialMode === 'camera') startCamera();
    }
  }, [initialMode]);

  // File Handlers
  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit. Please upload a smaller file.');
      return;
    }
    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragOver(true);
    } else if (e.type === 'dragleave') {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Voice Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Could not access microphone. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsRecording(false);
  };

  // Camera Handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Could not access camera. Please allow camera permissions.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], `document_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      handleFileChange(file);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Quick Samples
  const loadSample = (sample) => {
    clearFile();
    clearAudio();
    setTextInput(sample.content);
    setActiveTab('text');
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile && !audioBlob && !textInput.trim()) {
      alert('Please upload a document, record audio, or enter text to analyze.');
      return;
    }

    const formData = new FormData();
    if (selectedFile) formData.append('file', selectedFile);
    if (audioBlob) formData.append('audio', audioBlob, 'voice_recording.webm');
    if (textInput.trim()) formData.append('text', textInput.trim());
    formData.append('language', currentLanguage);

    onAnalyze(formData);
  };

  return (
    <div className="w-full space-y-8" id="demo">
      
      {/* App Card Shell with Mockup Style */}
      <div className="bg-white border-3 border-ink rounded-neo-lg shadow-neo overflow-hidden transition-all">
        
        {/* Retro macOS / Playful Topbar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b-3 border-ink bg-periwinkle-pale gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-ink bg-coral" aria-hidden="true" />
            <span className="w-3.5 h-3.5 rounded-full border-2 border-ink bg-marigold" aria-hidden="true" />
            <span className="w-3.5 h-3.5 rounded-full border-2 border-ink bg-grass" aria-hidden="true" />
            <span className="ml-2 font-bold text-xs sm:text-sm text-ink">ClarityBridge — Universal Document Ingestion</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink/80 hidden sm:inline">Response Language:</span>
            <LanguageSwitcher
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
            />
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 md:p-10 space-y-6">
          
          <div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink mb-1">
              What have you got?
            </h3>
            <p className="text-sm sm:text-base text-[#454264] font-medium">
              Drop it in, snap it, or just talk — whatever's easiest.
            </p>
          </div>

          {/* 1. File Upload Dropzone (Primary) */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => {
              if (!selectedFile) fileInputRef.current?.click();
            }}
            className={`border-3 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all ${
              selectedFile
                ? 'border-grass bg-card-grass'
                : isDragOver
                ? 'border-periwinkle bg-periwinkle-pale scale-[0.99]'
                : 'border-periwinkle-deep/80 bg-periwinkle-pale/70 hover:bg-periwinkle-pale cursor-pointer'
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
            aria-label="Upload document image or PDF file"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            />

            {!selectedFile ? (
              <div>
                <div className="text-4xl sm:text-5xl mb-3" aria-hidden="true">📥</div>
                <p className="font-bold text-base sm:text-lg text-periwinkle-deep">
                  Drag a photo or PDF here, or choose an option below
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Supports multi-page PDFs, photos (JPEG, PNG), Indian tax notices, bills, court summons (up to 15MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-left">
                  {filePreview ? (
                    <img src={filePreview} alt="Document thumbnail preview" className="w-16 h-16 object-cover rounded-xl border-2 border-ink shadow-neo-xs" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-periwinkle text-white border-2 border-ink flex items-center justify-center font-display font-extrabold text-lg shadow-neo-xs">
                      PDF
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-ink text-base truncate max-w-xs sm:max-w-md">{selectedFile.name}</p>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Grounded AI Analysis</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="p-2 rounded-xl bg-white hover:bg-coral-pale text-ink border-2 border-ink shadow-neo-xs transition-colors"
                  aria-label="Remove attached file"
                >
                  <X className="w-5 h-5 text-coral" />
                </button>
              </div>
            )}
          </div>

          {/* 4 Mode Option Tiles from Mockup */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            
            <button
              type="button"
              onClick={() => { setActiveTab('camera'); startCamera(); }}
              className={`border-2.5 border-dashed border-ink rounded-2xl p-4 text-center font-bold text-sm transition-all ${
                activeTab === 'camera' ? 'bg-card-marigold -translate-y-1 shadow-neo-xs' : 'bg-white hover:bg-periwinkle-pale'
              }`}
            >
              <span className="text-2xl block mb-1.5" aria-hidden="true">📷</span>
              <span>Take a photo</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('voice'); stopCamera(); }}
              className={`border-2.5 border-dashed border-ink rounded-2xl p-4 text-center font-bold text-sm transition-all ${
                activeTab === 'voice' ? 'bg-card-marigold -translate-y-1 shadow-neo-xs' : 'bg-white hover:bg-periwinkle-pale'
              }`}
            >
              <span className="text-2xl block mb-1.5" aria-hidden="true">🎙️</span>
              <span>Record my voice</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('upload'); stopCamera(); fileInputRef.current?.click(); }}
              className={`border-2.5 border-dashed border-ink rounded-2xl p-4 text-center font-bold text-sm transition-all ${
                activeTab === 'upload' ? 'bg-card-marigold -translate-y-1 shadow-neo-xs' : 'bg-white hover:bg-periwinkle-pale'
              }`}
            >
              <span className="text-2xl block mb-1.5" aria-hidden="true">📎</span>
              <span>Upload a file</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('text'); stopCamera(); }}
              className={`border-2.5 border-dashed border-ink rounded-2xl p-4 text-center font-bold text-sm transition-all ${
                activeTab === 'text' ? 'bg-card-marigold -translate-y-1 shadow-neo-xs' : 'bg-white hover:bg-periwinkle-pale'
              }`}
            >
              <span className="text-2xl block mb-1.5" aria-hidden="true">⌨️</span>
              <span>Paste text</span>
            </button>

          </div>

          {/* Camera View Mode */}
          {activeTab === 'camera' && isCameraActive && (
            <div className="rounded-2xl border-3 border-ink overflow-hidden bg-black aspect-video max-w-lg mx-auto relative shadow-neo">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="btn-neo btn-primary-neo btn-neo-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Page</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="btn-neo btn-ghost-neo btn-neo-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Voice View Mode */}
          {activeTab === 'voice' && (
            <div className="bg-periwinkle-pale border-2.5 border-ink rounded-2xl p-6 text-center space-y-4">
              <div className={`w-20 h-20 mx-auto rounded-full border-3 border-ink flex items-center justify-center transition-all ${
                isRecording ? 'bg-coral text-white animate-bounce-custom' : 'bg-marigold text-ink shadow-neo-sm'
              }`}>
                {isRecording ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10" />}
              </div>

              <p className="font-bold text-ink text-base">
                {isRecording ? 'Listening... Explain the letter or read details' : 'Record a voice description or read the notice aloud'}
              </p>

              <div className="flex justify-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="btn-neo btn-primary-neo btn-neo-sm"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Voice Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="btn-neo btn-coral-neo btn-neo-sm"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Finish Recording</span>
                  </button>
                )}
              </div>

              {audioUrl && (
                <div className="mt-4 p-3 bg-white rounded-xl border-2 border-ink flex items-center justify-between max-w-sm mx-auto shadow-neo-xs">
                  <audio src={audioUrl} controls className="h-8 max-w-[240px]" />
                  <button type="button" onClick={clearAudio} className="text-xs font-bold text-coral hover:underline">
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Text View Mode */}
          {activeTab === 'text' && (
            <div>
              <label htmlFor="pasted-text" className="block text-sm font-bold text-ink mb-2">
                Paste message or notice text below:
              </label>
              <textarea
                id="pasted-text"
                rows={6}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste the text of an IT notice, legal demand, electricity bill, GST notice, SMS, or letter here..."
                className="w-full p-4 rounded-xl border-2 border-ink bg-white text-ink text-sm font-medium focus:bg-white focus:ring-0"
              />
            </div>
          )}

          {/* Extra note context box for non-text tabs */}
          {activeTab !== 'text' && (
            <div>
              <label htmlFor="extra-context" className="block text-xs font-bold text-[#454264] mb-1">
                Optional note or question:
              </label>
              <input
                id="extra-context"
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g., 'What is my actual deadline under Section 156?' or 'Is this DIN valid?'"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-ink bg-white text-sm text-ink font-medium"
              />
            </div>
          )}

          {/* Submit Action Bar */}
          <div className="pt-4 border-t-2 border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-periwinkle" />
              <span>Multi-tier analysis: Gemini 2.5 Grounded Extraction + DIN/GST Verification</span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isAnalyzing}
              className="btn-neo btn-primary-neo w-full sm:w-auto text-base px-8 py-3.5"
            >
              <span>{isAnalyzing ? 'Analyzing Document…' : 'Analyze it →'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>

      {/* 1-Click Test Samples */}
      <div className="bg-card-marigold/60 border-2.5 border-ink rounded-2xl p-5 shadow-neo-sm">
        <p className="font-display font-extrabold text-sm text-ink uppercase tracking-wider mb-3">
          Or try a 1-Click test document:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {DEMO_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(sample)}
              className="text-left p-3 rounded-xl bg-white border-2 border-ink hover:bg-periwinkle-pale transition-all shadow-neo-xs hover:-translate-y-0.5"
            >
              <div className="font-bold text-xs text-ink truncate">{sample.name}</div>
              <div className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">{sample.content.substring(0, 42)}...</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
