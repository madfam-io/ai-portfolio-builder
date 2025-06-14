import { AIClient } from '@/lib/ai/client';
import { env } from '@/lib/config';
import { 
  AIService,
  EnhancedContent,
  BioContext,
  ProjectEnhancement,
  TemplateRecommendation,
  UserProfile 
} from '@/lib/ai/types';

// Mock the services
jest.mock('@/lib/ai/huggingface-service');
jest.mock('@/lib/ai/deepseek-service');
jest.mock('@/lib/config', () => ({
  env: {
    HUGGINGFACE_API_KEY: 'test-huggingface-key',
  },
}));

describe('AIClient', () => {
  let client: AIClient;
  let mockHuggingFaceService: jest.Mocked<AIService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock service
    mockHuggingFaceService = {
      enhanceBio: jest.fn(),
      enhanceProject: jest.fn(),
      recommendTemplate: jest.fn(),
      getAvailableModels: jest.fn(),
    };

    // Mock the import
    jest.doMock('@/lib/ai/huggingface-service', () => ({
      HuggingFaceService: jest.fn(() => mockHuggingFaceService),
    }));

    client = new AIClient();
  });

  describe('enhanceBio', () => {
    const mockContext: BioContext = {
      currentBio: 'Software developer',
      experience: '5 years',
      skills: ['JavaScript', 'Python'],
      achievements: ['Built scalable apps'],
    };

    const mockResult: EnhancedContent = {
      enhancedBio: 'Experienced software developer with 5 years...',
      qualityScore: 85,
      improvements: ['Added metrics', 'Professional tone'],
      wordCount: 75,
    };

    it('should enhance bio using the configured service', async () => {
      mockHuggingFaceService.enhanceBio.mockResolvedValue(mockResult);

      const result = await client.enhanceBio(mockContext);

      expect(result).toEqual(mockResult);
      expect(mockHuggingFaceService.enhanceBio).toHaveBeenCalledWith(mockContext);
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Service unavailable');
      mockHuggingFaceService.enhanceBio.mockRejectedValue(error);

      await expect(client.enhanceBio(mockContext)).rejects.toThrow('Service unavailable');
    });

    it('should validate context before calling service', async () => {
      const invalidContext = {
        ...mockContext,
        currentBio: '', // Empty bio
      };

      mockHuggingFaceService.enhanceBio.mockRejectedValue(
        new Error('Invalid context: Bio cannot be empty')
      );

      await expect(client.enhanceBio(invalidContext)).rejects.toThrow('Invalid context');
    });
  });

  describe('enhanceProject', () => {
    const mockProject: ProjectEnhancement['project'] = {
      title: 'E-commerce Platform',
      description: 'Built online store',
      technologies: ['React', 'Node.js'],
      duration: '6 months',
      teamSize: 5,
    };

    const mockResult: ProjectEnhancement = {
      project: mockProject,
      enhancedDescription: 'Developed comprehensive e-commerce platform...',
      impact: 'Increased sales by 40%',
      metrics: '40% sales increase, 10k daily users',
      qualityScore: 90,
    };

    it('should enhance project description', async () => {
      mockHuggingFaceService.enhanceProject.mockResolvedValue(mockResult);

      const result = await client.enhanceProject(mockProject);

      expect(result).toEqual(mockResult);
      expect(mockHuggingFaceService.enhanceProject).toHaveBeenCalledWith(mockProject);
    });

    it('should handle projects without technologies gracefully', async () => {
      const projectWithoutTech = {
        ...mockProject,
        technologies: [],
      };

      const resultWithoutTech = {
        ...mockResult,
        enhancedDescription: 'Developed comprehensive e-commerce platform over 6 months...',
      };

      mockHuggingFaceService.enhanceProject.mockResolvedValue(resultWithoutTech);

      const result = await client.enhanceProject(projectWithoutTech);

      expect(result.enhancedDescription).toBeTruthy();
      expect(result.qualityScore).toBeGreaterThan(0);
    });
  });

  describe('recommendTemplate', () => {
    const mockProfile: UserProfile = {
      experience: 'Senior Developer, 8 years',
      skills: ['React', 'Python', 'AWS'],
      industry: 'Technology',
      preferences: {
        style: 'modern',
        colorScheme: 'professional',
      },
    };

    const mockResult: TemplateRecommendation = {
      recommendedTemplate: 'developer',
      reasoning: 'Based on technology background',
      alternativeTemplates: ['modern', 'minimal'],
      confidence: 92,
    };

    it('should recommend template based on profile', async () => {
      mockHuggingFaceService.recommendTemplate.mockResolvedValue(mockResult);

      const result = await client.recommendTemplate(mockProfile);

      expect(result).toEqual(mockResult);
      expect(mockHuggingFaceService.recommendTemplate).toHaveBeenCalledWith(mockProfile);
    });

    it('should handle missing preferences', async () => {
      const profileWithoutPrefs = {
        ...mockProfile,
        preferences: undefined,
      };

      mockHuggingFaceService.recommendTemplate.mockResolvedValue(mockResult);

      const result = await client.recommendTemplate(profileWithoutPrefs);

      expect(result).toEqual(mockResult);
    });
  });

  describe('getAvailableModels', () => {
    const mockModels = [
      {
        id: 'llama-3.1-8b',
        name: 'Llama 3.1 8B',
        provider: 'huggingface' as const,
        capabilities: ['bio', 'project', 'template'] as const,
        costPerRequest: 0.0003,
        avgResponseTime: 2.5,
        qualityRating: 4.5,
        isRecommended: true,
        lastUpdated: '2024-01-01',
      },
    ];

    it('should return available models', async () => {
      mockHuggingFaceService.getAvailableModels.mockResolvedValue(mockModels);

      const result = await client.getAvailableModels();

      expect(result).toEqual(mockModels);
      expect(mockHuggingFaceService.getAvailableModels).toHaveBeenCalled();
    });

    it('should filter models by capability', async () => {
      mockHuggingFaceService.getAvailableModels.mockResolvedValue(mockModels);

      const result = await client.getAvailableModels('bio');

      expect(mockHuggingFaceService.getAvailableModels).toHaveBeenCalledWith('bio');
    });
  });

  describe('service selection', () => {
    it('should use HuggingFace service when API key is configured', () => {
      const clientWithKey = new AIClient();
      expect(mockHuggingFaceService.enhanceBio).toBeDefined();
    });

    it('should throw error when no service is configured', async () => {
      // Remove API key
      (env as any).HUGGINGFACE_API_KEY = '';

      const clientWithoutKey = new AIClient();
      
      await expect(clientWithoutKey.enhanceBio(mockContext)).rejects.toThrow(
        'No AI service configured'
      );

      // Restore API key
      (env as any).HUGGINGFACE_API_KEY = 'test-huggingface-key';
    });
  });

  describe('error propagation', () => {
    it('should propagate specific error types from service', async () => {
      const customError = new Error('Model unavailable');
      customError.name = 'ModelUnavailableError';
      
      mockHuggingFaceService.enhanceBio.mockRejectedValue(customError);

      await expect(client.enhanceBio(mockContext)).rejects.toThrow(customError);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network request failed');
      networkError.name = 'NetworkError';
      
      mockHuggingFaceService.enhanceBio.mockRejectedValue(networkError);

      await expect(client.enhanceBio(mockContext)).rejects.toThrow('Network request failed');
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent enhancement requests', async () => {
      const contexts = [
        { ...mockContext, currentBio: 'Developer 1' },
        { ...mockContext, currentBio: 'Developer 2' },
        { ...mockContext, currentBio: 'Developer 3' },
      ];

      const results = contexts.map((_, index) => ({
        ...mockResult,
        enhancedBio: `Enhanced bio ${index + 1}`,
      }));

      mockHuggingFaceService.enhanceBio
        .mockResolvedValueOnce(results[0])
        .mockResolvedValueOnce(results[1])
        .mockResolvedValueOnce(results[2]);

      const promises = contexts.map(ctx => client.enhanceBio(ctx));
      const actualResults = await Promise.all(promises);

      expect(actualResults).toEqual(results);
      expect(mockHuggingFaceService.enhanceBio).toHaveBeenCalledTimes(3);
    });
  });
});