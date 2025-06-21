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
  ArrowLeft,
  Clock,
  ExternalLink,
  Github,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { formatDistanceToNow } from '@/lib/utils/date';

import type { Repository } from '@/types/analytics';

/**
 * @fileoverview RepositoryHeader Component
 *
 * Header section for repository analytics page
 * with title, description, and navigation
 */

interface RepositoryHeaderProps {
  repository: Repository;
  syncing: boolean;
  onSync: () => void;
  backText: string;
}

export function RepositoryHeader({
  repository,
  syncing,
  onSync,
  backText,
}: RepositoryHeaderProps): React.ReactElement {
  const router = useRouter();

  return (
    <>
      {/* Navigation */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/analytics')}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="mr-2" />
          {backText}
        </button>
      </div>

      {/* Repository Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Github className="text-2xl text-gray-900 dark:text-white" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {repository.name}
              </h1>
              {repository.visibility === 'private' && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                  Private
                </span>
              )}
            </div>

            {repository.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {repository.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {repository.language && (
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  {repository.language}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Updated{' '}
                {formatDistanceToNow(
                  new Date(
                    repository.githubUpdatedAt ||
                      repository.lastSyncedAt ||
                      new Date()
                  ),
                  { addSuffix: true }
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://github.com/${repository.fullName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center"
            >
              <ExternalLink className="mr-2" />
              View on GitHub
            </a>

            <button
              onClick={onSync}
              disabled={syncing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <RefreshCw className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
