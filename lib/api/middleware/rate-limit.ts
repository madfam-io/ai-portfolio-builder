/**
 * Simple rate limiting middleware - delegates to Redis rate limiter
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit as withRedisRateLimit } from './redis-rate-limiter';

export { withRateLimit } from './redis-rate-limiter';
