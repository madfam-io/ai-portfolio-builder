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
 * React hooks for experiments
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useExperimentsContext } from './ExperimentsProvider';
import type {
  Assignment,
  FeatureFlagAssignment,
  ExperimentResults,
  Variation,
} from '../core/types';

/**
 * Hook to get experiment variation
 */
export function useExperiment(experimentId: string): {
  variation: Variation | null;
  loading: boolean;
  error: Error | null;
  trackConversion: (
    eventName: string,
    properties?: Record<string, unknown>
  ) => Promise<void>;
  trackMetric: (
    metricName: string,
    value: number,
    properties?: Record<string, unknown>
  ) => Promise<void>;
} {
  const { experiments, user, ready } = useExperimentsContext();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ready || !experiments || !user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchVariation() {
      try {
        setLoading(true);
        const result = await experiments.getVariation(experimentId, user);
        if (!cancelled) {
          setAssignment(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setAssignment(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchVariation();

    return () => {
      cancelled = true;
    };
  }, [experiments, experimentId, user, ready]);

  const trackConversion = useCallback(
    async (eventName: string, properties?: Record<string, unknown>) => {
      if (!experiments || !user) return;
      await experiments.trackConversion(
        experimentId,
        user.userId,
        eventName,
        properties
      );
    },
    [experiments, experimentId, user]
  );

  const trackMetric = useCallback(
    async (
      metricName: string,
      value: number,
      properties?: Record<string, unknown>
    ) => {
      if (!experiments || !user) return;
      await experiments.trackMetric(
        experimentId,
        user.userId,
        metricName,
        value,
        properties
      );
    },
    [experiments, experimentId, user]
  );

  const variation = useMemo(() => {
    if (!assignment || !assignment.eligible || !experiments) return null;

    // Get the experiment to find the variation details
    // In a real implementation, this would be cached or included in the assignment
    return null; // Simplified for now
  }, [assignment, experiments]);

  return {
    variation,
    loading,
    error,
    trackConversion,
    trackMetric,
  };
}

/**
 * Hook to evaluate feature flag
 */
export function useFeatureFlag(
  flagKey: string,
  defaultValue?: unknown
): {
  enabled: boolean;
  value: unknown;
  loading: boolean;
  error: Error | null;
} {
  const { experiments, user, ready } = useExperimentsContext();
  const [assignment, setAssignment] = useState<FeatureFlagAssignment | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ready || !experiments || !user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function evaluateFlag() {
      try {
        setLoading(true);
        const result = await experiments.evaluateFlag(
          flagKey,
          user,
          defaultValue
        );
        if (!cancelled) {
          setAssignment(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setAssignment(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    evaluateFlag();

    return () => {
      cancelled = true;
    };
  }, [experiments, flagKey, user, defaultValue, ready]);

  return {
    enabled: assignment?.enabled || false,
    value: assignment?.value ?? defaultValue ?? false,
    loading,
    error,
  };
}

/**
 * Hook to get experiment results
 */
export function useExperimentResults(experimentId: string): {
  results: ExperimentResults | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const { experiments, ready } = useExperimentsContext();
  const [results, setResults] = useState<ExperimentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchResults = useCallback(async () => {
    if (!experiments) return;

    try {
      setLoading(true);
      const data = await experiments.getResults(experimentId);
      setResults(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [experiments, experimentId]);

  useEffect(() => {
    if (!ready || !experiments) {
      setLoading(false);
      return;
    }

    fetchResults();
  }, [fetchResults, ready, experiments]);

  return {
    results,
    loading,
    error,
    refresh: fetchResults,
  };
}

/**
 * Hook for multiple feature flags
 */
export function useFeatureFlags(flagKeys: string[]): {
  flags: Record<string, boolean>;
  values: Record<string, unknown>;
  loading: boolean;
  error: Error | null;
} {
  const { experiments, user, ready } = useExperimentsContext();
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ready || !experiments || !user || flagKeys.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    // eslint-disable-next-line @madfam/performance-impact
    async function evaluateFlags() {
      try {
        setLoading(true);
        // Performance optimization: Use Promise.all for concurrent flag evaluation
        const results = await Promise.allSettled(
          flagKeys.map(key =>
            experiments
              .evaluateFlag(key, user)
              .then(result => ({ key, result }))
          )
        );

        if (!cancelled) {
          const flagsMap: Record<string, boolean> = {};
          const valuesMap: Record<string, unknown> = {};

          results.forEach(result => {
            if (result.status === 'fulfilled') {
              const { key, result: flagResult } = result.value;
              flagsMap[key] = flagResult.enabled;
              valuesMap[key] = flagResult.value;
            }
          });

          setFlags(flagsMap);
          setValues(valuesMap);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setFlags({});
          setValues({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    evaluateFlags();

    return () => {
      cancelled = true;
    };
  }, [experiments, user, flagKeys.join(','), ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    flags,
    values,
    loading,
    error,
  };
}
