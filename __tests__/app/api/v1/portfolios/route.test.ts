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

      // Add debug logging for validation
      jest.doMock('@/lib/services/portfolio/validation', () => ({
        validateCreatePortfolio: jest.fn(data => {
          console.log('Validation input:', data);
          const result = {
            isValid: true,
            errors: [],
            warnings: [],
          };
          console.log('Validation result:', result);
          return result;
        }),
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
        },
      });

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
      expect(result.error).toContain('Invalid portfolio data');
    });

    it('should enforce portfolio limit', async () => {
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
      expect(result.error).toContain('Portfolio creation limit exceeded');
    });

    it('should handle database errors', async () => {
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

      expect(response.status).toBe(500);
      expect(result.error).toContain('Internal server error');
    });
  });
});
