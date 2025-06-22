/**
 * Configuration types
 */

export type ReferralEngineConfig = {
  default_campaign_id?: string;
  fraud_detection_enabled: boolean;
  auto_approve_low_risk: boolean;
  max_referrals_per_user: number;
  conversion_window_days: number;
  code_length: number;
  enable_analytics: boolean;
  enable_gamification: boolean;
};

export type DatabaseConfig = {
  supabase_url: string;
  supabase_anon_key: string;
  supabase_service_key: string;
};

export type AnalyticsConfig = {
  posthog_project_id?: string;
  posthog_api_key?: string;
  custom_analytics_endpoint?: string;
  enable_detailed_tracking: boolean;
};
