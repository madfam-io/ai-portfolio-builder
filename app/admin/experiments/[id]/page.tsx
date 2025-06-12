'use client';

/**
 * Experiment Details & Analytics Page
 *
 * Displays detailed analytics, conversion data, and statistical
 * analysis for a specific A/B testing experiment.
 */

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  FiArrowLeft,
  FiEdit,
  FiPause,
  FiPlay,
  FiCheckCircle,
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiClock,
  FiDownload,
  FiRefreshCw,
} from 'react-icons/fi';

import ConversionChart from '@/components/admin/experiments/ConversionChart';
import StatisticalAnalysis from '@/components/admin/experiments/StatisticalAnalysis';
import { useAuth } from '@/lib/contexts/AuthContext';
// import { useLanguage } from '@/lib/i18n/refactored-context'; // TODO: Add translations
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

import type {
  LandingPageExperiment,
  LandingPageVariant,
  ExperimentAnalyticsResponse,
  VariantResult,
} from '@/types/experiments';

interface DetailedVariant extends LandingPageVariant {
  analytics: {
    totalClicks: number;
    uniqueVisitors: number;
    averageTimeOnPage: number;
    bounceRate: number;
    conversionsByDay: Array<{
      date: string;
      conversions: number;
      visitors: number;
    }>;
  };
}

