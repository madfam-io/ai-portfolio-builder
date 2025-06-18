/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/ai/recommend-template/route';
import { recommendTemplate } from '@/lib/ai/huggingface-service';
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

const mockRecommendTemplate = jest.mocked(recommendTemplate);
const mockGetUserSession = jest.mocked(getUserSession);
const mockCreateSupabaseClient = jest.mocked(createSupabaseClient);
const mockWithAuth = jest.mocked(withAuth);
const mockWithRateLimit = jest.mocked(withRateLimit);
const mockLogger = jest.mocked(logger);
const mockTrackEvent = jest.mocked(trackEvent);

describe('AI Recommend Template API Route', () => {
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
      'https://example.com/api/v1/ai/recommend-template',
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

  describe('Successful Template Recommendation', () => {
    const mockUserId = 'user_123';
    const mockSession = {
      user: { id: mockUserId, email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetUserSession.mockResolvedValue(mockSession);
    });

    it('should recommend template based on user profile', async () => {
      const requestBody = {
        userProfile: {
          profession: 'Full Stack Developer',
          experience: '5 years',
          skills: ['React', 'Node.js', 'Python', 'AWS'],
          style: 'modern and minimal',
        },
      };

      // Mock user with AI credits
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          ai_credits: 10,
          subscription_plan: 'pro',
        },
        error: null,
      });

      // Mock AI recommendation
      mockRecommendTemplate.mockResolvedValue({
        template: 'developer',
        confidence: 85,
        reasoning:
          'Your technical background and preference for minimal design make the developer template ideal. It highlights code projects effectively.',
        alternatives: [
          { template: 'consultant', confidence: 10 },
          { template: 'designer', confidence: 5 },
        ],
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
        template: 'developer',
        confidence: 85,
        reasoning: expect.stringContaining('technical background'),
        alternatives: [
          { template: 'consultant', confidence: 10 },
          { template: 'designer', confidence: 5 },
        ],
        creditsRemaining: 9,
      });

      // Verify credit deduction (1 credit for template recommendation)
      expect(mockSupabase.update).toHaveBeenCalledWith({
        ai_credits: 9,
      });

      // Verify usage tracking
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        type: 'template_recommendation',
        credits_used: 1,
        metadata: {
          recommended_template: 'developer',
          confidence: 85,
          profession: 'Full Stack Developer',
        },
      });

      // Verify analytics
      expect(mockTrackEvent).toHaveBeenCalledWith({
        userId: mockUserId,
        event: 'ai_template_recommended',
        properties: {
          template: 'developer',
          confidence: 85,
          credits_used: 1,
          subscription_plan: 'pro',
        },
      });
    });

    it('should handle designer profile recommendation', async () => {
      const requestBody = {
        userProfile: {
          profession: 'UI/UX Designer',
          experience: '3 years',
          skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping'],
          style: 'creative and bold',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 5 },
        error: null,
      });

      mockRecommendTemplate.mockResolvedValue({
        template: 'designer',
        confidence: 92,
        reasoning:
          'Your creative background and portfolio focus suggest the designer template would best showcase your visual work.',
        alternatives: [
          { template: 'freelancer', confidence: 5 },
          { template: 'developer', confidence: 3 },
        ],
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(result.template).toBe('designer');
      expect(result.confidence).toBe(92);
    });

    it('should handle consultant profile recommendation', async () => {
      const requestBody = {
        userProfile: {
          profession: 'Business Consultant',
          experience: '10 years',
          skills: ['Strategy', 'Finance', 'Project Management'],
          style: 'professional and corporate',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 8 },
        error: null,
      });

      mockRecommendTemplate.mockResolvedValue({
        template: 'consultant',
        confidence: 88,
        reasoning:
          'Your business expertise and corporate style align perfectly with the consultant template.',
        alternatives: [
          { template: 'executive', confidence: 8 },
          { template: 'freelancer', confidence: 4 },
        ],
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(result.template).toBe('consultant');
    });

    it('should handle minimal profile information', async () => {
      const requestBody = {
        userProfile: {
          profession: 'Professional',
          experience: 'Some',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 3 },
        error: null,
      });

      mockRecommendTemplate.mockResolvedValue({
        template: 'minimal',
        confidence: 60,
        reasoning:
          'Based on limited information, the minimal template provides flexibility.',
        alternatives: [],
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

    it('should validate user profile is required', async () => {
      const request = createMockRequest({
        // Missing userProfile
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('User profile is required');
    });

    it('should validate profession is required', async () => {
      const request = createMockRequest({
        userProfile: {
          // Missing profession
          experience: '5 years',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Profession is required');
    });

    it('should validate skills array format', async () => {
      const request = createMockRequest({
        userProfile: {
          profession: 'Developer',
          experience: '5 years',
          skills: 'React, Node.js', // Should be array
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Skills must be an array');
    });

    it('should validate skills array length', async () => {
      const request = createMockRequest({
        userProfile: {
          profession: 'Developer',
          experience: '5 years',
          skills: Array(51).fill('skill'), // Too many
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Maximum 50 skills allowed');
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

    it('should reject when user has no credits', async () => {
      const requestBody = {
        userProfile: {
          profession: 'Developer',
          experience: '5 years',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          ai_credits: 0,
          subscription_plan: 'free',
        },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toBe('Insufficient AI credits');
      expect(result.creditsRequired).toBe(1);
      expect(result.creditsAvailable).toBe(0);
    });

    it('should handle enterprise unlimited credits', async () => {
      const requestBody = {
        userProfile: {
          profession: 'CTO',
          experience: '15 years',
          skills: ['Leadership', 'Architecture', 'Strategy'],
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

      mockRecommendTemplate.mockResolvedValue({
        template: 'executive',
        confidence: 90,
        reasoning: 'Your executive experience warrants the executive template.',
        alternatives: [],
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

  describe('Low Confidence Recommendations', () => {
    const mockUserId = 'user_123';
    const mockSession = {
      user: { id: mockUserId, email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetUserSession.mockResolvedValue(mockSession);
    });

    it('should warn on low confidence recommendations', async () => {
      const requestBody = {
        userProfile: {
          profession: 'Jack of all trades',
          experience: 'Varied',
          skills: ['Everything'],
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 5 },
        error: null,
      });

      mockRecommendTemplate.mockResolvedValue({
        template: 'minimal',
        confidence: 40,
        reasoning: 'Profile is too general for specific recommendation.',
        alternatives: [
          { template: 'developer', confidence: 30 },
          { template: 'designer', confidence: 20 },
          { template: 'consultant', confidence: 10 },
        ],
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.confidence).toBe(40);
      expect(result.alternatives).toHaveLength(3);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Low confidence template recommendation',
        expect.objectContaining({
          confidence: 40,
          userId: mockUserId,
        })
      );
    });

    it('should provide multiple alternatives for ambiguous profiles', async () => {
      const requestBody = {
        userProfile: {
          profession: 'Creative Developer',
          experience: '7 years',
          skills: ['React', 'Design', 'UX', 'Node.js', 'Figma'],
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 10 },
        error: null,
      });

      mockRecommendTemplate.mockResolvedValue({
        template: 'developer',
        confidence: 55,
        reasoning:
          'Mixed technical and creative skills suggest multiple options.',
        alternatives: [
          { template: 'designer', confidence: 40 },
          { template: 'freelancer', confidence: 5 },
        ],
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(result.alternatives).toHaveLength(2);
      expect(result.alternatives[0].confidence).toBe(40);
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
        userProfile: {
          profession: 'Developer',
          experience: '5 years',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 10 },
        error: null,
      });

      mockRecommendTemplate.mockResolvedValue({
        template: 'minimal', // Fallback
        confidence: 0,
        reasoning: '',
        alternatives: [],
        error: 'AI classification failed',
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.error).toBe('AI recommendation failed');
      expect(result.details).toBe('AI classification failed');

      // Should not deduct credits on failure
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    it('should handle complete AI failure with fallback', async () => {
      const requestBody = {
        userProfile: {
          profession: 'Software Engineer',
          experience: '8 years',
          skills: ['Python', 'Django', 'PostgreSQL'],
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 5 },
        error: null,
      });

      mockRecommendTemplate.mockRejectedValue(
        new Error('AI service unavailable')
      );

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.error).toContain('recommendation failed');
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

    it('should track recommendation patterns', async () => {
      const requestBody = {
        userProfile: {
          profession: 'Data Scientist',
          experience: '6 years',
          skills: ['Python', 'R', 'TensorFlow', 'SQL'],
          style: 'technical and data-driven',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 15, subscription_plan: 'pro' },
        error: null,
      });

      mockRecommendTemplate.mockResolvedValue({
        template: 'developer',
        confidence: 78,
        reasoning:
          'Technical background with data focus suits developer template.',
        alternatives: [
          { template: 'researcher', confidence: 15 },
          { template: 'consultant', confidence: 7 },
        ],
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
        event: 'ai_template_recommended',
        properties: {
          template: 'developer',
          confidence: 78,
          credits_used: 1,
          subscription_plan: 'pro',
        },
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Template recommended via API',
        expect.objectContaining({
          userId: mockUserId,
          template: 'developer',
          confidence: 78,
          profession: 'Data Scientist',
        })
      );
    });

    it('should track failed recommendations', async () => {
      const requestBody = {
        userProfile: {
          profession: 'Test',
          experience: 'Test',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 0 },
        error: null,
      });

      const request = createMockRequest(requestBody);
      await POST(request);

      expect(mockTrackEvent).toHaveBeenCalledWith({
        userId: mockUserId,
        event: 'ai_template_recommendation_failed',
        properties: {
          reason: 'insufficient_credits',
          credits_available: 0,
          credits_required: 1,
        },
      });
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

    it('should handle unusual professions', async () => {
      const requestBody = {
        userProfile: {
          profession: 'Underwater Basket Weaver',
          experience: '20 years',
          skills: ['Weaving', 'Swimming', 'Creativity'],
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 5 },
        error: null,
      });

      mockRecommendTemplate.mockResolvedValue({
        template: 'freelancer',
        confidence: 65,
        reasoning: 'Unique profession best suited for freelancer template.',
        alternatives: [
          { template: 'creative', confidence: 25 },
          { template: 'minimal', confidence: 10 },
        ],
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.template).toBe('freelancer');
    });

    it('should sanitize malicious input', async () => {
      const requestBody = {
        userProfile: {
          profession: '<script>alert("XSS")</script>Developer',
          experience: '5 years<img src=x onerror=alert("XSS")>',
          skills: ['<script>evil()</script>', 'JavaScript'],
          style: 'modern</style><script>hack()</script>',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 10 },
        error: null,
      });

      mockRecommendTemplate.mockResolvedValue({
        template: 'developer',
        confidence: 80,
        reasoning: 'Developer profile detected.',
        alternatives: [],
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      await POST(request);

      // Should sanitize input before sending to AI
      expect(mockRecommendTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          profession: expect.not.stringContaining('<script>'),
          experience: expect.not.stringContaining('<img'),
          skills: expect.arrayContaining([
            expect.not.stringContaining('<script>'),
          ]),
        })
      );
    });

    it('should handle very long skill lists', async () => {
      const requestBody = {
        userProfile: {
          profession: 'Full Stack Developer',
          experience: '10 years',
          skills: Array(30)
            .fill(null)
            .map((_, i) => `Skill${i}`),
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 20 },
        error: null,
      });

      mockRecommendTemplate.mockResolvedValue({
        template: 'developer',
        confidence: 85,
        reasoning: 'Extensive skill set indicates developer template.',
        alternatives: [],
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

    it('should handle international characters', async () => {
      const requestBody = {
        userProfile: {
          profession: 'Développeur Full Stack',
          experience: '5 años',
          skills: ['React', 'Node.js', '中文测试'],
          style: 'moderne et minimaliste',
        },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 10 },
        error: null,
      });

      mockRecommendTemplate.mockResolvedValue({
        template: 'developer',
        confidence: 82,
        reasoning: 'Technical profile suits developer template.',
        alternatives: [],
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.template).toBe('developer');
    });
  });
});
