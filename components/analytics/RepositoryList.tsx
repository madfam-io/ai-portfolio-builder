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

import { ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { Repository } from '@/types/analytics';

/**
 * @fileoverview RepositoryList Component
 *
 * Displays a list of GitHub repositories with metadata
 * and navigation to detailed repository analytics
 */

interface RepositoryListProps {
  repositories: Repository[];
  title?: string;
  maxItems?: number;
}

export function RepositoryList({
  repositories,
  title = 'Your Repositories',
  maxItems = 10,
}: RepositoryListProps): React.ReactElement {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {repositories.slice(0, maxItems).map(repo => (
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
                {repo.description !== null && repo.description !== ''
                  ? repo.description
                  : 'No description'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {repo.language !== null && repo.language !== '' && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    {repo.language}
                  </span>
                )}
                <span>⭐ {repo.stargazersCount}</span>
              </div>
            </div>
            <button
              onClick={() => router.push(`/analytics/repository/${repo.id}`)}
              className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
