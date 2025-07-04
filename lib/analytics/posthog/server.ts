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

import { PostHog } from 'posthog-node';
import { headers } from 'next/headers';
import { logger } from '@/lib/utils/logger';

/**
 * PostHog Server-Side Analytics Client
 *
 * Provides server-side event tracking for:
 * - API endpoints
 * - Background jobs
 * - Server-side rendering
 * - Webhook processing
 */

// Singleton instance
let posthogClient: PostHog | null = null;

// Initialize PostHog client
export const getPostHogClient = (): PostHog | null => {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    logger.warn('PostHog API key not configured');
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      flushAt: 20, // Batch size
      flushInterval: 10000, // 10 seconds
    });
  }

  return posthogClient;
};

// Capture server-side event
export const captureServerEvent = async (
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) => {
  try {
    const client = getPostHogClient();
    if (!client) return;

    // Get request headers for context
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ip =
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown';

    client.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        $ip: ip,
        $user_agent: userAgent,
        source: 'api',
        server_timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to capture PostHog event', { error, event });
  }
};

// Identify user server-side
export const identifyServerUser = (
  userId: string,
  properties?: Record<string, unknown>
) => {
  try {
    const client = getPostHogClient();
    if (!client) return;

    client.identify({
      distinctId: userId,
      properties: {
        ...properties,
        identified_at: new Date().toISOString(),
        source: 'server',
      },
    });
  } catch (error) {
    logger.error('Failed to identify user in PostHog', { error, userId });
  }
};

// Track feature flag usage
export const trackFeatureFlagUsage = async (
  userId: string,
  flagName: string,
  variant: string | boolean
) => {
  try {
    await captureServerEvent(userId, '$feature_flag_called', {
      $feature_flag: flagName,
      $feature_flag_response: variant,
    });
  } catch (error) {
    logger.error('Failed to track feature flag usage', { error, flagName });
  }
};

// Track API performance
export const trackAPIPerformance = async (
  userId: string,
  apiData: {
    endpoint: string;
    method: string;
    statusCode: number;
    duration: number;
  }
) => {
  try {
    const { endpoint, method, statusCode, duration } = apiData;
    await captureServerEvent(userId, 'api_request', {
      endpoint,
      method,
      status_code: statusCode,
      duration_ms: duration,
      success: statusCode >= 200 && statusCode < 400,
    });
  } catch (error) {
    logger.error('Failed to track API performance', {
      error,
      endpoint: apiData.endpoint,
    });
  }
};

// Track error
export const trackServerError = async (
  userId: string,
  error: Error | unknown,
  context?: Record<string, unknown>
) => {
  try {
    const errorDetails =
      error instanceof Error
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack,
          }
        : {
            message: String(error),
          };

    await captureServerEvent(userId, 'server_error', {
      ...errorDetails,
      ...context,
    });
  } catch (trackingError) {
    logger.error('Failed to track error in PostHog', {
      trackingError,
      originalError: error,
    });
  }
};

// Batch events
export const batchServerEvents = async (
  events: Array<{
    distinctId: string;
    event: string;
    properties?: Record<string, unknown>;
  }>
) => {
  try {
    const client = getPostHogClient();
    if (!client) return;

    events.forEach(({ distinctId, event, properties }) => {
      client.capture({
        distinctId,
        event,
        properties: {
          ...properties,
          source: 'api_batch',
          server_timestamp: new Date().toISOString(),
        },
      });
    });

    // Force flush
    await client.flush();
  } catch (error) {
    logger.error('Failed to batch capture PostHog events', { error });
  }
};

// Shutdown gracefully
export const shutdownPostHog = async () => {
  try {
    const client = getPostHogClient();
    if (!client) return;

    await client.shutdown();
    posthogClient = null;
  } catch (error) {
    logger.error('Failed to shutdown PostHog client', { error });
  }
};

// Middleware helper for automatic API tracking
export const withPostHogTracking = (
  handler: (req: Request, ...args: unknown[]) => Promise<Response>
) => {
  return async (req: Request, ...args: unknown[]): Promise<Response> => {
    const startTime = Date.now();
    let response: Response;
    let userId = 'anonymous';

    try {
      // Extract user ID from request if available
      // This would typically come from your auth middleware
      // userId = await getUserIdFromRequest(req);

      response = await handler(req, ...args);

      // Track successful API call
      const duration = Date.now() - startTime;
      await trackAPIPerformance(userId, {
        endpoint: req.url || '',
        method: req.method || 'GET',
        statusCode: response.status || 200,
        duration: duration,
      });

      return response;
    } catch (error) {
      // Track error
      const duration = Date.now() - startTime;
      await trackServerError(userId, error, {
        endpoint: req.url,
        method: req.method,
        duration_ms: duration,
      });

      throw error;
    }
  };
};

// Event name constants (matching client-side)
export { EVENTS, USER_PROPERTIES } from './client';
