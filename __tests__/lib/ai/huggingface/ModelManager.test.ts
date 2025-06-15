import { ModelManager } from '@/lib/ai/huggingface/ModelManager';
import { HfInference } from '@huggingface/inference';

jest.mock('@huggingface/inference');

describe('ModelManager', () => {
  let modelManager: ModelManager;
  let mockHfInference: jest.Mocked<HfInference>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHfInference = {
      textGeneration: jest.fn(),
      textClassification: jest.fn(),
      summarization: jest.fn(),
    } as any;
    
    (HfInference as jest.MockedClass<typeof HfInference>).mockImplementation(() => mockHfInference);
    
    modelManager = new ModelManager('test-api-key');
  });

  describe('initialization', () => {
    it('should initialize with API key', () => {
      expect(HfInference).toHaveBeenCalledWith('test-api-key');
    });

    it('should throw error if no API key provided', () => {
      expect(() => new ModelManager('')).toThrow();
    });
  });

  describe('generateText', () => {
    it('should generate text with default model', async () => {
      mockHfInference.textGeneration.mockResolvedValue({
        generated_text: 'Generated bio text'
      });

      const result = await modelManager.generateText('Generate a bio', 'bio');

      expect(mockHfInference.textGeneration).toHaveBeenCalledWith({
        model: expect.any(String),
        inputs: 'Generate a bio',
        parameters: expect.objectContaining({
          max_new_tokens: expect.any(Number),
          temperature: expect.any(Number),
        })
      });
      expect(result).toBe('Generated bio text');
    });

    it('should use specific model when provided', async () => {
      mockHfInference.textGeneration.mockResolvedValue({
        generated_text: 'Generated text'
      });

      const result = await modelManager.generateText(
        'Generate text',
        'bio',
        'meta-llama/Llama-3.1-8B-Instruct'
      );

      expect(mockHfInference.textGeneration).toHaveBeenCalledWith({
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        inputs: expect.any(String),
        parameters: expect.any(Object)
      });
    });

    it('should handle different content types', async () => {
      mockHfInference.textGeneration.mockResolvedValue({
        generated_text: 'Generated project'
      });

      await modelManager.generateText('Project prompt', 'project');
      
      expect(mockHfInference.textGeneration).toHaveBeenCalledWith({
        model: expect.any(String),
        inputs: expect.stringContaining('project'),
        parameters: expect.objectContaining({
          max_new_tokens: 200 // Projects have longer limit
        })
      });
    });

    it('should handle API errors gracefully', async () => {
      mockHfInference.textGeneration.mockRejectedValue(new Error('API Error'));

      await expect(modelManager.generateText('Prompt', 'bio')).rejects.toThrow('API Error');
    });

    it('should apply temperature based on content type', async () => {
      mockHfInference.textGeneration.mockResolvedValue({
        generated_text: 'Generated'
      });

      await modelManager.generateText('Creative prompt', 'bio');
      expect(mockHfInference.textGeneration).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: expect.objectContaining({
            temperature: 0.7 // Bio temperature
          })
        })
      );

      await modelManager.generateText('Technical prompt', 'project');
      expect(mockHfInference.textGeneration).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: expect.objectContaining({
            temperature: 0.5 // Project temperature
          })
        })
      );
    });
  });

  describe('classifyContent', () => {
    it('should classify content type', async () => {
      mockHfInference.textClassification.mockResolvedValue([
        { label: 'technical', score: 0.8 },
        { label: 'creative', score: 0.2 }
      ]);

      const result = await modelManager.classifyContent('React developer with experience');

      expect(mockHfInference.textClassification).toHaveBeenCalledWith({
        model: expect.any(String),
        inputs: 'React developer with experience'
      });
      expect(result).toEqual([
        { label: 'technical', score: 0.8 },
        { label: 'creative', score: 0.2 }
      ]);
    });

    it('should handle classification errors', async () => {
      mockHfInference.textClassification.mockRejectedValue(new Error('Classification failed'));

      await expect(modelManager.classifyContent('Content')).rejects.toThrow('Classification failed');
    });
  });

  describe('summarizeContent', () => {
    it('should summarize long content', async () => {
      mockHfInference.summarization.mockResolvedValue({
        summary_text: 'Summarized content'
      });

      const longContent = 'This is a very long content '.repeat(50);
      const result = await modelManager.summarizeContent(longContent);

      expect(mockHfInference.summarization).toHaveBeenCalledWith({
        model: expect.any(String),
        inputs: longContent,
        parameters: {
          max_length: 150,
          min_length: 50
        }
      });
      expect(result).toBe('Summarized content');
    });

    it('should handle custom length parameters', async () => {
      mockHfInference.summarization.mockResolvedValue({
        summary_text: 'Short summary'
      });

      await modelManager.summarizeContent('Content', 100, 30);

      expect(mockHfInference.summarization).toHaveBeenCalledWith({
        model: expect.any(String),
        inputs: 'Content',
        parameters: {
          max_length: 100,
          min_length: 30
        }
      });
    });
  });

  describe('getAvailableModels', () => {
    it('should return list of available models', () => {
      const models = modelManager.getAvailableModels();

      expect(models).toBeInstanceOf(Array);
      expect(models.length).toBeGreaterThan(0);
      expect(models).toContain('meta-llama/Llama-3.1-8B-Instruct');
      expect(models).toContain('microsoft/Phi-3.5-mini-instruct');
    });
  });

  describe('getModelInfo', () => {
    it('should return model information', () => {
      const info = modelManager.getModelInfo('meta-llama/Llama-3.1-8B-Instruct');

      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('description');
      expect(info).toHaveProperty('maxTokens');
      expect(info).toHaveProperty('provider');
    });

    it('should return undefined for unknown model', () => {
      const info = modelManager.getModelInfo('unknown/model');

      expect(info).toBeUndefined();
    });
  });

  describe('validateModel', () => {
    it('should validate supported models', () => {
      expect(modelManager.validateModel('meta-llama/Llama-3.1-8B-Instruct')).toBe(true);
      expect(modelManager.validateModel('microsoft/Phi-3.5-mini-instruct')).toBe(true);
    });

    it('should reject unsupported models', () => {
      expect(modelManager.validateModel('unknown/model')).toBe(false);
      expect(modelManager.validateModel('')).toBe(false);
    });
  });

  describe('prompt formatting', () => {
    it('should format prompts correctly for bio', async () => {
      mockHfInference.textGeneration.mockResolvedValue({
        generated_text: 'Bio'
      });

      await modelManager.generateText('I am a developer', 'bio');

      const calledPrompt = mockHfInference.textGeneration.mock.calls[0][0].inputs;
      expect(calledPrompt).toContain('professional bio');
      expect(calledPrompt).toContain('I am a developer');
    });

    it('should format prompts correctly for project', async () => {
      mockHfInference.textGeneration.mockResolvedValue({
        generated_text: 'Project'
      });

      await modelManager.generateText('E-commerce site', 'project');

      const calledPrompt = mockHfInference.textGeneration.mock.calls[0][0].inputs;
      expect(calledPrompt).toContain('project description');
      expect(calledPrompt).toContain('E-commerce site');
    });
  });

  describe('rate limiting', () => {
    it('should handle rate limit errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;
      mockHfInference.textGeneration.mockRejectedValue(rateLimitError);

      await expect(modelManager.generateText('Prompt', 'bio')).rejects.toThrow('Rate limit');
    });

    it('should implement retry logic for transient errors', async () => {
      mockHfInference.textGeneration
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({ generated_text: 'Success' });

      const result = await modelManager.generateText('Prompt', 'bio', undefined, { retries: 1 });

      expect(result).toBe('Success');
      expect(mockHfInference.textGeneration).toHaveBeenCalledTimes(2);
    });
  });

  describe('content filtering', () => {
    it('should clean generated text', async () => {
      mockHfInference.textGeneration.mockResolvedValue({
        generated_text: '  Generated text with extra spaces  \n\n'
      });

      const result = await modelManager.generateText('Prompt', 'bio');

      expect(result).toBe('Generated text with extra spaces');
    });

    it('should handle empty responses', async () => {
      mockHfInference.textGeneration.mockResolvedValue({
        generated_text: ''
      });

      const result = await modelManager.generateText('Prompt', 'bio');

      expect(result).toBe('');
    });
  });
});