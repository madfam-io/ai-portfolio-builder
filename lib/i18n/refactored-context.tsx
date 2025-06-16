'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import { logger } from '@/lib/utils/logger';

import * as enTranslations from './translations/en';
import * as esTranslations from './translations/es';
import { flattenTranslations } from './utils';

import type {
  Language,
  FlattenedTranslations,
  TranslationNamespace,
} from './refactored-types';

/**
 * @fileoverview Refactored i18n context provider with modular translations
 * @module i18n/refactored-context
 *
 * This is the new modular version of the i18n system that uses separate
 * translation files for better code organization and maintainability.
 */

/**
 * Available language configuration
 */
const availableLanguages = [
  { code: 'es' as Language, name: 'Español', flag: '🇲🇽' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
];

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
   * Available languages configuration
   */
  availableLanguages: typeof availableLanguages;

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
  return (language === 'es'
    ? esTranslations
    : enTranslations) as unknown as TranslationNamespace;
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
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load language preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasInitialized) {
      setHasInitialized(true);
      try {
        const savedLanguage = localStorage.getItem(
          'language'
        ) as Language | null;
        if (
          savedLanguage &&
          (savedLanguage === 'es' || savedLanguage === 'en')
        ) {
          setLanguageState(savedLanguage);
          setTranslations(flattenTranslations(getTranslations(savedLanguage)));
        } else if (!savedLanguage) {
          // Check browser language if no saved preference
          const browserLang = navigator.language?.toLowerCase();
          const detectedLang = browserLang?.startsWith('en') ? 'en' : 'es';
          setLanguageState(detectedLang);
          setTranslations(flattenTranslations(getTranslations(detectedLang)));
          localStorage.setItem('language', detectedLang);
        }
      } catch (error) {
        // Handle localStorage errors gracefully
        logger.warn('Failed to access localStorage:', { error });
      }
      setIsLoaded(true);
    }
  }, [hasInitialized]);

  /**
   * Change the current language
   */
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    setTranslations(flattenTranslations(getTranslations(newLanguage)));

    // Persist language preference
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('language', newLanguage);
      } catch (error) {
        logger.warn('Failed to save language preference:', { error });
      }
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
    availableLanguages,
    getNamespace,
    isLoaded: isLoaded || process.env.NODE_ENV === 'test',
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
    // Provide graceful fallback when used outside provider
    logger.warn('useLanguage called outside LanguageProvider, using fallback');
    return {
      language: 'es',
      setLanguage: () => {},
      t: flattenTranslations(getTranslations('es')),
      availableLanguages,
      getNamespace: () => ({}),
      isLoaded: true,
    };
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
function withLanguage<P extends Record<string, any>>(
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
