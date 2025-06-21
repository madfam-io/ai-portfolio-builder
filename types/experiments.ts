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
 * @fileoverview TypeScript types for Landing Page A/B Testing System
 *
 * Defines all types related to experiments, variants, analytics, and
 * component configuration for the landing page A/B testing framework.
 */

/**
 * Experiment status lifecycle
 */
export type ExperimentStatus =
  | 'draft' // Being configured, not yet live
  | 'active' // Currently running
  | 'paused' // Temporarily stopped
  | 'completed' // Finished, winner selected
  | 'archived'; // No longer needed

/**
 * Available landing page component types
 */
export type LandingComponentType =
  | 'hero'
  | 'social_proof'
  | 'features'
  | 'how_it_works'
  | 'templates'
  | 'pricing'
  | 'cta'
  | 'testimonials'
  | 'faq'
  | 'stats'
  | 'benefits'
  | 'comparison';

/**
 * Component variant names for each component type
 */
// Commented out - currently unused
// interface ComponentVariants {
//   hero: 'default' | 'video' | 'minimal' | 'split' | 'animated';
//   features: 'grid' | 'carousel' | 'list' | 'tabs';
//   pricing: 'default' | 'comparison' | 'slider' | 'minimal';
//   cta: 'default' | 'banner' | 'floating' | 'inline';
//   // Add more as needed
// }

/**
 * Targeting criteria for experiments
 */
export interface TargetAudience {
  geo?: string[]; // Country codes: ['MX', 'US', 'ES']
  device?: string[]; // ['mobile', 'tablet', 'desktop']
  language?: string[]; // ['es', 'en']
  referrer?: string[]; // Referrer domains
  utm_source?: string[]; // UTM sources for campaigns
}

/**
 * Landing page experiment configuration
 */
