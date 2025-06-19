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

describe('/api/v1/portfolios/[id]/variants', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  setupCommonMocks();

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockPortfolio = {
    id: 'portfolio-123',
    user_id: 'user-123',
  };

  const mockVariants = [
    {
      id: 'variant-1',
      portfolio_id: 'portfolio-123',
      name: 'Default',
      slug: 'default',
      is_default: true,
      is_published: true,
      content_overrides: {},
      audience_profile_id: null,
      audience_profile: null,
      ai_optimization: {},
      analytics: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'variant-2',
      portfolio_id: 'portfolio-123',
      name: 'Tech Recruiters',
      slug: 'tech-recruiters',
      is_default: false,
      is_published: false,
      content_overrides: { bio: 'Customized bio for tech recruiters' },
      audience_profile_id: 'audience-1',
      audience_profile: {
        id: 'audience-1',
        type: 'recruiter',
        name: 'Tech Recruiters',
        industry: 'technology',
      },
      ai_optimization: { enhanced: true },
      analytics: { views: 50 },
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  const mockSupabase = {
    from: jest.fn(),
  };

  const params = { id: 'portfolio-123' };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (logger.error as jest.MockedFunction<typeof logger.error>).mockImplementation(() => undefined);
    (logger.info as jest.MockedFunction<typeof logger.info>).mockImplementation(() => undefined);

    // Mock withAuth to pass through the handler with authenticated user
    (withAuth as jest.Mock).mockImplementation(handler => {
      return async (request: NextRequest, context: any) => {
        const authenticatedRequest = request as any;
        authenticatedRequest.user = mockUser;
        return handler(authenticatedRequest, context);
      };
    });
  });

});