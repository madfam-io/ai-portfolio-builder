import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the entire analytics service and its dependencies
jest.doMock('@/lib/services/analyticsService', () => {
  return {
    AnalyticsService: jest.fn().mockImplementation(() => {
      const mockRepositoryService = {
        getRepositories: jest.fn().mockResolvedValue([
          {
            id: 'repo-123',
            name: 'test-repo',
            fullName: 'user/test-repo',
            description: 'Test repository',
            language: 'TypeScript',
            stargazersCount: 10,
            forksCount: 5,
            openIssuesCount: 2,
            size: 1000,
            visibility: 'public' as const,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-15'),
            pushedAt: new Date('2024-01-14'),
            topics: ['test', 'typescript'],
            owner: {
              login: 'testuser',
              id: 12345,
              avatarUrl: 'https://github.com/testuser.png',
              type: 'User' as const,
            },
            clone_url: 'https://github.com/user/test-repo.git',
            html_url: 'https://github.com/user/test-repo',
            isPrivate: false,
            defaultBranch: 'main',
            hasIssues: true,
            hasPullRequests: true,
            hasWiki: false,
            hasDownloads: true,
            archived: false,
            disabled: false,
            license: {
              key: 'mit',
              name: 'MIT License',
              spdxId: 'MIT',
            },
          },
        ]),
        getRepository: jest.fn(),
        getRepositoryAnalytics: jest.fn(),
      };

      const mockMetricsService = {
        syncRepositoryMetrics: jest.fn(),
        syncPullRequests: jest.fn(),
        syncContributors: jest.fn(),
        syncCommitAnalytics: jest.fn(),
      };

      const mockDashboardService = {
        getDashboardData: jest.fn(),
      };

      return {
        getRepositories: mockRepositoryService.getRepositories,
        getRepository: mockRepositoryService.getRepository,
        syncRepositoryMetrics: mockMetricsService.syncRepositoryMetrics,
        syncPullRequests: mockMetricsService.syncPullRequests,
        syncContributors: mockMetricsService.syncContributors,
        syncCommitAnalytics: mockMetricsService.syncCommitAnalytics,
        getDashboardData: mockDashboardService.getDashboardData,
        getRepositoryAnalytics: mockRepositoryService.getRepositoryAnalytics,
        syncRepositoryData: jest.fn(),
        _mockRepositoryService: mockRepositoryService,
        _mockMetricsService: mockMetricsService,
        _mockDashboardService: mockDashboardService,
      };
    }),
  };
});

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Import after mocks
import { AnalyticsService } from '@/lib/services/analyticsService';
import { logger } from '@/lib/utils/logger';

