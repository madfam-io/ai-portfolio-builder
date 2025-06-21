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

import React, { ReactNode } from 'react';

import * as enTranslations from '@/lib/i18n/translations/en';
import * as esTranslations from '@/lib/i18n/translations/es';
import { flattenTranslations } from '@/lib/i18n/utils';

/**
 * Mock language provider for consistent testing
 * Forces Spanish as default language to match production behavior
 */

// Create mock context that always returns Spanish by default
const mockLanguageContext = {
  language: 'es' as const,
  setLanguage: jest.fn(),
  t: flattenTranslations(esTranslations),
  availableLanguages: [
    { code: 'es' as const, name: 'Español', flag: '🇲🇽' },
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  ],
  getNamespace: jest.fn((namespace: string) => {
    const translations = esTranslations as unknown;
    return translations[namespace] || {};
  }),
  isLoaded: true,
};

// Create a mock context
const MockLanguageContext = React.createContext(mockLanguageContext);

// Mock the language hook
export const mockUseLanguage = (language: 'es' | 'en' = 'es') => {
  const translations = language === 'es' ? esTranslations : enTranslations;
  return {
    language,
    setLanguage: jest.fn(),
    t: flattenTranslations(translations),
    availableLanguages: mockLanguageContext.availableLanguages,
    getNamespace: jest.fn((namespace: string) => {
      const trans = translations as unknown;
      return trans[namespace] || {};
    }),
    isLoaded: true,
  };
};

// Mock provider that forces Spanish unless explicitly set to English
export const MockLanguageProvider = ({
  children,
  initialLanguage = 'es',
}: {
  children: ReactNode;
  initialLanguage?: 'es' | 'en';
}): React.ReactElement => {
  const translations =
    initialLanguage === 'es' ? esTranslations : enTranslations;
  const contextValue: typeof mockLanguageContext = {
    language: initialLanguage as 'es',
    setLanguage: jest.fn(),
    t: flattenTranslations(translations),
    availableLanguages: mockLanguageContext.availableLanguages,
    getNamespace: jest.fn((namespace: string) => {
      const trans = translations as unknown;
      return trans[namespace] || {};
    }),
    isLoaded: true,
  };

  return (
    <MockLanguageContext.Provider value={contextValue}>
      {children}
    </MockLanguageContext.Provider>
  );
};

// Export a setup function to mock the language module
export function setupLanguageMocks() {
  // Mock the entire language module
  jest.mock('@/lib/i18n/minimal-context', () => ({
    useLanguage: () => mockUseLanguage('es'),
    LanguageProvider: MockLanguageProvider,
  }));

  jest.mock('@/lib/i18n/refactored-context', () => ({
    useLanguage: () => mockUseLanguage('es'),
    LanguageProvider: MockLanguageProvider,
    LanguageContext: React.createContext(mockLanguageContext),
  }));

  // Clear any saved language preference
  beforeEach(() => {
    localStorage.removeItem('language');
    // Set navigator.language to Spanish
    Object.defineProperty(navigator, 'language', {
      value: 'es-ES',
      writable: true,
      configurable: true,
    });
  });
}
