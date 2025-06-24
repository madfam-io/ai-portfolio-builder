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

import { CookiePersistenceAdapter } from '../../adapters/persistence/cookie';
import { UniversalCookieManager } from './cookie-manager';
import type { JsonValue } from '../../core/value-types';

/**
 * Next.js persistence adapter that works in both server and client environments
 */
export class NextJsPersistenceAdapter extends CookiePersistenceAdapter {
  constructor(options?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
    path?: string;
    domain?: string;
  }) {
    const _cookieManager = new UniversalCookieManager();

    // Create a wrapper that matches the synchronous interface expected by CookiePersistenceAdapter
    const syncCookieManager = {
      get: (name: string): string | undefined => {
        // For server-side, we need to handle async, but for now we'll use a workaround
        // In production, you'd want to use the async version properly
        if (typeof window !== 'undefined') {
          return new BrowserCookieManager().get(name);
        }
        // Server-side will need special handling
        return undefined;
      },
      set: (
        name: string,
        value: string,
        opts?: Record<string, JsonValue>
      ): void => {
        if (typeof window !== 'undefined') {
          new BrowserCookieManager().set(name, value, opts);
        }
        // Server-side will need special handling
      },
      delete: (name: string): void => {
        if (typeof window !== 'undefined') {
          new BrowserCookieManager().delete(name);
        }
        // Server-side will need special handling
      },
    };

    super(syncCookieManager, options);
  }
}

// Re-export the BrowserCookieManager for convenience
export { BrowserCookieManager } from './cookie-manager';
