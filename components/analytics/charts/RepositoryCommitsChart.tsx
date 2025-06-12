/**
 * Repository Commits Chart Component
 * Dynamically imported chart for repository commit history
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CommitData {
  date: string;
  commits: number;
}

interface RepositoryCommitsChartProps {
  data: CommitData[];
  className?: string;
}

export default function RepositoryCommitsChart({
  data,
  className = '',
}: RepositoryCommitsChartProps): React.JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={300} className={className}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="commits"
          stroke="#8884d8"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
