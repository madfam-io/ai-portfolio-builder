import { Portfolio } from '@/types/portfolio';
import { PreviewStyles } from './types';

/**
 * Get container classes based on preview mode
 */
export function getContainerClasses(mode: string): string {
  if (mode === 'mobile') {
    return 'max-w-sm mx-auto';
  }
  if (mode === 'tablet') {
    return 'max-w-2xl mx-auto';
  }
  return 'max-w-4xl mx-auto';
}

/**
 * Get section classes for highlighting active section
 */
export function getSectionClasses(
  sectionId: string,
  activeSection?: string,
  isInteractive?: boolean
): string {
  const baseClasses = isInteractive
    ? 'cursor-pointer transition-all duration-200'
    : '';
  const activeClasses =
    activeSection === sectionId && isInteractive
      ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/20'
      : '';
  const hoverClasses = isInteractive
    ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
    : '';

  return `${baseClasses} ${activeClasses} ${hoverClasses} rounded-lg p-2 -m-2`;
}

/**
 * Get custom styles from portfolio customization
 */
export function getCustomStyles(portfolio: Portfolio): PreviewStyles {
  return {
    '--primary-color': portfolio.customization.primaryColor || '#1a73e8',
    '--secondary-color': portfolio.customization.secondaryColor || '#34a853',
    '--accent-color': portfolio.customization.accentColor || '#ea4335',
    fontFamily: portfolio.customization.fontFamily
      ? `${portfolio.customization.fontFamily}, sans-serif`
      : undefined,
  };
}

/**
 * Skill level to percentage mapping
 */
export const skillLevelToPercentage = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

/**
 * Filter out empty sections and respect hidden sections
 */
export function getVisibleSections(portfolio: Portfolio) {
  const hiddenSections = portfolio.customization.hiddenSections || [];
  
  return {
    about: Boolean(portfolio.bio) && !hiddenSections.includes('about'),
    experience:
      portfolio.experience.length > 0 && !hiddenSections.includes('experience'),
    education:
      portfolio.education.length > 0 && !hiddenSections.includes('education'),
    projects:
      portfolio.projects.length > 0 && !hiddenSections.includes('projects'),
    skills: portfolio.skills.length > 0 && !hiddenSections.includes('skills'),
    certifications:
      portfolio.certifications.length > 0 &&
      !hiddenSections.includes('certifications'),
  };
}

/**
 * Get social links with values
 */
export function getActiveSocialLinks(portfolio: Portfolio) {
  return Object.entries(portfolio.social)
    .filter(([_, url]) => url && url.trim() !== '')
    .map(([platform, url]) => ({ platform, url }));
}