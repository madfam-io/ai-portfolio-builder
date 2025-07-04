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

import { useCallback, useRef, useState } from 'react';
// Removed portfolioService import - will use API calls instead

import { Portfolio } from '@/types/portfolio';

/**
 * Custom hook for auto-saving portfolio changes
 *
 * @param portfolioId The ID of the portfolio to save
 * @param portfolio The current portfolio data
 * @param isDirty Whether there are unsaved changes
 * @returns Auto-save function and last saved timestamp
 */
export function useAutoSave(
  portfolioId: string,
  _portfolio: Portfolio,
  _isDirty: boolean
) {
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoSavingRef = useRef(false);

  const autoSave = useCallback(
    async (portfolioData: Portfolio): Promise<boolean> => {
      if (isAutoSavingRef.current || !portfolioData.id) {
        return false;
      }

      try {
        isAutoSavingRef.current = true;

        const response = await fetch(`/api/v1/portfolios/${portfolioId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: portfolioData.name,
            title: portfolioData.title,
            bio: portfolioData.bio,
            tagline: portfolioData.tagline,
            avatarUrl: portfolioData.avatarUrl,
            contact: portfolioData.contact,
            social: portfolioData.social,
            experience: portfolioData.experience,
            education: portfolioData.education,
            projects: portfolioData.projects,
            skills: portfolioData.skills,
            certifications: portfolioData.certifications,
            customization: portfolioData.customization,
            aiSettings: portfolioData.aiSettings,
          }),
        });

        const success = response.ok;

        if (success) {
          setLastSaved(new Date());
          return true;
        }

        return false;
      } catch (_error) {
        return false;
      } finally {
        isAutoSavingRef.current = false;
      }
    },
    [portfolioId]
  );

  // Clear any pending auto-save on unmount
  const clearAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, []);

  return {
    autoSave,
    lastSaved,
    clearAutoSave,
  };
}
