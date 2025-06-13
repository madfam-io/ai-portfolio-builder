import type {
  Repository,
  CodeMetrics,
  PullRequest,
  CommitAnalytics,
  AnalyticsDashboardData,
  RepositoryAnalytics,

import { GitHubAnalyticsClient } from '@/lib/analytics/github/client';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
} from '@/types/analytics';

/**
 * @fileoverview Analytics Service
 *
 * Service layer for GitHub analytics operations.
 * Handles data fetching, processing, and caching.
 *
 * @author PRISMA Development Team
 * @version 0.0.1-alpha
 */

/**
 * Analytics Service
 *
 * Provides high-level methods for analytics operations.
 * Coordinates between GitHub API, database, and cache layers.
 */
export class AnalyticsService {
  private githubClient: GitHubAnalyticsClient;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.githubClient = new GitHubAnalyticsClient();
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
    const supabase = await createClient();

    if (!supabase) {
      throw new Error('Database connection not available');
    }

    try {
      // Get GitHub integration
      const { data: integration } = await supabase
        .from('github_integrations')
        .select('id')
        .eq('user_id', this.userId)
        .single();

      if (!integration) {
        throw new Error('No GitHub integration found');
      }

      // Fetch repositories from GitHub
      const githubRepos = await this.githubClient.fetchRepositories();

      // Upsert repositories to database in parallel
      const repositoryPromises = githubRepos.map(async githubRepo => {
        const repoData = GitHubAnalyticsClient.transformRepository(
          githubRepo,
          this.userId,
          integration.id
        );

        const { data: repo, error } = await supabase
          .from('repositories')
          .upsert({
            ...repoData,
            last_synced_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          logger.error('Failed to upsert repository', { error, repoData });
          return null;
        }

        return repo as Repository;
      });

      const repositoryResults = await Promise.all(repositoryPromises);
      const repositories = repositoryResults.filter(
        (repo): repo is Repository => repo !== null
      );

      // Update integration last synced time
      await supabase
        .from('github_integrations')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', integration.id);

      return repositories;
    } catch (error) {
      logger.error('Failed to sync repositories', { error });
      throw error;
    }
  }

