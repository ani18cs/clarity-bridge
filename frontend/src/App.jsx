import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import HistoryDrawer from './components/HistoryDrawer';
import AuthModal from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import api from './utils/api';

export default function App() {
  const { 
    user, 
    authError, 
    loginWithGoogle, 
    loginWithEmail, 
    signupWithEmail, 
    logout 
  } = useAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load history from backend
  const fetchHistory = async () => {
    try {
      const res = await api.get('/history');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setHistoryItems(res.data.data);
      }
    } catch (e) {
      console.warn('Could not load history:', e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleSubmissionCompleted = (newSubmission) => {
    setHistoryItems(prev => [newSubmission, ...prev.filter(item => item.id !== newSubmission.id)]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={logout}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyItems.length}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        <Home
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onSubmissionCompleted={handleSubmissionCompleted}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">ClarityBridge — Universal Citizen Document Understanding & Action Planning</p>
          <p>Powered by Google Gemini 2.5 • Vertex AI • Speech-to-Text • Cloud Run • Firestore</p>
        </div>
      </footer>

      {/* History Slide-Out Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyItems}
        onSelectSubmission={(item) => {
          // Can view selected past submission
        }}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginGoogle={loginWithGoogle}
        onLoginEmail={loginWithEmail}
        onSignupEmail={signupWithEmail}
        authError={authError}
      />

    </div>
  );
}
