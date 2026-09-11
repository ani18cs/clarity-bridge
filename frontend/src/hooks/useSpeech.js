import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';

export function useSpeech() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechLoading, setSpeechLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied or unsupported:', err);
      alert('Could not access your microphone. Please grant browser permissions.');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Reset audio recording
  const clearRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsRecording(false);
  };

  // Read Aloud / Speak text (TTS)
  const speakText = async (text, language = 'en') => {
    if (!text) return;

    // If already playing, toggle stop
    if (isPlaying) {
      stopSpeaking();
      return;
    }

    setSpeechLoading(true);

    try {
      // 1. Attempt Cloud TTS via backend
      let langCode = 'en-US';
      if (language === 'hi') langCode = 'hi-IN';
      else if (language === 'ta') langCode = 'ta-IN';
      else if (language === 'te') langCode = 'te-IN';
      else if (language === 'kn') langCode = 'kn-IN';
      else if (language === 'bn') langCode = 'bn-IN';
      else if (language === 'mr') langCode = 'mr-IN';
      else if (language === 'en') langCode = 'en-IN';
      
      const res = await api.post('/speech/synthesize', {
        text: text.substring(0, 500), // Clean limit
        languageCode: langCode
      });

      if (res.data?.audioContent) {
        const audioSrc = `data:audio/mp3;base64,${res.data.audioContent}`;
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
        }
        const audio = new Audio(audioSrc);
        audioPlayerRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => fallbackBrowserTTS(text, langCode);
        await audio.play();
        setIsPlaying(true);
        setSpeechLoading(false);
        return;
      }
    } catch (err) {
      // Backend TTS fallback to browser Web Speech API
    }

    fallbackBrowserTTS(text, language);
    setSpeechLoading(false);
  };

  const fallbackBrowserTTS = (text, lang = 'en') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      let browserLang = 'en-US';
      if (lang === 'hi') browserLang = 'hi-IN';
      else if (lang === 'ta') browserLang = 'ta-IN';
      else if (lang === 'te') browserLang = 'te-IN';
      else if (lang === 'kn') browserLang = 'kn-IN';
      else if (lang === 'bn') browserLang = 'bn-IN';
      else if (lang === 'mr') browserLang = 'mr-IN';
      else if (lang === 'en') browserLang = 'en-IN';
      utterance.lang = browserLang;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return {
    isRecording,
    audioBlob,
    audioUrl,
    isPlaying,
    speechLoading,
    startRecording,
    stopRecording,
    clearRecording,
    speakText,
    stopSpeaking
  };
}
