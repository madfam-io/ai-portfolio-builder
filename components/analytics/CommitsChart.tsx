'use client';

import React, { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { usePerformanceTracking } from '@/lib/utils/performance';

/**
 * @fileoverview Commits Trend Chart Component
 *
 * A lazy-loaded chart component for displaying commit trends over time.
 * Optimized for performance with dynamic imports and memoization.
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

interface CommitsChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
  chartColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

/**
 * Commits Trend Chart Component
 *
 * Displays commit activity over time using a responsive line chart.
 * Memoized for performance optimization.
 */
const CommitsChart: React.FC<CommitsChartProps> = memo(
  ({
    data,
    chartColors = {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      accent: '#10b981',
    },
  }) => {
    usePerformanceTracking('CommitsChart');

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Commits Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke={chartColors.primary}
              strokeWidth={2}
              dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chartColors.primary, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

CommitsChart.displayName = 'CommitsChart';

export default CommitsChart;
