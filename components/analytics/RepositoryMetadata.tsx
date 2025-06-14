'use client';

import { GitFork, Star, Calendar } from 'lucide-react';

import { formatDistanceToNow } from '@/lib/utils/date';

import type { Repository } from '@/types/analytics';

/**
 * @fileoverview RepositoryMetadata Component
 *
 * Displays repository metadata including language, stars,
 * forks, commits, and last update time with visual indicators
 */

interface RepositoryMetadataProps {
  repo: Repository;
}

export function RepositoryMetadata({
  repo,
}: RepositoryMetadataProps): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
      {repo.language !== null && repo.language !== undefined && (
        <div className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: getLanguageColor(repo.language),
            }}
          />
          {repo.language}
        </div>
      )}
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4" />
        {repo.stargazersCount}
      </div>
      <div className="flex items-center gap-1">
        <GitFork className="w-4 h-4" />
        {repo.forksCount}
      </div>
      {/* Commit count would come from metrics, not repository directly */}
      <div className="flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        Updated{' '}
        {formatDistanceToNow(
          new Date(repo.githubUpdatedAt || repo.lastSyncedAt || new Date()),
          {
            addSuffix: true,
          }
        )}
      </div>
    </div>
  );
}

/**
 * Get the GitHub language color for visual consistency
 * @param language - Programming language name
 * @returns Hex color code for the language
 */
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    Rust: '#dea584',
    Go: '#00ADD8',
    Ruby: '#701516',
    PHP: '#4F5D95',
    'C++': '#f34b7d',
    C: '#555555',
    Swift: '#FA7343',
    Kotlin: '#A97BFF',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    React: '#61dafb',
  };
  return colors[language] ?? '#8b949e'; // Default gray for unknown languages
}
