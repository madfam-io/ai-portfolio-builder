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

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AnalyticsConfig, AnalyticsContextValue } from '../core/types';
import { UniversalAnalyticsClient } from '../core/analytics-client';

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export interface AnalyticsProviderProps {
  config: AnalyticsConfig;
  children: React.ReactNode;
  /**
   * Auto-initialize analytics on mount
   */
  autoInitialize?: boolean;
  /**
   * Auto-track page views
   */
  autoTrackPageViews?: boolean;
}

/**
 * Analytics Provider Component
 *
 * Provides analytics context to the React component tree
 */
export function AnalyticsProvider({
  config,
  children,
  autoInitialize = true,
  autoTrackPageViews = true,
}: AnalyticsProviderProps) {
  const [client] = useState(() => new UniversalAnalyticsClient(config));
  const [isReady, setIsReady] = useState(false);
  const [isEnabled, setIsEnabled] = useState(!config.disabled);

  useEffect(() => {
    if (autoInitialize && isEnabled) {
      client.initialize().then(() => {
        setIsReady(client.isReady());
      });
    }
  }, [client, autoInitialize, isEnabled]);

  useEffect(() => {
    client.setEnabled(isEnabled);
  }, [client, isEnabled]);

  useEffect(() => {
    if (autoTrackPageViews && isReady && isEnabled) {
      // Track initial page view
      client.page();

      // Track page views on route changes (for SPAs)
      const handleRouteChange = () => {
        client.page();
      };

      // Listen for navigation events
      window.addEventListener('popstate', handleRouteChange);

      // For Next.js and other SPA frameworks
      if (typeof window !== 'undefined' && 'history' in window) {
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;

        window.history.pushState = function (...args) {
          originalPushState.apply(window.history, args);
          handleRouteChange();
        };

        window.history.replaceState = function (...args) {
          originalReplaceState.apply(window.history, args);
          handleRouteChange();
        };

        return () => {
          window.removeEventListener('popstate', handleRouteChange);
          window.history.pushState = originalPushState;
          window.history.replaceState = originalReplaceState;
        };
      }
    }
  }, [client, autoTrackPageViews, isReady, isEnabled]);

  const contextValue: AnalyticsContextValue = {
    client,
    isReady,
    isEnabled,
    setEnabled: setIsEnabled,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to access analytics context
 */
export function useAnalyticsContext(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error(
      'useAnalyticsContext must be used within an AnalyticsProvider'
    );
  }

  return context;
}
