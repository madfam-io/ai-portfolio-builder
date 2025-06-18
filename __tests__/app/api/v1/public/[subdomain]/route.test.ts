import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/v1/public/[subdomain]/route';
import { createClient } from '@/lib/supabase/server';
import { setupCommonMocks, createMockRequest } from '@/__tests__/utils/api-route-test-helpers';


// Mock dependencies
jest.mock('@/lib/services/error/error-logger');
jest.mock('@/lib/services/error/api-error-handler');

jest.mock('@/lib/cache/redis-cache.server', () => ({
  redisCache: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('/api/v1/public/[subdomain]', () => {
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

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('GET /api/v1/public/[subdomain]', () => {
    it('should retrieve a published portfolio by subdomain', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe'

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.subdomain).toBe('johndoe');
      expect(data.personalInfo.name).toBe('John Doe');
      expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
    });

    it('should validate subdomain format', async () => {
      const invalidSubdomains = [
        'invalid subdomain', // spaces
        'invalid@subdomain', // special chars
        'a', // too short
        'x'.repeat(64), // too long
        'subdomain.', // trailing dot
        '.subdomain', // leading dot
      ];

      for (const subdomain of invalidSubdomains) {
        mockRequest = new NextRequest(
          `http://localhost:3000/api/v1/public/${subdomain}`

        const params = { subdomain };

        const response = await GET(mockRequest, { params });
        expect(response.status).toBe(400);
      }
    });

    it('should return 404 for non-existent subdomain', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/nonexistent'

      const params = { subdomain: 'nonexistent' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(404);
    });

    it('should return 404 for unpublished portfolio', async () => {
      const unpublishedPortfolio = { ...mockPortfolio, isPublished: false };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: unpublishedPortfolio,
          error: null,
        }),
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe'

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(404);
    });

    it('should use cache for frequently accessed portfolios', async () => {
      const { redisCache } = require('@/lib/cache/redis-cache.server');
      redisCache.get.mockResolvedValue(JSON.stringify(mockPortfolio));

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe'

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.subdomain).toBe('johndoe');
      expect(redisCache.get).toHaveBeenCalledWith(
        'portfolio:subdomain:johndoe'

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should cache portfolio data after database fetch', async () => {
      const { redisCache } = require('@/lib/cache/redis-cache.server');
      redisCache.get.mockResolvedValue(null);

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe'

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(200);
      expect(redisCache.set).toHaveBeenCalledWith(
        'portfolio:subdomain:johndoe',
        JSON.stringify(mockPortfolio),
        3600 // 1 hour TTL

    });

    it('should track portfolio views', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe',
        {
          headers: {
            'user-agent': 'Mozilla/5.0',
            'x-forwarded-for': '192.168.1.1',
          },
        }

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(200);
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
      // Second call should be to update analytics
      expect(mockSupabase.from).toHaveBeenLastCalledWith('portfolio_analytics');
    });

    it('should handle variant selection', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe?variant=recruiters'

      const params = { subdomain: 'johndoe' };

      // Mock variant fetch
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'portfolio_variants') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'variant-123',
                content: {
                  bio: 'Senior developer focused on team leadership',
                },
              },
              error: null,
            })
    };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockPortfolio,
            error: null,
          })
    };
      });

      const response = await GET(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.activeVariant).toBe('recruiters');
    });

    it('should include CORS headers for public access', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe',
        {
          headers: {
            origin: 'https://external-site.com',
          },
        }

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
        'GET'

    });

    it('should sanitize portfolio data for public access', async () => {
      const portfolioWithPrivateData = {
        ...mockPortfolio,
        privateNotes: 'Internal notes',
        analytics: {
          ...mockPortfolio.analytics,
          revenue: 50000, // Should be excluded
        },
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: portfolioWithPrivateData,
          error: null,
        }),
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe'

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).not.toHaveProperty('privateNotes');
      expect(data.analytics).not.toHaveProperty('revenue');
    });
  });

  describe('SEO and Meta Tags', () => {
    it('should include SEO metadata in response', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe'

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.seo).toBeDefined();
      expect(data.seo.title).toBeTruthy();
      expect(data.seo.description).toBeTruthy();
      expect(data.seo.keywords).toBeInstanceOf(Array);
    });

    it('should generate default SEO if not provided', async () => {
      const portfolioWithoutSEO = { ...mockPortfolio };
      delete portfolioWithoutSEO.seo;

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: portfolioWithoutSEO,
          error: null,
        }),
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe'

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.seo).toBeDefined();
      expect(data.seo.title).toContain('John Doe');
      expect(data.seo.description).toContain('portfolio');
    });
  });

  describe('Performance and Rate Limiting', () => {
    it('should implement rate limiting per IP', async () => {
      const mockRateLimiter = jest.fn().mockResolvedValue(true);
      jest.mock('@/lib/utils/rate-limiter', () => ({
        checkRateLimit: mockRateLimiter,
      }));

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe',
        {
          headers: {
            'x-forwarded-for': '192.168.1.1',
          },
        }

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(200);
    });

    it('should set appropriate cache headers', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe'

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toContain('public');
      expect(response.headers.get('Cache-Control')).toContain('max-age=');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database connection failed'),
        }),
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe'

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(500);
    });

    it('should handle cache errors gracefully', async () => {
      const { redisCache } = require('@/lib/cache/redis-cache.server');
      redisCache.get.mockRejectedValue(new Error('Redis connection failed'));

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/public/johndoe'

      const params = { subdomain: 'johndoe' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(200);
      expect(mockSupabase.from).toHaveBeenCalled(); // Should fall back to database
    });
  });
});
