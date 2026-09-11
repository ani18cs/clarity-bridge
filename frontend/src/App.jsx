import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SharedResult from './pages/SharedResult';
import Footer from './components/Footer';
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
  const [activeShareId, setActiveShareId] = useState(null);

  // Check URL pathname for shared results (/shared/:shareId or ?share=...)
  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (path.startsWith('/shared/')) {
      const id = path.replace('/shared/', '').trim();
      if (id) setActiveShareId(id);
    } else if (searchParams.get('share')) {
      setActiveShareId(searchParams.get('share'));
    }

    const handlePopState = () => {
      const p = window.location.pathname;
      if (p.startsWith('/shared/')) {
        setActiveShareId(p.replace('/shared/', '').trim());
      } else {
        setActiveShareId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  const handleScanClick = () => {
    if (activeShareId) {
      window.history.pushState({}, '', '/');
      setActiveShareId(null);
    }
    setTimeout(() => {
      const el = document.getElementById('demo');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleGoHome = () => {
    window.history.pushState({}, '', '/');
    setActiveShareId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg font-sans text-ink selection:bg-periwinkle-pale selection:text-periwinkle-deep">
      
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={logout}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyItems.length}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onScanClick={handleScanClick}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {activeShareId ? (
          <SharedResult 
            shareId={activeShareId} 
            onHomeClick={handleGoHome} 
          />
        ) : (
          <Home
            user={user}
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            onSubmissionCompleted={handleSubmissionCompleted}
          />
        )}
      </div>

      {/* Site Footer */}
      <Footer />

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
