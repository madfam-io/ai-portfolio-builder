
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
import { render as rtlRender, RenderOptions } from '@testing-library/react';

import { LanguageProvider } from '@/lib/i18n/refactored-context';
import { AppProvider } from '@/lib/contexts/AppContext';

/**
 * i18n test utilities for consistent testing environment
 */

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
    featuresTitle: 'Qué hace PRISMA',
    standOut: 'Destacar',
    featuresSubtitle:
      'Hecho para profesionales que saben que su presencia digital importa.',
    aiContentTitle: 'IA que entiende tu perfil',
    aiContentDesc:
      'Reescribe tu biografía y tus proyectos con claridad y persuasión.',
    oneClickTitle: 'Conexión inteligente',
    oneClickDesc: 'Sincroniza automáticamente tu LinkedIn y GitHub.',
    customizationTitle: 'Diseño personalizable',
    customizationDesc: 'Elige entre diseños únicos que reflejan tu estilo.',
    publishingTitle: 'Hosting instantáneo',
    publishingDesc: 'Tu sitio web en vivo con tu propio dominio.',
    analyticsTitle: 'Analítica profesional',
    analyticsDesc: 'Insights que muestran el impacto de tu portafolio.',
    securityTitle: 'Máxima seguridad',
    securityDesc: 'Tus datos protegidos con encriptación de nivel empresarial.',
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
    featuresTitle: 'What PRISMA does',
    standOut: 'Stand Out',
    featuresSubtitle:
      'Built for professionals who know their digital presence matters.',
    aiContentTitle: 'AI that understands your profile',
    aiContentDesc:
      'Rewrites your bio and projects with clarity and persuasion.',
    oneClickTitle: 'Smart connection',
    oneClickDesc: 'Automatically syncs your LinkedIn and GitHub.',
    customizationTitle: 'Customizable design',
    customizationDesc: 'Choose from unique designs that reflect your style.',
    publishingTitle: 'Instant hosting',
    publishingDesc: 'Your website live with your own domain.',
    analyticsTitle: 'Professional analytics',
    analyticsDesc: 'Insights that show the impact of your portfolio.',
    securityTitle: 'Maximum security',
    securityDesc: 'Your data protected with enterprise-level encryption.',
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
