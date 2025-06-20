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
  if (!data || typeof data !== 'object') return data;

  switch (config.type) {
    case 'user':
      return Array.isArray(data)
        ? data.map(item => encryptUserData(item))
        : encryptUserData(data);

    case 'oauth':
      return encryptOAuthTokens(data);

    case 'portfolio':
      return Array.isArray(data)
        ? data.map(item => encryptPortfolioContact(item))
        : encryptPortfolioContact(data);

    case 'ai':
      return encryptAILogs(data);

    case 'analytics':
      // Hash IP addresses in analytics data
      if (data.ip_address) {
        data.ip_address_hash = hashIPAddress(data.ip_address);
        delete data.ip_address;
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
        return data.map(item => decryptUserData(item));
      } else if (data.users) {
        // Handle paginated responses
        return {
          ...data,
          users: data.users.map((user: unknown) => decryptUserData(user)),
        };
      } else {
        return decryptUserData(data);
      }

    case 'oauth':
      return decryptOAuthTokens(data);

    case 'portfolio':
      if (Array.isArray(data)) {
        return data.map(item => decryptPortfolioContact(item));
      } else if (data.portfolios) {
        // Handle paginated responses
        return {
          ...data,
          portfolios: data.portfolios.map((portfolio: unknown) =>
            decryptPortfolioContact(portfolio)
          ),
        };
      } else {
        return decryptPortfolioContact(data);
      }

    case 'ai':
      if (Array.isArray(data)) {
        return data.map(item => decryptAILogs(item));
      } else if (data.logs) {
        return {
          ...data,
          logs: data.logs.map((log: unknown) => decryptAILogs(log)),
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
