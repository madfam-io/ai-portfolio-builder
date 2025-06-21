/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type {
  Language,
  FlattenedTranslations,
  TranslationNamespace,
} from '@/lib/i18n/refactored-types';

/**
 * Test-specific language provider that properly handles language switching
 * This provider bypasses localStorage and browser detection for consistent testing
 */

// Mock translations for testing
const mockEsTranslations: unknown = {
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
  },
  landing: {
    heroTitle: 'Convierte tu CV en un',
    heroTitle2: 'Portafolio Profesional',
    heroTitle3: 'que Impresiona',
    heroDesc:
      'PRISMA by MADFAM utiliza inteligencia artificial para transformar tu experiencia en un portafolio deslumbrante que destaca entre la competencia.',
    poweredByAi: 'Potenciado por IA',
    startFreeTrial: 'Comenzar gratis',
    watchDemo: 'Ver demo',
    features: 'Características',
    whatPrismaDoes: 'Qué hace PRISMA',
    pricing: 'Precios',
    getStartedToday: 'Accede hoy.',
    professionalPortfolio: 'portafolio profesional',
    livePortfolio: 'portafolio en vivo',
    howItWorksTitle: 'Del CV al portafolio en 3 simples pasos',
    step1Number: '01',
    step1Title: 'Sube tu CV',
    step1Desc:
      'Nuestro analizador impulsado por IA extrae y organiza tu información profesional automáticamente.',
    step2Number: '02',
    step2Title: 'La IA lo mejora',
    step2Desc:
      'PRISMA optimiza tu contenido, sugiere mejoras y crea descripciones impactantes que resaltan tus logros.',
    step3Number: '03',
    step3Title: 'Publica y comparte',
    step3Desc:
      'Tu portafolio está listo al instante con un enlace personalizado. Comparte y destaca profesionalmente.',
    step4Number: '04',
    step4Title: 'Listo para el mundo',
    step4Desc:
      'Tu portafolio profesional está en línea y optimizado para destacar.',
  },
  dashboard: {
    title: 'Panel de Control',
    welcome: 'Bienvenido',
    createPortfolio: 'Crear Portafolio',
    myPortfolios: 'Mis Portafolios',
    noPortfolios: 'No tienes portafolios aún',
  },
  editor: {
    title: 'Editor de Portafolio',
    save: 'Guardar',
    publish: 'Publicar',
    preview: 'Vista Previa',
  },
};

const mockEnTranslations: unknown = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  landing: {
    heroTitle: 'Turn Your CV Into a',
    heroTitle2: 'Professional Portfolio',
    heroTitle3: 'That Stands Out',
    heroDesc:
      'PRISMA by MADFAM uses artificial intelligence to transform your experience into a stunning portfolio that stands out from the competition.',
    poweredByAi: 'AI-Powered',
    startFreeTrial: 'Start free',
    watchDemo: 'Watch demo',
    features: 'Features',
    whatPrismaDoes: 'What PRISMA Does',
    pricing: 'Pricing',
    getStartedToday: 'Get started today.',
    professionalPortfolio: 'professional portfolio',
    livePortfolio: 'live portfolio',
    howItWorksTitle: 'From CV to portfolio in 3 simple steps',
    step1Number: '01',
    step1Title: 'Upload your CV',
    step1Desc:
      'Our AI-powered analyzer extracts and organizes your professional information automatically.',
    step2Number: '02',
    step2Title: 'AI enhances it',
    step2Desc:
      'PRISMA optimizes your content, suggests improvements and creates impactful descriptions that highlight your achievements.',
    step3Number: '03',
    step3Title: 'Publish and share',
    step3Desc:
      'Your portfolio is instantly ready with a custom link. Share and stand out professionally.',
    step4Number: '04',
    step4Title: 'Ready for the world',
    step4Desc:
      'Your professional portfolio is online and optimized to stand out.',
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome',
    createPortfolio: 'Create Portfolio',
    myPortfolios: 'My Portfolios',
    noPortfolios: 'You have no portfolios yet',
  },
  editor: {
    title: 'Portfolio Editor',
    save: 'Save',
    publish: 'Publish',
    preview: 'Preview',
  },
};

interface TestLanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: FlattenedTranslations;
  availableLanguages: Array<{ code: Language; name: string; flag: string }>;
  getNamespace: (namespace: keyof TranslationNamespace) => any;
  isLoaded: boolean;
}

const TestLanguageContext = createContext<TestLanguageContextValue | null>(
  null
);

/**
 * Test Language Provider that properly supports language switching
 */
export function TestLanguageProvider({
  children,
  initialLanguage = 'es',
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  // Get translations based on current language
  const getTranslations = (lang: Language): unknown => {
    return lang === 'es' ? mockEsTranslations : mockEnTranslations;
  };

  const translations = getTranslations(language);

  // Flatten translations to match the expected format
  const flattenedTranslations: FlattenedTranslations = {};
  Object.entries(translations).forEach(([, values]) => {
    if (values && typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'string') {
          flattenedTranslations[key] = value;
        }
      });
    }
  });

  const value: TestLanguageContextValue = {
    language,
    setLanguage: (newLang: Language) => {
      setLanguage(newLang);
    },
    t: flattenedTranslations,
    availableLanguages: [
      { code: 'es', name: 'Español', flag: '🇲🇽' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
    ],
    getNamespace: (namespace: keyof TranslationNamespace) => {
      return translations[namespace] || {};
    },
    isLoaded: true,
  };

  return (
    <TestLanguageContext.Provider value={value}>
      {children}
    </TestLanguageContext.Provider>
  );
}

/**
 * Hook to use test language context
 */
export function useTestLanguage() {
  const context = useContext(TestLanguageContext);
  if (!context) {
    throw new Error('useTestLanguage must be used within TestLanguageProvider');
  }
  return context;
}

/**
 * Export Language Context for external use
 */
export { TestLanguageContext };
