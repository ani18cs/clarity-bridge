import React from 'react';
import { ShieldCheck, History, User, LogOut, Globe, Sparkles } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar({ 
  user, 
  onOpenAuth, 
  onLogout, 
  onOpenHistory, 
  historyCount = 0,
  currentLanguage,
  onLanguageChange 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">Clarity<span className="text-brand-600">Bridge</span></span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
                <Sparkles className="w-3 h-3 mr-1 text-brand-500" /> Gemini 2.5
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-500">Universal Citizen Document & Fraud Triage</p>
          </div>
        </div>

        {/* Controls: Language, History, Auth */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Language Switcher */}
          <LanguageSwitcher 
            currentLanguage={currentLanguage} 
            onLanguageChange={onLanguageChange} 
          />

          {/* Past Submissions / History */}
          <button
            onClick={onOpenHistory}
            className="relative inline-flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-700 hover:bg-slate-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            aria-label={`View history, ${historyCount} items saved`}
          >
            <History className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-xs font-semibold bg-brand-100 text-brand-800">
                {historyCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">{user.displayName || user.email?.split('@')[0] || 'User'}</p>
                <p className="text-[10px] text-slate-500">Authenticated</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-red-500"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
