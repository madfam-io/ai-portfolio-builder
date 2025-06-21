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

import { NextResponse } from 'next/server';

import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import {
  withCacheHeaders,
  CACHE_CONFIGS,
  generateETag,
} from '@/lib/cache/cache-headers';
import { logger } from '@/lib/utils/logger';

/**
 * AI Models API Route
 * Manages available AI models and user preferences
 */

/**
 * Get available AI models with live updates
 */
export async function GET(): Promise<Response> {
  try {
    // Initialize AI service
    const aiService = new HuggingFaceService();

    // Get available models with live metrics
    const availableModels = await aiService.getAvailableModels();

    const responseData = {
      success: true,
      data: {
        models: availableModels,
        lastUpdated: new Date().toISOString(),
        totalModels: availableModels.length,
      },
    };

    // Create response with caching headers
    const response = NextResponse.json(responseData);

    // Apply AI models caching strategy
    return withCacheHeaders(response, {
      ...CACHE_CONFIGS.aiModels,
      etag: generateETag(responseData),
    });
  } catch (error: unknown) {
    logger.error(
      'Failed to fetch available models',
      error instanceof Error ? error : { error }
    );

    // Return cached models as fallback
    const fallbackModels = [
      {
        id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        name: 'Llama 3.1 8B Instruct',
        provider: 'huggingface',
        capabilities: ['bio', 'project', 'template'],
        costPerRequest: 0.0003,
        avgResponseTime: 2500,
        qualityRating: 0.92,
        isRecommended: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'microsoft/Phi-3.5-mini-instruct',
        name: 'Phi-3.5 Mini Instruct',
        provider: 'huggingface',
        capabilities: ['bio', 'project'],
        costPerRequest: 0.0001,
        avgResponseTime: 1800,
        qualityRating: 0.87,
        isRecommended: true,
        lastUpdated: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        models: fallbackModels,
        lastUpdated: new Date().toISOString(),
        totalModels: fallbackModels.length,
        fallback: true,
      },
    });
  }
}
