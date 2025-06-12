/**
 * @fileoverview Common middleware utilities for API routes
 * Provides reusable patterns for error handling, validation, and database access
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * Standard API error response
 */
export function apiError(message: string, options?: { status?: number; details?: any }) {
  return NextResponse.json(
    {
      error: message,
      ...(options?.details && { details: options.details })
    },
    { status: options?.status || 500 }
  );
}

/**
 * Standard API success response
 */
export function apiSuccess<T>(data: T, options?: { status?: number; message?: string }) {
  return NextResponse.json(
    {
      data,
      ...(options?.message && { message: options.message })
    },
    { status: options?.status || 200 }
  );
}

/**
 * Get Supabase client with error handling
 */
export async function getSupabaseClient() {
  const supabase = await createClient();
  
  if (!supabase) {
    throw new Error('Database connection not available');
  }
  
  return supabase;
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * Wrapper for API route handlers with common error handling
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<Response> => {
    try {
      const result = await handler(...args);
      return result as Response;
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return apiError('Invalid request data', {
          status: 400,
          details: error.errors
        });
      }

      // Handle database connection errors
      if (error instanceof Error && error.message === 'Database connection not available') {
        return apiError('Database service not available', { status: 503 });
      }

      // Log and return generic error
      logger.error('API route error', error as Error);
      return apiError('Internal server error', { status: 500 });
    }
  };
}

/**
 * Combine multiple middleware functions
 */
export function composeMiddleware(...middlewares: Function[]) {
  return (handler: Function) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}