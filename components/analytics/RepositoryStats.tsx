'use client';

import React from 'react';
import { FaCodeBranch, FaExclamationTriangle, FaStar } from 'react-icons/fa';

import { GitHubRepository } from '@/types/analytics';

interface RepositoryStatsProps {
  repository: GitHubRepository;
}

export default function RepositoryStats({
  repository,
}: RepositoryStatsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Stars</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {repository.stargazers_count}
            </p>
          </div>
          <FaStar className="text-yellow-500 text-xl" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Forks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {repository.forks_count}
            </p>
          </div>
          <FaCodeBranch className="text-blue-500 text-xl" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Issues</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {repository.open_issues_count}
            </p>
          </div>
          <FaExclamationTriangle className="text-orange-500 text-xl" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Language</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {repository.language ?? 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
