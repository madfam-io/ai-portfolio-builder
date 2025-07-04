/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import type {
  TranslationNamespace,
  FlattenedTranslations,
} from './refactored-types';

/**
 * @fileoverview Utility functions for the i18n system
 * @module i18n/utils
 */

/**
 * Flattens a nested translation object into a single-level object
 * for easier access in components.
 *
 * @example
 * ```typescript
 * const nested = {
 *   common: { save: 'Guardar', cancel: 'Cancelar' },
 *   landing: { heroTitle: 'Bienvenido' }
 * };
 *
 * const flat = flattenTranslations(nested);
 * // Result: { save: 'Guardar', cancel: 'Cancelar', heroTitle: 'Bienvenido' }
 * ```
 *
 * @param translations - Nested translation object organized by namespace
 * @returns Flattened object with all translations at the root level
 */
export function flattenTranslations(
  translations: TranslationNamespace
): FlattenedTranslations {
  const flattened: FlattenedTranslations = {};

  // Helper function to recursively flatten objects
  function flattenObject(obj: unknown, prefix = ''): void {
    if (!obj || typeof obj !== 'object') return;
    Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // Recursively flatten nested objects
        flattenObject(value, newKey);
      } else if (typeof value === 'string') {
        // Only add string values to flattened object
        flattened[newKey] = value;
      }
    });
  }

  // Iterate through each namespace
  Object.entries(translations).forEach(([, values]) => {
    // For each namespace, flatten its contents
    if (typeof values === 'object' && values !== null) {
      flattenObject(values);
    }
  });

  return flattened;
}

/**
 * Gets a translation value from a namespace path
 *
 * @example
 * ```typescript
 * const value = getTranslation(translations, 'common.save');
 * // Returns: 'Guardar'
 * ```
 *
 * @param translations - Translation namespace object
 * @param path - Dot-separated path to the translation (e.g., 'common.save')
 * @returns Translation value or the path if not found
 */
export function getTranslation(
  translations: TranslationNamespace,
  path: string
): string {
  const [namespace, key] = path.split('.');

  if (
    namespace &&
    key &&
    translations[namespace as keyof TranslationNamespace]
  ) {
    const namespaceTranslations =
      translations[namespace as keyof TranslationNamespace];
    return namespaceTranslations[key] || path;
  }

  return path;
}

/**
 * Validates that all required translation keys exist in both languages
 * Useful for development and testing
 *
 * @param esTranslations - Spanish translations
 * @param enTranslations - English translations
 * @returns Array of missing keys per language
 */
export function validateTranslations(
  esTranslations: TranslationNamespace,
  enTranslations: TranslationNamespace
): {
  missingInSpanish: string[];
  missingInEnglish: string[];
} {
  const missingInSpanish: string[] = [];
  const missingInEnglish: string[] = [];

  // Get all unique keys from both languages
  const allKeys = new Set<string>();

  // Collect all keys from Spanish
  Object.entries(esTranslations).forEach(([namespace, values]) => {
    Object.keys(values).forEach(key => {
      allKeys.add(`${namespace}.${key}`);
    });
  });

  // Collect all keys from English
  Object.entries(enTranslations).forEach(([namespace, values]) => {
    Object.keys(values).forEach(key => {
      allKeys.add(`${namespace}.${key}`);
    });
  });

  // Check each key exists in both languages
  allKeys.forEach(path => {
    const [namespace, key] = path.split('.');

    if (!namespace || !key) return;

    // Check Spanish
    if (!esTranslations[namespace as keyof TranslationNamespace]?.[key]) {
      missingInSpanish.push(path);
    }

    // Check English
    if (!enTranslations[namespace as keyof TranslationNamespace]?.[key]) {
      missingInEnglish.push(path);
    }
  });

  return { missingInSpanish, missingInEnglish };
}

/**
 * Formats a number according to the current language locale
 *
 * @param value - Number to format
 * @param language - Current language code
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  language: string,
  options?: Intl.NumberFormatOptions
): string {
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Formats a date according to the current language locale
 *
 * @param date - Date to format
 * @param language - Current language code
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  language: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Gets the appropriate currency symbol for the current language
 *
 * @param language - Current language code
 * @returns Currency symbol
 */
export function getCurrencySymbol(language: string): string {
  return language === 'es' ? '$' : '$';
}

/**
 * Gets the appropriate currency code for the current language
 *
 * @param language - Current language code
 * @returns Currency code (MXN for Spanish, USD for English)
 */
export function getCurrencyCode(language: string): 'MXN' | 'USD' {
  return language === 'es' ? 'MXN' : 'USD';
}
