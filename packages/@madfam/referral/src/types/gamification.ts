/**
 * Gamification types
 */

export interface GamificationConfig {
  leaderboard_enabled: boolean;
  badges_enabled: boolean;
  streak_tracking: boolean;
  achievement_notifications: boolean;
  social_proof: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_url?: string;
  badge_color?: string;
  criteria: AchievementCriteria;
  reward?: any; // Avoid circular dependency
}

export interface AchievementCriteria {
  type: 'referral_count' | 'conversion_rate' | 'streak' | 'revenue_generated';
  threshold: number;
  timeframe?: string; // e.g., 'monthly', 'weekly'
}
