import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Camera, 
  Mic, 
  MicOff, 
  FileText, 
  Image as ImageIcon, 
  FileCheck, 
  X, 
  AlertCircle,
  Play,
  Square,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const DEMO_SAMPLES = [
  {
    name: '🏠 Eviction Notice (Official)',
    type: 'text',
    content: `METRO HOUSING COURT & MUNICIPAL HOUSING AUTHORITY
100 Civic Center Square, Room 204
Notice Date: September 08, 2026
Case No: EV-2026-8819

FOURTEEN (14) DAY NOTICE TO CURE OR VACATE
To: Jane Doe, 742 Evergreen Terrace, Apt 4B

TAKE NOTICE that you are indebted to Metro Housing Management in the amount of $1,200.00 for past-due rent. You are required under State Housing Code § 504 to pay this balance or submit an application for emergency housing mediation within 14 calendar days (by September 22, 2026).

Failure to comply will result in summary court eviction proceedings.
Housing Court Clerk Contact: (555) 234-5678 | clerk@metro-housing.gov | https://metrohousing.gov`
  },
  {
    name: '🚨 IRS Scam Text (Fraudulent)',
    type: 'text',
    content: `INTERNAL REVENUE POLICE DEPARTMENT - FINAL ARREST NOTICE
Dear Citizen / Resident,
A federal warrant CASE-9921 has been issued for your immediate arrest and asset seizure within 2 hours due to unpaid tax liabilities of $950.00. 
DO NOT CONTACT A LAWYER OR LOCAL POLICE.
To cancel this arrest warrant immediately, you must purchase $950 in Apple Gift Cards or deposit Bitcoin to our emergency settlement wallet. Call official agent immediately at +1-800-555-0199 or email support@urgent-gov-clearance.net.`
  },
  {
    name: '💡 Utility Shutoff Notice (Official)',
    type: 'text',
    content: `CITY POWER & WATER UTILITIES
P.O. Box 4891, Municipal District
Notice of Intent to Disconnect Utility Service
Account: #994-1823-01
Amount Overdue: $184.50 | Disconnect Date: October 05, 2026

Dear Customer,
Your electrical utility service is scheduled for disconnection on October 05, 2026 due to an unpaid balance of $184.50. If you are experiencing financial hardship, you may qualify for the Low-Income Home Energy Assistance Program (LIHEAP) or an interest-free payment arrangement.
Please call (555) 345-6789 or visit https://cityutilities.gov/assistance.`
  }
];

