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
import {
  captureServerEvent,
  trackAPIPerformance,
  trackServerError,
} from './server';
import { logger } from '@/lib/utils/logger';

/**
 * PostHog Analytics Middleware for Business Excellence
 *
 * Comprehensive analytics system for market leadership and thought leadership:
 * - API request performance and optimization
 * - Error rates and system reliability
 * - User sessions and engagement patterns
 * - Feature adoption and premium conversion
 * - 3-minute portfolio completion funnel
 * - Revenue attribution and monetization events
 * - Competitive intelligence and user tier classification
 * - Thought leadership data collection and industry insights
 * - Viral coefficient measurement and growth tracking
 * - Enterprise feature usage and scaling indicators
 * - Market position analysis and differentiation metrics
 */

/**
 * Enhanced success event tracking for business intelligence
 */
async function trackSuccessEvents(
  userId: string,
  endpoint: string,
  method: string,
  duration: number
): Promise<void> {
  const timestamp = Date.now();

  switch (endpoint) {
    case '/api/v1/portfolios':
      if (method === 'POST') {
        await captureServerEvent(userId, 'api_portfolio_created', {
          endpoint,
          method,
          duration_ms: duration,
          timestamp,
          funnel_step: 'portfolio_creation',
          under_3_minutes_target: duration < 180000, // 3 minutes
        });

        // Track 3-minute funnel milestone
        await captureServerEvent(userId, 'three_minute_funnel_milestone', {
          milestone: 'portfolio_created',
          elapsed_time: duration,
          on_track: duration < 120000, // 2 minutes buffer
        });
      }
      break;

    case '/api/v1/portfolios/publish':
      await captureServerEvent(userId, 'api_portfolio_published', {
        endpoint,
        method,
        duration_ms: duration,
        timestamp,
        funnel_step: 'portfolio_published',
        potential_revenue_event: true, // Track for monetization analysis
      });
      break;

    case '/api/v1/ai/enhance-bio':
    case '/api/v1/ai/optimize-project':
      await captureServerEvent(userId, 'api_ai_enhancement_used', {
        endpoint,
        method,
        duration_ms: duration,
        ai_feature: endpoint.includes('bio')
          ? 'bio_enhancement'
          : 'project_optimization',
        upgrade_indicator: true, // Users who use AI features more likely to upgrade
      });
      break;

    case '/api/v1/auth/login':
      await captureServerEvent(userId, 'api_user_logged_in', {
        endpoint,
        method,
        duration_ms: duration,
        retention_indicator: true,
      });
      break;

    case '/api/v1/auth/signup':
      await captureServerEvent(userId, 'api_user_signed_up', {
        endpoint,
        method,
        duration_ms: duration,
        acquisition_timestamp: timestamp,
        conversion_funnel_start: true,
      });
      break;

    case '/api/v1/integrations/linkedin/connect':
    case '/api/v1/integrations/github/connect':
      await captureServerEvent(userId, 'api_integration_connected', {
        endpoint,
        method,
        integration_type: endpoint.includes('linkedin') ? 'linkedin' : 'github',
        advanced_user_indicator: true, // Users who connect integrations are more engaged
      });
      break;
  }
}

