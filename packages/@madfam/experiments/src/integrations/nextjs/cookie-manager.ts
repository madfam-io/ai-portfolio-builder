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

import { cookies } from 'next/headers';
import type {
  RequestCookies,
  ResponseCookies,
} from 'next/dist/server/web/spec-extension/cookies';

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
  domain?: string;
}

/**
 * Next.js App Router cookie manager for server-side cookie handling
 */
export class NextJsCookieManager {
  private cookieStore?: RequestCookies | ResponseCookies;

  constructor() {
    // Cookie store will be initialized on first use
  }

  /**
   * Get cookie store (lazy initialization)
   */
  private async getCookieStore() {
    if (!this.cookieStore) {
      this.cookieStore = await cookies();
    }
    return this.cookieStore;
  }

  async get(name: string): Promise<string | undefined> {
    const store = await this.getCookieStore();
    const cookie = store.get(name);
    return cookie?.value;
  }

  async set(
    name: string,
    value: string,
    options: CookieOptions = {}
  ): Promise<void> {
    const store = await this.getCookieStore();

    // Type guard to check if it's a ResponseCookies instance
    if ('set' in store) {
      store.set(name, value, {
        httpOnly: options.httpOnly ?? true,
        secure: options.secure ?? process.env.NODE_ENV === 'production',
        sameSite: options.sameSite ?? 'lax',
        maxAge: options.maxAge,
        path: options.path ?? '/',
        domain: options.domain,
      });
    }
  }

  async delete(name: string): Promise<void> {
    const store = await this.getCookieStore();

    // Type guard to check if it's a ResponseCookies instance
    if ('delete' in store) {
      store.delete(name);
    }
  }
}

/**
 * Browser cookie manager for client-side cookie handling
 */
export class BrowserCookieManager {
  get(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop()?.split(';').shift();
    }

    return undefined;
  }

  set(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return;

    let cookie = `${name}=${encodeURIComponent(value)}`;

    if (options.maxAge) {
      cookie += `; max-age=${options.maxAge}`;
    }

    if (options.path) {
      cookie += `; path=${options.path}`;
    }

    if (options.domain) {
      cookie += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookie += '; secure';
    }

    if (options.sameSite) {
      cookie += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookie;
  }

  delete(name: string): void {
    this.set(name, '', { maxAge: 0 });
  }
}

/**
 * Universal cookie manager that works in both server and client environments
 */
export class UniversalCookieManager {
  private manager: NextJsCookieManager | BrowserCookieManager;

  constructor() {
    if (typeof window === 'undefined') {
      this.manager = new NextJsCookieManager();
    } else {
      this.manager = new BrowserCookieManager();
    }
  }

  get(name: string): string | undefined {
    if (this.manager instanceof NextJsCookieManager) {
      throw new Error(
        'NextJsCookieManager is async and cannot be used with sync interface'
      );
    }
    return this.manager.get(name);
  }

  set(name: string, value: string, options?: CookieOptions): void {
    if (this.manager instanceof NextJsCookieManager) {
      throw new Error(
        'NextJsCookieManager is async and cannot be used with sync interface'
      );
    }
    this.manager.set(name, value, options);
  }

  delete(name: string): void {
    if (this.manager instanceof NextJsCookieManager) {
      throw new Error(
        'NextJsCookieManager is async and cannot be used with sync interface'
      );
    }
    this.manager.delete(name);
  }
}
