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
