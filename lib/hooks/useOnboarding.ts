/**
 * Onboarding Hook
 *
 * Provides easy access to onboarding functionality throughout the app
 */

import { useEffect, useCallback } from 'react';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { track } from '@/lib/monitoring/unified/events';
import { useRouter } from 'next/navigation';

export interface UseOnboardingOptions {
  autoStart?: boolean;
  skipIfCompleted?: boolean;
}

export function useOnboarding(options: UseOnboardingOptions = {}) {
  const { autoStart = true, skipIfCompleted = true } = options;

  const router = useRouter();
  const { user } = useAuthStore();
  const {
    isOnboarding,
    currentFlow,
    completedFlows,
    tourActive,
    showChecklist,
    preferences,
    startOnboarding,
    completeStep,
    skipStep,
    getCurrentStep,
    getProgress,
    startTour,
    toggleChecklist,
    updatePreferences,
  } = useOnboardingStore();

  // Auto-start onboarding for new users
  useEffect(() => {
    if (!autoStart || !user) return;

    const isNewUser =
      user.created_at &&
      new Date(user.created_at).getTime() > Date.now() - 5 * 60 * 1000;

    if (isNewUser && !completedFlows.includes('new-user-flow')) {
      startOnboarding('new');
    }
  }, [user, autoStart, completedFlows, startOnboarding]);

  // Complete current step with tracking
  const completeCurrentStep = useCallback(
    async (metadata?: Record<string, unknown>) => {
      const currentStep = getCurrentStep();
      if (!currentStep) return;

      await track.user.action(
        'onboarding_step_completed',
        user?.id || 'anonymous',
        async () => completeStep(currentStep.id, metadata),
        {
          step_id: currentStep.id,
          step_title: currentStep.title,
          flow_id: currentFlow?.id,
          ...metadata,
        }
      );
    },
    [completeStep, getCurrentStep, currentFlow, user]
  );

  // Skip current step with tracking
  const skipCurrentStep = useCallback(
    async (reason?: string) => {
      const currentStep = getCurrentStep();
      if (!currentStep) return;

      await track.user.action(
        'onboarding_step_skipped',
        user?.id || 'anonymous',
        async () => skipStep(currentStep.id),
        {
          step_id: currentStep.id,
          step_title: currentStep.title,
          flow_id: currentFlow?.id,
          reason,
        }
      );
    },
    [skipStep, getCurrentStep, currentFlow, user]
  );

  // Start product tour for specific page
  const startPageTour = useCallback(
    (page: 'dashboard' | 'editor' | 'portfolio') => {
      startTour(page);
      track.user.action(
        'product_tour_started',
        user?.id || 'anonymous',
        async () => {},
        { page }
      );
    },
    [startTour, user]
  );

  // Check if user should see onboarding
  const shouldShowOnboarding = useCallback(() => {
    if (!user) return false;

    // New user check
    const isNewUser =
      user.created_at &&
      new Date(user.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000; // 24 hours

    // Has completed onboarding check
    const hasCompletedOnboarding = completedFlows.includes('new-user-flow');

    return isNewUser && !hasCompletedOnboarding;
  }, [user, completedFlows]);

  // Navigate to next recommended action
  const goToNextAction = useCallback(() => {
    const currentStep = getCurrentStep();
    if (!currentStep) {
      router.push('/dashboard');
      return;
    }

    // Route based on step
    switch (currentStep.id) {
      case 'profile-setup':
        router.push('/settings/profile');
        break;
      case 'first-portfolio':
      case 'enhance-imported':
        router.push('/editor/new');
        break;
      case 'ai-enhancement':
      case 'customize-design':
        router.push('/editor');
        break;
      case 'publish':
        router.push('/dashboard');
        break;
      default:
        router.push('/dashboard');
    }
  }, [getCurrentStep, router]);

  // Get onboarding status
  const getStatus = useCallback(() => {
    return {
      isActive: isOnboarding,
      currentStep: getCurrentStep(),
      progress: getProgress(),
      flowType: currentFlow?.userType,
      isComplete: currentFlow
        ? currentFlow.steps.every(s => s.completed || s.skipped)
        : false,
    };
  }, [isOnboarding, getCurrentStep, getProgress, currentFlow]);

  return {
    // State
    isOnboarding,
    currentFlow,
    currentStep: getCurrentStep(),
    progress: getProgress(),
    tourActive,
    showChecklist,
    preferences,

    // Actions
    startOnboarding,
    completeCurrentStep,
    skipCurrentStep,
    startPageTour,
    toggleChecklist,
    updatePreferences,

    // Utilities
    shouldShowOnboarding,
    goToNextAction,
    getStatus,
  };
}

// Hook for specific onboarding flows
export function useOnboardingFlow(flowType: 'new' | 'returning' | 'imported') {
  const { startOnboarding, currentFlow } = useOnboardingStore();

  const start = useCallback(() => {
    startOnboarding(flowType);
  }, [startOnboarding, flowType]);

  const isActive = currentFlow?.userType === flowType;

  return { start, isActive };
}

// Hook for tracking onboarding events
export function useOnboardingTracking() {
  const { user } = useAuthStore();

  const trackEvent = useCallback(
    async (event: string, properties?: Record<string, unknown>) => {
      await track.user.action(
        `onboarding_${event}`,
        user?.id || 'anonymous',
        async () => {},
        properties
      );
    },
    [user]
  );

  return { trackEvent };
}
