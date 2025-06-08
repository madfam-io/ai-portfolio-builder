'use client';

import { useLanguage } from '@/lib/i18n/simple-context-v2';
import { useEffect, useState } from 'react';

export default function LanguageDebug() {
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const [renderCount, setRenderCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const currentLang = availableLanguages.find(lang => lang.code === language);
  const otherLang = availableLanguages.find(lang => lang.code !== language);

  useEffect(() => {
    console.log('🔄 LanguageDebug: Language changed to:', language);
    setRenderCount(prev => prev + 1);
    setLastUpdate(Date.now());
  }, [language]);

  useEffect(() => {
    console.log('🔄 LanguageDebug: Translation object changed:', t);
  }, [t]);

  const handleDebugClick = () => {
    const newLang = otherLang?.code || 'en';
    console.log('🔄 Debug Button Clicked!');
    console.log('  Current language:', language);
    console.log('  Target language:', newLang);
    console.log('  Current translations:', t);
    console.log('  Available languages:', availableLanguages);
    console.log('  setLanguage function:', typeof setLanguage);
    
    try {
      setLanguage(newLang);
      console.log('✅ setLanguage called successfully');
    } catch (error) {
      console.error('❌ Error calling setLanguage:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg z-50 max-w-xs">
      <h3 className="font-bold mb-2">🐛 Language Debug</h3>
      <p className="text-sm mb-1">Renders: {renderCount}</p>
      <p className="text-sm mb-1">
        Current: {language} ({currentLang?.name})
      </p>
      <p className="text-sm mb-1">Title: {t.heroTitle?.substring(0, 20)}...</p>
      <p className="text-sm mb-1">
        localStorage:{' '}
        {typeof window !== 'undefined'
          ? localStorage.getItem('madfam-language')
          : 'N/A'}
      </p>
      <p className="text-sm mb-2">
        Last Update: {new Date(lastUpdate).toLocaleTimeString()}
      </p>
      <button
        onClick={handleDebugClick}
        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition"
      >
        Switch to {otherLang?.name} {otherLang?.flag}
      </button>
      <button
        onClick={() => {
          console.log('🔄 Force English Test');
          setLanguage('en');
        }}
        className="w-full mt-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition"
      >
        Force English
      </button>
      <button
        onClick={() => {
          console.log('🔄 Force Spanish Test');
          setLanguage('es');
        }}
        className="w-full mt-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition"
      >
        Force Spanish
      </button>
    </div>
  );
}
