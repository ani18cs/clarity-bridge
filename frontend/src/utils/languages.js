export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', region: 'Default' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', region: 'India (National)' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', region: 'Andhra / Telangana' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', region: 'West Bengal' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', region: 'Maharashtra' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', region: 'Gujarat' }
];

export const getLanguageLabel = (code = 'en') => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? `${lang.native} (${lang.label})` : 'English';
};
