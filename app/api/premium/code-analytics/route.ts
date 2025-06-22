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
import { rateLimit } from '@/lib/api/middleware/rate-limit';
import { trackUsage } from '@/lib/analytics/usage-tracking';

export const dynamic = 'force-dynamic';

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

interface UsageMetrics {
  requestsThisMonth: number;
  remainingCredits: number;
  upgradeRecommended: boolean;
  billingAlert?: string;
}

/**
 * POST /api/premium/code-analytics
 * 
 * Generate comprehensive code quality analytics with business intelligence
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting based on user tier
    const rateLimitResult = await rateLimit(request, {
      free: { requests: 5, windowMs: 60000 }, // 5/minute
      professional: { requests: 50, windowMs: 60000 }, // 50/minute  
      business: { requests: 500, windowMs: 60000 }, // 500/minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          upgradeMessage: 'Upgrade to Business plan for higher limits',
          upgrade_url: '/pricing'
        },
        { status: 429 }
      );
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

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
      clientBranding
    } = requestBody;

    // Check user tier and feature access
    const userTier = user.user_metadata?.plan || 'free';
    const featureAccess = validateFeatureAccess(userTier, analysisType);
    
    if (!featureAccess.allowed) {
      return NextResponse.json({
        error: 'Feature not available in your plan',
        requiredTier: featureAccess.requiredTier,
        upgradeMessage: featureAccess.upgradeMessage,
        revenueOpportunity: featureAccess.revenueOpportunity,
        upgrade_url: '/pricing'
      }, { status: 403 });
    }

    // Track usage for billing and analytics
    const usageMetrics = await trackUsage(user.id, 'code_analytics', {
      analysisType,
      includeCompetitiveIntelligence,
      reportFormat
    });

    // Get code files for analysis
    let analysisFiles: string[] = codeFiles;
    if (portfolioId && codeFiles.length === 0) {
      analysisFiles = await getPortfolioCodeFiles(portfolioId, user.id);
    }

    if (analysisFiles.length === 0) {
      return NextResponse.json({
        error: 'No code files provided for analysis',
        hint: 'Provide either portfolioId or codeFiles array'
      }, { status: 400 });
    }

    // Generate comprehensive analytics report
    const report = await aiCodeQualityEngine.analyzeCodebase(
      analysisFiles,
      userTier,
      true // Include business intelligence
    );

    // Enhance report based on analysis type
    const enhancedReport = await enhanceReportForTier(
      report,
      analysisType,
      {
        includeCompetitiveIntelligence,
        customBenchmarks,
        clientBranding
      }
    );

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
        responseData = await generatePDFReport(enhancedReport, clientBranding);
        break;
      case 'dashboard':
        responseData = await generateDashboardData(enhancedReport);
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
      processingTime: Date.now() - startTime
    });

    const startTime = Date.now();

    return NextResponse.json({
      success: true,
      data: responseData,
      metadata: {
        analysisType,
        reportFormat,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        creditsUsed: 1,
        remainingCredits: usageMetrics.remainingCredits - 1
      },
      upsellOpportunities,
      businessIntelligence: {
        competitiveRanking: report.industryBenchmarks.performancePercentile,
        revenueOpportunity: report.metrics.revenueImpact,
        technicalLeadershipScore: report.businessImpact.competitivePositioning.technicalLeadershipScore,
        acquisitionReadiness: report.businessImpact.competitivePositioning.acquisitionReadiness
      }
    });

  } catch (error) {
    logger.error('Premium analytics API error', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      hint: 'Please try again or contact support for assistance',
      support_url: '/support'
    }, { status: 500 });
  }
}

/**
 * GET /api/premium/code-analytics/usage
 * 
 * Get usage analytics for billing and upselling
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

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
      upgradeOpportunities: calculateUpgradeOpportunities(usageData, userTier)
    });

  } catch (error) {
    logger.error('Usage analytics API error', error);
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
    business: ['basic', 'advanced', 'enterprise', 'white-label']
  };

  const allowed = tierFeatures[userTier as keyof typeof tierFeatures]?.includes(analysisType) || false;

  if (!allowed) {
    const requiredTier = analysisType === 'basic' ? 'free' :
                        analysisType === 'advanced' ? 'professional' : 'business';
    
    const monthlyRevenue = {
      'professional': 29 * 12, // $348/year
      'business': 99 * 12 // $1,188/year
    };

    return {
      allowed: false,
      requiredTier,
      upgradeMessage: `Upgrade to ${requiredTier} plan to access ${analysisType} analytics`,
      revenueOpportunity: monthlyRevenue[requiredTier as keyof typeof monthlyRevenue] || 0
    };
  }

  return { allowed: true };
}

/**
 * Get code files associated with a portfolio
 */
async function getPortfolioCodeFiles(portfolioId: string, userId: string): Promise<string[]> {
  // In production, this would fetch actual code files from the portfolio
  // For now, return mock files for demonstration
  return [
    `portfolio/${portfolioId}/components/showcase.tsx`,
    `portfolio/${portfolioId}/pages/index.tsx`,
    `portfolio/${portfolioId}/styles/globals.css`,
    `portfolio/${portfolioId}/lib/utils.ts`
  ];
}

/**
 * Enhance report based on tier and options
 */
async function enhanceReportForTier(
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
        customBenchmarking: await generateCustomBenchmarks(options.customBenchmarks),
        competitiveIntelligence: options.includeCompetitiveIntelligence ? 
          await generateCompetitiveIntelligence() : null,
        executiveReadyReports: true,
        apiIntegrationSupport: true,
        dedicatedSupport: true
      };
      break;
      
    case 'white-label':
      enhancedReport.brandingOptions = {
        customLogo: options.clientBranding?.logo,
        companyName: options.clientBranding?.companyName,
        brandColors: options.clientBranding?.brandColors,
        whiteLabeled: true
      };
      break;
  }

  return enhancedReport;
}

