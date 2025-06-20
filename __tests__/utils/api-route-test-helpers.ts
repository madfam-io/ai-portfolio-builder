/**
 * Common test utilities and mock helpers for API route tests
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
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

export const defaultSupabaseMock = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'user_123', email: 'test@example.com' } },
      error: null,
    }),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  update: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  containedBy: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
};

export const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

export const setupCommonMocks = (mockOverrides: any = {}) => {
  // Reset modules to ensure clean state
  jest.resetModules();

  const supabaseMock = mockOverrides.supabase || defaultSupabaseMock;

  // Mock Supabase
  jest.doMock('@/lib/supabase/server', () => ({
    createClient: jest.fn().mockResolvedValue(supabaseMock),
  }));

  // Mock logger
  jest.doMock('@/lib/utils/logger', () => ({
    logger: mockLogger,
  }));

  // Mock API error handler functions
  jest.doMock('@/lib/services/error/api-error-handler', () => ({
    handleApiError: jest.fn((error, _context) => ({
      error: error.message || 'An error occurred',
      code: error.code || 'UNKNOWN_ERROR',
      statusCode: error.statusCode || 500,
    })),
    createApiHandler: jest.fn(handler => handler),
    validateMethod: jest.fn(() => true),
    parseJsonBody: jest.fn(request => request.json()),
    ApiError: class ApiError extends Error {
      constructor(message: string, statusCode: number, code?: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
      }
      statusCode: number;
      code?: string;
    },
  }));

  // Mock error types
  jest.doMock('@/types/errors', () => ({
    ValidationError: class ValidationError extends Error {
      constructor(message: string, details?: Record<string, unknown>) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
      }
    },
    ExternalServiceError: class ExternalServiceError extends Error {
      constructor(service: string, originalError?: unknown) {
        super(`External service error: ${service}`);
        this.name = 'ExternalServiceError';
        this.originalError = originalError;
      }
    },
    ConflictError: class ConflictError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'ConflictError';
      }
    },
    AppError: class AppError extends Error {
      constructor(
        message: string,
        code: string,
        statusCode: number = 500,
        details?: Record<string, unknown>
      ) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
      }
    },
    isAppError: jest.fn(error => error instanceof Error && 'code' in error),
    getErrorMessage: jest.fn(error =>
      error instanceof Error ? error.message : 'Unknown error'
    ),
    getErrorCode: jest.fn(error =>
      error instanceof Error && 'code' in error ? error.code : 'UNKNOWN_ERROR'
    ),
  }));

  // Mock lib/services/error index
  jest.doMock('@/lib/services/error', () => ({
    ValidationError: class ValidationError extends Error {
      constructor(message: string, details?: Record<string, unknown>) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
      }
    },
    ExternalServiceError: class ExternalServiceError extends Error {
      constructor(service: string, originalError?: unknown) {
        super(`External service error: ${service}`);
        this.name = 'ExternalServiceError';
        this.originalError = originalError;
      }
    },
    ConflictError: class ConflictError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'ConflictError';
      }
    },
    withErrorHandler: jest.fn(handler => async (...args) => {
      try {
        return await handler(...args);
      } catch (error) {
        if (error.name === 'ValidationError') {
          return new Response(
            JSON.stringify({
              error: {
                message: error.message,
                code: 'VALIDATION_ERROR',
                statusCode: 400,
              },
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (error.name === 'ExternalServiceError') {
          return new Response(
            JSON.stringify({
              error: {
                message: error.message,
                code: 'EXTERNAL_SERVICE_ERROR',
                statusCode: 503,
              },
            }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({
            error: {
              message: error.message || 'Internal server error',
              code: 'INTERNAL_SERVER_ERROR',
              statusCode: 500,
            },
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }),
    errorLogger: { logError: jest.fn() },
  }));

  // Mock auth middleware
  jest.doMock('@/lib/api/middleware/auth', () => ({
    withAuth: jest.fn(handler => (request: any) => {
      // Add user to request object
      request.user = {
        id: 'user_123',
        email: 'test@example.com',
      };
      return handler(request);
    }),
    authenticateUser: jest.fn().mockResolvedValue({
      id: 'user_123',
      email: 'test@example.com',
    }),
    requireAuth: jest.fn(handler => (request: any) => {
      // Add user to request object
      request.user = {
        id: 'user_123',
        email: 'test@example.com',
      };
      return handler(request);
    }),
  }));

  // Mock rate limit middleware
  jest.doMock('@/lib/api/middleware/rate-limit', () => ({
    withRateLimit: jest.fn(handler => handler),
    rateLimiter: jest.fn(() => true),
  }));

  // Mock auth functions
  jest.doMock('@/lib/auth/auth', () => ({
    authenticateUser: jest.fn().mockResolvedValue({
      id: 'user_123',
      email: 'test@example.com',
    }),
    exchangeCodeForSession: jest.fn().mockResolvedValue({
      access_token: 'mock_token',
      refresh_token: 'mock_refresh',
    }),
    createSessionFromTokens: jest.fn().mockResolvedValue({
      user: { id: 'user_123', email: 'test@example.com' },
    }),
  }));

  // Mock auth session functions (commented out - module doesn't exist)
  // jest.doMock('@/lib/auth/session', () => ({
  //   getUserSession: jest.fn().mockResolvedValue({
  //     user: { id: 'user_123', email: 'test@example.com' },
  //   }),
  //   createSession: jest.fn(),
  //   destroySession: jest.fn(),
  // }));

  // Mock Redis
  jest.doMock('@/lib/cache/redis-cache.server', () => ({
    redisCache: {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
      keys: jest.fn(),
      flushall: jest.fn(),
    },
  }));

  // Mock PostHog
  jest.doMock('@/lib/analytics/posthog/server', () => ({
    trackEvent: jest.fn(),
    identifyUser: jest.fn(),
    captureException: jest.fn(),
  }));

  // Mock response helpers
  jest.doMock('@/lib/api/response-helpers', () => ({
    apiSuccess: jest.fn((data, options = {}) => {
      return new Response(JSON.stringify(data), {
        status: options.status || 200,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    }),
    apiError: jest.fn((message, status = 500) => {
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
    versionedApiHandler: jest.fn(handler => handler),
  }));

  // Mock HuggingFace
  jest.doMock('@huggingface/inference', () => ({
    HfInference: jest.fn().mockImplementation(() => ({
      textGeneration: jest.fn().mockResolvedValue({
        generated_text: 'Mock generated text',
      }),
    })),
  }));

  // Mock error logger
  jest.doMock('@/lib/services/error/error-logger', () => ({
    errorLogger: {
      logError: jest.fn(),
      logWarning: jest.fn(),
      logInfo: jest.fn(),
    },
  }));

  // Mock analytics service
  jest.doMock('@/lib/services/analyticsService', () => ({
    AnalyticsService: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      getDashboardData: jest.fn().mockResolvedValue({
        repositories: [],
        totalAnalyses: 0,
        totalRepositories: 0,
        recentAnalyses: [],
        codeQualityTrends: [],
      }),
      track: jest.fn(),
      identify: jest.fn(),
      page: jest.fn(),
    })),
    analyticsService: {
      track: jest.fn(),
      identify: jest.fn(),
      page: jest.fn(),
    },
  }));

  // Mock GitHub client (commented out - module doesn't exist)
  // jest.doMock('@/lib/integrations/github/client.lazy', () => ({
  //   GitHubClient: jest.fn().mockImplementation(() => ({
  //     getUser: jest.fn(),
  //     getRepos: jest.fn(),
  //     getRepo: jest.fn(),
  //   })),
  // }));

  // Mock dashboard components
  // jest.doMock('@/components/dashboard/billing-dashboard', () => ({

  // BillingDashboard: jest.fn(() => null),

  // }));

  // Mock auth services
  jest.doMock('@/lib/services/auth/auth-service', () => ({
    authService: {
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
  }));

  jest.doMock('@/lib/services/auth/mfa-service', () => ({
    mfaService: {
      setupMFA: jest.fn(),
      verifyMFA: jest.fn(),
      disableMFA: jest.fn(),
    },
  }));

  // Mock portfolio service
  jest.doMock('@/lib/services/portfolio/portfolio-service', () => ({
    portfolioService: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
      getPortfolio: jest.fn(),
      publishPortfolio: jest.fn(),
      unpublishPortfolio: jest.fn(),
      getUserPortfolios: jest.fn(),
      createPortfolio: jest.fn(),
      updatePortfolio: jest.fn(),
      deletePortfolio: jest.fn(),
      getPortfolioBySubdomain: jest.fn(),
      getPortfolioAnalytics: jest.fn(),
    },
  }));

  // Mock createSupabaseClient (old import)
  jest.doMock('@/lib/supabase/server', () => ({
    createClient: jest.fn().mockResolvedValue(supabaseMock),
    createSupabaseClient: jest.fn().mockResolvedValue(supabaseMock), // For legacy imports
  }));
};

export const createMockRequest = (
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  } = {}
): any => {
  const request = new Request(url, {
    method: options.method || 'GET',
    headers: options.headers || { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Add json method - the body should be returned as-is since it's already the parsed object
  (request as any).json = jest.fn().mockResolvedValue(options.body || {});

  // Add NextRequest specific properties
  const nextRequest = request as any;
  nextRequest.nextUrl = new URL(url);
  if (options.params) {
    nextRequest.params = options.params;
  }

  return nextRequest;
};
