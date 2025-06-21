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
 * Unified Event Tracking
 *
 * Provides a single interface for tracking events in both PostHog and SigNoz
 */

import { correlation } from '../signoz/correlation';
import {
  trackUserSignUp,
  trackUserLogin,
  trackUserLogout,
  trackPortfolioCreated,
  trackPortfolioUpdated,
  trackPortfolioPublished,
  trackPortfolioViewed,
  trackEditorSectionEdited,
  trackEditorThemeChanged,
  trackAIContentGenerated,
  trackAISuggestionAccepted,
  trackAISuggestionRejected,
  trackContactClicked,
  trackResumeDownloaded,
  trackSubscriptionStarted,
  trackSubscriptionCancelled,
  trackPaymentCompleted,
} from '@/lib/analytics/posthog/events';

/**
 * Unified user events
 */
export const user = {
  signUp: (properties?: {
    method?: 'email' | 'google' | 'github' | 'linkedin';
    source?: string;
    referrer?: string;
  }) => {
    trackUserSignUp(properties);
    correlation.event('user_signed_up', properties);
  },

  login: (properties?: {
    method?: 'email' | 'google' | 'github' | 'linkedin';
  }) => {
    trackUserLogin(properties);
    correlation.event('user_logged_in', properties);
  },

  logout: () => {
    trackUserLogout();
    correlation.event('user_logged_out');
  },

  action: <T>(
    action: string,
    userId: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> => {
    return correlation.userAction(action, userId, operation, metadata);
  },
};

/**
 * Unified portfolio events
 */
export const portfolio = {
  create: <T>(
    portfolioId: string,
    fn: () => Promise<T>,
    properties?: {
      template?: string;
      ai_assisted?: boolean;
      sections?: string[];
    }
  ): Promise<T> => {
    return correlation.portfolio(
      'create',
      portfolioId,
      async () => {
        const result = await fn();
        trackPortfolioCreated(portfolioId, properties);
        return result;
      },
      properties
    );
  },

  update: <T>(
    portfolioId: string,
    fn: () => Promise<T>,
    properties?: {
      section?: string;
      field?: string;
      update_type?: 'manual' | 'ai_generated';
    }
  ): Promise<T> => {
    return correlation.portfolio(
      'update',
      portfolioId,
      async () => {
        const result = await fn();
        trackPortfolioUpdated(portfolioId, properties);
        return result;
      },
      properties
    );
  },

  publish: <T>(
    portfolioId: string,
    fn: () => Promise<T>,
    properties?: {
      subdomain?: string;
      custom_domain?: string;
      variant_count?: number;
    }
  ): Promise<T> => {
    return correlation.portfolio(
      'publish',
      portfolioId,
      async () => {
        const result = await fn();
        trackPortfolioPublished(portfolioId, properties);
        return result;
      },
      properties
    );
  },

  view: (
    portfolioSlug: string,
    properties?: {
      variant_id?: string;
      referrer?: string;
      is_owner?: boolean;
    }
  ) => {
    trackPortfolioViewed(portfolioSlug, properties);
    correlation.event('portfolio_viewed', {
      portfolio_slug: portfolioSlug,
      ...properties,
    });
  },

  delete: <T>(
    portfolioId: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> => {
    return correlation.portfolio('delete', portfolioId, fn, metadata);
  },
};

/**
 * Unified editor events
 */
export const editor = {
  sectionEdited: (
    portfolioId: string,
    section: string,
    properties?: {
      edit_type?: 'add' | 'update' | 'delete' | 'reorder';
      ai_assisted?: boolean;
      field?: string;
    }
  ) => {
    trackEditorSectionEdited(portfolioId, section, properties);
    correlation.event('editor_section_edited', {
      portfolio_id: portfolioId,
      section,
      ...properties,
    });
  },

  themeChanged: (
    portfolioId: string,
    properties?: {
      from_theme?: string;
      to_theme?: string;
      customization_type?: string;
    }
  ) => {
    trackEditorThemeChanged(portfolioId, properties);
    correlation.event('editor_theme_changed', {
      portfolio_id: portfolioId,
      ...properties,
    });
  },
};

/**
 * Unified AI events
 */
export const ai = {
  enhance: <T>(
    contentType: 'bio' | 'project' | 'experience' | 'skills',
    model: string,
    fn: () => Promise<T>,
    metadata?: {
      word_count?: number;
      quality_score?: number;
      portfolio_id?: string;
    }
  ): Promise<T> => {
    return correlation.ai(
      contentType,
      model,
      async () => {
        const result = await fn();
        trackAIContentGenerated({
          content_type: contentType,
          model,
          ...metadata,
        });
        return result;
      },
      metadata
    );
  },

  suggestionAccepted: (properties?: {
    suggestion_type?: string;
    section?: string;
    confidence_score?: number;
    portfolio_id?: string;
  }) => {
    trackAISuggestionAccepted(properties);
    correlation.event('ai_suggestion_accepted', properties);
  },

  suggestionRejected: (properties?: {
    suggestion_type?: string;
    section?: string;
    confidence_score?: number;
    reason?: string;
    portfolio_id?: string;
  }) => {
    trackAISuggestionRejected(properties);
    correlation.event('ai_suggestion_rejected', properties);
  },
};

/**
 * Unified engagement events
 */
export const engagement = {
  contactClicked: (
    portfolioSlug: string,
    properties?: {
      contact_type?: 'email' | 'phone' | 'linkedin' | 'twitter' | 'github';
      variant_id?: string;
    }
  ) => {
    trackContactClicked(portfolioSlug, properties);
    correlation.event('contact_clicked', {
      portfolio_slug: portfolioSlug,
      ...properties,
    });
  },

  resumeDownloaded: (
    portfolioSlug: string,
    properties?: {
      format?: 'pdf' | 'docx';
      variant_id?: string;
    }
  ) => {
    trackResumeDownloaded(portfolioSlug, properties);
    correlation.event('resume_downloaded', {
      portfolio_slug: portfolioSlug,
      ...properties,
    });
  },
};

/**
 * Unified revenue events
 */
export const revenue = {
  payment: <T>(
    amount: number,
    fn: () => Promise<T>,
    properties?: {
      payment_method?: string;
      plan?: string;
      currency?: string;
    }
  ): Promise<T> => {
    return correlation.revenue(
      'payment',
      amount,
      async () => {
        const result = await fn();
        trackPaymentCompleted({
          amount,
          currency: properties?.currency || 'USD',
          ...properties,
        });
        return result;
      },
      properties
    );
  },

  subscription: <T>(
    amount: number,
    fn: () => Promise<T>,
    properties?: {
      plan?: 'starter' | 'professional' | 'business';
      billing_period?: 'monthly' | 'yearly';
    }
  ): Promise<T> => {
    return correlation.revenue(
      'subscription',
      amount,
      async () => {
        const result = await fn();
        trackSubscriptionStarted({
          amount,
          currency: 'USD',
          ...properties,
        });
        return result;
      },
      properties
    );
  },

  cancellation: (properties?: {
    plan?: string;
    reason?: string;
    churn_survey_response?: Record<string, unknown>;
  }) => {
    trackSubscriptionCancelled(properties);
    correlation.event('subscription_cancelled', properties);
  },

  refund: <T>(
    amount: number,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> => {
    return correlation.revenue('refund', amount, fn, metadata);
  },
};

/**
 * Create a correlated session for tracking user journeys
 */
export { CorrelatedSession } from '../signoz/correlation';

/**
 * Unified marketplace events
 */
export const marketplace = {
  search: (params: Record<string, unknown>) => {
    correlation.event('marketplace_search', params);
  },

  view: (params: Record<string, unknown>) => {
    correlation.event('marketplace_template_viewed', params);
  },

  purchase: (params: Record<string, unknown>) => {
    correlation.event('marketplace_template_purchased', params);
  },

  useTemplate: (params: Record<string, unknown>) => {
    correlation.event('marketplace_template_used', params);
  },

  review: (params: Record<string, unknown>) => {
    correlation.event('marketplace_template_reviewed', params);
  },

  wishlist: (params: Record<string, unknown>) => {
    correlation.event('marketplace_wishlist_action', params);
  },
};

/**
 * Unified domain events
 */
export const domain = {
  add: (params: Record<string, unknown>) => {
    correlation.event('domain_added', params);
  },

  verify: (params: Record<string, unknown>) => {
    correlation.event('domain_verified', params);
  },

  activate: (params: Record<string, unknown>) => {
    correlation.event('domain_activated', params);
  },

  setPrimary: (params: Record<string, unknown>) => {
    correlation.event('domain_set_primary', params);
  },

  remove: (params: Record<string, unknown>) => {
    correlation.event('domain_removed', params);
  },
};

/**
 * Export unified tracking interface
 */
export const track = {
  user,
  portfolio,
  editor,
  ai,
  engagement,
  revenue,
  marketplace,
  domain,
};
