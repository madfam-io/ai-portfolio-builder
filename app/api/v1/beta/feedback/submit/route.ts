import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { logger } from '@/lib/utils/logger';

/**
 * API endpoint for submitting beta feedback
 */
export async function POST(request: NextRequest) {
  try {
    const feedbackData = await request.json();

    // Validate required fields
    if (
      !feedbackData.userId ||
      !feedbackData.title ||
      !feedbackData.description ||
      !feedbackData.type
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, description, type' },
        { status: 400 }
      );
    }

    // Add server-side metadata
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ip =
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown';

    const enhancedFeedback = {
      ...feedbackData,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: 'open',
      userAgent,
      ip,
      serverMetadata: {
        receivedAt: new Date().toISOString(),
        version: process.env.APP_VERSION || '0.3.0-beta',
        environment: process.env.NODE_ENV || 'development',
      },
    };

    // In a real implementation, you would save this to a database
    // For now, we'll log it and return success
    logger.info('Beta Feedback Received', {
      id: enhancedFeedback.id,
      type: enhancedFeedback.type,
      severity: enhancedFeedback.severity,
      userId: enhancedFeedback.userId,
      title: enhancedFeedback.title,
    });

    // TODO: Save to database
    // await saveFeedbackToDatabase(enhancedFeedback);

    // TODO: Send notifications for critical issues
    if (enhancedFeedback.severity === 'critical') {
      logger.warn('CRITICAL FEEDBACK ALERT', {
        title: enhancedFeedback.title,
        feedback: enhancedFeedback,
      });
      // await sendCriticalFeedbackAlert(enhancedFeedback);
    }

    return NextResponse.json({
      success: true,
      id: enhancedFeedback.id,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    logger.error('Error processing feedback submission', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve feedback (for admin dashboard)
 */
export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // TODO: Implement database query with filters
    // const feedback = await getFeedbackFromDatabase({ type, severity, status, userId, limit });

    // Mock response for now
    const mockFeedback = [
      {
        id: 'feedback_example_1',
        userId: 'user_123',
        type: 'bug',
        severity: 'medium',
        title: 'Template switching issue',
        description: 'Templates dont switch properly on mobile',
        status: 'open',
        timestamp: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      feedback: mockFeedback,
      total: mockFeedback.length,
      filters: { type, severity, status, userId, limit },
    });
  } catch (error) {
    logger.error('Error fetching feedback', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
