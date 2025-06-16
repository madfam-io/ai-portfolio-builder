import { NextRequest } from 'next/server';
import { GET } from '@/app/api/v1/analytics/dashboard/route';
import { createClient } from '@/lib/supabase/server';
import { AnalyticsService } from '@/lib/services/analyticsService';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/services/analyticsService');
jest.mock('@/lib/utils/logger');

describe('/api/v1/analytics/dashboard', () => {
  let mockSupabaseClient: any;
  let mockUser: any;
  let mockAnalyticsService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock user
    mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
    };

    // Setup mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);

    // Setup mock AnalyticsService
    mockAnalyticsService = {
      initialize: jest.fn().mockResolvedValue(undefined),
      getDashboardData: jest.fn(),
    };

    (AnalyticsService as jest.Mock).mockImplementation(
      () => mockAnalyticsService
    );
  });

  describe('GET /api/v1/analytics/dashboard', () => {
    it('should return dashboard data successfully', async () => {
      const mockDashboardData = {
        repositories: [
          {
            id: 'repo-1',
            name: 'test-repo',
            stargazersCount: 42,
            forksCount: 10,
          },
        ],
        overview: {
          totalRepositories: 5,
          totalCommits: 1234,
          totalPullRequests: 89,
          totalContributors: 15,
          totalLinesOfCode: 50000,
        },
        recentActivity: {
          commits: [],
          pullRequests: [],
        },
        trends: {
          commitsPerDay: [],
          pullRequestsPerWeek: [],
        },
      };

      mockAnalyticsService.getDashboardData.mockResolvedValue(
        mockDashboardData
      );

      const response = await GET();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: mockDashboardData,
      });

      expect(AnalyticsService).toHaveBeenCalledWith(mockUser.id);
      expect(mockAnalyticsService.initialize).toHaveBeenCalled();
      expect(mockAnalyticsService.getDashboardData).toHaveBeenCalled();
    });

    it('should handle unauthenticated requests', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const response = await GET();
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle database connection failure', async () => {
      (createClient as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data.error).toBe('Database connection not available');
    });

    it('should handle missing GitHub integration', async () => {
      mockAnalyticsService.initialize.mockRejectedValue(
        new Error('No active GitHub integration found')
      );

      const response = await GET();
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('GitHub integration required');
      expect(data.requiresAuth).toBe(true);
    });

    it('should handle analytics service errors', async () => {
      mockAnalyticsService.getDashboardData.mockRejectedValue(
        new Error('Failed to fetch analytics data')
      );

      const response = await GET();
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    it('should handle empty dashboard data', async () => {
      const emptyDashboardData = {
        repositories: [],
        overview: {
          totalRepositories: 0,
          totalCommits: 0,
          totalPullRequests: 0,
          totalContributors: 0,
          totalLinesOfCode: 0,
        },
        recentActivity: {
          commits: [],
          pullRequests: [],
        },
        trends: {
          commitsPerDay: [],
          pullRequestsPerWeek: [],
        },
      };

      mockAnalyticsService.getDashboardData.mockResolvedValue(
        emptyDashboardData
      );

      const response = await GET();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.repositories).toHaveLength(0);
      expect(data.data.overview.totalRepositories).toBe(0);
    });

    it('should cache dashboard data appropriately', async () => {
      const mockDashboardData = {
        repositories: [],
        overview: {
          totalRepositories: 1,
          totalCommits: 100,
          totalPullRequests: 10,
          totalContributors: 5,
          totalLinesOfCode: 10000,
        },
        recentActivity: { commits: [], pullRequests: [] },
        trends: { commitsPerDay: [], pullRequestsPerWeek: [] },
      };

      mockAnalyticsService.getDashboardData.mockResolvedValue(
        mockDashboardData
      );

      // First request
      await GET();
      expect(mockAnalyticsService.getDashboardData).toHaveBeenCalledTimes(1);

      // Subsequent request should still hit the service (caching is internal to service)
      await GET();
      expect(mockAnalyticsService.getDashboardData).toHaveBeenCalledTimes(2);
    });
  });
});
