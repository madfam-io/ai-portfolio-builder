import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
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

describe('Portfolio Preview API Routes', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  setupCommonMocks();

  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabaseClient = {
      from: jest.fn()
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);

    // Mock logger
    (logger.error as jest.MockedFunction<typeof logger.error>).mockImplementation(() => undefined);

    // Mock template renderers
    (renderDeveloperTemplate as jest.Mock).mockReturnValue(
      '<div>Developer Template</div>'
    );

    (renderDesignerTemplate as jest.Mock).mockReturnValue(
      '<div>Designer Template</div>'
    );

    (renderConsultantTemplate as jest.Mock).mockReturnValue(
      '<div>Consultant Template</div>'
    );

    // Mock transformer
    (transformDbPortfolioToApi as jest.Mock).mockImplementation(db => ({
      ...db,
      transformed: true,
    }));
  });

});