  /**
   * Get user's repositories
   */
  async getRepositories(): Promise<Repository[]> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch repositories', { error });
      throw error;
    }

    return data as Repository[];
  }

  /**
   * Get repository by ID
   */
  async getRepository(repositoryId: string): Promise<Repository | null> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .eq('id', repositoryId)
      .eq('user_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      logger.error('Failed to fetch repository', { error });
      throw error;
    }

    return data as Repository;
  }

  /**
   * Sync repository metrics
   */
  async syncRepositoryMetrics(repositoryId: string): Promise<CodeMetrics> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // Get repository details
    const repository = await this.getRepository(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }

    try {
      // Fetch languages from GitHub
      const languages = await this.githubClient.fetchLanguages(
        repository.owner,
        repository.name
      );

      // Calculate total lines of code
      const locTotal = Object.values(languages).reduce(
        (sum, lines) => sum + lines,
        0
      );

      // Fetch recent commits for activity metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const commits = await this.githubClient.fetchCommits(
        repository.owner,
        repository.name,
        { since: thirtyDaysAgo }
      );

      // Get unique contributors
      const uniqueContributors = new Set(
        commits
          .map(commit => commit.author?.login || commit.commit.author.email)
          .filter(Boolean)
      );

      // Create or update today's metrics
      const today = new Date().toISOString().split('T')[0];

      const metricsData = {
        repository_id: repositoryId,
        metric_date: today,
        loc_total: locTotal,
        loc_by_language: languages,
        file_count: Object.keys(languages).length,
        commit_count: commits.length,
        contributor_count: uniqueContributors.size,
        commits_last_30_days: commits.length,
        contributors_last_30_days: uniqueContributors.size,
        calculated_at: new Date().toISOString(),
      };

      const { data: metrics, error } = await supabase
        .from('code_metrics')
        .upsert(metricsData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to upsert code metrics', { error });
        throw error;
      }

      return metrics as CodeMetrics;
    } catch (error) {
      logger.error('Failed to sync repository metrics', {
        repositoryId,
        error,
      });
      throw error;
    }
  }

  /**
   * Sync pull requests for a repository
   */
  async syncPullRequests(repositoryId: string): Promise<PullRequest[]> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // Get repository details
    const repository = await this.getRepository(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }

    try {
      // Fetch pull requests from GitHub
      const githubPRs = await this.githubClient.fetchPullRequests(
        repository.owner,
        repository.name,
        { state: 'all' }
      );

      const pullRequests: PullRequest[] = [];

      // Upsert pull requests to database
      for (const githubPR of githubPRs) {
        // Fetch detailed PR info for metrics
        const detailedPR = await this.githubClient.fetchPullRequestDetails(
          repository.owner,
          repository.name,
          githubPR.number
        );

        const prData = GitHubAnalyticsClient.transformPullRequest(
          detailedPR,
          repositoryId
        );

        const { data: pr, error } = await supabase
          .from('pull_requests')
          .upsert(prData)
          .select()
          .single();

        if (error) {
          logger.error('Failed to upsert pull request', { error, prData });
          continue;
        }

        pullRequests.push(pr as PullRequest);
      }

      return pullRequests;
    } catch (error) {
      logger.error('Failed to sync pull requests', { repositoryId, error });
      throw error;
    }
  }

  /**
   * Sync contributors for a repository
   */
  async syncContributors(repositoryId: string): Promise<void> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // Get repository details
    const repository = await this.getRepository(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }

    try {
      // Fetch contributors from GitHub
      const githubContributors = await this.githubClient.fetchContributors(
        repository.owner,
        repository.name
      );

      // Process each contributor
      for (const githubContributor of githubContributors) {
        // Fetch detailed user info
        const userDetails = await this.githubClient.fetchUser(
          githubContributor.login
        );

        // Upsert contributor
        const { data: contributor, error: contributorError } = await supabase
          .from('contributors')
          .upsert({
            github_id: userDetails.githubId,
            login: userDetails.login,
            name: userDetails.name,
            email: userDetails.email,
            avatar_url: userDetails.avatarUrl,
            company: userDetails.company,
            location: userDetails.location,
            bio: userDetails.bio,
            public_repos: userDetails.publicRepos,
            followers: userDetails.followers,
            following: userDetails.following,
            github_created_at: userDetails.githubCreatedAt,
            last_seen_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (contributorError) {
          logger.error('Failed to upsert contributor', { contributorError });
          continue;
        }

        // Link contributor to repository
        await supabase.from('repository_contributors').upsert({
          repository_id: repositoryId,
          contributor_id: contributor.id,
          commit_count: githubContributor.contributions,
          is_active: true,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('Failed to sync contributors', { repositoryId, error });
      throw error;
    }
  }

  /**
   * Sync commit analytics for a repository
   */
  async syncCommitAnalytics(repositoryId: string, days = 30): Promise<void> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // Get repository details
    const repository = await this.getRepository(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch commits from GitHub
      if (!repository.owner || !repository.name) {
        throw new Error('Repository owner or name is missing');
      }

      const commits = await this.githubClient.fetchCommits(
        repository.owner!,
        repository.name!,
        { since: startDate, until: endDate }
      );

      // Group commits by date
      const commitsByDate = new Map<string, any[]>();

      commits.forEach(commit => {
        const authorDate = commit.commit.author.date;
        if (!authorDate) return;

        const isoDate = new Date(authorDate).toISOString();
        const date = isoDate.split('T')[0];
        if (!date) return;

        if (!commitsByDate.has(date)) {
          commitsByDate.set(date, []);
        }
        commitsByDate.get(date)!.push(commit);
      });

      // Create analytics entries
      for (const [date, dateCommits] of commitsByDate) {
        const uniqueAuthors = new Set(
          dateCommits.map(c => c.author?.login || c.commit.author.email)
        );

        const additions = dateCommits.reduce(
          (sum, c) => sum + (c.stats?.additions || 0),
          0
        );
        const deletions = dateCommits.reduce(
          (sum, c) => sum + (c.stats?.deletions || 0),
          0
        );

        // Find peak hour
        const hourCounts = new Map<number, number>();
        dateCommits.forEach(commit => {
          const hour = new Date(commit.commit.author.date).getHours();
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        });

        const peakHour = Array.from(hourCounts.entries()).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0];

        await supabase.from('commit_analytics').upsert({
          repository_id: repositoryId,
          commit_date: date,
          commit_count: dateCommits.length,
          unique_authors: uniqueAuthors.size,
          additions,
          deletions,
          peak_hour: peakHour,
        });
      }
    } catch (error) {
      logger.error('Failed to sync commit analytics', { repositoryId, error });
      throw error;
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardData(): Promise<AnalyticsDashboardData> {
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    try {
      // Fetch all user repositories
      const repositories = await this.getRepositories();

      // Fetch aggregated metrics
      const { data: metricsData } = await supabase
        .from('code_metrics')
        .select('*')
        .in(
          'repository_id',
          repositories.map(r => r.id)
        )
        .order('metric_date', { ascending: false });

      const metrics = (metricsData as CodeMetrics[]) || [];

      // Fetch recent pull requests
      const { data: prData } = await supabase
        .from('pull_requests')
        .select('*')
        .in(
          'repository_id',
          repositories.map(r => r.id)
        )
        .order('created_at', { ascending: false })
        .limit(10);

      const pullRequests = (prData as PullRequest[]) || [];

      // Fetch top contributors
      const { data: contributorData } = await supabase
        .from('repository_contributors')
        .select(
          `
          *,
          contributor:contributors(*)
        `
        )
        .in(
          'repository_id',
          repositories.map(r => r.id)
        )
        .order('commit_count', { ascending: false })
        .limit(5);

      // Fetch commit trends
      const { data: commitData } = await supabase
        .from('commit_analytics')
        .select('*')
        .in(
          'repository_id',
          repositories.map(r => r.id)
        )
        .gte(
          'commit_date',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        )
        .order('commit_date', { ascending: true });

      const commitAnalytics = (commitData as CommitAnalytics[]) || [];

      // Calculate overview stats
      const totalLOC = metrics.reduce((sum, m) => sum + (m.locTotal || 0), 0);
      const totalCommits = metrics.reduce(
        (sum, m) => sum + (m.commitCount || 0),
        0
      );
      const totalContributors = new Set(
        contributorData?.map((rc: unknown) => rc.contributor?.id).filter(Boolean) ||
          []
      ).size;

      // Find most active repository
      const repoActivity = new Map<string, number>();
      metrics.forEach(m => {
        const current = repoActivity.get(m.repositoryId) || 0;
        repoActivity.set(m.repositoryId, current + (m.commitCount || 0));
      });

      const mostActiveRepoId = Array.from(repoActivity.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0];

      const mostActiveRepository = repositories.find(
        r => r.id === mostActiveRepoId
      );

      // Group commits by day using Map for O(n) performance
      const commitsByDayMap = new Map<string, number>();
      commitAnalytics.forEach(ca => {
        const currentCount = commitsByDayMap.get(ca.commitDate) || 0;
        commitsByDayMap.set(ca.commitDate, currentCount + ca.commitCount);
      });

      const commitsPerDay = Array.from(commitsByDayMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Group PRs by week
      const prsByWeek = new Map<
        string,
        { opened: number; merged: number; closed: number }
      >();
      pullRequests.forEach(pr => {
        if (!pr.createdAt) return;

        const week = getWeekString(new Date(pr.createdAt));
        if (!prsByWeek.has(week)) {
          prsByWeek.set(week, { opened: 0, merged: 0, closed: 0 });
        }

        const weekData = prsByWeek.get(week)!;
        weekData.opened++;
        if (pr.state === 'merged') weekData.merged++;
        if (pr.state === 'closed') weekData.closed++;
      });

      const pullRequestsPerWeek = Array.from(prsByWeek.entries())
        .map(([week, data]) => ({ week, ...data }))
        .sort((a, b) => a.week.localeCompare(b.week));

      return {
        repositories,
        overview: {
          totalRepositories: repositories.length,
          totalCommits,
          totalPullRequests: pullRequests.length,
          totalContributors,
          totalLinesOfCode: totalLOC,
          mostActiveRepository: mostActiveRepository
            ? {
                repository: mostActiveRepository,
                commitCount: repoActivity.get(mostActiveRepoId!) || 0,
              }
            : undefined,
          topContributors:
            contributorData?.slice(0, 5).map((rc: unknown) => ({
              contributor: rc.contributor,
              commitCount: rc.commit_count,
            })) || [],
        },
        recentActivity: {
          commits: commitAnalytics.slice(0, 7),
          pullRequests: pullRequests.slice(0, 5),
        },
        trends: {
          commitsPerDay,
          pullRequestsPerWeek,
        },
      };
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
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const repository = await this.getRepository(repositoryId);
    if (!repository) return null;

    try {
      // Fetch current and historical metrics
      const { data: metricsData } = await supabase
        .from('code_metrics')
        .select('*')
        .eq('repository_id', repositoryId)
        .order('metric_date', { ascending: false })
        .limit(30);

      const metrics = (metricsData as CodeMetrics[]) || [];
      const currentMetrics = metrics[0];

      // Fetch contributors
      const { data: contributorData } = await supabase
        .from('repository_contributors')
        .select(
          `
          *,
          contributor:contributors(*)
        `
        )
        .eq('repository_id', repositoryId)
        .order('commit_count', { ascending: false });

      // Fetch pull requests
      const { data: prData } = await supabase
        .from('pull_requests')
        .select('*')
        .eq('repository_id', repositoryId)
        .order('created_at', { ascending: false })
        .limit(20);

      const pullRequests = (prData as PullRequest[]) || [];

      // Calculate PR stats
      const mergedPRs = pullRequests.filter(pr => pr.state === 'merged');
      const avgCycleTime =
        mergedPRs.length > 0
          ? mergedPRs.reduce((sum, pr) => sum + (pr.cycleTimeHours || 0), 0) /
            mergedPRs.length
          : 0;
      const avgLeadTime =
        mergedPRs.length > 0
          ? mergedPRs.reduce((sum, pr) => sum + (pr.leadTimeHours || 0), 0) /
            mergedPRs.length
          : 0;
      const mergeRate =
        pullRequests.length > 0
          ? (mergedPRs.length / pullRequests.length) * 100
          : 0;

      // Fetch commit analytics
      const { data: commitData } = await supabase
        .from('commit_analytics')
        .select('*')
        .eq('repository_id', repositoryId)
        .order('commit_date', { ascending: false })
        .limit(30);

      const commitAnalytics = (commitData as CommitAnalytics[]) || [];

      // Calculate commit patterns
      const commitsByHour = new Array(24).fill(0);
      const commitsByAuthor = new Map<string, number>();

      commitAnalytics.forEach(ca => {
        if (ca.peakHour !== null && ca.peakHour !== undefined) {
          commitsByHour[ca.peakHour] += ca.commitCount;
        }
      });

      // Calculate languages breakdown
      const languages = currentMetrics?.locByLanguage || {};
      const totalLines = Object.values(languages).reduce(
        (sum, lines) => sum + lines,
        0
      );
      const languageBreakdown = Object.entries(languages).map(
        ([language, lines]) => ({
          language,
          lines,
          percentage: totalLines > 0 ? (lines / totalLines) * 100 : 0,
        })
      );

      return {
        repository,
        metrics: {
          current: currentMetrics || null,
          history: metrics,
        },
        contributors:
          contributorData?.map((rc: unknown) => ({
            contributor: rc.contributor,
            stats: rc,
          })) || [],
        pullRequests: {
          recent: pullRequests,
          stats: {
            averageCycleTime: avgCycleTime,
            averageLeadTime: avgLeadTime,
            mergeRate,
            averageTimeToFirstReview: 0, // TODO: Calculate this
          },
        },
        commits: {
          byDay: commitAnalytics,
          byHour: commitsByHour.map((count, hour) => ({ hour, count })),
          byAuthor: Array.from(commitsByAuthor.entries()).map(
            ([author, count]) => ({
              author,
              count,
            })
          ),
        },
        languages: languageBreakdown,
      };
    } catch (error) {
      logger.error('Failed to get repository analytics', {
        repositoryId,
        error,
      });
      throw error;
    }
  }
}

/**
 * Get week string in YYYY-WW format
 */
function getWeekString(date: Date): string {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const days = Math.floor(
    (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}
