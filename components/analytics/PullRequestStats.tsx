'use client';

/**
 * @fileoverview PullRequestStats Component
 *
 * Displays pull request statistics including cycle time,
 * lead time, merge rate, and time to first review
 */

interface PullRequestStatsProps {
  stats: {
    averageCycleTime: number;
    averageLeadTime: number;
    mergeRate: number;
    averageTimeToFirstReview: number;
  };
  labels: {
    title: string;
    avgCycleTime: string;
    avgLeadTime: string;
    mergeRate: string;
    timeToReview: string;
  };
}

export function PullRequestStats({
  stats,
  labels,
}: PullRequestStatsProps): React.ReactElement {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {labels.title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {stats.averageCycleTime.toFixed(1)}h
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {labels.avgCycleTime}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {stats.averageLeadTime.toFixed(1)}h
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {labels.avgLeadTime}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {stats.mergeRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {labels.mergeRate}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {stats.averageTimeToFirstReview.toFixed(1)}h
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {labels.timeToReview}
          </p>
        </div>
      </div>
    </div>
  );
}
