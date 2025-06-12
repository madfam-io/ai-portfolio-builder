/**
 * @fileoverview Client-side hook for A/B testing experiments
 *
 * Provides React hooks for accessing experiment data and tracking
 * events in landing page A/B tests.
 */

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import { logger } from '@/lib/utils/logger';
import type {
  GetActiveExperimentResponse,
  ComponentConfig,
} from '@/types/experiments';

/**
 * Experiment context data
 */
interface ExperimentContext {
  experimentId?: string;
  variantId?: string;
  variantName?: string;
  components: ComponentConfig[];
  themeOverrides: Record<string, string | number | boolean>;
  isLoading: boolean;
  error?: Error;
}

/**
 * Hook for accessing current experiment data
 */
export function useExperiment(): ExperimentContext {
  const [context, setContext] = useState<ExperimentContext>({
    components: [],
    themeOverrides: {},
    isLoading: true,
  });
  const pathname = usePathname();

  useEffect(() => {
    // Only run on landing page
    if (pathname !== '/') {
      setContext(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchExperiment = async (): Promise<void> => {
      try {
        const response = await fetch('/api/v1/experiments/active', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch experiment');
        }

        const data: GetActiveExperimentResponse | null = await response.json();

        if (data) {
          setContext({
            experimentId: data.experimentId,
            variantId: data.variantId,
            variantName: data.variantName,
            components: data.components,
            themeOverrides: data.themeOverrides as Record<string, string | number | boolean>,
            isLoading: false,
          });
        } else {
          setContext({
            components: [],
            themeOverrides: {},
            isLoading: false,
          });
        }
      } catch (error) {
        logger.error('Failed to load experiment', error as Error);
        setContext({
          components: [],
          themeOverrides: {},
          isLoading: false,
          error: error as Error,
        });
      }
    };

    fetchExperiment();
  }, [pathname]);

  return context;
}

/**
 * Hook for tracking experiment events
 */
export function useExperimentTracking(): {
  trackClick: (element: string, additionalData?: Record<string, string | number | boolean>) => Promise<void>;
  trackConversion: (conversionType: string, value?: number, metadata?: Record<string, string | number | boolean>) => Promise<void>;
  trackEngagement: (metrics: Record<string, number>) => Promise<void>;
} {
  const { experimentId, variantId } = useExperiment();

  /**
   * Track a click event
   */
  const trackClick = useCallback(
    async (element: string, additionalData?: Record<string, string | number | boolean>) => {
      if (!experimentId || !variantId) return;

      try {
        await fetch('/api/v1/experiments/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            experimentId,
            variantId,
            eventType: 'click',
            eventData: {
              element,
              ...additionalData,
            },
          }),
        });
      } catch (error) {
        logger.error('Failed to track click', error as Error);
      }
    },
    [experimentId, variantId]
  );

  /**
   * Track a conversion event
   */
  const trackConversion = useCallback(
    async (
      conversionType: string,
      value?: number,
      metadata?: Record<string, string | number | boolean>
    ) => {
      if (!experimentId || !variantId) return;

      try {
        await fetch('/api/v1/experiments/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            experimentId,
            variantId,
            eventType: 'conversion',
            eventData: {
              type: conversionType,
              value,
              ...metadata,
            },
          }),
        });
      } catch (error) {
        logger.error('Failed to track conversion', error as Error);
      }
    },
    [experimentId, variantId]
  );

  /**
   * Track engagement metrics (scroll depth, time on page)
   */
  const trackEngagement = useCallback(
    async (metrics: { scrollDepth?: number; timeOnPage?: number }) => {
      if (!experimentId || !variantId) return;

      try {
        await fetch('/api/v1/experiments/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            experimentId,
            variantId,
            eventType: 'engagement',
            eventData: metrics,
          }),
        });
      } catch (error) {
        logger.error('Failed to track engagement', error as Error);
      }
    },
    [experimentId, variantId]
  );

  return {
    trackClick,
    trackConversion,
    trackEngagement,
  };
}

/**
 * Hook to check if a specific component variant is active
 */
export function useComponentVariant(componentType: string): {
  variant: string | null;
  props: Record<string, string | number | boolean | Record<string, unknown>>;
  isVisible: boolean;
} {
  const { components } = useExperiment();

  const component = components.find(c => c.type === componentType);

  return {
    variant: component?.variant || null,
    props: component?.props || {},
    isVisible: component?.visible ?? true,
  };
}

/**
 * Hook to get theme overrides from experiment
 */
export function useExperimentTheme(): Record<string, string | number | boolean> {
  const { themeOverrides } = useExperiment();

  useEffect(() => {
    // Apply theme overrides to CSS variables
    if (themeOverrides && Object.keys(themeOverrides).length > 0) {
      const root = document.documentElement;

      Object.entries(themeOverrides).forEach(([key, value]) => {
        if (key === 'primaryColor') {
          root.style.setProperty('--color-primary', value as string);
        } else if (key === 'secondaryColor') {
          root.style.setProperty('--color-secondary', value as string);
        } else if (key === 'fontFamily') {
          root.style.setProperty('--font-family', value as string);
        } else if (key === 'borderRadius') {
          root.style.setProperty('--border-radius', value as string);
        } else if (key === 'spacing') {
          const spacingMap = {
            compact: '0.75',
            normal: '1',
            relaxed: '1.25',
          };
          root.style.setProperty(
            '--spacing-multiplier',
            spacingMap[value as keyof typeof spacingMap]
          );
        }
      });

      // Cleanup function to reset styles
      return () => {
        root.style.removeProperty('--color-primary');
        root.style.removeProperty('--color-secondary');
        root.style.removeProperty('--font-family');
        root.style.removeProperty('--border-radius');
        root.style.removeProperty('--spacing-multiplier');
      };
    }

    // Return undefined when no theme overrides
    return undefined;
  }, [themeOverrides]);

  return themeOverrides;
}

/**
 * Get component configuration by type
 */
export function getComponentConfig(
  components: ComponentConfig[],
  type: string
): ComponentConfig | undefined {
  return components.find(c => c.type === type);
}

/**
 * Sort components by order
 */
export function sortComponentsByOrder(
  components: ComponentConfig[]
): ComponentConfig[] {
  return [...components].sort((a, b) => a.order - b.order);
}
