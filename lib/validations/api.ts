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

import { z } from 'zod';

/**
 * API Input Validation Schemas
 * Comprehensive validation for all API routes
 */

// Common schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const templateSchema = z
  .enum([
    'developer',
    'designer',
    'consultant',
    'educator',
    'creative',
    'business',
    'minimal',
    'modern',
  ])
  .optional()
  .default('developer');

// Preview API schemas
export const previewQuerySchema = z.object({
  portfolioId: uuidSchema,
  template: templateSchema,
});

// For preview, we need a more permissive schema that allows partial portfolio data
export const previewPortfolioSchema = z
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

    // Portfolio sections with proper schemas
    experience: z
      .array(
        z.object({
          id: z.string(),
          company: z.string(),
          position: z.string(),
          location: z.string().optional(),
          employmentType: z
            .enum([
              'full-time',
              'part-time',
              'contract',
              'freelance',
              'internship',
            ])
            .optional(),
          startDate: z.string(),
          endDate: z.string().optional(),
          current: z.boolean(),
          description: z.string(),
          highlights: z.array(z.string()).optional(),
          technologies: z.array(z.string()).optional(),
          companyLogo: z.string().optional(),
        })
      )
      .optional(),

    education: z
      .array(
        z.object({
          id: z.string(),
          institution: z.string(),
          degree: z.string(),
          field: z.string(),
          startDate: z.string(),
          endDate: z.string().optional(),
          current: z.boolean().optional(),
          description: z.string().optional(),
          achievements: z.array(z.string()).optional(),
        })
      )
      .optional(),

    projects: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          technologies: z.array(z.string()),
          imageUrl: z.string().optional(),
          projectUrl: z.string().optional(),
          liveUrl: z.string().optional(),
          githubUrl: z.string().optional(),
          highlights: z.array(z.string()).optional(),
          featured: z.boolean().optional(),
          order: z.number().optional(),
        })
      )
      .optional(),

    skills: z
      .array(
        z.object({
          name: z.string(),
          level: z
            .enum(['beginner', 'intermediate', 'advanced', 'expert'])
            .optional(),
          category: z.string().optional(),
        })
      )
      .optional(),

    certifications: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          issuer: z.string(),
          issueDate: z.string(),
          expiryDate: z.string().optional(),
          credentialId: z.string().optional(),
          credentialUrl: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .optional(),

    // Template and customization
    template: z
      .enum([
        'developer',
        'designer',
        'consultant',
        'educator',
        'creative',
        'business',
        'minimal',
        'modern',
      ])
      .optional(),
    customization: z
      .object({
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        fontFamily: z.string().optional(),
        fontSize: z.enum(['small', 'medium', 'large']).optional(),
        spacing: z.enum(['compact', 'normal', 'relaxed']).optional(),
        borderRadius: z.enum(['none', 'small', 'medium', 'large']).optional(),
        headerStyle: z
          .enum(['minimal', 'bold', 'creative', 'classic', 'modern'])
          .optional(),
        sectionOrder: z.array(z.string()).optional(),
        hiddenSections: z.array(z.string()).optional(),
        darkMode: z.boolean().optional(),
        customCSS: z.string().optional(),
      })
      .optional(),

    // Metadata
    status: z.enum(['draft', 'published', 'archived']).optional(),
    subdomain: z.string().optional(),
    customDomain: z.string().optional(),
    views: z.number().optional(),
    lastViewedAt: z.string().datetime().optional().or(z.date()).optional(),
    createdAt: z.string().datetime().optional().or(z.date()).optional(),
    updatedAt: z.string().datetime().optional().or(z.date()).optional(),
    publishedAt: z.string().datetime().optional().or(z.date()).optional(),
  })
  .passthrough(); // Allow additional fields for flexibility

export const previewBodySchema = z.object({
  portfolio: previewPortfolioSchema,
  template: templateSchema,
});

// GitHub Integration schemas
// const githubCallbackSchema = z.object({
//   code: z.string().min(1, 'Authorization code is required'),
//   state: z.string().uuid('Invalid state parameter'),
//   error: z.string().optional(),
//   error_description: z.string().optional(),
// });

// Analytics schemas
// const syncRepositoriesSchema = z.object({
//   force: z.boolean().optional().default(false),
// });

// const repositoryParamsSchema = z.object({
//   id: uuidSchema,
// });

// const syncOptionsSchema = z.object({
//   syncMetrics: z.boolean().optional().default(true),
//   syncPullRequests: z.boolean().optional().default(true),
//   syncContributors: z.boolean().optional().default(true),
//   syncCommits: z.boolean().optional().default(true),
//   force: z.boolean().optional().default(false),
// });

// AI Model selection schemas
// const modelSelectionSchema = z.object({
//   modelId: z.string().min(1, 'Model ID is required'),
//   taskType: z.enum(['bio', 'project', 'template']),
// });

// Portfolio API schemas
// const portfolioIdSchema = z.object({
//   id: uuidSchema,
// });

// const publishPortfolioSchema = z.object({
//   subdomain: z
//     .string()
//     .min(3, 'Subdomain must be at least 3 characters')
//     .max(63, 'Subdomain must be less than 63 characters')
//     .regex(
//       /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/,
//       'Subdomain must contain only lowercase letters, numbers, and hyphens'
//     ),
//   customDomain: z.string().url().optional(),
// });

// Pagination schemas
// const paginationSchema = z.object({
//   page: z.coerce.number().int().min(1).optional().default(1),
//   limit: z.coerce.number().int().min(1).max(100).optional().default(10),
//   sortBy: z.string().optional(),
//   sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
// });

// Search schemas
// const searchSchema = z.object({
//   query: z.string().min(1).max(100).optional(),
//   filters: z
//     .object({
//       status: z.enum(['draft', 'published', 'archived']).optional(),
//       template: z.enum(['developer', 'designer', 'consultant']).optional(),
//       dateFrom: z.string().datetime().optional(),
//       dateTo: z.string().datetime().optional(),
//     })
//     .optional(),
// });

// Error response helper
// function createValidationError(errors: z.ZodError): {
//   error: string;
//   details: unknown;
// } {
//   return {
//     error: 'Validation failed',
//     details: errors.format(),
//   };
// }

// Safe parse helper with logging
// function safeParseWithLogging<T>(
//   schema: z.ZodSchema<T>,
//   data: unknown,
//   context: string
// ): { success: true; data: T } | { success: false; error: unknown } {
//   const result = schema.safeParse(data);
//
//   if (!result.success) {
//     // Log validation errors for debugging
//     logger.error(`Validation failed for ${context}:`, result.error.format());
//   }
//
//   return result;
// }
