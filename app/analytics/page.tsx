/**
 * @fileoverview Analytics Dashboard Page
 *
 * Main analytics dashboard for GitHub repository insights.
 * Provides overview metrics, repository selection, and visualizations.
 *
 * @author PRISMA Development Team
 * @version 0.0.1-alpha - Phase 1 MVP
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BaseLayout from '@/components/layouts/BaseLayout';
import { LazyWrapper } from '@/components/shared/LazyWrapper';
import { usePerformanceTracking } from '@/lib/utils/performance';
import {
  FiGithub,
  FiActivity,
  FiGitPullRequest,
  FiUsers,
  FiCode,
  FiRefreshCw,
  FiTrendingUp,
  FiExternalLink,
  FiAlertCircle,
} from 'react-icons/fi';
import type { AnalyticsDashboardData } from '@/types/analytics';

// Dashboard state type
interface DashboardState {
  data: AnalyticsDashboardData | null;
  loading: boolean;
  error: string | null;
  needsAuth: boolean;
  syncing: boolean;
}

/**
 * Analytics Dashboard Component with Search Params
 */
function AnalyticsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  usePerformanceTracking('AnalyticsDashboard');

  // State management
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
      fetchDashboardData();
      // Clean up URL
      router.replace('/analytics');
    } else if (error) {
      setDashboard(prev => ({
        ...prev,
        error: getErrorMessage(error),
        loading: false,
      }));
    }
  }, [searchParams, router]);

  // Fetch dashboard data on mount
  useEffect(() => {
    if (!searchParams.get('connected') && !searchParams.get('error')) {
      fetchDashboardData();
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
    return errorMessages[errorCode] || 'An unknown error occurred.';
  };

  /**
   * Fetch dashboard data from API
   */
  const fetchDashboardData = async () => {
    try {
      setDashboard(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/analytics/dashboard');
      const result = await response.json();

      if (!response.ok) {
        if (result.requiresAuth) {
          setDashboard(prev => ({
            ...prev,
            loading: false,
            needsAuth: true,
            error: null,
          }));
          return;
        }
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      setDashboard(prev => ({
        ...prev,
        data: result.data,
        loading: false,
        error: null,
        needsAuth: false,
      }));
    } catch (error: any) {
      setDashboard(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  /**
   * Initiate GitHub OAuth flow
   */
  const connectGitHub = async () => {
    try {
      const response = await fetch('/api/integrations/github/auth');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initiate GitHub OAuth');
      }

      // Redirect to GitHub OAuth
      window.location.href = result.authUrl;
    } catch (error: any) {
      setDashboard(prev => ({
        ...prev,
        error: error.message,
      }));
    }
  };

  /**
   * Sync repositories from GitHub
   */
  const syncRepositories = async (force = false) => {
    try {
      setDashboard(prev => ({ ...prev, syncing: true }));

      const response = await fetch('/api/analytics/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync repositories');
      }

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error: any) {
      setDashboard(prev => ({
        ...prev,
        error: error.message,
      }));
    } finally {
      setDashboard(prev => ({ ...prev, syncing: false }));
    }
  };

  /**
   * Colors for charts
   */
  const chartColors = {
    primary: '#8b5cf6', // Purple theme
    secondary: '#06b6d4',
    accent: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  // const pieColors = [chartColors.primary, chartColors.secondary, chartColors.accent, chartColors.warning, chartColors.danger];

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
  if (dashboard.error) {
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

  const data = dashboard.data!;

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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FiCode className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Repositories
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.overview.totalRepositories}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiActivity className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Commits
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.overview.totalCommits.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FiGitPullRequest className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pull Requests
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.overview.totalPullRequests}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <FiUsers className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Contributors
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.overview.totalContributors}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <FiTrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lines of Code
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(data.overview.totalLinesOfCode / 1000).toFixed(1)}K
                  </p>
                </div>
              </div>
            </div>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Repositories
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.repositories.slice(0, 10).map(repo => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {repo.name}
                        </h4>
                        {repo.visibility === 'private' && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Private
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {repo.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            {repo.language}
                          </span>
                        )}
                        <span>⭐ {repo.stargazersCount}</span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        router.push(`/analytics/repository/${repo.id}`)
                      }
                      className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                    >
                      <FiExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Contributors
              </h3>
              <div className="space-y-3">
                {data.overview.topContributors.map((contributor, index) => (
                  <div
                    key={contributor.contributor.id}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contributor.contributor.name ||
                          contributor.contributor.login}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contributor.commitCount} commits
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                      `/analytics/repository/${data.overview.mostActiveRepository!.repository.id}`
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

/**
 * Main Analytics Page with Suspense wrapper
 */
export default function AnalyticsPage() {
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
