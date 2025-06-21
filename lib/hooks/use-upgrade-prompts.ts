/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Upgrade Prompts Hook
 *
 * Manages when and how to show upgrade prompts based on user actions and limits.
 * Tracks user interactions to avoid being too aggressive with prompts.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from './use-subscription';

interface UpgradePromptState {
  showModal: boolean;
  modalReason: 'ai_limit' | 'portfolio_limit' | null;
  lastShown: Record<string, number>;
  dismissedToday: string[];
}

const PROMPT_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_KEY = 'upgrade-prompts-state';

export function useUpgradePrompts() {
  const { isUpgradeRequired, isPaidTier } = useSubscription();
  const [promptState, setPromptState] = useState<UpgradePromptState>({
    showModal: false,
    modalReason: null,
    lastShown: {},
    dismissedToday: [],
  });

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clear dismissed list if it's a new day
        const today = new Date().toDateString();
        const lastDismissed = parsed.dismissedToday?.[0]?.split('|')[1];

        if (lastDismissed !== today) {
          parsed.dismissedToday = [];
        }

        setPromptState(parsed);
      }
    } catch (_error) {
      // Failed to load upgrade prompts state
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(promptState));
    } catch (_error) {
      // Failed to save upgrade prompts state
    }
  }, [promptState]);

  const shouldShowPrompt = useCallback(
    (type: 'ai_limit' | 'portfolio_limit'): boolean => {
      // Don't show if user is on a paid plan
      if (isPaidTier) return false;

      // Don't show if already shown today
      const today = new Date().toDateString();
      if (promptState.dismissedToday.includes(`${type}|${today}`)) return false;

      // Don't show if recently shown (cooldown)
      const lastShown = promptState.lastShown[type];
      if (lastShown && Date.now() - lastShown < PROMPT_COOLDOWN) return false;

      // Check if user has actually hit the limit
      return isUpgradeRequired(type === 'ai_limit' ? 'ai' : 'portfolio');
    },
    [
      isPaidTier,
      promptState.dismissedToday,
      promptState.lastShown,
      isUpgradeRequired,
    ]
  );

  const showUpgradeModal = useCallback(
    (reason: 'ai_limit' | 'portfolio_limit') => {
      if (!shouldShowPrompt(reason)) return false;

      setPromptState(prev => ({
        ...prev,
        showModal: true,
        modalReason: reason,
        lastShown: {
          ...prev.lastShown,
          [reason]: Date.now(),
        },
      }));

      return true;
    },
    [shouldShowPrompt]
  );

  const hideUpgradeModal = useCallback(() => {
    setPromptState(prev => ({
      ...prev,
      showModal: false,
      modalReason: null,
    }));
  }, []);

  const dismissPrompt = useCallback((type: 'ai_limit' | 'portfolio_limit') => {
    const today = new Date().toDateString();
    setPromptState(prev => ({
      ...prev,
      showModal: false,
      modalReason: null,
      dismissedToday: [...prev.dismissedToday, `${type}|${today}`],
    }));
  }, []);

  const checkAndShowPrompt = useCallback(
    (type: 'ai_limit' | 'portfolio_limit') => {
      if (shouldShowPrompt(type)) {
        return showUpgradeModal(type);
      }
      return false;
    },
    [shouldShowPrompt, showUpgradeModal]
  );

  // Helper function to show prompt when user tries to perform an action
  const promptForAction = useCallback(
    (action: 'ai' | 'portfolio') => {
      const promptType = action === 'ai' ? 'ai_limit' : 'portfolio_limit';
      return checkAndShowPrompt(promptType);
    },
    [checkAndShowPrompt]
  );

  return {
    // Modal state
    showModal: promptState.showModal,
    modalReason: promptState.modalReason,

    // Actions
    showUpgradeModal,
    hideUpgradeModal,
    dismissPrompt,
    checkAndShowPrompt,
    promptForAction,

    // Helpers
    shouldShowPrompt,
    canShowAIPrompt: shouldShowPrompt('ai_limit'),
    canShowPortfolioPrompt: shouldShowPrompt('portfolio_limit'),
  };
}

/**
 * Hook specifically for AI feature prompts
 */
export function useAIUpgradePrompt() {
  const { promptForAction, shouldShowPrompt } = useUpgradePrompts();

  return {
    checkBeforeAIAction: () => promptForAction('ai'),
    shouldShowAIBanner: shouldShowPrompt('ai_limit'),
  };
}

/**
 * Hook specifically for portfolio feature prompts
 */
export function usePortfolioUpgradePrompt() {
  const { promptForAction, shouldShowPrompt } = useUpgradePrompts();

  return {
    checkBeforePortfolioAction: () => promptForAction('portfolio'),
    shouldShowPortfolioBanner: shouldShowPrompt('portfolio_limit'),
  };
}
