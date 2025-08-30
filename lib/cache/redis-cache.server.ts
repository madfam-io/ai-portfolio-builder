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

// Legacy Redis cache - now using Vercel KV
// This is a stub for backward compatibility

import { kvCache } from './vercel-kv';

// Re-export the new KV cache with old interface
export const redisCache = kvCache;

// Legacy function names for backward compatibility
export const cache = {
  get: kvCache.get.bind(kvCache),
  set: (key: string, value: any, ttl?: number) =>
    kvCache.set(key, value, { ttl }),
  delete: kvCache.delete.bind(kvCache),
  del: kvCache.delete.bind(kvCache), // Redis-style alias
  exists: kvCache.exists.bind(kvCache),
  expire: kvCache.expire.bind(kvCache),
  mget: kvCache.mget.bind(kvCache),
  mset: kvCache.mset.bind(kvCache),
  incr: kvCache.incr.bind(kvCache),
  decr: kvCache.decr.bind(kvCache),
  keys: kvCache.keys.bind(kvCache),
  clearPattern: kvCache.clearPattern.bind(kvCache),
};

// Cache key constants for backward compatibility
export const CACHE_KEYS = {
  AI_MODEL: 'ai:model:',
  AI_RESULT: 'ai:',
  GEO_DATA: 'geo:data:',
  USER_PROFILE: 'user:profile:',
  PORTFOLIO: 'portfolio:',
  COMPETITOR: 'competitor:',
  SKILLS: 'skills:',
};

// Export default for compatibility
export default cache;
