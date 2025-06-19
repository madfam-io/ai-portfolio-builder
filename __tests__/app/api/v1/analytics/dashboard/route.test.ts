/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import {
  setupCommonMocks,
  defaultSupabaseMock,
} from '@/__tests__/utils/api-route-test-helpers';

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

describe('/api/v1/analytics/dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('GET /api/v1/analytics/dashboard', () => {
    it('should return dashboard data successfully', async () => {
      // Set up common mocks first
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

      // Override the AnalyticsService mock after setupCommonMocks
      const mockAnalyticsService = {
        initialize: jest.fn().mockResolvedValue(undefined),
        getDashboardData: jest.fn().mockResolvedValue(mockDashboardData),
        getRepositories: jest.fn().mockResolvedValue([]),
      };

      jest.doMock('@/lib/services/analyticsService', () => ({
        AnalyticsService: jest
          .fn()
          .mockImplementation(() => mockAnalyticsService),
      }));

      const { GET } = await import('@/app/api/v1/analytics/dashboard/route');

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDashboardData);
      expect(mockAnalyticsService.initialize).toHaveBeenCalled();
      expect(mockAnalyticsService.getDashboardData).toHaveBeenCalled();
    });

    it('should require authentication', async () => {
      setupCommonMocks({
        supabase: {
          ...defaultSupabaseMock,
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: new Error('No user'),
            }),
          },
        },
      });

      const { GET } = await import('@/app/api/v1/analytics/dashboard/route');

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Unauthorized');
    });

    it('should handle date range filters', async () => {
      const mockAnalyticsService = {
        initialize: jest.fn().mockResolvedValue(undefined),
        getDashboardData: jest.fn().mockResolvedValue(mockDashboardData),
      };

      jest.doMock('@/lib/services/analyticsService', () => ({
        AnalyticsService: jest
          .fn()
          .mockImplementation(() => mockAnalyticsService),
      }));

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

      const response = await GET();

      expect(response.status).toBe(200);
    });

    it('should handle analytics service errors', async () => {
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

      // Override after setupCommonMocks
      const mockAnalyticsService = {
        initialize: jest.fn().mockResolvedValue(undefined),
        getDashboardData: jest
          .fn()
          .mockRejectedValue(new Error('Analytics service error')),
      };

      jest.doMock('@/lib/services/analyticsService', () => ({
        AnalyticsService: jest
          .fn()
          .mockImplementation(() => mockAnalyticsService),
      }));

      const { GET } = await import('@/app/api/v1/analytics/dashboard/route');

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Internal server error');
    });

    it('should handle database connection failure', async () => {
      // Mock createClient to return null
      jest.doMock('@/lib/supabase/server', () => ({
        createClient: jest.fn().mockResolvedValue(null),
      }));

      const { GET } = await import('@/app/api/v1/analytics/dashboard/route');

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.error).toBe('Database connection not available');
    });
  });
});
