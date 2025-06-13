'use client';

import {
  Code as FaCode,
  GitBranch as FaGitAlt,
  Star as FaStar,
  TrendingUp,
  Users as FaUsers,
} from 'lucide-react';
import React from 'react';

import { useLanguage } from '@/lib/i18n/refactored-context';
import { AnalyticsDashboardData } from '@/types/analytics';

interface DashboardStatsProps {
  dashboard: AnalyticsDashboardData;
}

export default function DashboardStats({
  dashboard,
}: DashboardStatsProps): React.ReactElement {
  const { t } = useLanguage();

  const stats = [
    {
      label: t.totalRepositories,
      value: dashboard.overview.totalRepositories,
      icon: FaCode,
      color: 'text-blue-500',
    },
    {
      label: t.totalCommits,
      value: dashboard.overview.totalCommits,
      icon: FaGitAlt,
      color: 'text-green-500',
    },
    {
      label: t.totalPullRequests,
      value: dashboard.overview.totalPullRequests,
      icon: FaStar,
      color: 'text-yellow-500',
    },
    {
      label: t.totalContributors,
      value: dashboard.overview.totalContributors,
      icon: FaUsers,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <stat.icon className={`text-3xl ${stat.color}`} />
            <TrendingUp className="text-gray-400 text-sm" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stat.value.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
