/**
 * Mock HuggingFace service for testing
 */

export class HuggingFaceService {
  async enhanceBio(bio: string, context: any) {
    return {
      content: 'Enhanced bio: ' + bio,
      confidence: 0.85,
      suggestions: ['Add more details', 'Include achievements'],
      wordCount: 50,
      qualityScore: 85,
      enhancementType: 'bio',
    };
  }

  async optimizeProjectDescription(
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

  async recommendTemplate(profile: any) {
    return {
      recommendedTemplate: 'developer',
      confidence: 0.9,
      reasoning: 'Based on technical skills',
      alternatives: [
        { template: 'consultant', score: 0.7, reasons: ['Business focus'] },
      ],
    };
  }

  async scoreContent(content: string, type: string) {
    return {
      overall: 85,
      readability: 90,
      professionalism: 85,
      impact: 80,
      completeness: 85,
      suggestions: ['Add more specifics'],
    };
  }

  async getAvailableModels() {
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

  async healthCheck() {
    return true;
  }
}

export const huggingFaceService = new HuggingFaceService();
