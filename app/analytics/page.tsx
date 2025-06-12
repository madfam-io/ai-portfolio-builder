/**
 * @fileoverview Analytics Dashboard Page
 *
 * Main analytics dashboard for GitHub repository insights.
 * Provides overview metrics, repository selection, and visualizations.
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';
import {
  FiGithub,
  FiActivity,
  FiGitPullRequest,
  FiUsers,
  FiCode,
  FiRefreshCw,
  FiTrendingUp,
  FiAlertCircle,
} from 'react-icons/fi';

import { ContributorsList } from '@/components/analytics/ContributorsList';
import { RepositoryList } from '@/components/analytics/RepositoryList';
import { StatsCard } from '@/components/analytics/StatsCard';
import BaseLayout from '@/components/layouts/BaseLayout';
import { LazyWrapper } from '@/components/shared/LazyWrapper';
import { usePerformanceTracking } from '@/lib/utils/performance';

import type { AnalyticsDashboardData } from '@/types/analytics';

interface DashboardApiResponse {
  data?: AnalyticsDashboardData;
  error?: string;
  requiresAuth?: boolean;
}

interface RepositoriesApiResponse {
  repositories?: unknown[];
  error?: string;
  requiresAuth?: boolean;
}

interface DashboardState {
  data: AnalyticsDashboardData | null;
  loading: boolean;
  error: string | null;
  needsAuth: boolean;
  syncing: boolean;
}

/**
 * Analytics Dashboard Component
 * Handles GitHub integration, data fetching, and visualization
 */
