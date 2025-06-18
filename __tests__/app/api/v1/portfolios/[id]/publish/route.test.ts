/**
 * @jest-environment node
 */

import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { setupCommonMocks, createMockRequest, defaultSupabaseMock } from '@/__tests__/utils/api-route-test-helpers';

describe('/api/v1/portfolios/[id]/publish', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('POST /api/v1/portfolios/[id]/publish', () => {
    it('should publish portfolio successfully', async () => {
      const mockPortfolio = {
        id: 'portfolio-123',
        user_id: 'user_123',
        name: 'Test Portfolio',
        status: 'draft',
        template: 'developer',
        subdomain: 'test-portfolio',
        data: {
          title: 'Developer',
          bio: 'Test bio',
        },
      };

      const mockPublishedPortfolio = {
        ...mockPortfolio,
        status: 'published',
        published_at: new Date().toISOString(),
      };

      setupCommonMocks();

      // Mock portfolio service methods
      jest.doMock('@/lib/services/portfolio/portfolio-service', () => ({
        portfolioService: {
          getPortfolio: jest.fn().mockResolvedValue(mockPortfolio),
          publishPortfolio: jest.fn().mockResolvedValue(mockPublishedPortfolio),
        },
      }));

      const { POST } = await import('@/app/api/v1/portfolios/[id]/publish/route');

      const request = createMockRequest('https://example.com/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
        params: { id: 'portfolio-123' },
      });
      
      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.status).toBe('published');
      expect(result.data.id).toBe('portfolio-123');
      expect(result.message).toBe('Portfolio published successfully');
    });

    it('should require authentication', async () => {
      jest.resetModules();
      
      jest.doMock('@/lib/api/middleware/auth', () => ({
        authenticateUser: jest.fn().mockResolvedValue(null),
        unauthorizedResponse: jest.fn().mockReturnValue(
          new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        ),
      }));
      
      // Don't call setupCommonMocks to avoid auth conflicts

      const { POST } = await import('@/app/api/v1/portfolios/[id]/publish/route');

      const request = createMockRequest('https://example.com/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
      });
      
      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Authentication required');
    });

    it('should prevent publishing portfolios not owned by user', async () => {
      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'portfolio-123',
                    user_id: 'different-user-123', // Different user
                    name: 'Test Portfolio',
                    status: 'draft',
                  },
                  error: null,
                }),
              }),
            }),
          }),
        },
      });

      const { POST } = await import('@/app/api/v1/portfolios/[id]/publish/route');

      const request = createMockRequest('https://example.com/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
      });
      
      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toBe('Portfolio not found or access denied');
    });

    it('should handle portfolio not found', async () => {
      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        },
      });

      const { POST } = await import('@/app/api/v1/portfolios/[id]/publish/route');

      const request = createMockRequest('https://example.com/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
      });
      
      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toContain('Portfolio not found');
    });

    it('should handle database errors', async () => {
      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Database error'),
                }),
              }),
            }),
          }),
        },
      });

      const { POST } = await import('@/app/api/v1/portfolios/[id]/publish/route');

      const request = createMockRequest('https://example.com/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
      });
      
      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toContain('Failed to publish portfolio');
    });

    it('should require subdomain to publish', async () => {
      const mockPortfolio = {
        id: 'portfolio-123',
        user_id: 'user_123',
        name: 'Test Portfolio',
        status: 'draft',
        template: 'developer',
        subdomain: null, // No subdomain
        data: {
          title: 'Developer',
          bio: 'Test bio',
        },
      };

      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockPortfolio,
                  error: null,
                }),
              }),
            }),
          }),
        },
      });

      const { POST } = await import('@/app/api/v1/portfolios/[id]/publish/route');

      const request = createMockRequest('https://example.com/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
      });
      
      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('subdomain');
    });
  });
});