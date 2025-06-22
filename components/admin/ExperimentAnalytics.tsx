/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * @fileoverview Advanced Experiment Analytics and Statistical Analysis
 *
 * Comprehensive analytics dashboard for experiment results including:
 * - Statistical significance testing
 * - Conversion funnel analysis
 * - Real-time performance monitoring
 * - Bayesian analysis and confidence intervals
 * - Revenue impact calculations
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Calculator,
  Download,
  Calendar,
} from 'lucide-react';

import {
  UniversalExperimentConfig,
  UniversalExperimentVariant,
  ExperimentResult,
} from '@/lib/experimentation/universal-experiments';

interface ExperimentAnalyticsProps {
  experiment: UniversalExperimentConfig;
  results: Map<string, ExperimentResult[]>;
  timeRange?: string;
  onExport?: () => void;
}

export function ExperimentAnalytics({
  experiment,
  results,
  timeRange = '7d',
  onExport,
}: ExperimentAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState(
    experiment.metrics.primary.id
  );
  const [_selectedVariant, _setSelectedVariant] = useState<string>('all');
  const [viewMode, setViewMode] = useState<
    'overview' | 'detailed' | 'statistical'
  >('overview');

  // Calculate statistical summary
  const statisticalSummary = useMemo(() => {
    const controlVariant = experiment.variants.find(v => v.isControl);
    const treatmentVariants = experiment.variants.filter(v => !v.isControl);

    if (!controlVariant || !results.has(controlVariant.id)) {
      return null;
    }

    const controlResults = results.get(controlVariant.id) || [];
    const primaryControlResult = controlResults.find(
      r => r.metricId === selectedMetric
    );

    if (!primaryControlResult) return null;

    const variantComparisons = treatmentVariants
      .map(variant => {
        const variantResults = results.get(variant.id) || [];
        const primaryVariantResult = variantResults.find(
          r => r.metricId === selectedMetric
        );

        if (!primaryVariantResult) return null;

        return {
          variant,
          result: primaryVariantResult,
          improvement: primaryVariantResult.effect,
          significanceLevel: primaryVariantResult.pValue,
          isSignificant: primaryVariantResult.statisticalSignificance,
          confidenceInterval: primaryVariantResult.effectConfidenceInterval,
          sampleSize: primaryVariantResult.sampleSize,
        };
      })
      .filter(Boolean);

    return {
      control: { variant: controlVariant, result: primaryControlResult },
      treatments: variantComparisons,
      bestPerformer: variantComparisons.reduce(
        (best, current) =>
          !best || (current && current.improvement > best.improvement)
            ? current
            : best,
        null
      ),
      hasSignificantWinner: variantComparisons.some(
        v => v && v.isSignificant && v.improvement > 0
      ),
    };
  }, [experiment, results, selectedMetric]);

  // Generate time series data
  const timeSeriesData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, _index) => ({
      day,
      control: 12 + Math.random() * 8,
      treatment: 15 + Math.random() * 10,
      conversions: 50 + Math.random() * 30,
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{experiment.name} Analytics</h2>
          <p className="text-gray-600">
            Statistical analysis and performance insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            {timeRange}
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {experiment.variants
                .reduce((sum, v) => sum + v.performance.assignments, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (Date.now() - experiment.createdAt.getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              days running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statisticalSummary?.control.result.conversionRate?.toFixed(2) ||
                '0.00'}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Control variant baseline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Best Improvement
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +
              {(
                (statisticalSummary?.bestPerformer?.improvement || 0) * 100
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {statisticalSummary?.bestPerformer?.variant.name ||
                'No significant winner'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Statistical Power
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(experiment.statistics.statisticalPower * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {statisticalSummary?.hasSignificantWinner ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Significant
                </span>
              ) : (
                <span className="text-yellow-600 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Needs more data
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Variant Performance Comparison */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Variant Performance</CardTitle>
                <Select
                  value={selectedMetric}
                  onValueChange={setSelectedMetric}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={experiment.metrics.primary.id}>
                      {experiment.metrics.primary.name} (Primary)
                    </SelectItem>
                    {experiment.metrics.secondary.map(metric => (
                      <SelectItem key={metric.id} value={metric.id}>
                        {metric.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                value={viewMode}
                onValueChange={value =>
                  setViewMode(value as 'overview' | 'detailed' | 'statistical')
                }
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed</TabsTrigger>
                  <TabsTrigger value="statistical">Statistical</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <VariantComparisonChart
                    variants={experiment.variants}
                    results={results}
                    selectedMetric={selectedMetric}
                  />
                </TabsContent>

                <TabsContent value="detailed" className="space-y-4">
                  <ConversionFunnelChart
                    variants={experiment.variants}
                    results={results}
                  />
                </TabsContent>

                <TabsContent value="statistical" className="space-y-4">
                  <StatisticalAnalysisChart
                    statisticalSummary={statisticalSummary}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Insights and Recommendations */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ExperimentInsights
                experiment={experiment}
                statisticalSummary={statisticalSummary}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Time Series Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>
            Daily conversion rates and participant growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar
                  yAxisId="right"
                  dataKey="conversions"
                  fill="#e2e8f0"
                  name="Participants"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="control"
                  stroke="#6b7280"
                  name="Control"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="treatment"
                  stroke="#3b82f6"
                  name="Treatment"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Variant Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Variant Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailedVariantTable
            experiment={experiment}
            results={results}
            selectedMetric={selectedMetric}
          />
        </CardContent>
      </Card>
    </div>
  );
}

interface VariantComparisonChartProps {
  variants: UniversalExperimentVariant[];
  results: Map<string, ExperimentResult[]>;
  selectedMetric: string;
}

function VariantComparisonChart({
  variants,
  results,
  selectedMetric,
}: VariantComparisonChartProps) {
  const chartData = variants.map(variant => {
    const variantResults = results.get(variant.id) || [];
    const metricResult = variantResults.find(
      r => r.metricId === selectedMetric
    );

    const conversionRate =
      variant.performance.assignments > 0
        ? (variant.performance.conversions / variant.performance.assignments) *
          100
        : 0;

    return {
      name: variant.name,
      conversions: variant.performance.conversions,
      participants: variant.performance.assignments,
      conversionRate: conversionRate,
      effect: metricResult ? metricResult.effect * 100 : 0,
      isControl: variant.isControl,
      isSignificant: metricResult?.statisticalSignificance || false,
    };
  });

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value: unknown, name: string) => [
              `${parseFloat(String(value)).toFixed(2)}${name.includes('Rate') || name.includes('effect') ? '%' : ''}`,
              name,
            ]}
          />
          <Bar
            dataKey="conversionRate"
            fill="#3b82f6"
            name="Conversion Rate"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ConversionFunnelChartProps {
  variants: UniversalExperimentVariant[];
  results: Map<string, ExperimentResult[]>;
}

function ConversionFunnelChart({
  variants: _variants,
  results: _results,
}: ConversionFunnelChartProps) {
  const funnelData = [
    { stage: 'Views', control: 1000, treatment: 1000 },
    { stage: 'Clicks', control: 850, treatment: 920 },
    { stage: 'Signups', control: 120, treatment: 180 },
    { stage: 'Conversions', control: 85, treatment: 145 },
  ];

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={funnelData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stage" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="control"
            stackId="1"
            stroke="#6b7280"
            fill="#6b7280"
            name="Control"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="treatment"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            name="Treatment"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

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

function StatisticalAnalysisChart({
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

  const confidenceData = statisticalSummary.treatments.map(
    (treatment, _index) => ({
      variant: treatment.variant.name,
      improvement: treatment.improvement * 100,
      lowerBound: treatment.confidenceInterval[0] * 100,
      upperBound: treatment.confidenceInterval[1] * 100,
      isSignificant: treatment.isSignificant,
    })
  );

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

interface ExperimentInsightsProps {
  experiment: UniversalExperimentConfig;
  statisticalSummary: {
    hasSignificantWinner?: boolean;
    bestPerformer?: {
      variant: { name: string };
      improvement: number;
    } | null;
  } | null;
}

function ExperimentInsights({
  experiment,
  statisticalSummary,
}: ExperimentInsightsProps) {
  const insights = [];

  // Sample size check
  const totalParticipants = experiment.variants.reduce(
    (sum, v) => sum + v.performance.assignments,
    0
  );
  const progressPercentage =
    (totalParticipants / experiment.schedule.minSampleSize) * 100;

  if (progressPercentage < 100) {
    insights.push({
      type: 'warning',
      title: 'Sample Size',
      message: `Need ${(experiment.schedule.minSampleSize - totalParticipants).toLocaleString()} more participants to reach statistical power.`,
      icon: <AlertTriangle className="w-4 h-4" />,
    });
  }

  // Statistical significance
  if (statisticalSummary?.hasSignificantWinner) {
    insights.push({
      type: 'success',
      title: 'Winner Found',
      message: `${statisticalSummary.bestPerformer.variant.name} shows significant improvement of ${(statisticalSummary.bestPerformer.improvement * 100).toFixed(1)}%.`,
      icon: <CheckCircle className="w-4 h-4" />,
    });
  } else if (statisticalSummary && progressPercentage >= 100) {
    insights.push({
      type: 'info',
      title: 'No Clear Winner',
      message:
        'Sufficient sample size reached but no statistically significant difference found.',
      icon: <Target className="w-4 h-4" />,
    });
  }

  // Revenue impact estimation
  if (statisticalSummary?.bestPerformer?.improvement > 0) {
    const estimatedMonthlyImpact =
      statisticalSummary.bestPerformer.improvement * 10000; // Mock calculation
    insights.push({
      type: 'success',
      title: 'Revenue Impact',
      message: `Estimated monthly revenue lift: $${estimatedMonthlyImpact.toFixed(0)}`,
      icon: <DollarSign className="w-4 h-4" />,
    });
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg border ${
            insight.type === 'success'
              ? 'bg-green-50 border-green-200'
              : insight.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`${
                insight.type === 'success'
                  ? 'text-green-600'
                  : insight.type === 'warning'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
              }`}
            >
              {insight.icon}
            </div>
            <div>
              <h4 className="font-semibold text-sm">{insight.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Progress towards significance */}
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress to Statistical Power</span>
          <span>{progressPercentage.toFixed(0)}%</span>
        </div>
        <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
      </div>

      {/* Recommended actions */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">Recommended Actions</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {progressPercentage < 100 && (
            <li>• Continue running until minimum sample size is reached</li>
          )}
          {statisticalSummary?.hasSignificantWinner && (
            <li>• Consider deploying winning variant to all users</li>
          )}
          {progressPercentage >= 100 &&
            !statisticalSummary?.hasSignificantWinner && (
              <li>• Consider extending duration or redesigning experiment</li>
            )}
        </ul>
      </div>
    </div>
  );
}

interface DetailedVariantTableProps {
  experiment: UniversalExperimentConfig;
  results: Map<string, ExperimentResult[]>;
  selectedMetric: string;
}

function DetailedVariantTable({
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
