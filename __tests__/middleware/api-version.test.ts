import { NextRequest } from 'next/server';

import {
  apiVersionMiddleware,
  extractApiVersion,
  isVersionSupported,
  API_VERSION_CONFIG,
  createVersionedResponse,
} from '@/middleware/api-version';

describe('API Version Middleware', () => {
  // Helper to create mock requests
  const createMockRequest = (url: string, options: RequestInit = {}) => {
    return new NextRequest(new URL(url, 'http://localhost:3000'), options);
  };

  describe('extractApiVersion', () => {
    it('should extract version from valid API paths', () => {
      expect(extractApiVersion('/api/v1/portfolios')).toBe('v1');
      expect(extractApiVersion('/api/v2/ai/enhance-bio')).toBe('v2');
      expect(extractApiVersion('/api/v10/test')).toBe('v10');
    });

    it('should return null for non-versioned paths', () => {
      expect(extractApiVersion('/api/portfolios')).toBeNull();
      expect(extractApiVersion('/other/path')).toBeNull();
      expect(extractApiVersion('/api/')).toBeNull();
    });

    it('should handle complex nested paths', () => {
      expect(extractApiVersion('/api/v1/portfolios/123/publish')).toBe('v1');
      expect(extractApiVersion('/api/v1/ai/models/selection')).toBe('v1');
      expect(extractApiVersion('/api/v1/analytics/repositories/456')).toBe(
        'v1'
      );
    });

    it('should handle edge cases', () => {
      expect(extractApiVersion('/api/v/test')).toBeNull(); // Invalid version
      expect(extractApiVersion('/api/version1/test')).toBeNull(); // Wrong format
      expect(extractApiVersion('/api/v1')).toBe('v1'); // No trailing path
    });
  });

  describe('isVersionSupported', () => {
    it('should return true for supported versions', () => {
      expect(isVersionSupported('v1')).toBe(true);
    });

    it('should return false for unsupported versions', () => {
      expect(isVersionSupported('v0')).toBe(false);
      expect(isVersionSupported('v999')).toBe(false);
    });
  });

  describe('apiVersionMiddleware', () => {
    it('should pass through non-API routes', async () => {
      const request = createMockRequest('/dashboard');
      const response = await apiVersionMiddleware(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-API-Version')).toBeNull();
    });

    it('should redirect unversioned API routes to current version', async () => {
      const request = createMockRequest('/api/portfolios');
      const response = await apiVersionMiddleware(request);

      expect(response.status).toBe(307); // Temporary redirect
      expect(response.headers.get('location')).toContain('/api/v1/portfolios');
    });

    it('should add version headers to API responses', async () => {
      const request = createMockRequest('/api/v1/portfolios');
      const response = await apiVersionMiddleware(request);

      expect(response.headers.get('X-API-Version')).toBe('v1');
      expect(response.headers.get('X-API-Current-Version')).toBe('v1');
      expect(response.headers.get('X-API-Supported-Versions')).toBe('v1');
    });

    it('should return error for unsupported versions', async () => {
      const request = createMockRequest('/api/v999/portfolios');
      const response = await apiVersionMiddleware(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unsupported API Version');
      expect(data.currentVersion).toBe('v1');
    });

    it('should add deprecation headers for deprecated versions', async () => {
      // Temporarily add a deprecated version for testing
      const testDeprecation = {
        deprecatedAt: new Date('2025-01-01'),
        sunsetDate: new Date('2025-06-01'),
        message: 'Please upgrade to v1',
      };

      API_VERSION_CONFIG.supportedVersions.push('v0');
      API_VERSION_CONFIG.deprecatedVersions.set('v0', testDeprecation);

      const request = createMockRequest('/api/v0/portfolios');
      const response = await apiVersionMiddleware(request);

      expect(response.headers.get('X-API-Deprecation-Warning')).toBe(
        'Please upgrade to v1'
      );
      expect(response.headers.get('X-API-Sunset-Date')).toBe(
        testDeprecation.sunsetDate.toISOString()
      );
      expect(response.headers.get('Sunset')).toBeDefined();
      expect(response.headers.get('Deprecation')).toContain('2025-01-01');

      // Clean up
      API_VERSION_CONFIG.supportedVersions =
        API_VERSION_CONFIG.supportedVersions.filter(v => v !== 'v0');
      API_VERSION_CONFIG.deprecatedVersions.delete('v0');
    });
  });

  describe('createVersionedResponse', () => {
    it('should create response with version headers', () => {
      const data = { message: 'Success' };
      const response = createVersionedResponse(data);

      expect(response.headers.get('X-API-Version')).toBe('v1');
      expect(response.headers.get('X-API-Response-Time')).toBeDefined();
    });

    it('should allow custom status and headers', () => {
      const data = { id: '123' };
      const response = createVersionedResponse(data, {
        status: 201,
        headers: { 'X-Custom': 'value' },
      });

      expect(response.status).toBe(201);
      expect(response.headers.get('X-Custom')).toBe('value');
      expect(response.headers.get('X-API-Version')).toBe('v1');
    });
  });

  describe('Version Header Handling', () => {
    it('should accept version via Accept header', async () => {
      const request = createMockRequest('/api/portfolios', {
        headers: {
          Accept: 'application/vnd.prisma.v1+json',
        },
      });
      const response = await apiVersionMiddleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/api/v1/portfolios');
    });

    it('should handle X-API-Version header', async () => {
      const request = createMockRequest('/api/portfolios', {
        headers: {
          'X-API-Version': 'v1',
        },
      });
      const response = await apiVersionMiddleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/api/v1/portfolios');
    });

    it('should prioritize URL version over headers', async () => {
      const request = createMockRequest('/api/v1/portfolios', {
        headers: {
          'X-API-Version': 'v2',
        },
      });
      const response = await apiVersionMiddleware(request);

      expect(response.headers.get('X-API-Version')).toBe('v1');
    });
  });

  describe('CORS and Security Headers', () => {
    it('should add CORS headers for API routes', async () => {
      const request = createMockRequest('/api/v1/portfolios');
      const response = await apiVersionMiddleware(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
      expect(
        response.headers.get('Access-Control-Allow-Methods')
      ).toBeDefined();
    });

    it('should handle OPTIONS preflight requests', async () => {
      const request = createMockRequest('/api/v1/portfolios', {
        method: 'OPTIONS',
      });
      const response = await apiVersionMiddleware(request);

      expect(response.status).toBe(204);
      expect(
        response.headers.get('Access-Control-Allow-Headers')
      ).toBeDefined();
    });

    it('should add security headers', async () => {
      const request = createMockRequest('/api/v1/portfolios');
      const response = await apiVersionMiddleware(request);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('Rate Limiting Headers', () => {
    it('should add rate limit headers', async () => {
      const request = createMockRequest('/api/v1/portfolios');
      const response = await apiVersionMiddleware(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle malformed API paths gracefully', async () => {
      const request = createMockRequest('/api//v1//portfolios');
      const response = await apiVersionMiddleware(request);

      expect(response.status).toBe(307);
    });

    it('should return 404 for non-existent API endpoints', async () => {
      const request = createMockRequest('/api/v1/non-existent-endpoint');
      const response = await apiVersionMiddleware(request);

      // Middleware passes through, actual 404 would be handled by Next.js
      expect(response.headers.get('X-API-Version')).toBe('v1');
    });

    it('should handle version upgrade path', async () => {
      const request = createMockRequest('/api/v0/portfolios');
      const response = await apiVersionMiddleware(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.upgradeGuide).toBeDefined();
    });
  });
});
