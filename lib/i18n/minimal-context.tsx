'use client';

import { createContext, useContext } from 'react';

const translations = {
  es: {
    features: 'Características',
    howItWorks: 'Cómo Funciona', 
    templates: 'Plantillas',
    pricing: 'Precios',
    getStarted: 'Comenzar',
    heroTitle: 'Convierte tu CV en un',
    heroTitle2: 'Portafolio Impresionante',
    heroTitle3: 'en 30 Minutos',
    heroDesc: 'Descripción del héroe',
    watchDemo: 'Ver Demo',
    startFreeTrial: 'Prueba Gratuita',
    ctaTitle: 'Título CTA',
    ctaSubtitle: 'Subtítulo CTA', 
    ctaButton: 'Botón CTA',
    ctaFooter: 'Pie CTA',
    noCreditCard: 'Sin tarjeta',
    joinProfessionals: 'Únete',
    rating: '4.9/5',
    footerTagline: 'Constructor de portafolios'
  }
};

interface MinimalLanguageContextType {
  language: 'es';
  setLanguage: (lang: 'es') => void;
  t: typeof translations.es;
  availableLanguages: { code: 'es'; name: string; flag: string }[];
}

const MinimalLanguageContext = createContext<MinimalLanguageContextType>({
  language: 'es',
  setLanguage: () => {},
  t: translations.es,
  availableLanguages: [{ code: 'es', name: 'Español', flag: '🇪🇸' }],
});

export const useLanguage = () => {
  return useContext(MinimalLanguageContext);
};

export const MinimalLanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const value: MinimalLanguageContextType = {
    language: 'es',
    setLanguage: () => {}, // No-op for now
    t: translations.es,
    availableLanguages: [{ code: 'es', name: 'Español', flag: '🇪🇸' }],
  };

  return (
    <MinimalLanguageContext.Provider value={value}>
      {children}
    </MinimalLanguageContext.Provider>
  );
};