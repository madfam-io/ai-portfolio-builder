/**
 * @fileoverview TypeScript types for the i18n system
 * @module i18n/types
 */

/**
 * Supported languages in the application
 */
export type Language = 'es' | 'en';

/**
 * Language information with display details
 */
export interface LanguageInfo {
  code: Language;
  name: string;
  flag: string;
  isRTL?: boolean;
}

/**
 * Geolocation-based language detection result
 */
export interface LanguageDetectionResult {
  detectedLanguage: Language;
  detectedCountry?: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Translation namespace structure
 */
export interface TranslationNamespace {
  common: Record<string, string>;
  landing: Record<string, string>;
  auth: Record<string, string>;
  dashboard: Record<string, string>;
  editor: Record<string, string>;
  blog: Record<string, string>;
  careers: Record<string, string>;
  contact: Record<string, string>;
  legal: Record<string, string>;
  analytics: Record<string, string>;
  admin: Record<string, string>;
  errors: Record<string, string>;
}

/**
 * Complete translations for all languages
 */
type Translations = {
  [key in Language]: TranslationNamespace;
};

/**
 * Flattened translation object for easier access
 */
export type FlattenedTranslations = {
  [key: string]: string;
};

/**
 * Language context value
 */
interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: FlattenedTranslations;
  availableLanguages: LanguageInfo[];
  detectedCountry?: LanguageDetectionResult;
}

/**
 * Translation key path helper for TypeScript autocomplete
 * Usage: TranslationKey<'common.save'> or TranslationKey<'landing.heroTitle'>
 */
type TranslationKey<T extends string> =
  T extends `${infer Namespace}.${infer Key}`
    ? Namespace extends keyof TranslationNamespace
      ? Key extends keyof TranslationNamespace[Namespace]
        ? T
        : never
      : never
    : never;
