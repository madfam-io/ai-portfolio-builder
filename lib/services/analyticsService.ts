import { GitHubAnalyticsClient } from '@/lib/analytics/github/client';
import { logger } from '@/lib/utils/logger';

import { DashboardAnalyticsService } from './analytics/DashboardAnalyticsService';
import { MetricsCalculationService } from './analytics/MetricsCalculationService';
import { RepositoryAnalyticsService } from './analytics/RepositoryAnalyticsService';

import type {
  Repository,
  CodeMetrics,
  PullRequest,
  AnalyticsDashboardData,
  RepositoryAnalytics,
} from '@/types/analytics';

/**
 * @fileoverview Analytics Service
 *
 * Main service layer for GitHub analytics operations.
 * Coordinates between specialized services for different analytics domains.
 *
 * @author PRISMA Development Team
 * @version 0.0.1-alpha
 */

/**
 * Analytics Service
 *
 * Provides high-level methods for analytics operations.
 * Delegates to specialized services for repository, metrics, and dashboard operations.
 */
export class AnalyticsService {
  private githubClient: GitHubAnalyticsClient;
  private userId: string;
  private repositoryService: RepositoryAnalyticsService;
  private metricsService: MetricsCalculationService;
  private dashboardService: DashboardAnalyticsService;

  constructor(userId: string) {
    this.userId = userId;
    this.githubClient = new GitHubAnalyticsClient();
    this.repositoryService = new RepositoryAnalyticsService(
      userId,
      this.githubClient
    );
    this.metricsService = new MetricsCalculationService(
      userId,
      this.githubClient
    );
    this.dashboardService = new DashboardAnalyticsService(userId);
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    await this.githubClient.initialize(this.userId);
  }

  /**
   * Sync repositories from GitHub
   */
  async syncRepositories(): Promise<Repository[]> {
    return this.repositoryService.syncRepositories();
  }

  /**
   * Get user's repositories
   */
  async getRepositories(): Promise<Repository[]> {
    return this.repositoryService.getRepositories();
  }

  /**
   * Get repository by ID
   */
  async getRepository(repositoryId: string): Promise<Repository | null> {
    return this.repositoryService.getRepository(repositoryId);
  }

  /**
   * Sync repository metrics
   */
  async syncRepositoryMetrics(repositoryId: string): Promise<CodeMetrics> {
    const repository = await this.getRepository(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }
    return this.metricsService.syncRepositoryMetrics(repository);
  }

  /**
   * Sync pull requests for a repository
   */
  async syncPullRequests(repositoryId: string): Promise<PullRequest[]> {
    const repository = await this.getRepository(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }
    return this.metricsService.syncPullRequests(repository);
  }

  /**
   * Sync contributors for a repository
   */
  async syncContributors(repositoryId: string): Promise<void> {
    const repository = await this.getRepository(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }
    await this.metricsService.syncContributors(repository);
  }

  /**
   * Sync commit analytics for a repository
   */
  async syncCommitAnalytics(repositoryId: string, days = 30): Promise<void> {
    const repository = await this.getRepository(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }
    await this.metricsService.syncCommitAnalytics(repository, days);
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardData(): Promise<AnalyticsDashboardData> {
    try {
      const repositories = await this.getRepositories();
      return this.dashboardService.getDashboardData(repositories);
    } catch (error) {
      logger.error('Failed to get dashboard data', { error });
      throw error;
    }
  }

  /**
   * Get repository analytics
   */
  async getRepositoryAnalytics(
    repositoryId: string
  ): Promise<RepositoryAnalytics | null> {
    return this.repositoryService.getRepositoryAnalytics(repositoryId);
  }

  /**
   * Sync all data for a repository
   */
  async syncRepositoryData(
    repositoryId: string,
    options: {
      syncMetrics?: boolean;
      syncPullRequests?: boolean;
      syncContributors?: boolean;
      syncCommits?: boolean;
    } = {}
  ): Promise<void> {
    const {
      syncMetrics = true,
      syncPullRequests = true,
      syncContributors = true,
      syncCommits = true,
    } = options;

    const repository = await this.getRepository(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }

    const syncPromises: Promise<any>[] = [];

    if (syncMetrics) {
      syncPromises.push(this.metricsService.syncRepositoryMetrics(repository));
    }

    if (syncPullRequests) {
      syncPromises.push(this.metricsService.syncPullRequests(repository));
    }

    if (syncContributors) {
      syncPromises.push(this.metricsService.syncContributors(repository));
    }

    if (syncCommits) {
      syncPromises.push(this.metricsService.syncCommitAnalytics(repository));
    }

    await Promise.all(syncPromises);
  }
}