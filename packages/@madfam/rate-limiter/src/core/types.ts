/**
 * MIT License
 *
 * Copyright (c) 2025 MADFAM LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// HTTP Request/Response interfaces
export interface Request {
  ip?: string;
  headers?: Record<string, string | string[]>;
  user?: { id: string };
  userId?: string;
  apiKey?: string;
  session?: { id: string };
  sessionId?: string;
  path?: string;
  url?: string;
  method?: string;
  fingerprint?: string;
  [key: string]: unknown;
}

export interface Response {
  setHeader(name: string, value: string | number): void;
  status(code: number): Response;
  json(body: Record<string, unknown>): void;
  send(body: string): void;
}

/**
 * @madfam/rate-limiter
 *
 * Core type definitions for rate limiting
 */

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  max: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Rate limiting algorithm to use
   */
  algorithm: 'sliding-window' | 'token-bucket' | 'fixed-window';

  /**
   * Storage adapter for persisting rate limit data
   */
  store?: RateLimitStore;

  /**
   * Key generator function
   */
  keyGenerator?: (identifier: string) => string;

  /**
   * Skip successful requests in rate limiting
   */
  skipSuccessfulRequests?: boolean;

  /**
   * Skip failed requests in rate limiting
   */
  skipFailedRequests?: boolean;

  /**
   * Custom message when rate limit is exceeded
   */
  message?: string | ((limit: RateLimitInfo) => string);

  /**
   * Headers to include in response
   */
  standardHeaders?: boolean;

  /**
   * Legacy headers to include in response
   */
  legacyHeaders?: boolean;

  /**
   * Handler for when rate limit is exceeded
   */
  handler?: (req: Request, res: Response, limit: RateLimitInfo) => void;

  /**
   * Callback when rate limit is hit
   */
  onLimitReached?: (req: Request, limit: RateLimitInfo) => void;
}

export interface RateLimitInfo {
  /**
   * Maximum number of requests allowed
   */
  limit: number;

  /**
   * Number of requests used in current window
   */
  used: number;

  /**
   * Number of requests remaining
   */
  remaining: number;

  /**
   * Time when window resets (Unix timestamp)
   */
  resetTime: number;

  /**
   * Total hits for this key
   */
  totalHits: number;
}

export interface RateLimitResult {
  /**
   * Whether the request should be allowed
   */
  allowed: boolean;

  /**
   * Rate limit information
   */
  limit: RateLimitInfo;

  /**
   * Retry after time in seconds (when blocked)
   */
  retryAfter?: number;
}

export interface RateLimitStore {
  /**
   * Increment the count for a key
   */
  increment(key: string, windowMs: number): Promise<RateLimitInfo>;

  /**
   * Get current count for a key
   */
  get(key: string): Promise<RateLimitInfo | null>;

  /**
   * Reset count for a key
   */
  reset(key: string): Promise<void>;

  /**
   * Cleanup expired entries
   */
  cleanup?(): Promise<void>;

  /**
   * Close the store connection
   */
  close?(): Promise<void>;
}

export interface TokenBucketConfig extends Omit<RateLimitConfig, 'algorithm'> {
  /**
   * Bucket capacity (maximum tokens)
   */
  capacity: number;

  /**
   * Token refill rate (tokens per second)
   */
  refillRate: number;

  /**
   * Initial number of tokens in bucket
   */
  initialTokens?: number;
}

export interface SlidingWindowConfig extends Omit<RateLimitConfig, 'algorithm'> {
  /**
   * Number of sub-windows to track
   */
  subWindows?: number;
}

export interface FixedWindowConfig extends Omit<RateLimitConfig, 'algorithm'> {
  /**
   * Window alignment strategy
   */
  alignment?: 'calendar' | 'request';
}

export interface RedisStoreConfig {
  /**
   * Redis connection string or options
   */
  redis: string | object;

  /**
   * Key prefix for rate limit entries
   */
  prefix?: string;

  /**
   * TTL for rate limit entries (in seconds)
   */
  ttl?: number;
}

export interface MemoryStoreConfig {
  /**
   * Maximum number of keys to store
   */
  maxKeys?: number;

  /**
   * Cleanup interval in milliseconds
   */
  cleanupInterval?: number;
}

export interface DatabaseStoreConfig {
  /**
   * Database connection string
   */
  connectionString: string;

  /**
   * Table name for rate limit entries
   */
  tableName?: string;

  /**
   * Cleanup interval in milliseconds
   */
  cleanupInterval?: number;
}

// Utility types
export type RateLimitMiddleware = (req: Request, res: Response, next: () => void) => Promise<void> | void;

export type KeyGenerator = (req: Request) => string;

export type RateLimitHandler = (req: Request, res: Response, limit: RateLimitInfo) => void;

export interface RateLimitHeaders {
  'X-RateLimit-Limit'?: string;
  'X-RateLimit-Remaining'?: string;
  'X-RateLimit-Reset'?: string;
  'X-RateLimit-Used'?: string;
  'RateLimit-Limit'?: string;
  'RateLimit-Remaining'?: string;
  'RateLimit-Reset'?: string;
  'Retry-After'?: string;
}