/**
 * API Error Handler
 * Provides standardized error handling for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppError, isAppError, getErrorMessage } from '@/types/errors';
import { errorLogger, ErrorContext } from './error-logger';

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    requestId?: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract error context from request
 */
function extractErrorContext(req: NextRequest): ErrorContext {
  const requestId = req.headers.get('x-request-id') || generateRequestId();

  return {
    requestId,
    url: req.url,
    method: req.method,
    metadata: {
      userAgent: req.headers.get('user-agent') || undefined,
      referer: req.headers.get('referer') || undefined,
      ip:
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        undefined,
    },
  };
}

/**
 * Handle API errors and return standardized error response
 */
export function handleApiError(
  error: unknown,
  req?: NextRequest,
  additionalContext?: Partial<ErrorContext>
): NextResponse<ApiErrorResponse> {
  const context: ErrorContext = {
    ...(req ? extractErrorContext(req) : {}),
    ...additionalContext,
  };

  // Log the error
  errorLogger.logError(error, context);

  // Prepare error response
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: Record<string, unknown> | undefined;

  if (isAppError(error)) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof Error) {
    // For non-AppError instances, use generic message in production
    message =
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'An unexpected error occurred';
  }

  const response: ApiErrorResponse = {
    error: {
      message,
      code,
      statusCode,
      requestId: context.requestId,
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {}),
    },
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Async error wrapper for API route handlers
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ApiErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Try to extract request from args
      const req = args.find(arg => arg instanceof NextRequest) as
        | NextRequest
        | undefined;
      return handleApiError(error, req) as R;
    }
  };
}

/**
 * Type-safe API route handler wrapper
 */
export function createApiHandler<TParams = any, TResponse = any>(
  handler: (
    req: NextRequest,
    context: { params: TParams }
  ) => Promise<NextResponse<TResponse>>
) {
  return withErrorHandler(handler);
}

/**
 * Validate request method
 */
export function validateMethod(
  req: NextRequest,
  allowedMethods: string[]
): void {
  if (!allowedMethods.includes(req.method)) {
    throw new AppError(
      `Method ${req.method} not allowed`,
      'METHOD_NOT_ALLOWED',
      405,
      { allowed: allowedMethods }
    );
  }
}

/**
 * Parse JSON body with error handling
 */
export async function parseJsonBody<T = any>(req: NextRequest): Promise<T> {
  try {
    const body = await req.json();
    return body as T;
  } catch (error) {
    throw new AppError('Invalid JSON in request body', 'INVALID_JSON', 400, {
      originalError: getErrorMessage(error),
    });
  }
}