/**
 * Generate upsell opportunities based on usage and performance
 */
function generateUpsellOpportunities(report: any, userTier: string, usageMetrics: any) {
  const opportunities = [];

  if (userTier === 'free' && report.metrics.performanceScore < 80) {
    opportunities.push({
      type: 'performance_upgrade',
      title: 'Unlock Advanced Performance Optimization',
      description: `Your portfolio has ${(80 - report.metrics.performanceScore).toFixed(1)} points of improvement potential`,
      value: `+$${report.metrics.revenueImpact.toLocaleString()} annual revenue opportunity`,
      action: 'upgrade_to_professional',
      urgency: 'high'
    });
  }

  if (userTier !== 'business' && usageMetrics.requestsThisMonth > 20) {
    opportunities.push({
      type: 'usage_upgrade',
      title: 'You\'re a Power User!',
      description: `You've used ${usageMetrics.requestsThisMonth} analytics requests this month`,
      value: 'Unlimited requests + advanced features',
      action: 'upgrade_to_business',
      urgency: 'medium'
    });
  }

  return opportunities;
}

/**
 * Generate PDF report for enterprise clients
 */
async function generatePDFReport(report: any, branding?: any): Promise<string> {
  // In production, this would generate a professional PDF report
  // For now, return a URL to a generated report
  return '/api/reports/generated-report-12345.pdf';
}

/**
 * Generate dashboard-optimized data
 */
async function generateDashboardData(report: any) {
  return {
    summary: {
      performanceScore: report.metrics.performanceScore,
      revenueImpact: report.metrics.revenueImpact,
      competitiveRanking: report.industryBenchmarks.performancePercentile
    },
    charts: {
      performanceHistory: generatePerformanceHistory(),
      competitiveBenchmarks: generateCompetitiveBenchmarks(),
      optimizationImpact: generateOptimizationImpact(report.recommendations)
    },
    recommendations: report.recommendations.slice(0, 5),
    nextActions: report.nextActions
  };
}

/**
 * Get comprehensive usage analytics for user
 */
async function getUserUsageAnalytics(userId: string, userTier: string): Promise<UsageMetrics> {
  // In production, this would fetch real usage data
  const mockUsage = {
    requestsThisMonth: Math.floor(Math.random() * 50) + 10,
    remainingCredits: userTier === 'business' ? 999999 : 
                     userTier === 'professional' ? 100 : 5,
    upgradeRecommended: false
  };

  mockUsage.upgradeRecommended = mockUsage.requestsThisMonth > 20 && userTier !== 'business';

  return mockUsage;
}

/**
 * Generate usage-based recommendations
 */
function generateUsageRecommendations(usage: UsageMetrics, userTier: string) {
  const recommendations = [];

  if (usage.upgradeRecommended) {
    recommendations.push({
      type: 'upgrade',
      title: 'High Usage Detected',
      message: `You've used ${usage.requestsThisMonth} requests this month. Upgrade for unlimited access.`,
      action: 'upgrade_to_business'
    });
  }

  if (usage.remainingCredits < 5 && userTier !== 'business') {
    recommendations.push({
      type: 'credit_warning',
      title: 'Low Credits Remaining',
      message: `Only ${usage.remainingCredits} credits left this month.`,
      action: 'upgrade_or_wait'
    });
  }

  return recommendations;
}

/**
 * Calculate upgrade revenue opportunities
 */
function calculateUpgradeOpportunities(usage: UsageMetrics, userTier: string) {
  const opportunities = [];

  if (userTier === 'free') {
    opportunities.push({
      tier: 'professional',
      monthlyRevenue: 29,
      annualRevenue: 348,
      features: ['Advanced analytics', '100 requests/month', 'Priority support']
    });
  }

  if (userTier !== 'business') {
    opportunities.push({
      tier: 'business',
      monthlyRevenue: 99,
      annualRevenue: 1188,
      features: ['Unlimited requests', 'White-label reports', 'API access', 'Custom benchmarks']
    });
  }

  return opportunities;
}

/**
 * Helper functions for mock data generation
 */
function generatePerformanceHistory() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    score: Math.random() * 20 + 75
  })).reverse();
}

function generateCompetitiveBenchmarks() {
  return [
    { platform: 'Your Portfolio', score: Math.random() * 15 + 85 },
    { platform: 'Wix', score: 65 },
    { platform: 'Squarespace', score: 72 },
    { platform: 'Webflow', score: 78 },
    { platform: 'GitHub Pages', score: 85 }
  ];
}

function generateOptimizationImpact(recommendations: any[]) {
  return recommendations.slice(0, 5).map(rec => ({
    name: rec.title,
    impact: rec.expectedImpact.performance,
    effort: rec.implementationEffort,
    revenue: rec.expectedImpact.revenue
  }));
}

async function generateCustomBenchmarks(benchmarks: string[] = []) {
  // Generate custom industry benchmarks
  return benchmarks.map(industry => ({
    industry,
    averageScore: Math.random() * 30 + 60,
    topPerformers: Math.random() * 20 + 80,
    marketOpportunity: Math.random() * 100000 + 50000
  }));
}

async function generateCompetitiveIntelligence() {
  return {
    marketPosition: 'Top 15%',
    competitiveThreats: ['New AI-powered platforms', 'Enterprise consolidation'],
    opportunities: ['Mobile optimization gap', 'AI integration advantage'],
    recommendations: ['Invest in mobile performance', 'Leverage AI capabilities']
  };
}