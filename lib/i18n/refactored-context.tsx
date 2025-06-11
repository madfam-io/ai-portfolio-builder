/**
 * @fileoverview Refactored i18n context provider with modular translations
 * @module i18n/refactored-context
 *
 * This is the new modular version of the i18n system that uses separate
 * translation files for better code organization and maintainability.
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import * as esTranslations from './translations/es';
import * as enTranslations from './translations/en';
import { flattenTranslations } from './utils';
import type {
  Language,
  FlattenedTranslations,
  TranslationNamespace,
} from './refactored-types';

/**
 * Language context value interface
 */
interface LanguageContextValue {
  /**
   * Current language code
   */
  language: Language;

  /**
   * Function to change the current language
   */
  setLanguage: (lang: Language) => void;

  /**
   * Flattened translations for the current language
   */
  t: FlattenedTranslations;

  /**
   * Function to get a specific namespace translations
   */
  getNamespace: (
    namespace: keyof TranslationNamespace
  ) => Record<string, string>;

  /**
   * Check if translations are loaded
   */
  isLoaded: boolean;
}

/**
 * Create the language context
 */
const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Get translations for a specific language
 */
function getTranslations(language: Language): TranslationNamespace {
  return language === 'es' ? esTranslations : enTranslations;
}

/**
 * Language provider props
 */
interface LanguageProviderProps {
  children: ReactNode;
  /**
   * Initial language (optional, defaults to Spanish)
   */
  initialLanguage?: Language;
}

/**
 * Language provider component
 * Manages language state and provides translations to child components
 *
 * @example
 * ```tsx
 * <LanguageProvider>
 *   <App />
 * </LanguageProvider>
 * ```
 */
export function LanguageProvider({
  children,
  initialLanguage = 'es',
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [translations, setTranslations] = useState<FlattenedTranslations>(() =>
    flattenTranslations(getTranslations(initialLanguage))
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language | null;
      if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
        setTranslations(flattenTranslations(getTranslations(savedLanguage)));
      }
      setIsLoaded(true);
    }
  }, []);

  /**
   * Change the current language
   */
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    setTranslations(flattenTranslations(getTranslations(newLanguage)));

    // Persist language preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage);
    }
  };

  /**
   * Get translations for a specific namespace
   */
  const getNamespace = (
    namespace: keyof TranslationNamespace
  ): Record<string, string> => {
    const allTranslations = getTranslations(language);
    return allTranslations[namespace] || {};
  };

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t: translations,
    getNamespace,
    isLoaded,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use language context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, language, setLanguage } = useLanguage();
 *
 *   return (
 *     <div>
 *       <h1>{t.heroTitle}</h1>
 *       <button onClick={() => setLanguage('en')}>
 *         Switch to English
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @throws Error if used outside of LanguageProvider
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}

/**
 * Higher-order component to inject language props
 *
 * @example
 * ```tsx
 * const MyComponent = withLanguage(({ t, language }) => (
 *   <div>{t.heroTitle}</div>
 * ));
 * ```
 */
export function withLanguage<P extends Record<string, any>>(
  Component: React.ComponentType<P & LanguageContextValue>
): React.ComponentType<P> {
  return function WithLanguageComponent(props: P) {
    const languageProps = useLanguage();
    return <Component {...props} {...languageProps} />;
  };
}

/**
 * Export types for external use
 */
export type {
  Language,
  FlattenedTranslations,
  TranslationNamespace,
} from './refactored-types';