describe('AnalyticsService', () => {
  let analyticsService: any;
  let mockRepositoryService: any;
  let mockMetricsService: any;
  let mockDashboardService: any;

  const userId = 'test-user-123';
  const mockRepository = {
    id: 'repo-123',
    name: 'test-repo',
    fullName: 'user/test-repo',
    description: 'Test repository',
    language: 'TypeScript',
    stargazersCount: 10,
    forksCount: 5,
    openIssuesCount: 2,
    size: 1000,
    visibility: 'public' as const,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    pushedAt: new Date('2024-01-14'),
    topics: ['test', 'typescript'],
    owner: {
      login: 'testuser',
      avatarUrl: 'https://example.com/avatar.png',
    },
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/user/test-repo',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock instances
    mockGithubClient =
      new GitHubAnalyticsClient() as jest.Mocked<GitHubAnalyticsClient>;
    mockRepositoryService = new RepositoryAnalyticsService(
      userId,
      mockGithubClient
    ) as jest.Mocked<RepositoryAnalyticsService>;
    mockMetricsService = new MetricsCalculationService(
      userId,
      mockGithubClient
    ) as jest.Mocked<MetricsCalculationService>;
    mockDashboardService = new DashboardAnalyticsService(
      userId
    ) as jest.Mocked<DashboardAnalyticsService>;

    // Setup default mock implementations
    mockGithubClient.initialize = jest.fn().mockResolvedValue(undefined);
    mockRepositoryService.syncRepositories = jest
      .fn()
      .mockResolvedValue([mockRepository]);
    mockRepositoryService.getRepositories = jest
      .fn()
      .mockResolvedValue([mockRepository]);
    mockRepositoryService.getRepository = jest
      .fn()
      .mockResolvedValue(mockRepository);
    mockRepositoryService.getRepositoryAnalytics = jest
      .fn()
      .mockResolvedValue(null);

    // Mock logger
    (logger.error as jest.Mock).mockImplementation(() => {});

    // Create service instance
    analyticsService = new AnalyticsService(userId);
  });

  describe('initialize', () => {
    it('should initialize GitHub client', async () => {
      await analyticsService.initialize();

      expect(mockGithubClient.initialize).toHaveBeenCalledWith(userId);
    });
  });

  describe('syncRepositories', () => {
    it('should sync repositories through repository service', async () => {
      const repositories = await analyticsService.syncRepositories();

      expect(mockRepositoryService.syncRepositories).toHaveBeenCalled();
      expect(repositories).toEqual([mockRepository]);
    });
  });

  describe('getRepositories', () => {
    it('should get repositories through repository service', async () => {
      const repositories = await analyticsService.getRepositories();

      expect(mockRepositoryService.getRepositories).toHaveBeenCalled();
      expect(repositories).toEqual([mockRepository]);
    });
  });

  describe('getRepository', () => {
    it('should get repository by ID', async () => {
      const repository = await analyticsService.getRepository('repo-123');

      expect(mockRepositoryService.getRepository).toHaveBeenCalledWith(
        'repo-123'
      );

      expect(repository).toEqual(mockRepository);
    });

    it('should return null for non-existent repository', async () => {
      mockRepositoryService.getRepository.mockResolvedValue(null);

      const repository = await analyticsService.getRepository('non-existent');

      expect(repository).toBeNull();
    });
  });

  describe('syncRepositoryMetrics', () => {
    it('should sync metrics for existing repository', async () => {
      const mockMetrics = {
        totalFiles: 50,
        totalLines: 5000,
        languages: { TypeScript: 4000, JavaScript: 1000 },
        lastAnalyzed: new Date(),
      };

      mockMetricsService.syncRepositoryMetrics = jest
        .fn()
        .mockResolvedValue(mockMetrics);

      const metrics = await analyticsService.syncRepositoryMetrics('repo-123');

      expect(mockRepositoryService.getRepository).toHaveBeenCalledWith(
        'repo-123'
      );

      expect(mockMetricsService.syncRepositoryMetrics).toHaveBeenCalledWith(
        mockRepository
      );

      expect(metrics).toEqual(mockMetrics);
    });

    it('should throw error for non-existent repository', async () => {
      mockRepositoryService.getRepository.mockResolvedValue(null);

      await expect(
        analyticsService.syncRepositoryMetrics('non-existent')
      ).rejects.toThrow('Repository not found');
    });
  });

  describe('syncPullRequests', () => {
    it('should sync pull requests for existing repository', async () => {
      const mockPullRequests = [
        {
          id: 'pr-1',
          number: 1,
          title: 'Test PR',
          state: 'open' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: { login: 'author', avatarUrl: '' },
          labels: [],
          reviewers: [],
          htmlUrl: 'https://github.com/user/repo/pull/1',
        },
      ];

      mockMetricsService.syncPullRequests = jest
        .fn()
        .mockResolvedValue(mockPullRequests);

      const pullRequests = await analyticsService.syncPullRequests('repo-123');

      expect(mockMetricsService.syncPullRequests).toHaveBeenCalledWith(
        mockRepository
      );

      expect(pullRequests).toEqual(mockPullRequests);
    });

    it('should throw error for non-existent repository', async () => {
      mockRepositoryService.getRepository.mockResolvedValue(null);

      await expect(
        analyticsService.syncPullRequests('non-existent')
      ).rejects.toThrow('Repository not found');
    });
  });

  describe('syncContributors', () => {
    it('should sync contributors for existing repository', async () => {
      mockMetricsService.syncContributors = jest
        .fn()
        .mockResolvedValue(undefined);

      await analyticsService.syncContributors('repo-123');

      expect(mockMetricsService.syncContributors).toHaveBeenCalledWith(
        mockRepository
      );
    });

    it('should throw error for non-existent repository', async () => {
      mockRepositoryService.getRepository.mockResolvedValue(null);

      await expect(
        analyticsService.syncContributors('non-existent')
      ).rejects.toThrow('Repository not found');
    });
  });

  describe('syncCommitAnalytics', () => {
    it('should sync commit analytics with default days', async () => {
      mockMetricsService.syncCommitAnalytics = jest
        .fn()
        .mockResolvedValue(undefined);

      await analyticsService.syncCommitAnalytics('repo-123');

      expect(mockMetricsService.syncCommitAnalytics).toHaveBeenCalledWith(
        mockRepository,
        30
      );
    });

    it('should sync commit analytics with custom days', async () => {
      mockMetricsService.syncCommitAnalytics = jest
        .fn()
        .mockResolvedValue(undefined);

      await analyticsService.syncCommitAnalytics('repo-123', 60);

      expect(mockMetricsService.syncCommitAnalytics).toHaveBeenCalledWith(
        mockRepository,
        60
      );
    });

    it('should throw error for non-existent repository', async () => {
      mockRepositoryService.getRepository.mockResolvedValue(null);

      await expect(
        analyticsService.syncCommitAnalytics('non-existent')
      ).rejects.toThrow('Repository not found');
    });
  });

  describe('getDashboardData', () => {
    it('should get dashboard data successfully', async () => {
      const mockDashboardData = {
        overview: {
          totalRepositories: 1,
          totalStars: 10,
          totalForks: 5,
          totalContributions: 100,
          primaryLanguage: 'TypeScript',
          languageDistribution: { TypeScript: 100 },
        },
        activity: {
          contributionsLastYear: 100,
          currentStreak: 5,
          longestStreak: 20,
          totalPullRequests: 50,
          totalIssues: 30,
          totalCommits: 500,
        },
        topRepositories: [mockRepository],
        recentActivity: [],
        skillsAnalysis: {
          languages: ['TypeScript'],
          frameworks: [],
          tools: [],
          expertise: {
            frontend: 0.5,
            backend: 0.5,
            devops: 0,
            mobile: 0,
          },
        },
      };

      mockDashboardService.getDashboardData = jest
        .fn()
        .mockResolvedValue(mockDashboardData);

      const dashboardData = await analyticsService.getDashboardData();

      expect(mockRepositoryService.getRepositories).toHaveBeenCalled();
      expect(mockDashboardService.getDashboardData).toHaveBeenCalledWith([
        mockRepository,
      ]);
      expect(dashboardData).toEqual(mockDashboardData);
    });

    it('should handle errors and rethrow', async () => {
      const error = new Error('Dashboard error');
      mockDashboardService.getDashboardData = jest
        .fn()
        .mockRejectedValue(error);

      await expect(analyticsService.getDashboardData()).rejects.toThrow(
        'Dashboard error'
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to get dashboard data',
        { error }
      );
    });
  });

  describe('getRepositoryAnalytics', () => {
    it('should get repository analytics', async () => {
      const mockAnalytics = {
        repositoryId: 'repo-123',
        metrics: {},
        pullRequests: [],
        contributors: [],
        commits: [],
      };

      mockRepositoryService.getRepositoryAnalytics.mockResolvedValue(
        mockAnalytics
      );

      const analytics =
        await analyticsService.getRepositoryAnalytics('repo-123');

      expect(mockRepositoryService.getRepositoryAnalytics).toHaveBeenCalledWith(
        'repo-123'
      );

      expect(analytics).toEqual(mockAnalytics);
    });
  });

  describe('syncRepositoryData', () => {
    beforeEach(() => {
      mockMetricsService.syncRepositoryMetrics = jest
        .fn()
        .mockResolvedValue({});
      mockMetricsService.syncPullRequests = jest.fn().mockResolvedValue([]);
      mockMetricsService.syncContributors = jest
        .fn()
        .mockResolvedValue(undefined);
      mockMetricsService.syncCommitAnalytics = jest
        .fn()
        .mockResolvedValue(undefined);
    });

    it('should sync all data by default', async () => {
      await analyticsService.syncRepositoryData('repo-123');

      expect(mockMetricsService.syncRepositoryMetrics).toHaveBeenCalledWith(
        mockRepository
      );
      expect(mockMetricsService.syncPullRequests).toHaveBeenCalledWith(
        mockRepository
      );
      expect(mockMetricsService.syncContributors).toHaveBeenCalledWith(
        mockRepository
      );
      expect(mockMetricsService.syncCommitAnalytics).toHaveBeenCalledWith(
        mockRepository
      );
    });

    it('should sync only specified data types', async () => {
      await analyticsService.syncRepositoryData('repo-123', {
        syncMetrics: true,
        syncPullRequests: false,
        syncContributors: false,
        syncCommits: true,
      });

      expect(mockMetricsService.syncRepositoryMetrics).toHaveBeenCalled();
      expect(mockMetricsService.syncPullRequests).not.toHaveBeenCalled();
      expect(mockMetricsService.syncContributors).not.toHaveBeenCalled();
      expect(mockMetricsService.syncCommitAnalytics).toHaveBeenCalled();
    });

    it('should throw error for non-existent repository', async () => {
      mockRepositoryService.getRepository.mockResolvedValue(null);

      await expect(
        analyticsService.syncRepositoryData('non-existent')
      ).rejects.toThrow('Repository not found');
    });

    it('should handle partial sync failures', async () => {
      mockMetricsService.syncRepositoryMetrics.mockRejectedValue(
        new Error('Metrics error')
      );

      // Should not throw - Promise.all will handle the error
      await expect(
        analyticsService.syncRepositoryData('repo-123', {
          syncMetrics: true,
          syncPullRequests: false,
          syncContributors: false,
          syncCommits: false,
        })
      ).rejects.toThrow('Metrics error');
    });

    it('should run all syncs in parallel', async () => {
      const metricsPromise = new Promise(resolve =>
        setTimeout(() => resolve({}), 100)
      );

      const pullRequestsPromise = new Promise(resolve =>
        setTimeout(() => resolve([]), 50)
      );

      const contributorsPromise = new Promise(resolve =>
        setTimeout(() => resolve(undefined), 75)
      );

      const commitsPromise = new Promise(resolve =>
        setTimeout(() => resolve(undefined), 25)
      );

      mockMetricsService.syncRepositoryMetrics.mockReturnValue(
        metricsPromise as any
      );

      mockMetricsService.syncPullRequests.mockReturnValue(
        pullRequestsPromise as any
      );

      mockMetricsService.syncContributors.mockReturnValue(
        contributorsPromise as any
      );

      mockMetricsService.syncCommitAnalytics.mockReturnValue(
        commitsPromise as any
      );

      const startTime = Date.now();
      await analyticsService.syncRepositoryData('repo-123');
      const endTime = Date.now();

      // Should complete in ~100ms (the longest operation) not 250ms (sum of all)
      expect(endTime - startTime).toBeLessThan(150);
    });
  });
});
