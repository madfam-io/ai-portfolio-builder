/**
 * @fileoverview Repository Analytics Detail Page
 * 
 * Detailed analytics view for a specific GitHub repository.
 * Shows code metrics, contributor insights, and historical trends.
 * 
 * @author PRISMA Development Team
 * @version 0.0.1-alpha - Phase 1 MVP
 */

'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BaseLayout from '@/components/layouts/BaseLayout';
import {
  FiArrowLeft,
  FiGithub,
  FiActivity,
  FiGitPullRequest,
  FiUsers,
  FiCode,
  FiRefreshCw,
  FiExternalLink,
  FiStar,
  FiGitBranch,
  FiEye,
  FiClock,
} from 'react-icons/fi';
import type { RepositoryAnalytics } from '@/types/analytics';

// Lazy load Recharts components to reduce bundle size
const LineChart = lazy(() => import('recharts').then(mod => ({ default: mod.LineChart })));
const Line = lazy(() => import('recharts').then(mod => ({ default: mod.Line })));
const XAxis = lazy(() => import('recharts').then(mod => ({ default: mod.XAxis })));
const YAxis = lazy(() => import('recharts').then(mod => ({ default: mod.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));
const PieChart = lazy(() => import('recharts').then(mod => ({ default: mod.PieChart })));
const Pie = lazy(() => import('recharts').then(mod => ({ default: mod.Pie })));
const Cell = lazy(() => import('recharts').then(mod => ({ default: mod.Cell })));

// Component state type
interface RepoState {
  data: RepositoryAnalytics | null;
  loading: boolean;
  error: string | null;
  syncing: boolean;
}

/**
 * Repository Analytics Detail Page
 */
export default function RepositoryAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const repositoryId = params.id as string;
  
  // State management
  const [repo, setRepo] = useState<RepoState>({
    data: null,
    loading: true,
    error: null,
    syncing: false,
  });

  /**
   * Fetch repository analytics data
   */
  const fetchRepositoryAnalytics = useCallback(async () => {
    try {
      setRepo(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/analytics/repositories/${repositoryId}`);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setRepo(prev => ({
            ...prev,
            loading: false,
            error: 'Repository not found',
          }));
          return;
        }
        throw new Error(result.error || 'Failed to fetch repository analytics');
      }

      setRepo(prev => ({
        ...prev,
        data: result.data,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      setRepo(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [repositoryId]);

  // Fetch repository analytics on mount
  useEffect(() => {
    if (repositoryId) {
      fetchRepositoryAnalytics();
    }
  }, [repositoryId, fetchRepositoryAnalytics]);

  /**
   * Sync repository data
   */
  const syncRepository = async () => {
    try {
      setRepo(prev => ({ ...prev, syncing: true }));

      const response = await fetch(`/api/analytics/repositories/${repositoryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syncMetrics: true,
          syncPullRequests: true,
          syncContributors: true,
          syncCommits: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync repository');
      }

      // Refresh data after sync
      await fetchRepositoryAnalytics();
    } catch (error: any) {
      setRepo(prev => ({
        ...prev,
        error: error.message,
      }));
    } finally {
      setRepo(prev => ({ ...prev, syncing: false }));
    }
  };

  /**
   * Chart colors matching PRISMA theme
   */
  const chartColors = {
    primary: '#8b5cf6',
    secondary: '#06b6d4',
    accent: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  // Loading state
  if (repo.loading) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FiRefreshCw className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading repository analytics...
            </p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  // Error state
  if (repo.error) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <FiCode className="text-6xl text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {repo.error}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/analytics')}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Back to Analytics
              </button>
              <button
                onClick={fetchRepositoryAnalytics}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  if (!repo.data) return null;

  const data = repo.data;
  const repository = data.repository;

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.push('/analytics')}
                className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {repository.name}
              </h1>
              {repository.visibility === 'private' && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  Private
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {repository.description || 'No description available'}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {repository.language && (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      {repository.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <FiStar className="w-3 h-3" />
                    {repository.stargazersCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiGitBranch className="w-3 h-3" />
                    {repository.forksCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiEye className="w-3 h-3" />
                    {repository.watchersCount}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={`https://github.com/${repository.fullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <FiGithub className="mr-2" />
                  View on GitHub
                  <FiExternalLink className="ml-2 w-3 h-3" />
                </a>
                <button
                  onClick={syncRepository}
                  disabled={repo.syncing}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <FiRefreshCw className={`mr-2 ${repo.syncing ? 'animate-spin' : ''}`} />
                  {repo.syncing ? 'Syncing...' : 'Sync Data'}
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FiCode className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total LOC</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.metrics.current?.locTotal?.toLocaleString() || 'N/A'}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Commits (30d)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.metrics.current?.commitsLast30Days || 0}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recent PRs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.pullRequests.recent.length}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contributors</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.contributors.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pull Request Stats */}
          {data.pullRequests.stats && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pull Request Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {data.pullRequests.stats.averageCycleTime.toFixed(1)}h
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Cycle Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {data.pullRequests.stats.averageLeadTime.toFixed(1)}h
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Lead Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {data.pullRequests.stats.mergeRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Merge Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {data.pullRequests.stats.averageTimeToFirstReview.toFixed(1)}h
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time to Review</p>
                </div>
              </div>
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Commit Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Commit Activity
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.commits.byDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="commitDate" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="commitCount" 
                    stroke={chartColors.primary} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Language Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Language Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.languages}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {data.languages.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={[chartColors.primary, chartColors.secondary, chartColors.accent, chartColors.warning, chartColors.danger][index % 5]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Contributors and Recent PRs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contributors */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Contributors
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.contributors.slice(0, 10).map((contrib, index) => (
                  <div
                    key={contrib.contributor.id}
                    className="flex items-center gap-3 p-3 border rounded-lg dark:border-gray-700"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contrib.contributor.name || contrib.contributor.login}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contrib.stats.commitCount} commits, +{contrib.stats.additions} -{contrib.stats.deletions}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Pull Requests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Pull Requests
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.pullRequests.recent.slice(0, 10).map((pr) => (
                  <div
                    key={pr.id}
                    className="p-3 border rounded-lg dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          #{pr.number}: {pr.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          by {pr.authorLogin} • {pr.state}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>+{pr.additions} -{pr.deletions}</span>
                          {pr.cycleTimeHours && (
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {pr.cycleTimeHours.toFixed(1)}h
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        pr.state === 'merged' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                          : pr.state === 'open'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {pr.state}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}