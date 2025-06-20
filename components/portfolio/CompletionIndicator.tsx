'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Portfolio, SectionType } from '@/types/portfolio';
import { useLanguage } from '@/lib/i18n/refactored-context';

interface CompletionIndicatorProps {
  portfolio: Portfolio;
  onSectionClick?: (section: SectionType) => void;
  className?: string;
}

interface SectionStatus {
  section: SectionType;
  label: string;
  isComplete: boolean;
  isRequired: boolean;
  message?: string;
}

export function CompletionIndicator({
  portfolio,
  onSectionClick,
  className,
}: CompletionIndicatorProps) {
  const { t } = useLanguage();
  const [sectionStatuses, setSectionStatuses] = useState<SectionStatus[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    const statuses: SectionStatus[] = [
      {
        section: 'hero',
        label: 'Basic Information',
        isRequired: true,
        isComplete: !!(portfolio.name && portfolio.title && portfolio.bio),
        message: !portfolio.name
          ? 'Name is required'
          : !portfolio.title
            ? 'Title is required'
            : !portfolio.bio
              ? 'Bio is required'
              : undefined,
      },
      {
        section: 'contact',
        label: 'Contact Information',
        isRequired: true,
        isComplete: !!portfolio.contact?.email,
        message: !portfolio.contact?.email ? 'Email is required' : undefined,
      },
      {
        section: 'experience',
        label: 'Work Experience',
        isRequired: false,
        isComplete: (portfolio.experience?.length || 0) > 0,
        message: 'Add at least one experience',
      },
      {
        section: 'projects',
        label: 'Projects',
        isRequired: false,
        isComplete: (portfolio.projects?.length || 0) > 0,
        message: 'Add at least one project',
      },
      {
        section: 'skills',
        label: 'Skills',
        isRequired: false,
        isComplete: (portfolio.skills?.length || 0) > 0,
        message: 'Add your skills',
      },
      {
        section: 'education',
        label: 'Education',
        isRequired: false,
        isComplete: (portfolio.education?.length || 0) > 0,
        message: 'Add your education',
      },
    ];

    // Filter out hidden sections
    const visibleStatuses = statuses.filter(status => {
      const hiddenSections = portfolio.customization?.hiddenSections || [];
      return !hiddenSections.includes(status.section);
    });

    setSectionStatuses(visibleStatuses);

    // Calculate completion percentage
    const requiredComplete = visibleStatuses
      .filter(s => s.isRequired)
      .every(s => s.isComplete);

    if (!requiredComplete) {
      setCompletionPercentage(0);
    } else {
      const completedCount = visibleStatuses.filter(s => s.isComplete).length;
      const percentage = Math.round(
        (completedCount / visibleStatuses.length) * 100
      );
      setCompletionPercentage(percentage);
    }
  }, [portfolio]);

  const getStatusIcon = (status: SectionStatus) => {
    if (status.isComplete) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    } else if (status.isRequired) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCompletionColor = () => {
    if (completionPercentage === 100) return 'text-green-600';
    if (completionPercentage >= 80) return 'text-blue-600';
    if (completionPercentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = () => {
    if (completionPercentage === 100) return 'bg-green-500';
    if (completionPercentage >= 80) return 'bg-blue-500';
    if (completionPercentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t.portfolioCompletion || 'Portfolio Completion&apos;}
          </h3>
          <div className="flex items-center gap-4">
            <Progress
              value={completionPercentage}
              className="flex-1"
              indicatorClassName={getProgressBarColor()}
            />
            <span className={cn(&apos;text-2xl font-bold', getCompletionColor())}>
              {completionPercentage}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            {completionPercentage === 100
              ? t.portfolioComplete ||
                'Your portfolio is complete and ready to publish!'
              : t.completeFollowing ||
                'Complete the following sections to improve your portfolio:&apos;}
          </p>

          {sectionStatuses.map(status => (
            <div
              key={status.section}
              className={cn(
                &apos;flex items-center justify-between p-3 rounded-lg border transition-colors&apos;,
                status.isComplete
                  ? &apos;bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800&apos;
                  : &apos;bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800&apos;,
                onSectionClick &&
                  !status.isComplete &&
                  &apos;cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              onClick={() => {
                if (onSectionClick && !status.isComplete) {
                  onSectionClick(status.section);
                }
              }}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(status)}
                <div>
                  <p className="font-medium">
                    {status.label}
                    {status.isRequired && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </p>
                  {!status.isComplete && status.message && (
                    <p className="text-sm text-muted-foreground">
                      {status.message}
                    </p>
                  )}
                </div>
              </div>
              {!status.isComplete && onSectionClick && (
                <Button variant="ghost" size="sm">
                  {t.complete || 'Complete'}
                </Button>
              )}
            </div>
          ))}
        </div>

        {completionPercentage < 100 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="text-red-500">*</span>{' '}
              {t.requiredFields ||
                'Required fields must be completed before publishing'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