export async function analyticsMiddleware(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  // Skip analytics for non-API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return response;
  }

  // Skip analytics for health checks and internal endpoints
  if (
    request.nextUrl.pathname === '/api/health' ||
    request.nextUrl.pathname.includes('/_next/')
  ) {
    return response;
  }

  const startTime = Date.now();
  const method = request.method;
  const endpoint = request.nextUrl.pathname;

  // Track session start time for 3-minute funnel analysis
  const sessionStartHeader = request.headers.get('x-session-start');
  const sessionStartTime = sessionStartHeader
    ? parseInt(sessionStartHeader)
    : startTime;

  // Extract user ID from auth header or session
  let userId = 'anonymous';
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract user ID from JWT token
      // This is a placeholder - implement based on your auth system
      // userId = await getUserIdFromToken(authHeader.substring(7));
    }
  } catch (error) {
    logger.error('Failed to extract user ID for analytics', { error });
  }

  try {
    // Track API request
    const duration = Date.now() - startTime;
    await trackAPIPerformance(userId, {
      endpoint,
      method,
      statusCode: response.status,
      duration,
    });

    // Track specific API events with enhanced business intelligence
    if (response.status >= 200 && response.status < 300) {
      // Success events with duration and business metrics
      await trackSuccessEvents(userId, endpoint, method, duration);

      // Track revenue indicators
      await trackRevenueIndicators(userId, endpoint, method, duration);

      // Track user success prediction metrics
      await trackUserSuccessMetrics(userId, endpoint, duration);

      // Track 3-minute funnel progress
      await trackThreeMinuteFunnel(userId, endpoint, sessionStartTime);

      // === BUSINESS EXCELLENCE ANALYTICS ===

      // Extract request properties for comprehensive analysis
      const requestProperties = extractRequestProperties(request);

      // User success scoring and tier classification for monetization
      await trackUserSuccessScoring(
        userId,
        endpoint,
        duration,
        request.headers.get('user-agent') || ''
      );

      // Viral coefficient and growth tracking for market domination
      await trackViralMetrics(
        userId,
        endpoint,
        request.headers.get('user-agent') || '',
        request.headers.get('referer')
      );

      // Competitive intelligence and market position analysis
      await trackCompetitiveIntelligence(
        userId,
        endpoint,
        duration,
        request.headers.get('user-agent') || ''
      );

      // Thought leadership data collection for industry authority
      await trackThoughtLeadershipData(
        userId,
        endpoint,
        duration,
        requestProperties
      );
    } else if (response.status >= 400) {
      // Error tracking
      await trackServerError(
        userId,
        new Error(`API Error: ${response.status} ${response.statusText}`),
        {
          endpoint,
          method,
          status_code: response.status,
          duration_ms: duration,
        }
      );
    }

    // Add analytics headers to response including business intelligence
    const headers = new Headers(response.headers);
    headers.set('X-Analytics-Tracked', 'true');
    headers.set('X-Response-Time', `${duration}ms`);
    headers.set('X-Session-Start', sessionStartTime.toString());

    // Add competitive intelligence headers
    if (duration < 500) headers.set('X-Performance-Tier', 'excellent');
    else if (duration < 1000) headers.set('X-Performance-Tier', 'good');
    else headers.set('X-Performance-Tier', 'needs-optimization');

    return NextResponse.next({
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    logger.error('Analytics middleware error', { error });
    // Don't fail the request if analytics fails
    return response;
  }
}

/**
 * Track revenue indicators for business intelligence
 */
async function trackRevenueIndicators(
  userId: string,
  endpoint: string,
  method: string,
  duration: number
): Promise<void> {
  const revenueEvents = {
    '/api/v1/portfolios/publish': 'portfolio_published_revenue_event',
    '/api/v1/ai/enhance-bio': 'ai_usage_upgrade_indicator',
    '/api/v1/ai/optimize-project': 'ai_usage_upgrade_indicator',
    '/api/v1/portfolios/analytics': 'analytics_usage_upgrade_indicator',
    '/api/v1/portfolios/export': 'export_usage_upgrade_indicator',
  };

  const eventName = revenueEvents[endpoint as keyof typeof revenueEvents];
  if (eventName) {
    await captureServerEvent(userId, eventName, {
      endpoint,
      method,
      duration_ms: duration,
      monetization_signal: true,
      timestamp: Date.now(),
    });
  }
}

/**
 * Track user success prediction metrics
 */
async function trackUserSuccessMetrics(
  userId: string,
  endpoint: string,
  duration: number
): Promise<void> {
  // Track completion speed for 3-minute challenge
  if (endpoint === '/api/v1/portfolios/publish') {
    const completionTime = duration;
    const isUnder3Minutes = completionTime < 180000; // 3 minutes
    const isUnder2Minutes = completionTime < 120000; // 2 minutes

    await captureServerEvent(userId, 'portfolio_completion_speed', {
      completion_time_ms: completionTime,
      under_3_minutes: isUnder3Minutes,
      under_2_minutes: isUnder2Minutes,
      speed_tier: isUnder2Minutes
        ? 'champion'
        : isUnder3Minutes
          ? 'success'
          : 'needs_optimization',
      thought_leadership_data: {
        industry_benchmark: true,
        anonymous_timing: completionTime,
      },
    });
  }

  // Track feature adoption patterns
  const featureAdoptionScore = {
    '/api/v1/ai/enhance-bio': 10,
    '/api/v1/ai/optimize-project': 10,
    '/api/v1/integrations/linkedin/connect': 15,
    '/api/v1/integrations/github/connect': 15,
    '/api/v1/portfolios/analytics': 8,
    '/api/v1/portfolios/export': 5,
  };

  const adoptionScore =
    featureAdoptionScore[endpoint as keyof typeof featureAdoptionScore];
  if (adoptionScore) {
    await captureServerEvent(userId, 'feature_adoption_score', {
      endpoint,
      adoption_score: adoptionScore,
      power_user_indicator: adoptionScore >= 10,
    });
  }
}

/**
 * Track 3-minute funnel progress for real-time optimization
 */
async function trackThreeMinuteFunnel(
  userId: string,
  endpoint: string,
  startTime: number
): Promise<void> {
  const funnelSteps = {
    '/api/v1/auth/signup': { step: 1, name: 'signup_complete' },
    '/api/v1/portfolios': { step: 2, name: 'portfolio_created' },
    '/api/v1/ai/enhance-bio': { step: 3, name: 'ai_enhancement' },
    '/api/v1/portfolios/publish': { step: 4, name: 'portfolio_published' },
  };

  const funnelStep = funnelSteps[endpoint as keyof typeof funnelSteps];
  if (funnelStep) {
    const elapsedTime = Date.now() - startTime;
    const isOnTrack = elapsedTime < funnelStep.step * 45000; // 45 seconds per step

    await captureServerEvent(userId, 'three_minute_funnel_progress', {
      funnel_step: funnelStep.step,
      step_name: funnelStep.name,
      elapsed_time_ms: elapsedTime,
      on_track_for_3_minutes: isOnTrack,
      predicted_completion_time: (elapsedTime / funnelStep.step) * 4,
    });
  }
}

// Helper to extract common properties from request
export function extractRequestProperties(
  request: NextRequest
): Record<string, unknown> {
  const headers = request.headers;
  const userAgent = headers.get('user-agent') || 'unknown';
  const referer = headers.get('referer') || null;

  // Enhanced business intelligence properties
  const properties = {
    user_agent: userAgent,
    referer,
    ip: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
    country:
      headers.get('cf-ipcountry') || headers.get('x-vercel-ip-country') || null,
    region: headers.get('x-vercel-ip-country-region') || null,
    city: headers.get('x-vercel-ip-city') || null,
    platform: detectPlatform(userAgent),
    bot: isBot(userAgent),

    // Business intelligence enhancements
    device_type: getDeviceType(userAgent),
    browser: getBrowser(userAgent),
    traffic_source: getTrafficSource(referer),
    potential_market: getPotentialMarket(
      headers.get('cf-ipcountry') || headers.get('x-vercel-ip-country')
    ),
    session_quality: getSessionQuality(userAgent, referer),

    // Thought leadership data (anonymous)
    anonymous_session_data: {
      timestamp: Date.now(),
      platform_category: detectPlatform(userAgent),
      geographic_region: headers.get('x-vercel-ip-country-region') || 'unknown',
    },
  };

  return properties;
}

// Detect platform from user agent
function detectPlatform(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/windows/.test(ua)) return 'windows';
  if (/mac/.test(ua)) return 'macos';
  if (/linux/.test(ua)) return 'linux';

  return 'unknown';
}

