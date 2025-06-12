'use client';

import { formatDistanceToNow } from 'date-fns';
import { GitFork, Star, GitCommit, Calendar } from 'lucide-react';

import type { Repository } from '@/lib/types/analytics';

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
        {repo.stargazers_count}
      </div>
      <div className="flex items-center gap-1">
        <GitFork className="w-4 h-4" />
        {repo.forks_count}
      </div>
      {repo.commits_count !== null && repo.commits_count !== undefined && (
        <div className="flex items-center gap-1">
          <GitCommit className="w-4 h-4" />
          {repo.commits_count} commits
        </div>
      )}
      <div className="flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        Updated{' '}
        {formatDistanceToNow(new Date(repo.updated_at), {
          addSuffix: true,
        })}
      </div>
    </div>
  );
}

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
  return colors[language] ?? '#8b949e';
}
