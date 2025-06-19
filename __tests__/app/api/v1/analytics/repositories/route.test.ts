import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/analytics/repositories/route';
import { AnalyticsService } from '@/lib/services/analyticsService';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import {
  setupCommonMocks,
  createMockRequest,
} from '@/__tests__/utils/api-route-test-helpers';

// Mock dependencies
jest.mock('@/lib/services/analyticsService');

jest.mock('@/lib/utils/logger');

describe('/api/v1/analytics/repositories', () => {
  setupCommonMocks();

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockRepositories = [
    {
      id: 'repo-1',
      name: 'awesome-project',
      full_name: 'user/awesome-project',
      stars: 42,
      forks: 10,
      language: 'TypeScript',
    },
    {
      id: 'repo-2',
      name: 'another-project',
      full_name: 'user/another-project',
      stars: 15,
      forks: 3,
      language: 'JavaScript',
    },
  ];

  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (logger.error as jest.Mock).mockImplementation(() => {});
  });

  describe('GET /api/v1/analytics/repositories', () => {
    it('should return repositories for authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        getRepositories: jest.fn().mockResolvedValue(mockRepositories),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: {
          repositories: mockRepositories,
          total: 2,
        },
      });
      expect(mockAnalyticsService.initialize).toHaveBeenCalled();
      expect(mockAnalyticsService.getRepositories).toHaveBeenCalled();
    });

    it('should return 503 when database is unavailable', async () => {
      (createClient as jest.Mock).mockResolvedValue(null);

      const response = await GET();
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

      const response = await GET();
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

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'GitHub integration required',
        requiresAuth: true,
      });
    });

    it('should return 500 on unexpected error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        getRepositories: jest
          .fn()
          .mockRejectedValue(new Error('Database error')),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch repositories',
        expect.any(Object)
      );
    });
  });

  describe('POST /api/v1/analytics/repositories', () => {
    it('should sync repositories successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            last_synced_at: new Date(
              Date.now() - 2 * 60 * 60 * 1000
            ).toISOString(),
          },
        }),
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        syncRepositories: jest.fn().mockResolvedValue(mockRepositories),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
        'http://localhost:3000/api/v1/analytics/repositories',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: {
          repositories: mockRepositories,
          synced: 2,
          timestamp: expect.any(String),
        },
      });
      expect(mockAnalyticsService.syncRepositories).toHaveBeenCalled();
    });

    it('should force sync when requested', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Last synced 30 minutes ago (too recent without force)
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            last_synced_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
        }),
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        syncRepositories: jest.fn().mockResolvedValue(mockRepositories),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
        'http://localhost:3000/api/v1/analytics/repositories',
        {
          method: 'POST',
          body: JSON.stringify({ force: true }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockAnalyticsService.syncRepositories).toHaveBeenCalled();
    });

    it('should return 429 when sync is too recent', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Last synced 30 minutes ago
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            last_synced_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
        }),
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
        'http://localhost:3000/api/v1/analytics/repositories',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data).toEqual({
        error: 'Sync too recent, wait at least 1 hour or use force=true',
      });
    });

    it('should handle first sync (no last_synced_at)', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { last_synced_at: null },
        }),
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        syncRepositories: jest.fn().mockResolvedValue(mockRepositories),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
        'http://localhost:3000/api/v1/analytics/repositories',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockAnalyticsService.syncRepositories).toHaveBeenCalled();
    });

    it('should handle invalid JSON body', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { last_synced_at: null },
        }),
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        syncRepositories: jest.fn().mockResolvedValue(mockRepositories),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
      'http://localhost:3000/api/v1/analytics/repositories',
        {
          method: 'POST',
          body: 'invalid json',
        }
    );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockAnalyticsService.syncRepositories).toHaveBeenCalled();
    });

    it('should return 500 on sync error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { last_synced_at: null },
        }),
      });

      const mockAnalyticsService = {
        initialize: jest.fn(),
        syncRepositories: jest
          .fn()
          .mockRejectedValue(new Error('GitHub API error')),
      };
      (AnalyticsService as jest.Mock).mockImplementation(
        () => mockAnalyticsService
      );

      const request = new NextRequest(
        'http://localhost:3000/api/v1/analytics/repositories',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to sync repositories',
        expect.any(Object)
      );
    });
  });
});
