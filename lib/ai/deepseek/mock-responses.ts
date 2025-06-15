/**
 * Mock response generators for DeepSeek development mode
 */

import { DeepSeekResponse } from './types';

/**
 * Get mock response for development
 */
export function getMockResponse(prompt: string): DeepSeekResponse {
  const mockContent = generateMockContent(prompt);

  return {
    choices: [
      {
        message: {
          content: mockContent,
          reasoning:
            'Mock reasoning: This is a development response when DeepSeek API is not configured.',
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: prompt.length / 4,
      completion_tokens: mockContent.length / 4,
      total_tokens: (prompt.length + mockContent.length) / 4,
    },
    model: 'deepseek-reasoner-mock',
  };
}

/**
 * Generate mock content based on prompt type
 */
function generateMockContent(prompt: string): string {
  if (prompt.includes('bio')) {
    return 'Enhanced professional bio with improved clarity, stronger value proposition, and better flow. Highlights key achievements and expertise while maintaining authentic voice.';
  }

  if (prompt.includes('project')) {
    return 'Optimized project description using STAR format:\nSituation: Market need for solution\nTask: Develop comprehensive system\nAction: Implemented using modern technologies\nResult: Achieved measurable business impact';
  }

  if (prompt.includes('template')) {
    return 'Based on analysis of the user profile, I recommend the developer template. This choice aligns with their technical skills and project portfolio.';
  }

  if (prompt.includes('score')) {
    return 'Content Analysis:\nOverall: 85\nReadability: 80\nProfessionalism: 90\nImpact: 75\nCompleteness: 80\n\nSuggestions: Add more specific metrics, strengthen call-to-action';
  }

  return 'Mock DeepSeek response for development purposes.';
}