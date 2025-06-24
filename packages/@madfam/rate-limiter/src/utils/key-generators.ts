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

/**
 * @madfam/rate-limiter
 *
 * Common key generator functions
 */

import type { KeyGenerator, Request } from '../core/types';

/**
 * Generate key based on IP address
 */
export const ipKeyGenerator: KeyGenerator = (req: Request): string => {
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
};

/**
 * Generate key based on user ID
 */
export const userKeyGenerator: KeyGenerator = (req: Request): string => {
  return req.user?.id || req.userId || 'anonymous';
};

/**
 * Generate key based on API key
 */
export const apiKeyGenerator: KeyGenerator = (req: Request): string => {
  return req.headers?.['x-api-key'] || req.query?.apiKey || 'no-api-key';
};

/**
 * Generate key based on Authorization header
 */
export const authKeyGenerator: KeyGenerator = (req: Request): string => {
  const auth = req.headers?.authorization;
  if (!auth) return 'no-auth';

  // Extract token from Bearer header
  const token = auth.replace(/^Bearer\s+/, '');

  // Hash the token for privacy
  return hashString(token);
};

/**
 * Generate key based on session ID
 */
export const sessionKeyGenerator: KeyGenerator = (req: Request): string => {
  return req.sessionID || req.session?.id || 'no-session';
};

/**
 * Generate composite key with multiple factors
 */
export const compositeKeyGenerator = (
  generators: KeyGenerator[]
): KeyGenerator => {
  return (req: Request): string => {
    const parts = generators.map(gen => gen(req));
    return parts.join(':');
  };
};

/**
 * Generate key based on request path
 */
export const pathKeyGenerator: KeyGenerator = (req: Request): string => {
  return req.path || req.url || '/';
};

/**
 * Generate key based on HTTP method and path
 */
export const methodPathKeyGenerator: KeyGenerator = (req: Request): string => {
  const method = req.method || 'GET';
  const path = req.path || req.url || '/';
  return `${method}:${path}`;
};

/**
 * Generate key based on user agent
 */
export const userAgentKeyGenerator: KeyGenerator = (req: Request): string => {
  const userAgent = req.headers?.['user-agent'] || 'unknown-agent';
  return hashString(userAgent);
};

/**
 * Generate key for IP + User Agent combination
 */
export const ipUserAgentKeyGenerator: KeyGenerator = (req: Request): string => {
  const ip = ipKeyGenerator(req);
  const userAgent = req.headers?.['user-agent'] || 'unknown-agent';
  return `${ip}:${hashString(userAgent)}`;
};

/**
 * Generate key based on custom header
 */
export const headerKeyGenerator = (headerName: string): KeyGenerator => {
  return (req: Request): string => {
    return req.headers?.[headerName.toLowerCase()] || `no-${headerName}`;
  };
};

/**
 * Generate key based on query parameter
 */
export const queryKeyGenerator = (paramName: string): KeyGenerator => {
  return (req: Request): string => {
    return req.query?.[paramName] || `no-${paramName}`;
  };
};

/**
 * Generate key with prefix
 */
export const prefixedKeyGenerator = (
  prefix: string,
  generator: KeyGenerator
): KeyGenerator => {
  return (req: Request): string => {
    return `${prefix}:${generator(req)}`;
  };
};

/**
 * Generate key with suffix
 */
export const suffixedKeyGenerator = (
  generator: KeyGenerator,
  suffix: string
): KeyGenerator => {
  return (req: Request): string => {
    return `${generator(req)}:${suffix}`;
  };
};

/**
 * Generate key based on fingerprinting
 */
export const fingerprintKeyGenerator: KeyGenerator = (req: Request): string => {
  const components = [
    req.ip || 'no-ip',
    req.headers?.['user-agent'] || 'no-ua',
    req.headers?.['accept-language'] || 'no-lang',
    req.headers?.['accept-encoding'] || 'no-encoding',
  ];

  return hashString(components.join('|'));
};

/**
 * Simple string hashing function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Time-based key generator (useful for rate limiting per time period)
 */
export const timeBasedKeyGenerator = (
  baseGenerator: KeyGenerator,
  windowMs: number
): KeyGenerator => {
  return (req: Request): string => {
    const baseKey = baseGenerator(req);
    const timeWindow = Math.floor(Date.now() / windowMs);
    return `${baseKey}:${timeWindow}`;
  };
};

/**
 * Conditional key generator
 */
export const conditionalKeyGenerator = (
  condition: (req: Request) => boolean,
  trueGenerator: KeyGenerator,
  falseGenerator: KeyGenerator
): KeyGenerator => {
  return (req: Request): string => {
    return condition(req) ? trueGenerator(req) : falseGenerator(req);
  };
};
