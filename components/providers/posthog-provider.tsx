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

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  usePostHog,
  captureEvent,
  EVENTS,
} from '@/lib/analytics/posthog/client';

/**
 * PostHog Provider Component
 *
 * Handles:
 * - PostHog initialization
 * - Automatic page view tracking
 * - User identification
 * - Route change tracking
 */

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize PostHog and handle user identification
  usePostHog();

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      // Capture page view with enhanced properties
      captureEvent('$pageview', {
        $current_url: window.location.href,
        $pathname: pathname,
        $search: searchParams?.toString() || '',
        $referrer: document.referrer,
        $referring_domain: document.referrer
          ? new URL(document.referrer).hostname
          : null,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
      });

      // Track specific page types
      if (pathname.startsWith('/editor')) {
        captureEvent(EVENTS.EDITOR_OPENED, {
          portfolio_id: pathname.split('/')[2],
        });
      } else if (pathname.startsWith('/portfolio/')) {
        captureEvent(EVENTS.PORTFOLIO_VIEWED, {
          portfolio_slug: pathname.split('/')[2],
          is_preview: searchParams?.get('preview') === 'true',
        });
      }
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
