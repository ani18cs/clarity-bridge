import React from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'tl', label: 'Tagalog', native: 'Tagalog' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
];

export default function LanguageSwitcher({ currentLanguage = 'en', onLanguageChange }) {
  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="language-select" className="sr-only">Choose Language</label>
      <div className="relative flex items-center">
        <Globe className="w-4 h-4 absolute left-2.5 text-slate-500 pointer-events-none" aria-hidden="true" />
        <select
          id="language-select"
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="appearance-none bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs sm:text-sm font-medium pl-8 pr-7 py-1.5 sm:py-2 rounded-lg border border-slate-200 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.native} ({lang.code.toUpperCase()})
            </option>
          ))}
        </select>
        <span className="absolute right-2 text-[10px] text-slate-400 pointer-events-none">▼</span>
      </div>
    </div>
  );
}
