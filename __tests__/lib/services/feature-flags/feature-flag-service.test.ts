/**
 * @fileoverview Tests for Feature Flag Service
 */

import { FeatureFlagService } from '@/lib/services/feature-flags/feature-flag-service';

// Mock Next.js modules
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }))
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          or: jest.fn(() => ({
            or: jest.fn(() => ({
              order: jest.fn(() => ({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      }))
    })),
    rpc: jest.fn()
  }))
}));

describe('FeatureFlagService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashToPercentage', () => {
    it('should return consistent hash values', () => {
      // Access private method through any type
      const service = FeatureFlagService as any;
      
      const hash1 = service.hashToPercentage('test-string');
      const hash2 = service.hashToPercentage('test-string');
      
      expect(hash1).toBe(hash2);
      expect(hash1).toBeGreaterThanOrEqual(0);
      expect(hash1).toBeLessThan(100);
    });
  });

  describe('matchesTargeting', () => {
    it('should match when no targeting is specified', () => {
      const service = FeatureFlagService as any;
      
      const result = service.matchesTargeting({}, {
        country: 'US',
        device: 'desktop'
      });
      
      expect(result).toBe(true);
    });

    it('should match when targeting criteria are met', () => {
      const service = FeatureFlagService as any;
      
      const result = service.matchesTargeting(
        { geo: ['US', 'MX'], device: ['desktop'] },
        { country: 'US', device: 'desktop' }
      );
      
      expect(result).toBe(true);
    });

    it('should not match when targeting criteria are not met', () => {
      const service = FeatureFlagService as any;
      
      const result = service.matchesTargeting(
        { geo: ['US'], device: ['mobile'] },
        { country: 'MX', device: 'desktop' }
      );
      
      expect(result).toBe(false);
    });
  });

  describe('getActiveExperiment', () => {
    it('should return null when no experiments are active', async () => {
      const result = await FeatureFlagService.getActiveExperiment();
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      // Mock createClient to throw an error
      const { createClient } = require('@/lib/supabase/server');
      createClient.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const result = await FeatureFlagService.getActiveExperiment();
      expect(result).toBeNull();
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return false when no experiment is active', async () => {
      const result = await FeatureFlagService.isFeatureEnabled('hero', 'minimal');
      expect(result).toBe(false);
    });
  });
});