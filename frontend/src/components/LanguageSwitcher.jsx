import React from 'react';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

export default function LanguageSwitcher({ currentLanguage = 'en', onLanguageChange, variant = 'default' }) {
  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="language-select" className="sr-only">Choose Response Language</label>
      <div className="relative flex items-center">
        <Globe className="w-4 h-4 absolute left-2.5 text-slate-500 pointer-events-none" aria-hidden="true" />
        <select
          id="language-select"
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className={`appearance-none font-bold text-xs sm:text-sm pl-8 pr-7 py-1.5 sm:py-2 rounded-xl border-2 border-ink cursor-pointer transition-all shadow-neo-xs hover:shadow-neo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-periwinkle ${
            variant === 'prominent' 
              ? 'bg-card-marigold text-ink' 
              : 'bg-white text-ink'
          }`}
          aria-label="Select output translation language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="text-ink bg-white font-medium">
              {lang.native} — {lang.label} {lang.code === 'en' ? '(Default)' : ''}
            </option>
          ))}
        </select>
        <span className="absolute right-2.5 text-[10px] text-ink font-bold pointer-events-none" aria-hidden="true">▼</span>
      </div>
    </div>
  );
}
