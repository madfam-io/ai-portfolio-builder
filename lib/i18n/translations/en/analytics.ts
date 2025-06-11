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

  // Errors
  githubIntegrationRequired: 'GitHub integration required',
  githubAuthDenied: 'GitHub authorization was denied. Please try again.',
  invalidCallback:
    'Invalid OAuth callback. Please try connecting GitHub again.',
  failedTokenExchange: 'Failed to exchange OAuth token. Please try again.',
  error: 'Error',
  tryAgain: 'Try Again',
} as const;
