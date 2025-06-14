/**
 * PostHog Event Tracking Utilities
 * 
 * Centralized event tracking functions for consistent analytics
 */

import { captureEvent, captureEnhancedEvent, EVENTS } from './client';

// User Journey Events
export const trackUserSignUp = (properties?: {
  method?: 'email' | 'google' | 'github' | 'linkedin';
  source?: string;
  referrer?: string;
}) => {
  captureEnhancedEvent(EVENTS.USER_SIGNED_UP, properties);
};

export const trackUserLogin = (properties?: {
  method?: 'email' | 'google' | 'github' | 'linkedin';
}) => {
  captureEvent(EVENTS.USER_LOGGED_IN, properties);
};

export const trackUserLogout = () => {
  captureEvent(EVENTS.USER_LOGGED_OUT);
};

// Portfolio Events
export const trackPortfolioCreated = (portfolioId: string, properties?: {
  template?: string;
  ai_assisted?: boolean;
  sections?: string[];
}) => {
  captureEnhancedEvent(EVENTS.PORTFOLIO_CREATED, {
    portfolio_id: portfolioId,
    ...properties,
  });
};

export const trackPortfolioUpdated = (portfolioId: string, properties?: {
  section?: string;
  field?: string;
  update_type?: 'manual' | 'ai_generated';
}) => {
  captureEvent(EVENTS.PORTFOLIO_UPDATED, {
    portfolio_id: portfolioId,
    ...properties,
  });
};

export const trackPortfolioPublished = (portfolioId: string, properties?: {
  subdomain?: string;
  custom_domain?: string;
  variant_count?: number;
}) => {
  captureEnhancedEvent(EVENTS.PORTFOLIO_PUBLISHED, {
    portfolio_id: portfolioId,
    ...properties,
  });
};

export const trackPortfolioViewed = (portfolioSlug: string, properties?: {
  variant_id?: string;
  referrer?: string;
  is_owner?: boolean;
}) => {
  captureEvent(EVENTS.PORTFOLIO_VIEWED, {
    portfolio_slug: portfolioSlug,
    ...properties,
  });
};

// Editor Events
export const trackEditorSectionEdited = (portfolioId: string, section: string, properties?: {
  edit_type?: 'add' | 'update' | 'delete' | 'reorder';
  ai_assisted?: boolean;
  field?: string;
}) => {
  captureEvent(EVENTS.EDITOR_SECTION_EDITED, {
    portfolio_id: portfolioId,
    section,
    ...properties,
  });
};

export const trackEditorThemeChanged = (portfolioId: string, properties?: {
  from_theme?: string;
  to_theme?: string;
  customization_type?: string;
}) => {
  captureEvent(EVENTS.EDITOR_THEME_CHANGED, {
    portfolio_id: portfolioId,
    ...properties,
  });
};

// Variant Events
export const trackVariantCreated = (variantId: string, properties?: {
  portfolio_id?: string;
  audience_type?: string;
  based_on_variant?: string;
}) => {
  captureEnhancedEvent(EVENTS.VARIANT_CREATED, {
    variant_id: variantId,
    ...properties,
  });
};

export const trackVariantUpdated = (variantId: string, properties?: {
  update_type?: string;
  fields_updated?: string[];
}) => {
  captureEvent(EVENTS.VARIANT_UPDATED, {
    variant_id: variantId,
    ...properties,
  });
};

export const trackVariantSwitched = (properties?: {
  from_variant?: string;
  to_variant?: string;
  portfolio_id?: string;
}) => {
  captureEvent(EVENTS.VARIANT_SWITCHED, properties);
};

export const trackVariantPublished = (variantId: string, properties?: {
  portfolio_id?: string;
  audience_type?: string;
}) => {
  captureEnhancedEvent(EVENTS.VARIANT_PUBLISHED, {
    variant_id: variantId,
    ...properties,
  });
};

// AI Events
export const trackAIContentGenerated = (properties?: {
  content_type?: 'bio' | 'project' | 'experience' | 'skills';
  model?: string;
  word_count?: number;
  quality_score?: number;
  portfolio_id?: string;
}) => {
  captureEvent(EVENTS.AI_CONTENT_GENERATED, properties);
};

export const trackAISuggestionAccepted = (properties?: {
  suggestion_type?: string;
  section?: string;
  confidence_score?: number;
  portfolio_id?: string;
}) => {
  captureEvent(EVENTS.AI_SUGGESTION_ACCEPTED, properties);
};

export const trackAISuggestionRejected = (properties?: {
  suggestion_type?: string;
  section?: string;
  confidence_score?: number;
  reason?: string;
  portfolio_id?: string;
}) => {
  captureEvent(EVENTS.AI_SUGGESTION_REJECTED, properties);
};

// Engagement Events
export const trackContactClicked = (portfolioSlug: string, properties?: {
  contact_type?: 'email' | 'phone' | 'linkedin' | 'twitter' | 'github';
  variant_id?: string;
}) => {
  captureEnhancedEvent(EVENTS.CONTACT_CLICKED, {
    portfolio_slug: portfolioSlug,
    ...properties,
  });
};

export const trackResumeDownloaded = (portfolioSlug: string, properties?: {
  format?: 'pdf' | 'docx';
  variant_id?: string;
}) => {
  captureEnhancedEvent(EVENTS.RESUME_DOWNLOADED, {
    portfolio_slug: portfolioSlug,
    ...properties,
  });
};

export const trackSocialLinkClicked = (portfolioSlug: string, properties?: {
  platform?: string;
  variant_id?: string;
}) => {
  captureEvent(EVENTS.SOCIAL_LINK_CLICKED, {
    portfolio_slug: portfolioSlug,
    ...properties,
  });
};

export const trackProjectViewed = (portfolioSlug: string, projectId: string, properties?: {
  project_name?: string;
  has_demo?: boolean;
  has_github?: boolean;
  variant_id?: string;
}) => {
  captureEvent(EVENTS.PROJECT_VIEWED, {
    portfolio_slug: portfolioSlug,
    project_id: projectId,
    ...properties,
  });
};

// Revenue Events
export const trackSubscriptionStarted = (properties?: {
  plan?: 'starter' | 'professional' | 'business';
  billing_period?: 'monthly' | 'yearly';
  amount?: number;
  currency?: string;
}) => {
  captureEnhancedEvent(EVENTS.SUBSCRIPTION_STARTED, properties);
};

export const trackSubscriptionCancelled = (properties?: {
  plan?: string;
  reason?: string;
  churn_survey_response?: Record<string, any>;
}) => {
  captureEnhancedEvent(EVENTS.SUBSCRIPTION_CANCELLED, properties);
};

export const trackPaymentCompleted = (properties?: {
  amount?: number;
  currency?: string;
  payment_method?: string;
  plan?: string;
}) => {
  captureEnhancedEvent(EVENTS.PAYMENT_COMPLETED, properties);
};

// Funnel tracking
export const trackOnboardingStep = (step: number, stepName: string, properties?: Record<string, any>) => {
  captureEvent('onboarding_step_completed', {
    step_number: step,
    step_name: stepName,
    ...properties,
  });
};

export const trackConversionFunnel = (stage: 'landed' | 'signed_up' | 'created_portfolio' | 'published' | 'upgraded', properties?: Record<string, any>) => {
  captureEvent('conversion_funnel', {
    stage,
    ...properties,
  });
};