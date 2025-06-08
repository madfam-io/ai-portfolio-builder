'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationKeys } from './types';
import { translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>('es'); // Spanish as default
  const [isClient, setIsClient] = useState(false);

  const availableLanguages = [
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  ];

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load language from localStorage on mount
  useEffect(() => {
    if (isClient) {
      try {
        const savedLanguage = localStorage.getItem('madfam-language') as Language;
        if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
          setLanguageState(savedLanguage);
        } else {
          // Detect browser language, default to Spanish
          const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'es';
          const detectedLang = browserLang === 'en' ? 'en' : 'es';
          setLanguageState(detectedLang);
          localStorage.setItem('madfam-language', detectedLang);
        }
      } catch (error) {
        console.warn('Language detection failed, using default:', error);
        setLanguageState('es');
      }
    }
  }, [isClient]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (isClient) {
      localStorage.setItem('madfam-language', lang);
      // Update document language
      document.documentElement.lang = lang;
    }
  };

  // Update document language when language changes
  useEffect(() => {
    if (isClient) {
      document.documentElement.lang = language;
    }
  }, [language, isClient]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    availableLanguages,
  };

  // console.log('🔧 Context providing value:', { language, isClient, t: !!translations[language] });

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