function AnalyticsDashboard(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  usePerformanceTracking('AnalyticsDashboard');

  // Dashboard state management
  const [dashboard, setDashboard] = useState<DashboardState>({
    data: null,
    loading: true,
    error: null,
    needsAuth: false,
    syncing: false,
  });

  // const [selectedRepo, setSelectedRepo] = useState<string>('all');

  // Check for OAuth callback messages
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected === 'true') {
      // Successfully connected, fetch data
      void fetchDashboardData();
      // Clean up URL
      router.replace('/analytics');
    } else if (error !== null && error !== '') {
      setDashboard(prev => ({
        ...prev,
        error: getErrorMessage(error),
        loading: false,
      }));
    }
  }, [searchParams, router]);

  // Fetch dashboard data on mount
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (
      (connected === null || connected === '') &&
      (error === null || error === '')
    ) {
      void fetchDashboardData();
    }
  }, [searchParams]);

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      oauth_denied: 'GitHub authorization was denied. Please try again.',
      invalid_callback: 'Invalid OAuth callback. Please try again.',
      invalid_state: 'Invalid OAuth state. Please try again.',
      token_exchange_failed:
        'Failed to exchange OAuth token. Please try again.',
      user_fetch_failed: 'Failed to fetch GitHub user information.',
      integration_store_failed: 'Failed to store GitHub integration.',
      callback_failed: 'OAuth callback failed. Please try again.',
    };
    return errorMessages[errorCode] ?? 'An unknown error occurred.';
  };

  /**
   * Fetch dashboard data from API
   * Handles authentication state and error cases
   */
  const fetchDashboardData = async (): Promise<void> => {
    try {
      setDashboard(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/analytics/dashboard');
      const result: DashboardApiResponse = await response.json();

      if (!response.ok) {
        // Check if user needs to authenticate with GitHub
        if (result.requiresAuth === true) {
          setDashboard(prev => ({
            ...prev,
            loading: false,
            needsAuth: true,
            error: null,
          }));
          return;
        }
        throw new Error(result.error ?? 'Failed to fetch dashboard data');
      }

      setDashboard(prev => ({
        ...prev,
        data: result.data ?? null,
        loading: false,
        error: null,
        needsAuth: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      setDashboard(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  /**
   * Initiate GitHub OAuth flow
   */
  const connectGitHub = async (): Promise<void> => {
    try {
      const response = await fetch('/api/integrations/github/auth');
      const result: { error?: string; url?: string } = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to initiate GitHub OAuth');
      }

      // Redirect to GitHub OAuth
      if (result.url !== undefined && result.url !== null) {
        window.location.href = result.url;
      }
    } catch (error) {
      setDashboard(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  /**
   * Sync repositories from GitHub
   */
  const syncRepositories = async (force = false): Promise<void> => {
    try {
      setDashboard(prev => ({ ...prev, syncing: true }));

      const response = await fetch('/api/analytics/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force }),
      });

      const result: RepositoriesApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to sync repositories');
      }

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error) {
      setDashboard(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    } finally {
      setDashboard(prev => ({ ...prev, syncing: false }));
    }
  };

  /**
   * Colors for charts
   */
  // Chart color theme - consistent with brand colors
  const chartColors = {
    primary: '#8b5cf6', // Purple - main brand color
    secondary: '#06b6d4', // Cyan - secondary accent
    accent: '#10b981', // Green - positive metrics
    warning: '#f59e0b', // Amber - warnings
    danger: '#ef4444', // Red - errors/critical
  };

  // Loading state
  if (dashboard.loading) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FiRefreshCw className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading analytics dashboard...
            </p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  // GitHub connection required
  if (dashboard.needsAuth) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <FiGithub className="text-6xl text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Connect GitHub
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your GitHub account to analyze your repositories and get
              insights into your development metrics.
            </p>
            <button
              onClick={connectGitHub}
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FiGithub className="mr-2" />
              Connect with GitHub
            </button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  // Error state
  if (dashboard.error !== null && dashboard.error !== '') {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <FiAlertCircle className="text-6xl text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {dashboard.error}
            </p>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FiRefreshCw className="mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  const data = dashboard.data as AnalyticsDashboardData;

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  GitHub repository insights and development metrics
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => syncRepositories()}
                  disabled={dashboard.syncing}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <FiRefreshCw
                    className={`mr-2 ${dashboard.syncing ? 'animate-spin' : ''}`}
                  />
                  {dashboard.syncing ? 'Syncing...' : 'Sync'}
                </button>
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatsCard
              icon={<FiCode />}
              label="Repositories"
              value={data.overview.totalRepositories}
              iconBgColor="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600"
            />
            <StatsCard
              icon={<FiActivity />}
              label="Commits"
              value={data.overview.totalCommits.toLocaleString()}
              iconBgColor="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600"
            />
            <StatsCard
              icon={<FiGitPullRequest />}
              label="Pull Requests"
              value={data.overview.totalPullRequests}
              iconBgColor="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600"
            />
            <StatsCard
              icon={<FiUsers />}
              label="Contributors"
              value={data.overview.totalContributors}
              iconBgColor="bg-yellow-100 dark:bg-yellow-900/30"
              iconColor="text-yellow-600"
            />
            <StatsCard
              icon={<FiTrendingUp />}
              label="Lines of Code"
              value={`${(data.overview.totalLinesOfCode / 1000).toFixed(1)}K`}
              iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
              iconColor="text-indigo-600"
            />
          </div>

          {/* Charts Grid - Lazy Loaded for Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Commits Trend Chart */}
            <LazyWrapper
              component={() => import('@/components/analytics/CommitsChart')}
              componentProps={{
                data: data.trends.commitsPerDay,
                chartColors,
              }}
              fallback={
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-80 flex items-center justify-center">
                  <div className="text-center">
                    <FiRefreshCw className="animate-spin text-2xl text-purple-600 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Loading commits chart...
                    </p>
                  </div>
                </div>
              }
            />

            {/* Pull Requests Chart */}
            <LazyWrapper
              component={() =>
                import('@/components/analytics/PullRequestsChart')
              }
              componentProps={{
                data: data.trends.pullRequestsPerWeek,
                chartColors: {
                  primary: chartColors.primary,
                  accent: chartColors.accent,
                  warning: chartColors.warning,
                },
              }}
              fallback={
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-80 flex items-center justify-center">
                  <div className="text-center">
                    <FiRefreshCw className="animate-spin text-2xl text-purple-600 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Loading pull requests chart...
                    </p>
                  </div>
                </div>
              }
            />
          </div>

          {/* Repositories and Contributors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Top Repositories */}
            <RepositoryList
              repositories={data.repositories}
              title="Your Repositories"
              maxItems={10}
            />

            {/* Top Contributors */}
            <ContributorsList contributors={data.overview.topContributors} />
          </div>

          {/* Most Active Repository */}
          {data.overview.mostActiveRepository && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Most Active Repository
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {data.overview.mostActiveRepository.repository.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {data.overview.mostActiveRepository.repository.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>
                      {data.overview.mostActiveRepository.commitCount} commits
                    </span>
                    <span>
                      ⭐{' '}
                      {
                        data.overview.mostActiveRepository.repository
                          .stargazersCount
                      }
                    </span>
                    <span>
                      🍴{' '}
                      {data.overview.mostActiveRepository.repository.forksCount}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    router.push(
                      `/analytics/repository/${data.overview.mostActiveRepository?.repository.id ?? ''}`
                    )
                  }
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
}

export default function AnalyticsPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading analytics...
            </p>
          </div>
        </div>
      }
    >
      <AnalyticsDashboard />
    </Suspense>
  );
}
