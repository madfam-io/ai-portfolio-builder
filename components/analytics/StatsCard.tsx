/**
 * @fileoverview StatsCard Component
 *
 * Reusable stats card component for displaying metrics
 * with icon, label, and value in a consistent format
 */

'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatsCard({
  icon,
  label,
  value,
  iconBgColor = 'bg-purple-100 dark:bg-purple-900/30',
  iconColor = 'text-purple-600',
}: StatsCardProps): React.ReactElement {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="flex items-center">
        <div className={`p-2 ${iconBgColor} rounded-lg`}>
          <div className={`w-6 h-6 ${iconColor}`}>{icon}</div>
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
