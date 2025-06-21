/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Content Security Policy configuration
 * Protects against XSS and other injection attacks
 */

export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'media-src': string[];
  'object-src': string[];
  'frame-src': string[];
  'frame-ancestors': string[];
  'base-uri': string[];
  'form-action': string[];
  'manifest-src': string[];
  'worker-src': string[];
}

/**
 * Get CSP directives based on environment
 */
export function getCSPDirectives(): CSPDirectives {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const directives: CSPDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-eval'", // Required for Next.js in development
      isDevelopment ? "'unsafe-inline'" : '', // Only in development
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://app.posthog.com',
      'https://cdn.jsdelivr.net',
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-jsx and inline styles
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://*.supabase.co',
      'https://*.supabase.in',
      'https://avatars.githubusercontent.com',
      'https://lh3.googleusercontent.com',
      'https://platform-lookaside.fbsbx.com',
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'https://*.supabase.in',
      'https://api.github.com',
      'https://www.google-analytics.com',
      'https://app.posthog.com',
      'https://api-inference.huggingface.co',
      'wss://*.supabase.co',
      'wss://*.supabase.in',
      isDevelopment ? 'ws://localhost:*' : '',
      isDevelopment ? 'http://localhost:*' : '',
    ].filter(Boolean),
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'frame-src': [
      "'self'",
      'https://www.youtube.com',
      'https://player.vimeo.com',
    ],
    'frame-ancestors': ["'self'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'manifest-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
  };

  return directives;
}

/**
 * Format CSP directives as a header string
 */
export function formatCSPHeader(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([key, values]) => {
      const filteredValues = values.filter(Boolean);
      if (filteredValues.length === 0) return '';
      return `${key} ${filteredValues.join(' ')}`;
    })
    .filter(Boolean)
    .join('; ');
}

/**
 * Generate CSP header string from directives
 */
export function generateCSPHeader(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([key, values]) => {
      const validValues = values.filter((v: string) => v !== '');
      return validValues.length > 0 ? `${key} ${validValues.join(' ')}` : '';
    })
    .filter(directive => directive !== '')
    .join('; ');
}

/**
 * Generate nonce for inline scripts
 */
export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && 'randomBytes' in crypto) {
    return (crypto as any).randomBytes(16).toString('base64');
  }
  // Fallback for environments without crypto
  return Buffer.from(Math.random().toString()).toString('base64');
}
