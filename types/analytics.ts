/**
 * Analytics-related type definitions for PRISMA
 * Enterprise GitHub Analytics Feature
 */

// GitHub Integration types
export type GitHubIntegrationStatus = 'active' | 'inactive' | 'expired' | 'revoked';
export type RepositoryVisibility = 'public' | 'private' | 'internal';
export type PullRequestState = 'open' | 'closed' | 'merged';

/**
 * GitHub OAuth integration settings
 */
export interface GitHubIntegration {
  id: string;
  userId: string;
  githubUserId?: number;
  githubUsername?: string;
  status: GitHubIntegrationStatus;
  permissions: Record<string, string>;
  scope?: string;
  rateLimitRemaining?: number;
  rateLimitResetAt?: Date;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GitHub Repository information
 */
export interface Repository {
  id: string;
  userId: string;
  githubIntegrationId: string;
  githubId: number;
  owner: string;
  name: string;
  fullName: string;
  description?: string;
  homepage?: string;
  visibility: RepositoryVisibility;
  defaultBranch: string;
  language?: string;
  topics?: string[];
  sizeKb?: number;
  stargazersCount: number;
  watchersCount: number;
  forksCount: number;
  openIssuesCount: number;
  isActive: boolean;
  syncEnabled: boolean;
  metadata: Record<string, any>;
  githubCreatedAt?: Date;
  githubUpdatedAt?: Date;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Code metrics snapshot
 */
export interface CodeMetrics {
  id: string;
  repositoryId: string;
  metricDate: string; // YYYY-MM-DD
  locTotal?: number;
  locByLanguage: Record<string, number>;
  fileCount?: number;
  commitCount?: number;
  contributorCount?: number;
  commitsLast30Days?: number;
  contributorsLast30Days?: number;
  calculatedAt: Date;
  createdAt: Date;
}

/**
 * Pull Request information and metrics
 */
export interface PullRequest {
  id: string;
  repositoryId: string;
  githubPrId: number;
  number: number;
  title?: string;
  body?: string;
  authorLogin?: string;
  authorAvatarUrl?: string;
  state: PullRequestState;
  draft: boolean;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
  reviewComments: number;
  createdAt?: Date;
  updatedAt?: Date;
  mergedAt?: Date;
  closedAt?: Date;
  firstReviewAt?: Date;
  leadTimeHours?: number;
  cycleTimeHours?: number;
  timeToFirstReviewHours?: number;
  labels: string[];
  metadata: Record<string, any>;
}

/**
 * GitHub Contributor information
 */
export interface Contributor {
  id: string;
  githubId: number;
  login: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  company?: string;
  location?: string;
  bio?: string;
  publicRepos?: number;
  followers?: number;
  following?: number;
  githubCreatedAt?: Date;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository-Contributor relationship with metrics
 */
export interface RepositoryContributor {
  id: string;
  repositoryId: string;
  contributorId: string;
  commitCount: number;
  additions: number;
  deletions: number;
  firstCommitAt?: Date;
  lastCommitAt?: Date;
  isActive: boolean;
  commitsLast30Days: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregated commit analytics
 */
export interface CommitAnalytics {
  id: string;
  repositoryId: string;
  commitDate: string; // YYYY-MM-DD
  commitCount: number;
  uniqueAuthors: number;
  additions: number;
  deletions: number;
  peakHour?: number; // 0-23
  createdAt: Date;
}

// GitHub Activity types
export interface GitHubActivity {
  id: string;
  type: 'commit' | 'pull_request' | 'issue' | 'release' | 'push';
  actor: GitHubUserObject;
  repository: {
    name: string;
    full_name: string;
  };
  payload: Record<string, unknown>;
  created_at: string;
}

// Cache data types
export type DashboardCacheData = {
  metrics: AnalyticsMetrics;
  repositories: Repository[];
  recentActivity: GitHubActivity[];
};

export type RepositoryCacheData = {
  repository: Repository;
  commits: Commit[];
  pullRequests: PullRequest[];
  contributors: RepositoryContributor[];
  metrics: RepositoryMetrics;
};

export type ContributorCacheData = {
  contributor: Contributor;
  repositories: Repository[];
  metrics: ContributorMetrics;
};

export type AnalyticsCacheData = DashboardCacheData | RepositoryCacheData | ContributorCacheData;

/**
 * Analytics cache entry
 */
export interface AnalyticsCache {
  id: string;
  cacheKey: string;
  cacheType: 'dashboard' | 'repository' | 'contributor';
  repositoryId?: string;
  data: AnalyticsCacheData;
  expiresAt: Date;
  createdAt: Date;
}

// API Request/Response types

/**
 * GitHub OAuth callback response
 */
export interface GitHubOAuthCallbackResponse {
  success: boolean;
  integration?: GitHubIntegration;
  error?: string;
}

/**
 * Repository sync request
 */
export interface RepositorySyncRequest {
  repositoryIds?: string[]; // If empty, sync all
  force?: boolean; // Force sync even if recently synced
}

/**
 * Repository sync response
 */
export interface RepositorySyncResponse {
  success: boolean;
  syncedCount: number;
  errors?: Array<{
    repositoryId: string;
    error: string;
  }>;
}

/**
 * Analytics dashboard data
 */
export interface AnalyticsDashboardData {
  repositories: Repository[];
  overview: {
    totalRepositories: number;
    totalCommits: number;
    totalPullRequests: number;
    totalContributors: number;
    totalLinesOfCode: number;
    mostActiveRepository?: {
      repository: Repository;
      commitCount: number;
    };
    topContributors: Array<{
      contributor: Contributor;
      commitCount: number;
    }>;
  };
  recentActivity: {
    commits: CommitAnalytics[];
    pullRequests: PullRequest[];
  };
  trends: {
    commitsPerDay: Array<{
      date: string;
      count: number;
    }>;
    pullRequestsPerWeek: Array<{
      week: string;
      opened: number;
      merged: number;
      closed: number;
    }>;
  };
}

/**
 * Repository analytics detail
 */
export interface RepositoryAnalytics {
  repository: Repository;
  metrics: {
    current: CodeMetrics | null;
    history: CodeMetrics[];
  };
  contributors: Array<{
    contributor: Contributor;
    stats: RepositoryContributor;
  }>;
  pullRequests: {
    recent: PullRequest[];
    stats: {
      averageCycleTime: number;
      averageLeadTime: number;
      mergeRate: number;
      averageTimeToFirstReview: number;
    };
  };
  commits: {
    byDay: CommitAnalytics[];
    byHour: Array<{
      hour: number;
      count: number;
    }>;
    byAuthor: Array<{
      author: string;
      count: number;
    }>;
  };
  languages: Array<{
    language: string;
    lines: number;
    percentage: number;
  }>;
}

/**
 * Contributor analytics detail
 */
export interface ContributorAnalytics {
  contributor: Contributor;
  repositories: Array<{
    repository: Repository;
    stats: RepositoryContributor;
  }>;
  activity: {
    totalCommits: number;
    totalAdditions: number;
    totalDeletions: number;
    activeRepositories: number;
    contributionStreak: number;
    mostProductiveDay: string; // Day of week
    mostProductiveHour: number; // 0-23
  };
  timeline: Array<{
    date: string;
    commitCount: number;
    additions: number;
    deletions: number;
  }>;
}

/**
 * Analytics filter options
 */
export interface AnalyticsFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  repositories?: string[];
  contributors?: string[];
  languages?: string[];
  includePrivate?: boolean;
}

/**
 * Analytics export request
 */
export interface AnalyticsExportRequest {
  format: 'pdf' | 'csv' | 'json';
  type: 'dashboard' | 'repository' | 'contributor';
  entityId?: string; // Repository or contributor ID
  filters?: AnalyticsFilters;
  includeCharts?: boolean; // For PDF
}

// GitHub API object interfaces
export interface GitHubRepositoryObject {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
  };
  description?: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
  language?: string;
  topics?: string[];
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubPullRequestObject {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  merged: boolean;
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  created_at: string;
  updated_at: string;
  closed_at?: string;
  merged_at?: string;
  html_url: string;
}

export interface GitHubUserObject {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Bot';
}

export interface GitHubInstallationObject {
  id: number;
  account: GitHubUserObject;
  app_id: number;
  target_type: string;
  permissions: Record<string, string>;
}

/**
 * Analytics webhook payload
 */
export interface GitHubWebhookPayload {
  action: string;
  repository?: GitHubRepositoryObject;
  pull_request?: GitHubPullRequestObject;
  sender?: GitHubUserObject;
  installation?: GitHubInstallationObject;
}

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  used: number;
}

/**
 * Analytics error
 */
export interface AnalyticsError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}