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

import type {
  StorageAdapter,
  StorageConfig,
  StorageError as StorageErrorType,
} from '../core/types';
import { MemoryStorageAdapter } from './adapters/memory';
import { SupabaseStorageAdapter } from './adapters/supabase';

/**
 * Storage Module Exports
 *
 * Export storage adapters and factory
 */

// Export adapters
export { MemoryStorageAdapter } from './adapters/memory';
export { SupabaseStorageAdapter } from './adapters/supabase';
export { BaseStorageAdapter } from './adapters/interface';

// Export types
export type { StorageAdapter } from '../core/types';

/**
 * Create a storage adapter based on configuration
 */
export function createStorageAdapter(config?: StorageConfig): StorageAdapter {
  const storageType = config?.type || 'memory';

  switch (storageType) {
    case 'memory':
      return new MemoryStorageAdapter(config?.options || {});

    case 'supabase':
      if (
        !config?.connectionString &&
        (!config?.options?.supabaseUrl || !config?.options?.supabaseKey)
      ) {
        throw new Error('Supabase configuration is required');
      }

      // Parse connection string if provided
      if (config.connectionString) {
        const url = config.connectionString.split('@')[1]?.split(':')[0];
        const key = config.connectionString.split('@')[0]?.split('//')[1];

        return new SupabaseStorageAdapter({
          supabaseUrl: url || '',
          supabaseKey: key || '',
          ...config.options,
        });
      }

      return new SupabaseStorageAdapter({
        supabaseUrl: config.options?.supabaseUrl as string,
        supabaseKey: config.options?.supabaseKey as string,
        ...config.options,
      });


    case 'custom':
      if (!config.options?.adapter) {
        throw new Error('Custom adapter must be provided in options.adapter');
      }
      return config.options.adapter as StorageAdapter;

    default:
      throw new Error(`Unknown storage type: ${storageType}`);
  }
}

/**
 * Storage utilities
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string = 'STORAGE_ERROR',
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'StorageError';
  }
}
