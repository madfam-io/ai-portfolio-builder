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

/**
 * @fileoverview Experiment Details Component
 *
 * Displays detailed analytics and configuration for a selected experiment,
 * including variant performance, statistical analysis, and settings.
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';
import {
  UniversalExperimentConfig,
  ExperimentResult,
} from '@/lib/experimentation/universal-experiments';

interface ExperimentDetailsProps {
  experiment: UniversalExperimentConfig;
  results?: Map<string, ExperimentResult[]>;
}

export function ExperimentDetails({
  experiment,
  results,
}: ExperimentDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h4 className="font-semibold mb-3">Key Metrics</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Assignments</div>
            <div className="text-lg font-semibold">
              {experiment.variants
                .reduce((sum, v) => sum + v.performance.assignments, 0)
                .toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Conversions</div>
            <div className="text-lg font-semibold">
              {experiment.variants
                .reduce((sum, v) => sum + v.performance.conversions, 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Variants Performance */}
      <div>
        <h4 className="font-semibold mb-3">Variant Performance</h4>
        <div className="space-y-2">
          {experiment.variants.map(variant => {
            const conversionRate =
              variant.performance.assignments > 0
                ? (variant.performance.conversions /
                    variant.performance.assignments) *
                  100
                : 0;

            return (
              <div
                key={variant.id}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      variant.isControl ? 'bg-gray-400' : 'bg-blue-500'
                    }`}
                  />
                  <span className="text-sm font-medium">{variant.name}</span>
                  {variant.isControl && (
                    <Badge variant="outline" className="text-xs">
                      Control
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {variant.performance.assignments} users
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistical Significance */}
      {results && (
        <div>
          <h4 className="font-semibold mb-3">Statistical Analysis</h4>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600 mb-2">
              Primary Metric Results
            </div>
            {Array.from(results.entries()).map(
              ([variantId, variantResults]) => {
                const variant = experiment.variants.find(
                  v => v.id === variantId
                );
                const primaryResult = variantResults.find(
                  r => r.metricId === experiment.metrics.primary.id
                );

                if (!variant || !primaryResult) return null;

                return (
                  <div
                    key={variantId}
                    className="flex justify-between items-center py-1"
                  >
                    <span className="text-sm">{variant.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {(primaryResult.effect * 100).toFixed(1)}%
                      </span>
                      {primaryResult.statisticalSignificance ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Experiment Configuration */}
      <div>
        <h4 className="font-semibold mb-3">Configuration</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Priority:</span>
            <span className="capitalize">{experiment.priority}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Traffic Allocation:</span>
            <span>
              {(experiment.targeting.trafficAllocation * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Confidence Level:</span>
            <span>
              {(experiment.statistics.confidenceLevel * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Min Sample Size:</span>
            <span>{experiment.schedule.minSampleSize.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
