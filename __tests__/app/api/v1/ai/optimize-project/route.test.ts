/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/ai/optimize-project/route';
import { optimizeProjectDescription } from '@/lib/ai/huggingface-service';
// Mock getUserSession since the module doesn't exist
const getUserSession = jest.fn();

// Mock createSupabaseClient
const createSupabaseClient = jest.fn();
import { withAuth } from '@/lib/api/middleware/auth';
import { withRateLimit } from '@/lib/api/middleware/rate-limit';
import { logger } from '@/lib/utils/logger';
import { trackEvent } from '@/lib/analytics/posthog/server';

// Mock dependencies
jest.mock('@/lib/ai/huggingface-service');
// No need to mock non-existent modules
jest.mock('@/lib/api/middleware/auth');
jest.mock('@/lib/api/middleware/rate-limit');
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/analytics/posthog/server');

const mockOptimizeProjectDescription = jest.mocked(optimizeProjectDescription);
const mockGetUserSession = jest.mocked(getUserSession);
const mockCreateSupabaseClient = jest.mocked(createSupabaseClient);
const mockWithAuth = jest.mocked(withAuth);
const mockWithRateLimit = jest.mocked(withRateLimit);
const mockLogger = jest.mocked(logger);
const mockTrackEvent = jest.mocked(trackEvent);

