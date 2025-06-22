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
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import {
  UniversalExperimentConfig,
  ExperimentResult,
} from '@/lib/experimentation/universal-experiments';

interface DetailedVariantTableProps {
  experiment: UniversalExperimentConfig;
  results: Map<string, ExperimentResult[]>;
  selectedMetric: string;
}

export function DetailedVariantTable({
  experiment,
  results,
  selectedMetric,
}: DetailedVariantTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3">Variant</th>
            <th className="text-right p-3">Participants</th>
            <th className="text-right p-3">Conversions</th>
            <th className="text-right p-3">Rate</th>
            <th className="text-right p-3">Improvement</th>
            <th className="text-right p-3">Confidence</th>
            <th className="text-center p-3">Significance</th>
          </tr>
        </thead>
        <tbody>
          {experiment.variants.map(variant => {
            const variantResults = results.get(variant.id) || [];
            const metricResult = variantResults.find(
              r => r.metricId === selectedMetric
            );
            const conversionRate =
              variant.performance.assignments > 0
                ? (variant.performance.conversions /
                    variant.performance.assignments) *
                  100
                : 0;

            return (
              <tr key={variant.id} className="border-b">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        variant.isControl ? 'bg-gray-400' : 'bg-blue-500'
                      }`}
                    />
                    <span className="font-medium">{variant.name}</span>
                    {variant.isControl && (
                      <Badge variant="outline">Control</Badge>
                    )}
                  </div>
                </td>
                <td className="text-right p-3">
                  {variant.performance.assignments.toLocaleString()}
                </td>
                <td className="text-right p-3">
                  {variant.performance.conversions.toLocaleString()}
                </td>
                <td className="text-right p-3">{conversionRate.toFixed(2)}%</td>
                <td className="text-right p-3">
                  {metricResult ? (
                    <span
                      className={`${metricResult.effect > 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {metricResult.effect > 0 ? '+' : ''}
                      {(metricResult.effect * 100).toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-right p-3">
                  {metricResult ? (
                    <span>{((1 - metricResult.pValue) * 100).toFixed(1)}%</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center p-3">
                  {metricResult?.statisticalSignificance ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 mx-auto" />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

