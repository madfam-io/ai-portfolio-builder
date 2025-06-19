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

describe('/api/v1/public/[subdomain]', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  setupCommonMocks();

  let mockRequest: NextRequest;
  let mockSupabase: any;
  const mockPortfolio = {
    id: 'portfolio-123',
    userId: 'user-456',
    subdomain: 'johndoe',
    isPublished: true,
    publishedAt: '2025-06-01T00:00:00Z',
    title: 'John Doe - Senior Developer',
    personalInfo: {
      name: 'John Doe',
      title: 'Senior Software Developer',
      bio: 'Passionate developer with 10 years of experience',
      email: 'john@example.com',
      location: 'San Francisco, CA',
    },
    projects: [
      {
        id: 'proj-1',
        title: 'E-commerce Platform',
        description: 'Built scalable e-commerce solution',
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        link: 'https://example.com',
      },
    ],
    skills: [
      { name: 'JavaScript', level: 'expert' },
      { name: 'Python', level: 'advanced' },
    ],
    template: 'developer',
    theme: {
      primaryColor: '#3B82F6',
      fontFamily: 'Inter',
    },
    seo: {
      title: 'John Doe - Senior Software Developer Portfolio',
      description:
        'Portfolio of John Doe, a senior software developer specializing in web applications',
      keywords: ['developer', 'portfolio', 'software engineer'],
    },
    analytics: {
      views: 1500,
      lastViewed: '2025-06-15T00:00:00Z',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPortfolio,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }))
    };

    jest.mocked(createClient).mockReturnValue(mockSupabase);
  });

});