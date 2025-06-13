import React from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * Conversion Chart Component (Lazy-loaded)
 *
 * Displays conversion rate trends over time for experiment variants
 * using a line chart visualization.
 */

interface ConversionChartProps {
  data: Array<{
    date: string | Date;
    visitors: number;
    conversions: number;
  }>;
  variants?: Array<{
    id: string;
    name: string;
    is_control: boolean;
  }>;
  timeRange?: {
    start: Date;
    end: Date;
  };
  className?: string;
}

export default function ConversionChart({
  data,
  className = '',
}: ConversionChartProps): React.JSX.Element {
  // Calculate conversion rates for each data point
  const chartData = data.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    conversionRate:
      item.visitors > 0 ? (item.conversions / item.visitors) * 100 : 0,
    visitors: item.visitors,
    conversions: item.conversions,
  }));

  const customTooltip = (props: {
    active?: boolean;
    payload?: unknown;
    label?: string;
  }): React.JSX.Element | null => {
    const { active, payload, label } = props;
    if (
      Boolean(active) &&
      Boolean(payload) &&
      Array.isArray(payload) &&
      payload.length > 0
    ) {
      const data = payload[0] as {
        value?: number;
        payload?: { visitors?: number; conversions?: number };
      };
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">
            {label || ''}
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            {`Conversion Rate: ${Number(data.value ?? 0).toFixed(2)}%`}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {`Visitors: ${data.payload?.visitors ?? 0}`}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {`Conversions: ${data.payload?.conversions ?? 0}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            label={{
              value: 'Conversion Rate (%)',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip content={customTooltip} />
          <Legend />
          <Line
            type="monotone"
            dataKey="conversionRate"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Conversion Rate"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
