/**
 * React Hooks for Referral System
 *
 * Comprehensive React hooks that provide seamless integration with MADFAM's
 * referral system, including real-time updates, optimistic UI updates,
 * and error handling with retry mechanisms.
 *
 * These hooks follow React best practices and provide excellent developer
 * experience while maintaining performance and type safety.
 *
 * @author MADFAM Growth Engineering Team
 * @version 1.0.0 - World-Class Referral System
 */

export { useReferral } from './useReferral';
export { useReferralCampaigns } from './useReferralCampaigns';
export { useReferralStats } from './useReferralStats';
export { useReferralShare } from './useReferralShare';

// Re-export types
export type {
  UseReferralState,
  UseReferralActions,
  ShareContent,
} from './useReferral';
