import { z } from 'zod';

import { logger } from '@/lib/utils/logger';
/**
 * API Input Validation Schemas
 * Comprehensive validation for all API routes
 */

// Common schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const templateSchema = z
  .enum(['developer', 'designer', 'consultant'])
  .optional()
  .default('developer');

// Preview API schemas
export const previewQuerySchema = z.object({
  portfolioId: uuidSchema,
  template: templateSchema,
});

// For preview, we need a more permissive schema that allows partial portfolio data
const previewPortfolioSchema = z
  .object({
    // Required fields
    name: z.string().min(1, 'Name is required'),
    title: z.string().min(1, 'Title is required'),
    bio: z.string().min(1, 'Bio is required'),

    // Optional but commonly used fields
    id: z.string().optional(),
    userId: z.string().optional(),
    tagline: z.string().optional(),
    avatarUrl: z.string().optional(),

    // Contact information
    contact: z
      .object({
        email: z.string().email('Invalid email format').optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
      })
      .optional(),

    // Social links
    social: z
      .object({
        linkedin: z.string().url().optional().or(z.literal('')),
        github: z.string().url().optional().or(z.literal('')),
        twitter: z.string().url().optional().or(z.literal('')),
        website: z.string().url().optional().or(z.literal('')),
      })
      .optional(),

    // Portfolio sections - allow any structure for flexibility
    experience: z.array(z.any()).optional(),
    education: z.array(z.any()).optional(),
    projects: z.array(z.any()).optional(),
    skills: z.array(z.any()).optional(),
    certifications: z.array(z.any()).optional(),

    // Template and customization
    template: z.string().optional(),
    customization: z.any().optional(),

    // Metadata
    status: z.string().optional(),
    subdomain: z.string().optional(),
    customDomain: z.string().optional(),
    views: z.number().optional(),
    lastViewedAt: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
  })
  .passthrough(); // Allow additional fields for flexibility

export const previewBodySchema = z.object({
  portfolio: previewPortfolioSchema,
  template: templateSchema,
});

// GitHub Integration schemas
export const githubCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().uuid('Invalid state parameter'),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

// Analytics schemas
export const syncRepositoriesSchema = z.object({
  force: z.boolean().optional().default(false),
});

export const repositoryParamsSchema = z.object({
  id: uuidSchema,
});

export const syncOptionsSchema = z.object({
  syncMetrics: z.boolean().optional().default(true),
  syncPullRequests: z.boolean().optional().default(true),
  syncContributors: z.boolean().optional().default(true),
  syncCommits: z.boolean().optional().default(true),
  force: z.boolean().optional().default(false),
});

// AI Model selection schemas
export const modelSelectionSchema = z.object({
  modelId: z.string().min(1, 'Model ID is required'),
  taskType: z.enum(['bio', 'project', 'template']),
});

// Portfolio API schemas
export const portfolioIdSchema = z.object({
  id: uuidSchema,
});

export const publishPortfolioSchema = z.object({
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must be less than 63 characters')
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/,
      'Subdomain must contain only lowercase letters, numbers, and hyphens'
    ),
  customDomain: z.string().url().optional(),
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1).max(100).optional(),
  filters: z
    .object({
      status: z.enum(['draft', 'published', 'archived']).optional(),
      template: z.enum(['developer', 'designer', 'consultant']).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
    })
    .optional(),
});

// Error response helper
export function createValidationError(errors: z.ZodError): {
  error: string;
  details: unknown;
} {
  return {
    error: 'Validation failed',
    details: errors.format(),
  };
}

// Safe parse helper with logging
export function safeParseWithLogging<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): { success: true; data: T } | { success: false; error: unknown } {
  const result = schema.safeParse(data);

  if (!result.success) {
    // Log validation errors for debugging
    logger.error(`Validation failed for ${context}:`, result.error.format());
  }

  return result;
}
