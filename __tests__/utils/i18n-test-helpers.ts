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

/**
 * @fileoverview i18n test helpers for consistent language testing
 */

/**
 * Mock localStorage for language tests
 */
export const mockLocalStorage = (): void => {
  const store: Record<string, string> = {};

  const localStorageMock = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
};

/**
 * Setup i18n test environment with Spanish as default
 */
export const setupI18nTestEnvironment = (language: 'es' | 'en' = 'es') => {
  // Mock localStorage
  const localStorageMock = mockLocalStorage();

  // Set initial language
  if (language) {
    localStorageMock.setItem('language', language);
  }

  // Mock navigator.language
  Object.defineProperty(navigator, 'language', {
    value: language === 'es' ? 'es-ES' : 'en-US',
    writable: true,
    configurable: true,
  });

  return localStorageMock;
};

/**
 * Reset i18n test environment
 */
export const resetI18nTestEnvironment = (): void => {
  // Clear localStorage
  if (window.localStorage && typeof window.localStorage.clear === 'function') {
    window.localStorage.clear();
  }

  // Reset navigator.language to default
  Object.defineProperty(navigator, 'language', {
    value: 'en-US',
    writable: true,
    configurable: true,
  });
};
