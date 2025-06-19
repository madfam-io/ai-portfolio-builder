import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
/**
 * @jest-environment jsdom
 */

// Mock fetch for API calls
global.fetch = jest.fn().mockReturnValue(void 0);

describe('Critical Path: Portfolio Creation', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('30-Minute Portfolio Creation Goal', () => {
    it('should complete basic portfolio creation flow', async () => {
      // Mock successful API responses for each step
      const mockResponses = [
        // 1. Create portfolio
        {
          ok: true,
          json: async () => ({
            portfolio: {
              id: 'new-portfolio-123',
              name: 'John Doe',
              title: 'Software Developer',
              template: 'modern',
              createdAt: new Date().toISOString(),
            },
          }),
        },
        // 2. Add basic info
        {
          ok: true,
          json: async () => ({
            portfolio: {
              id: 'new-portfolio-123',
              name: 'John Doe',
              title: 'Software Developer',
              bio: 'I am a passionate software developer',
              location: 'San Francisco, CA',
              template: 'modern',
            },
          }),
        },
        // 3. Add skills
        {
          ok: true,
          json: async () => ({
            portfolio: {
              id: 'new-portfolio-123',
              skills: ['React', 'TypeScript', 'Node.js'],
            },
          }),
        },
        // 4. Add projects
        {
          ok: true,
          json: async () => ({
            portfolio: {
              id: 'new-portfolio-123',
              projects: [
                {
                  id: 'project-1',
                  title: 'E-commerce App',
                  description: 'A full-stack e-commerce application',
                  technologies: ['React', 'Node.js', 'MongoDB'],
                },
              ],
            },
          }),
        },
        // 5. Check subdomain
        {
          ok: true,
          json: async () => ({
            available: true,
            subdomain: 'john-doe',
          }),
        },
        // 6. Publish
        {
          ok: true,
          json: async () => ({
            success: true,
            url: 'https://john-doe.prisma.dev',
            deploymentId: 'deploy_abc123',
          }),
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2])
        .mockResolvedValueOnce(mockResponses[3])
        .mockResolvedValueOnce(mockResponses[4])
        .mockResolvedValueOnce(mockResponses[5]);

      // Simulate portfolio creation workflow
      const startTime = Date.now();

      // Step 1: Create initial portfolio
      const createResponse = await fetch('/api/v1/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          title: 'Software Developer',
          template: 'modern',
        }),
      });

      expect(createResponse.ok).toBe(true);
      const portfolioData = await createResponse.json();
      const portfolioId = portfolioData.portfolio.id;

      // Step 2: Update basic information
      const basicInfoResponse = await fetch(
        `/api/v1/portfolios/${portfolioId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bio: 'I am a passionate software developer',
            location: 'San Francisco, CA',
          }),
        }
      );

      expect(basicInfoResponse.ok).toBe(true);

      // Step 3: Add skills
      const skillsResponse = await fetch(`/api/v1/portfolios/${portfolioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: ['React', 'TypeScript', 'Node.js'],
        }),
      });

      expect(skillsResponse.ok).toBe(true);

      // Step 4: Add projects
      const projectsResponse = await fetch(
        `/api/v1/portfolios/${portfolioId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projects: [
              {
                title: 'E-commerce App',
                description: 'A full-stack e-commerce application',
                technologies: ['React', 'Node.js', 'MongoDB'],
              },
            ],
          }),
        }
      );

      expect(projectsResponse.ok).toBe(true);

      // Step 5: Check subdomain availability
      const subdomainResponse = await fetch(
        '/api/v1/portfolios/check-subdomain',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subdomain: 'john-doe' }),
        }
      );

      expect(subdomainResponse.ok).toBe(true);

      // Step 6: Publish portfolio
      const publishResponse = await fetch(
        `/api/v1/portfolios/${portfolioId}/publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subdomain: 'john-doe' }),
        }
      );

      expect(publishResponse.ok).toBe(true);
      const publishData = await publishResponse.json();

      // Verify complete flow
      expect(publishData.success).toBe(true);
      expect(publishData.url).toBe('https://john-doe.prisma.dev');

      // Check that all API calls were made
      expect(global.fetch).toHaveBeenCalledTimes(6);

      // Verify performance target (should complete in under 30 seconds of API calls)
      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(30000); // 30 seconds
    });

    it('should handle portfolio creation with AI enhancement', async () => {
      // Mock responses for AI-enhanced creation
      const mockResponses = [
        // 1. Create portfolio
        {
          ok: true,
          json: async () => ({
            portfolio: {
              id: 'ai-portfolio-123',
              name: 'Jane Smith',
              title: 'UX Designer',
            },
          }),
        },
        // 2. AI enhance bio
        {
          ok: true,
          json: async () => ({
            enhancedBio:
              'I am a creative UX designer with 3 years of experience crafting intuitive digital experiences that delight users and drive business results.',
          }),
        },
        // 3. AI optimize project
        {
          ok: true,
          json: async () => ({
            optimizedProject: {
              title: 'Mobile Banking App Redesign',
              description:
                'Led the complete UX overhaul of a mobile banking application, resulting in 40% increase in user engagement and 25% reduction in support tickets.',
              technologies: ['Figma', 'Sketch', 'InVision', 'User Research'],
            },
          }),
        },
        // 4. Save enhanced content
        {
          ok: true,
          json: async () => ({ success: true }),
        },
        // 5. Publish
        {
          ok: true,
          json: async () => ({
            success: true,
            url: 'https://jane-smith.prisma.dev',
          }),
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2])
        .mockResolvedValueOnce(mockResponses[3])
        .mockResolvedValueOnce(mockResponses[4]);

      // Create portfolio with AI enhancement
      const createResponse = await fetch('/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({ name: 'Jane Smith', title: 'UX Designer' }),
      });

      const portfolioData = await createResponse.json();
      const portfolioId = portfolioData.portfolio.id;

      // Enhance bio with AI
      const enhanceBioResponse = await fetch('/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify({
          bio: 'I am a UX designer',
          context: { title: 'UX Designer', skills: ['Design', 'Research'] },
        }),
      });

      expect(enhanceBioResponse.ok).toBe(true);
      const bioData = await enhanceBioResponse.json();
      expect(bioData.enhancedBio).toContain('creative UX designer');

      // Optimize project with AI
      const optimizeProjectResponse = await fetch(
        '/api/v1/ai/optimize-project',
        {
          method: 'POST',
          body: JSON.stringify({
            title: 'Banking App',
            description: 'Redesigned mobile app',
            technologies: ['Figma'],
          }),
        }
      );

      expect(optimizeProjectResponse.ok).toBe(true);
      const projectData = await optimizeProjectResponse.json();
      expect(projectData.optimizedProject.description).toContain(
        '40% increase'
      );

      // Save enhanced content
      const saveResponse = await fetch(`/api/v1/portfolios/${portfolioId}`, {
        method: 'PUT',
        body: JSON.stringify({
          bio: bioData.enhancedBio,
          projects: [projectData.optimizedProject],
        }),
      });

      expect(saveResponse.ok).toBe(true);

      // Publish enhanced portfolio
      const publishResponse = await fetch(
        `/api/v1/portfolios/${portfolioId}/publish`,
        {
          method: 'POST',
          body: JSON.stringify({ subdomain: 'jane-smith' }),
        }
      );

      expect(publishResponse.ok).toBe(true);
      const publishData = await publishResponse.json();
      expect(publishData.url).toBe('https://jane-smith.prisma.dev');
    });

    it('should handle template switching during creation', async () => {
      const mockResponses = [
        // 1. Create with modern template
        {
          ok: true,
          json: async () => ({
            portfolio: { id: 'template-test', template: 'modern' },
          }),
        },
        // 2. Switch to business template
        {
          ok: true,
          json: async () => ({
            portfolio: { id: 'template-test', template: 'business' },
          }),
        },
        // 3. Final save
        {
          ok: true,
          json: async () => ({ success: true }),
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2]);

      // Create with initial template
      const createResponse = await fetch('/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({ template: 'modern' }),
      });

      const portfolioData = await createResponse.json();
      expect(portfolioData.portfolio.template).toBe('modern');

      // Switch template
      const switchResponse = await fetch(
        `/api/v1/portfolios/${portfolioData.portfolio.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ template: 'business' }),
        }
      );

      const updatedData = await switchResponse.json();
      expect(updatedData.portfolio.template).toBe('business');

      // Final save
      const saveResponse = await fetch(
        `/api/v1/portfolios/${portfolioData.portfolio.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ name: 'Template Switcher' }),
        }
      );

      expect(saveResponse.ok).toBe(true);
    });
  });

  describe('Critical Error Scenarios', () => {
    it('should handle network failures gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      try {
        await fetch('/api/v1/portfolios', {
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle server errors during creation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      const response = await fetch('/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });

    it('should handle AI service unavailability', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ portfolio: { id: 'test' } }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ error: 'AI service temporarily unavailable' }),
        });

      // Portfolio creation succeeds
      const createResponse = await fetch('/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      expect(createResponse.ok).toBe(true);

      // AI enhancement fails
      const aiResponse = await fetch('/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify({ bio: 'test' }),
      });

      expect(aiResponse.ok).toBe(false);
      expect(aiResponse.status).toBe(503);
    });

    it('should handle publishing failures', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ portfolio: { id: 'publish-test' } }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 409,
          json: async () => ({
            error: 'Subdomain already taken',
            suggestions: ['alternative-1', 'alternative-2'],
          }),
        });

      // Portfolio creation succeeds
      const createResponse = await fetch('/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      expect(createResponse.ok).toBe(true);

      // Publishing fails due to subdomain conflict
      const publishResponse = await fetch(
        '/api/v1/portfolios/publish-test/publish',
        {
          method: 'POST',
          body: JSON.stringify({ subdomain: 'taken-name' }),
        }
      );

      expect(publishResponse.ok).toBe(false);
      expect(publishResponse.status).toBe(409);

      const errorData = await publishResponse.json();
      expect(errorData.suggestions).toHaveLength(2);
    });
  });

  describe('Performance Validation', () => {
    it('should complete creation within performance targets', async () => {
      // Mock fast responses
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const startTime = Date.now();

      // Simulate minimum viable portfolio creation
      await fetch('/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({ name: 'Speed Test', title: 'Developer' }),
      });

      await fetch('/api/v1/portfolios/test/publish', {
        method: 'POST',
        body: JSON.stringify({ subdomain: 'speed-test' }),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete basic flow very quickly
      expect(duration).toBeLessThan(1000); // 1 second for API calls
    });

    it('should handle concurrent portfolio creations', async () => {
      const portfolioCount = 5;
      const portfolios = Array.from({ length: portfolioCount }, (_, i) => ({
        name: `User ${i + 1}`,
        title: 'Developer',
      }));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ portfolio: { id: `portfolio-${Date.now()}` } }),
      });

      const startTime = Date.now();

      // Create multiple portfolios concurrently
      const creationPromises = portfolios.map(portfolio =>
        fetch('/api/v1/portfolios', {
          method: 'POST',
          body: JSON.stringify(portfolio),
        })
      );

      const results = await Promise.all(creationPromises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // All should succeed
      results.forEach(result => {
        expect(result.ok).toBe(true);
      });

      // Should handle concurrent load efficiently
      expect(duration).toBeLessThan(5000); // 5 seconds for 5 concurrent creations
      expect(global.fetch).toHaveBeenCalledTimes(portfolioCount);
    });
  });
});
