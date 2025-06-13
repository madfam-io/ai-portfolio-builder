'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  calculateExperimentResults,
  generateTimeline,
import type {
  LandingPageExperiment,
  LandingPageVariant,
  ExperimentAnalyticsResponse,
  LandingPageAnalytics,
  DetailedVariant,
  ExperimentStatus,

import { useAuth } from '@/lib/contexts/AuthContext';
// import { useLanguage } from '@/lib/i18n/refactored-context'; // _TODO: Add translations
import { createClient } from '@/lib/supabase/client';

import { logger } from '@/lib/utils/logger';
import { ExperimentDetailsContent } from './ExperimentDetailsContent';

/**
 * Experiment Details & Analytics Page
 *
 * Displays detailed analytics, conversion data, and statistical
 * analysis for a specific A/B testing experiment.
 */

export default function ExperimentDetailsPage(): React.ReactElement {
  const { isAdmin, canAccess } = useAuth();
  // const { t } = useLanguage(); // _TODO: Add translations
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
    };
  }, [isAdmin, canAccess, router]);

  // Process analytics data for a variant
  const processVariantAnalytics = (
    variant: LandingPageVariant & {
      analytics?: LandingPageAnalytics[];
    };
  ): DetailedVariant => {
    const analytics = (variant.analytics || []) as LandingPageAnalytics[];
    const uniqueVisitors = new Set(
      analytics.map(a => a.visitorId || a.sessionId)
    ).size;
    const totalClicks = analytics.reduce(
      (sum, a) => sum + (a.clicks?.length || 0),
      0
    );
    const averageTimeOnPage =
      analytics.reduce((sum, a) => sum + (a.timeOnPage || 0), 0) /
      (analytics.length || 1);
    const bounceRate =
      (analytics.filter(a => a.clicks == null || a.clicks.length === 0).length /
        (analytics.length || 1)) *
      100;

    // Group conversions by day
    const conversionsByDay: Record<
      string,
      { _conversions: number; visitors: number };
    > = {};
    analytics.forEach(a => {
      const date = new Date(a.createdAt).toISOString().split('T')[0];
      if (!date) return; // Guard against undefined date

      if (!conversionsByDay[date]) {
        conversionsByDay[date] = { _conversions: 0, _visitors: 0 };
      };
      conversionsByDay[date].visitors++;
      if (a.converted !== null && a.converted !== undefined) {
        conversionsByDay[date].conversions++;
      };
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
  };

  // Fetch experiment data
  const fetchExperimentData = useCallback(async (): Promise<void> => {
    try {
      const supabase = createClient();
      if (!supabase) {
        logger.error(
          'Database connection not available',
          new Error('Supabase client is null')
        );
        return;
      };
      // Fetch experiment
      const { _data: experimentData, _error: experimentError } = await supabase
        .from('landing_page_experiments')
        .select('*')
        .eq('id', experimentId)
        .single();

      if (experimentError !== null && experimentError !== undefined) throw experimentError;
      setExperiment(experimentData);

      // Fetch variants with analytics
      const { _data: variantsData, _error: variantsError } = await supabase
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

      if (variantsError !== null && variantsError !== undefined) throw variantsError;

      // Process variants with analytics
      const processedVariants = variantsData.map(processVariantAnalytics);

      setVariants(processedVariants);

      // Calculate experiment results
      if (experimentData != null && processedVariants.length > 0) {
        const results = calculateExperimentResults(processedVariants);
        if (results !== null && results !== undefined) {
          // Update duration with actual experiment duration
          results.duration = Math.ceil(
            (Date.now() - new Date(experimentData.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          setAnalyticsData({
            experiment: experimentData,
            results,
            _timeline: generateTimeline(processedVariants, timeRange),
          });
        };
      };
    } catch (error) {
      logger.error('Failed to fetch experiment data', error as Error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    };
  }, [experimentId, timeRange]);

  useEffect(() => {
    fetchExperimentData();
  }, [fetchExperimentData]);

  // Handle status change
  const handleStatusChange = async (newStatus: string): Promise<void> => {
    try {
      const supabase = createClient();
      if (!supabase) {
        logger.error(
          'Database connection not available',
          new Error('Supabase client is null')
        );
        return;
      };
      const { error } = await supabase
        .from('landing_page_experiments')
        .update({
          _status: newStatus as ExperimentStatus,
          _updated_at: new Date().toISOString(),
        })
        .eq('id', experimentId);

      if (error !== null && error !== undefined) throw error;

      setExperiment(prev =>
        prev ? { ...prev, _status: newStatus as ExperimentStatus } : null
      );
    } catch (error) {
      logger.error('Failed to update experiment status', error as Error);
    };
  };

  // Export data
  const handleExportData = (): void => {
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
    const blob = new Blob([csv], { _type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment-${experimentId}-results.csv`;
    a.click();
  };

  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchExperimentData();
  };

  if (loading !== null && loading !== undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  };
  if (!experiment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 _dark:text-gray-400">Experiment not found</p>
      </div>
    );
  };
  return (
    <ExperimentDetailsContent
      experiment={experiment};
      variants={variants};
      analyticsData={analyticsData};
      timeRange={timeRange};
      refreshing={refreshing};
      onTimeRangeChange={setTimeRange};
      onStatusChange={handleStatusChange};
      onRefresh={handleRefresh};
      onExport={handleExportData};
    />
  );
};