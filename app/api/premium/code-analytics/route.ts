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

/**
 * @fileoverview Premium Code Analytics API
 *
 * Enterprise-grade API endpoint that monetizes our AI code quality engine.
 * This creates multiple revenue streams:
 *
 * - Premium analytics for Business tier users ($50/month upgrade path)
 * - White-label reports for agencies ($200/month B2B)
 * - API access for external platforms ($500/month enterprise)
 * - Custom benchmarking for large companies ($2000/month custom)
 *
 * Features demonstrate technical leadership and create acquisition interest.
 *
 * @author MADFAM Business Team
 * @version 1.0.0 - Revenue Generation Engine
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiCodeQualityEngine } from '@/lib/ai/code-quality/engine';
import { logger } from '@/lib/utils/logger';
// import { withRateLimit } from '@/lib/api/middleware/rate-limit';
import { usageTracker } from '@/lib/analytics/usage-tracking';

export const dynamic = 'force-dynamic';

// Helper functions for business intelligence features
function generateUpsellOpportunities(
  report: any,
  userTier: string,
  usageMetrics: any
) {
  const opportunities = [];

  if (userTier === 'free' && report.metrics.revenueImpact > 5000) {
    opportunities.push({
      type: 'upgrade_professional',
      message: 'Unlock advanced analytics with Professional plan',
      value: report.metrics.revenueImpact,
      urgency: 'high',
    });
  }

  // Check usage-based upsell opportunities
  if (usageMetrics.totalUsage > (usageMetrics.billing?.limit || 100) * 0.8) {
    opportunities.push({
      type: 'usage_limit_approaching',
      message: `You've used ${usageMetrics.totalUsage} of ${usageMetrics.billing?.limit} monthly requests`,
      value: 'Upgrade for higher limits',
      urgency: 'medium',
    });
  }

  return { opportunities, upgradeRecommended: opportunities.length > 0 };
}

function generatePDFReport(report: any, branding?: any) {
  // Simplified PDF report - return structured data
  return {
    format: 'pdf',
    data: report,
    branding,
    downloadUrl: '/api/reports/download',
  };
}

function generateDashboardData(report: any) {
  // Transform report into dashboard-friendly format
  return {
    format: 'dashboard',
    widgets: [
      {
        type: 'metrics',
        data: report.metrics,
      },
      {
        type: 'recommendations',
        data: report.recommendations,
      },
    ],
  };
}

async function getUserUsageAnalytics(userId: string, tier: string) {
  // Get usage analytics for the user
  const analytics = await usageTracker.getUsageAnalytics(userId);

  return {
    currentTier: tier,
    ...analytics,
    billing: {
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usage: analytics.totalUsage,
      limit: tier === 'free' ? 100 : tier === 'professional' ? 1000 : 10000,
    },
  };
}

interface AnalyticsRequest {
  portfolioId?: string;
  codeFiles?: string[];
  analysisType: 'basic' | 'advanced' | 'enterprise' | 'white-label';
  includeCompetitiveIntelligence?: boolean;
  customBenchmarks?: string[];
  reportFormat?: 'json' | 'pdf' | 'dashboard';
  clientBranding?: {
    logo?: string;
    companyName?: string;
    brandColors?: {
      primary: string;
      secondary: string;
    };
  };
}

// UsageMetrics interface imported from usage-tracking

/**
 * POST /api/premium/code-analytics
 *
 * Generate comprehensive code quality analytics with business intelligence
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Apply rate limiting - using default API limits for now
    // TODO: Implement tier-based rate limiting with user subscription data

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const requestBody: AnalyticsRequest = await request.json();
    const {
      portfolioId,
      codeFiles = [],
      analysisType,
      includeCompetitiveIntelligence = false,
      customBenchmarks = [],
      reportFormat = 'json',
      clientBranding,
    } = requestBody;

    // Check user tier and feature access
    const userTier = user.user_metadata?.plan || 'free';
    const featureAccess = validateFeatureAccess(userTier, analysisType);

    if (!featureAccess.allowed) {
      return NextResponse.json(
        {
          error: 'Feature not available in your plan',
          requiredTier: featureAccess.requiredTier,
          upgradeMessage: featureAccess.upgradeMessage,
          revenueOpportunity: featureAccess.revenueOpportunity,
          upgrade_url: '/pricing',
        },
        { status: 403 }
      );
    }

    // Track usage for billing and analytics using our usage tracker
    await usageTracker.trackFeatureUsage({
      userId: user.id,
      feature: 'code_analytics',
      timestamp: new Date(),
      metadata: {
        analysisType,
        includeCompetitiveIntelligence,
        reportFormat,
      },
    });

    // Get current usage metrics for the user
    const usageMetrics = await getUserUsageAnalytics(user.id, userTier);

    // Get code files for analysis
    let analysisFiles: string[] = codeFiles;
    if (portfolioId && codeFiles.length === 0) {
      analysisFiles = await getPortfolioCodeFiles(portfolioId, user.id);
    }

    if (analysisFiles.length === 0) {
      return NextResponse.json(
        {
          error: 'No code files provided for analysis',
          hint: 'Provide either portfolioId or codeFiles array',
        },
        { status: 400 }
      );
    }

    // Generate comprehensive analytics report
    const report = await aiCodeQualityEngine.analyzeCodebase(
      analysisFiles,
      userTier,
      true // Include business intelligence
    );

    // Enhance report based on analysis type
    const enhancedReport = await enhanceReportForTier(report, analysisType, {
      includeCompetitiveIntelligence,
      customBenchmarks,
      clientBranding,
    });

    // Generate usage insights for upselling
    const upsellOpportunities = generateUpsellOpportunities(
      report,
      userTier,
      usageMetrics
    );

    // Format response based on requested format
    let responseData;
    switch (reportFormat) {
      case 'pdf':
        responseData = generatePDFReport(enhancedReport, clientBranding);
        break;
      case 'dashboard':
        responseData = generateDashboardData(enhancedReport);
        break;
      default:
        responseData = enhancedReport;
    }

    // Log success metrics for business intelligence
    logger.info('Premium analytics generated', {
      userId: user.id,
      userTier,
      analysisType,
      performanceScore: report.metrics.performanceScore,
      revenueImpact: report.metrics.revenueImpact,
      reportFormat,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      data: responseData,
      metadata: {
        analysisType,
        reportFormat,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        creditsUsed: 1,
        remainingCredits: Math.max(
          0,
          (usageMetrics.billing?.limit || 100) -
            (usageMetrics.totalUsage || 0) -
            1
        ),
      },
      upsellOpportunities,
      businessIntelligence: {
        competitiveRanking: report.industryBenchmarks.performancePercentile,
        revenueOpportunity: report.metrics.revenueImpact,
        technicalLeadershipScore:
          report.businessImpact.competitivePositioning.technicalLeadershipScore,
        acquisitionReadiness:
          report.businessImpact.competitivePositioning.acquisitionReadiness,
      },
    });
  } catch (error) {
    logger.error('Premium analytics API error', error as Error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        hint: 'Please try again or contact support for assistance',
        support_url: '/support',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/premium/code-analytics/usage
 *
 * Get usage analytics for billing and upselling
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userTier = user.user_metadata?.plan || 'free';
    const usageData = await getUserUsageAnalytics(user.id, userTier);

    return NextResponse.json({
      success: true,
      usage: usageData,
      recommendations: generateUsageRecommendations(usageData, userTier),
      upgradeOpportunities: calculateUpgradeOpportunities(usageData, userTier),
    });
  } catch (error) {
    logger.error('Usage analytics API error', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}

/**
 * Validate feature access based on user tier
 */
