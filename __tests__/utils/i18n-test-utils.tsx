/**
 * i18n test utilities for consistent testing environment
 */

import React, { ReactNode } from 'react';

import { LanguageProvider } from '@/lib/i18n/refactored-context';

interface TestLanguageProviderProps {
  children: ReactNode;
  initialLanguage?: 'es' | 'en';
}

/**
 * Mock AppProvider for tests
 */
const mockAppContextValue = {
  isDarkMode: false,
  toggleDarkMode: jest.fn(),
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: jest.fn(),
  currency: 'MXN' as const,
  setCurrency: jest.fn(),
};

// Mock AppContext
jest.mock('@/lib/contexts/AppContext', () => ({
  useApp: () => mockAppContextValue,
  useAppContext: () => mockAppContextValue,
  AppProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

/**
 * Test wrapper for components that use i18n
 * Ensures consistent language context in tests
 */
export function TestLanguageProvider({
  children,
  initialLanguage = 'es',
}: TestLanguageProviderProps) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      {children}
    </LanguageProvider>
  );
}

/**
 * Custom render function that includes LanguageProvider
 */
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { AppProvider } from '@/lib/contexts/AppContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialLanguage?: 'es' | 'en';
}

export function renderWithLanguage(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  const { initialLanguage = 'es', ...renderOptions } = options || {};

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AppProvider>
        <TestLanguageProvider initialLanguage={initialLanguage}>
          {children}
        </TestLanguageProvider>
      </AppProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock translations for testing
 * These should match the structure of actual translations
 */
export const mockTranslations = {
  es: {
    // Landing translations
    heroTitle: 'Tu portafolio, elevado por IA.',
    features: 'Características',
    whatPrismaDoes: 'Qué hace PRISMA',
    pricing: 'Precios',
    getStartedToday: 'Accede hoy.',

    // Editor translations
    editorLoading: 'Cargando...',
    editorTitle: 'Editor de Portafolio',
    editorName: 'Nombre',
    editorBio: 'Biografía',
    editorPublish: 'Publicar',
    editorUnpublish: 'Despublicar',
    editorSave: 'Guardar',
    editorSaving: 'Guardando...',
    editorPublished: 'Publicado',
    editorDraft: 'Borrador',
    editorSelectTemplate: 'Seleccionar plantilla',
    editorLastSaved: 'Último guardado',

    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
  },
  en: {
    // Landing translations
    heroTitle: 'Your portfolio, elevated by AI.',
    features: 'Features',
    whatPrismaDoes: 'What PRISMA Does',
    pricing: 'Pricing',
    getStartedToday: 'Get started today.',

    // Editor translations
    editorLoading: 'Loading...',
    editorTitle: 'Portfolio Editor',
    editorName: 'Name',
    editorBio: 'Bio',
    editorPublish: 'Publish',
    editorUnpublish: 'Unpublish',
    editorSave: 'Save',
    editorSaving: 'Saving...',
    editorPublished: 'Published',
    editorDraft: 'Draft',
    editorSelectTemplate: 'Select Template',
    editorLastSaved: 'Last saved',

    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
};

/**
 * Mock useLanguage hook for isolated component testing
 */
export function createMockUseLanguage(language: 'es' | 'en' = 'es') {
  return {
    language,
    setLanguage: jest.fn(),
    t: mockTranslations[language],
    availableLanguages: [
      { code: 'es', name: 'Español', flag: '🇲🇽' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
    ],
    getNamespace: jest.fn(() => ({})),
    isLoaded: true,
  };
}
