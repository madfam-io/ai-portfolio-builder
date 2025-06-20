'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { OnboardingModal } from './OnboardingModal';
import { OnboardingChecklist } from './OnboardingChecklist';
import { ProductTour } from './ProductTour';
import { track } from '@/lib/monitoring/unified/events';

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { user } = useAuthStore();
  const {
    isOnboarding,
    currentFlow,
    completedFlows,
    tourActive,
    showChecklist,
    startOnboarding,
    preferences,
  } = useOnboardingStore();

  // Determine if user needs onboarding
  useEffect(() => {
    if (!user) return;

    // Check if user is new (created within last 5 minutes)
    const isNewUser =
      user.created_at &&
      new Date(user.created_at).getTime() > Date.now() - 5 * 60 * 1000;

    // Check if user has unknown portfolios
    const hasPortfolios = (user as unknown).portfolio_count > 0;

    // Determine user type and start onboarding if needed
    if (isNewUser && !completedFlows.includes('new-user-flow')) {
      startOnboarding('new');
      track.user.action('onboarding_started', user.id, async () => {}, {
        flow: 'new-user-flow',
      });
    } else if (
      !isNewUser &&
      !hasPortfolios &&
      !completedFlows.includes('returning-user-flow')
    ) {
      startOnboarding('returning');
      track.user.action('onboarding_started', user.id, async () => {}, {
        flow: 'returning-user-flow',
      });
    }
  }, [user, completedFlows, startOnboarding]);

  return (
    <>
      {children}

      {/* Onboarding Modal - Shows during onboarding flow */}
      {isOnboarding && currentFlow && <OnboardingModal flow={currentFlow} />}

      {/* Product Tour - Can be triggered independently */}
      {tourActive && !preferences.skipTours && <ProductTour />}

      {/* Onboarding Checklist - Shows in dashboard */}
      {showChecklist && preferences.showProgress && <OnboardingChecklist />}
    </>
  );
}
