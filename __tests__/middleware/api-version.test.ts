import { NextRequest, NextResponse } from 'next/server';
import {
  apiVersionMiddleware,
  extractApiVersion,
  isVersionSupported,
  isVersionDeprecated,
  API_VERSION_CONFIG,
  createVersionedResponse,
} from '@/middleware/api-version';

describe('API Version Middleware', () => {
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
    const createMockRequest = (url: string) => {
      return new NextRequest(new URL(url, 'http://localhost:3000'));
    };

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
        message: 'Please upgrade to v1'
      };
      
      API_VERSION_CONFIG.supportedVersions.push('v0');
      API_VERSION_CONFIG.deprecatedVersions.set('v0', testDeprecation);
      
      const request = createMockRequest('/api/v0/portfolios');
      const response = await apiVersionMiddleware(request);
      
      expect(response.headers.get('X-API-Deprecation-Warning')).toBe('Please upgrade to v1');
      expect(response.headers.get('X-API-Sunset-Date')).toBe(testDeprecation.sunsetDate.toISOString());
      expect(response.headers.get('Sunset')).toBeDefined();
      expect(response.headers.get('Deprecation')).toContain('2025-01-01');
      
      // Clean up
      API_VERSION_CONFIG.supportedVersions = API_VERSION_CONFIG.supportedVersions.filter(v => v !== 'v0');
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
        headers: { 'X-Custom': 'value' }
      });
      
      expect(response.status).toBe(201);
      expect(response.headers.get('X-Custom')).toBe('value');
      expect(response.headers.get('X-API-Version')).toBe('v1');
    });
  });
});