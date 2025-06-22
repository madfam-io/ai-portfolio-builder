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
 * AI service validation schemas using Zod
 * Provides type-safe validation for all AI-related operations
 */

// Model selection enum based on available HuggingFace models
const aiModelSchema = z.enum([
  'meta-llama/Llama-3.1-8B-Instruct',
  'microsoft/Phi-3.5-mini-instruct',
  'mistralai/Mistral-7B-Instruct-v0.2',
  'HuggingFaceH4/zephyr-7b-beta',
]);

/**
 * Schema for bio enhancement request
 */
export const enhanceBioSchema = z.object({
  text: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be less than 500 characters'),
  model: aiModelSchema.optional(),
  tone: z.enum(['professional', 'casual', 'creative']).default('professional'),
  industry: z.string().optional(),
  targetLength: z.number().int().min(50).max(150).default(100),
});

/**
 * Schema for project description optimization
 */
export const optimizeProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  model: aiModelSchema.optional(),
  format: z.enum(['STAR', 'CAR', 'general']).default('STAR'),
  includeMetrics: z.boolean().default(true),
  targetLength: z.number().int().min(50).max(200).default(150),
});

/**
 * Schema for template recommendation request
 */
export const recommendTemplateSchema = z.object({
  industry: z.string().min(1).max(100),
  experience: z.enum(['entry', 'mid', 'senior', 'executive']),
  skills: z.array(z.string()).min(1).max(20),
  preferences: z
    .object({
      style: z
        .enum(['minimal', 'modern', 'creative', 'traditional'])
        .optional(),
      colorScheme: z.enum(['light', 'dark', 'colorful']).optional(),
      layout: z.enum(['single-page', 'multi-section', 'grid']).optional(),
    })
    .optional(),
  model: aiModelSchema.optional(),
});

/**
 * Schema for AI content generation request (generic)
 */
export const generateContentSchema = z.object({
  prompt: z.string().min(10).max(1000),
  model: aiModelSchema.optional(),
  maxTokens: z.number().int().min(50).max(500).default(200),
  temperature: z.number().min(0).max(1).default(0.7),
  contentType: z.enum(['bio', 'project', 'skill_summary', 'headline']),
});

/**
 * Schema for batch AI operations
 */
export const batchAIOperationSchema = z.object({
  operations: z
    .array(
      z.discriminatedUnion('type', [
        z.object({
          type: z.literal('enhance_bio'),
          data: enhanceBioSchema,
        }),
        z.object({
          type: z.literal('optimize_project'),
          data: optimizeProjectSchema,
        }),
        z.object({
          type: z.literal('generate_content'),
          data: generateContentSchema,
        }),
      ])
    )
    .min(1)
    .max(10),
  model: aiModelSchema.optional(),
});

/**
 * Schema for AI feedback
 */
export const aiFeedbackSchema = z.object({
  operationId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(500).optional(),
  improved: z.boolean(),
});

// Export types
export type EnhanceBioInput = z.infer<typeof enhanceBioSchema>;
export type OptimizeProjectInput = z.infer<typeof optimizeProjectSchema>;
export type RecommendTemplateInput = z.infer<typeof recommendTemplateSchema>;
export type GenerateContentInput = z.infer<typeof generateContentSchema>;
export type BatchAIOperationInput = z.infer<typeof batchAIOperationSchema>;
export type AIFeedbackInput = z.infer<typeof aiFeedbackSchema>;
