
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

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';

/**
 * Mock implementation of useLanguage hook for testing
 * Provides a consistent way to mock i18n functionality across all tests
 */
export const createMockUseLanguage = () => {
  const mockT = {
    // Common translations used across tests
    success: 'Success',
    error: 'Error',
    loading: 'Loading',
    saved: 'Saved',
    changesSaved: 'Your changes have been saved',
    portfolioSaved: 'Portfolio saved successfully',
    failedToSave: 'Failed to save portfolio',

    // Dashboard translations
    dashboardTitle: 'Dashboard',
    billingTitle: 'Billing',
    portfolios: 'Portfolios',
    analytics: 'Analytics',
    settings: 'Settings',

    // Editor translations
    editorTitle: 'Portfolio Editor',
    preview: 'Preview',
    publish: 'Publish',
    save: 'Save',
    saving: 'Saving...',

    // Landing page translations
    hero: {
      title: 'Build Your Portfolio',
      subtitle: 'Create a professional portfolio in minutes',
    },
    features: {
      title: 'Features',
      subtitle: 'Everything you need to showcase your work',
    },
    pricing: {
      title: 'Pricing',
      subtitle: 'Choose the plan that works for you',
    },
    cta: {
      title: 'Ready to get started?',
      subtitle: 'Join thousands of professionals',
    },

    // Billing translations
    billing: {
      title: 'Billing Dashboard',
      currentPlan: 'Current Plan',
      usage: 'Usage',
      upgrade: 'Upgrade',
      manageBilling: 'Manage Billing',
      aiCredits: 'AI Credits',
    },

    // Add any other translations as needed
  };

  const mockLanguage = 'en';
  const mockSetLanguage = jest.fn();
  const mockIsLoading = false;

  const mockUseLanguage = jest.fn(() => ({
    t: mockT,
    language: mockLanguage,
    setLanguage: mockSetLanguage,
    isLoading: mockIsLoading,
  }));

  return {
    mockUseLanguage,
    mockT,
    mockLanguage,
    mockSetLanguage,
    mockIsLoading,
  };
};

/**
 * Creates a properly typed mock for useLanguage that works with Jest
 */
export const setupUseLanguageMock = () => {
  const { mockT, mockLanguage, mockSetLanguage, mockIsLoading } =
    createMockUseLanguage();

  // Create the base mock return value
  const mockReturnValue = {
    t: mockT,
    language: mockLanguage,
    setLanguage: mockSetLanguage,
    isLoading: mockIsLoading,
  };

  // Create a mock function with all Jest methods
  const mockUseLanguage = Object.assign(
    jest.fn(() => mockReturnValue),
    {
      mockReturnValue: jest.fn((value: any) => {
        mockUseLanguage.mockImplementation(() => value);
        return mockUseLanguage;
      }),
      mockImplementation: jest.fn((fn: any) => {
        Object.setPrototypeOf(mockUseLanguage, jest.fn(fn));
        return mockUseLanguage;
      }),
      mockClear: jest.fn(() => {
        jest.clearAllMocks();
        return mockUseLanguage;
      }),
      mockReset: jest.fn(() => {
        jest.resetAllMocks();
        return mockUseLanguage;
      }),
      mockResolvedValue: jest.fn(),
      mockRejectedValue: jest.fn(),
      mockReturnValueOnce: jest.fn(),
      mockResolvedValueOnce: jest.fn(),
      mockRejectedValueOnce: jest.fn(),
      mockImplementationOnce: jest.fn(),
    }
  ) as MockedFunction<any>;

  return {
    mockUseLanguage,
    mockT,
    mockLanguage,
    mockSetLanguage,
    mockIsLoading,
    mockReturnValue,
  };
};
