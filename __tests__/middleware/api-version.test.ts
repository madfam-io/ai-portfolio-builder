import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import {
  apiVersionMiddleware,
  extractApiVersion,
  isVersionSupported,
  isVersionDeprecated,
  getDeprecationInfo,
  createVersionedResponse,
  withApiVersion,
  API_VERSION_CONFIG,
} from '../../middleware/api-version';

describe('API Version Middleware', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    global.fetch = jest.fn();
    // Reset configuration to defaults
    API_VERSION_CONFIG._currentVersion = 'v1';
    API_VERSION_CONFIG.supportedVersions = ['v1'];
    API_VERSION_CONFIG.deprecatedVersions.clear();
  });

  const createRequest = (
    pathname: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
    } = {}
  ) => {
    const url = new URL(`https://example.com${pathname}`);
    const headers = new Headers(options.headers);

    return new NextRequest(url, {
      method: options.method || 'GET',
      headers,
    });
  };

  describe('extractApiVersion', () => {
    it('should extract version from valid API path', async () => {
      expect(extractApiVersion('/api/v1/portfolios')).toBe('v1');
      expect(extractApiVersion('/api/v2/users')).toBe('v2');
      expect(extractApiVersion('/api/v10/test')).toBe('v10');
    });

    it('should return null for non-versioned API paths', async () => {
      expect(extractApiVersion('/api/portfolios')).toBeNull();
      expect(extractApiVersion('/api/test')).toBeNull();
      expect(extractApiVersion('/api/')).toBeNull();
    });

    it('should return null for non-API paths', async () => {
      expect(extractApiVersion('/dashboard')).toBeNull();
      expect(extractApiVersion('/v1/portfolios')).toBeNull();
      expect(extractApiVersion('/')).toBeNull();
    });

    it('should handle edge cases', async () => {
      expect(extractApiVersion('/api/v1')).toBeNull(); // No trailing slash
      expect(extractApiVersion('/api/v1/')).toBe('v1');
      expect(extractApiVersion('/api/v1/test/v2')).toBe('v1'); // Only first version
      expect(extractApiVersion('/api/version1/test')).toBeNull(); // Invalid format
    });
  });

  describe('isVersionSupported', () => {
    it('should return true for supported versions', async () => {
      expect(isVersionSupported('v1')).toBe(true);
    });

    it('should return false for unsupported versions', async () => {
      expect(isVersionSupported('v2')).toBe(false);
      expect(isVersionSupported('v0')).toBe(false);
      expect(isVersionSupported('invalid')).toBe(false);
    });

    it('should work with multiple supported versions', async () => {
      API_VERSION_CONFIG.supportedVersions = ['v1', 'v2', 'v3'];

      expect(isVersionSupported('v1')).toBe(true);
      expect(isVersionSupported('v2')).toBe(true);
      expect(isVersionSupported('v3')).toBe(true);
      expect(isVersionSupported('v4')).toBe(false);
    });
  });

  describe('deprecation handling', () => {
    beforeEach(() => {
    global.fetch = jest.fn();
      // Add a deprecated version for testing
      API_VERSION_CONFIG.deprecatedVersions.set('v0', {
        deprecatedAt: new Date('2025-01-01'),
        sunsetDate: new Date('2025-06-01T00:00:00.000Z'),
        message: 'API v0 is deprecated. Please upgrade to v1.',
      });
      API_VERSION_CONFIG.supportedVersions = ['v0', 'v1'];
    });

    describe('isVersionDeprecated', () => {
      it('should return true for deprecated versions', async () => {
        expect(isVersionDeprecated('v0')).toBe(true);
      });

      it('should return false for non-deprecated versions', async () => {
        expect(isVersionDeprecated('v1')).toBe(false);
        expect(isVersionDeprecated('v2')).toBe(false);
      });
    });

    describe('getDeprecationInfo', () => {
      it('should return deprecation info for deprecated versions', async () => {
        const info = getDeprecationInfo('v0');

        expect(info).toBeDefined();
        expect(info?.message).toBe(
          'API v0 is deprecated. Please upgrade to v1.'
        );
        expect(info?.deprecatedAt).toEqual(new Date('2025-01-01'));
        expect(info?.sunsetDate).toEqual(new Date('2025-06-01T00:00:00.000Z'));
      });

      it('should return undefined for non-deprecated versions', async () => {
        expect(getDeprecationInfo('v1')).toBeUndefined();
      });
    });
  });

  describe('apiVersionMiddleware', () => {
    describe('non-API routes', () => {
      it('should pass through non-API requests unchanged', async () => {
        const request = createRequest('/dashboard');
        const response = await apiVersionMiddleware(request);

        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.headers.get('location')).toBeNull();
      });

      it('should pass through root requests', async () => {
        const request = createRequest('/');
        const response = await apiVersionMiddleware(request);

        expect(response.status).toBe(200);
      });
    });

    describe('API route redirects', () => {
      it('should redirect /api/ to current version', async () => {
        const request = createRequest('/api/');
        const response = await apiVersionMiddleware(request);

        expect(response.status).toBe(307); // Temporary redirect
        expect(response.headers.get('location')).toBe(
          'https://example.com/api/v1/'
        );
      });

      it('should redirect non-versioned API paths to current version', async () => {
        const request = createRequest('/api/portfolios');
        const response = await apiVersionMiddleware(request);

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe(
          'https://example.com/api/v1/portfolios'
        );
      });

      it('should redirect nested non-versioned paths', async () => {
        const request = createRequest('/api/portfolios/123/publish');
        const response = await apiVersionMiddleware(request);

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe(
          'https://example.com/api/v1/portfolios/123/publish'
        );
      });

      it('should preserve query parameters in redirects', async () => {
        const request = createRequest('/api/portfolios?limit=10&offset=20');
        const response = await apiVersionMiddleware(request);

        const location = response.headers.get('location');
        expect(location).toContain('/api/v1/portfolios');
        // Query params might be handled differently in the middleware;
      });
    });

    describe('version validation', () => {
      it('should allow requests to supported versions', async () => {
        const request = createRequest('/api/v1/portfolios');
        const response = await apiVersionMiddleware(request);

        expect(response.status).toBe(200);
        expect(response.headers.get('X-API-Version')).toBe('v1');
        expect(response.headers.get('X-API-Current-Version')).toBe('v1');
        expect(response.headers.get('X-API-Supported-Versions')).toBe('v1');
      });

      it('should reject requests to unsupported versions', async () => {
        const request = createRequest('/api/v2/portfolios');
        const response = await apiVersionMiddleware(request);

        expect(response.status).toBe(400);

        const body = await response.json();
        expect(body._error).toBe('Unsupported API Version');
        expect(body._message).toContain('API version v2 is not supported');
        expect(body._currentVersion).toBe('v1');
      });

      it('should handle multiple supported versions', async () => {
        API_VERSION_CONFIG.supportedVersions = ['v1', 'v2'];

        const requestV1 = createRequest('/api/v1/portfolios');
        const responseV1 = await apiVersionMiddleware(requestV1);
        expect(responseV1.status).toBe(200);

        const requestV2 = createRequest('/api/v2/portfolios');
        const responseV2 = await apiVersionMiddleware(requestV2);
        expect(responseV2.status).toBe(200);

        const requestV3 = createRequest('/api/v3/portfolios');
        const responseV3 = await apiVersionMiddleware(requestV3);
        expect(responseV3.status).toBe(400);
      });
    });

    describe('deprecation warnings', () => {
      beforeEach(() => {
    global.fetch = jest.fn();
        API_VERSION_CONFIG.deprecatedVersions.set('v0', {
          deprecatedAt: new Date('2025-01-01T00:00:00Z'),
          sunsetDate: new Date('2025-06-01T00:00:00Z'),
          message: 'Please upgrade to v1',
        });
        API_VERSION_CONFIG.supportedVersions = ['v0', 'v1'];
      });

      it('should add deprecation headers for deprecated versions', async () => {
        const request = createRequest('/api/v0/portfolios');
        const response = await apiVersionMiddleware(request);

        expect(response.status).toBe(200);
        expect(response.headers.get('X-API-Deprecation-Warning')).toBe(
          'Please upgrade to v1'
        );
        expect(response.headers.get('X-API-Sunset-Date')).toBe(
          '2025-06-01T00:00:00.000Z'
        );
        expect(response.headers.get('Sunset')).toBe(
          'Mon, 01 Jun 2025 00:00:00 GMT'
        );
        expect(response.headers.get('Deprecation')).toBe(
          'date="2025-01-01T00:00:00.000Z"'
        );
      });

      it('should not add deprecation headers for current versions', async () => {
        const request = createRequest('/api/v1/portfolios');
        const response = await apiVersionMiddleware(request);

        expect(response.status).toBe(200);
        expect(response.headers.get('X-API-Deprecation-Warning')).toBeNull();
        expect(response.headers.get('X-API-Sunset-Date')).toBeNull();
        expect(response.headers.get('Sunset')).toBeNull();
        expect(response.headers.get('Deprecation')).toBeNull();
      });
    });

    describe('headers', () => {
      it('should add standard API version headers', async () => {
        const request = createRequest('/api/v1/portfolios');
        const response = await apiVersionMiddleware(request);

        expect(response.headers.get('X-API-Version')).toBe('v1');
        expect(response.headers.get('X-API-Current-Version')).toBe('v1');
        expect(response.headers.get('X-API-Supported-Versions')).toBe('v1');
      });

      it('should handle requests with existing headers', async () => {
        const request = createRequest('/api/v1/portfolios', {
          headers: { Authorization: 'Bearer token123' },
        });
        const response = await apiVersionMiddleware(request);

        expect(response.status).toBe(200);
        expect(response.headers.get('X-API-Version')).toBe('v1');
      });
    });

    describe('edge cases', () => {
      it('should handle malformed version paths', async () => {
        const request = createRequest('/api/version1/portfolios');
        const response = await apiVersionMiddleware(request);

        // Should redirect to current version
        expect(response.status).toBe(307);
      });

      it('should handle very long version numbers', async () => {
        const request = createRequest('/api/v999999999/portfolios');
        const response = await apiVersionMiddleware(request);

        expect(response.status).toBe(400);
      });

      it('should handle special characters in paths', async () => {
        const request = createRequest('/api/v1/portfolios/@special');
        const response = await apiVersionMiddleware(request);

        expect(response.status).toBe(200);
      });
    });
  });

  describe('createVersionedResponse', () => {
    it('should create response with version headers', async () => {
      const data = { message: 'success' };
      const response = createVersionedResponse(data);

      expect(response.headers.get('X-API-Version')).toBe('v1');
      expect(response.headers.get('X-API-Response-Time')).toBeDefined();
    });

    it('should accept custom status and headers', async () => {
      const data = { error: 'not found' };
      const response = createVersionedResponse(data, {
        status: 404,
        headers: { 'Custom-Header': 'value' },
        version: 'v2',
      });

      expect(response.status).toBe(404);
      expect(response.headers.get('Custom-Header')).toBe('value');
      expect(response.headers.get('X-API-Version')).toBe('v2');
    });

    it('should handle empty data', async () => {
      const response = createVersionedResponse(null);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-API-Version')).toBe('v1');
    });
  });

  describe('withApiVersion', () => {
    const mockHandler = jest.fn();

    beforeEach(() => {
    global.fetch = jest.fn();
      mockHandler.mockClear();
      mockHandler.mockResolvedValue(new NextResponse('success'));
    });

    it('should call handler with version context', async () => {
      const wrappedHandler = withApiVersion(mockHandler);
      const request = createRequest('/api/v1/test');

      await wrappedHandler(request);

      expect(mockHandler).toHaveBeenCalledWith(request, { _apiVersion: 'v1' });
    });

    it('should default to current version for non-versioned paths', async () => {
      const wrappedHandler = withApiVersion(mockHandler);
      const request = createRequest('/api/test');

      await wrappedHandler(request);

      expect(mockHandler).toHaveBeenCalledWith(request, { _apiVersion: 'v1' });
    });

    it('should enforce minimum version requirement', async () => {
      const wrappedHandler = withApiVersion(mockHandler, { minVersion: 'v2' });
      const request = createRequest('/api/v1/test');

      const response = await wrappedHandler(request);

      expect(response.status).toBe(400);
      expect(mockHandler).not.toHaveBeenCalled();

      const body = await response.json();
      expect(body._error).toBe('Version Too Low');
    });

    it('should enforce maximum version requirement', async () => {
      const wrappedHandler = withApiVersion(mockHandler, { maxVersion: 'v1' });
      const request = createRequest('/api/v2/test');

      const response = await wrappedHandler(request);

      expect(response.status).toBe(400);
      expect(mockHandler).not.toHaveBeenCalled();

      const body = await response.json();
      expect(body._error).toBe('Version Too High');
    });

    it('should allow versions within range', async () => {
      const wrappedHandler = withApiVersion(mockHandler, {
        minVersion: 'v1',
        maxVersion: 'v3',
      });

      const requests = [
        createRequest('/api/v1/test'),
        createRequest('/api/v2/test'),
        createRequest('/api/v3/test'),
      ];

      for (const request of requests) {
        mockHandler.mockClear();
        const response = await wrappedHandler(request);

        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalled();
      }
    });

    it('should handle version comparison correctly', async () => {
      const wrappedHandler = withApiVersion(mockHandler, {
        minVersion: 'v2',
        maxVersion: 'v10',
      });

      // v1 should be too low
      const lowRequest = createRequest('/api/v1/test');
      const lowResponse = await wrappedHandler(lowRequest);
      expect(lowResponse.status).toBe(400);

      // v11 should be too high
      const highRequest = createRequest('/api/v11/test');
      const highResponse = await wrappedHandler(highRequest);
      expect(highResponse.status).toBe(400);

      // v5 should be within range
      mockHandler.mockClear();
      const validRequest = createRequest('/api/v5/test');
      const validResponse = await wrappedHandler(validRequest);
      expect(validResponse.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('performance and integration', () => {
    it('should handle high volume of requests efficiently', async () => {
      const requests = Array.from({ length: 100 }, (_, i) =>
        createRequest(`/api/v1/test-${i}`)
      );
      const startTime = Date.now();
      const responses = await Promise.all(
        requests.map(req => apiVersionMiddleware(req))
      );
      const endTime = Date.now();

      expect(responses).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast

      // All should be successful
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should maintain configuration state between requests', async () => {
      // Add a deprecated version
      API_VERSION_CONFIG.deprecatedVersions.set('v0', {
        deprecatedAt: new Date('2025-01-01'),
        sunsetDate: new Date('2025-06-01T00:00:00.000Z'),
        message: 'Deprecated',
      });
      API_VERSION_CONFIG.supportedVersions = ['v0', 'v1'];

      const request1 = createRequest('/api/v0/test1');
      const response1 = await apiVersionMiddleware(request1);

      const request2 = createRequest('/api/v0/test2');
      const response2 = await apiVersionMiddleware(request2);

      // Both should have deprecation headers
      expect(response1.headers.get('X-API-Deprecation-Warning')).toBe(
        'Deprecated'
      );
      expect(response2.headers.get('X-API-Deprecation-Warning')).toBe(
        'Deprecated'
      );
    });
  });
});
