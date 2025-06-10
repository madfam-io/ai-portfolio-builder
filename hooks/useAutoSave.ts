import { useCallback, useRef, useState } from 'react';
import { Portfolio } from '@/types/portfolio';
import { portfolioService } from '@/lib/services/portfolioService';

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
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isAutoSavingRef = useRef(false);

  const autoSave = useCallback(
    async (portfolioData: Portfolio): Promise<boolean> => {
      if (isAutoSavingRef.current || !portfolioData.id) {
        return false;
      }

      try {
        isAutoSavingRef.current = true;

        const success = await portfolioService.autoSave(portfolioId, {
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
        });

        if (success) {
          setLastSaved(new Date());
          return true;
        }

        return false;
      } catch (error) {
        console.error('Auto-save failed:', error);
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
