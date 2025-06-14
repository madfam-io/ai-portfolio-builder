import { format } from '@/lib/utils/date';
import React from 'react';
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
 * Conversion Chart Component
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
  variants: Array<{
    id: string;
    name: string;
    is_control: boolean;
    analytics: {
      conversionsByDay: Array<{
        date: string;
        conversions: number;
        visitors: number;
      }>;
    };
  }>;
}

export default function ConversionChart({
  data,
  variants,
}: ConversionChartProps): React.ReactElement {
  // Process data for the chart
  const chartData = data.map(day => {
    const dayData: any = {
      date: format(new Date(day.date), 'MMM dd'),
      fullDate: day.date,
      total: day.visitors > 0 ? (day.conversions / day.visitors) * 100 : 0,
    };

    // Add data for each variant
    variants.forEach(variant => {
      const variantDay = variant.analytics.conversionsByDay.find(
        d => d.date === new Date(day.date).toISOString().split('T')[0]
      );
      if (variantDay && variantDay.visitors > 0) {
        dayData[variant.name] =
          (variantDay.conversions / variantDay.visitors) * 100;
      } else {
        dayData[variant.name] = 0;
      }
    });

    return dayData;
  });

  // Colors for different variants
  const colors = [
    '#8b5cf6', // purple-500
    '#3b82f6', // blue-500
    '#10b981', // green-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span
                className="flex items-center gap-2"
                style={{ color: entry.color }}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></span>
                {entry.name}
              </span>
              <span className="font-medium">{entry.value.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis
            dataKey="date"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{
              value: 'Conversion Rate (%)',
              angle: -90,
              position: 'insideLeft',
              className: 'text-gray-600 dark:text-gray-400',
            }}
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

          {/* Overall conversion rate line */}
          <Line
            type="monotone"
            dataKey="total"
            stroke="#6b7280"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Overall"
            dot={false}
          />

          {/* Lines for each variant */}
          {variants.map((variant, index) => (
            <Line
              key={variant.id}
              type="monotone"
              dataKey={variant.name}
              stroke={colors[index % colors.length]}
              strokeWidth={variant.is_control ? 3 : 2}
              name={variant.name}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
