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

import type {
  DetailedVariant,
  ExperimentAnalyticsResponse,
  VariantResult,
} from '@/types/experiments';

/**
 * Calculate p-value (simplified - would use proper statistical library)
 */
export function calculatePValue(
  control: DetailedVariant,
  variant: DetailedVariant
): number {
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
}

/**
 * Calculate experiment results and statistics
 */
export function calculateExperimentResults(
  variants: DetailedVariant[]
): ExperimentAnalyticsResponse['results'] | null {
  const control = variants.find(v => v.isControl);
  if (!control) return null;

  const variantResults: VariantResult[] = variants.map(variant => {
    const conversionRate =
      variant.visitors && variant.visitors > 0
        ? (variant.conversions / variant.visitors) * 100
        : 0;
    const controlConversionRate =
      control.visitors && control.visitors > 0
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
      pValue: variant.id === control.id ? 1 : calculatePValue(control, variant),
    };
  });

  // Determine winner if significant
  const significantResults = variantResults.filter(
    v => v.pValue && v.pValue < 0.05 && v.uplift && v.uplift > 0
  );
  const winner =
    significantResults.length > 0
      ? significantResults.reduce((best, current) =>
          (current.uplift ?? 0) > (best.uplift ?? 0) ? current : best
        )
      : null;

  return {
    variantResults,
    winner: winner?.variantId,
    confidence: winner ? (1 - (winner.pValue || 0)) * 100 : 0,
    improvementPercentage: winner?.uplift,
    statisticalSignificance: winner ? (winner.pValue ?? 1) < 0.05 : false,
    totalVisitors: variants.reduce((sum, v) => sum + v.visitors, 0),
    totalConversions: variants.reduce((sum, v) => sum + v.conversions, 0),
    duration: 0, // Will be calculated by caller with experiment data
  };
}

/**
 * Generate timeline data for experiment
 */
export function generateTimeline(
  variants: DetailedVariant[],
  range: string
): Array<{ date: Date; visitors: number; conversions: number }> {
  const days =
    range === '7d' ? 7 : range === '14d' ? 14 : range === '30d' ? 30 : 365;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const timeline: Array<{ date: Date; visitors: number; conversions: number }> =
    [];
  const currentDate = new Date(startDate);

  while (currentDate <= new Date()) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayData = {
      date: new Date(currentDate),
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
}
