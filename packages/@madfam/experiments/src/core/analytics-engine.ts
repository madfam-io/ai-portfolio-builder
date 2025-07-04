/**
 * @license MIT
 * Copyright (c) 2025 MADFAM
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @madfam/experiments
 *
 * Analytics engine for experiment tracking and results
 */

import type {
  Experiment,
  ExperimentEvent,
  ExperimentResults,
  VariationResults,
  MetricResults,
  ResultStatus,
} from './types';
import type { AnalyticsProperties } from './value-types';

interface EventStore {
  exposures: Map<string, ExperimentEvent[]>;
  conversions: Map<string, ExperimentEvent[]>;
  metrics: Map<string, ExperimentEvent[]>;
}

export class AnalyticsEngine {
  private enabled: boolean;
  private events: EventStore = {
    exposures: new Map(),
    conversions: new Map(),
    metrics: new Map(),
  };

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  /**
   * Track an experiment event
   */
  trackEvent(event: ExperimentEvent): void {
    if (!this.enabled) return;

    const experimentId = event.experimentId || event.flagKey || '';

    switch (event.type) {
      case 'exposure':
        this.addEvent(this.events.exposures, experimentId, event);
        break;

      case 'conversion':
        this.addEvent(this.events.conversions, experimentId, event);
        break;

      case 'metric':
        this.addEvent(this.events.metrics, experimentId, event);
        break;
    }
  }

  /**
   * Calculate experiment results
   */
  calculateResults(experiment: Experiment): Promise<ExperimentResults> {
    const exposures = this.events.exposures.get(experiment.id) || [];
    const conversions = this.events.conversions.get(experiment.id) || [];
    const metrics = this.events.metrics.get(experiment.id) || [];

    // Group events by variation
    const variationData = this.groupEventsByVariation(
      experiment,
      exposures,
      conversions,
      metrics
    );

    // Calculate results for each variation
    const variationResults = this.calculateVariationResults(
      experiment,
      variationData
    );

    // Determine winner and status
    const { winner, confidence, status } = this.determineWinner(
      variationResults,
      experiment
    );

    return {
      experimentId: experiment.id,
      status,
      startDate: experiment.startDate || new Date(),
      endDate: experiment.endDate,
      variations: variationResults,
      winner,
      confidence,
      sampleSize: exposures.length,
    };
  }

  /**
   * Calculate metrics for a variation
   */
  private calculateMetrics(
    experiment: Experiment,
    variationId: string,
    data: {
      exposures: ExperimentEvent[];
      conversions: ExperimentEvent[];
      metrics: ExperimentEvent[];
    },
    controlData: {
      exposures: ExperimentEvent[];
      conversions: ExperimentEvent[];
      metrics: ExperimentEvent[];
    } | null
  ): MetricResults[] {
    const results: MetricResults[] = [];

    for (const metric of experiment.metrics) {
      let value = 0;
      let sampleSize = 0;

      switch (metric.type) {
        case 'conversion':
          sampleSize = data.exposures.length;
          value =
            sampleSize > 0 ? (data.conversions.length / sampleSize) * 100 : 0;
          break;

        case 'revenue':
          const revenue = data.conversions.reduce(
            (sum: number, e: ExperimentEvent) => sum + (e.revenue || 0),
            0
          );
          sampleSize = data.conversions.length;
          value = sampleSize > 0 ? revenue / sampleSize : 0;
          break;

        case 'count':
          value = data.metrics.filter(
            (e: ExperimentEvent) => e.properties?.metricName === metric.name
          ).length;
          sampleSize = data.exposures.length;
          break;

        case 'duration':
        case 'percentage':
        case 'custom':
          const metricEvents = data.metrics.filter(
            (e: ExperimentEvent) => e.properties?.metricName === metric.name
          );
          if (metricEvents.length > 0) {
            const sum = metricEvents.reduce(
              (total: number, e: ExperimentEvent) => total + (e.value || 0),
              0
            );
            value = sum / metricEvents.length;
            sampleSize = metricEvents.length;
          }
          break;
      }

      // Calculate statistics
      const { standardError, pValue, uplift, significant } =
        this.calculateStatistics(
          value,
          sampleSize,
          controlData ? this.getControlValue(controlData, metric) : null
        );

      results.push({
        metricId: metric.id,
        value,
        confidence: significant ? 0.95 : 0,
        standardError,
        pValue,
        uplift,
        significant,
      });
    }

    return results;
  }