export default function UploadZone({ 
  onAnalyze, 
  isAnalyzing, 
  currentLanguage, 
  onLanguageChange 
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text' | 'camera' | 'voice'
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Translate Confusing Documents Into <span className="text-brand-600">Clear Action</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Upload any official letter, bill, eviction notice, or suspicious message. Gemini extracts the facts, checks authenticity, and creates a step-by-step action plan.
        </p>
      </div>

      {/* Main Interactive Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden transition-all">
        
        {/* Input Mode Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5 sm:gap-2">
          
          <button
            type="button"
            onClick={() => { setActiveTab('upload'); stopCamera(); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'upload' 
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('camera'); startCamera(); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'camera' 
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Camera className="w-4 h-4 text-teal-600" aria-hidden="true" />
            <span>Take Photo</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('voice'); stopCamera(); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'voice' 
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Mic className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span>Voice Input</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('text'); stopCamera(); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'text' 
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" aria-hidden="true" />
            <span>Paste Text</span>
          </button>

        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8">

          {/* 1. File Upload Dropzone */}
          {activeTab === 'upload' && (
            <div>
              {!selectedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                    isDragOver 
                      ? 'border-brand-500 bg-brand-50/50 scale-[0.99]' 
                      : 'border-slate-300 hover:border-brand-400 bg-slate-50/40 hover:bg-brand-50/20'
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
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 shadow-inner">
                    <UploadCloud className="w-8 h-8" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Click to browse or drag & drop document
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Supports Photos (JPEG, PNG, WEBP) & PDF documents (up to 15MB)
                  </p>
                </div>
              ) : (
                <div className="bg-brand-50/40 border border-brand-200 rounded-2xl p-4 sm:p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {filePreview ? (
                      <img src={filePreview} alt="Document thumbnail preview" className="w-16 h-16 object-cover rounded-xl border border-brand-300 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                        PDF
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI Analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    aria-label="Remove attached file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Live Camera Mode */}
          {activeTab === 'camera' && (
            <div className="space-y-4 text-center">
              {isCameraActive ? (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-xl mx-auto shadow-md">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-bold shadow-lg hover:bg-slate-100 flex items-center space-x-2"
                    >
                      <Camera className="w-5 h-5 text-brand-600" />
                      <span>Capture Page</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2.5 rounded-full bg-slate-800/80 text-white font-medium hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-4">Camera is closed.</p>
                  <button
                    onClick={startCamera}
                    className="px-5 py-2 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700"
                  >
                    Open Camera
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. Voice Recording Mode */}
          {activeTab === 'voice' && (
            <div className="text-center py-6 space-y-4">
              <div className="max-w-md mx-auto">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                    : 'bg-brand-100 text-brand-700'
                }`}>
                  {isRecording ? <Mic className="w-12 h-12" /> : <MicOff className="w-10 h-10 text-slate-400" />}
                </div>

                <p className="mt-4 text-base font-semibold text-slate-800">
                  {isRecording ? 'Listening... Speak your questions about the notice' : 'Record a voice description or read the notice aloud'}
                </p>

                <div className="mt-4 flex justify-center space-x-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center space-x-2 shadow-sm"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Start Voice Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center space-x-2 shadow-sm"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Finish Recording</span>
                    </button>
                  )}
                </div>

                {audioUrl && (
                  <div className="mt-4 p-3 bg-slate-100 rounded-xl flex items-center justify-between">
                    <audio src={audioUrl} controls className="h-8 max-w-[260px]" />
                    <button onClick={clearAudio} className="text-xs text-red-600 font-semibold hover:underline">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Text Paste Mode */}
          {activeTab === 'text' && (
            <div>
              <label htmlFor="pasted-text" className="block text-sm font-semibold text-slate-800 mb-2">
                Paste message or document text below:
              </label>
              <textarea
                id="pasted-text"
                rows={6}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste the text of an email, letter, court summons, SMS, or notice here..."
                className="w-full p-4 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm focus:bg-white transition-colors focus-visible:ring-2 focus-visible:ring-brand-600"
              />
            </div>
          )}

          {/* Optional context box for upload/voice tabs */}
          {activeTab !== 'text' && (
            <div className="mt-4">
              <label htmlFor="extra-context" className="block text-xs font-semibold text-slate-600 mb-1">
                Optional note or question:
              </label>
              <input
                id="extra-context"
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g., 'What is my actual deadline?' or 'Is this court real?'"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 focus-visible:ring-2 focus-visible:ring-brand-600"
              />
            </div>
          )}

          {/* Primary Submit Button */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>Multi-tier analysis: Gemini 2.5 + Fraud Heuristic + Web Verification</span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-700 via-brand-600 to-teal-500 hover:from-brand-800 hover:to-teal-600 text-white font-bold text-base shadow-md shadow-brand-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <span>{isAnalyzing ? 'Analyzing Document...' : 'Analyze Document & Build Plan'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>

      {/* Instant Quick-Test Demo Samples */}
      <div className="bg-slate-100/80 rounded-2xl p-4 sm:p-5 border border-slate-200">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Or try a 1-Click test document:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {DEMO_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(sample)}
              className="text-left p-2.5 rounded-xl bg-white hover:bg-brand-50/50 border border-slate-200/80 hover:border-brand-300 transition-all text-xs font-medium text-slate-800 hover:text-brand-900 shadow-2xs"
            >
              <div className="font-semibold">{sample.name}</div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">{sample.content.substring(0, 45)}...</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
