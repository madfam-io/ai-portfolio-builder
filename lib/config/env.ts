/**
 * Centralized environment configuration with Zod validation
 *
 * This module provides type-safe access to environment variables with validation.
 * All environment variables should be accessed through this module, not directly
 * via process.env.
 *
 * @module lib/config/env
 */

import { z } from 'zod';

import { logger } from '@/lib/utils/logger';

/**
 * Environment types
 */
const EnvironmentSchema = z.enum(['development', 'test', 'production']);

/**
 * Base environment schema - required for all environments
 */
const BaseEnvSchema = z.object({
  // Node environment
  NODE_ENV: EnvironmentSchema.default('development'),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  PORT: z.string().regex(/^\d+$/).default('3000'),

  // Feature flags
  NEXT_PUBLIC_ENABLE_AI: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
});

/**
 * Development environment schema - optional in development
 */
const DevelopmentEnvSchema = BaseEnvSchema.extend({
  // All services optional in development
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  HUGGINGFACE_API_KEY: z.string().optional(),
  REDIS_URL: z.union([z.string().url(), z.literal('')]).optional(),
});

/**
 * Production environment schema - all services required
 */
const ProductionEnvSchema = BaseEnvSchema.extend({
  // Supabase (required in production)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // AI Services (required in production)
  HUGGINGFACE_API_KEY: z.string().min(1),

  // Redis (optional with fallback to in-memory)
  REDIS_URL: z.union([z.string().url(), z.literal('')]).optional(),

  // OAuth (optional, for future use)
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_LINKEDIN_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY: z.string().optional(),

  // Stripe (optional, for future use)
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Security
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  JWT_SECRET: z.string().min(32).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
});

/**
 * Get the appropriate schema based on environment
 */
function getEnvSchema(nodeEnv: string | undefined): z.ZodSchema {
  const env = nodeEnv || 'development';

  switch (env) {
    case 'production':
      return ProductionEnvSchema;
    case 'test':
      return DevelopmentEnvSchema; // Use development schema for tests
    default:
      return DevelopmentEnvSchema;
  }
}

/**
 * Parse and validate environment variables
 */
function parseEnv() {
  const nodeEnv = process.env.NODE_ENV;

  // During build, we can't access all env vars, so use partial validation
  // Vercel will inject the actual env vars at runtime
  const isVercelBuild = process.env.VERCEL || process.env.CI;

  // Get schema outside try-catch to ensure it's always assigned
  const schema = getEnvSchema(nodeEnv);

  try {
    // For Vercel builds, use partial validation
    // Also check if we're in Next.js build phase
    if (isVercelBuild || typeof window === 'undefined') {
      // Clean up empty string values before parsing
      const cleanedEnv = Object.entries(process.env).reduce(
        (acc, [key, value]) => {
          acc[key] = value === '' ? undefined : value;
          return acc;
        },
        {} as Record<string, string | undefined>
      );

      return (schema as any).partial().parse(cleanedEnv);
    }

    const parsed = schema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter(err => err.message === 'Required')
        .map(err => err.path.join('.'));

      const invalidVars = error.errors
        .filter(err => err.message !== 'Required')
        .map(err => `${err.path.join('.')}: ${err.message}`);

      logger.error('Environment validation failed', {
        environment: nodeEnv,
        missing: missingVars,
        invalid: invalidVars,
      });

      // In development, log warnings but continue
      if (nodeEnv !== 'production') {
        logger.warn(
          'Continuing with missing environment variables in development mode'
        );
        return (schema as any).partial().parse(process.env);
      }

      throw new Error(
        `Environment validation failed:\n` +
          `Missing: ${missingVars.join(', ')}\n` +
          `Invalid: ${invalidVars.join(', ')}`
      );
    }
    throw error;
  }
}

/**
 * Parsed and validated environment variables
 */
export const env = parseEnv();

/**
 * Type-safe environment variable access
 */
type Env = typeof env;

/**
 * Environment checks
 */
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/**
 * Feature flags
 */
export const features = {
  ai: env.NEXT_PUBLIC_ENABLE_AI ?? true,
  analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS ?? true,
} as const;

/**
 * Service availability checks
 */
export const services = {
  supabase: Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
  redis: Boolean(env.REDIS_URL),
  huggingface: Boolean(env.HUGGINGFACE_API_KEY),
  github: Boolean(env.GITHUB_APP_ID && env.GITHUB_APP_PRIVATE_KEY),
  stripe: Boolean(
    env.STRIPE_SECRET_KEY && env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ),
} as const;

/**
 * Get the application URL based on environment
 */
export function getAppUrl(): string {
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }

  if (isProduction) {
    return 'https://prisma.madfam.io';
  }

  return `http://localhost:${env.PORT}`;
}

/**
 * Validate environment on module load
 */
if (isProduction && Object.values(services).some(enabled => !enabled)) {
  logger.warn('Some services are not configured in production', {
    services: Object.entries(services)
      .filter(([_, enabled]) => !enabled)
      .map(([name]) => name),
  });
}