  /**
   * Get control value for comparison
   */
  private getControlValue(
    controlData: {
      exposures: ExperimentEvent[];
      conversions: ExperimentEvent[];
      metrics: ExperimentEvent[];
    },
    _metric: AnalyticsProperties
  ): { value: number; sampleSize: number } {
    // Simplified - in production would match the metric calculation logic
    const sampleSize = controlData.exposures.length;
    const conversionRate =
      sampleSize > 0 ? (controlData.conversions.length / sampleSize) * 100 : 0;

    return { value: conversionRate, sampleSize };
  }

  /**
   * Calculate statistical significance
   */
  private calculateStatistics(
    treatmentValue: number,
    treatmentSize: number,
    control: { value: number; sampleSize: number } | null
  ): {
    standardError: number;
    pValue: number;
    uplift: number;
    significant: boolean;
  } {
    if (!control || treatmentSize === 0 || control.sampleSize === 0) {
      return {
        standardError: 0,
        pValue: 1,
        uplift: 0,
        significant: false,
      };
    }

    // Calculate standard error (simplified)
    const treatmentRate = treatmentValue / 100;
    const controlRate = control.value / 100;

    const treatmentSE = Math.sqrt(
      (treatmentRate * (1 - treatmentRate)) / treatmentSize
    );
    const controlSE = Math.sqrt(
      (controlRate * (1 - controlRate)) / control.sampleSize
    );
    const standardError = Math.sqrt(treatmentSE ** 2 + controlSE ** 2);

    // Calculate z-score
    const zScore = (treatmentRate - controlRate) / standardError;

    // Calculate p-value (two-tailed)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

    // Calculate uplift
    const uplift =
      controlRate > 0 ? ((treatmentRate - controlRate) / controlRate) * 100 : 0;

    // Check significance at 95% confidence
    const significant = pValue < 0.05;

    return {
      standardError,
      pValue,
      uplift,
      significant,
    };
  }

  /**
   * Normal cumulative distribution function
   */
  private normalCDF(z: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * z);
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

