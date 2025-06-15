import { FeatureFlagService } from '@/lib/services/feature-flags/feature-flag-service';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

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
  });

  describe('getActiveExperiment', () => {
    it('should return active experiment when available', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [{
          id: 'exp-1',
          traffic_percentage: 100,
          target_audience: {},
          variants: [{
            id: 'var-1',
            name: 'variant-a',
            traffic_percentage: 50,
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
