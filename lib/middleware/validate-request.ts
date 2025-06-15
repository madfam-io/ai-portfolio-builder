import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError, ZodSchema } from 'zod';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/types/errors';

/**
 * Request Validation Middleware
 * Provides comprehensive input validation for API routes
 */

// Helper function to parse JSON body
async function parseJSONBody(
  request: NextRequest,
  maxBodySize?: number
): Promise<unknown> {
  try {
    const text = await request.text();

    // Check body size
    if (maxBodySize && text.length > maxBodySize) {
      throw new AppError(
        'Request body too large',
        'PAYLOAD_TOO_LARGE',
        413
      );
    }

    return text ? JSON.parse(text) : {};
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid JSON in request body', 'INVALID_JSON', 400);
  }
}

// Validation options
export interface ValidationOptions {
  // Which parts of the request to validate
  body?: boolean;
  query?: boolean;
  params?: boolean;
  headers?: boolean;

  // Validation behavior
  stripUnknown?: boolean; // Remove unknown properties
  abortEarly?: boolean; // Stop on first error

  // Security options
  sanitize?: boolean; // Sanitize strings for XSS
  maxBodySize?: number; // Max request body size in bytes

  // Custom error handling
  errorFormatter?: (errors: ZodError) => unknown;
}

// Request schemas container
export interface RequestSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

// Validated request data
export interface ValidatedRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown,
  THeaders = unknown,
> {
  body: TBody;
  query: TQuery;
  params: TParams;
  headers: THeaders;
}

// Default validation options
const DEFAULT_OPTIONS: ValidationOptions = {
  body: true,
  query: true,
  params: true,
  headers: false,
  stripUnknown: true,
  abortEarly: false,
  sanitize: true,
  maxBodySize: 10 * 1024 * 1024, // 10MB
};

/**
 * String sanitization for XSS prevention
 */
function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Recursively sanitize object values
 */
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Extract query parameters from NextRequest
 */
function extractQueryParams(request: NextRequest): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    // Handle array parameters (e.g., ?tags=a&tags=b)
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });
  return params;
}

/**
 * Extract route parameters from NextRequest
 */
function extractRouteParams(_request: NextRequest): Record<string, string> {
  // Route params are typically passed through the handler function
  // This is a placeholder that would need integration with the route handler
  return {};
}

/**
 * Default error formatter
 */
function defaultErrorFormatter(errors: ZodError): unknown {
  const formattedErrors = errors.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return {
    error: 'Validation failed',
    errors: formattedErrors,
    details: errors.format(),
  };
}

/**
 * Validate request data against schemas
 */
export async function validateRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown,
  THeaders = unknown,
>(
  request: NextRequest,
  schemas: RequestSchemas,
  options: ValidationOptions = {}
): Promise<ValidatedRequest<TBody, TQuery, TParams, THeaders>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: ZodError[] = [];

  let body: TBody = {} as TBody;
  let query: TQuery = {} as TQuery;
  let params: TParams = {} as TParams;
  let headers: THeaders = {} as THeaders;

  try {
    // Validate request body
    if (opts.body && schemas.body) {
      let bodyData: unknown = {};

      // Parse JSON body
      bodyData = await parseJSONBody(request, opts.maxBodySize);

      // Sanitize if enabled
      if (opts.sanitize) {
        bodyData = sanitizeObject(bodyData);
      }

      // Validate
      const result = schemas.body.safeParse(bodyData);
      if (!result.success) {
        errors.push(result.error);
      } else {
        body = result.data as TBody;
      }
    }

    // Validate query parameters
    if (opts.query && schemas.query) {
      const queryData = extractQueryParams(request);

      // Sanitize if enabled
      const sanitizedQuery = opts.sanitize
        ? sanitizeObject(queryData)
        : queryData;

      const result = schemas.query.safeParse(sanitizedQuery);
      if (!result.success) {
        errors.push(result.error);
      } else {
        query = result.data as TQuery;
      }
    }

    // Validate route parameters
    if (opts.params && schemas.params) {
      const paramsData = extractRouteParams(request);

      const result = schemas.params.safeParse(paramsData);
      if (!result.success) {
        errors.push(result.error);
      } else {
        params = result.data as TParams;
      }
    }

    // Validate headers
    if (opts.headers && schemas.headers) {
      const headersData: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headersData[key] = value;
      });

      const result = schemas.headers.safeParse(headersData);
      if (!result.success) {
        errors.push(result.error);
      } else {
        headers = result.data as THeaders;
      }
    }

    // Handle validation errors
    if (errors.length > 0) {
      const combinedError = new ZodError(errors.flatMap(e => e.errors));

      const formatter = opts.errorFormatter || defaultErrorFormatter;
      const errorResponse = formatter(combinedError);

      logger.warn('Request validation failed', {
        path: request.nextUrl.pathname,
        errors: errorResponse,
      });

      throw new AppError(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        errorResponse as Record<string, unknown>
      );
    }

    return { body, query, params, headers };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error('Unexpected error in request validation', { error });
    throw new AppError('Internal validation error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * Create a validation middleware for API routes
 */
function createValidationMiddleware<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown,
  THeaders = unknown,
>(schemas: RequestSchemas, options: ValidationOptions = {}) {
  return (
    request: NextRequest,
    _context?: { params?: Record<string, string> }
  ): ValidatedRequest<TBody, TQuery, TParams, THeaders> => {
    // If route params are provided in context, we need to handle them
    // This would require modifying the extractRouteParams function
    return validateRequest<TBody, TQuery, TParams, THeaders>(
      request,
      schemas,
      options
    );
  };
}

/**
 * Helper to create error response
 */
function validationErrorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
    },
    { status: 400 }
  );
}

// Common validation schemas
const commonSchemas = {
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),

  // Email validation
  email: z.string().email('Invalid email format'),

  // URL validation
  url: z.string().url('Invalid URL format'),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),

  // Date range
  dateRange: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),

  // Safe string (alphanumeric + common punctuation)
  safeString: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s\-_.,'!?@#$%^&*()+=[\]{}|\\/:;<>]*$/,
      'String contains invalid characters'
    ),
};
