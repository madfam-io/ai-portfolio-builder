export { ReferralEngine, createReferralEngine, referralEngine } from './engine/index.esm.js';
export { FraudDetectionError, ReferralValidationError, isValidCampaignType, isValidReferralStatus, isValidRewardType } from './types/index.esm.js';
export { Logger } from './utils/logger.esm.js';
export { Analytics } from './utils/analytics.esm.js';
export { ReferralDashboard } from './components/ReferralDashboard.esm.js';
export { ShareHub } from './components/ShareHub.esm.js';
export { RewardHistory } from './components/RewardHistory.esm.js';
export { CampaignSelector } from './components/CampaignSelector.esm.js';
export { ReferralStats } from './components/ReferralStats.esm.js';
export { useReferral } from './hooks/useReferral.esm.js';
export { useReferralCampaigns } from './hooks/useReferralCampaigns.esm.js';
export { useReferralStats } from './hooks/useReferralStats.esm.js';
export { useReferralShare } from './hooks/useReferralShare.esm.js';

const VERSION = "1.0.0";
const PACKAGE_NAME = "@madfam/referral";

export { PACKAGE_NAME, VERSION };
