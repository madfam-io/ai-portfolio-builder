'use client';

import { useLanguage } from '@/lib/i18n/simple-context-v2';

export default function SimpleLanguageTest() {
  const context = useLanguage();
  
  console.log('🧪 SimpleLanguageTest: Full context:', context);
  console.log('🧪 SimpleLanguageTest: Language:', context.language);
  console.log('🧪 SimpleLanguageTest: SetLanguage function:', typeof context.setLanguage);
  console.log('🧪 SimpleLanguageTest: Translations:', context.t);

  return (
    <div className="fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg z-50 max-w-xs">
      <h3 className="font-bold mb-2">🧪 Simple Test</h3>
      <p className="text-sm mb-2">Lang: {context.language}</p>
      <p className="text-sm mb-2">Hero: {context.t?.heroTitle || 'MISSING'}</p>
      <button
        onClick={() => {
          console.log('🧪 SimpleLanguageTest: Button clicked, calling setLanguage');
          context.setLanguage('en');
        }}
        className="bg-white text-red-600 px-2 py-1 rounded text-sm"
      >
        Set EN
      </button>
      <button
        onClick={() => {
          console.log('🧪 SimpleLanguageTest: Button clicked, calling setLanguage');
          context.setLanguage('es');
        }}
        className="bg-white text-red-600 px-2 py-1 rounded text-sm ml-1"
      >
        Set ES
      </button>
    </div>
  );
}