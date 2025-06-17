/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/portfolios/route';
import { createSupabaseClient } from '@/lib/supabase/server';
import { getUserSession } from '@/lib/auth/session';
import { withAuth } from '@/lib/api/middleware/auth';
import { withRateLimit } from '@/lib/api/middleware/rate-limit';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/auth/session');
jest.mock('@/lib/api/middleware/auth');
jest.mock('@/lib/api/middleware/rate-limit');
jest.mock('@/lib/utils/logger');

const mockCreateSupabaseClient = jest.mocked(createSupabaseClient);
const mockGetUserSession = jest.mocked(getUserSession);
const mockWithAuth = jest.mocked(withAuth);
const mockWithRateLimit = jest.mocked(withRateLimit);
const mockLogger = jest.mocked(logger);

describe('Portfolios API Route', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Supabase mock
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      count: jest.fn().mockReturnThis(),
    };

    mockCreateSupabaseClient.mockResolvedValue(mockSupabase);

    // Mock auth middleware to pass through
    mockWithAuth.mockImplementation(handler => handler);
    mockWithRateLimit.mockImplementation(handler => handler);

    // Mock logger
    mockLogger.info = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.warn = jest.fn();
  });

  const createMockRequest = (
    method: string,
    url: string,
    body?: any
  ): NextRequest => {
    const request = new NextRequest(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Mock JSON method
    if (body) {
      request.json = jest.fn().mockResolvedValue(body);
    }

    return request;
  };

  describe('GET /api/v1/portfolios', () => {
    const mockUserId = 'user_123';
    const mockSession = {
      user: { id: mockUserId, email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetUserSession.mockResolvedValue(mockSession);
    });

    it('should list user portfolios', async () => {
      const mockPortfolios = [
        {
          id: 'portfolio_1',
          title: 'Portfolio 1',
          slug: 'portfolio-1',
          is_published: true,
          created_at: '2024-01-01T00:00:00Z',
          view_count: 100,
        },
        {
          id: 'portfolio_2',
          title: 'Portfolio 2',
          slug: 'portfolio-2',
          is_published: false,
          created_at: '2024-01-02T00:00:00Z',
          view_count: 50,
        },
      ];

      mockSupabase.count.mockReturnValue({
        data: mockPortfolios,
        error: null,
        count: 2,
      });

      const request = createMockRequest(
        'GET',
        'https://example.com/api/v1/portfolios'
      );
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({
        portfolios: mockPortfolios,
        total: 2,
        page: 1,
        totalPages: 1,
      });

      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
    });

    it('should support pagination', async () => {
      mockSupabase.count.mockReturnValue({
        data: [],
        error: null,
        count: 50,
      });

      const request = createMockRequest(
        'GET',
        'https://example.com/api/v1/portfolios?page=2&limit=20'
      );
      await GET(request);

      expect(mockSupabase.range).toHaveBeenCalledWith(20, 39); // Page 2, items 21-40
    });

    it('should filter by published status', async () => {
      mockSupabase.count.mockReturnValue({
        data: [],
        error: null,
        count: 0,
      });

      const request = createMockRequest(
        'GET',
        'https://example.com/api/v1/portfolios?published=true'
      );
      await GET(request);

      expect(mockSupabase.eq).toHaveBeenCalledWith('is_published', true);
    });

    it('should sort by different fields', async () => {
      mockSupabase.count.mockReturnValue({
        data: [],
        error: null,
        count: 0,
      });

      const request = createMockRequest(
        'GET',
        'https://example.com/api/v1/portfolios?sortBy=view_count&sortOrder=desc'
      );
      await GET(request);

      expect(mockSupabase.order).toHaveBeenCalledWith('view_count', {
        ascending: false,
      });
    });

    it('should handle authentication failure', async () => {
      mockGetUserSession.mockResolvedValue(null);

      const request = createMockRequest(
        'GET',
        'https://example.com/api/v1/portfolios'
      );
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Unauthorized');
    });

    it('should handle database errors', async () => {
      mockSupabase.count.mockReturnValue({
        data: null,
        error: { code: 'PGRST000', message: 'Database error' },
      });

      const request = createMockRequest(
        'GET',
        'https://example.com/api/v1/portfolios'
      );
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Failed to fetch portfolios');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to fetch portfolios',
        expect.any(Object)
      );
    });
  });

  describe('POST /api/v1/portfolios', () => {
    const mockUserId = 'user_123';
    const mockSession = {
      user: { id: mockUserId, email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetUserSession.mockResolvedValue(mockSession);
    });

    it('should create a new portfolio', async () => {
      const portfolioData = {
        title: 'My New Portfolio',
        description: 'A professional portfolio',
        template_id: 'developer',
        sections: {
          hero: {
            title: 'John Doe',
            subtitle: 'Full Stack Developer',
          },
          about: {
            content: 'Experienced developer with 5+ years...',
          },
        },
      };

      const mockCreatedPortfolio = {
        id: 'portfolio_new',
        user_id: mockUserId,
        ...portfolioData,
        slug: 'my-new-portfolio',
        is_published: false,
        created_at: '2024-01-01T00:00:00Z',
      };

      // Mock user check for portfolio limit
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          subscription_plan: 'pro',
          portfolio_count: 2,
        },
        error: null,
      });

      // Mock portfolio creation
      mockSupabase.single.mockResolvedValueOnce({
        data: mockCreatedPortfolio,
        error: null,
      });

      const request = createMockRequest(
        'POST',
        'https://example.com/api/v1/portfolios',
        portfolioData
      );
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual({
        portfolio: mockCreatedPortfolio,
      });

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        ...portfolioData,
        slug: expect.any(String),
        is_published: false,
        metadata: {
          version: 1,
          created_with: 'api',
        },
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Portfolio created via API',
        {
          portfolioId: 'portfolio_new',
          userId: mockUserId,
        }
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing title
        description: 'A portfolio',
        template_id: 'developer',
      };

      const request = createMockRequest(
        'POST',
        'https://example.com/api/v1/portfolios',
        invalidData
      );
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('title');
    });

    it('should enforce portfolio limits', async () => {
      // Mock user at limit
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          subscription_plan: 'free',
          portfolio_count: 1, // At limit for free plan
        },
        error: null,
      });

      const request = createMockRequest(
        'POST',
        'https://example.com/api/v1/portfolios',
        {
          title: 'Another Portfolio',
          template_id: 'designer',
        }
      );
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toContain('Portfolio limit reached');
    });

    it('should validate template ID', async () => {
      const request = createMockRequest(
        'POST',
        'https://example.com/api/v1/portfolios',
        {
          title: 'Portfolio',
          template_id: 'invalid_template',
        }
      );
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid template');
    });

    it('should generate unique slug', async () => {
      // Mock user check
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          subscription_plan: 'pro',
          portfolio_count: 0,
        },
        error: null,
      });

      // Mock slug collision check
      mockSupabase.single
        .mockResolvedValueOnce({
          data: { slug: 'my-portfolio' }, // Exists
          error: null,
        })
        .mockResolvedValueOnce({
          data: null, // Available with suffix
          error: { code: 'PGRST116' },
        });

      // Mock portfolio creation
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'portfolio_123',
          slug: 'my-portfolio-2',
        },
        error: null,
      });

      const request = createMockRequest(
        'POST',
        'https://example.com/api/v1/portfolios',
        {
          title: 'My Portfolio',
          template_id: 'developer',
        }
      );
      await POST(request);

      // Should check for slug with number suffix
      expect(mockSupabase.eq).toHaveBeenCalledWith('slug', 'my-portfolio-2');
    });

    it('should sanitize input data', async () => {
      const maliciousData = {
        title: '<script>alert("XSS")</script>My Portfolio',
        description: 'Normal description',
        template_id: 'developer',
        sections: {
          hero: {
            title: '<img src=x onerror=alert("XSS")>',
          },
        },
      };

      // Mock user check
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          subscription_plan: 'pro',
          portfolio_count: 0,
        },
        error: null,
      });

      // Mock portfolio creation
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'portfolio_123' },
        error: null,
      });

      const request = createMockRequest(
        'POST',
        'https://example.com/api/v1/portfolios',
        maliciousData
      );
      await POST(request);

      // Should sanitize HTML in title
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'My Portfolio', // Script tags removed
          sections: expect.objectContaining({
            hero: expect.objectContaining({
              title: expect.not.stringContaining('<img'),
            }),
          }),
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      // Mock user check success
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          subscription_plan: 'pro',
          portfolio_count: 0,
        },
        error: null,
      });

      // Mock portfolio creation failure
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: '23505',
          message: 'Duplicate key violation',
        },
      });

      const request = createMockRequest(
        'POST',
        'https://example.com/api/v1/portfolios',
        {
          title: 'Portfolio',
          template_id: 'developer',
        }
      );
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Failed to create portfolio');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create portfolio',
        expect.any(Object)
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to GET requests', async () => {
      // Mock rate limit exceeded
      mockWithRateLimit.mockImplementationOnce(() => {
        return () => {
          return new Response(
            JSON.stringify({
              error: 'Too many requests',
              retryAfter: 60,
            }),
            {
              status: 429,
              headers: {
                'Retry-After': '60',
                'X-RateLimit-Limit': '100',
                'X-RateLimit-Remaining': '0',
              },
            }
          );
        };
      });

      const request = createMockRequest(
        'GET',
        'https://example.com/api/v1/portfolios'
      );
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(429);
      expect(result.error).toBe('Too many requests');
      expect(response.headers.get('Retry-After')).toBe('60');
    });
  });
});
