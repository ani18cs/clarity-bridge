import React from 'react';
import { History, User, LogOut, Sparkles } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar({ 
  user, 
  onOpenAuth, 
  onLogout, 
  onOpenHistory, 
  historyCount = 0,
  currentLanguage,
  onLanguageChange,
  onScanClick
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#F5F3FF]/90 backdrop-blur-md border-b-2 border-ink transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <a 
          href="#top" 
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-2.5 text-decoration-none group cursor-pointer"
        >
          <span 
            className="w-10 h-10 rounded-xl bg-periwinkle flex items-center justify-center border-2 border-ink shadow-neo-sm transform -rotate-6 transition-transform group-hover:rotate-0"
            aria-hidden="true"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 17c2-4 6-6 9-6s7 2 9 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M3 17v3M21 17v3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
            ClarityBridge
          </span>
        </a>

        {/* Center / Right Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Language Switcher */}
          <LanguageSwitcher 
            currentLanguage={currentLanguage} 
            onLanguageChange={onLanguageChange} 
          />

          {/* Past Submissions / History */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="btn-neo btn-ghost-neo btn-neo-sm hidden sm:inline-flex items-center gap-1.5"
            aria-label={`View history, ${historyCount} items saved`}
          >
            <History className="w-4 h-4 text-ink" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-xs font-black bg-marigold text-ink border border-ink ml-1">
                {historyCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l-2 border-ink/20">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-bold text-ink truncate max-w-[120px]">{user.displayName || user.email?.split('@')[0] || 'User'}</p>
                <p className="text-[10px] text-slate-500 font-semibold">Active Session</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-2 text-ink hover:text-coral hover:bg-coral-pale rounded-xl border border-ink/40 transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="btn-neo btn-ghost-neo btn-neo-sm hidden md:inline-flex"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

          {/* Scan a document CTA */}
          <button
            type="button"
            onClick={() => {
              if (onScanClick) onScanClick();
              else window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="btn-neo btn-primary-neo btn-neo-sm"
          >
            <span>Scan Document</span>
          </button>

        </div>
      </div>
    </header>
  );
}