// Check if request is from a bot
function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const botPatterns = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'facebookexternalhit',
    'whatsapp',
    'slack',
    'twitter',
    'linkedin',
  ];

  return botPatterns.some(pattern => ua.includes(pattern));
}

// Enhanced business intelligence helper functions
function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile';
  if (/tablet|ipad/.test(ua)) return 'tablet';
  return 'desktop';
}

function getBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('chrome')) return 'chrome';
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('safari')) return 'safari';
  if (ua.includes('edge')) return 'edge';
  return 'other';
}

function getTrafficSource(referer: string | null): string {
  if (!referer) return 'direct';

  const ref = referer.toLowerCase();
  if (ref.includes('google')) return 'google';
  if (ref.includes('linkedin')) return 'linkedin';
  if (ref.includes('twitter')) return 'twitter';
  if (ref.includes('facebook')) return 'facebook';
  if (ref.includes('github')) return 'github';

  return 'referral';
}

function getPotentialMarket(country: string | null): string {
  if (!country) return 'unknown';

  const spanishMarkets = [
    'MX',
    'ES',
    'AR',
    'CO',
    'PE',
    'VE',
    'CL',
    'EC',
    'GT',
    'CU',
  ];
  const englishMarkets = ['US', 'CA', 'GB', 'AU', 'NZ', 'IE'];
  const emergingMarkets = ['BR', 'IN', 'ID', 'PH', 'TH', 'VN', 'MY'];

  if (spanishMarkets.includes(country)) return 'spanish_primary';
  if (englishMarkets.includes(country)) return 'english_primary';
  if (emergingMarkets.includes(country)) return 'emerging_market';

  return 'international';
}

