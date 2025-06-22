/**
 * @madfam/feedback
 * 
 * World-class feedback collection and analytics system
 * 
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 * 
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 * 
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

/**
 * Core Module Exports
 * 
 * Export all core functionality for the feedback system
 */

// Core classes
export { FeedbackSystem, createFeedbackSystem } from './feedback-system';
export { BetaAnalytics, createBetaAnalytics } from './beta-analytics';
export { BetaLaunchChecker, createBetaLaunchChecker } from './beta-launcher';

// Types
export * from './types';

// Default configuration
export const DEFAULT_CONFIG = {
  maxFeedbackEntries: 10000,
  feedbackRetentionDays: 365,
  analyticsRetentionDays: 90,
  surveyTriggers: {
    afterPortfolioCreation: true,
    afterPublishing: true,
    weeklyActiveUsers: true,
    beforeChurn: true,
  },
  criticalBugNotificationThreshold: 1,
  npsTargetScore: 50,
};