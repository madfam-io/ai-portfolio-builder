
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


// Mock Supabase client
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
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
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: null }) })),
  },
}));

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import {   setupCommonMocks,
    const { GET } = await import('@/app/auth/callback/route');
/**
 * @jest-environment node
 */

  defaultSupabaseMock,
 } from '@/__tests__/utils/api-route-test-helpers';

describe('Auth Callback Route', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.clearAllMocks();
  });

  it('should handle successful OAuth callback', async () => {
    setupCommonMocks({
      supabase: {
        ...defaultSupabaseMock,
        auth: {
          ...defaultSupabaseMock.auth,
          exchangeCodeForSession: jest.fn().mockResolvedValue({
            data: {
              session: {
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: { id: 'user_123', email: 'test@example.com' },
              },
            },
            error: null,
          }),
        },
      },
    });

    const request = new NextRequest(
      'https://example.com/auth/callback?code=test_code'
    );
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('/dashboard');
  });

  it('should handle missing code parameter', async () => {
    setupCommonMocks();

    const request = new NextRequest('https://example.com/auth/callback');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('/auth/login?error=');
  });

  it('should handle OAuth errors from provider', async () => {
    setupCommonMocks();

    const request = new NextRequest(
      'https://example.com/auth/callback?error=access_denied&error_description=User+denied+access'
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('/auth/login');
  });

  it('should handle exchange code failure', async () => {
    setupCommonMocks({
      supabase: {
        ...defaultSupabaseMock,
        auth: {
          ...defaultSupabaseMock.auth,
          exchangeCodeForSession: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid authorization code' },
          }),
        },
      },
    });

    const request = new NextRequest(
      'https://example.com/auth/callback?code=invalid_code'
    );
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('/auth/login?error=');
  });

  it('should handle onboarding redirect for new users', async () => {
    setupCommonMocks({
      supabase: {
        ...defaultSupabaseMock,
        auth: {
          ...defaultSupabaseMock.auth,
          exchangeCodeForSession: jest.fn().mockResolvedValue({
            data: {
              session: {
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: { id: 'user_123', email: 'test@example.com' },
              },
            },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'user_123', onboarding_completed: false },
                error: null,
              }),
            }),
          }),
        }),
      },
    });

    const request = new NextRequest(
      'https://example.com/auth/callback?code=test_code'
    );
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('/dashboard');
  });

  it('should handle database connection failure', async () => {
    setupCommonMocks({
      supabase: null,
    });

    const request = new NextRequest(
      'https://example.com/auth/callback?code=test_code'
    );
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('/auth/login?error=');
  });

  it('should preserve next parameter through callback', async () => {
    setupCommonMocks({
      supabase: {
        ...defaultSupabaseMock,
        auth: {
          ...defaultSupabaseMock.auth,
          exchangeCodeForSession: jest.fn().mockResolvedValue({
            data: {
              session: {
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: { id: 'user_123', email: 'test@example.com' },
              },
            },
            error: null,
          }),
        },
      },
    });

    const request = new NextRequest(
      'https://example.com/auth/callback?code=test_code&next=/editor/new'
    );
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('/editor/new');
  });
});
