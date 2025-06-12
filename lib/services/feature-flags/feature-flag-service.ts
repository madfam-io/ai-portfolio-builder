/**
 * @fileoverview Feature Flag Service for A/B Testing
 *
 * Handles experiment assignment, variant selection, and traffic splitting
 * for landing page A/B tests. Uses cookies for persistent assignment.
 */

import crypto from 'crypto';

import { cookies } from 'next/headers';

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

import type {
  GetActiveExperimentResponse,
  VisitorAssignment,
  TargetAudience,
} from '@/types/experiments';

/**
 * Cookie name for storing experiment assignments
 */
const EXPERIMENT_COOKIE_NAME = 'prisma_experiments';
const VISITOR_ID_COOKIE_NAME = 'prisma_visitor_id';

/**
 * Cookie expiration time (90 days)
 */
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90 days in seconds

/**
 * Feature flag service for managing A/B test assignments
 */
export class FeatureFlagService {
  /**
   * Get or create a visitor ID
   */
  private static async getOrCreateVisitorId(): Promise<string> {
    const cookieStore = await cookies();
    let visitorId = cookieStore.get(VISITOR_ID_COOKIE_NAME)?.value;

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      cookieStore.set(VISITOR_ID_COOKIE_NAME, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });
    }

    return visitorId;
  }

  /**
   * Get stored experiment assignments from cookies
   */
  private static async getStoredAssignments(): Promise<
    Record<string, VisitorAssignment>
  > {
    const cookieStore = await cookies();
    const assignmentsCookie = cookieStore.get(EXPERIMENT_COOKIE_NAME)?.value;

    if (!assignmentsCookie) {
      return {};
    }

    try {
      return JSON.parse(decodeURIComponent(assignmentsCookie));
    } catch (error) {
      logger.error(
        'Failed to parse experiment assignments cookie',
        error as Error
      );
      return {};
    }
  }

  /**
   * Store experiment assignment in cookies
   */
  private static async storeAssignment(
    experimentId: string,
    variantId: string
  ): Promise<void> {
    const cookieStore = await cookies();
    const assignments = await this.getStoredAssignments();

    assignments[experimentId] = {
      experimentId,
      variantId,
      assignedAt: new Date(),
    };

    cookieStore.set(
      EXPERIMENT_COOKIE_NAME,
      encodeURIComponent(JSON.stringify(assignments)),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      }
    );
  }

  /**
   * Check if visitor matches targeting criteria
   */
  private static matchesTargeting(
    targetAudience: TargetAudience,
    visitorContext: {
      country?: string;
      device?: string;
      language?: string;
      referrer?: string;
      utmSource?: string;
    }
  ): boolean {
    // If no targeting specified, include all visitors
    if (!targetAudience || Object.keys(targetAudience).length === 0) {
      return true;
    }

    // Check geo targeting
    if (targetAudience.geo && visitorContext.country) {
      if (!targetAudience.geo.includes(visitorContext.country)) {
        return false;
      }
    }

    // Check device targeting
    if (targetAudience.device && visitorContext.device) {
      if (!targetAudience.device.includes(visitorContext.device)) {
        return false;
      }
    }

    // Check language targeting
    if (targetAudience.language && visitorContext.language) {
      if (!targetAudience.language.includes(visitorContext.language)) {
        return false;
      }
    }

    // Check referrer targeting
    if (targetAudience.referrer && visitorContext.referrer) {
      const referrerMatch = targetAudience.referrer.some(ref =>
        visitorContext.referrer?.includes(ref)
      );
      if (!referrerMatch) {
        return false;
      }
    }

    // Check UTM source targeting
    if (targetAudience.utm_source && visitorContext.utmSource) {
      if (!targetAudience.utm_source.includes(visitorContext.utmSource)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Hash a string to a number between 0 and 99
   * Used for consistent traffic splitting
   */
  private static hashToPercentage(str: string): number {
    const hash = crypto.createHash('md5').update(str).digest('hex');
    const num = parseInt(hash.substring(0, 8), 16);
    return num % 100;
  }

  /**
   * Get active experiment and variant for the current visitor
   */
  static async getActiveExperiment(visitorContext?: {
    country?: string;
    device?: string;
    language?: string;
    referrer?: string;
    utmSource?: string;
  }): Promise<GetActiveExperimentResponse | null> {
    try {
      const supabase = await createClient();
      const visitorId = await this.getOrCreateVisitorId();
      const storedAssignments = await this.getStoredAssignments();

      // Get active experiments
      const { data: experiments, error: experimentsError } = await supabase
        .from('landing_page_experiments')
        .select(
          `
          *,
          variants:landing_page_variants(*)
        `
        )
        .eq('status', 'active')
        .or('start_date.is.null,start_date.lte.now()')
        .or('end_date.is.null,end_date.gte.now()')
        .order('created_at', { ascending: false });

      if (experimentsError || !experiments || experiments.length === 0) {
        return null;
      }

      // Find the first matching experiment
      for (const experiment of experiments) {
        // Check if visitor is already assigned to this experiment
        const existingAssignment = storedAssignments[experiment.id];
        if (existingAssignment) {
          // Find the assigned variant
          const variant = experiment.variants.find(
            (v: any) => v.id === existingAssignment.variantId
          );

          if (variant) {
            return {
              experimentId: experiment.id,
              variantId: variant.id,
              variantName: variant.name,
              components: variant.components,
              themeOverrides: variant.theme_overrides,
            };
          }
        }

        // Check targeting criteria
        if (
          !this.matchesTargeting(
            experiment.target_audience,
            visitorContext || {}
          )
        ) {
          continue;
        }

        // Check traffic percentage for experiment
        const experimentHash = this.hashToPercentage(
          `${visitorId}-${experiment.id}`
        );
        if (experimentHash >= experiment.traffic_percentage) {
          continue;
        }

        // Assign variant based on traffic allocation
        const variantHash = this.hashToPercentage(
          `${visitorId}-${experiment.id}-variant`
        );
        let cumulativePercentage = 0;

        for (const variant of experiment.variants) {
          cumulativePercentage += variant.traffic_percentage;

          if (variantHash < cumulativePercentage) {
            // Store assignment
            await this.storeAssignment(experiment.id, variant.id);

            // Record visitor in analytics
            await supabase.rpc('record_landing_page_event', {
              p_session_id: visitorId,
              p_experiment_id: experiment.id,
              p_variant_id: variant.id,
              p_event_type: 'assignment',
              p_event_data: { visitorContext },
            });

            return {
              experimentId: experiment.id,
              variantId: variant.id,
              variantName: variant.name,
              components: variant.components,
              themeOverrides: variant.theme_overrides,
            };
          }
        }
      }

      return null;
    } catch (error) {
      logger.error('Failed to get active experiment', error as Error);
      return null;
    }
  }

  /**
   * Record a conversion event
   */
  static async recordConversion(
    experimentId: string,
    variantId: string,
    conversionData?: Record<string, any>
  ): Promise<void> {
    try {
      const supabase = await createClient();
      const visitorId = await this.getOrCreateVisitorId();

      await supabase.rpc('record_landing_page_event', {
        p_session_id: visitorId,
        p_experiment_id: experimentId,
        p_variant_id: variantId,
        p_event_type: 'conversion',
        p_event_data: conversionData || {},
      });
    } catch (error) {
      logger.error('Failed to record conversion', error as Error);
    }
  }

  /**
   * Record a click event
   */
  static async recordClick(
    experimentId: string,
    variantId: string,
    element: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      const supabase = await createClient();
      const visitorId = await this.getOrCreateVisitorId();

      await supabase.rpc('record_landing_page_event', {
        p_session_id: visitorId,
        p_experiment_id: experimentId,
        p_variant_id: variantId,
        p_event_type: 'click',
        p_event_data: {
          element,
          timestamp: new Date().toISOString(),
          ...additionalData,
        },
      });
    } catch (error) {
      logger.error('Failed to record click', error as Error);
    }
  }

  /**
   * Get all active assignments for the current visitor
   */
  static async getAssignments(): Promise<Record<string, VisitorAssignment>> {
    return await this.getStoredAssignments();
  }

  /**
   * Clear all experiment assignments (useful for testing)
   */
  static async clearAssignments(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(EXPERIMENT_COOKIE_NAME);
  }

  /**
   * Check if a specific feature/variant is enabled
   */
  static async isFeatureEnabled(
    componentType: string,
    variantName: string
  ): Promise<boolean> {
    const experiment = await this.getActiveExperiment();

    if (!experiment) {
      return false;
    }

    const component = experiment.components.find(
      c => c.type === componentType && c.variant === variantName
    );

    return component?.visible || false;
  }
}
