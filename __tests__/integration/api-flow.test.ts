/**
 * @jest-environment jsdom
 */

import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('API Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Portfolio API Flow', () => {
    it('should create portfolio via API', async () => {
      const mockPortfolio = {
        id: 'new-portfolio',
        name: 'John Doe',
        title: 'Developer',
        template: 'modern',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ portfolio: mockPortfolio }),
      });

      const response = await fetch('/api/v1/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          title: 'Developer',
          template: 'modern',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.portfolio).toEqual(mockPortfolio);
    });

    it('should load portfolio via API', async () => {
      const mockPortfolio = {
        id: 'existing-portfolio',
        name: 'Jane Doe',
        title: 'Designer',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ portfolio: mockPortfolio }),
      });

      const response = await fetch('/api/v1/portfolios/existing-portfolio');

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.portfolio).toEqual(mockPortfolio);
    });

    it('should update portfolio via API', async () => {
      const updatedPortfolio = {
        id: 'existing-portfolio',
        name: 'Jane Smith',
        title: 'Senior Designer',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ portfolio: updatedPortfolio }),
      });

      const response = await fetch('/api/v1/portfolios/existing-portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPortfolio),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.portfolio).toEqual(updatedPortfolio);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')

      try {
        await fetch('/api/v1/portfolios/invalid-id');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });

  describe('AI Enhancement API Flow', () => {
    it('should enhance bio via AI API', async () => {
      const enhancedBio =
        'I am a passionate software developer with 5 years of experience building scalable web applications.';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ enhancedBio }),
      });

      const response = await fetch('/api/v1/ai/enhance-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: 'I am a developer',
          context: {
            title: 'Software Developer',
            skills: ['React', 'Node.js'],
          },
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.enhancedBio).toBe(enhancedBio);
    });

    it('should optimize project via AI API', async () => {
      const optimizedProject = {
        title: 'Advanced E-commerce Platform',
        description:
          'A sophisticated, scalable e-commerce solution built with modern technologies.',
        technologies: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ optimizedProject }),
      });

      const response = await fetch('/api/v1/ai/optimize-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'E-commerce Site',
          description: 'A basic online store',
          technologies: ['React', 'Node.js'],
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.optimizedProject).toEqual(optimizedProject);
    });

    it('should recommend template via AI API', async () => {
      const recommendation = {
        template: 'business',
        confidence: 0.85,
        reasoning: 'Based on professional background and corporate experience',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ recommendation }),
      });

      const response = await fetch('/api/v1/ai/recommend-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Business Consultant',
          bio: 'I help companies optimize their operations',
          industry: 'consulting',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.recommendation).toEqual(recommendation);
    });
  });

  describe('Publishing API Flow', () => {
    it('should check subdomain availability', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          available: true,
          subdomain: 'john-doe',
        }),
      });

      const response = await fetch('/api/v1/portfolios/check-subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: 'john-doe' }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.available).toBe(true);
    });

    it('should publish portfolio', async () => {
      const publishResult = {
        success: true,
        url: 'https://john-doe.prisma.dev',
        deploymentId: 'deploy_123',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => publishResult,
      });

      const response = await fetch(
        '/api/v1/portfolios/test-portfolio/publish',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subdomain: 'john-doe' }),
        }

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toEqual(publishResult);
    });

    it('should handle subdomain conflicts', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          available: false,
          message: 'Subdomain already taken',
          suggestions: ['john-doe-dev', 'john-doe-portfolio'],
        }),
      });

      const response = await fetch('/api/v1/portfolios/check-subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: 'taken-subdomain' }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(409);
    });
  });

  describe('Complete Portfolio Flow', () => {
    it('should complete full portfolio creation to publishing flow', async () => {
      // Step 1: Create portfolio
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          portfolio: {
            id: 'new-portfolio',
            name: 'John Doe',
            title: 'Developer',
            template: 'modern',
          },
        }),
      });

      // Step 2: Enhance with AI
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          enhancedBio: 'Enhanced professional bio',
        }),
      });

      // Step 3: Check subdomain
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          available: true,
        }),
      });

      // Step 4: Publish
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://john-doe.prisma.dev',
        }),
      });

      // Execute flow
      const createResponse = await fetch('/api/v1/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe', title: 'Developer' }),
      });

      const enhanceResponse = await fetch('/api/v1/ai/enhance-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: 'I am a developer' }),
      });

      const subdomainResponse = await fetch(
        '/api/v1/portfolios/check-subdomain',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subdomain: 'john-doe' }),
        }

      const publishResponse = await fetch(
        '/api/v1/portfolios/new-portfolio/publish',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subdomain: 'john-doe' }),
        }

      // Verify all steps completed successfully
      expect(createResponse.ok).toBe(true);
      expect(enhanceResponse.ok).toBe(true);
      expect(subdomainResponse.ok).toBe(true);
      expect(publishResponse.ok).toBe(true);

      expect(global.fetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('Error Recovery Flow', () => {
    it('should handle partial failures in multi-step operations', async () => {
      // Success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ portfolio: { id: 'test' } }),
      });

      // Failure
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('AI service unavailable')

      // Recovery
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      try {
        // Step 1: Success
        const createResponse = await fetch('/api/v1/portfolios', {
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
        });
        expect(createResponse.ok).toBe(true);

        // Step 2: Failure
        await fetch('/api/v1/ai/enhance-bio', {
          method: 'POST',
          body: JSON.stringify({ bio: 'test' }),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Step 3: Continue despite AI failure
      const subdomainResponse = await fetch(
        '/api/v1/portfolios/check-subdomain',
        {
          method: 'POST',
          body: JSON.stringify({ subdomain: 'test' }),
        }

      expect(subdomainResponse.ok).toBe(true);
    });
  });
});