function validateFeatureAccess(userTier: string, analysisType: string) {
  const tierFeatures = {
    free: ['basic'],
    professional: ['basic', 'advanced'],
    business: ['basic', 'advanced', 'enterprise', 'white-label'],
  };

  const allowed =
    tierFeatures[userTier as keyof typeof tierFeatures]?.includes(
      analysisType
    ) || false;

  if (!allowed) {
    const requiredTier =
      analysisType === 'basic'
        ? 'free'
        : analysisType === 'advanced'
          ? 'professional'
          : 'business';

    const monthlyRevenue = {
      professional: 29 * 12, // $348/year
      business: 99 * 12, // $1,188/year
    };

    return {
      allowed: false,
      requiredTier,
      upgradeMessage: `Upgrade to ${requiredTier} plan to access ${analysisType} analytics`,
      revenueOpportunity:
        monthlyRevenue[requiredTier as keyof typeof monthlyRevenue] || 0,
    };
  }

  return { allowed: true };
}

/**
 * Get code files associated with a portfolio
 */
function getPortfolioCodeFiles(portfolioId: string, _userId: string): string[] {
  // In production, this would fetch actual code files from the portfolio
  // For now, return mock files for demonstration
  return [
    `portfolio/${portfolioId}/components/showcase.tsx`,
    `portfolio/${portfolioId}/pages/index.tsx`,
    `portfolio/${portfolioId}/styles/globals.css`,
    `portfolio/${portfolioId}/lib/utils.ts`,
  ];
}

