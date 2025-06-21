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

import { getCSRFHeaders } from '@/lib/utils/csrf-client';
import { logger } from '@/lib/utils/logger';
import { API_VERSION_CONFIG } from '@/middleware/api-version';

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseUrl?: string;
  version?: string;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
}

/**
 * Default API client configuration
 */
const defaultConfig: ApiClientConfig = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || '',
  version: API_VERSION_CONFIG._currentVersion,
  credentials: 'same-origin',
};

/**
 * Create a versioned API URL
 */
export function createApiUrl(
  endpoint: string,
  config: ApiClientConfig = {}
): string {
  const { baseUrl, version } = { ...defaultConfig, ...config };

  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  // Build the versioned URL
  return `${baseUrl}/api/${version}/${cleanEndpoint}`;
}

/**
 * Versioned fetch wrapper
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit & { config?: ApiClientConfig } = {}
): Promise<{
  data?: T;
  error?: string;
  status: number;
  headers: Headers;
}> {
  const { config, ...fetchOptions } = options;
  const url = createApiUrl(endpoint, config);

  try {
    // Get CSRF headers for state-changing requests
    const csrfHeaders = getCSRFHeaders({
      'Content-Type': 'application/json',
      ...config?.headers,
      ...fetchOptions.headers,
    });

    const response = await fetch(url, {
      ...fetchOptions,
      credentials: config?.credentials || defaultConfig.credentials,
      headers: csrfHeaders,
    });

    const contentType = response.headers.get('content-type');
    let data: unknown;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorData = data as {
        error?: string;
        message?: string;
        data?: unknown;
      };
      return {
        error:
          errorData?.error ||
          errorData?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        headers: response.headers,
      };
    }

    const responseData = data as { data?: T } | T;
    return {
      data:
        responseData &&
        typeof responseData === 'object' &&
        'data' in responseData
          ? responseData.data
          : (responseData as T),
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    logger.error('API Fetch Error:', { error });
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
      headers: new Headers(),
    };
  }
}

/**
 * API client with versioned endpoints
 */
export const apiClient = {
  /**
   * GET request
   */
  get: <T = unknown>(endpoint: string, config?: ApiClientConfig) =>
    apiFetch<T>(endpoint, { method: 'GET', config }),

  /**
   * POST request
   */
  post: <T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: ApiClientConfig
  ) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      config,
    }),

  /**
   * PUT request
   */
  put: <T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: ApiClientConfig
  ) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      config,
    }),

  /**
   * PATCH request
   */
  patch: <T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: ApiClientConfig
  ) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      config,
    }),

  /**
   * DELETE request
   */
  delete: <T = unknown>(endpoint: string, config?: ApiClientConfig) =>
    apiFetch<T>(endpoint, { method: 'DELETE', config }),
};

/**
 * API endpoint constants with versioning
 */
export const API_ENDPOINTS = {
  // AI endpoints
  ai: {
    enhanceBio: 'ai/enhance-bio',
    models: 'ai/models',
    modelSelection: 'ai/models/selection',
    optimizeProject: 'ai/optimize-project',
    recommendTemplate: 'ai/recommend-template',
  },

  // Analytics endpoints
  analytics: {
    dashboard: 'analytics/dashboard',
    repositories: 'analytics/repositories',
    repository: (id: string) => `analytics/repositories/${id}`,
  },

  // Integration endpoints
  integrations: {
    github: {
      auth: 'integrations/github/auth',
      callback: 'integrations/github/callback',
    },
  },

  // Portfolio endpoints
  portfolios: {
    list: 'portfolios',
    create: 'portfolios',
    get: (id: string) => `portfolios/${id}`,
    update: (id: string) => `portfolios/${id}`,
    delete: (id: string) => `portfolios/${id}`,
  },
};

/**
 * Hook for using the API client in React components
 */
export function useApiClient(config?: ApiClientConfig) {
  return {
    client: apiClient,
    endpoints: API_ENDPOINTS,
    createUrl: (endpoint: string) => createApiUrl(endpoint, config),
  };
}
