/**
 * PostHog Analytics Types
 */

// Event tracking types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean | Date | null | undefined>;
  timestamp?: Date;
  distinctId?: string;
}

// User properties
export interface UserProperties {
  id: string;
  email?: string;
  name?: string;
  plan?: 'free' | 'starter' | 'professional' | 'business';
  created_at?: Date;
  total_portfolios?: number;
  total_variants?: number;
  onboarding_completed?: boolean;
  signup_source?: string;
}

// Portfolio analytics
export interface PortfolioAnalytics {
  portfolio_id: string;
  views: number;
  unique_visitors: number;
  avg_time_on_page: number;
  bounce_rate: number;
  conversion_rate: number;
  engagement_score: number;
}

// Variant analytics
export interface VariantPerformance {
  variant_id: string;
  portfolio_id: string;
  audience_type: string;
  metrics: {
    views: number;
    unique_visitors: number;
    avg_time_on_page: number;
    bounce_rate: number;
    conversion_events: ConversionEvent[];
  };
  performance_score: number;
  recommendations?: string[];
}

// Conversion events
export interface ConversionEvent {
  type: 'contact_click' | 'resume_download' | 'social_click' | 'project_view' | 'custom';
  count: number;
  conversion_rate: number;
  metadata?: Record<string, string | number | boolean>;
}

// A/B Testing types
export interface Experiment {
  id: string;
  name: string;
  description?: string;
  type: 'landing_page' | 'portfolio_variant' | 'feature';
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ExperimentVariant[];
  target_metric: string;
  secondary_metrics?: string[];
  audience_filters?: Record<string, string | number | boolean | string[]>;
  traffic_allocation?: Record<string, number>; // variant_id -> percentage
  created_at: Date;
  started_at?: Date;
  ended_at?: Date;
}

export interface ExperimentVariant {
  id: string;
  experiment_id: string;
  name: string;
  description?: string;
  is_control: boolean;
  configuration: Record<string, string | number | boolean | string[] | Record<string, unknown>>;
  metrics?: VariantMetrics;
}

export interface VariantMetrics {
  participants: number;
  conversions: number;
  conversion_rate: number;
  confidence_level?: number;
  is_winner?: boolean;
  relative_improvement?: number;
}

// Dashboard analytics
export interface DashboardMetrics {
  // User metrics
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  active_users_month: number;
  new_users_today: number;
  new_users_week: number;
  
  // Portfolio metrics
  total_portfolios: number;
  published_portfolios: number;
  portfolios_created_today: number;
  avg_portfolios_per_user: number;
  
  // Engagement metrics
  total_page_views: number;
  unique_visitors: number;
  avg_session_duration: number;
  bounce_rate: number;
  
  // Conversion metrics
  signup_conversion_rate: number;
  portfolio_creation_rate: number;
  publish_rate: number;
  upgrade_rate: number;
  
  // Revenue metrics
  mrr: number;
  arr: number;
  ltv: number;
  churn_rate: number;
  
  // Feature adoption
  ai_usage_rate: number;
  variant_usage_rate: number;
  custom_domain_rate: number;
}

// Real-time visitor info
export interface VisitorInfo {
  id: string;
  session_id: string;
  portfolio_id?: string;
  variant_id?: string;
  
  // Location
  country?: string;
  region?: string;
  city?: string;
  
  // Device info
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  screen_resolution?: string;
  
  // Behavior
  landing_page: string;
  current_page: string;
  pages_viewed: number;
  time_on_site: number;
  
  // Source
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  
  // Engagement
  events: Array<{
    event: string;
    timestamp: Date;
    properties?: Record<string, string | number | boolean | Date>;
  }>;
  
  is_returning: boolean;
  visit_count: number;
  first_seen: Date;
  last_seen: Date;
}

// Analytics export formats
export interface AnalyticsExport {
  id: string;
  type: 'dashboard' | 'portfolio' | 'variant' | 'experiment';
  format: 'csv' | 'json' | 'pdf';
  filters?: Record<string, string | number | boolean | string[] | Date>;
  date_range: {
    start: Date;
    end: Date;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  created_at: Date;
  expires_at?: Date;
}

// Feature flags
export interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage?: number;
  conditions?: Array<{
    property: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: string | number | boolean | string[];
  }>;
  variants?: Array<{
    key: string;
    name: string;
    percentage: number;
    payload?: Record<string, string | number | boolean | string[]>;
  }>;
}

// Session recording settings
export interface SessionRecordingConfig {
  enabled: boolean;
  sample_rate: number; // 0-1
  min_session_duration: number; // seconds
  mask_all_text: boolean;
  mask_all_inputs: boolean;
  excluded_urls?: string[];
  included_urls?: string[];
}

// Privacy settings
export interface PrivacySettings {
  analytics_enabled: boolean;
  session_recording_enabled: boolean;
  ip_tracking_enabled: boolean;
  cookie_consent_given?: boolean;
  opted_out_features?: string[];
  data_retention_days?: number;
}