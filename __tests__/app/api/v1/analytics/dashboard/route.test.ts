/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { setupCommonMocks, createMockRequest, defaultSupabaseMock } from '@/__tests__/utils/api-route-test-helpers';


describe('/api/v1/analytics/dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('GET /api/v1/analytics/dashboard', () => {
    it('should return dashboard data successfully', async () => {
      const mockDashboardData = {
        repositories: [
          {
            id: 'repo-1',
            name: 'test-repo',
            analysisCount: 10,
            lastAnalyzed: new Date().toISOString(),
          },
        ],
        totalAnalyses: 25,
        totalRepositories: 5,
        recentAnalyses: [],
        codeQualityTrends: [],
      };

      // Mock AnalyticsService before importing the route
      jest.doMock('@/lib/services/analyticsService', () => {
        const mockService = {
          initialize: jest.fn().mockResolvedValue(undefined),
          getDashboardData: jest.fn().mockResolvedValue(mockDashboardData),
        };
        
        return {
          AnalyticsService: jest.fn().mockImplementation(() => mockService),
        };
      });

      const mocks = setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'test-user-id', email: 'test@example.com' } },
              error: null,
            }),
          },
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockDashboardData.repositories,
                  error: null,
                }),
              }),
            }),
          }),
        },
      });

      const { GET } = await import('@/app/api/v1/analytics/dashboard/route');

      const request = createMockRequest('https://example.com/api/v1/analytics/dashboard');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDashboardData);
    });

    it('should require authentication', async () => {
      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        },
      });

      const { GET } = await import('@/app/api/v1/analytics/dashboard/route');

      const request = createMockRequest('https://example.com/api/v1/analytics/dashboard');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Unauthorized');
    });

    it('should handle date range filters', async () => {
      jest.doMock('@/lib/services/analyticsService', () => {
        const mockService = {
          initialize: jest.fn().mockResolvedValue(undefined),
          getDashboardData: jest.fn().mockResolvedValue({
            repositories: [],
            totalAnalyses: 0,
            totalRepositories: 0,
            recentAnalyses: [],
            codeQualityTrends: [],
          }),
        };
        
        return {
          AnalyticsService: jest.fn().mockImplementation(() => mockService),
        };
      });

      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'test-user-id', email: 'test@example.com' } },
              error: null,
            }),
          },
        },
      });

      const { GET } = await import('@/app/api/v1/analytics/dashboard/route');

      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-12-31').toISOString();
      const request = createMockRequest(
        `https://example.com/api/v1/analytics/dashboard?startDate=${startDate}&endDate=${endDate}`
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should handle analytics service errors', async () => {
      jest.doMock('@/lib/services/analyticsService', () => {
        const mockService = {
          initialize: jest.fn().mockResolvedValue(undefined),
          getDashboardData: jest.fn().mockRejectedValue(new Error('Analytics service error')),
        };
        
        return {
          AnalyticsService: jest.fn().mockImplementation(() => mockService),
        };
      });

      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'test-user-id', email: 'test@example.com' } },
              error: null,
            }),
          },
        },
      });

      const { GET } = await import('@/app/api/v1/analytics/dashboard/route');

      const request = createMockRequest('https://example.com/api/v1/analytics/dashboard');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Internal server error');
    });

    it('should handle database connection failure', async () => {
      setupCommonMocks({
        supabase: null,
      });

      const { GET } = await import('@/app/api/v1/analytics/dashboard/route');

      const request = createMockRequest('https://example.com/api/v1/analytics/dashboard');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.error).toBe('Database connection not available');
    });
  });
});