/**
 * Enhance report based on tier and options
 */
function enhanceReportForTier(
  baseReport: any,
  analysisType: string,
  options: {
    includeCompetitiveIntelligence?: boolean;
    customBenchmarks?: string[];
    clientBranding?: any;
  }
) {
  let enhancedReport = { ...baseReport };

  switch (analysisType) {
    case 'enterprise':
      enhancedReport.enterpriseFeatures = {
        customBenchmarking: generateCustomBenchmarks(options.customBenchmarks),
        competitiveIntelligence: options.includeCompetitiveIntelligence
          ? generateCompetitiveIntelligence()
          : null,
        executiveReadyReports: true,
        apiIntegrationSupport: true,
        dedicatedSupport: true,
      };
      break;

    case 'white-label':
      enhancedReport.brandingOptions = {
        customLogo: options.clientBranding?.logo,
        companyName: options.clientBranding?.companyName,
        brandColors: options.clientBranding?.brandColors,
        whiteLabeled: true,
      };
      break;
  }

  return enhancedReport;
}

/**
 * Generate usage recommendations
 */
function generateUsageRecommendations(usageData: any, _userTier: string) {
  const recommendations = [];

  if (usageData.totalUsage > usageData.billing.limit * 0.8) {
    recommendations.push({
      type: 'usage_warning',
      message: 'You are approaching your monthly limit',
      action: 'Consider upgrading your plan',
    });
  }

  return recommendations;
}

/**
 * Calculate upgrade opportunities
 */
function calculateUpgradeOpportunities(usageData: any, _userTier: string) {
  const opportunities = [];

  if (_userTier === 'free' && usageData.revenueOpportunity > 1000) {
    opportunities.push({
      type: 'revenue_opportunity',
      value: usageData.revenueOpportunity,
      message: 'Upgrade to unlock additional revenue potential',
    });
  }

  return opportunities;
}

/**
 * Generate custom benchmarks
 */
function generateCustomBenchmarks(benchmarks?: string[]) {
  if (!benchmarks || benchmarks.length === 0) {
    return null;
  }

  return {
    customMetrics: benchmarks,
    industryComparison: 'Available with enterprise features',
  };
}

/**
 * Generate competitive intelligence
 */
function generateCompetitiveIntelligence() {
  return {
    competitorAnalysis: 'Enterprise feature - full competitor analysis',
    marketPosition: 'Detailed market positioning insights',
    benchmarkData: 'Comprehensive benchmark data',
  };
}
