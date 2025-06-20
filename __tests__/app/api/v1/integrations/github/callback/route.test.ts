import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';

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
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));
jest.mock('@/lib/auth/supabase-client', () => ({ 
  createClient: jest.fn(() => mockSupabaseClient),
  supabase: mockSupabaseClient,
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


// Mock Supabase



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




// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  status: 200,
});

describe('/api/v1/integrations/github/callback', () => {
  beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  let mockRequest: NextRequest;
  const GITHUB_CLIENT_ID = 'test-client-id';
  const GITHUB_CLIENT_SECRET = 'test-client-secret';

  beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
    const originalEnv = process.env;
    process.env = { ...originalEnv };

    jest.clearAllMocks();
    process.env.GITHUB_CLIENT_ID = GITHUB_CLIENT_ID;
    process.env.GITHUB_CLIENT_SECRET = GITHUB_CLIENT_SECRET;

    // Mock successful token exchange
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => ({
        access_token: 'gho_testtoken123',
        token_type: 'bearer',
        scope: 'repo,read:user',
      }),
    });
  });

  afterEach(() => {
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
  });

});