    return 0.5 * (1.0 + sign * y);
  }

  /**
   * Determine experiment winner
   */
  private determineWinner(
    results: VariationResults[],
    experiment: Experiment
  ): {
    winner?: string;
    confidence?: number;
    status: ResultStatus;
  } {
    // Check minimum sample size
    const totalSample = results.reduce((sum, r) => sum + r.sampleSize, 0);
    if (totalSample < 100) {
      return { status: 'insufficient_data' };
    }

    // Find best performing variation for primary metric
    const primaryMetric = experiment.metrics[0];
    if (!primaryMetric) {
      return { status: 'no_winner' };
    }

    let bestVariation: string | undefined;
    let bestUplift = 0;
    let isSignificant = false;

    for (const result of results) {
      const metricResult = result.metrics.find(
        m => m.metricId === primaryMetric.id
      );
      if (
        metricResult &&
        metricResult.significant &&
        metricResult.uplift !== undefined &&
        metricResult.uplift > bestUplift
      ) {
        bestVariation = result.variationId;
        bestUplift = metricResult.uplift;
        isSignificant = true;
      }
    }

    if (isSignificant && bestVariation) {
      return {
        winner: bestVariation,
        confidence: 0.95,
        status: 'winner_found',
      };
    }

    return { status: 'no_winner' };
  }

  /**
   * Group events by variation
   */
  private groupEventsByVariation(
    experiment: Experiment,
    exposures: ExperimentEvent[],
    conversions: ExperimentEvent[],
    metrics: ExperimentEvent[]
  ): Map<
    string,
    {
      exposures: ExperimentEvent[];
      conversions: ExperimentEvent[];
      metrics: ExperimentEvent[];
    }
  > {
    const variationData = new Map<
      string,
      {
        exposures: ExperimentEvent[];
        conversions: ExperimentEvent[];
        metrics: ExperimentEvent[];
      }
    >();

    // Initialize variation data
    for (const variation of experiment.variations) {
      variationData.set(variation.id, {
        exposures: [],
        conversions: [],
        metrics: [],
      });
    }

    // Group exposures
    this.groupExposures(variationData, exposures);

    // Group conversions
    this.groupConversions(variationData, exposures, conversions);

    // Group metrics
    this.groupMetrics(variationData, exposures, metrics);

    return variationData;
  }

  /**
   * Group exposure events by variation
   */
  private groupExposures(
    variationData: Map<
      string,
      {
        exposures: ExperimentEvent[];
        conversions: ExperimentEvent[];
        metrics: ExperimentEvent[];
      }
    >,
    exposures: ExperimentEvent[]
  ): void {
    for (const event of exposures) {
      if (event.variationId && variationData.has(event.variationId)) {
        const data = variationData.get(event.variationId);
        if (data) {
          data.exposures.push(event);
        }
      }
    }
  }

  /**
   * Group conversion events by variation
   */
  private groupConversions(
    variationData: Map<
      string,
      {
        exposures: ExperimentEvent[];
        conversions: ExperimentEvent[];
        metrics: ExperimentEvent[];
      }
    >,
    exposures: ExperimentEvent[],
    conversions: ExperimentEvent[]
  ): void {
    for (const event of conversions) {
      const userExposure = exposures.find(e => e.userId === event.userId);
      if (userExposure && userExposure.variationId) {
        const data = variationData.get(userExposure.variationId);
        if (data) {
          data.conversions.push(event);
        }
      }
    }
  }

  /**
   * Group metric events by variation
   */
  private groupMetrics(
    variationData: Map<
      string,
      {
        exposures: ExperimentEvent[];
        conversions: ExperimentEvent[];
        metrics: ExperimentEvent[];
      }
    >,
    exposures: ExperimentEvent[],
    metrics: ExperimentEvent[]
  ): void {
    for (const event of metrics) {
      const userExposure = exposures.find(e => e.userId === event.userId);
      if (userExposure && userExposure.variationId) {
        const data = variationData.get(userExposure.variationId);
        if (data) {
          data.metrics.push(event);
        }
      }
    }
  }

  /**
   * Calculate results for each variation
   */
  private calculateVariationResults(
    experiment: Experiment,
    variationData: Map<
      string,
      {
        exposures: ExperimentEvent[];
        conversions: ExperimentEvent[];
        metrics: ExperimentEvent[];
      }
    >
  ): VariationResults[] {
    const variationResults: VariationResults[] = [];
    const controlVariation =
      experiment.variations.find(v => v.isControl) || experiment.variations[0];

    for (const variation of experiment.variations) {
      const data = variationData.get(variation.id);
      if (!data) continue;

      const uniqueUsers = new Set(data.exposures.map(e => e.userId));
      const convertedUsers = new Set(data.conversions.map(e => e.userId));

      const result: VariationResults = {
        variationId: variation.id,
        sampleSize: uniqueUsers.size,
        exposures: data.exposures.length,
        conversions: convertedUsers.size,
        metrics: this.calculateMetrics(
          experiment,
          variation.id,
          data,
          controlVariation.id === variation.id
            ? null
            : variationData.get(controlVariation.id)
        ),
      };

      variationResults.push(result);
    }

    return variationResults;
  }

  /**
   * Add event to store
   */
  private addEvent(
    store: Map<string, ExperimentEvent[]>,
    key: string,
    event: ExperimentEvent
  ): void {
    if (!store.has(key)) {
      store.set(key, []);
    }
    const events = store.get(key);
    if (events) {
      events.push(event);
    }
  }

  /**
   * Clear events for an experiment
   */
  clearEvents(experimentId: string): void {
    this.events.exposures.delete(experimentId);
    this.events.conversions.delete(experimentId);
    this.events.metrics.delete(experimentId);
  }

  /**
   * Get event counts
   */
  getEventCounts(experimentId: string): {
    exposures: number;
    conversions: number;
    metrics: number;
  } {
    return {
      exposures: this.events.exposures.get(experimentId)?.length || 0,
      conversions: this.events.conversions.get(experimentId)?.length || 0,
      metrics: this.events.metrics.get(experimentId)?.length || 0,
    };
  }
}
