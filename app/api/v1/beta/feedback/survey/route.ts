import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { logger } from '@/lib/utils/logger';

/**
 * API endpoint for submitting satisfaction surveys
 */
export async function POST(request: NextRequest) {
  try {
    const surveyData = await request.json();

    // Validate required fields
    const requiredFields = [
      'userId',
      'overallSatisfaction',
      'easeOfUse',
      'performance',
      'features',
      'design',
      'likelihood_to_recommend',
    ];

    for (const field of requiredFields) {
      if (surveyData[field] === undefined || surveyData[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate rating ranges (1-10)
    const ratingFields = [
      'overallSatisfaction',
      'easeOfUse',
      'performance',
      'features',
      'design',
      'likelihood_to_recommend',
    ];

    for (const field of ratingFields) {
      const value = surveyData[field];
      if (typeof value !== 'number' || value < 1 || value > 10) {
        return NextResponse.json(
          { error: `Invalid rating for ${field}: must be between 1-10` },
          { status: 400 }
        );
      }
    }

    // Add server-side metadata
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ip =
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown';

    const enhancedSurvey = {
      ...surveyData,
      id: `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userAgent,
      ip,
      serverMetadata: {
        receivedAt: new Date().toISOString(),
        version: process.env.APP_VERSION || '0.3.0-beta',
        environment: process.env.NODE_ENV || 'development',
      },
    };

    // Calculate NPS category
    const npsScore = enhancedSurvey.likelihood_to_recommend;
    const npsCategory =
      npsScore >= 9 ? 'promoter' : npsScore >= 7 ? 'passive' : 'detractor';

    // Log survey data for analytics
    logger.info('Beta Survey Received', {
      id: enhancedSurvey.id,
      userId: enhancedSurvey.userId,
      overallSatisfaction: enhancedSurvey.overallSatisfaction,
      npsScore,
      npsCategory,
      completedIn: enhancedSurvey.completedIn,
    });

    // TODO: Save to database
    // await saveSurveyToDatabase(enhancedSurvey);

    // TODO: Trigger follow-up actions based on responses
    if (enhancedSurvey.overallSatisfaction <= 5) {
      logger.warn('LOW SATISFACTION ALERT', {
        userId: enhancedSurvey.userId,
        survey: enhancedSurvey,
      });
      // await triggerCustomerSuccessFollow(enhancedSurvey);
    }

    if (npsCategory === 'promoter') {
      logger.info('PROMOTER IDENTIFIED', { userId: enhancedSurvey.userId });
      // await triggerReferralProgram(enhancedSurvey);
    }

    return NextResponse.json({
      success: true,
      id: enhancedSurvey.id,
      npsCategory,
      message: 'Survey submitted successfully',
    });
  } catch (error) {
    logger.error('Error processing survey submission', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve survey analytics
 */
export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30');
    // const limit = parseInt(searchParams.get('limit') || '100');

    // TODO: Implement database queries for survey analytics
    // const surveys = await getSurveysFromDatabase({ userId, days, limit });
    // const analytics = await calculateSurveyAnalytics(surveys);

    // Mock analytics response
    const mockAnalytics = {
      totalResponses: 150,
      averageRatings: {
        overallSatisfaction: 7.8,
        easeOfUse: 8.1,
        performance: 7.5,
        features: 7.9,
        design: 8.3,
        likelihood_to_recommend: 7.2,
      },
      npsBreakdown: {
        promoters: 45, // 9-10
        passives: 75, // 7-8
        detractors: 30, // 1-6
        score: 10, // (45-30)/150 * 100 = 10
      },
      topFeatures: {
        mostUseful: {
          'AI Content Enhancement': 45,
          'Portfolio Editor': 38,
          'Template Selection': 32,
          'Real-time Preview': 25,
          'Publishing System': 10,
        },
        needsImprovement: {
          'Performance Speed': 35,
          'Mobile Responsiveness': 28,
          'Analytics Dashboard': 22,
          'Template Selection': 20,
          'Portfolio Editor': 15,
        },
      },
      missingFeatures: [
        'Custom themes',
        'Video backgrounds',
        'Advanced analytics',
        'Team collaboration',
        'API integrations',
      ],
      timeRange: {
        from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
        days,
      },
    };

    return NextResponse.json(mockAnalytics);
  } catch (error) {
    logger.error('Error fetching survey analytics', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
