/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { UserProfile, AIServiceError } from '@/lib/ai/types';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * Template Recommendation API Route
 * Uses AI to recommend the best portfolio template based on user profile
 */

// Request validation schema
const recommendTemplateSchema = z.object({
  profile: z.object({
    title: z.string().min(1, 'Professional title is required'),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
    projectCount: z.number().min(0),
    hasDesignWork: z.boolean(),
    industry: z.string().optional(),
    experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead']),
  }),
  preferences: z
    .object({
      style: z
        .enum(['minimal', 'modern', 'creative', 'professional'])
        .optional(),
      targetAudience: z
        .enum(['employers', 'clients', 'collaborators'])
        .optional(),
      priority: z
        .enum(['simplicity', 'visual_impact', 'content_heavy'])
        .optional(),
    })
    .optional()
    .default({}),
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const validationResult = recommendTemplateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { profile, preferences } = validationResult.data;

    // 3. Check AI usage limits
    const { data: canUseAI, error: limitsError } = await supabase.rpc(
      'increment_ai_usage',
      { user_uuid: user.id }
    );

    if (limitsError) {
      logger.error('Failed to check AI limits', {
        error: limitsError,
        userId: user.id,
      });
      return NextResponse.json(
        { error: 'Failed to check usage limits' },
        { status: 500 }
      );
    }

    if (!canUseAI) {
      return NextResponse.json(
        {
          error:
            'AI usage limit exceeded. Please upgrade your plan to continue.',
          code: 'AI_LIMIT_EXCEEDED',
        },
        { status: 403 }
      );
    }

    // 4. Initialize AI service
    const aiService = new HuggingFaceService();

    // 5. Check service health
    const isHealthy = await aiService.healthCheck();
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

    // 6. Get template recommendation
    const recommendation = await aiService.recommendTemplate(profile);

    // 7. Enhance recommendation with additional context
    const enhancedRecommendation = await enhanceRecommendation(
      recommendation,
      profile,
      preferences
    );

    // 8. Log usage for analytics
    await logAIUsage(user.id, 'template_recommendation', {
      recommendedTemplate: recommendation.recommendedTemplate,
      confidence: recommendation.confidence,
      userProfile: {
        title: profile.title,
        experienceLevel: profile.experienceLevel,
        hasDesignWork: profile.hasDesignWork,
        skillCount: profile.skills.length,
        projectCount: profile.projectCount,
      },
      preferences,
    });

    // 9. Return recommendation
    return NextResponse.json({
      success: true,
      data: enhancedRecommendation,
      metadata: {
        profileAnalyzed: true,
        recommendationConfidence: recommendation.confidence,
        processingTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(
      'Template recommendation failed',
      error instanceof Error ? error : { error }
    );

    // Handle specific AI service errors
    if (error instanceof AIServiceError) {
      return NextResponse.json(
        {
          error: 'AI processing failed',
          message: error.message,
          retryable: error.retryable,
        },
        { status: error.retryable ? 503 : 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get all available templates with descriptions
 */
export async function GET(): Promise<Response> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Return template catalog
    const templates = {
      developer: {
        name: 'Developer',
        description:
          'Clean, code-focused layout perfect for software engineers and technical professionals',
        features: [
          'GitHub integration',
          'Code syntax highlighting',
          'Technical project showcase',
          'Skills matrix',
        ],
        preview: '/templates/developer-preview.jpg',
        bestFor: [
          'Software Engineers',
          'DevOps Engineers',
          'Data Scientists',
          'Technical Leads',
        ],
        industries: ['Technology', 'Startups', 'Enterprise Software'],
      },
      designer: {
        name: 'Designer',
        description:
          'Visual-heavy layout showcasing creative work and design portfolios',
        features: [
          'Image galleries',
          'Project case studies',
          'Color customization',
          'Interactive elements',
        ],
        preview: '/templates/designer-preview.jpg',
        bestFor: [
          'UI/UX Designers',
          'Graphic Designers',
          'Product Designers',
          'Creative Directors',
        ],
        industries: ['Design', 'Advertising', 'Media', 'E-commerce'],
      },
      consultant: {
        name: 'Consultant',
        description:
          'Professional, results-oriented layout for business and consulting roles',
        features: [
          'Client testimonials',
          'Case studies',
          'ROI metrics',
          'Professional timeline',
        ],
        preview: '/templates/consultant-preview.jpg',
        bestFor: [
          'Business Consultants',
          'Strategy Advisors',
          'Project Managers',
          'Analysts',
        ],
        industries: ['Consulting', 'Finance', 'Healthcare', 'Government'],
      },
      creative: {
        name: 'Creative',
        description:
          'Artistic, flexible layout for creative professionals and freelancers',
        features: [
          'Portfolio galleries',
          'Blog integration',
          'Custom layouts',
          'Video embeds',
        ],
        preview: '/templates/creative-preview.jpg',
        bestFor: ['Artists', 'Writers', 'Photographers', 'Content Creators'],
        industries: ['Arts', 'Entertainment', 'Publishing', 'Non-profit'],
      },
      minimal: {
        name: 'Minimal',
        description:
          'Simple, content-focused layout suitable for any profession',
        features: [
          'Clean typography',
          'Fast loading',
          'Mobile optimized',
          'Easy customization',
        ],
        preview: '/templates/minimal-preview.jpg',
        bestFor: ['Academics', 'Researchers', 'Executives', 'Career Changers'],
        industries: ['Education', 'Research', 'Corporate', 'Any Industry'],
      },
    };

    return NextResponse.json({
      success: true,
      data: { templates },
      metadata: {
        totalTemplates: Object.keys(templates).length,
        lastUpdated: '2024-01-15',
      },
    });
  } catch (error) {
    logger.error(
      'Failed to fetch templates',
      error instanceof Error ? error : { error }
    );
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * Enhance AI recommendation with additional business logic
 */
function enhanceRecommendation(
  aiRecommendation: unknown,
  profile: UserProfile,
  preferences: Record<string, unknown>
): unknown {
  // Apply business rules and preferences
  const enhancedAlternatives = (
    (aiRecommendation as Record<string, unknown>).alternatives as Array<
      Record<string, unknown>
    >
  ).map((alt: Record<string, unknown>) => ({
    ...alt,
    reasoning: generateReasoningForTemplate(alt.template as string, profile),
    preview: `/templates/${alt.template as string}-preview.jpg`,
    features: getTemplateFeatures(alt.template as string),
  }));

  // Add style preference adjustments
  if (preferences.style !== undefined && preferences.style !== null) {
    const styleBonus = calculateStyleBonus(
      (aiRecommendation as Record<string, unknown>)
        .recommendedTemplate as string,
      preferences.style as string
    );
    (aiRecommendation as Record<string, unknown>).confidence = Math.min(
      0.95,
      ((aiRecommendation as Record<string, unknown>).confidence as number) +
        styleBonus
    );
  }

  return {
    ...(aiRecommendation as Record<string, unknown>),
    alternatives: enhancedAlternatives,
    reasoning: generateReasoningForTemplate(
      (aiRecommendation as Record<string, unknown>)
        .recommendedTemplate as string,
      profile
    ),
    preview: `/templates/${(aiRecommendation as Record<string, unknown>).recommendedTemplate as string}-preview.jpg`,
    features: getTemplateFeatures(
      (aiRecommendation as Record<string, unknown>)
        .recommendedTemplate as string
    ),
    customizations: getRecommendedCustomizations(
      (aiRecommendation as Record<string, unknown>)
        .recommendedTemplate as string,
      profile
    ),
  };
}

function generateReasoningForTemplate(
  template: string,
  profile: UserProfile
): string {
  const reasoningMap = {
    developer: `Perfect for technical roles like "${profile.title}". Highlights programming skills and technical projects effectively.`,
    designer: `Ideal for creative professionals. Visual-focused layout showcases design work and creative projects.`,
    consultant: `Best for business-oriented roles. Emphasizes results, metrics, and professional achievements.`,
    creative: `Great for artistic and creative fields. Flexible layout accommodates diverse content types.`,
    minimal: `Clean, professional approach suitable for any industry. Focuses on content over design.`,
  };

  return (
    reasoningMap[template as keyof typeof reasoningMap] ||
    'Recommended based on your profile analysis.'
  );
}

function getTemplateFeatures(template: string): string[] {
  const featuresMap = {
    developer: [
      'GitHub integration',
      'Code syntax highlighting',
      'Technical project showcase',
    ],
    designer: [
      'Image galleries',
      'Project case studies',
      'Color customization',
    ],
    consultant: ['Client testimonials', 'Case studies', 'ROI metrics'],
    creative: ['Portfolio galleries', 'Blog integration', 'Video embeds'],
    minimal: ['Clean typography', 'Fast loading', 'Mobile optimized'],
  };

  return featuresMap[template as keyof typeof featuresMap] ?? [];
}

function getRecommendedCustomizations(
  template: string,
  profile: UserProfile
): unknown {
  const baseConfig = {
    primaryColor: profile.hasDesignWork ? '#6366f1' : '#1f2937',
    headerStyle:
      profile.experienceLevel === 'senior' || profile.experienceLevel === 'lead'
        ? 'professional'
        : 'minimal',
    sectionOrder:
      profile.projectCount > 3
        ? ['about', 'projects', 'experience', 'skills']
        : ['about', 'experience', 'skills', 'projects'],
  };

  // Template-specific customizations
  const templateCustomizations = {
    developer: {
      primaryColor: '#1e40af',
      sectionOrder: ['about', 'experience', 'projects', 'skills'],
    },
    designer: {
      primaryColor: '#7c3aed',
      sectionOrder: ['about', 'projects', 'experience', 'skills'],
    },
    consultant: {
      primaryColor: '#059669',
      headerStyle: 'professional',
    },
    creative: {
      primaryColor: '#dc2626',
    },
    minimal: {
      primaryColor: '#374151',
      headerStyle: 'minimal',
    },
  };

  return {
    ...baseConfig,
    ...templateCustomizations[template as keyof typeof templateCustomizations],
  };
}

function calculateStyleBonus(template: string, preferredStyle: string): number {
  const styleMatches: Record<string, Record<string, number>> = {
    minimal: { minimal: 0.1, professional: 0.05 },
    developer: { minimal: 0.05, modern: 0.1, professional: 0.1 },
    designer: { creative: 0.15, modern: 0.1 },
    consultant: { professional: 0.15, minimal: 0.05 },
    creative: { creative: 0.15, modern: 0.1 },
  };

  return styleMatches[template]?.[preferredStyle] || 0;
}

/**
 * Log AI usage for analytics and billing
 */
async function logAIUsage(
  userId: string,
  operationType: string,
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      logger.error('Failed to create Supabase client for logging');
      return;
    }

    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      operation_type: operationType,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      'Failed to log AI usage',
      error instanceof Error ? error : { error }
    );
    // Don't throw - logging failure shouldn't break the main operation
  }
}
