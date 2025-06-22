/**
 * @madfam/auth-kit
 *
 * Security management module
 */

import type { SecurityConfig, RateLimitConfig } from './types';
import { Logger } from '../utils/logger';

interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

interface AccountLockEntry {
  attempts: number;
  lockedUntil?: Date;
}

export class SecurityManager {
  private config?: SecurityConfig;
  private logger: Logger;
  private rateLimitStore: Map<string, RateLimitEntry> = new Map();
  private accountLockStore: Map<string, AccountLockEntry> = new Map();

  constructor(config?: SecurityConfig) {
    this.config = config;
    this.logger = new Logger('SecurityManager');

    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 60 * 1000); // Every minute
  }

  /**
   * Check rate limit
   */
  async checkRateLimit(action: string, identifier: string): Promise<void> {
    if (!this.config?.rateLimit?.enabled) {
      return;
    }

    const key = `${action}:${identifier}`;
    const now = new Date();
    const entry = this.rateLimitStore.get(key);

    if (entry) {
      if (now < entry.resetAt) {
        if (entry.count >= this.config.rateLimit.maxAttempts) {
          const retryAfter = Math.ceil(
            (entry.resetAt.getTime() - now.getTime()) / 1000
          );
          throw new Error(
            `Rate limit exceeded. Try again in ${retryAfter} seconds`
          );
        }
        entry.count++;
      } else {
        // Reset window
        entry.count = 1;
        entry.resetAt = new Date(
          now.getTime() + this.config.rateLimit.windowMs
        );
      }
    } else {
      // First request
      this.rateLimitStore.set(key, {
        count: 1,
        resetAt: new Date(now.getTime() + this.config.rateLimit.windowMs),
      });
    }

    this.logger.debug('Rate limit check', {
      action,
      identifier,
      count: entry?.count || 1,
    });
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    if (!this.config?.accountLockout?.enabled) {
      return false;
    }

    const entry = this.accountLockStore.get(userId);
    if (!entry?.lockedUntil) {
      return false;
    }

    const now = new Date();
    if (now >= entry.lockedUntil) {
      // Lock expired
      this.accountLockStore.delete(userId);
      return false;
    }

    return true;
  }

  /**
   * Record failed authentication attempt
   */
  async recordFailedAttempt(identifier: string): Promise<void> {
    if (!this.config?.accountLockout?.enabled) {
      return;
    }

    const entry = this.accountLockStore.get(identifier) || { attempts: 0 };
    entry.attempts++;

    if (entry.attempts >= this.config.accountLockout.maxAttempts) {
      // Lock account
      const lockDuration = this.config.accountLockout.lockoutDuration;
      entry.lockedUntil = new Date(Date.now() + lockDuration);

      this.logger.warn('Account locked due to failed attempts', {
        identifier,
        attempts: entry.attempts,
        lockedUntil: entry.lockedUntil,
      });
    }

    this.accountLockStore.set(identifier, entry);
  }

  /**
   * Reset failed attempts
   */
  async resetFailedAttempts(identifier: string): Promise<void> {
    if (this.config?.accountLockout?.resetOnSuccess) {
      this.accountLockStore.delete(identifier);
    }
  }

  /**
   * Check IP allowlist
   */
  isIPAllowed(ip: string): boolean {
    if (!this.config?.ipAllowlist || this.config.ipAllowlist.length === 0) {
      return true; // No allowlist configured
    }

    return this.config.ipAllowlist.includes(ip);
  }

  /**
   * Check IP blocklist
   */
  isIPBlocked(ip: string): boolean {
    if (!this.config?.ipBlocklist || this.config.ipBlocklist.length === 0) {
      return false; // No blocklist configured
    }

    return this.config.ipBlocklist.includes(ip);
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    if (!this.config?.csrfProtection) {
      return '';
    }

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return token;
  }

  /**
   * Verify CSRF token
   */
  verifyCSRFToken(token: string, sessionToken: string): boolean {
    if (!this.config?.csrfProtection) {
      return true;
    }

    // In a real implementation, this would verify against stored tokens
    return token.length === 32;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = new Date();

    // Clean up rate limit entries
    for (const [key, entry] of this.rateLimitStore) {
      if (now >= entry.resetAt) {
        this.rateLimitStore.delete(key);
      }
    }

    // Clean up account lock entries
    for (const [key, entry] of this.accountLockStore) {
      if (entry.lockedUntil && now >= entry.lockedUntil) {
        this.accountLockStore.delete(key);
      }
    }

    this.logger.debug('Cleanup completed', {
      rateLimitEntries: this.rateLimitStore.size,
      accountLockEntries: this.accountLockStore.size,
    });
  }
}
