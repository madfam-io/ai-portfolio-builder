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
 * @fileoverview CORS Middleware for API Routes
 *
 * Simple CORS middleware to handle cross-origin requests
 * in Next.js API routes.
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta
 */

import { NextRequest, NextResponse } from 'next/server';

export interface CORSOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const defaultOptions: CORSOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? [
          'https://prisma-portfolio.vercel.app',
          'https://www.prisma-portfolio.com',
        ]
      : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['X-Total-Count'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * CORS middleware wrapper for API handlers
 */
export function withCORS(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: CORSOptions = {}
) {
  const corsOptions = { ...defaultOptions, ...options };

  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: getCORSHeaders(request, corsOptions),
      });
    }

    // Process the actual request
    const response = await handler(request);

    // Add CORS headers to the response
    const corsHeaders = getCORSHeaders(request, corsOptions);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Generate CORS headers based on request and options
 */
function getCORSHeaders(
  request: NextRequest,
  options: CORSOptions
): Record<string, string> {
  const headers: Record<string, string> = {};
  const origin = request.headers.get('origin');

  // Handle origin
  if (options.origin === true) {
    headers['Access-Control-Allow-Origin'] = origin || '*';
  } else if (typeof options.origin === 'string') {
    headers['Access-Control-Allow-Origin'] = options.origin;
  } else if (Array.isArray(options.origin) && origin) {
    if (options.origin.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  }

  // Handle methods
  if (options.methods) {
    headers['Access-Control-Allow-Methods'] = options.methods.join(', ');
  }

  // Handle allowed headers
  if (options.allowedHeaders) {
    headers['Access-Control-Allow-Headers'] = options.allowedHeaders.join(', ');
  }

  // Handle exposed headers
  if (options.exposedHeaders) {
    headers['Access-Control-Expose-Headers'] =
      options.exposedHeaders.join(', ');
  }

  // Handle credentials
  if (options.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  // Handle max age
  if (options.maxAge) {
    headers['Access-Control-Max-Age'] = options.maxAge.toString();
  }

  // Vary header for proper caching
  headers['Vary'] = 'Origin';

  return headers;
}

/**
 * Simple CORS helper for basic usage
 */
export function corsHeaders(origin?: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}
