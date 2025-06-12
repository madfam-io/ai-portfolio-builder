'use client';

import Link from 'next/link';
import React from 'react';
import {
  FiArrowLeft,
  FiEdit,
  FiPause,
  FiPlay,
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiClock,
  FiDownload,
  FiRefreshCw,
} from 'react-icons/fi';

import ConversionChart from '@/components/admin/experiments/ConversionChart';
import StatisticalAnalysis from '@/components/admin/experiments/StatisticalAnalysis';
import { VariantTableRow } from './VariantTableRow';

import type {
  LandingPageExperiment,
  ExperimentAnalyticsResponse,
  DetailedVariant,
} from '@/types/experiments';

interface ExperimentDetailsContentProps {
  experiment: LandingPageExperiment;
  variants: DetailedVariant[];
  analyticsData: ExperimentAnalyticsResponse | null;
  timeRange: '7d' | '14d' | '30d' | 'all';
  refreshing: boolean;
  onTimeRangeChange: (range: '7d' | '14d' | '30d' | 'all') => void;
  onStatusChange: (status: string) => Promise<void>;
  onRefresh: () => void;
  onExport: () => void;
}

export function ExperimentDetailsContent({
  experiment,
  variants,
  analyticsData,
  timeRange,
  refreshing,
  onTimeRangeChange,
  onStatusChange,
  onRefresh,
  onExport,
}: ExperimentDetailsContentProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/experiments"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {experiment.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {experiment.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiRefreshCw
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                />
              </button>

              <button
                onClick={onExport}
                className="btn-secondary inline-flex items-center text-sm"
              >
                <FiDownload className="mr-2" />
                Export
              </button>

              {experiment.status === 'active' && (
                <button
                  onClick={() => onStatusChange('paused')}
                  className="btn-secondary inline-flex items-center text-sm"
                >
                  <FiPause className="mr-2" />
                  Pause
                </button>
              )}

              {experiment.status === 'paused' && (
                <button
                  onClick={() => onStatusChange('active')}
                  className="btn-primary inline-flex items-center text-sm"
                >
                  <FiPlay className="mr-2" />
                  Resume
                </button>
              )}

              <Link
                href={`/admin/experiments/${experiment.id}/edit`}
                className="btn-primary inline-flex items-center text-sm"
              >
                <FiEdit className="mr-2" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Visitors
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {analyticsData?.results.totalVisitors.toLocaleString() || 0}
                </p>
              </div>
              <FiUsers className="text-2xl text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Conversions
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {analyticsData?.results.totalConversions.toLocaleString() ||
                    0}
                </p>
              </div>
              <FiTarget className="text-2xl text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overall Conversion Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {analyticsData?.results.totalVisitors
                    ? (
                        (analyticsData.results.totalConversions /
                          analyticsData.results.totalVisitors) *
                        100
                      ).toFixed(2)
                    : '0'}
                  %
                </p>
              </div>
              <FiTrendingUp className="text-2xl text-purple-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Days Running
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {analyticsData?.results.duration || 0}
                </p>
              </div>
              <FiClock className="text-2xl text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {(['7d', '14d', '30d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {range === 'all' ? 'All Time' : `Last ${range}`}
              </button>
            ))}
          </div>
        </div>

        {/* Charts and Analysis */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Conversion Rate Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Conversion Rate Over Time
            </h3>
            <ConversionChart
              data={analyticsData?.timeline || []}
              variants={variants.map(v => ({
                ...v,
                is_control: v.isControl || false,
              }))}
            />
          </div>

          {/* Statistical Analysis */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Statistical Analysis
            </h3>
            <StatisticalAnalysis
              results={analyticsData?.results}
              primaryMetric={experiment.primaryMetric}
            />
          </div>
        </div>

        {/* Variant Details Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Variant Performance Details
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Visitors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Conv. Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Uplift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Significance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg. Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bounce Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {analyticsData?.results.variantResults.map(result => {
                  const variant = variants.find(v => v.id === result.variantId);
                  if (!variant) return null;

                  return (
                    <VariantTableRow
                      key={result.variantId}
                      result={result}
                      variant={variant}
                      isWinner={result.variantId === analyticsData.results.winner}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
