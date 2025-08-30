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
import { infrastructure } from '@/lib/adapters/infrastructure-adapter';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Run health checks
    const health = await infrastructure.healthCheck();
    const environmentInfo = infrastructure.getEnvironmentInfo();
    
    const responseTime = Date.now() - startTime;
    
    const response = {
      status: health.overall ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      environment: environmentInfo,
      services: {
        storage: {
          status: health.storage ? 'healthy' : 'unhealthy',
          type: environmentInfo.services.storage,
        },
        cache: {
          status: health.cache ? 'healthy' : 'unhealthy',
          type: environmentInfo.services.cache,
        },
        database: {
          status: health.database ? 'healthy' : 'unhealthy',
          type: environmentInfo.services.database,
        },
        cdn: {
          status: health.cdn ? 'healthy' : 'unhealthy',
          type: environmentInfo.services.cdn,
        },
      },
      version: process.env.npm_package_version || '0.4.5',
      uptime: process.uptime(),
    };

    // Return appropriate HTTP status
    const statusCode = health.overall ? 200 : 503;
    
    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        version: process.env.npm_package_version || '0.4.5',
      },
      { status: 500 }
    );
  }
}

// Also support HEAD requests for load balancers
export async function HEAD(request: NextRequest) {
  try {
    const health = await infrastructure.healthCheck();
    const statusCode = health.overall ? 200 : 503;
    
    return new NextResponse(null, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}