/**
 * Onboarding Components
 *
 * Export all onboarding-related components
 */

export { OnboardingProvider } from './OnboardingProvider';
export { OnboardingModal } from './OnboardingModal';
export { OnboardingChecklist } from './OnboardingChecklist';
export { ProductTour } from './ProductTour';
export { ContextualHint, CommonHints } from './ContextualHint';

// Re-export hooks for convenience
export {
  useOnboarding,
  useOnboardingFlow,
  useOnboardingTracking,
} from '@/lib/hooks/useOnboarding';
