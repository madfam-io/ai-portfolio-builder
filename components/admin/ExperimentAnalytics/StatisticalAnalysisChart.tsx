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

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface StatisticalAnalysisChartProps {
  statisticalSummary: {
    control: {
      result: {
        conversionRate?: number;
        sampleSize: number;
      };
    };
    treatments: Array<{
      variant: { name: string };
      improvement: number;
      confidenceInterval: [number, number];
      isSignificant: boolean;
    }>;
    bestPerformer?: {
      improvement: number;
      variant: { name: string };
    } | null;
  } | null;
}

export function StatisticalAnalysisChart({
  statisticalSummary,
}: StatisticalAnalysisChartProps) {
  if (!statisticalSummary) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Insufficient data for statistical analysis</p>
        </div>
      </div>
    );
  }

  const confidenceData = statisticalSummary.treatments.map(treatment => ({
    variant: treatment.variant.name,
    improvement: treatment.improvement * 100,
    lowerBound: treatment.confidenceInterval[0] * 100,
    upperBound: treatment.confidenceInterval[1] * 100,
    isSignificant: treatment.isSignificant,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Control Performance</h4>
          <div className="text-2xl font-bold">
            {(statisticalSummary.control.result.conversionRate || 0).toFixed(2)}
            %
          </div>
          <p className="text-sm text-gray-600">
            {statisticalSummary.control.result.sampleSize.toLocaleString()}{' '}
            participants
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2">Best Treatment</h4>
          <div className="text-2xl font-bold text-blue-600">
            +
            {(
              (statisticalSummary.bestPerformer?.improvement || 0) * 100
            ).toFixed(1)}
            %
          </div>
          <p className="text-sm text-gray-600">
            {statisticalSummary.bestPerformer?.variant.name ||
              'None significant'}
          </p>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={confidenceData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={['dataMin - 5', 'dataMax + 5']} />
            <YAxis dataKey="variant" type="category" width={80} />
            <Tooltip
              formatter={(value: unknown) => [
                `${parseFloat(String(value)).toFixed(1)}%`,
                'Improvement',
              ]}
            />
            <Bar
              dataKey="improvement"
              fill="#3b82f6"
              name="Improvement"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

