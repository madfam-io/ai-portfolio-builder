
// ==================== ULTIMATE TEST SETUP ====================
// Mock all external dependencies
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  headers: new Map(),
  clone: jest.fn(),
});

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.HUGGINGFACE_API_KEY = 'test-key';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

// Mock all stores
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

jest.mock('@/lib/store/portfolio-store', () => ({
  usePortfolioStore: jest.fn(() => ({
    portfolios: [],
    currentPortfolio: null,
    isLoading: false,
    error: null,
    fetchPortfolios: jest.fn(),
    createPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
    setCurrentPortfolio: jest.fn(),
  })),
}));

jest.mock('@/lib/store/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    session: null,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ 
      select: jest.fn().mockReturnThis(), 
      single: jest.fn().mockResolvedValue({ data: null, error: null }) 
    })),
  },
}));

// Mock HuggingFace
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn(() => ({
    enhanceBio: jest.fn().mockResolvedValue({ 
      content: 'Enhanced bio', 
      qualityScore: 90 
    }),
    optimizeProject: jest.fn().mockResolvedValue({ 
      optimizedDescription: 'Optimized project', 
      qualityScore: 85 
    }),
    recommendTemplate: jest.fn().mockResolvedValue([
      { template: 'modern', score: 95 }
    ]),
    listModels: jest.fn().mockResolvedValue([
      { id: 'test-model', name: 'Test Model' }
    ]),
  })),
}));

// Mock React Testing Library
jest.mock('@testing-library/react', () => ({
  ...jest.requireActual('@testing-library/react'),
  render: jest.fn(() => ({
    container: document.createElement('div'),
    getByText: jest.fn(),
    getByRole: jest.fn(),
    queryByText: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// ==================== END ULTIMATE SETUP ====================

import { describe, test, it, expect, jest, beforeEach } from '@jest/globals';
import type { VariantConfig } from '@/components/admin/experiments/create/VariantConfiguration';
import {
  validateExperimentForm,
  getRemainingTrafficPercentage,
} from '@/lib/utils/experiment-validation';

describe('Experiment Validation Utilities', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  describe('validateExperimentForm', () => {
    const createVariant = (
      overrides: Partial<VariantConfig> = {}
    ): VariantConfig => ({
      id: '1',
      name: 'Variant A',
      description: 'Test variant',
      trafficPercentage: 50,
      isControl: false,
      templateId: 'developer',
      ...overrides,
    });

    it('should pass validation for valid experiment', async () => {
      const variants: VariantConfig[] = [
        createVariant({
          id: '1',
          name: 'Control',
          isControl: true,
          trafficPercentage: 50,
        }),
        createVariant({ id: '2', name: 'Variant B', trafficPercentage: 50 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors).toEqual({});
    });

    it('should require experiment name', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 50 }),
        createVariant({ trafficPercentage: 50 }),
      ];

      const errors = validateExperimentForm('', variants);

      expect(errors.name).toBe('Experiment name is required');
    });

    it('should require experiment name to not be only whitespace', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 50 }),
        createVariant({ trafficPercentage: 50 }),
      ];

      const errors = validateExperimentForm('   ', variants);

      expect(errors.name).toBe('Experiment name is required');
    });

    it('should require at least 2 variants', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 100 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors.variants).toBe('At least 2 variants are required');
    });

    it('should require 0 variants to show error', async () => {
      const variants: VariantConfig[] = [];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors.variants).toBe('At least 2 variants are required');
    });

    it('should validate traffic allocation equals 100%', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 30 }),
        createVariant({ trafficPercentage: 40 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors.traffic).toBe(
        'Traffic allocation must equal 100% (currently 70%)'

    });

    it('should validate traffic allocation over 100%', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 60 }),
        createVariant({ trafficPercentage: 50 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors.traffic).toBe(
        'Traffic allocation must equal 100% (currently 110%)'

    });

    it('should require a control variant', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: false, trafficPercentage: 50 }),
        createVariant({ isControl: false, trafficPercentage: 50 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors.control).toBe('One variant must be marked as control');
    });

    it('should allow multiple errors', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: false, trafficPercentage: 30 }),
      ];

      const errors = validateExperimentForm('', variants);

      expect(errors.name).toBe('Experiment name is required');
      expect(errors.variants).toBe('At least 2 variants are required');
      expect(errors.traffic).toBe(
        'Traffic allocation must equal 100% (currently 30%)'

      expect(errors.control).toBe('One variant must be marked as control');
    });

    it('should handle decimal traffic percentages', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 33.33 }),
        createVariant({ trafficPercentage: 33.33 }),
        createVariant({ trafficPercentage: 33.34 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors).toEqual({});
    });

    it('should handle multiple control variants (only check that at least one exists)', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 50 }),
        createVariant({ isControl: true, trafficPercentage: 50 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors.control).toBeUndefined();
    });
  });

  describe('getRemainingTrafficPercentage', () => {
    const createVariant = (trafficPercentage: number): VariantConfig => ({
      id: '1',
      name: 'Variant',
      description: 'Test variant',
      trafficPercentage,
      isControl: false,
      templateId: 'developer',
    });

    it('should calculate remaining traffic for empty variants', async () => {
      const remaining = getRemainingTrafficPercentage([]);
      expect(remaining).toBe(100);
    });

    it('should calculate remaining traffic for single variant', async () => {
      const variants = [createVariant(30)];
      const remaining = getRemainingTrafficPercentage(variants);
      expect(remaining).toBe(70);
    });

    it('should calculate remaining traffic for multiple variants', async () => {
      const variants = [
        createVariant(25),
        createVariant(25),
        createVariant(30),
      ];
      const remaining = getRemainingTrafficPercentage(variants);
      expect(remaining).toBe(20);
    });

    it('should return 0 when traffic is fully allocated', async () => {
      const variants = [createVariant(50), createVariant(50)];
      const remaining = getRemainingTrafficPercentage(variants);
      expect(remaining).toBe(0);
    });

    it('should return negative value when over-allocated', async () => {
      const variants = [createVariant(60), createVariant(50)];
      const remaining = getRemainingTrafficPercentage(variants);
      expect(remaining).toBe(-10);
    });

    it('should handle decimal percentages', async () => {
      const variants = [createVariant(33.33), createVariant(33.33)];
      const remaining = getRemainingTrafficPercentage(variants);
      expect(remaining).toBeCloseTo(33.34, 2);
    });

    it('should handle very small percentages', async () => {
      const variants = [
        createVariant(0.1),
        createVariant(0.1),
        createVariant(0.1),
      ];
      const remaining = getRemainingTrafficPercentage(variants);
      expect(remaining).toBeCloseTo(99.7, 2);
    });
  });
});
