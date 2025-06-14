/**
 * Configuration module exports
 *
 * @module lib/config
 */

export * from './env';

// Re-export commonly used values for convenience
export {
  env,
  isDevelopment,
  isProduction,
  isTest,
  features,
  services,
  getAppUrl,
} from './env';