export interface LandingPageExperiment {
  id: string;
  name: string;
  description?: string;
  hypothesis?: string;
  status: ExperimentStatus;
  trafficPercentage: number; // 1-100
  targetAudience: TargetAudience;
  primaryMetric: string;
  secondaryMetrics?: string[];
  startDate?: Date;
  endDate?: Date;
  winningVariantId?: string;
  resultsSummary?: ExperimentResults;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuration for a single landing page component
 */
export interface ComponentConfig {
  type: LandingComponentType;
  order: number;
  visible: boolean;
  variant: string; // e.g., 'default', 'minimal', 'video'
  props: Record<string, string | number | boolean | Record<string, unknown>>; // Component-specific props
}

/**
 * Theme customization options
 */
export interface ThemeOverrides {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  spacing?: 'compact' | 'normal' | 'relaxed';
  // Add more theme options as needed
}

/**
 * Landing page variant configuration
 */
export interface LandingPageVariant {
  id: string;
  experimentId: string;
  name: string;
  description?: string;
  isControl: boolean;
  trafficPercentage: number;
  components: ComponentConfig[];
  themeOverrides: ThemeOverrides;
  conversions: number;
  visitors: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Analytics event tracking
 */
// Commented out - currently unused
// interface AnalyticsEvent {
//   sessionId: string;
//   visitorId?: string;
//   userId?: string;
//   experimentId: string;
//   variantId: string;
//   eventType: 'pageview' | 'click' | 'scroll' | 'conversion' | 'engagement';
//   eventData: Record<
//     string,
//     string | number | boolean | Record<string, unknown>
//   >;
//   timestamp: Date;
// }

/**
 * Landing page analytics data
 */
export interface LandingPageAnalytics {
  id: string;
  sessionId: string;
  visitorId?: string;
  userId?: string;
  experimentId: string;
  variantId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  country?: string;
  region?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  screenResolution?: string;
  landingTime: Date;
  timeOnPage?: number;
  scrollDepth?: number;
  clicks: ClickEvent[];
  converted: boolean;
  conversionValue?: number;
  conversionMetadata: Record<string, string | number | boolean>;
  createdAt: Date;
}

/**
 * Click tracking data
 */
export interface ClickEvent {
  element: string;
  text?: string;
  timestamp: Date;
  x?: number;
  y?: number;
}

/**
 * Component library entry
 */
export interface ComponentLibraryItem {
  id: string;
  type: LandingComponentType;
  variantName: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  defaultProps: Record<
    string,
    string | number | boolean | Record<string, unknown>
  >;
  propSchema: Record<string, unknown>; // JSON Schema
  tags?: string[];
  category?: string;
  usageCount: number;
  averageConversionRate?: number;
  isActive: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Experiment template for quick setup
 */
export interface ExperimentTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  hypothesisTemplate?: string;
  primaryMetric: string;
  recommendedDurationDays?: number;
  minimumSampleSize?: number;
  variants: VariantTemplate[];
  usageCount: number;
  successRate?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Variant template configuration
 */
export interface VariantTemplate {
  name: string;
  description: string;
  components?: ComponentConfig[];
  themeOverrides?: ThemeOverrides;
}

/**
 * Experiment results and statistics
 */
export interface ExperimentResults {
  variantResults: VariantResult[];
  winner?: string;
  confidence?: number;
  improvementPercentage?: number;
  statisticalSignificance?: boolean;
  totalVisitors: number;
  totalConversions: number;
  duration: number; // days
}

/**
 * Individual variant performance
 */
export interface VariantResult {
  variantId: string;
  variantName: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  confidenceInterval: [number, number];
  uplift?: number; // Relative to control
  pValue?: number;
}

/**
 * Component props for specific component types
 */
export interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  showVideo?: boolean;
  videoUrl?: string;
  backgroundImage?: string;
  showStats?: boolean;
}

// Commented out - currently unused
// interface FeaturesProps {
//   columns?: number;
//   showIcons?: boolean;
//   layout?: 'grid' | 'list' | 'carousel';
//   features?: Array<{
//     title: string;
//     description: string;
//     icon?: string;
//   }>;
// }

// Commented out - currently unused
// interface PricingProps {
//   plans?: Array<{
//     name: string;
//     price: number;
//     features: string[];
//     highlighted?: boolean;
//   }>;
//   currency?: string;
//   billingPeriod?: 'monthly' | 'yearly';
//   showComparison?: boolean;
// }

/**
 * API request/response types
 */
export interface CreateExperimentRequest {
  name: string;
  description?: string;
  hypothesis?: string;
  trafficPercentage?: number;
  targetAudience?: TargetAudience;
  primaryMetric: string;
  secondaryMetrics?: string[];
  variants: Omit<
    LandingPageVariant,
    | 'id'
    | 'experimentId'
    | 'conversions'
    | 'visitors'
    | 'createdAt'
    | 'updatedAt'
  >[];
  startDate?: Date;
  endDate?: Date;
}

// Commented out - currently unused
// interface UpdateExperimentRequest {
//   name?: string;
//   description?: string;
//   status?: ExperimentStatus;
//   trafficPercentage?: number;
//   targetAudience?: TargetAudience;
//   endDate?: Date;
// }

export interface GetActiveExperimentResponse {
  experimentId: string;
  variantId: string;
  variantName: string;
  components: ComponentConfig[];
  themeOverrides: ThemeOverrides;
}

export interface ExperimentAnalyticsResponse {
  experiment: LandingPageExperiment;
  results: ExperimentResults;
  timeline: Array<{
    date: Date;
    visitors: number;
    conversions: number;
  }>;
}

/**
 * Conversion metrics
 */
// Commented out - currently unused
// type ConversionMetric =
//   | 'signup_rate'
//   | 'demo_click_rate'
//   | 'cta_click_rate'
//   | 'pricing_view_rate'
//   | 'scroll_depth'
//   | 'time_on_page'
//   | 'bounce_rate';

/**
 * A/B test assignment for a visitor
 */
export interface VisitorAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: Date;
}

/**
 * Detailed variant with analytics data
 */
export interface DetailedVariant extends LandingPageVariant {
  analytics: {
    totalClicks: number;
    uniqueVisitors: number;
    averageTimeOnPage: number;
    bounceRate: number;
    conversionsByDay: Array<{
      date: string;
      conversions: number;
      visitors: number;
    }>;
  };
}
