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
    .default('true')
    .transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .default('true')
    .transform(val => val === 'true'),
});

/**
 * Development environment schema - optional in development
 */
const DevelopmentEnvSchema = BaseEnvSchema.extend({
  // Database
  DATABASE_URL: z.string().optional(),

  // NextAuth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),

  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Cloudflare R2
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().optional(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().optional(),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().optional(),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url().optional(),

  // AI Services
  HUGGINGFACE_API_KEY: z.string().optional(),

  // Vercel KV (for rate limiting)
  KV_URL: z.string().optional(),
  KV_REST_API_URL: z.string().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  KV_REST_API_READ_ONLY_TOKEN: z.string().optional(),

  // Cron API
  CRON_API_KEY: z.string().optional(),

  // Security (optional in development)
  JWT_SECRET: z.string().min(32).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
  CSRF_SECRET: z.string().min(32).optional(),
});

/**
 * Production environment schema - all services required
 */
const ProductionEnvSchema = BaseEnvSchema.extend({
  // Database (Railway PostgreSQL - required)
  DATABASE_URL: z.string(),

  // NextAuth (required)
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // OAuth (at least one required)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Cloudflare R2 (required)
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().min(1),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url(),

  // AI Services (required in production)
  HUGGINGFACE_API_KEY: z.string().min(1),

  // Vercel KV (required for rate limiting)
  KV_URL: z.string(),
  KV_REST_API_URL: z.string(),
  KV_REST_API_TOKEN: z.string(),
  KV_REST_API_READ_ONLY_TOKEN: z.string().optional(),

  // Cron API (required)
  CRON_API_KEY: z.string().min(32),

  // OAuth (optional, for future use)
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_LINKEDIN_CLIENT_ID: z.string().optional(),

  // Stripe (optional, for future use)
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // PostHog Analytics
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

  // Security (required in production)
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  CSRF_SECRET: z.string().min(32),
});

/**
 * Get the appropriate schema based on environment
 */
function getEnvSchema(nodeEnv: string | undefined): z.ZodObject<any> {
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

      return schema.partial().parse(cleanedEnv);
    }

    const parsed = schema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter(err => err.message === 'Required')
        .map(err => err.path.join('.'));

      const invalidVars = error.issues
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
        return schema.partial().parse(process.env);
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
type _Env = typeof env;

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
  database: Boolean(env.DATABASE_URL),
  auth: Boolean(env.NEXTAUTH_URL && env.NEXTAUTH_SECRET),
  storage: Boolean(
    env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      env.CLOUDFLARE_R2_BUCKET_NAME
  ),
  rateLimit: Boolean(env.KV_URL && env.KV_REST_API_TOKEN),
  huggingface: Boolean(env.HUGGINGFACE_API_KEY),
  github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
  google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  stripe: Boolean(
    env.STRIPE_SECRET_KEY && env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ),
  posthog: Boolean(env.NEXT_PUBLIC_POSTHOG_KEY),
} as const;

/**
 * Get the application URL based on environment
 */
export function getAppUrl(): string {
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }

  if (isProduction) {
    return 'https://portfolio-builder.madfam.io';
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
