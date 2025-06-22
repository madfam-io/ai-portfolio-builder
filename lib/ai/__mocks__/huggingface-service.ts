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

/**
 * Mock HuggingFace service for testing
 */

export class HuggingFaceService {
  enhanceBio(bio: string, _context: unknown) {
    return {
      content: 'Enhanced bio: ' + bio,
      confidence: 0.85,
      suggestions: ['Add more details', 'Include achievements'],
      wordCount: 50,
      qualityScore: 85,
      enhancementType: 'bio',
    };
  }

  optimizeProjectDescription(
    title: string,
    description: string,
    technologies: string[]
  ) {
    return {
      title: title,
      description: 'Optimized: ' + description,
      technologies: technologies,
      highlights: ['Key achievement 1', 'Key achievement 2'],
      metrics: ['50% performance improvement'],
      starFormat: {
        situation: 'Faced challenge',
        task: 'Needed solution',
        action: 'Built system',
        result: 'Achieved success',
      },
    };
  }

  recommendTemplate(_profile: unknown) {
    return {
      recommendedTemplate: 'developer',
      confidence: 0.9,
      reasoning: 'Based on technical skills',
      alternatives: [
        { template: 'consultant', score: 0.7, reasons: ['Business focus'] },
      ],
    };
  }

  scoreContent(_content: string, _type: string) {
    return {
      overall: 85,
      readability: 90,
      professionalism: 85,
      impact: 80,
      completeness: 85,
      suggestions: ['Add more specifics'],
    };
  }

  getAvailableModels() {
    return [
      {
        id: 'mock-model',
        name: 'Mock Model',
        provider: 'huggingface' as const,
        capabilities: ['bio', 'project', 'template', 'scoring'],
        costPerRequest: 0.001,
        avgResponseTime: 1000,
        qualityRating: 0.85,
        isRecommended: true,
        status: 'active' as const,
      },
    ];
  }

  healthCheck() {
    return true;
  }
}

export const huggingFaceService = new HuggingFaceService();
