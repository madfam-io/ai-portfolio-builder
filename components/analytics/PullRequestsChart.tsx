/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import React, { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { usePerformanceTracking } from '@/lib/utils/performance';

/**
 * @fileoverview Pull Requests Chart Component
 *
 * A lazy-loaded chart component for displaying pull request metrics.
 * Shows opened, merged, and closed PRs by week.
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

interface PullRequestsChartProps {
  data: Array<{
    week: string;
    opened: number;
    merged: number;
    closed: number;
  }>;
  chartColors?: {
    primary: string;
    accent: string;
    warning: string;
  };
}

/**
 * Pull Requests Chart Component
 *
 * Displays pull request activity with separate bars for opened, merged, and closed PRs.
 * Memoized for performance optimization.
 */
const PullRequestsChart: React.FC<PullRequestsChartProps> = memo(
  ({
    data,
    chartColors = {
      primary: '#8b5cf6',
      accent: '#10b981',
      warning: '#f59e0b',
    },
  }) => {
    usePerformanceTracking('PullRequestsChart');

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Pull Requests by Week
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="opened"
              fill={chartColors.primary}
              name="Opened"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="merged"
              fill={chartColors.accent}
              name="Merged"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="closed"
              fill={chartColors.warning}
              name="Closed"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

PullRequestsChart.displayName = 'PullRequestsChart';

export default PullRequestsChart;
