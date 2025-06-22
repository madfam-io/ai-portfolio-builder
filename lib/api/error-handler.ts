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

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { apiError } from '@/lib/api/versioning';
import { logger } from '@/lib/utils/logger';

/**
 * Centralized API Error Handler
 * Provides consistent error handling and logging across all API routes
 */

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  retryable?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Error type mapping for consistent error responses
 */
const ERROR_TYPES = {
  VALIDATION_ERROR: { statusCode: 400, code: 'VALIDATION_ERROR' },
  AUTHENTICATION_ERROR: { statusCode: 401, code: 'AUTHENTICATION_ERROR' },
  AUTHORIZATION_ERROR: { statusCode: 403, code: 'AUTHORIZATION_ERROR' },
  NOT_FOUND: { statusCode: 404, code: 'NOT_FOUND' },
  RATE_LIMIT_ERROR: { statusCode: 429, code: 'RATE_LIMIT_ERROR' },
  INTERNAL_ERROR: { statusCode: 500, code: 'INTERNAL_ERROR' },
  SERVICE_UNAVAILABLE: { statusCode: 503, code: 'SERVICE_UNAVAILABLE' },
} as const;

/**
 * Creates a standardized API error
 */
export function createApiError(
  message: string,
  type: keyof typeof ERROR_TYPES = 'INTERNAL_ERROR',
  metadata?: Record<string, unknown>
): ApiError {
  const error = new Error(message) as ApiError;
  const errorConfig = ERROR_TYPES[type];

  error.statusCode = errorConfig.statusCode;
  error.code = errorConfig.code;
  error.metadata = metadata;

  return error;
}

/**
 * Global error handler for API routes
 * Transforms various error types into consistent API responses
 */
export function handleApiError(
  error: unknown,
  context?: {
    operation?: string;
    userId?: string;
    path?: string;
    [key: string]: unknown;
  }
): NextResponse {
  // Log the error with context
  logger.error('API Error', {
    error: error instanceof Error ? error : new Error(String(error)),
    context,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return apiError('Validation failed', {
      status: 400,
      data: {
        code: 'VALIDATION_ERROR',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
    });
  }

  // Handle custom API errors
  if (error instanceof Error && 'statusCode' in error) {
    const apiErr = error as ApiError;
    return apiError(apiErr.message, {
      status: apiErr.statusCode || 500,
      data: {
        code: apiErr.code,
        ...apiErr.metadata,
      },
    });
  }

  // Handle Supabase/Database errors
  if (error instanceof Error && 'code' in error) {
    const dbError = error as { code?: string };

    // Common database error mappings
    switch (dbError.code) {
      case '23505': // Unique constraint violation
        return apiError('Resource already exists', {
          status: 409,
          data: { code: 'DUPLICATE_ERROR' },
        });
      case '23503': // Foreign key violation
        return apiError('Related resource not found', {
          status: 404,
          data: { code: 'REFERENCE_ERROR' },
        });
      case 'PGRST116': // No rows found
        return apiError('Resource not found', {
          status: 404,
          data: { code: 'NOT_FOUND' },
        });
      default:
        // Log unknown database errors for debugging
        logger.error('Unknown database error', { code: dbError.code, error });
    }
  }

  // Handle standard JavaScript errors
  if (error instanceof TypeError) {
    return apiError('Invalid request format', {
      status: 400,
      data: { code: 'TYPE_ERROR' },
    });
  }

  if (error instanceof SyntaxError) {
    return apiError('Invalid JSON in request', {
      status: 400,
      data: { code: 'SYNTAX_ERROR' },
    });
  }

  // Default error response
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred';
  return apiError(message, {
    status: 500,
    data: { code: 'INTERNAL_ERROR' },
  });
}

/**
 * Async error wrapper for route handlers
 * Automatically catches and handles errors
 */
export function withErrorHandler<T extends (...args: unknown[]) => unknown>(
  handler: T,
  context?: Record<string, unknown>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  }) as T;
}

/**
 * Type guard for API errors
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    typeof (error as { statusCode?: unknown }).statusCode === 'number'
  );
}

/**
 * Extract error details for logging
 */
export function extractErrorDetails(error: unknown): {
  message: string;
  stack?: string;
  code?: string;
  statusCode?: number;
  [key: string]: unknown;
} {
  if (error instanceof Error) {
    const details: Record<string, unknown> = {
      message: error.message,
      stack: error.stack,
    };

    if (isApiError(error)) {
      details.code = error.code;
      details.statusCode = error.statusCode;
      details.metadata = error.metadata;
    }

    return details as {
      message: string;
      stack?: string;
      code?: string;
      statusCode?: number;
      [key: string]: unknown;
    };
  }

  return {
    message: String(error),
  };
}
