/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * @fileoverview Analytics English translations
 * @module i18n/translations/en/analytics
 */

export default {
  // Page titles
  analytics: 'Analytics',
  analyticsDashboard: 'Analytics Dashboard',
  analyticsTitle: 'Analytics Panel',
  analyticsSubtitle: 'GitHub repository insights and development metrics',
  githubAnalytics: 'GitHub Analytics',

  // Actions
  connectGitHub: 'Connect GitHub',
  connectWithGithub: 'Connect with GitHub',
  connectYourGithub:
    'Connect your GitHub account to analyze your repositories and get detailed development insights.',
  syncRepositories: 'Sync Repositories',
  sync: 'Sync',
  syncing: 'Syncing...',

  // Metrics
  repositories: 'Repositories',
  commits: 'Commits',
  pullRequests: 'Pull Requests',
  contributors: 'Contributors',
  linesOfCode: 'Lines of Code',
  codeMetrics: 'Code Metrics',

  // Repository info
  repositoryAnalytics: 'Repository Analytics',
  yourRepositories: 'Your Repositories',
  topContributors: 'Top Contributors',
  mostActiveRepository: 'Most Active Repository',
  commitsOverTime: 'Commits Over Time',
  pullRequestTrends: 'Pull Request Trends',
  viewDetails: 'View Details',
  private: 'Private',
  noDescription: 'No description',

  // Loading states
  loadingDashboard: 'Loading analytics dashboard...',
  loadingCommitsChart: 'Loading commits chart...',
  loadingPullRequestsChart: 'Loading pull requests chart...',

  // Repository detail page
  loading: 'Loading...',
  loadingRepository: 'Loading repository...',
  loadingAnalytics: 'Loading repository analytics...',
  errorLoadingRepository: 'Error loading repository',
  backToAnalytics: 'Back to Analytics',
  noDescriptionAvailable: 'No description available',
  viewOnGitHub: 'View on GitHub',
  syncData: 'Sync Data',
  lastUpdated: 'Last updated',
  stars: 'Stars',
  forks: 'Forks',
  watchers: 'Watchers',
  issues: 'Issues',
  language: 'Language',
  createdAt: 'Created at',
  updatedAt: 'Updated at',
  homepage: 'Homepage',
  topics: 'Topics',
  license: 'License',
  visibility: 'Visibility',
  public: 'Public',

  // Metrics details
  totalCommits: 'Total Commits',
  totalLOC: 'Total LOC',
  commitsLast30Days: 'Commits (30d)',
  recentPRs: 'Recent PRs',
  totalPullRequests: 'Total Pull Requests',
  openIssues: 'Open Issues',
  closedIssues: 'Closed Issues',
  averageCommitsPerDay: 'Average Commits/Day',
  contributorActivity: 'Contributor Activity',

  // Chart labels
  commitsPerMonth: 'Commits per Month',
  pullRequestsPerMonth: 'Pull Requests per Month',
  issuesOverTime: 'Issues Over Time',
  codeFrequency: 'Code Frequency',
  commitActivity: 'Commit Activity',
  languageDistribution: 'Language Distribution',
  recentPullRequests: 'Recent Pull Requests',

  // Device dimensions
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',

  // Time periods
  lastWeek: 'Last Week',
  lastMonth: 'Last Month',
  lastYear: 'Last Year',
  allTime: 'All Time',

  // Errors
  githubIntegrationRequired: 'GitHub integration required',
  githubAuthDenied: 'GitHub authorization was denied. Please try again.',
  invalidCallback:
    'Invalid OAuth callback. Please try connecting GitHub again.',
  failedTokenExchange: 'Failed to exchange OAuth token. Please try again.',
  error: 'Error',
  tryAgain: 'Try Again',
  notFound: 'Not found',
  repositoryNotFound: 'Repository not found',
  failedToFetchAnalytics: 'Failed to fetch repository analytics',
  failedToSync: 'Failed to sync repository',

  // Pull Request Metrics
  pullRequestMetrics: 'Pull Request Metrics',
  avgCycleTime: 'Avg Cycle Time',
  avgLeadTime: 'Avg Lead Time',
  mergeRate: 'Merge Rate',
  timeToReview: 'Time to Review',

  // Pull Request States
  merged: 'merged',
  open: 'open',
  closed: 'closed',

  // Contributors
  by: 'by',
  commitsWithChanges: 'commits',

  // Formatting
  notAvailable: 'N/A',
  pullRequestNumber: '#{number}',
  codeChanges: '+{additions} -{deletions}',
} as const;
