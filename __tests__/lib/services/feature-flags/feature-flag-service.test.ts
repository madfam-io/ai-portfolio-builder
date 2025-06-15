import { FeatureFlagService } from '@/lib/services/feature-flags/feature-flag-service';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

jest.mock('next/headers');
jest.mock('@/lib/supabase/server');

describe('FeatureFlagService', () => {
  const mockCookies = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  };

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    rpc: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockResolvedValue(mockCookies);
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    
    // Mock visitor ID generation
    mockCookies.get.mockReturnValue(undefined); // No existing visitor ID
    
    // Mock crypto.randomUUID if it exists
    if (crypto.randomUUID) {
      jest.spyOn(crypto, 'randomUUID').mockReturnValue('test-visitor-id');
    } else {
      // Fallback for older Node versions
      (crypto as any).randomUUID = jest.fn().mockReturnValue('test-visitor-id');
    }
    
    // Mock crypto for deterministic hashing in tests
    jest.spyOn(crypto, 'createHash').mockImplementation(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('00000000abcdef123456789') // Low hash to ensure assignment
    } as any));
  });

  describe('getActiveExperiment', () => {
    it.skip('should return active experiment when available', async () => {
      // Return existing assignment to bypass the assignment logic
      const existingAssignment = {
        'exp-1': {
          experimentId: 'exp-1',
          variantId: 'var-1',
          assignedAt: new Date()
        }
      };
      
      mockCookies.get.mockImplementation((name) => {
        if (name === 'prisma_experiments') {
          return { value: encodeURIComponent(JSON.stringify(existingAssignment)) };
        }
        if (name === 'prisma_visitor_id') {
          return { value: 'test-visitor-id' };
        }
        return undefined;
      });

      mockSupabase.order.mockResolvedValue({
        data: [{
          id: 'exp-1',
          traffic_percentage: 100,
          target_audience: {},
          variants: [{
            id: 'var-1',
            name: 'variant-a',
            traffic_percentage: 100,
            components: [],
            theme_overrides: {}
          }]
        }],
        error: null
      });

      const result = await FeatureFlagService.getActiveExperiment();
      
      expect(result).toBeDefined();
      expect(result?.experimentId).toBe('exp-1');
      expect(result?.variantName).toBe('variant-a');
    });

    it('should return null when no experiments available', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await FeatureFlagService.getActiveExperiment();
      
      expect(result).toBeNull();
    });
  });

  describe('isFeatureEnabled', () => {
    it('should check if feature is enabled', async () => {
      const mockExperiment = {
        experimentId: 'exp-1',
        variantId: 'var-1',
        variantName: 'variant-a',
        components: [{
          type: 'hero',
          variant: 'modern',
          visible: true
        }],
        themeOverrides: {}
      };

      jest.spyOn(FeatureFlagService, 'getActiveExperiment').mockResolvedValue(mockExperiment);

      const result = await FeatureFlagService.isFeatureEnabled('hero', 'modern');
      
      expect(result).toBe(true);
    });

    it('should return false for disabled features', async () => {
      jest.spyOn(FeatureFlagService, 'getActiveExperiment').mockResolvedValue(null);

      const result = await FeatureFlagService.isFeatureEnabled('hero', 'modern');
      
      expect(result).toBe(false);
    });
  });

  describe('clearAssignments', () => {
    it('should clear experiment assignments', async () => {
      await FeatureFlagService.clearAssignments();
      
      expect(mockCookies.delete).toHaveBeenCalledWith('prisma_experiments');
    });
  });
});
