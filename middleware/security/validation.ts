/**
 * Request Validation Middleware
 * 
 * Provides input validation and sanitization for API requests
 * to prevent injection attacks and ensure data integrity.
 * 
 * @module middleware/security/validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError, ZodSchema } from 'zod';

import { logger } from '@/lib/utils/logger';

// Extend NextRequest to include validated data
interface ValidatedRequest extends NextRequest {
  validatedData?: unknown;
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // UUID v4 validation
  uuid: z.string().uuid(),
  
  // Email validation
  email: z.string().email().toLowerCase(),
  
  // URL validation
  url: z.string().url(),
  
  // Safe string (no scripts or SQL)
  safeString: z.string()
    .min(1)
    .max(1000)
    .regex(/^[^<>'"`;]+$/, 'String contains potentially unsafe characters'),
  
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
  
  // Sort options
  sortOptions: z.object({
    field: z.string(),
    order: z.enum(['asc', 'desc']).default('asc'),
  }),
  
  // Date range
  dateRange: z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  }).refine(data => data.from <= data.to, {
    message: 'From date must be before or equal to To date',
  }),
};

/**
 * SQL injection patterns to detect
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/i,
  /(--|#|\/\*|\*\/)/,
  /(\bOR\b\s*\d+\s*=\s*\d+)/i,
  /(\bAND\b\s*\d+\s*=\s*\d+)/i,
  /(\'|\"|;|\\)/,
];

/**
 * XSS patterns to detect
 */
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<img[^>]*onerror\s*=/gi,
];

/**
 * Check for SQL injection attempts
 */
function hasSQLInjection(value: string): boolean {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * Check for XSS attempts
 */
function hasXSS(value: string): boolean {
  return XSS_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>'"`;]/g, '') // Remove potentially dangerous characters
    .slice(0, 1000); // Limit length
}

type SanitizableValue = string | number | boolean | null | undefined | 
  SanitizableValue[] | { [key: string]: SanitizableValue };

/**
 * Deep sanitize object
 */
export function sanitizeObject<T extends SanitizableValue>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeString(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as T;
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, SanitizableValue> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key as well
      const safeKey = sanitizeString(key);
      sanitized[safeKey] = sanitizeObject(value);
    }
    return sanitized as T;
  }
  
  return obj;
}

/**
 * Validate request body against schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    
    // Check for injection attempts before validation
    const bodyStr = JSON.stringify(body);
    if (hasSQLInjection(bodyStr)) {
      logger.warn('SQL injection attempt detected', {
        url: request.url,
        method: request.method,
      });
      return {
        data: null,
        error: NextResponse.json(
          { error: 'Invalid input detected' },
          { status: 400 }
        ),
      };
    }
    
    if (hasXSS(bodyStr)) {
      logger.warn('XSS attempt detected', {
        url: request.url,
        method: request.method,
      });
      return {
        data: null,
        error: NextResponse.json(
          { error: 'Invalid input detected' },
          { status: 400 }
        ),
      };
    }
    
    // Validate against schema
    const data = schema.parse(body);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            errors: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        ),
      };
    }
    
    if (error instanceof SyntaxError) {
      return {
        data: null,
        error: NextResponse.json(
          { error: 'Invalid JSON' },
          { status: 400 }
        ),
      };
    }
    
    logger.error('Request validation error', { error });
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Validation error' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): { data: T; error: null } | { data: null; error: NextResponse } {
  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, string> = {};
    
    // Convert URLSearchParams to object
    for (const [key, value] of searchParams) {
      // Check for injection in keys and values
      if (hasSQLInjection(key) || hasSQLInjection(value)) {
        logger.warn('SQL injection in query params', {
          url: request.url,
          key,
        });
        return {
          data: null,
          error: NextResponse.json(
            { error: 'Invalid query parameters' },
            { status: 400 }
          ),
        };
      }
      
      if (hasXSS(key) || hasXSS(value)) {
        logger.warn('XSS in query params', {
          url: request.url,
          key,
        });
        return {
          data: null,
          error: NextResponse.json(
            { error: 'Invalid query parameters' },
            { status: 400 }
          ),
        };
      }
      
      params[key] = value;
    }
    
    // Validate against schema
    const data = schema.parse(params);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: 'Invalid query parameters',
            errors: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        ),
      };
    }
    
    logger.error('Query param validation error', { error });
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Validation error' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Create a validation middleware for specific schema
 */
export function createValidationMiddleware<T>(
  schema: ZodSchema<T>,
  type: 'body' | 'query' = 'body'
) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const result = type === 'body' 
      ? await validateRequestBody(request, schema)
      : validateQueryParams(request, schema);
    
    if (result.error) {
      return result.error;
    }
    
    // Attach validated data to request for use in route handler
    (request as ValidatedRequest).validatedData = result.data;
    
    return null;
  };
}

/**
 * File upload validation
 */
export const fileValidation = {
  /**
   * Validate file type
   */
  validateFileType(
    file: File,
    allowedTypes: string[]
  ): boolean {
    return allowedTypes.includes(file.type);
  },
  
  /**
   * Validate file size
   */
  validateFileSize(
    file: File,
    maxSizeBytes: number
  ): boolean {
    return file.size <= maxSizeBytes;
  },
  
  /**
   * Validate file name
   */
  validateFileName(fileName: string): boolean {
    // Check for directory traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return false;
    }
    
    // Check for dangerous extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1'];
    return !dangerousExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  },
};

/**
 * Validation middleware presets
 */
export const validationPresets = {
  /**
   * Portfolio creation validation
   */
  portfolioCreate: createValidationMiddleware(
    z.object({
      name: commonSchemas.safeString.min(3).max(100),
      template: z.enum(['developer', 'designer', 'consultant']),
      data: z.object({
        personalInfo: z.object({
          name: commonSchemas.safeString,
          title: commonSchemas.safeString,
          email: commonSchemas.email,
          location: commonSchemas.safeString.optional(),
          bio: commonSchemas.safeString.max(500).optional(),
        }),
        // ... other portfolio fields
      }),
    })
  ),
  
  /**
   * Pagination validation
   */
  pagination: createValidationMiddleware(
    commonSchemas.pagination,
    'query'
  ),
};