/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import {
  Activity,
  ArrowLeft,
  Clock,
  Code,
  GitPullRequest,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

// Use lazy-loaded chart components to reduce bundle size by ~60KB
import {
  RepositoryCommitsChart,
  RepositoryLanguagesChart,
} from '@/components/analytics/charts/index.lazy';
import { RepositoryHeader } from '@/components/analytics/RepositoryHeader';
import {
  transformCommitData,
  transformLanguageData,
} from '@/lib/analytics/data-transforms';
import { useLanguage } from '@/lib/i18n/refactored-context';

import type { RepositoryAnalytics } from '@/types/analytics';

/**
 * @fileoverview Repository Analytics Detail Page
 *
 * Detailed analytics view for a specific GitHub repository.
 * Shows code metrics, contributor insights, and historical trends.
 *
 * @author PRISMA Development Team
 * @version 0.0.1-alpha - Phase 1 MVP
 */

// Dynamic imports for charts - reduces bundle size by ~60KB
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
// eslint-disable-next-line complexity
export default function RepositoryAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const repositoryId = params.id as string;
  const { t } = useLanguage();

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

      const response = await fetch(
        `/api/analytics/repositories/${repositoryId}`
      );
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setRepo(prev => ({
            ...prev,
            loading: false,
            error: t.repositoryNotFound as string,
          }));
          return;
        }
        throw new Error(result.error ?? (t.failedToFetchAnalytics as string));
      }
      setRepo(prev => ({
        ...prev,
        data: result.data,
        loading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      setRepo(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [repositoryId, t]);

  // Fetch repository analytics on mount
  useEffect(() => {
    if (repositoryId !== null && repositoryId !== '') {
      void fetchRepositoryAnalytics();
    }
  }, [repositoryId, fetchRepositoryAnalytics]);

  /**
   * Sync repository data
   */
  const syncRepository = async (): Promise<void> => {
    try {
      setRepo(prev => ({ ...prev, syncing: true }));

      const response = await fetch(
        `/api/analytics/repositories/${repositoryId}`,
        {
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
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? (t.failedToSync as string));
      }
      // Refresh data after sync
      await fetchRepositoryAnalytics();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      setRepo(prev => ({
        ...prev,
        error: errorMessage,
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

  // Helper function for loading state
  const renderLoadingState = (): React.ReactElement => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{t.loadingAnalytics}</p>
      </div>
    </div>
  );

  // Helper function for error state
  const renderErrorState = (): React.ReactElement => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <Code className="text-6xl text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t.error}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{repo.error}</p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/analytics')}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="mr-2" />
            {t.backToAnalytics}
          </button>
          <button
            onClick={fetchRepositoryAnalytics}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="mr-2" />
            {t.tryAgain}
          </button>
        </div>
      </div>
    </div>
  );

  // State checks
  if (repo.loading) return renderLoadingState();
  if (repo.error !== null && repo.error !== '') return renderErrorState();
  if (!repo.data) return renderLoadingState();

  const data = repo.data;
  const repository = data.repository;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Repository Header */}
        <RepositoryHeader
          repository={repository}
          syncing={repo.syncing}
          onSync={syncRepository}
          backText={t.backToAnalytics || 'Back to Analytics'}
        />

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Code className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.totalLOC}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.metrics.current?.locTotal !== null &&
                  data.metrics.current?.locTotal !== undefined
                    ? data.metrics.current.locTotal.toLocaleString()
                    : t.notAvailable}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.commitsLast30Days}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.metrics.current?.commitsLast30Days ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <GitPullRequest className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.recentPRs}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.pullRequests.recent.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.contributors}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.contributors.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pull Request Stats */}
        {data.pullRequests.stats !== null &&
          data.pullRequests.stats !== undefined && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.pullRequestMetrics}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {data.pullRequests.stats.averageCycleTime.toFixed(1)}h
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.avgCycleTime}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {data.pullRequests.stats.averageLeadTime.toFixed(1)}h
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.avgLeadTime}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {data.pullRequests.stats.mergeRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.mergeRate}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {data.pullRequests.stats.averageTimeToFirstReview.toFixed(
                      1
                    )}
                    h
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.timeToReview}
                  </p>
                </div>
              </div>
            </div>
          )}
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Commit Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.commitActivity}
            </h3>
            <RepositoryCommitsChart
              data={transformCommitData(data.commits.byDay)}
            />
          </div>

          {/* Language Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.languageDistribution}
            </h3>
            <RepositoryLanguagesChart
              data={transformLanguageData(data.languages, chartColors)}
            />
          </div>
        </div>

        {/* Contributors and Recent PRs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contributors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.topContributors}
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
                      {contrib.contributor.name !== null &&
                      contrib.contributor.name !== ''
                        ? contrib.contributor.name
                        : contrib.contributor.login}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {contrib.stats.commitCount} {t.commitsWithChanges},{' '}
                      {t.codeChanges !== undefined && t.codeChanges !== null
                        ? t.codeChanges
                            .replace(
                              '{additions}',
                              contrib.stats.additions.toString()
                            )
                            .replace(
                              '{deletions}',
                              contrib.stats.deletions.toString()
                            )
                        : `+${contrib.stats.additions} -${contrib.stats.deletions}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Pull Requests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.recentPullRequests}
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.pullRequests.recent.slice(0, 10).map(pr => (
                <div
                  key={pr.id}
                  className="p-3 border rounded-lg dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {t.pullRequestNumber !== undefined &&
                        t.pullRequestNumber !== null
                          ? t.pullRequestNumber.replace(
                              '{number}',
                              pr.number.toString()
                            )
                          : `#${pr.number}`}
                        : {pr.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {t.by} {pr.authorLogin} •{' '}
                        {t[pr.state as 'merged' | 'open' | 'closed'] ??
                          pr.state}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>
                          {t.codeChanges !== undefined && t.codeChanges !== null
                            ? t.codeChanges
                                .replace('{additions}', pr.additions.toString())
                                .replace('{deletions}', pr.deletions.toString())
                            : `+${pr.additions} -${pr.deletions}`}
                        </span>
                        {pr.cycleTimeHours !== null &&
                          pr.cycleTimeHours !== undefined && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {pr.cycleTimeHours.toFixed(1)}h
                            </span>
                          )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        pr.state === 'merged'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                          : pr.state === 'open'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
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
  );
}
