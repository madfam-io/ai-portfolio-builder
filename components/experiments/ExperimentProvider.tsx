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
 * @fileoverview Universal Experiment Provider Component
 *
 * Top-level provider that wraps the entire application to enable
 * experiments everywhere. Handles user identification, context detection,
 * and provides experiment state to all child components.
 *
 * @author PRISMA Business Team
 * @version 2.0.0 - Universal Platform
 */

'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { UniversalExperimentProvider } from '@/lib/hooks/use-universal-experiment';
import { ExperimentContext } from '@/lib/experimentation/universal-experiments';

interface ExperimentProviderProps {
  children: ReactNode;
  userId?: string | null;
  initialUserContext?: Record<string, unknown>;
}

/**
 * Main experiment provider that wraps the application
 */
export function ExperimentProvider({
  children,
  userId = null,
  initialUserContext = {},
}: ExperimentProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [userContext, setUserContext] =
    useState<Record<string, unknown>>(initialUserContext);

  // Update user context based on navigation and URL parameters
  useEffect(() => {
    const context: Record<string, unknown> = {
      ...initialUserContext,
      pathname,
      timestamp: Date.now(),
    };

    // Extract UTM parameters
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');

    if (utmSource) context.utmSource = utmSource;
    if (utmMedium) context.utmMedium = utmMedium;
    if (utmCampaign) context.utmCampaign = utmCampaign;

    // Detect device type
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/mobile|android|iphone|ipod/.test(userAgent)) {
        context.device = 'mobile';
      } else if (/tablet|ipad/.test(userAgent)) {
        context.device = 'tablet';
      } else {
        context.device = 'desktop';
      }

      // Detect browser
      if (userAgent.includes('chrome')) context.browser = 'chrome';
      else if (userAgent.includes('firefox')) context.browser = 'firefox';
      else if (userAgent.includes('safari')) context.browser = 'safari';
      else if (userAgent.includes('edge')) context.browser = 'edge';
      else context.browser = 'other';

      // Screen resolution
      context.screenWidth = window.screen.width;
      context.screenHeight = window.screen.height;

      // Referrer
      if (document.referrer) {
        context.referrer = document.referrer;
      }

      // Language
      context.language = navigator.language;

      // Timezone
      context.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Local storage for user behavior tracking
      try {
        const visits = localStorage.getItem('prisma_visit_count');
        context.visitCount = visits ? parseInt(visits) + 1 : 1;
        localStorage.setItem(
          'prisma_visit_count',
          (context.visitCount as number).toString()
        );

        const lastVisit = localStorage.getItem('prisma_last_visit');
        if (lastVisit) {
          context.daysSinceLastVisit = Math.floor(
            (Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60 * 24)
          );
        }
        localStorage.setItem('prisma_last_visit', Date.now().toString());

        // User segment based on behavior
        if ((context.visitCount as number) === 1) {
          context.userSegment = 'new_user';
        } else if ((context.visitCount as number) <= 3) {
          context.userSegment = 'exploring_user';
        } else {
          context.userSegment = 'returning_user';
        }
      } catch (_error) {
        // localStorage not available - silently continue
      }
    }

    // Page context detection
    context.pageContext = detectPageContext(pathname);

    setUserContext(context);
  }, [pathname, searchParams, initialUserContext]);

  return (
    <UniversalExperimentProvider userId={userId} userContext={userContext}>
      <ExperimentDebugInfo
        show={searchParams.get('debug_experiments') === 'true'}
      />
      {children}
    </UniversalExperimentProvider>
  );
}

/**
 * Detect the current page context for experiments
 */
function detectPageContext(pathname: string): ExperimentContext {
  if (pathname === '/' || pathname.startsWith('/landing')) {
    return 'landing_page';
  }
  if (pathname.startsWith('/editor')) {
    return 'editor';
  }
  if (pathname.startsWith('/onboarding')) {
    return 'onboarding';
  }
  if (pathname.startsWith('/pricing')) {
    return 'pricing';
  }
  if (pathname.startsWith('/upgrade')) {
    return 'upgrade_flow';
  }
  if (pathname.startsWith('/dashboard')) {
    return 'dashboard';
  }
  if (pathname.startsWith('/checkout')) {
    return 'checkout';
  }
  if (pathname.startsWith('/analytics')) {
    return 'analytics';
  }

  return 'global';
}

/**
 * Debug component to show experiment information (when debug=true)
 */
function ExperimentDebugInfo({ show }: { show: boolean }) {
  const [debugInfo, setDebugInfo] = useState<{
    experiments: Array<unknown>;
    userContext: Record<string, unknown>;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    if (!show) return;

    // In development, show experiment debug information
    if (process.env.NODE_ENV === 'development') {
      const info = {
        experiments: [],
        userContext: {},
        timestamp: new Date().toISOString(),
      };
      setDebugInfo(info);
    }
  }, [show]);

  if (!show || !debugInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm">
      <div className="font-bold mb-2">🧪 Experiment Debug</div>
      <pre className="whitespace-pre-wrap text-xs">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}

/**
 * HOC for components that need experiment context
 */
export function withExperiments<P extends object>(
  Component: React.ComponentType<P>,
  _experimentConfig?: {
    context: ExperimentContext;
    componentId: string;
    autoTrack?: boolean;
  }
) {
  return function ExperimentWrappedComponent(props: P) {
    return <Component {...props} />;
  };
}

/**
 * Utility component for conditional rendering based on experiments
 */
export function ExperimentGate({
  experimentId: _experimentId,
  variant: _variant,
  children,
  fallback: _fallback = null,
}: {
  experimentId: string;
  variant: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  // This would check if the user is in the specified variant
  // For now, return children as a placeholder
  return <>{children}</>;
}

/**
 * Component for A/B testing content
 */
export function ABTestContent({
  variants: _variants,
  defaultContent,
}: {
  variants: Record<string, ReactNode>;
  defaultContent: ReactNode;
}) {
  // This would select the appropriate variant based on user assignment
  // For now, return default content as placeholder
  return <>{defaultContent}</>;
}

/**
 * Hook for experiment-aware navigation
 */
export function useExperimentNavigation() {
  const navigate = (path: string, experimentData?: Record<string, unknown>) => {
    // Enhanced navigation that tracks experiment context
    const url = new URL(path, window.location.origin);

    if (experimentData) {
      Object.entries(experimentData).forEach(([key, value]) => {
        url.searchParams.set(`exp_${key}`, String(value));
      });
    }

    window.location.href = url.toString();
  };

  return { navigate };
}

/**
 * Utility for experiment-specific CSS classes
 */
export function useExperimentStyles(
  baseClasses: string,
  _variantClasses?: Record<string, string>
): string {
  // This would return classes based on active experiment variant
  // For now, return base classes
  return baseClasses;
}

/**
 * Component for experiment-specific styling
 */
export function ExperimentStyles({
  experimentId: _experimentId,
  variants: _variants,
}: {
  experimentId: string;
  variants: Record<string, React.CSSProperties>;
}) {
  // This would inject CSS based on experiment variant
  return null;
}
