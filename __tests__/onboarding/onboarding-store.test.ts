import { describe, test, it, expect, beforeEach } from '@jest/globals';

/**
 * Onboarding Store Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useOnboardingStore } from '@/lib/store/onboarding-store';

describe('OnboardingStore', () => {
  beforeEach(() => {
    // Clear localStorage to prevent persistence issues
    localStorage.clear();

    // Reset Zustand store state
    useOnboardingStore.setState({
      isOnboarding: false,
      currentFlow: null,
      completedFlows: [],
      tourActive: false,
      currentTourStep: 0,
      showChecklist: false,
      dismissedHints: [],
      preferences: {
        skipTours: false,
        emailReminders: true,
        showProgress: true,
      },
    });
  });

  describe('Starting Onboarding', () => {
    it('should start new user onboarding flow', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startOnboarding('new');
      });

      expect(result.current.isOnboarding).toBe(true);
      expect(result.current.currentFlow?.userType).toBe('new');
      expect(result.current.currentFlow?.steps.length).toBe(7);
      expect(result.current.currentFlow?.currentStepIndex).toBe(0);
    });

    it('should start returning user onboarding flow', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startOnboarding('returning');
      });

      expect(result.current.isOnboarding).toBe(true);
      expect(result.current.currentFlow?.userType).toBe('returning');
      expect(result.current.currentFlow?.steps.length).toBe(2);
    });

    it('should start imported user onboarding flow', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startOnboarding('imported');
      });

      expect(result.current.isOnboarding).toBe(true);
      expect(result.current.currentFlow?.userType).toBe('imported');
      expect(result.current.currentFlow?.steps.length).toBe(3);
    });
  });

  describe('Step Management', () => {
    it('should complete a step and advance to next', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startOnboarding('new');
      });

      const firstStep = result.current.getCurrentStep();
      expect(firstStep?.id).toBe('welcome');

      act(() => {
        result.current.completeStep('welcome', { test: 'metadata' });
      });

      const currentStep = result.current.getCurrentStep();
      expect(currentStep?.id).toBe('profile-setup');
      expect(result.current.currentFlow?.steps[0].completed).toBe(true);
      expect(result.current.currentFlow?.steps[0].metadata).toEqual({
        test: 'metadata',
      });
    });

    it('should skip a step', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startOnboarding('new');
        result.current.skipStep('welcome');
      });

      expect(result.current.currentFlow?.steps[0].skipped).toBe(true);
      expect(result.current.getCurrentStep()?.id).toBe('profile-setup');
    });

    it('should navigate to specific step', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startOnboarding('new');
        result.current.goToStep(3);
      });

      expect(result.current.currentFlow?.currentStepIndex).toBe(3);
      expect(result.current.getCurrentStep()?.id).toBe('ai-enhancement');
    });

    it('should complete onboarding when all steps are done', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startOnboarding('new');
      });

      // Get the steps to complete
      const steps = result.current.currentFlow?.steps || [];

      // Complete each step individually
      steps.forEach(step => {
        act(() => {
          result.current.completeStep(step.id);
        });
      });

      expect(result.current.isOnboarding).toBe(false);
      expect(result.current.completedFlows).toContain('new-user-flow');
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate progress correctly', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startOnboarding('new');
      });

      expect(result.current.getProgress()).toBe(0);

      act(() => {
        result.current.completeStep('welcome');
        result.current.completeStep('profile-setup');
      });

      // 2 out of 7 steps = ~29%
      expect(result.current.getProgress()).toBeCloseTo(29, 0);

      act(() => {
        result.current.skipStep('first-portfolio');
      });

      // 3 out of 7 steps = ~43%
      expect(result.current.getProgress()).toBeCloseTo(43, 0);
    });

    it('should track completed flows', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startOnboarding('new');
        result.current.completeOnboarding();
      });

      expect(result.current.completedFlows).toContain('new-user-flow');

      act(() => {
        result.current.startOnboarding('returning');
        result.current.completeOnboarding();
      });

      expect(result.current.completedFlows).toContain('returning-user-flow');
      expect(result.current.completedFlows.length).toBe(2);
    });
  });

  describe('Tour Management', () => {
    it('should start and navigate tour', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startTour('dashboard');
      });

      expect(result.current.tourActive).toBe(true);
      expect(result.current.currentTourStep).toBe(0);

      act(() => {
        result.current.nextTourStep();
      });

      expect(result.current.currentTourStep).toBe(1);

      act(() => {
        result.current.previousTourStep();
      });

      expect(result.current.currentTourStep).toBe(0);

      act(() => {
        result.current.endTour();
      });

      expect(result.current.tourActive).toBe(false);
      expect(result.current.currentTourStep).toBe(0);
    });
  });

  describe('UI State Management', () => {
    it('should toggle checklist visibility', () => {
      const { result } = renderHook(() => useOnboardingStore());

      // Set initial state to true before testing
      act(() => {
        useOnboardingStore.setState({ showChecklist: true });
      });

      expect(result.current.showChecklist).toBe(true);

      act(() => {
        result.current.toggleChecklist();
      });

      expect(result.current.showChecklist).toBe(false);
    });

    it('should dismiss hints', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.dismissHint('test-hint-1');
        result.current.dismissHint('test-hint-2');
      });

      expect(result.current.dismissedHints).toContain('test-hint-1');
      expect(result.current.dismissedHints).toContain('test-hint-2');

      // Should not add duplicates
      act(() => {
        result.current.dismissHint('test-hint-1');
      });

      expect(
        result.current.dismissedHints.filter(h => h === 'test-hint-1').length
      ).toBe(1);
    });

    it('should update preferences', () => {
      const { result } = renderHook(() => useOnboardingStore());

      expect(result.current.preferences.skipTours).toBe(false);

      act(() => {
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
    it('should check if step is completed', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startOnboarding('new');
        result.current.completeStep('welcome');
      });

      expect(result.current.isStepCompleted('welcome')).toBe(true);
      expect(result.current.isStepCompleted('profile-setup')).toBe(false);
    });

    it('should get next incomplete step', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startOnboarding('new');
        result.current.completeStep('welcome');
        result.current.skipStep('profile-setup');
      });

      const nextStep = result.current.getNextIncompleteStep();
      expect(nextStep?.id).toBe('first-portfolio');
    });

    it('should return null when all steps are complete', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.startOnboarding('returning');
        result.current.completeStep('whats-new');
        result.current.completeStep('feature-highlights');
      });

      const nextStep = result.current.getNextIncompleteStep();
      expect(nextStep).toBeNull();
    });
  });
});
