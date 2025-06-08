'use client';

import { useLanguage } from '@/lib/i18n';

export default function LanguageDebugger() {
  const { language, setLanguage, t, availableLanguages } = useLanguage();

  return (
    <div className="fixed top-20 left-4 bg-black text-white p-4 rounded-lg text-xs z-50 opacity-90">
      <div className="font-bold mb-2">Language Debug Info:</div>
      <div>Current: {language}</div>
      <div>Available: {availableLanguages.map(l => l.code).join(', ')}</div>
      <div>Hero Title: {t.heroTitle}</div>
      <div className="mt-2">
        <button 
          onClick={() => setLanguage('en')} 
          className="bg-blue-500 px-2 py-1 mr-2 rounded"
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage('es')} 
          className="bg-red-500 px-2 py-1 rounded"
        >
          ES
        </button>
      </div>
    </div>
  );
}