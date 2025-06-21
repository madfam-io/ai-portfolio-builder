/**
 * Onboarding Store
 *
 * Manages user onboarding state and progress tracking
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  skipped: boolean;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface OnboardingFlow {
  id: string;
  name: string;
  steps: OnboardingStep[];
  currentStepIndex: number;
  startedAt: string;
  completedAt?: string;
  userType: 'new' | 'returning' | 'imported';
}

export interface OnboardingState {
  // State
  isOnboarding: boolean;
  currentFlow: OnboardingFlow | null;
  completedFlows: string[];
  tourActive: boolean;
  currentTourStep: number;
  showChecklist: boolean;
  dismissedHints: string[];

  // User preferences
  preferences: {
    skipTours: boolean;
    emailReminders: boolean;
    showProgress: boolean;
  };

  // Actions
  startOnboarding: (userType: 'new' | 'returning' | 'imported') => void;
  completeStep: (stepId: string, metadata?: Record<string, unknown>) => void;
  skipStep: (stepId: string) => void;
  goToStep: (stepIndex: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Tour actions
  startTour: (tourId: string) => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
  endTour: () => void;

  // UI actions
  toggleChecklist: () => void;
  dismissHint: (hintId: string) => void;
  updatePreferences: (
    preferences: Partial<OnboardingState['preferences']>
  ) => void;

  // Getters
  getCurrentStep: () => OnboardingStep | null;
  getProgress: () => number;
  isStepCompleted: (stepId: string) => boolean;
  getNextIncompleteStep: () => OnboardingStep | null;
}

// Define onboarding flows
const ONBOARDING_FLOWS = {
  new: {
    id: 'new-user-flow',
    name: 'New User Onboarding',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to PRISMA',
        description: 'Get started with your AI-powered portfolio',
        completed: false,
        skipped: false,
      },
      {
        id: 'profile-setup',
        title: 'Set Up Your Profile',
        description: 'Add your basic information and preferences',
        completed: false,
        skipped: false,
      },
      {
        id: 'first-portfolio',
        title: 'Create Your First Portfolio',
        description: 'Build your professional portfolio in minutes',
        completed: false,
        skipped: false,
      },
      {
        id: 'ai-enhancement',
        title: 'Enhance with AI',
        description: 'Let AI help you write compelling content',
        completed: false,
        skipped: false,
      },
      {
        id: 'customize-design',
        title: 'Customize Your Design',
        description: 'Make your portfolio uniquely yours',
        completed: false,
        skipped: false,
      },
      {
        id: 'publish',
        title: 'Publish Your Portfolio',
        description: 'Share your portfolio with the world',
        completed: false,
        skipped: false,
      },
      {
        id: 'explore-features',
        title: 'Explore Advanced Features',
        description: 'Discover variants, analytics, and more',
        completed: false,
        skipped: false,
      },
    ],
  },
  returning: {
    id: 'returning-user-flow',
    name: 'Welcome Back',
    steps: [
      {
        id: 'whats-new',
        title: "What's New",
        description: 'Check out the latest features and updates',
        completed: false,
        skipped: false,
      },
      {
        id: 'feature-highlights',
        title: 'Feature Highlights',
        description: 'Discover features you might have missed',
        completed: false,
        skipped: false,
      },
    ],
  },
  imported: {
    id: 'imported-user-flow',
    name: 'Import Success',
    steps: [
      {
        id: 'import-review',
        title: 'Review Your Import',
        description: 'Check your imported portfolio data',
        completed: false,
        skipped: false,
      },
      {
        id: 'enhance-imported',
        title: 'Enhance Your Content',
        description: 'Use AI to improve your imported content',
        completed: false,
        skipped: false,
      },
      {
        id: 'customize-imported',
        title: 'Customize Design',
        description: 'Apply a professional template',
        completed: false,
        skipped: false,
      },
    ],
  },
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      isOnboarding: false,
      currentFlow: null,
      completedFlows: [],
      tourActive: false,
      currentTourStep: 0,
      showChecklist: true,
      dismissedHints: [],
      preferences: {
        skipTours: false,
        emailReminders: true,
        showProgress: true,
      },

      // Actions
      startOnboarding: userType => {
        const flow = {
          ...ONBOARDING_FLOWS[userType],
          currentStepIndex: 0,
          startedAt: new Date().toISOString(),
          userType,
        };

        set(state => {
          state.isOnboarding = true;
          state.currentFlow = flow;
          state.showChecklist = true;
        });
      },

      completeStep: (stepId, metadata) => {
        set(state => {
          if (!state.currentFlow) return;

          const stepIndex = state.currentFlow.steps.findIndex(
            s => s.id === stepId
          );
          if (stepIndex === -1) return;

          const step = state.currentFlow.steps[stepIndex];
          if (step) {
            step.completed = true;
            step.completedAt = new Date().toISOString();
            if (metadata) {
              step.metadata = metadata;
            }
          }

          // Auto-advance to next step
          const nextIncompleteIndex = state.currentFlow.steps.findIndex(
            (s, i) => i > stepIndex && !s.completed && !s.skipped
          );
          if (nextIncompleteIndex !== -1) {
            state.currentFlow.currentStepIndex = nextIncompleteIndex;
          }

          // Check if flow is complete
          const allCompleted = state.currentFlow.steps.every(
            s => s.completed || s.skipped
          );
          if (allCompleted) {
            state.currentFlow.completedAt = new Date().toISOString();
            state.completedFlows.push(state.currentFlow.id);
            state.isOnboarding = false;
          }
        });
      },

      skipStep: stepId => {
        set(state => {
          if (!state.currentFlow) return;

          const stepIndex = state.currentFlow.steps.findIndex(
            s => s.id === stepId
          );
          if (stepIndex === -1) return;

          const step = state.currentFlow.steps[stepIndex];
          if (step) {
            step.skipped = true;
          }

          // Auto-advance to next step
          const nextIncompleteIndex = state.currentFlow.steps.findIndex(
            (s, i) => i > stepIndex && !s.completed && !s.skipped
          );
          if (nextIncompleteIndex !== -1) {
            state.currentFlow.currentStepIndex = nextIncompleteIndex;
          }
        });
      },

      goToStep: stepIndex => {
        set(state => {
          if (!state.currentFlow) return;
          if (stepIndex < 0 || stepIndex >= state.currentFlow.steps.length)
            return;

          state.currentFlow.currentStepIndex = stepIndex;
        });
      },

      completeOnboarding: () => {
        set(state => {
          if (state.currentFlow) {
            state.currentFlow.completedAt = new Date().toISOString();
            state.completedFlows.push(state.currentFlow.id);
          }
          state.isOnboarding = false;
          state.currentFlow = null;
        });
      },

      resetOnboarding: () => {
        set(state => {
          state.isOnboarding = false;
          state.currentFlow = null;
          state.tourActive = false;
          state.currentTourStep = 0;
        });
      },

      // Tour actions
      startTour: _tourId => {
        set(state => {
          state.tourActive = true;
          state.currentTourStep = 0;
        });
      },

      nextTourStep: () => {
        set(state => {
          state.currentTourStep += 1;
        });
      },

      previousTourStep: () => {
        set(state => {
          if (state.currentTourStep > 0) {
            state.currentTourStep -= 1;
          }
        });
      },

      endTour: () => {
        set(state => {
          state.tourActive = false;
          state.currentTourStep = 0;
        });
      },

      // UI actions
      toggleChecklist: () => {
        set(state => {
          state.showChecklist = !state.showChecklist;
        });
      },

      dismissHint: hintId => {
        set(state => {
          if (!state.dismissedHints.includes(hintId)) {
            state.dismissedHints.push(hintId);
          }
        });
      },

      updatePreferences: preferences => {
        set(state => {
          state.preferences = { ...state.preferences, ...preferences };
        });
      },

      // Getters
      getCurrentStep: () => {
        const state = get();
        if (!state.currentFlow) return null;
        return (
          state.currentFlow.steps[state.currentFlow.currentStepIndex] || null
        );
      },

      getProgress: () => {
        const state = get();
        if (!state.currentFlow) return 0;

        const completed = state.currentFlow.steps.filter(
          s => s.completed || s.skipped
        ).length;
        return Math.round((completed / state.currentFlow.steps.length) * 100);
      },

      isStepCompleted: stepId => {
        const state = get();
        if (!state.currentFlow) return false;

        const step = state.currentFlow.steps.find(s => s.id === stepId);
        return step?.completed || false;
      },

      getNextIncompleteStep: () => {
        const state = get();
        if (!state.currentFlow) return null;

        return (
          state.currentFlow.steps.find(s => !s.completed && !s.skipped) || null
        );
      },
    })),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        completedFlows: state.completedFlows,
        dismissedHints: state.dismissedHints,
        preferences: state.preferences,
      }),
    }
  )
);
