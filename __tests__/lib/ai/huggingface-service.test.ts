import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { cache } from '@/lib/cache/redis-cache.server';
import { logger } from '@/lib/utils/logger';
import { env } from '@/lib/config';
import { 
  AIServiceError, 
  ModelUnavailableError,
  ContentGenerationError,
  ValidationError 
} from '@/lib/ai/types';

// Mock dependencies
jest.mock('@/lib/cache/redis-cache.server');
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/config', () => ({
  env: {
    HUGGINGFACE_API_KEY: 'test-api-key',
  },
}));

// Mock the API client
jest.mock('@/lib/ai/huggingface/api-client', () => ({
  APIClient: jest.fn().mockImplementation(() => ({
    callModel: jest.fn(),
  })),
}));

describe('HuggingFaceService', () => {
  let service: HuggingFaceService;
  let mockCache: jest.Mocked<typeof cache>;
  let mockLogger: jest.Mocked<typeof logger>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCache = cache as jest.Mocked<typeof cache>;
    mockLogger = logger as jest.Mocked<typeof logger>;
    
    // Reset cache mock implementations
    mockCache.get.mockResolvedValue(null);
    mockCache.set.mockResolvedValue(undefined);
    
    service = new HuggingFaceService();
  });

  describe('enhanceBio', () => {
    const mockContext = {
      currentBio: 'I am a developer',
      experience: '5 years',
      skills: ['JavaScript', 'React'],
      achievements: ['Built amazing apps'],
    };

    it('should enhance bio successfully with caching', async () => {
      const mockResponse = {
        generated_text: 'I am an experienced software developer with 5 years of expertise in JavaScript and React. I have built amazing applications that deliver exceptional user experiences.',
      };

      // Mock API response
      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockResolvedValue(mockResponse),
      }));

      const result = await service.enhanceBio(mockContext);

      expect(result.enhancedBio).toContain('experienced software developer');
      expect(result.qualityScore).toBeGreaterThan(0);
      expect(result.qualityScore).toBeLessThanOrEqual(100);
      expect(result.wordCount).toBeGreaterThan(0);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should return cached result if available', async () => {
      const cachedResult = {
        enhancedBio: 'Cached bio content',
        qualityScore: 85,
        improvements: ['Added quantifiable metrics'],
        wordCount: 50,
      };

      mockCache.get.mockResolvedValue(cachedResult);

      const result = await service.enhanceBio(mockContext);

      expect(result).toEqual(cachedResult);
      expect(mockCache.get).toHaveBeenCalled();
      // API should not be called when cache hit
      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      expect(mockApiClient).not.toHaveBeenCalled();
    });

    it('should handle empty bio context', async () => {
      const emptyContext = {
        currentBio: '',
        experience: '',
        skills: [],
        achievements: [],
      };

      await expect(service.enhanceBio(emptyContext)).rejects.toThrow(ValidationError);
    });

    it('should handle API errors gracefully', async () => {
      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockRejectedValue(new Error('API Error')),
      }));

      await expect(service.enhanceBio(mockContext)).rejects.toThrow(AIServiceError);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should enforce word count limits', async () => {
      const longBioResponse = {
        generated_text: 'Lorem ipsum '.repeat(100), // Very long text
      };

      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockResolvedValue(longBioResponse),
      }));

      const result = await service.enhanceBio(mockContext);

      expect(result.wordCount).toBeLessThanOrEqual(150);
      expect(result.enhancedBio.split(' ').length).toBeLessThanOrEqual(150);
    });
  });

  describe('enhanceProject', () => {
    const mockProject = {
      title: 'E-commerce Platform',
      description: 'Built an online store',
      technologies: ['React', 'Node.js'],
      duration: '6 months',
      teamSize: 5,
    };

    it('should enhance project description successfully', async () => {
      const mockResponse = {
        generated_text: 'Developed a comprehensive e-commerce platform using React and Node.js. Led a team of 5 developers over 6 months to deliver a scalable solution that increased sales by 40%.',
      };

      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockResolvedValue(mockResponse),
      }));

      const result = await service.enhanceProject(mockProject);

      expect(result.enhancedDescription).toContain('e-commerce platform');
      expect(result.metrics).toContain('40%');
      expect(result.impact).toBeTruthy();
      expect(result.qualityScore).toBeGreaterThan(0);
    });

    it('should extract metrics from enhanced description', async () => {
      const mockResponse = {
        generated_text: 'Achieved 95% test coverage, reduced load time by 50%, and served 10,000 daily users.',
      };

      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockResolvedValue(mockResponse),
      }));

      const result = await service.enhanceProject(mockProject);

      expect(result.metrics).toContain('95%');
      expect(result.metrics).toContain('50%');
      expect(result.metrics).toContain('10,000');
    });

    it('should handle projects without technologies', async () => {
      const projectWithoutTech = {
        ...mockProject,
        technologies: [],
      };

      const mockResponse = {
        generated_text: 'Developed a comprehensive e-commerce platform over 6 months.',
      };

      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockResolvedValue(mockResponse),
      }));

      const result = await service.enhanceProject(projectWithoutTech);

      expect(result.enhancedDescription).toBeTruthy();
      expect(result.qualityScore).toBeGreaterThan(0);
    });
  });

  describe('recommendTemplate', () => {
    const mockProfile = {
      experience: 'Senior Software Developer with 8 years experience',
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      industry: 'Technology',
      preferences: {
        style: 'modern',
        colorScheme: 'professional',
      },
    };

    it('should recommend appropriate template based on profile', async () => {
      const mockResponse = {
        generated_text: 'Based on your technology background and modern preferences, I recommend the "developer" template with its clean code-inspired design.',
      };

      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockResolvedValue(mockResponse),
      }));

      const result = await service.recommendTemplate(mockProfile);

      expect(result.recommendedTemplate).toBe('developer');
      expect(result.reasoning).toContain('technology background');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('should handle creative industry profiles', async () => {
      const creativeProfile = {
        ...mockProfile,
        experience: 'Graphic Designer with 5 years experience',
        skills: ['Photoshop', 'Illustrator', 'Figma'],
        industry: 'Design',
      };

      const mockResponse = {
        generated_text: 'For a creative professional, the "designer" template showcases visual work beautifully.',
      };

      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockResolvedValue(mockResponse),
      }));

      const result = await service.recommendTemplate(creativeProfile);

      expect(result.recommendedTemplate).toBe('designer');
      expect(result.alternativeTemplates).toContain('creative');
    });

    it('should provide alternative template suggestions', async () => {
      const mockResponse = {
        generated_text: 'The "consultant" template is ideal, but "business" and "modern" templates would also work well.',
      };

      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockResolvedValue(mockResponse),
      }));

      const result = await service.recommendTemplate(mockProfile);

      expect(result.recommendedTemplate).toBe('consultant');
      expect(result.alternativeTemplates).toContain('business');
      expect(result.alternativeTemplates).toContain('modern');
    });
  });

  describe('getAvailableModels', () => {
    it('should return list of available models', async () => {
      const models = await service.getAvailableModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      
      const model = models[0];
      expect(model).toHaveProperty('id');
      expect(model).toHaveProperty('name');
      expect(model).toHaveProperty('capabilities');
      expect(model).toHaveProperty('costPerRequest');
    });

    it('should filter models by capability', async () => {
      const bioModels = await service.getAvailableModels('bio');

      expect(bioModels.length).toBeGreaterThan(0);
      bioModels.forEach(model => {
        expect(model.capabilities).toContain('bio');
      });
    });
  });

  describe('error handling', () => {
    it('should throw ModelUnavailableError when model is not available', async () => {
      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockRejectedValue(new ModelUnavailableError('Model not available')),
      }));

      await expect(service.enhanceBio(mockContext)).rejects.toThrow(ModelUnavailableError);
    });

    it('should handle rate limiting gracefully', async () => {
      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockRejectedValue(new Error('Rate limit exceeded')),
      }));

      await expect(service.enhanceBio(mockContext)).rejects.toThrow(AIServiceError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to enhance bio'),
        expect.any(Error)
      );
    });

    it('should validate API key presence', async () => {
      // Temporarily remove API key
      const originalKey = env.HUGGINGFACE_API_KEY;
      (env as any).HUGGINGFACE_API_KEY = '';

      const serviceWithoutKey = new HuggingFaceService();

      await expect(serviceWithoutKey.enhanceBio(mockContext)).rejects.toThrow(
        'HuggingFace API key not configured'
      );

      // Restore API key
      (env as any).HUGGINGFACE_API_KEY = originalKey;
    });
  });

  describe('caching behavior', () => {
    it('should generate consistent cache keys', async () => {
      const context1 = { currentBio: 'Test', experience: '5 years', skills: ['JS'], achievements: [] };
      const context2 = { currentBio: 'Test', experience: '5 years', skills: ['JS'], achievements: [] };

      // Mock to capture cache key
      let capturedKey1: string = '';
      let capturedKey2: string = '';
      
      mockCache.get.mockImplementation((key) => {
        if (!capturedKey1) capturedKey1 = key;
        else capturedKey2 = key;
        return Promise.resolve(null);
      });

      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockResolvedValue({ generated_text: 'Enhanced bio' }),
      }));

      await service.enhanceBio(context1);
      await service.enhanceBio(context2);

      expect(capturedKey1).toBe(capturedKey2);
    });

    it('should set appropriate cache TTL', async () => {
      const mockApiClient = require('@/lib/ai/huggingface/api-client').APIClient;
      mockApiClient.mockImplementation(() => ({
        callModel: jest.fn().mockResolvedValue({ generated_text: 'Enhanced bio' }),
      }));

      await service.enhanceBio(mockContext);

      expect(mockCache.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        3600 // 1 hour TTL
      );
    });
  });
});