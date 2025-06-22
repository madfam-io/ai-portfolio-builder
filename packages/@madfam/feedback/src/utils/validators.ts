/**
 * @madfam/feedback
 *
 * World-class feedback collection and analytics system
 *
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 *
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 *
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

import { z } from 'zod';
import type { FeedbackEntry, SatisfactionSurvey } from '../core/types';

/**
 * Validation Utilities
 *
 * Zod schemas and validation functions for feedback data
 */

// Feedback validation schema
export const feedbackSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.enum([
    'bug',
    'feature_request',
    'improvement',
    'general',
    'usability',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be 2000 characters or less'),
  category: z.string().min(1, 'Category is required'),
  userAgent: z.string(),
  url: z.string().url('Invalid URL format').or(z.string().length(0)),
  attachments: z.array(z.string()).optional(),
  reproductionSteps: z.array(z.string()).optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  tags: z.array(z.string()),
  rating: z.number().min(1).max(5).optional(),
  userContext: z
    .object({
      plan: z.string(),
      accountAge: z.number(),
      portfoliosCreated: z.number(),
      lastActivity: z.date().or(z.string().transform(val => new Date(val))),
      customFields: z.record(z.unknown()).optional(),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Survey validation schema
export const surveySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  overallSatisfaction: z.number().min(1).max(10),
  easeOfUse: z.number().min(1).max(10),
  performance: z.number().min(1).max(10),
  features: z.number().min(1).max(10),
  design: z.number().min(1).max(10),
  likelihoodToRecommend: z.number().min(1).max(10),
  mostUsefulFeature: z.string().min(1, 'Most useful feature is required'),
  leastUsefulFeature: z.string().min(1, 'Least useful feature is required'),
  missingFeatures: z.array(z.string()),
  additionalComments: z.string(),
  completionContext: z.string().min(1, 'Completion context is required'),
  completedIn: z.number().positive('Completion time must be positive'),
  metadata: z.record(z.unknown()).optional(),
});

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors?: z.ZodIssue[];
}

/**
 * Validate feedback data
 */
export function validateFeedback(
  feedback: Omit<FeedbackEntry, 'id' | 'timestamp' | 'status'>
): ValidationResult {
  try {
    feedbackSchema.parse(feedback);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors };
    }
    return {
      valid: false,
      errors: [
        { path: [], message: 'Unknown validation error', code: 'custom' },
      ],
    };
  }
}

/**
 * Validate survey data
 */
export function validateSurvey(
  survey: Omit<SatisfactionSurvey, 'id' | 'timestamp' | 'npsCategory'>
): ValidationResult {
  try {
    surveySchema.parse(survey);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors };
    }
    return {
      valid: false,
      errors: [
        { path: [], message: 'Unknown validation error', code: 'custom' },
      ],
    };
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize tags
 */
export function validateTags(tags: string[]): string[] {
  return tags
    .filter(tag => tag && tag.length > 0 && tag.length <= 50)
    .map(tag => tag.toLowerCase().trim())
    .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
