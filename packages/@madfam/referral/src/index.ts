/**
 * @madfam/referral - World-class referral system for viral growth
 *
 * Build powerful referral programs with fraud detection, analytics, and gamification.
 *
 * @packageDocumentation
 */

// Export engine
export * from './engine';

// Export components
export * from './components';

// Export hooks (only if React is available)
export * from './hooks';

// Export all types
export * from './types';

// Export utils
export * from './utils/logger';
export * from './utils/analytics';

// Package info
export const VERSION = '1.0.0';
export const PACKAGE_NAME = '@madfam/referral';