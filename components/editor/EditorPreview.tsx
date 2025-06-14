'use client';

import { useLanguage } from '@/lib/i18n/refactored-context';
import { cn } from '@/lib/utils';
import { Portfolio } from '@/types/portfolio';

interface EditorPreviewProps {
  portfolio: Portfolio;
  className?: string;
}

/**
 * EditorPreview Component
 *
 * Real-time preview of the portfolio
 * Shows how the portfolio will look when published
 */
export function EditorPreview({ portfolio, className }: EditorPreviewProps) {
  const { t } = useLanguage();

  return (
    <div className={cn('h-full overflow-y-auto bg-muted/30', className)}>
      <div className="sticky top-0 bg-background border-b px-4 py-2">
        <p className="text-sm font-medium text-muted-foreground">
          {t.livePreview || 'Live Preview'}
        </p>
      </div>

      <div className="p-4">
        <div className="bg-background rounded-lg shadow-lg overflow-hidden">
          {/* Preview iframe or rendered content */}
          <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="p-8">
              {/* Hero Section Preview */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                  {portfolio.data?.name ||
                    portfolio.name ||
                    t.yourName ||
                    'Your Name'}
                </h1>
                <p className="text-xl text-muted-foreground mb-2">
                  {portfolio.data?.title ||
                    portfolio.data?.headline ||
                    t.yourTitle ||
                    'Your Professional Title'}
                </p>
                <p className="text-lg text-muted-foreground">
                  {portfolio.data?.tagline ||
                    t.yourTagline ||
                    'Your tagline goes here'}
                </p>
              </div>

              {/* About Section Preview */}
              {portfolio.data?.about && (
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">
                    {t.about || 'About'}
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {portfolio.data?.about}
                  </p>
                </div>
              )}

              {/* Projects Section Preview */}
              {portfolio.data?.projects &&
                portfolio.data.projects.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t.projects || 'Projects'}
                    </h2>
                    <div className="grid gap-6">
                      {portfolio.data?.projects.map(
                        (project: any, index: number) => (
                          <div
                            key={project.id || index}
                            className="p-6 border rounded-lg"
                          >
                            <h3 className="text-lg font-semibold mb-2">
                              {project.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {project.description}
                            </p>
                            {project.technologies && (
                              <div className="flex gap-2 mt-4">
                                {project.technologies.map(
                                  (tech: string, i: number) => (
                                    <span
                                      key={i}
                                      className="px-2 py-1 bg-primary/10 text-sm rounded"
                                    >
                                      {tech}
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