export default function ExperimentDetailsPage(): React.ReactElement {
  const { isAdmin, canAccess } = useAuth();
  // const { t } = useLanguage(); // TODO: Add translations
  const router = useRouter();
  const params = useParams();
  const experimentId = params.id as string;

  const [experiment, setExperiment] = useState<LandingPageExperiment | null>(
    null
  );
  const [variants, setVariants] = useState<DetailedVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>(
    '7d'
  );
  const [analyticsData, setAnalyticsData] =
    useState<ExperimentAnalyticsResponse | null>(null);

  // Check admin access
  useEffect(() => {
    if (!isAdmin || !canAccess('experiments:manage')) {
      router.push('/dashboard');
    }
  }, [isAdmin, canAccess, router]);

  // Fetch experiment data
  const fetchExperimentData = async () => {
    try {
      const supabase = createClient();
      if (!supabase) {
        logger.error('Database connection not available', new Error('Supabase client is null'));
        return;
      }

      // Fetch experiment
      const { data: experimentData, error: experimentError } = await supabase
        .from('landing_page_experiments')
        .select('*')
        .eq('id', experimentId)
        .single();

      if (experimentError) throw experimentError;
      setExperiment(experimentData);

      // Fetch variants with analytics
      const { data: variantsData, error: variantsError } = await supabase
        .from('landing_page_variants')
        .select(
          `
          *,
          analytics:landing_page_analytics(
            session_id,
            visitor_id,
            converted,
            time_on_page,
            clicks,
            created_at
          )
        `
        )
        .eq('experiment_id', experimentId);

      if (variantsError) throw variantsError;

      // Process variants with analytics
      const processedVariants = variantsData.map(variant => {
        const analytics = variant.analytics || [];
        const uniqueVisitors = new Set(
          analytics.map((a: any) => a.visitor_id || a.session_id)
        ).size;
        const totalClicks = analytics.reduce(
          (sum: number, a: any) => sum + (a.clicks?.length || 0),
          0
        );
        const averageTimeOnPage =
          analytics.reduce(
            (sum: number, a: any) => sum + (a.time_on_page || 0),
            0
          ) / (analytics.length || 1);
        const bounceRate =
          (analytics.filter((a: any) => !a.clicks || a.clicks.length === 0)
            .length /
            (analytics.length || 1)) *
          100;

        // Group conversions by day
        const conversionsByDay: Record<
          string,
          { conversions: number; visitors: number }
        > = {};
        analytics.forEach((a: any) => {
          const date = new Date(a.created_at).toISOString().split('T')[0];
          if (!date) return; // Guard against undefined date
          
          if (!conversionsByDay[date]) {
            conversionsByDay[date] = { conversions: 0, visitors: 0 };
          }
          conversionsByDay[date].visitors++;
          if (a.converted) {
            conversionsByDay[date].conversions++;
          }
        });

        return {
          ...variant,
          analytics: {
            totalClicks,
            uniqueVisitors,
            averageTimeOnPage,
            bounceRate,
            conversionsByDay: Object.entries(conversionsByDay)
              .map(([date, data]) => ({
                date,
                ...data,
              }))
              .sort((a, b) => a.date.localeCompare(b.date)),
          },
        };
      });

      setVariants(processedVariants);

      // Calculate experiment results
      if (experimentData && processedVariants.length > 0) {
        const results = calculateExperimentResults(processedVariants);
        setAnalyticsData({
          experiment: experimentData,
          results,
          timeline: generateTimeline(processedVariants, timeRange),
        });
      }
    } catch (error) {
      logger.error('Failed to fetch experiment data', error as Error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExperimentData();
  }, [experimentId, timeRange]);

  // Calculate experiment results
  const calculateExperimentResults = (variants: DetailedVariant[]): any => {
    const control = variants.find(v => (v as any).is_control);
    if (!control) return null;

    const variantResults: VariantResult[] = variants.map(variant => {
      const conversionRate =
        variant.visitors > 0
          ? (variant.conversions / variant.visitors) * 100
          : 0;
      const controlConversionRate =
        control.visitors > 0
          ? (control.conversions / control.visitors) * 100
          : 0;
      const uplift =
        control.id === variant.id
          ? 0
          : ((conversionRate - controlConversionRate) / controlConversionRate) *
            100;

      // Simple confidence interval calculation (would use proper statistical library in production)
      const z = 1.96; // 95% confidence
      const p = conversionRate / 100;
      const n = variant.visitors;
      const se = Math.sqrt((p * (1 - p)) / n);
      const margin = z * se * 100;

      return {
        variantId: variant.id,
        variantName: variant.name,
        visitors: variant.visitors,
        conversions: variant.conversions,
        conversionRate,
        confidenceInterval: [
          Math.max(0, conversionRate - margin),
          conversionRate + margin,
        ] as [number, number],
        uplift,
        pValue:
          variant.id === control.id ? 1 : calculatePValue(control, variant),
      };
    });

    // Determine winner if significant
    const significantResults = variantResults.filter(
      v => v.pValue && v.pValue < 0.05 && v.uplift && v.uplift > 0
    );
    const winner =
      significantResults.length > 0
        ? significantResults.reduce((best, current) =>
            current.uplift! > best.uplift! ? current : best
          )
        : null;

    return {
      variantResults,
      winner: winner?.variantId,
      confidence: winner ? (1 - (winner.pValue || 0)) * 100 : 0,
      improvementPercentage: winner?.uplift,
      statisticalSignificance: winner ? winner.pValue! < 0.05 : false,
      totalVisitors: variants.reduce((sum, v) => sum + v.visitors, 0),
      totalConversions: variants.reduce((sum, v) => sum + v.conversions, 0),
      duration: experiment
        ? Math.ceil(
            (Date.now() - new Date(experiment.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
    };
  };

  // Calculate p-value (simplified - would use proper statistical library)
  const calculatePValue = (
    control: DetailedVariant,
    variant: DetailedVariant
  ): number => {
    const p1 = control.conversions / control.visitors;
    const p2 = variant.conversions / variant.visitors;
    const p =
      (control.conversions + variant.conversions) /
      (control.visitors + variant.visitors);
    const se = Math.sqrt(
      p * (1 - p) * (1 / control.visitors + 1 / variant.visitors)
    );
    const z = Math.abs(p1 - p2) / se;
    // Simplified normal distribution CDF
    return (
      2 *
      (1 -
        0.5 *
          (1 + Math.sign(z) * Math.sqrt(1 - Math.exp((-2 * z * z) / Math.PI))))
    );
  };

  // Generate timeline data
  const generateTimeline = (
    variants: DetailedVariant[],
    range: string
  ): any[] => {
    const days =
      range === '7d' ? 7 : range === '14d' ? 14 : range === '30d' ? 30 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const timeline: any[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= new Date()) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = {
        date: currentDate.toISOString(),
        visitors: 0,
        conversions: 0,
      };

      variants.forEach(variant => {
        const dayAnalytics = variant.analytics.conversionsByDay.find(
          d => d.date === dateStr
        );
        if (dayAnalytics) {
          dayData.visitors += dayAnalytics.visitors;
          dayData.conversions += dayAnalytics.conversions;
        }
      });

      timeline.push(dayData);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return timeline;
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      const supabase = createClient();
      if (!supabase) {
        logger.error('Database connection not available', new Error('Supabase client is null'));
        return;
      }
      const { error } = await supabase
        .from('landing_page_experiments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', experimentId);

      if (error) throw error;

      setExperiment(prev =>
        prev ? { ...prev, status: newStatus as any } : null
      );
    } catch (error) {
      logger.error('Failed to update experiment status', error as Error);
    }
  };

  // Export data
  const handleExportData = () => {
    if (!analyticsData) return;

    const csvData = [
      [
        'Variant',
        'Visitors',
        'Conversions',
        'Conversion Rate',
        'Uplift',
        'P-Value',
      ],
      ...analyticsData.results.variantResults.map(v => [
        v.variantName,
        v.visitors,
        v.conversions,
        `${v.conversionRate.toFixed(2)}%`,
        v.uplift ? `${v.uplift.toFixed(2)}%` : 'N/A',
        v.pValue ? v.pValue.toFixed(4) : 'N/A',
      ]),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment-${experimentId}-results.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Experiment not found</p>
      </div>
    );
  }

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
                onClick={() => {
                  setRefreshing(true);
                  fetchExperimentData();
                }}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiRefreshCw
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                />
              </button>

              <button
                onClick={handleExportData}
                className="btn-secondary inline-flex items-center text-sm"
              >
                <FiDownload className="mr-2" />
                Export
              </button>

              {experiment.status === 'active' && (
                <button
                  onClick={() => handleStatusChange('paused')}
                  className="btn-secondary inline-flex items-center text-sm"
                >
                  <FiPause className="mr-2" />
                  Pause
                </button>
              )}

              {experiment.status === 'paused' && (
                <button
                  onClick={() => handleStatusChange('active')}
                  className="btn-primary inline-flex items-center text-sm"
                >
                  <FiPlay className="mr-2" />
                  Resume
                </button>
              )}

              <Link
                href={`/admin/experiments/${experimentId}/edit`}
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
                onClick={() => setTimeRange(range)}
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
                is_control: (v as any).is_control || false
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

        {/* Variant Details */}
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
                    <tr
                      key={result.variantId}
                      className={
                        result.variantId === analyticsData.results.winner
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : ''
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {result.variantName}
                          </span>
                          {(variant as any).is_control && (
                            <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                              Control
                            </span>
                          )}
                          {result.variantId ===
                            analyticsData.results.winner && (
                            <span className="px-2 py-0.5 text-xs bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 rounded">
                              Winner
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {result.visitors.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {result.conversions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {result.conversionRate.toFixed(2)}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            [{result.confidenceInterval[0].toFixed(2)}% -{' '}
                            {result.confidenceInterval[1].toFixed(2)}%]
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result.uplift !== undefined && result.uplift !== 0 ? (
                          <span
                            className={`font-medium ${result.uplift > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                          >
                            {result.uplift > 0 ? '+' : ''}
                            {result.uplift.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result.pValue && result.pValue < 0.05 ? (
                          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                            <FiCheckCircle className="w-4 h-4" />
                            <span className="text-sm">
                              p={result.pValue.toFixed(3)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {result.pValue
                              ? `p=${result.pValue.toFixed(3)}`
                              : '—'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {Math.round(variant.analytics.averageTimeOnPage)}s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {variant.analytics.bounceRate.toFixed(1)}%
                      </td>
                    </tr>
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
