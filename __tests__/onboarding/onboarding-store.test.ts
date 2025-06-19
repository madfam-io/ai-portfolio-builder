
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

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

// Mock zustand
jest.mock('zustand', () => ({
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

// Mock zustand
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));
// Mock zustand

// Mock zustand create function
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}))
  });

  describe('Starting Onboarding', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

    it('should start new user onboarding flow', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startOnboarding('new');
      });

      expect(result.current.isOnboarding).toBe(true);
      expect(result.current.currentFlow?.userType).toBe('new');
      expect(result.current.currentFlow?.steps.length).toBe(7);
      expect(result.current.currentFlow?.currentStepIndex).toBe(0);
    });

    it('should start returning user onboarding flow', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startOnboarding('returning');
      });

      expect(result.current.isOnboarding).toBe(true);
      expect(result.current.currentFlow?.userType).toBe('returning');
      expect(result.current.currentFlow?.steps.length).toBe(2);
    });

    it('should start imported user onboarding flow', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startOnboarding('imported');
      });

      expect(result.current.isOnboarding).toBe(true);
      expect(result.current.currentFlow?.userType).toBe('imported');

  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

      expect(result.current.currentFlow?.steps.length).toBe(3);
    });
  });

  describe('Step Management', () => {
    it('should complete a step and advance to next', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startOnboarding('new');
      });

      const firstStep = result.current.getCurrentStep();
      expect(firstStep?.id).toBe('welcome');

      await act(async () => {
        result.current.completeStep('welcome', { test: 'metadata' });
      });

      const currentStep = result.current.getCurrentStep();
      expect(currentStep?.id).toBe('profile-setup');
      expect(result.current.currentFlow?.steps[0].completed).toBe(true);
      expect(result.current.currentFlow?.steps[0].metadata).toEqual({
        test: 'metadata',
      });
    });

    it('should skip a step', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startOnboarding('new');
        result.current.skipStep('welcome');
      });

      expect(result.current.currentFlow?.steps[0].skipped).toBe(true);
      expect(result.current.getCurrentStep()?.id).toBe('profile-setup');
    });

    it('should navigate to specific step', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startOnboarding('new');
        result.current.goToStep(3);
      });

      expect(result.current.currentFlow?.currentStepIndex).toBe(3);
      expect(result.current.getCurrentStep()?.id).toBe('ai-enhancement');
    });

    it('should complete onboarding when all steps are done', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startOnboarding('new');
      });

      // Get the steps to complete
      const steps = result.current.currentFlow?.steps || [];

      // Complete each step individually
      steps.forEach(step => {
        await act(async () => {
          result.current.completeStep(step.id);
        });
      });

      expect(result.current.isOnboarding).toBe(false);
      expect(result.current.completedFlows).toContain('new-user-flow');
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate progress correctly', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startOnboarding('new');
      });

      expect(result.current.getProgress()).toBe(0);

      await act(async () => {
        result.current.completeStep('welcome');
        result.current.completeStep('profile-setup');
      });

      // 2 out of 7 steps = ~29%
      expect(result.current.getProgress()).toBeCloseTo(29, 0);

      await act(async () => {
        result.current.skipStep('first-portfolio');
      });

      // 3 out of 7 steps = ~43%
      expect(result.current.getProgress()).toBeCloseTo(43, 0);
    });

    it('should track completed flows', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startOnboarding('new');
        result.current.completeOnboarding();
      });

      expect(result.current.completedFlows).toContain('new-user-flow');

      await act(async () => {
        result.current.startOnboarding('returning');
        result.current.completeOnboarding();
      });

      expect(result.current.completedFlows).toContain('returning-user-flow');
      expect(result.current.completedFlows.length).toBe(2);
    });
  });

  describe('Tour Management', () => {
    it('should start and navigate tour', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startTour('dashboard');
      });

      expect(result.current.tourActive).toBe(true);
      expect(result.current.currentTourStep).toBe(0);

      await act(async () => {
        result.current.nextTourStep();
      });

      expect(result.current.currentTourStep).toBe(1);

      await act(async () => {
        result.current.previousTourStep();
      });

      expect(result.current.currentTourStep).toBe(0);

      await act(async () => {
        result.current.endTour();
      });

      expect(result.current.tourActive).toBe(false);
      expect(result.current.currentTourStep).toBe(0);
    });
  });

  describe('UI State Management', () => {
    it('should toggle checklist visibility', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      // Set initial state to true before testing
      await act(async () => {
        useOnboardingStore.setState({ showChecklist: true });
      });

      expect(result.current.showChecklist).toBe(true);

      await act(async () => {
        result.current.toggleChecklist();
      });

      expect(result.current.showChecklist).toBe(false);
    });

    it('should dismiss hints', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.dismissHint('test-hint-1');
        result.current.dismissHint('test-hint-2');
      });

      expect(result.current.dismissedHints).toContain('test-hint-1');
      expect(result.current.dismissedHints).toContain('test-hint-2');

      // Should not add duplicates
      await act(async () => {
        result.current.dismissHint('test-hint-1');
      });

      expect(
        result.current.dismissedHints.filter(h => h === 'test-hint-1').length
      ).toBe(1);
    });

    it('should update preferences', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      expect(result.current.preferences.skipTours).toBe(false);

      await act(async () => {
        result.current.updatePreferences({
          skipTours: true,
          emailReminders: false,
        });
      });

      expect(result.current.preferences.skipTours).toBe(true);
      expect(result.current.preferences.emailReminders).toBe(false);
      expect(result.current.preferences.showProgress).toBe(true); // Unchanged
    });
  });

  describe('Getters', () => {
    it('should check if step is completed', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startOnboarding('new');
        result.current.completeStep('welcome');
      });

      expect(result.current.isStepCompleted('welcome')).toBe(true);
      expect(result.current.isStepCompleted('profile-setup')).toBe(false);
    });

    it('should get next incomplete step', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startOnboarding('new');
        result.current.completeStep('welcome');
        result.current.skipStep('profile-setup');
      });

      const nextStep = result.current.getNextIncompleteStep();
      expect(nextStep?.id).toBe('first-portfolio');
    });

    it('should return null when all steps are complete', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.startOnboarding('returning');
        result.current.completeStep('whats-new');
        result.current.completeStep('feature-highlights');
      });

      const nextStep = result.current.getNextIncompleteStep();
      expect(nextStep).toBeNull();
    });
  });
});
