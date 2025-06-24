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

// Export adapter types
export type {
  StorageAdapter,
  PersistenceAdapter,
  AnalyticsAdapter,
} from './types';

// Export storage adapters
export { MemoryStorageAdapter } from './storage/memory';
export { SupabaseStorageAdapter } from './storage/supabase';

// Export persistence adapters
export { MemoryPersistenceAdapter } from './persistence/memory';
export { CookiePersistenceAdapter } from './persistence/cookie';
