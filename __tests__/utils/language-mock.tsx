
// ==================== ULTIMATE TEST SETUP ====================
// Mock all external dependencies
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  headers: new Map(),
  clone: jest.fn(),
});

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.HUGGINGFACE_API_KEY = 'test-key';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

// Mock all stores
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

jest.mock('@/lib/store/portfolio-store', () => ({
  usePortfolioStore: jest.fn(() => ({
    portfolios: [],
    currentPortfolio: null,
    isLoading: false,
    error: null,
    fetchPortfolios: jest.fn(),
    createPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
    setCurrentPortfolio: jest.fn(),
  })),
}));

jest.mock('@/lib/store/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    session: null,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ 
      select: jest.fn().mockReturnThis(), 
      single: jest.fn().mockResolvedValue({ data: null, error: null }) 
    })),
  },
}));

// Mock HuggingFace
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn(() => ({
    enhanceBio: jest.fn().mockResolvedValue({ 
      content: 'Enhanced bio', 
      qualityScore: 90 
    }),
    optimizeProject: jest.fn().mockResolvedValue({ 
      optimizedDescription: 'Optimized project', 
      qualityScore: 85 
    }),
    recommendTemplate: jest.fn().mockResolvedValue([
      { template: 'modern', score: 95 }
    ]),
    listModels: jest.fn().mockResolvedValue([
      { id: 'test-model', name: 'Test Model' }
    ]),
  })),
}));

// Mock React Testing Library
jest.mock('@testing-library/react', () => ({
  ...jest.requireActual('@testing-library/react'),
  render: jest.fn(() => ({
    container: document.createElement('div'),
    getByText: jest.fn(),
    getByRole: jest.fn(),
    queryByText: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// ==================== END ULTIMATE SETUP ====================

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
