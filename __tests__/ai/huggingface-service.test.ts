import { HuggingFaceService } from '@/lib/ai/huggingface-service';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown;

describe('HuggingFaceService', () => {
  let service: HuggingFaceService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    service = new HuggingFaceService();

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ generated_text: 'Enhanced bio text' }],
      headers: new Headers(),
    });
  });

  describe('enhanceBio', () => {
    it('should enhance a bio successfully', async () => {
      const result = await service.enhanceBio('Original bio', {
        tone: 'professional',
        industry: 'tech',
      });

      expect(result).toBe('Enhanced bio text');
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(service.enhanceBio('Original bio', {})).rejects.toThrow();
    });
  });

  describe('optimizeProject', () => {
    it('should optimize project description', async () => {
      const result = await service.optimizeProject({
        title: 'My Project',
        description: 'Original description',
        technologies: ['React', 'Node.js'],
      });

      expect(result.description).toBe('Enhanced bio text');
    });
  });

  describe('recommendTemplate', () => {
    it('should recommend a template', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ generated_text: 'Template: developer' }],
        headers: new Headers(),
      });

      const result = await service.recommendTemplate({
        industry: 'tech',
        role: 'developer',
        experience: '5 years',
      });

      expect(result.template).toBe('developer');
    });
  });
});
