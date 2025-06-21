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

import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/utils/logger';
import {
  API_VERSION_CONFIG,
  createVersionedResponse,
  extractApiVersion,
} from '@/middleware/api-version';

/**
 * Base API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  version?: string;
  timestamp?: string;
}

/**
 * Create a standardized API success response
 */
export function apiSuccess<T>(
  data: T,
  options?: {
    message?: string;
    status?: number;
    headers?: HeadersInit;
  }
): NextResponse {
  const { message, status = 200, headers } = options || {};

  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  return createVersionedResponse(response, { status, headers });
}

/**
 * Create a standardized API error response
 */
export function apiError(
  error: string | Error,
  options?: {
    status?: number;
    headers?: HeadersInit;
    data?: unknown;
  }
): NextResponse {
  const { status = 400, headers, data } = options || {};

  const errorMessage = error instanceof Error ? error.message : error;

  const response: ApiResponse = {
    success: false,
    error: errorMessage,
    data,
    timestamp: new Date().toISOString(),
  };

  return createVersionedResponse(response, { status, headers });
}

/**
 * Get the API version from the current request
 */
export function getApiVersion(request: NextRequest): string {
  return (
    extractApiVersion(request.nextUrl.pathname) ||
    API_VERSION_CONFIG._currentVersion
  );
}

/**
 * Version-aware API handler wrapper
 * Provides version context and standard error handling
 * Supports Next.js App Router route handlers
 */
export type RouteContext = { params: Promise<Record<string, string>> };
type RouteHandler<T> = (
  request: NextRequest,
  context?: RouteContext
) => Promise<T> | T;

export function versionedApiHandler<TReturn = NextResponse>(
  handler: RouteHandler<TReturn>
): RouteHandler<TReturn | NextResponse> {
  return async (request: NextRequest, context?: RouteContext) => {
    try {
      const version = getApiVersion(request);

      // Add version to request context
      const versionedRequest = Object.assign(request, { apiVersion: version });

      // Call handler with versioned request
      const result = await handler(versionedRequest, context);

      // If the handler returns a NextResponse, add version headers
      if (result instanceof Response) {
        result.headers.set('X-API-Handler-Version', version);
      }

      return result;
    } catch (error) {
      logger.error('API Handler Error:', error as Error);

      // Return standardized error response
      if (error instanceof Error) {
        return apiError(error, { status: 500 });
      }

      return apiError('Internal Server Error', { status: 500 });
    }
  };
}

/**
 * Helper to create route imports that support versioning
 */
export function createVersionedRoute(routePath: string) {
  return {
    v1: `/api/v1/${routePath}`,
    current: `/api/${API_VERSION_CONFIG._currentVersion}/${routePath}`,
    legacy: `/api/${routePath}`, // For backward compatibility
  };
}

/**
 * Utility to generate API documentation headers
 */
export function generateApiDocHeaders(
  endpoint: string,
  methods: string[]
): Record<string, string> {
  return {
    'X-API-Endpoint': endpoint,
    'X-API-Methods': methods.join(', '),
    'X-API-Version-Required': API_VERSION_CONFIG._currentVersion,
    'X-API-Documentation': `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/docs/api/${API_VERSION_CONFIG._currentVersion}/${endpoint}`,
  };
}
