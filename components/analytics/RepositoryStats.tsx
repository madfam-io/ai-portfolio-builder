/**
 * @fileoverview RepositoryStats Component
 *
 * Displays repository statistics in a grid layout
 * including stars, forks, watchers, and other metrics
 */

'use client';

import {
  FiStar,
  FiGitBranch,
  FiEye,
  FiUsers,
  FiCode,
  FiActivity,
} from 'react-icons/fi';

import type { Repository } from '@/types/analytics';

interface RepositoryStatsProps {
  repository: Repository;
  commitCount?: number;
  contributorCount?: number;
  pullRequestCount?: number;
}

export function RepositoryStats({
  repository,
  commitCount = 0,
  contributorCount = 0,
  pullRequestCount = 0,
}: RepositoryStatsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <FiStar className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {repository.stargazersCount}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Stars</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <FiGitBranch className="w-8 h-8 text-blue-500 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {repository.forksCount}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Forks</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <FiEye className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {repository.watchersCount}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Watchers</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <FiActivity className="w-8 h-8 text-purple-500 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {commitCount}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Commits</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <FiUsers className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {contributorCount}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Contributors</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <FiCode className="w-8 h-8 text-pink-500 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {pullRequestCount}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pull Requests
        </p>
      </div>
    </div>
  );
}
