'use client';

import { Badge } from '@/components/ui/badge';

import { RepositoryMetadata } from './RepositoryMetadata';

import type { Repository } from '@/types/analytics';

/**
 * @fileoverview RepositoryCard Component
 *
 * Individual repository card with detailed information
 * including description, metadata, and topics
 */

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
              href={`https://github.com/${repo.fullName}`}
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
        {repo.visibility === 'private' && (
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
            {repo.topics.map((topic: string) => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}
    </div>
  );
}
