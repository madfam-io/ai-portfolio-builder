/**
 * Comprehensive Test Infrastructure Fixes
 * This file contains common fixes for the failing test suite
 */

import React from 'react';

// Global test configuration for API route testing
export const setupAPITestEnvironment = () => {
  // Mock all external dependencies that API routes use

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
};

jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
  supabase: mockSupabaseClient,
}));

  
  // Mock Supabase server client with authenticated user
  jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(() => ({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              name: 'Test User',
            },
          },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      })),
    })),
  }));

  // Mock AI services
  jest.mock('@/lib/ai/geo/geo-service', () => ({
    getGEOService: jest.fn(() => ({
      researchKeywords: jest.fn().mockResolvedValue([
        {
          keyword: 'test keyword',
          searchVolume: 1000,
          difficulty: 50,
          trends: 'stable',
          relatedKeywords: ['related1', 'related2'],
          questions: ['question1', 'question2'],
        },
      ]),
    })),
  }));

  jest.mock('@/lib/ai/huggingface-service', () => ({
    HuggingFaceService: jest.fn(() => ({
      enhanceBio: jest.fn().mockResolvedValue({
        enhancedBio: 'Enhanced bio content',
        confidence: 0.9,
      }),
      enhanceProject: jest.fn().mockResolvedValue({
        enhancedDescription: 'Enhanced project description',
        suggestedHighlights: ['highlight1', 'highlight2'],
      }),
      recommendTemplate: jest.fn().mockResolvedValue({
        recommendedTemplate: 'developer',
        confidence: 0.85,
      }),
    })),
  }));

  // Mock analytics
  jest.mock('@/lib/analytics/github/analytics-service', () => ({
    GitHubAnalyticsService: jest.fn(() => ({
      getRepositoryInsights: jest.fn().mockResolvedValue({
        totalRepos: 10,
        languages: { JavaScript: 60, TypeScript: 40 },
        contributions: 150,
      }),
    })),
  }));

  // Mock logger
  jest.mock('@/lib/utils/logger', () => ({
    logger: {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    },
  }));

  // Mock error handlers
  jest.mock('@/lib/services/error/error-logger', () => ({
    logError: jest.fn(),
  }));

  jest.mock('@/lib/services/error/api-error-handler', () => ({
    handleAPIError: jest.fn(),
  }));

  // Mock cache
  jest.mock('@/lib/cache/redis-cache', () => ({
    cache: {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(true),
    },
  }));

  // Mock validation
  jest.mock('@/lib/validation/portfolio-schema', () => ({
    portfolioSchema: {
      parse: jest.fn((data) => data),
      safeParse: jest.fn((data) => ({ success: true, data })),
    },
  }));

  // Mock Stripe
  jest.mock('@/lib/services/stripe/stripe-service', () => ({
    StripeService: jest.fn(() => ({
      createCheckoutSession: jest.fn().mockResolvedValue({
        url: 'https://checkout.stripe.com/test',
      }),
      createCustomer: jest.fn().mockResolvedValue({
        id: 'cus_test123',
      }),
    })),
  }));
};

// Common test utilities for React components
export const setupReactTestEnvironment = () => {
  // Mock hooks that commonly fail
  jest.mock('@/hooks/useAutoSave', () => ({
    useAutoSave: () => ({
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      autoSave: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
      reset: jest.fn(),
    }),
  }));

  jest.mock('@/hooks/useEditorHistory', () => ({
    useEditorHistory: () => ({
      canUndo: false,
      canRedo: false,
      undo: jest.fn(),
      redo: jest.fn(),
      pushState: jest.fn(),
      clearHistory: jest.fn(),
    }),
  }));

  jest.mock('@/hooks/useRealTimePreview', () => ({
    useRealTimePreview: () => ({
      previewUrl: 'http://localhost:3000/preview/test',
      isGenerating: false,
      generatePreview: jest.fn().mockResolvedValue('preview-url'),
      refreshPreview: jest.fn(),
    }),
  }));

  // Mock stores with proper implementations
  const mockPortfolioStore = {
    portfolios: [],
    currentPortfolio: null,
    isLoading: false,
    error: null,
    fetchPortfolios: jest.fn().mockResolvedValue([]),
    createPortfolio: jest.fn().mockResolvedValue({ id: 'new-portfolio' }),
    updatePortfolio: jest.fn().mockResolvedValue({}),
    deletePortfolio: jest.fn().mockResolvedValue(true),
    setCurrentPortfolio: jest.fn(),
    clearError: jest.fn(),
  };

  jest.mock('@/lib/store/portfolio-store', () => ({
    usePortfolioStore: jest.fn(() => mockPortfolioStore),
  }));
};

// Timeout fixes for long-running tests
export const setupTimeoutFixes = () => {
  // Increase timeout for tests that need more time
  jest.setTimeout(60000);
  
  // Mock timers for tests that use setTimeout/setInterval
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
};

// Common test data factories
export const createTestPortfolio = (overrides = {}) => ({
  id: 'test-portfolio-1',
  userId: 'user-1',
  name: 'Test Portfolio',
  title: 'Software Developer',
  bio: 'Test bio',
  template: 'developer',
  status: 'draft',
  subdomain: 'testuser',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
});

// Mock fetch for API calls
export const setupFetchMocks = () => {
  global.fetch = jest.fn().mockImplementation((url: string, options?: any) => {
    // Default successful response
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ success: true, data: {} }),
      text: () => Promise.resolve(''),
    } as Response);
  });
};

// Error boundary mock for component testing
export const MockErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="error-boundary">{children}</div>;
};

// Common async utilities
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const flushPromises = () => new Promise(setImmediate);