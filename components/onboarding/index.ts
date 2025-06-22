/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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
