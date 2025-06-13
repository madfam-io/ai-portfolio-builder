import React from 'react';
} from 'react-icons/fi';
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiTarget,

import type { ExperimentResults } from '@/types/experiments';

/**
 * Statistical Analysis Component
 *
 * Displays statistical significance, confidence intervals, and
 * recommendations based on experiment results.
 */

interface StatisticalAnalysisProps {
  results?: ExperimentResults;
  primaryMetric: string;
}

export default function StatisticalAnalysis({
  results,
  primaryMetric,
}: StatisticalAnalysisProps): React.ReactElement {
  if (!results) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>No data available for analysis</p>
      </div>
    );
  }

  const getMetricName = (metric: string): string => {
    const metricNames: Record<string, string> = {
      signup_rate: 'Signup Rate',
      demo_click_rate: 'Demo Click Rate',
      cta_click_rate: 'CTA Click Rate',
      pricing_view_rate: 'Pricing View Rate',
      time_on_page: 'Time on Page',
      bounce_rate: 'Bounce Rate',
    };
    return metricNames[metric] || metric;
  };

  const getSampleSizeRecommendation = (): {
    status: 'sufficient' | 'warning' | 'insufficient';
    message: string;
  } => {
    const minSampleSize = 1000; // Simplified - would use power analysis
    const currentSampleSize = results.totalVisitors;

    if (currentSampleSize >= minSampleSize * 2) {
      return {
        status: 'sufficient',
        message: 'Sample size is sufficient for reliable results',
      };
    } else if (currentSampleSize >= minSampleSize) {
      return {
        status: 'warning',
        message:
          'Sample size is adequate but more data would increase confidence',
      };
    } else {
      return {
        status: 'insufficient',
        message: `Need at least ${minSampleSize - currentSampleSize} more visitors for reliable results`,
      };
    }
  };

  const sampleSizeRec = getSampleSizeRecommendation();
  const hasWinner = results.statisticalSignificance && results.winner;
  const winningVariant = results.variantResults.find(
    v => v.variantId === results.winner
  );

  return (
    <div className="space-y-6">
      {/* Primary Metric */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <FiTarget className="w-5 h-5 text-purple-600" />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Primary Metric
          </h4>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {getMetricName(primaryMetric)}
        </p>
      </div>

      {/* Statistical Significance */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Statistical Significance
        </h4>

        {hasWinner ? (
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Statistically Significant Result
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {winningVariant?.variantName} shows a{' '}
                {results.improvementPercentage?.toFixed(1)}% improvement over
                the control with {results.confidence?.toFixed(1)}% confidence.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                No Significant Difference Yet
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Continue running the experiment to gather more data or consider
                larger changes to detect meaningful differences.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sample Size Analysis */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Sample Size Analysis
        </h4>

        <div
          className={`flex items-start gap-3 p-4 rounded-lg ${
            sampleSizeRec.status === 'sufficient'
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : sampleSizeRec.status === 'warning'
                ? 'bg-yellow-50 dark:bg-yellow-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
          }`}
        >
          {sampleSizeRec.status === 'sufficient' ? (
            <FiCheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          ) : sampleSizeRec.status === 'warning' ? (
            <FiAlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          ) : (
            <FiXCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p
              className={`font-medium ${
                sampleSizeRec.status === 'sufficient'
                  ? 'text-blue-900 dark:text-blue-100'
                  : sampleSizeRec.status === 'warning'
                    ? 'text-yellow-900 dark:text-yellow-100'
                    : 'text-red-900 dark:text-red-100'
              }`}
            >
              {results.totalVisitors.toLocaleString()} total visitors
            </p>
            <p
              className={`text-sm mt-1 ${
                sampleSizeRec.status === 'sufficient'
                  ? 'text-blue-700 dark:text-blue-300'
                  : sampleSizeRec.status === 'warning'
                    ? 'text-yellow-700 dark:text-yellow-300'
                    : 'text-red-700 dark:text-red-300'
              }`}
            >
              {sampleSizeRec.message}
            </p>
          </div>
        </div>
      </div>

      {/* Variant Performance Summary */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Performance Summary
        </h4>

        <div className="space-y-3">
          {results.variantResults
            .sort((a, b) => b.conversionRate - a.conversionRate)
            .map((variant, index) => (
              <div
                key={variant.variantId}
                className={`p-3 rounded-lg border ${
                  variant.variantId === results.winner
                    ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        variant.variantId === results.winner
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {variant.variantName}
                    </span>
                    {index === 0 && variant.variantId !== results.winner && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                        Best Performing
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {variant.conversionRate.toFixed(2)}%
                    </div>
                    {variant.uplift !== undefined && variant.uplift !== 0 && (
                      <div
                        className={`text-sm ${
                          variant.uplift > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {variant.uplift > 0 ? '+' : ''}
                        {variant.uplift.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Confidence Interval */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>95% Confidence Interval</span>
                    <span>
                      {variant.confidenceInterval[0].toFixed(2)}% -{' '}
                      {variant.confidenceInterval[1].toFixed(2)}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                      style={{
                        marginLeft: `${variant.confidenceInterval[0]}%`,
                        width: `${variant.confidenceInterval[1] - variant.confidenceInterval[0]}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Recommendations
            </h4>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              {hasWinner ? (
                <>
                  <li>
                    • Consider implementing {winningVariant?.variantName} as the
                    new default
                  </li>
                  <li>
                    • Document learnings and apply insights to future
                    experiments
                  </li>
                  <li>
                    • Monitor performance post-implementation to ensure
                    sustained improvement
                  </li>
                </>
              ) : (
                <>
                  <li>
                    • Continue running the experiment for at least{' '}
                    {Math.ceil(14 - results.duration)} more days
                  </li>
                  <li>• Ensure equal traffic distribution between variants</li>
                  <li>
                    • Consider testing more dramatic changes if no difference
                    emerges
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
