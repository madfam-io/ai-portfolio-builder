'use client';

import { useLanguage } from '@/lib/i18n/simple-context';
import { useEffect, useState } from 'react';

export default function LanguageDebug() {
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const [renderCount, setRenderCount] = useState(0);

  const currentLang = availableLanguages.find(lang => lang.code === language);
  const otherLang = availableLanguages.find(lang => lang.code !== language);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, [language]); // Update render count when language changes

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg z-50 max-w-xs">
      <h3 className="font-bold mb-2">🐛 Language Debug</h3>
      <p className="text-sm mb-1">Renders: {renderCount}</p>
      <p className="text-sm mb-1">
        Current: {language} ({currentLang?.name})
      </p>
      <p className="text-sm mb-1">Title: {t.heroTitle.substring(0, 20)}...</p>
      <p className="text-sm mb-2">
        localStorage:{' '}
        {typeof window !== 'undefined'
          ? localStorage.getItem('madfam-language')
          : 'N/A'}
      </p>
      <button
        onClick={() => {
          console.log(
            '🔄 Debug: Switching language from',
            language,
            'to',
            otherLang?.code
          );
          setLanguage(otherLang?.code || 'en');
        }}
        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition"
      >
        Switch to {otherLang?.name} {otherLang?.flag}
      </button>
    </div>
  );
}
