import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/analytics/repositories/[id]/route';
import { AnalyticsService } from '@/lib/services/analyticsService';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import {
  setupCommonMocks,
  createMockRequest,
} from '@/__tests__/utils/api-route-test-helpers';

// Mock dependencies
jest.mock('@/lib/services/analyticsService');
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('@/lib/utils/logger');

describe('/api/v1/analytics/repositories/[id]', () => {
  setupCommonMocks();

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockRepository = {
    id: 'repo-123',
    name: 'awesome-project',
    full_name: 'user/awesome-project',
    stars: 42,
    forks: 10,
    language: 'TypeScript',
  };

  const mockAnalytics = {
    repository: mockRepository,
    metrics: {
      commits: 500,
      pull_requests: 50,
      issues: 30,
      contributors: 10,
    },
    trends: {
      stars_growth: 0.15,
      commit_frequency: 25,
    },
  };

  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
  };

  const params = { id: 'repo-123' };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    (logger.error as jest.Mock).mockImplementation(() => {});
  });

  describe('GET /api/v1/analytics/repositories/[id]', () => {
    it('should return analytics for specific repository', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        getRepositoryAnalytics: jest.fn().mockResolvedValue(mockAnalytics),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
      'http://localhost:3000/api/v1/analytics/repositories/repo-123'
    );

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: mockAnalytics,
      });
      expect(mockAnalyticsService.initialize).toHaveBeenCalled();
      expect(mockAnalyticsService.getRepositoryAnalytics).toHaveBeenCalledWith(
        'repo-123'
      );
    });

    it('should return 503 when database is unavailable', async () => {
      (createClient as jest.Mock).mockReturnValue(null);

      const request = new NextRequest(
      'http://localhost:3000/api/v1/analytics/repositories/repo-123'
    );

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data).toEqual({
        error: 'Database connection not available',
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest(
      'http://localhost:3000/api/v1/analytics/repositories/repo-123'
    );

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 when GitHub integration is missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAnalyticsService = {
        initialize: jest
          .fn()
          .mockRejectedValue(new Error('No active GitHub integration')),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
      'http://localhost:3000/api/v1/analytics/repositories/repo-123'
    );

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'GitHub integration required',
        requiresAuth: true,
      });
    });

    it('should return 404 when repository not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        getRepositoryAnalytics: jest.fn().mockResolvedValue(null),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
      'http://localhost:3000/api/v1/analytics/repositories/repo-123'
    );

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Repository not found' });
    });

    it('should return 500 on unexpected error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        getRepositoryAnalytics: jest
          .fn()
          .mockRejectedValue(new Error('Database error')),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
      'http://localhost:3000/api/v1/analytics/repositories/repo-123'
    );

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Database error' });
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch repository analytics',
        expect.objectContaining({
          repositoryId: 'repo-123',
          error: 'Database error',
        })
      );
    });
  });

  describe('POST /api/v1/analytics/repositories/[id]', () => {
    it('should sync all repository data by default', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        getRepository: jest.fn().mockResolvedValue(mockRepository),
        syncRepositoryMetrics: jest.fn(),
        syncPullRequests: jest.fn(),
        syncContributors: jest.fn(),
        syncCommitAnalytics: jest.fn(),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
        'http://localhost:3000/api/v1/analytics/repositories/repo-123',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: {
          repositoryId: 'repo-123',
          synced: ['metrics', 'pull_requests', 'contributors', 'commits'],
          errors: [],
        },
      });
      expect(mockAnalyticsService.syncRepositoryMetrics).toHaveBeenCalledWith(
        'repo-123'
      );
      expect(mockAnalyticsService.syncPullRequests).toHaveBeenCalledWith(
        'repo-123'
      );
      expect(mockAnalyticsService.syncContributors).toHaveBeenCalledWith(
        'repo-123'
      );
      expect(mockAnalyticsService.syncCommitAnalytics).toHaveBeenCalledWith(
        'repo-123'
      );
    });

    it('should sync only requested data', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        getRepository: jest.fn().mockResolvedValue(mockRepository),
        syncRepositoryMetrics: jest.fn(),
        syncPullRequests: jest.fn(),
        syncContributors: jest.fn(),
        syncCommitAnalytics: jest.fn(),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
        'http://localhost:3000/api/v1/analytics/repositories/repo-123',
        {
          method: 'POST',
          body: JSON.stringify({
            syncMetrics: true,
            syncPullRequests: false,
            syncContributors: false,
            syncCommits: true,
          }),
        }
      );

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.synced).toEqual(['metrics', 'commits']);
      expect(mockAnalyticsService.syncRepositoryMetrics).toHaveBeenCalled();
      expect(mockAnalyticsService.syncPullRequests).not.toHaveBeenCalled();
      expect(mockAnalyticsService.syncContributors).not.toHaveBeenCalled();
      expect(mockAnalyticsService.syncCommitAnalytics).toHaveBeenCalled();
    });

    it('should handle partial sync failures', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        getRepository: jest.fn().mockResolvedValue(mockRepository),
        syncRepositoryMetrics: jest.fn(),
        syncPullRequests: jest
          .fn()
          .mockRejectedValue(new Error('GitHub API rate limit')),
        syncContributors: jest.fn(),
        syncCommitAnalytics: jest
          .fn()
          .mockRejectedValue(new Error('Timeout error')),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
        'http://localhost:3000/api/v1/analytics/repositories/repo-123',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: {
          repositoryId: 'repo-123',
          synced: ['metrics', 'contributors'],
          errors: [
            { type: 'pull_requests', error: 'GitHub API rate limit' },
            { type: 'commits', error: 'Timeout error' },
          ],
        },
      });
      expect(logger.error).toHaveBeenCalledTimes(2);
    });

    it('should return 404 when repository not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        getRepository: jest.fn().mockResolvedValue(null),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
        'http://localhost:3000/api/v1/analytics/repositories/repo-123',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Repository not found' });
    });

    it('should handle invalid JSON body', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        getRepository: jest.fn().mockResolvedValue(mockRepository),
        syncRepositoryMetrics: jest.fn(),
        syncPullRequests: jest.fn(),
        syncContributors: jest.fn(),
        syncCommitAnalytics: jest.fn(),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
      'http://localhost:3000/api/v1/analytics/repositories/repo-123',
        {
          method: 'POST',
          body: 'invalid json',
        }
    );

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should still sync all by default
      expect(data.data.synced).toEqual([
        'metrics',
        'pull_requests',
        'contributors',
        'commits',
      ]);
    });

    it('should return 500 on unexpected error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        getRepository: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
        'http://localhost:3000/api/v1/analytics/repositories/repo-123',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Database error' });
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to sync repository',
        expect.objectContaining({
          repositoryId: 'repo-123',
          error: 'Database error',
        })
      );
    });
  });
});
