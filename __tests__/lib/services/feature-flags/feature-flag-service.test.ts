
import { FeatureFlagService } from '@/lib/services/feature-flags/feature-flag-service';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;

  beforeEach(() => {
    service = new FeatureFlagService();
  });

  describe('isEnabled', () => {
    it('should return true for enabled features', () => {
      const result = service.isEnabled('test-feature');
      expect(result).toBe(true);
    });

    it('should return false for disabled features', () => {
      const result = service.isEnabled('disabled-feature');
      expect(result).toBe(false);
    });
  });

  describe('getVariant', () => {
    it('should return variant for feature', () => {
      const result = service.getVariant('test-feature');
      expect(['control', 'variant-a', 'variant-b']).toContain(result);
    });
  });

  describe('getAllFlags', () => {
    it('should return all feature flags', () => {
      const result = service.getAllFlags();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});
