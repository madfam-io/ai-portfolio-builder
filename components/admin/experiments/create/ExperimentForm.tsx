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

import { Percent } from 'lucide-react';
import React from 'react';

interface ExperimentFormProps {
  experimentName: string;
  setExperimentName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  hypothesis: string;
  setHypothesis: (hypo: string) => void;
  primaryMetric: string;
  setPrimaryMetric: (metric: string) => void;
  trafficPercentage: number;
  setTrafficPercentage: (percentage: number) => void;
  errors: {
    name?: string;
    [key: string]: string | undefined;
  };
}

export function ExperimentForm({
  experimentName,
  setExperimentName,
  description,
  setDescription,
  hypothesis,
  setHypothesis,
  primaryMetric,
  setPrimaryMetric,
  trafficPercentage,
  setTrafficPercentage,
  errors,
}: ExperimentFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Basic Information
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Experiment Name *
          </label>
          <input
            type="text"
            value={experimentName}
            onChange={e => setExperimentName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Hero Message Test"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Brief description of what you're testing..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hypothesis
          </label>
          <textarea
            value={hypothesis}
            onChange={e => setHypothesis(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Changing the CTA button color to green will increase click-through rates by 15%"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primary Metric
            </label>
            <select
              value={primaryMetric}
              onChange={e => setPrimaryMetric(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="signup_rate">Signup Rate</option>
              <option value="demo_click_rate">Demo Click Rate</option>
              <option value="cta_click_rate">CTA Click Rate</option>
              <option value="pricing_view_rate">Pricing View Rate</option>
              <option value="time_on_page">Time on Page</option>
              <option value="bounce_rate">Bounce Rate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Traffic Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                value={trafficPercentage}
                onChange={e => setTrafficPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
