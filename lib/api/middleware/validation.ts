import DOMPurify from 'isomorphic-dompurify';
import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError, ZodSchema } from 'zod';

import { logger } from '@/lib/utils/logger';

/**
 * Input validation middleware for API routes
 * Provides sanitization and validation for request data
 */

interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
  sanitize?: boolean;
}

interface ValidatedRequest extends NextRequest {
  validated?: {
    body?: unknown;
    query?: unknown;
    params?: unknown;
    headers?: unknown;
  };
}

/**
 * Sanitize string input to prevent XSS
 */
function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Recursively sanitize all string values in an object
 */
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Parse and validate request body
 */
async function parseBody(request: NextRequest): Promise<unknown> {
  const contentType = request.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      return await request.json();
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const body: Record<string, unknown> = {};

      formData.forEach((value, key) => {
        if (value instanceof File) {
          // Handle file uploads
          body[key] = {
            name: value.name,
            type: value.type,
            size: value.size,
            // Don't include file content in validation
          };
        } else {
          body[key] = value.toString();
        }
      });

      return body;
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      const body: Record<string, unknown> = {};

      params.forEach((value, key) => {
        body[key] = value;
      });

      return body;
    }

    // Default to empty object for other content types
    return {};
  } catch (error) {
    logger.error('Failed to parse request body', error as Error);
    return {};
  }
}

/**
 * Validation middleware factory
 */
export function validateRequest(options: ValidationOptions) {
  return async function middleware(
    request: ValidatedRequest,
    context?: unknown
  ): Promise<NextResponse | null> {
    try {
      const validated: any = {};

      // Validate body
      if (options.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const body = await parseBody(request);
        const sanitizedBody =
          options.sanitize !== false ? sanitizeObject(body) : body;
        validated.body = options.body.parse(sanitizedBody);
      }

      // Validate query parameters
      if (options.query) {
        const { searchParams } = new URL(request.url);
        const query: Record<string, unknown> = {};

        searchParams.forEach((value, key) => {
          query[key] = value;
        });

        const sanitizedQuery =
          options.sanitize !== false ? sanitizeObject(query) : query;
        validated.query = options.query.parse(sanitizedQuery);
      }

      // Validate route params
      if (options.params && (context as unknown)?.params) {
        const sanitizedParams =
          options.sanitize !== false
            ? sanitizeObject((context as unknown).params)
            : (context as unknown).params;
        validated.params = options.params.parse(sanitizedParams);
      }

      // Validate headers
      if (options.headers) {
        const headers: Record<string, unknown> = {};

        request.headers.forEach((value, key) => {
          headers[key] = value;
        });

        validated.headers = options.headers.parse(headers);
      }

      // Attach validated data to request
      request.validated = validated;

      // Continue to next middleware
      return null;
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error', {
          errors: error.errors,
          url: request.url,
          method: request.method,
        });

        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }

      logger.error('Unexpected validation error', error as Error);

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Common validation schemas
 */
const commonSchemas = {
  // ID validation
  id: z.string().uuid('Invalid ID format'),

  // Email validation
  email: z.string().email('Invalid email format').toLowerCase(),

  // Password validation
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must contain at least one special character'
    ),

  // URL validation
  url: z.string().url('Invalid URL format'),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),

  // Date range
  dateRange: z
    .object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    })
    .refine(
      data => {
        if (data.startDate && data.endDate) {
          return new Date(data.startDate) <= new Date(data.endDate);
        }
        return true;
      },
      { message: 'Start date must be before end date' }
    ),

  // File upload
  fileUpload: z.object({
    name: z.string().max(255),
    type: z.string(),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  }),
};

/**
 * Helper function to create validated API route handler
 */
function createValidatedHandler<T extends ValidationOptions>(
  validation: T,
  handler: (
    request: NextRequest & { validated: unknown },
    context?: unknown
  ) => Promise<Response>
) {
  return async function (
    request: NextRequest,
    context?: unknown
  ): Promise<Response> {
    const validationResult = await validateRequest(validation)(
      request,
      context
    );

    if (validationResult) {
      return validationResult;
    }

    return handler(request as unknown, context);
  };
}

/**
 * Alias for createValidatedHandler to match expected import
 */
export const withValidation = createValidatedHandler;

export { createValidatedHandler, commonSchemas };
