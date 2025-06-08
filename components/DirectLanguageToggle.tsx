'use client';

import { useEffect, useState } from 'react';

// Direct translations without context
const directTranslations = {
  es: {
    heroTitle: 'Convierte tu CV en un',
    heroTitle2: 'Portafolio Impresionante',
    test: 'Texto en Español'
  },
  en: {
    heroTitle: 'Turn Your CV Into a',
    heroTitle2: 'Stunning Portfolio', 
    test: 'Text in English'
  }
};

export default function DirectLanguageToggle() {
  const [currentLang, setCurrentLang] = useState<'es' | 'en'>('es');
  const [testText, setTestText] = useState('Texto en Español');

  const switchLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    console.log('🔴 DirectLanguageToggle: Switching from', currentLang, 'to', newLang);
    
    setCurrentLang(newLang);
    setTestText(directTranslations[newLang].test);
    
    // Also update localStorage for persistence
    localStorage.setItem('madfam-language', newLang);
    
    console.log('🔴 DirectLanguageToggle: Language switched to', newLang);
    console.log('🔴 DirectLanguageToggle: Test text is now', directTranslations[newLang].test);
  };

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('madfam-language') as 'es' | 'en';
    if (saved === 'es' || saved === 'en') {
      setCurrentLang(saved);
      setTestText(directTranslations[saved].test);
    }
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-red-600 text-white p-4 rounded-lg z-50 max-w-xs">
      <h3 className="font-bold mb-2">🔴 Direct Toggle</h3>
      <p className="text-sm mb-2">Current: {currentLang}</p>
      <p className="text-sm mb-2 font-bold">{testText}</p>
      <p className="text-sm mb-2">Hero: {directTranslations[currentLang].heroTitle}</p>
      <button
        onClick={switchLanguage}
        className="w-full bg-white text-red-600 px-3 py-2 rounded font-bold"
      >
        Switch to {currentLang === 'es' ? 'English' : 'Español'}
      </button>
      <button
        onClick={() => {
          console.log('🔴 Alert test button clicked');
          alert('This button definitely works! Current lang: ' + currentLang);
        }}
        className="w-full mt-2 bg-yellow-500 text-black px-3 py-1 rounded text-sm"
      >
        Alert Test
      </button>
    </div>
  );
}