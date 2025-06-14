/**
 * Redis cache service wrapper
 * This module conditionally exports server or client implementation
 */

// Re-export based on environment
export * from './redis-cache.client';
