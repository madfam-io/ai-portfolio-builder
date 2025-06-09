/**
 * AI Models API Route
 * Manages available AI models and user preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HuggingFaceService } from '@/lib/ai/huggingface-service';

/**
 * Get available AI models with live updates
 */
export async function GET() {
  try {
    // Initialize AI service
    const aiService = new HuggingFaceService();

    // Get available models with live metrics
    const availableModels = await aiService.getAvailableModels();

    return NextResponse.json({
      success: true,
      data: {
        models: availableModels,
        lastUpdated: new Date().toISOString(),
        totalModels: availableModels.length,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch available models:', error);

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