describe('AI Optimize Project API Route', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Supabase mock
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    };

    mockCreateSupabaseClient.mockResolvedValue(mockSupabase);

    // Mock auth middleware to pass through
    mockWithAuth.mockImplementation(handler => handler);
    mockWithRateLimit.mockImplementation(handler => handler);

    // Mock logger
    mockLogger.info = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.warn = jest.fn();
  });

  const createMockRequest = (body: any): NextRequest => {
    const request = new NextRequest(
      'https://example.com/api/v1/ai/optimize-project',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    request.json = jest.fn().mockResolvedValue(body);
    return request;
  };

  describe('Successful Project Optimization', () => {
    const mockUserId = 'user_123';
    const mockSession = {
      user: { id: mockUserId, email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetUserSession.mockResolvedValue(mockSession);
    });

    it('should optimize project description with AI credits', async () => {
      const requestBody = {
        projectInfo: {
          title: 'E-commerce Platform',
          description: 'Built an online store',
          technologies: ['React', 'Node.js', 'MongoDB'],
          duration: '3 months',
        },
        model: 'llama-3.1-70b',
      };

      const optimizedDescription = `
        Situation: Led development of a comprehensive e-commerce platform for a growing retail business.
        Task: Design and implement a scalable online store with real-time inventory management.
        Action: Built full-stack solution using React, Node.js, and MongoDB. Implemented secure payment processing and responsive design.
        Result: Delivered platform processing 1000+ daily transactions with 99.9% uptime, increasing client revenue by 150%.
      `.trim();

      // Mock user with AI credits
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          ai_credits: 15,
          subscription_plan: 'pro',
        },
        error: null,
      });

      // Mock AI optimization
      mockOptimizeProjectDescription.mockResolvedValue({
        optimized: optimizedDescription,
        metrics: [
          '1000+ daily transactions',
          '99.9% uptime',
          '150% revenue increase',
        ],
        quality: 88,
        error: null,
      });

      // Mock credit deduction
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId },
        error: null,
      });

      // Mock usage tracking
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'usage_123' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({
        optimized: optimizedDescription,
        metrics: [
          '1000+ daily transactions',
          '99.9% uptime',
          '150% revenue increase',
        ],
        quality: 88,
        creditsRemaining: 13,
      });

      // Verify credit deduction (2 credits for project optimization)
      expect(mockSupabase.update).toHaveBeenCalledWith({
        ai_credits: 13,
      });

      // Verify usage tracking
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        type: 'project_optimization',
        credits_used: 2,
        metadata: {
          model: 'llama-3.1-70b',
          quality: 88,
          project_title: 'E-commerce Platform',
          metrics_found: 3,
        },
      });

      // Verify analytics
      expect(mockTrackEvent).toHaveBeenCalledWith({
        userId: mockUserId,
        event: 'ai_project_optimized',
        properties: {
          model: 'llama-3.1-70b',
          quality: 88,
          credits_used: 2,
          metrics_found: 3,
          subscription_plan: 'pro',
        },
      });
    });

    it('should handle projects with existing metrics', async () => {
      const requestBody = {
        projectInfo: {
          title: 'Performance Optimization',
          description:
            'Improved application performance by 50%, reduced load time from 5s to 2s',
          technologies: ['JavaScript', 'Webpack'],
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 10 },
        error: null,
      });

      mockOptimizeProjectDescription.mockResolvedValue({
        optimized: 'Enhanced description with existing metrics preserved...',
        metrics: [
          '50% performance improvement',
          '5s to 2s load time reduction',
        ],
        quality: 85,
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(result.metrics).toHaveLength(2);
      expect(result.quality).toBe(85);
    });

    it('should work with minimal project info', async () => {
      const requestBody = {
        projectInfo: {
          title: 'Portfolio Website',
          description: 'Personal portfolio',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 5 },
        error: null,
      });

      mockOptimizeProjectDescription.mockResolvedValue({
        optimized: 'Professional portfolio showcasing development expertise...',
        metrics: [],
        quality: 70,
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Input Validation', () => {
    const mockUserId = 'user_123';
    const mockSession = {
      user: { id: mockUserId, email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetUserSession.mockResolvedValue(mockSession);
    });

    it('should validate project info is required', async () => {
      const request = createMockRequest({
        // Missing projectInfo
        model: 'llama-3.1-70b',
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Project information is required');
    });

    it('should validate project title is required', async () => {
      const request = createMockRequest({
        projectInfo: {
          // Missing title
          description: 'Some description',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Project title is required');
    });

    it('should validate project description is required', async () => {
      const request = createMockRequest({
        projectInfo: {
          title: 'My Project',
          // Missing description
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Project description is required');
    });

    it('should validate description length', async () => {
      const request = createMockRequest({
        projectInfo: {
          title: 'Project',
          description: 'Short', // Too short
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain(
        'Description must be at least 20 characters'
      );
    });

    it('should validate technologies array', async () => {
      const request = createMockRequest({
        projectInfo: {
          title: 'Project',
          description: 'Valid description for the project',
          technologies: 'React, Node.js', // Should be array
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Technologies must be an array');
    });
  });

  describe('Credit Management', () => {
    const mockUserId = 'user_123';
    const mockSession = {
      user: { id: mockUserId, email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetUserSession.mockResolvedValue(mockSession);
    });

    it('should reject when insufficient credits (needs 2)', async () => {
      const requestBody = {
        projectInfo: {
          title: 'Project',
          description: 'Project that needs optimization',
        },
      };

      // Mock user with only 1 credit
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          ai_credits: 1,
          subscription_plan: 'free',
        },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toBe('Insufficient AI credits');
      expect(result.creditsRequired).toBe(2);
      expect(result.creditsAvailable).toBe(1);
    });

    it('should handle enterprise unlimited credits', async () => {
      const requestBody = {
        projectInfo: {
          title: 'Enterprise Project',
          description: 'Large scale enterprise application development',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          ai_credits: -1, // Unlimited
          subscription_plan: 'enterprise',
        },
        error: null,
      });

      mockOptimizeProjectDescription.mockResolvedValue({
        optimized: 'Optimized enterprise description...',
        metrics: ['10M+ users', '99.99% SLA'],
        quality: 92,
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'usage_123' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.creditsRemaining).toBe('unlimited');

      // Should not deduct credits
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });
  });

  describe('AI Service Errors', () => {
    const mockUserId = 'user_123';
    const mockSession = {
      user: { id: mockUserId, email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetUserSession.mockResolvedValue(mockSession);
    });

    it('should handle AI service failures', async () => {
      const requestBody = {
        projectInfo: {
          title: 'Test Project',
          description: 'Project description to optimize',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 10 },
        error: null,
      });

      mockOptimizeProjectDescription.mockResolvedValue({
        optimized: requestBody.projectInfo.description,
        metrics: [],
        quality: 0,
        error: 'AI service unavailable',
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.error).toBe('AI optimization failed');
      expect(result.details).toBe('AI service unavailable');

      // Should not deduct credits on failure
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    it('should handle timeout errors', async () => {
      const requestBody = {
        projectInfo: {
          title: 'Complex Project',
          description: 'Very complex project requiring extensive analysis',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 20 },
        error: null,
      });

      mockOptimizeProjectDescription.mockRejectedValue(
        new Error('Request timeout')
      );

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(504);
      expect(result.error).toContain('timeout');
    });
  });

  describe('STAR Method Formatting', () => {
    const mockUserId = 'user_123';
    const mockSession = {
      user: { id: mockUserId, email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetUserSession.mockResolvedValue(mockSession);
    });

    it('should ensure STAR format in output', async () => {
      const requestBody = {
        projectInfo: {
          title: 'Customer Analytics Platform',
          description: 'Developed analytics platform for customer insights',
          technologies: ['Python', 'TensorFlow', 'AWS'],
          duration: '6 months',
        },
      };

      const starFormattedDescription = `
        Situation: Company needed better customer insights to improve retention and reduce churn.
        Task: Develop a comprehensive analytics platform to analyze customer behavior patterns.
        Action: Built ML-powered platform using Python and TensorFlow, deployed on AWS with auto-scaling.
        Result: Reduced customer churn by 25% and increased retention rate to 85% within 3 months.
      `.trim();

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 8 },
        error: null,
      });

      mockOptimizeProjectDescription.mockResolvedValue({
        optimized: starFormattedDescription,
        metrics: ['25% churn reduction', '85% retention rate', '3 months ROI'],
        quality: 90,
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(result.optimized).toContain('Situation:');
      expect(result.optimized).toContain('Task:');
      expect(result.optimized).toContain('Action:');
      expect(result.optimized).toContain('Result:');
    });
  });

  describe('Analytics and Monitoring', () => {
    const mockUserId = 'user_123';
    const mockSession = {
      user: { id: mockUserId, email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetUserSession.mockResolvedValue(mockSession);
    });

    it('should track optimization quality metrics', async () => {
      const requestBody = {
        projectInfo: {
          title: 'Mobile App',
          description: 'Created a mobile application for iOS and Android',
          technologies: ['React Native', 'Firebase'],
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 10, subscription_plan: 'pro' },
        error: null,
      });

      mockOptimizeProjectDescription.mockResolvedValue({
        optimized: 'Professionally optimized description...',
        metrics: ['50K+ downloads', '4.8 star rating'],
        quality: 85,
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      await POST(request);

      expect(mockTrackEvent).toHaveBeenCalledWith({
        userId: mockUserId,
        event: 'ai_project_optimized',
        properties: {
          model: 'llama-3.1-70b',
          quality: 85,
          credits_used: 2,
          metrics_found: 2,
          subscription_plan: 'pro',
        },
      });
    });

    it('should track low quality outputs', async () => {
      const requestBody = {
        projectInfo: {
          title: 'Simple Task',
          description: 'Did some work on a thing',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 5 },
        error: null,
      });

      mockOptimizeProjectDescription.mockResolvedValue({
        optimized: 'Slightly improved description...',
        metrics: [],
        quality: 45,
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      await POST(request);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Low quality project optimization',
        expect.objectContaining({
          quality: 45,
          userId: mockUserId,
        })
      );
    });
  });

  describe('Edge Cases', () => {
    const mockUserId = 'user_123';
    const mockSession = {
      user: { id: mockUserId, email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetUserSession.mockResolvedValue(mockSession);
    });

    it('should handle very long project descriptions', async () => {
      const requestBody = {
        projectInfo: {
          title: 'Large Project',
          description: 'A'.repeat(2000), // Very long description
          technologies: Array(20).fill('Tech'), // Many technologies
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 10 },
        error: null,
      });

      mockOptimizeProjectDescription.mockResolvedValue({
        optimized: 'Optimized long description...',
        metrics: [],
        quality: 75,
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should sanitize malicious input', async () => {
      const requestBody = {
        projectInfo: {
          title: '<script>alert("XSS")</script>Malicious Project',
          description:
            'Normal description with <img src=x onerror=alert("XSS")>',
          technologies: ['<script>evil()</script>'],
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 10 },
        error: null,
      });

      mockOptimizeProjectDescription.mockResolvedValue({
        optimized: 'Safe optimized description...',
        metrics: [],
        quality: 80,
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      await POST(request);

      // Should sanitize input before sending to AI
      expect(mockOptimizeProjectDescription).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.not.stringContaining('<script>'),
          description: expect.not.stringContaining('<img'),
        }),
        undefined
      );
    });

    it('should handle special characters in metrics', async () => {
      const requestBody = {
        projectInfo: {
          title: 'International Project',
          description: 'Increased sales by €1.5M and ¥200M in Asian markets',
          technologies: ['Node.js'],
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 5 },
        error: null,
      });

      mockOptimizeProjectDescription.mockResolvedValue({
        optimized: 'Optimized with international metrics...',
        metrics: ['€1.5M sales increase', '¥200M Asian market growth'],
        quality: 85,
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(result.metrics).toContain('€1.5M sales increase');
      expect(result.metrics).toContain('¥200M Asian market growth');
    });
  });
});
