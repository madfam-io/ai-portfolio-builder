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

import { getCSRFToken } from '@/middleware/csrf-enhanced';

/**
 * Client-side CSRF token utilities
 */

/**
 * Fetch wrapper that automatically includes CSRF token
 */
export function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const csrfToken = getCSRFToken();

  // Add CSRF token to headers if it's a state-changing request
  const method = options.method?.toUpperCase() || 'GET';
  const requiresCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (requiresCSRF && csrfToken) {
    options.headers = {
      ...options.headers,
      'x-csrf-token': csrfToken,
    };
  }

  return fetch(url, options);
}

/**
 * Hook to get CSRF token (for React components)
 */
export function useCSRFToken(): string | null {
  if (typeof window === 'undefined') return null;
  return getCSRFToken();
}

/**
 * Add CSRF token to form data
 */
export function addCSRFToFormData(formData: FormData): FormData {
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    formData.append('_csrf', csrfToken);
  }
  return formData;
}

/**
 * Get headers with CSRF token included
 */
export function getCSRFHeaders(additionalHeaders?: HeadersInit): HeadersInit {
  const csrfToken = getCSRFToken();
  const headers: Record<string, string> = {};

  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken;
  }

  // Merge with additional headers
  if (additionalHeaders) {
    if (additionalHeaders instanceof Headers) {
      additionalHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(additionalHeaders)) {
      additionalHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, additionalHeaders);
    }
  }

  return headers;
}
