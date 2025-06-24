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

'use client';

import { useCallback, useEffect, useRef } from 'react';
import type {
  EventProperties,
  UserProperties,
  TrackOptions,
  AnalyticsHookResult,
  TypeSafeTrack,
} from '../core/types';
import { useAnalyticsContext } from './provider';

/**
 * Primary analytics hook
 */
export function useAnalytics(): AnalyticsHookResult {
  const { client, isReady } = useAnalyticsContext();

  const track = useCallback<TypeSafeTrack>(
    async (event, properties, options) => {
      if (client && isReady) {
        await client.track(event as string, properties, options);
      }
    },
    [client, isReady]
  );

  const identify = useCallback(
    async (userId: string, traits?: UserProperties) => {
      if (client && isReady) {
        await client.identify(userId, traits);
      }
    },
    [client, isReady]
  );

  const page = useCallback(
    async (name?: string, properties?: EventProperties) => {
      if (client && isReady) {
        await client.page(name, properties);
      }
    },
    [client, isReady]
  );

  const group = useCallback(
    async (groupId: string, traits?: UserProperties) => {
      if (client && isReady) {
        await client.group(groupId, traits);
      }
    },
    [client, isReady]
  );

  const reset = useCallback(async () => {
    if (client && isReady) {
      await client.reset();
    }
  }, [client, isReady]);

  return {
    track,
    identify,
    page,
    group,
    reset,
    isReady,
  };
}

/**
 * Hook for tracking page views
 */
export function usePageTracking(name?: string, properties?: EventProperties) {
  const { page } = useAnalytics();

  useEffect(() => {
    page(name, properties);
  }, [page, name, properties]);
}

/**
 * Hook for tracking user identification
 */
export function useUserTracking(
  userId: string | null,
  traits?: UserProperties
) {
  const { identify, reset } = useAnalytics();

  useEffect(() => {
    if (userId) {
      identify(userId, traits);
    } else {
      reset();
    }
  }, [identify, reset, userId, traits]);
}

/**
 * Hook for tracking events with automatic cleanup
 */
export function useEventTracker(
  event: string,
  properties?: EventProperties,
  options?: TrackOptions & {
    immediate?: boolean;
    dependencies?: React.DependencyList;
  }
) {
  const { track } = useAnalytics();
  const {
    immediate = false,
    dependencies = [],
    ...trackOptions
  } = options || {};

  const trackEvent = useCallback(() => {
    track(
      event as keyof import('../core/types').EventCatalog,
      properties,
      trackOptions
    );
  }, [track, event, properties, trackOptions]);

  useEffect(() => {
    if (immediate) {
      trackEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, trackEvent, ...dependencies]);

  return trackEvent;
}

/**
 * Hook for tracking form interactions
 */
export function useFormTracking(formName: string) {
  const { track } = useAnalytics();

  const trackFormStart = useCallback(() => {
    track('Form Started' as keyof import('../core/types').EventCatalog, {
      form_name: formName,
    });
  }, [track, formName]);

  const trackFormSubmit = useCallback(
    (success = true, errors?: string[]) => {
      track('Form Submitted' as keyof import('../core/types').EventCatalog, {
        form_name: formName,
        success,
        errors: errors?.join(', '),
      });
    },
    [track, formName]
  );

  const trackFieldInteraction = useCallback(
    (fieldName: string, action: 'focus' | 'blur' | 'change') => {
      track(
        'Form Field Interaction' as keyof import('../core/types').EventCatalog,
        {
          form_name: formName,
          field_name: fieldName,
          action,
        }
      );
    },
    [track, formName]
  );

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldInteraction,
  };
}

/**
 * Hook for tracking component visibility
 */
export function useVisibilityTracking(
  elementRef: React.RefObject<HTMLElement>,
  event: string,
  properties?: EventProperties,
  options?: {
    threshold?: number;
    once?: boolean;
  }
) {
  const { track } = useAnalytics();
  const hasTracked = useRef(false);
  const { threshold = 0.5, once = true } = options || {};

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            if (!once || !hasTracked.current) {
              track(event as keyof import('../core/types').EventCatalog, {
                ...properties,
                visibility_threshold: threshold,
                intersection_ratio: entry.intersectionRatio,
              });
              hasTracked.current = true;
            }
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, track, event, properties, threshold, once]);
}

/**
 * Hook for tracking performance metrics
 */
export function usePerformanceTracking() {
  const { track } = useAnalytics();

  const trackPerformance = useCallback(
    (metricName: string, value: number, unit = 'ms') => {
      track(
        'Performance Metric' as keyof import('../core/types').EventCatalog,
        {
          metric_name: metricName,
          value,
          unit,
          timestamp: Date.now(),
        }
      );
    },
    [track]
  );

  const trackPageLoad = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        track(
          'Page Load Performance' as keyof import('../core/types').EventCatalog,
          {
            load_time: Math.round(
              navigation.loadEventEnd - navigation.loadEventStart
            ),
            dom_ready: Math.round(
              navigation.domContentLoadedEventEnd -
                navigation.domContentLoadedEventStart
            ),
            first_paint: Math.round(
              navigation.responseEnd - navigation.requestStart
            ),
            total_time: Math.round(
              navigation.loadEventEnd - navigation.fetchStart
            ),
          }
        );
      }
    }
  }, [track]);

  useEffect(() => {
    // Track page load performance when component mounts
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad, { once: true });
      return () => window.removeEventListener('load', trackPageLoad);
    }
  }, [trackPageLoad]);

  return {
    trackPerformance,
    trackPageLoad,
  };
}

/**
 * Hook for tracking scroll depth
 */
export function useScrollTracking(thresholds = [25, 50, 75, 90, 100]) {
  const { track } = useAnalytics();
  const trackedThresholds = useRef(new Set<number>());

  useEffect(() => {
    const trackScrollDepth = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

      thresholds.forEach(threshold => {
        if (
          scrollPercent >= threshold &&
          !trackedThresholds.current.has(threshold)
        ) {
          trackedThresholds.current.add(threshold);
          track('Scroll Depth' as keyof import('../core/types').EventCatalog, {
            depth_percent: threshold,
            page_url: window.location.href,
          });
        }
      });
    };

    const throttledTrackScrollDepth = throttle(trackScrollDepth, 500);

    window.addEventListener('scroll', throttledTrackScrollDepth);
    return () =>
      window.removeEventListener('scroll', throttledTrackScrollDepth);
  }, [track, thresholds]);
}

/**
 * Utility function to throttle function calls
 */
function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
