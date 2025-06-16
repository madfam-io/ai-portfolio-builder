import { NextRequest, NextResponse } from 'next/server';
import {
  captureServerEvent,
  trackAPIPerformance,
  trackServerError,
} from './server';
import { logger } from '@/lib/utils/logger';

/**
 * PostHog Analytics Middleware
 *
 * Tracks:
 * - API request performance
 * - Error rates
 * - User sessions
 * - Feature usage
 */

async function trackSuccessEvents(
  userId: string,
  endpoint: string,
  method: string
): Promise<void> {
  switch (endpoint) {
    case '/api/v1/portfolios':
      if (method === 'POST') {
        await captureServerEvent(userId, 'api_portfolio_created', {
          endpoint,
          method,
        });
      }
      break;

    case '/api/v1/auth/login':
      await captureServerEvent(userId, 'api_user_logged_in', {
        endpoint,
        method,
      });
      break;

    case '/api/v1/auth/signup':
      await captureServerEvent(userId, 'api_user_signed_up', {
        endpoint,
        method,
      });
      break;
  }
}

async function analyticsMiddleware(
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

    // Track specific API events
    if (response.status >= 200 && response.status < 300) {
      // Success events
      await trackSuccessEvents(userId, endpoint, method);
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

    // Add analytics headers to response
    const headers = new Headers(response.headers);
    headers.set('X-Analytics-Tracked', 'true');
    headers.set('X-Response-Time', `${duration}ms`);

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

// Helper to extract common properties from request
function extractRequestProperties(request: NextRequest): Record<string, any> {
  const headers = request.headers;

  return {
    user_agent: headers.get('user-agent') || 'unknown',
    referer: headers.get('referer') || null,
    ip: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
    country:
      headers.get('cf-ipcountry') || headers.get('x-vercel-ip-country') || null,
    region: headers.get('x-vercel-ip-country-region') || null,
    city: headers.get('x-vercel-ip-city') || null,
    platform: detectPlatform(headers.get('user-agent') || ''),
    bot: isBot(headers.get('user-agent') || ''),
  };
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
