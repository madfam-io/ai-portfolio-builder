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

/**
 * Encryption middleware for API routes
 * Automatically encrypts/decrypts sensitive fields in requests and responses
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  encryptUserData,
  decryptUserData,
  encryptOAuthTokens,
  decryptOAuthTokens,
  encryptPortfolioContact,
  decryptPortfolioContact,
  encryptAILogs,
  decryptAILogs,
  hashIPAddress,
} from '@/lib/services/encryption-service';
import { logger } from '@/lib/utils/logger';
import type { EncryptedUser } from '@/lib/services/encryption-service';

export type EncryptionConfig = {
  encryptRequest?: boolean;
  decryptResponse?: boolean;
  fields?: string[];
  type?: 'user' | 'oauth' | 'portfolio' | 'ai' | 'analytics';
};

/**
 * Middleware to handle automatic encryption/decryption
 */
export function withEncryption(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: EncryptionConfig = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      let processedReq = req;

      // Encrypt request data if needed
      if (config.encryptRequest && req.method !== 'GET') {
        const body = await req.json();
        const encryptedBody = await encryptRequestData(body, config);

        // Create new request with encrypted body
        processedReq = new NextRequest(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(encryptedBody),
        });
      }

      // Call the handler
      const response = await handler(processedReq);

      // Decrypt response data if needed
      if (config.decryptResponse && response.status === 200) {
        try {
          const data = await response.json();
          const decryptedData = await decryptResponseData(data, config);

          return NextResponse.json(decryptedData, {
            status: response.status,
            headers: response.headers,
          });
        } catch (_error) {
          // If response is not JSON, return as is
          return response;
        }
      }

      return response;
    } catch (error) {
      logger.error('Encryption middleware error', { error });
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Encrypt request data based on type
 */
async function encryptRequestData(
  data: unknown,
  config: EncryptionConfig
): Promise<unknown> {
  // Small delay to ensure async behavior
  await Promise.resolve();

  if (!data || typeof data !== 'object') return data;

  switch (config.type) {
    case 'user':
      if (Array.isArray(data)) {
        return Promise.all(data.map(item => encryptUserData(item)));
      }
      return encryptUserData(data);

    case 'oauth':
      return encryptOAuthTokens(data);

    case 'portfolio':
      if (Array.isArray(data)) {
        return Promise.all(data.map(item => encryptPortfolioContact(item)));
      }
      return encryptPortfolioContact(data);

    case 'ai':
      return encryptAILogs(data);

    case 'analytics':
      // Hash IP addresses in analytics data
      if (typeof data === 'object' && data !== null && 'ip_address' in data) {
        const analyticsData = data as {
          ip_address?: string;
          ip_address_hash?: string;
          [key: string]: unknown;
        };
        if (analyticsData.ip_address) {
          analyticsData.ip_address_hash = hashIPAddress(
            analyticsData.ip_address
          );
          delete analyticsData.ip_address;
        }
        return analyticsData;
      }
      return data;

    default:
      return data;
  }
}

/**
 * Decrypt response data based on type
 */
async function decryptResponseData(
  data: unknown,
  config: EncryptionConfig
): Promise<unknown> {
  if (!data || typeof data !== 'object') return data;

  switch (config.type) {
    case 'user':
      if (Array.isArray(data)) {
        return Promise.all(data.map(item => decryptUserData(item)));
      } else if (typeof data === 'object' && 'users' in data) {
        // Handle paginated responses
        const paginatedData = data as {
          users: unknown[];
          [key: string]: unknown;
        };
        const decryptedUsers = await Promise.all(
          paginatedData.users.map((user: unknown) =>
            decryptUserData(user as Partial<EncryptedUser>)
          )
        );
        return {
          ...paginatedData,
          users: decryptedUsers,
        };
      } else {
        return decryptUserData(data);
      }

    case 'oauth':
      return decryptOAuthTokens(data);

    case 'portfolio':
      if (Array.isArray(data)) {
        return Promise.all(data.map(item => decryptPortfolioContact(item)));
      } else if (typeof data === 'object' && 'portfolios' in data) {
        // Handle paginated responses
        const paginatedData = data as {
          portfolios: unknown[];
          [key: string]: unknown;
        };
        const decryptedPortfolios = await Promise.all(
          paginatedData.portfolios.map((portfolio: unknown) =>
            decryptPortfolioContact(portfolio)
          )
        );
        return {
          ...paginatedData,
          portfolios: decryptedPortfolios,
        };
      } else {
        return decryptPortfolioContact(data);
      }

    case 'ai':
      if (Array.isArray(data)) {
        return Promise.all(data.map(item => decryptAILogs(item)));
      } else if (typeof data === 'object' && 'logs' in data) {
        const paginatedData = data as {
          logs: unknown[];
          [key: string]: unknown;
        };
        const decryptedLogs = await Promise.all(
          paginatedData.logs.map((log: unknown) => decryptAILogs(log))
        );
        return {
          ...paginatedData,
          logs: decryptedLogs,
        };
      } else {
        return decryptAILogs(data);
      }

    default:
      return data;
  }
}

/**
 * Helper to apply encryption to specific routes
 */
export const encryptionConfigs: Record<string, EncryptionConfig> = {
  // User routes
  '/api/v1/users': {
    encryptRequest: true,
    decryptResponse: true,
    type: 'user',
  },
  '/api/v1/auth/signup': {
    encryptRequest: true,
    type: 'user',
  },
  '/api/v1/auth/profile': {
    decryptResponse: true,
    type: 'user',
  },

  // OAuth routes
  '/api/v1/integrations/github': {
    encryptRequest: true,
    decryptResponse: true,
    type: 'oauth',
  },
  '/api/v1/integrations/linkedin': {
    encryptRequest: true,
    decryptResponse: true,
    type: 'oauth',
  },

  // Portfolio routes
  '/api/v1/portfolios': {
    encryptRequest: true,
    decryptResponse: true,
    type: 'portfolio',
  },

  // AI routes
  '/api/v1/ai/logs': {
    encryptRequest: true,
    decryptResponse: true,
    type: 'ai',
  },

  // Analytics routes
  '/api/v1/analytics/track': {
    encryptRequest: true,
    type: 'analytics',
  },
};

/**
 * Get encryption config for a route
 */
export function getEncryptionConfig(pathname: string): EncryptionConfig | null {
  // Check exact match first
  if (encryptionConfigs[pathname]) {
    return encryptionConfigs[pathname];
  }

  // Check prefix matches for dynamic routes
  for (const [route, config] of Object.entries(encryptionConfigs)) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }

  return null;
}