function getSessionQuality(
  userAgent: string,
  referer: string | null
): 'high' | 'medium' | 'low' {
  let score = 0;

  // Quality indicators
  if (referer && !referer.includes('localhost')) score += 2;
  if (!isBot(userAgent)) score += 2;
  if (getDeviceType(userAgent) === 'desktop') score += 1;
  if (getBrowser(userAgent) === 'chrome') score += 1;

  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

/**
 * Business Excellence Analytics - User Success Scoring and Tier Classification
 */
async function trackUserSuccessScoring(
  userId: string,
  endpoint: string,
  duration: number,
  _userAgent: string
): Promise<void> {
  const userTier = calculateUserTier(endpoint, duration);
  const successScore = calculateUserSuccessScore(endpoint, duration);
  const revenuePotetial = calculateRevenuePotetial(endpoint, userTier);

  await captureServerEvent(userId, 'business_user_success_scoring', {
    endpoint,
    user_tier: userTier,
    success_score: successScore,
    revenue_potetial: revenuePotetial,
    business_metrics: {
      market_position: getMarketPosition(successScore),
      upgrade_likelihood: getUpgradeLikelihood(userTier, successScore),
      viral_potetial: getViralPotetial(userTier, endpoint),
      thought_leadership_value: getThoughtLeadershipValue(endpoint, duration),
    },
    timestamp: Date.now(),
  });
}

/**
 * Calculate user tier based on behavior patterns for business excellence
 */
function calculateUserTier(endpoint: string, duration: number): string {
  let score = 0;

  // Speed tier (competitive advantage)
  if (duration < 60000)
    score += 3; // Under 1 minute = power user
  else if (duration < 180000)
    score += 2; // Under 3 minutes = target user
  else if (duration < 300000) score += 1; // Under 5 minutes = acceptable

  // Feature sophistication
  if (endpoint.includes('/ai/')) score += 2; // AI usage = advanced user
  if (endpoint.includes('/integrations/')) score += 2; // Integration usage = power user
  if (endpoint.includes('/analytics')) score += 1; // Analytics user = engaged
  if (endpoint.includes('/export')) score += 1; // Export user = serious

  // Business tier classification
  if (score >= 7) return 'business_champion'; // Top 5% - future enterprise customers
  if (score >= 5) return 'market_leader'; // Top 20% - premium customers
  if (score >= 3) return 'power_user'; // Top 40% - conversion targets
  if (score >= 1) return 'engaged_user'; // Top 70% - nurture for upgrade
  return 'casual_user'; // Bottom 30% - free tier focus
}

/**
 * Calculate user success score for competitive intelligence
 */
function calculateUserSuccessScore(endpoint: string, duration: number): number {
  let score = 100; // Base score

  // Speed performance (critical for 3-minute positioning)
  if (duration < 30000)
    score += 50; // Lightning fast = 150
  else if (duration < 60000)
    score += 30; // Fast = 130
  else if (duration < 120000)
    score += 20; // Good = 120
  else if (duration < 180000)
    score += 10; // Acceptable = 110
  else score -= 20; // Slow = 80

  // Feature depth utilization
  const advancedEndpoints = ['/ai/', '/integrations/', '/analytics', '/export'];
  const isAdvanced = advancedEndpoints.some(advanced =>
    endpoint.includes(advanced)
  );
  if (isAdvanced) score += 25;

  // Portfolio completion indicators
  if (endpoint.includes('/publish')) score += 40; // Completion = high success
  if (endpoint.includes('/portfolios') && endpoint.includes('POST'))
    score += 30;

  return Math.min(200, Math.max(0, score)); // Cap between 0-200
}

/**
 * Calculate revenue potetial for business intelligence
 */
function calculateRevenuePotetial(endpoint: string, userTier: string): number {
  let monthlyRevenue = 0;

  // Base revenue by tier
  const tierRevenue = {
    empire_champion: 499, // Enterprise tier
    market_leader: 99, // Business tier
    power_user: 29, // Professional tier
    engaged_user: 9, // Starter tier
    casual_user: 0, // Free tier
  };

  monthlyRevenue = tierRevenue[userTier as keyof typeof tierRevenue] || 0;

  // Premium feature usage multipliers
  if (endpoint.includes('/ai/')) monthlyRevenue *= 1.5; // AI users pay more
  if (endpoint.includes('/integrations/')) monthlyRevenue *= 1.3; // Integration premium
  if (endpoint.includes('/analytics')) monthlyRevenue *= 1.2; // Analytics premium
  if (endpoint.includes('/export')) monthlyRevenue *= 1.1; // Export value-add

  return Math.round(monthlyRevenue);
}

/**
 * Business Excellence - Viral Coefficient and Growth Tracking
 */
async function trackViralMetrics(
  userId: string,
  endpoint: string,
  userAgent: string,
  referer: string | null
): Promise<void> {
  const viralSignal = detectViralSignal(endpoint, referer);
  const sharePotetial = calculateSharePotetial(endpoint);
  const networkEffect = calculateNetworkEffect(endpoint, userAgent);

  if (viralSignal.isViral || sharePotetial > 0) {
    await captureServerEvent(userId, 'business_viral_tracking', {
      endpoint,
      viral_signal: viralSignal,
      share_potetial: sharePotetial,
      network_effect: networkEffect,
      business_growth: {
        referral_quality: viralSignal.referralQuality,
        organic_reach: viralSignal.organicReach,
        social_proof_value: getSocialProofValue(endpoint),
        word_of_mouth_trigger: getWordOfMouthTrigger(endpoint),
      },
      timestamp: Date.now(),
    });
  }
}

/**
 * Detect viral signals for growth hacking
 */
function detectViralSignal(
  endpoint: string,
  referer: string | null
): {
  isViral: boolean;
  referralQuality: string;
  organicReach: number;
  source: string;
} {
  const viralEndpoints = [
    '/portfolios/share',
    '/portfolios/preview',
    '/api/v1/portfolios/public',
  ];

  const isViral = viralEndpoints.some(viral => endpoint.includes(viral));
  let referralQuality = 'unknown';
  let organicReach = 0;

  if (referer) {
    const ref = referer.toLowerCase();
    if (ref.includes('linkedin')) {
      referralQuality = 'high'; // Professional network
      organicReach = 75;
    } else if (ref.includes('twitter')) {
      referralQuality = 'medium'; // Social amplification
      organicReach = 50;
    } else if (ref.includes('github')) {
      referralQuality = 'high'; // Developer community
      organicReach = 60;
    } else if (ref.includes('google')) {
      referralQuality = 'medium'; // Search discovery
      organicReach = 40;
    } else {
      referralQuality = 'low'; // Direct or unknown
      organicReach = 25;
    }
  }

  return {
    isViral,
    referralQuality,
    organicReach,
    source: referer || 'direct',
  };
}

/**
 * Business Excellence - Competitive Intelligence and Market Position
 */
async function trackCompetitiveIntelligence(
  userId: string,
  endpoint: string,
  duration: number,
  userAgent: string
): Promise<void> {
  const competitiveMetrics = calculateCompetitiveMetrics(duration, endpoint);
  const marketPosition = analyzeMarketPosition(duration, endpoint);
  const differentiationScore = calculateDifferentiationScore(
    endpoint,
    duration
  );

  await captureServerEvent(userId, 'business_competitive_intelligence', {
    endpoint,
    competitive_metrics: competitiveMetrics,
    market_position: marketPosition,
    differentiation_score: differentiationScore,
    business_advantages: {
      speed_advantage: getSpeedAdvantage(duration),
      feature_advantage: getFeatureAdvantage(endpoint),
      ux_advantage: getUXAdvantage(duration, userAgent),
      ai_advantage: getAIAdvantage(endpoint),
    },
    thought_leadership_data: {
      industry_benchmark: true,
      anonymous_performance: duration,
      feature_adoption_rate: getFeatureAdoptionRate(endpoint),
      user_success_pattern: getUserSuccessPattern(duration, endpoint),
    },
    timestamp: Date.now(),
  });
}

/**
 * Calculate competitive metrics for market intelligence
 */
function calculateCompetitiveMetrics(
  duration: number,
  endpoint: string
): {
  vs_traditional_methods: string;
  vs_competitors: string;
  market_leadership_score: number;
} {
  let marketLeadershipScore = 100;

  // Speed competitive advantage
  if (duration < 180000) {
    // Under 3 minutes
    marketLeadershipScore += 50; // Massive advantage
  } else if (duration < 300000) {
    // Under 5 minutes
    marketLeadershipScore += 25; // Good advantage
  }

  // Feature sophistication advantage
  if (endpoint.includes('/ai/')) marketLeadershipScore += 30; // AI differentiation
  if (endpoint.includes('/integrations/')) marketLeadershipScore += 20; // Integration depth

  return {
    vs_traditional_methods: duration < 900000 ? '20x_faster' : '10x_faster', // vs 30min manual
    vs_competitors: duration < 300000 ? '2x_faster' : 'competitive', // vs 5min competitors
    market_leadership_score: Math.min(200, marketLeadershipScore),
  };
}

/**
 * Business Excellence - Thought Leadership Data Collection
 */
async function trackThoughtLeadershipData(
  userId: string,
  endpoint: string,
  duration: number,
  requestProperties: Record<string, unknown>
): Promise<void> {
  const industryInsights = generateIndustryInsights(
    endpoint,
    duration,
    requestProperties
  );
  const benchmarkData = createBenchmarkData(duration, endpoint);
  const trendAnalysis = analyzeTrends(endpoint, requestProperties);

  await captureServerEvent(userId, 'business_thought_leadership', {
    endpoint,
    industry_insights: industryInsights,
    benchmark_data: benchmarkData,
    trend_analysis: trendAnalysis,
    content_opportunities: {
      blog_post_angle: getBlogPostAngle(endpoint, duration),
      case_study_value: getCaseStudyValue(endpoint, duration),
      speaking_opportunity: getSpeakingOpportunity(endpoint),
      research_value: getResearchValue(endpoint, duration),
    },
    anonymous_aggregation: {
      performance_tier: getPerformanceTier(duration),
      feature_usage_pattern: getFeaturePattern(endpoint),
      geographic_region: requestProperties.region || 'unknown',
      industry_category: getIndustryCategory(endpoint),
    },
    timestamp: Date.now(),
  });
}

// Helper functions for empire building analytics
function getMarketPosition(successScore: number): string {
  if (successScore >= 150) return 'industry_leader';
  if (successScore >= 120) return 'market_leader';
  if (successScore >= 100) return 'competitive';
  return 'needs_improvement';
}

function getUpgradeLikelihood(userTier: string, successScore: number): number {
  const tierMultiplier = {
    business_champion: 0.95,
    market_leader: 0.8,
    power_user: 0.6,
    engaged_user: 0.3,
    casual_user: 0.1,
  };

  const baseChance =
    tierMultiplier[userTier as keyof typeof tierMultiplier] || 0.05;
  const scoreMultiplier =
    successScore > 120 ? 1.2 : successScore > 100 ? 1.0 : 0.8;

  return Math.min(0.95, baseChance * scoreMultiplier);
}

function getViralPotetial(userTier: string, endpoint: string): number {
  let potetial = 0;

  // Base viral potetial by tier
  const tierViral = {
    business_champion: 0.8,
    market_leader: 0.6,
    power_user: 0.4,
    engaged_user: 0.2,
    casual_user: 0.1,
  };

  potetial = tierViral[userTier as keyof typeof tierViral] || 0.05;

  // Amplify for shareable endpoints
  if (endpoint.includes('/publish') || endpoint.includes('/share')) {
    potetial *= 1.5;
  }

  return Math.min(1.0, potetial);
}

function getThoughtLeadershipValue(endpoint: string, duration: number): number {
  let value = 0;

  // High-value endpoints for thought leadership
  if (endpoint.includes('/ai/')) value += 50; // AI innovation stories
  if (endpoint.includes('/publish')) value += 40; // Success stories
  if (endpoint.includes('/integrations/')) value += 30; // Technical stories
  if (duration < 180000) value += 30; // Speed stories

  return value;
}

function calculateSharePotetial(endpoint: string): number {
  const shareableEndpoints = {
    '/portfolios/publish': 90, // High share after publish
    '/portfolios/preview': 70, // Share for feedback
    '/api/v1/ai/enhance-bio': 60, // AI results
    '/api/v1/templates': 40, // Template selection
  };

  for (const [path, potetial] of Object.entries(shareableEndpoints)) {
    if (endpoint.includes(path)) return potetial;
  }

  return 0;
}

function calculateNetworkEffect(endpoint: string, userAgent: string): number {
  let effect = 0;

  // Platform network effects
  if (endpoint.includes('/integrations/linkedin')) effect += 40;
  if (endpoint.includes('/integrations/github')) effect += 30;
  if (endpoint.includes('/share')) effect += 50;

  // Mobile users share more
  if (userAgent.toLowerCase().includes('mobile')) effect *= 1.2;

  return Math.min(100, effect);
}

function getSocialProofValue(endpoint: string): number {
  if (endpoint.includes('/publish')) return 80; // Published portfolio = social proof
  if (endpoint.includes('/ai/')) return 60; // AI-enhanced = innovation proof
  if (endpoint.includes('/integrations/')) return 50; // Integrations = sophistication proof
  return 20;
}

function getWordOfMouthTrigger(endpoint: string): string {
  if (endpoint.includes('/publish')) return 'portfolio_completion_wow';
  if (endpoint.includes('/ai/enhance-bio')) return 'ai_enhancement_surprise';
  if (endpoint.includes('/templates')) return 'design_quality_impression';
  return 'none';
}

function getSpeedAdvantage(duration: number): string {
  if (duration < 60000) return 'lightning_fast'; // Under 1 min
  if (duration < 180000) return 'revolutionary'; // Under 3 min (our target)
  if (duration < 300000) return 'fast'; // Under 5 min
  return 'acceptable';
}

function getFeatureAdvantage(endpoint: string): string {
  if (endpoint.includes('/ai/')) return 'ai_powered';
  if (endpoint.includes('/integrations/')) return 'integration_rich';
  if (endpoint.includes('/analytics')) return 'data_driven';
  return 'standard';
}

function getUXAdvantage(duration: number, _userAgent: string): string {
  const _isMobile = _userAgent.toLowerCase().includes('mobile');

  if (duration < 120000) return 'exceptional'; // Under 2 min = exceptional UX
  if (duration < 180000) return 'excellent'; // Under 3 min = excellent UX
  if (duration < 300000) return 'good'; // Under 5 min = good UX
  return 'standard';
}

function getAIAdvantage(endpoint: string): string {
  if (endpoint.includes('/ai/enhance-bio')) return 'bio_optimization';
  if (endpoint.includes('/ai/optimize-project')) return 'project_optimization';
  if (endpoint.includes('/ai/recommend-template'))
    return 'smart_recommendations';
  return 'none';
}

function analyzeMarketPosition(
  duration: number,
  endpoint: string
): {
  positioning: string;
  competitive_moat: string;
  differentiation: string;
} {
  return {
    positioning: duration < 180000 ? 'market_leader' : 'competitive',
    competitive_moat: endpoint.includes('/ai/')
      ? 'ai_technology'
      : 'speed_execution',
    differentiation:
      getAIAdvantage(endpoint) !== 'none'
        ? 'ai_powered_portfolios'
        : 'fast_execution',
  };
}

function calculateDifferentiationScore(
  endpoint: string,
  duration: number
): number {
  let score = 50; // Base differentiation

  // Speed differentiation (our key advantage)
  if (duration < 180000) score += 40;

  // AI differentiation
  if (endpoint.includes('/ai/')) score += 30;

  // Integration differentiation
  if (endpoint.includes('/integrations/')) score += 20;

  return Math.min(100, score);
}

function generateIndustryInsights(
  endpoint: string,
  duration: number,
  requestProperties: Record<string, unknown>
): Record<string, unknown> {
  return {
    speed_benchmark: duration,
    feature_utilization: endpoint.includes('/ai/') ? 'advanced' : 'standard',
    geographic_pattern: requestProperties.country || 'unknown',
    device_preference: requestProperties.device_type || 'unknown',
    peak_usage_indicator: Date.now(),
  };
}

function createBenchmarkData(
  duration: number,
  endpoint: string
): Record<string, unknown> {
  return {
    completion_speed: duration,
    feature_depth: endpoint.includes('/ai/') ? 'advanced' : 'basic',
    success_probability: duration < 180000 ? 0.9 : 0.7,
    user_satisfaction_prediction: duration < 120000 ? 'high' : 'medium',
  };
}

function analyzeTrends(
  endpoint: string,
  requestProperties: Record<string, unknown>
): Record<string, unknown> {
  return {
    popular_features: endpoint.includes('/ai/')
      ? ['ai_enhancement']
      : ['basic_portfolio'],
    geographic_adoption: requestProperties.country || 'unknown',
    time_of_day_pattern: new Date().getHours(),
    device_trend: requestProperties.device_type || 'unknown',
  };
}

function getBlogPostAngle(endpoint: string, duration: number): string {
  if (duration < 180000 && endpoint.includes('/publish')) {
    return '3_minute_portfolio_success_story';
  }
  if (endpoint.includes('/ai/')) {
    return 'ai_portfolio_optimization_case_study';
  }
  return 'portfolio_creation_insights';
}

function getCaseStudyValue(endpoint: string, duration: number): number {
  let value = 0;
  if (duration < 180000) value += 50; // Speed success story
  if (endpoint.includes('/ai/')) value += 40; // AI innovation story
  if (endpoint.includes('/integrations/')) value += 30; // Integration story
  return value;
}

function getSpeakingOpportunity(endpoint: string): string {
  if (endpoint.includes('/ai/')) return 'ai_in_career_development';
  if (endpoint.includes('/integrations/')) return 'api_ecosystem_building';
  return 'portfolio_creation_innovation';
}

function getResearchValue(endpoint: string, duration: number): number {
  let value = 0;
  if (duration < 180000) value += 40; // Speed research
  if (endpoint.includes('/ai/')) value += 60; // AI research
  return value;
}

function getPerformanceTier(duration: number): string {
  if (duration < 60000) return 'tier_1_lightning';
  if (duration < 180000) return 'tier_2_fast';
  if (duration < 300000) return 'tier_3_acceptable';
  return 'tier_4_slow';
}

function getFeaturePattern(endpoint: string): string {
  if (endpoint.includes('/ai/')) return 'ai_user';
  if (endpoint.includes('/integrations/')) return 'integration_user';
  if (endpoint.includes('/analytics')) return 'analytics_user';
  return 'basic_user';
}

function getIndustryCategory(endpoint: string): string {
  // This could be enhanced with user profile analysis
  if (endpoint.includes('/integrations/github')) return 'technology';
  if (endpoint.includes('/integrations/linkedin')) return 'business';
  return 'general';
}

function getFeatureAdoptionRate(endpoint: string): number {
  // Mock adoption rates - would be calculated from real data
  const adoptionRates = {
    '/ai/': 0.65, // 65% of users use AI features
    '/integrations/': 0.45, // 45% use integrations
    '/analytics': 0.25, // 25% use analytics
    '/export': 0.35, // 35% export portfolios
  };

  for (const [path, rate] of Object.entries(adoptionRates)) {
    if (endpoint.includes(path)) return rate;
  }

  return 0.8; // Basic portfolio creation
}

function getUserSuccessPattern(duration: number, endpoint: string): string {
  if (duration < 180000 && endpoint.includes('/publish'))
    return 'speed_success';
  if (endpoint.includes('/ai/') && duration < 300000)
    return 'ai_assisted_success';
  if (endpoint.includes('/integrations/')) return 'integration_success';
  return 'standard_success';
}
