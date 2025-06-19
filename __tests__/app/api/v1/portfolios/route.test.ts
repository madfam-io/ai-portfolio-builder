/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import {
  setupCommonMocks,
  createMockRequest,
  defaultSupabaseMock,
} from '@/__tests__/utils/api-route-test-helpers';

// Helper to create portfolio query mock chain
const createPortfolioQueryMock = (data: any, error: any = null) => ({
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({ data, error }),
        }),
      }),
    }),
  }),
});

describe('Portfolios API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('GET /api/v1/portfolios', () => {
    it('should list user portfolios', async () => {
      const mockPortfolios = [
        {
          id: 'portfolio_1',
          user_id: 'user_123',
          name: 'My Portfolio',
          title: 'Software Developer',
          template: 'developer',
          status: 'published',
          created_at: new Date().toISOString(),
        },
        {
          id: 'portfolio_2',
          user_id: 'user_123',
          name: 'Secondary Portfolio',
          title: 'Freelancer',
          template: 'freelancer',
          status: 'draft',
          created_at: new Date().toISOString(),
        },
      ];

      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          ...createPortfolioQueryMock(mockPortfolios),
        },
      });

      const { GET } = await import('@/app/api/v1/portfolios/route');

      const request = createMockRequest(
        'https://example.com/api/v1/portfolios'
      );
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.portfolios).toHaveLength(2);
      expect(result.portfolios[0].name).toBe('My Portfolio');
    });

    it('should handle no portfolios', async () => {
      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          ...createPortfolioQueryMock([]),
        },
      });

      const { GET } = await import('@/app/api/v1/portfolios/route');

      const request = createMockRequest(
        'https://example.com/api/v1/portfolios'
      );
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.portfolios).toHaveLength(0);
    });

    it('should require authentication', async () => {
      // Clear all modules to ensure fresh imports
      jest.resetModules();

      // Mock auth middleware to simulate unauthenticated request
      jest.doMock('@/lib/api/middleware/auth', () => ({
        withAuth: jest.fn(_handler => (_request: any) => {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }),
        AuthenticatedRequest: jest.fn(),
      }));

      // Mock other dependencies to avoid module loading issues
      jest.doMock('@/lib/api/response-helpers', () => ({
        apiSuccess: jest.fn(),
        versionedApiHandler: jest.fn(handler => handler),
      }));

      // Don't call setupCommonMocks to avoid conflicts with auth mock

      const { GET } = await import('@/app/api/v1/portfolios/route');

      const request = createMockRequest(
        'https://example.com/api/v1/portfolios'
      );
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Authentication required');
    });
  });

  describe('POST /api/v1/portfolios', () => {
    it('should create a new portfolio', async () => {
      const newPortfolio = {
        name: 'Test Portfolio',
        title: 'Developer',
        template: 'developer' as const,
      };

      // Mock validation functions
      jest.doMock('@/lib/validation/portfolio', () => ({
        validateCreatePortfolio: jest.fn(() => ({
          isValid: true,
          errors: [],
          warnings: [],
        })),
        validatePortfolioQuery: jest.fn(() => ({ success: true, data: {} })),
        sanitizePortfolioData: jest.fn(data => data),
      }));

      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          rpc: jest.fn().mockResolvedValue({
            data: {
              can_create_portfolio: true,
              limits: { max_portfolios: 5 },
              current_usage: { portfolios: 2 },
            },
            error: null,
          }),
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              like: jest.fn().mockResolvedValue({
                data: [], // No existing portfolios with this subdomain
                error: null,
              }),
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'new_portfolio_id',
                    user_id: 'user_123',
                    name: 'Test Portfolio',
                    template: 'developer',
                    status: 'draft',
                    slug: 'test-portfolio',
                    subdomain: 'test-portfolio',
                    data: {
                      title: 'Developer',
                      bio: '',
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
          }),
        },
      });

      const { POST } = await import('@/app/api/v1/portfolios/route');

      const request = createMockRequest(
        'https://example.com/api/v1/portfolios',
        {
          method: 'POST',
          body: newPortfolio,
        }
      );
      const response = await POST(request);
      const result = await response.json();

      if (response.status !== 201) {
        console.log('Create portfolio response:', response.status, result);
      }
      expect(response.status).toBe(201);
      expect(result.portfolio).toBeDefined();
      expect(result.portfolio.name).toBe('Test Portfolio');
      expect(result.portfolio.id).toBe('new_portfolio_id');
    });

    it('should validate required fields', async () => {
      // Mock all required modules manually
      jest.doMock('@/lib/supabase/server', () => ({
        createClient: jest.fn().mockResolvedValue({
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user_123', email: 'test@example.com' } },
              error: null,
            }),
          },
          rpc: jest.fn().mockResolvedValue({
            data: {
              can_create_portfolio: true,
              limits: { max_portfolios: 5 },
              current_usage: { portfolios: 2 },
            },
            error: null,
          }),
        }),
      }));

      jest.doMock('@/lib/api/middleware/auth', () => ({
        withAuth: jest.fn((handler) => (request: any) => {
          request.user = { id: 'user_123', email: 'test@example.com' };
          return handler(request);
        }),
      }));

      jest.doMock('@/lib/validation/portfolio', () => ({
        validateCreatePortfolio: jest.fn(() => ({
          isValid: false,
          errors: [
            { field: 'name', message: 'Name is required', code: 'REQUIRED_FIELD' },
            { field: 'title', message: 'Title is required', code: 'REQUIRED_FIELD' },
          ],
          warnings: [],
        })),
        validatePortfolioQuery: jest.fn(() => ({ success: true, data: {} })),
        sanitizePortfolioData: jest.fn(data => data),
      }));

      jest.doMock('@/lib/api/response-helpers', () => ({
        apiSuccess: jest.fn((data) => new Response(JSON.stringify(data), { status: 200 })),
        versionedApiHandler: jest.fn(handler => handler),
      }));

      jest.doMock('@/lib/services/error', () => ({
        withErrorHandler: jest.fn(handler => async (...args) => {
          try {
            return await handler(...args);
          } catch (error) {
            if (error instanceof ValidationError) {
              return new Response(JSON.stringify({
                error: {
                  message: error.message,
                  code: 'VALIDATION_ERROR',
                  statusCode: 400
                }
              }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
            if (error instanceof ExternalServiceError) {
              return new Response(JSON.stringify({
                error: {
                  message: error.message,
                  code: 'EXTERNAL_SERVICE_ERROR',
                  statusCode: 503
                }
              }), { status: 503, headers: { 'Content-Type': 'application/json' } });
            }
            throw error;
          }
        }),
        ValidationError: class ValidationError extends Error {
          constructor(message, details) { 
            super(message);
            this.name = 'ValidationError';
            this.details = details;
          }
        },
        ConflictError: class ConflictError extends Error {
          constructor(message) { super(message); this.name = 'ConflictError'; }
        },
        ExternalServiceError: class ExternalServiceError extends Error {
          constructor(service, originalError) { 
            super(`External service error: ${service}`);
            this.name = 'ExternalServiceError';
            this.originalError = originalError;
          }
        },
        errorLogger: { logError: jest.fn() },
      }));
      
      // Make error classes available in scope
      const { ValidationError, ExternalServiceError } = await import('@/lib/services/error');

      const { POST } = await import('@/app/api/v1/portfolios/route');

      const request = createMockRequest(
        'https://example.com/api/v1/portfolios',
        {
          method: 'POST',
          body: {
            // Missing required fields: name and title
            template: 'developer' as const,
          },
        }
      );
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error.message).toContain('Invalid portfolio data');
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should enforce portfolio limit', async () => {
      // Mock validation to pass
      jest.doMock('@/lib/validation/portfolio', () => ({
        validateCreatePortfolio: jest.fn(() => ({
          isValid: true,
          errors: [],
          warnings: [],
        })),
        validatePortfolioQuery: jest.fn(() => ({ success: true, data: {} })),
        sanitizePortfolioData: jest.fn(data => data),
      }));

      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          rpc: jest.fn().mockResolvedValue({
            data: {
              can_create_portfolio: false,
              limits: { max_portfolios: 5 },
              current_usage: { portfolios: 5 },
            },
            error: null,
          }),
        },
      });

      const { POST } = await import('@/app/api/v1/portfolios/route');

      const request = createMockRequest(
        'https://example.com/api/v1/portfolios',
        {
          method: 'POST',
          body: {
            name: 'New Portfolio',
            title: 'Developer',
            bio: 'Bio',
            template: 'developer' as const,
          },
        }
      );
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error.message).toContain('Portfolio creation limit exceeded');
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      // Mock validation to pass
      jest.doMock('@/lib/validation/portfolio', () => ({
        validateCreatePortfolio: jest.fn(() => ({
          isValid: true,
          errors: [],
          warnings: [],
        })),
        validatePortfolioQuery: jest.fn(() => ({ success: true, data: {} })),
        sanitizePortfolioData: jest.fn(data => data),
      }));

      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          rpc: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        },
      });

      const { POST } = await import('@/app/api/v1/portfolios/route');

      const request = createMockRequest(
        'https://example.com/api/v1/portfolios',
        {
          method: 'POST',
          body: {
            name: 'New Portfolio',
            title: 'Developer',
            bio: 'Bio',
            template: 'developer' as const,
          },
        }
      );
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.error.message).toContain('External service error: Database');
      expect(result.error.code).toBe('EXTERNAL_SERVICE_ERROR');
    });
  });
});
