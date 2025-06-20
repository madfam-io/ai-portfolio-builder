'use client';

import type { Contributor } from '@/types/analytics';

/**
 * @fileoverview ContributorsList Component
 *
 * Displays a ranked list of top contributors
 * with commit counts and visual ranking
 */

interface ContributorsListProps {
  contributors: Array<{
    contributor: Contributor;
    commitCount: number;
  }>;
  title?: string;
}

export function ContributorsList({
  contributors,
  title = 'Top Contributors',
}: ContributorsListProps): React.ReactElement {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.contributor.id}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {contributor.contributor.name !== null &&
                contributor.contributor.name !== '&apos;
                  ? contributor.contributor.name
                  : contributor.contributor.login}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {contributor.commitCount} commits
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
