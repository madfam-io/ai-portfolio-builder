'use client';

import { RepositoryMetadata } from './RepositoryMetadata';

import type { Repository } from '@/lib/types/analytics';

import { Badge } from '@/components/ui/badge';

interface RepositoryCardProps {
  repo: Repository;
}

export function RepositoryCard({
  repo,
}: RepositoryCardProps): React.ReactElement {
  return (
    <div className="p-6 bg-background rounded-lg border">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              {repo.name}
            </a>
          </h3>
          {repo.description !== null && repo.description !== undefined && (
            <p className="text-sm text-muted-foreground mt-1">
              {repo.description}
            </p>
          )}
        </div>
        {repo.private === true && (
          <Badge variant="secondary" className="ml-2">
            Private
          </Badge>
        )}
      </div>

      <RepositoryMetadata repo={repo} />

      {repo.topics !== null &&
        repo.topics !== undefined &&
        repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {repo.topics.map(topic => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}
    </div>
  );
}
