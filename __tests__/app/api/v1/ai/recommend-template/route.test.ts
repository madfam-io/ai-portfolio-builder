import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({

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

    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  })),
}));

jest.mock('@/lib/auth/middleware', () => ({
  authMiddleware: jest.fn((handler) => handler),
  requireAuth: jest.fn(() => ({ id: 'test-user' })),
}));

jest.mock('@/lib/cache/cache-headers', () => ({
  setCacheHeaders: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('AI Recommend Template API Route', () => {
  // Helper to setup mocks and import route
  const setupTest = async (mockOverrides: any = {}) => {
    jest.resetModules();
    jest.clearAllMocks();

    // Default mock for createClient
    const defaultSupabaseMock = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user_123', email: 'test@example.com' } },
          error: null,
        }),
      },
      rpc: jest.fn().mockResolvedValue({
        data: true,
        error: null,
      }),
    };

    // Apply any overrides
    const supabaseMock = mockOverrides.supabase || defaultSupabaseMock;

    jest.mock('@/lib/supabase/server', () => ({
      createClient: jest.fn().mockResolvedValue(supabaseMock),
    }));

    jest.mock('@/lib/ai/huggingface-service', () => ({
      HuggingFaceService: jest.fn().mockImplementation(() => ({
        healthCheck: jest
          .fn()
          .mockResolvedValue(mockOverrides.healthCheck ?? true),
        recommendTemplate: jest.fn().mockResolvedValue(
          mockOverrides.recommendTemplate || {
            recommendedTemplate: 'modern',
            confidence: 0.85,
            reasoning: 'Your profile aligns with this template.',
            alternatives: [
              { template: 'minimal', confidence: 0.1 },
              { template: 'creative', confidence: 0.05 },
            ],
          }
        ),
      })),
    }));

    jest.mock('@/lib/utils/logger', () => ({
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
    }));

    // Import the route after mocking
    const { POST } = await import('@/app/api/v1/ai/recommend-template/route');
    return { POST };
  };

  const createMockRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body),
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      url: 'https://example.com/api/v1/ai/recommend-template',
    } as any;
  };

});