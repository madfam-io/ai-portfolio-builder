/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/ai/enhance-bio/route';
import { enhanceBio } from '@/lib/ai/huggingface-service';
import { getUserSession } from '@/lib/auth/session';
import { createSupabaseClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/api/middleware/auth';
import { withRateLimit } from '@/lib/api/middleware/rate-limit';
import { logger } from '@/lib/utils/logger';
import { trackEvent } from '@/lib/analytics/posthog';

// Mock dependencies
jest.mock('@/lib/ai/huggingface-service');
jest.mock('@/lib/auth/session');
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/middleware/auth');
jest.mock('@/lib/api/middleware/rate-limit');
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/analytics/posthog');

const mockEnhanceBio = jest.mocked(enhanceBio);
const mockGetUserSession = jest.mocked(getUserSession);
const mockCreateSupabaseClient = jest.mocked(createSupabaseClient);
const mockWithAuth = jest.mocked(withAuth);
const mockWithRateLimit = jest.mocked(withRateLimit);
const mockLogger = jest.mocked(logger);
const mockTrackEvent = jest.mocked(trackEvent);

describe('AI Enhance Bio API Route', () => {
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
      'https://example.com/api/v1/ai/enhance-bio',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    // Mock JSON method
    request.json = jest.fn().mockResolvedValue(body);

    return request;
  };

  describe('Successful Bio Enhancement', () => {
    const mockUserId = 'user_123';
    const mockSession = {
      user: { id: mockUserId, email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetUserSession.mockResolvedValue(mockSession);
    });

    it('should enhance bio with AI credits', async () => {
      const requestBody = {
        bio: 'I am a software developer with 5 years of experience.',
        model: 'llama-3.1-70b',
      };

      const enhancedBio =
        'Experienced software developer with 5+ years crafting innovative solutions...';

      // Mock user with AI credits
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          ai_credits: 10,
          subscription_plan: 'pro',
        },
        error: null,
      });

      // Mock AI enhancement
      mockEnhanceBio.mockResolvedValue({
        enhanced: enhancedBio,
        quality: 85,
        model: 'llama-3.1-70b',
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
        enhanced: enhancedBio,
        quality: 85,
        model: 'llama-3.1-70b',
        creditsRemaining: 9,
      });

      // Verify credit deduction
      expect(mockSupabase.update).toHaveBeenCalledWith({
        ai_credits: 9,
      });

      // Verify usage tracking
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        type: 'bio_enhancement',
        credits_used: 1,
        metadata: {
          model: 'llama-3.1-70b',
          quality: 85,
          original_length: requestBody.bio.length,
          enhanced_length: enhancedBio.length,
        },
      });

      // Verify analytics
      expect(mockTrackEvent).toHaveBeenCalledWith({
        userId: mockUserId,
        event: 'ai_bio_enhanced',
        properties: {
          model: 'llama-3.1-70b',
          quality: 85,
          credits_used: 1,
          subscription_plan: 'pro',
        },
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Bio enhanced via API', {
        userId: mockUserId,
        model: 'llama-3.1-70b',
        quality: 85,
      });
    });

    it('should handle unlimited credits for enterprise users', async () => {
      const requestBody = {
        bio: 'Senior developer with expertise in cloud architecture.',
      };

      // Mock enterprise user
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: mockUserId,
          ai_credits: -1, // Unlimited
          subscription_plan: 'enterprise',
        },
        error: null,
      });

      mockEnhanceBio.mockResolvedValue({
        enhanced: 'Enhanced bio...',
        quality: 90,
        model: 'llama-3.1-70b',
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'usage_123' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.creditsRemaining).toBe('unlimited');

      // Should not deduct credits for enterprise
      expect(mockSupabase.update).not.toHaveBeenCalled();

      // Should still track usage
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it('should use default model if not specified', async () => {
      const requestBody = {
        bio: 'Developer bio',
        // No model specified
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 5 },
        error: null,
      });

      mockEnhanceBio.mockResolvedValue({
        enhanced: 'Enhanced bio...',
        quality: 80,
        model: 'llama-3.1-70b',
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest(requestBody);
      await POST(request);

      expect(mockEnhanceBio).toHaveBeenCalledWith(
        requestBody.bio,
        undefined // Should use default model
      );
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

    it('should validate bio is required', async () => {
      const request = createMockRequest({
        // Missing bio
        model: 'llama-3.1-70b',
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Bio text is required');
    });

    it('should validate bio minimum length', async () => {
      const request = createMockRequest({
        bio: 'Hi', // Too short
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Bio must be at least 10 characters');
    });

    it('should validate bio maximum length', async () => {
      const request = createMockRequest({
        bio: 'a'.repeat(1001), // Too long
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Bio must not exceed 1000 characters');
    });

    it('should validate model selection', async () => {
      const request = createMockRequest({
        bio: 'Valid bio text here',
        model: 'invalid-model',
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid AI model');
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

    it('should reject request when user has no credits', async () => {
      const requestBody = {
        bio: 'I need enhancement but have no credits',
      };

      // Mock user with 0 credits
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

      expect(mockEnhanceBio).not.toHaveBeenCalled();
    });

    it('should handle concurrent credit usage', async () => {
      const requestBody = {
        bio: 'Concurrent request test',
      };

      // Mock user check
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 1 },
        error: null,
      });

      // Mock AI enhancement
      mockEnhanceBio.mockResolvedValue({
        enhanced: 'Enhanced...',
        quality: 75,
        model: 'llama-3.1-70b',
        error: null,
      });

      // Mock credit deduction failure (concurrent modification)
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: '23514',
          message: 'Check constraint violation',
        },
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(409);
      expect(result.error).toContain('concurrent');
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

    it('should handle AI service errors gracefully', async () => {
      const requestBody = {
        bio: 'Test bio for error case',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 10 },
        error: null,
      });

      // Mock AI service error
      mockEnhanceBio.mockResolvedValue({
        enhanced: requestBody.bio, // Returns original
        quality: 0,
        model: 'llama-3.1-70b',
        error: 'AI service temporarily unavailable',
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.error).toBe('AI enhancement failed');
      expect(result.details).toBe('AI service temporarily unavailable');

      // Should not deduct credits on failure
      expect(mockSupabase.update).not.toHaveBeenCalled();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'AI enhancement failed',
        expect.objectContaining({
          userId: mockUserId,
          error: 'AI service temporarily unavailable',
        })
      );
    });

    it('should refund credits on post-enhancement failure', async () => {
      const requestBody = {
        bio: 'Test bio',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 5 },
        error: null,
      });

      mockEnhanceBio.mockResolvedValue({
        enhanced: 'Enhanced bio',
        quality: 80,
        model: 'llama-3.1-70b',
        error: null,
      });

      // Mock credit deduction success
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId },
        error: null,
      });

      // Mock usage tracking failure
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      // Mock credit refund
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId },
        error: null,
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);

      // Should still return success but log the error
      expect(response.status).toBe(200);

      // Should refund the credit
      expect(mockSupabase.update).toHaveBeenCalledTimes(2);
      expect(mockSupabase.update).toHaveBeenLastCalledWith({
        ai_credits: 5, // Refunded
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to track AI usage, refunding credit',
        expect.any(Object)
      );
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication', async () => {
      mockGetUserSession.mockResolvedValue(null);

      const request = createMockRequest({
        bio: 'Test bio',
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Unauthorized');
    });

    it('should handle database errors when fetching user', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      };

      mockGetUserSession.mockResolvedValue(mockSession);

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection error' },
      });

      const request = createMockRequest({
        bio: 'Test bio',
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Failed to check AI credits');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply AI-specific rate limits', async () => {
      // Mock rate limit exceeded
      mockWithRateLimit.mockImplementationOnce(() => {
        return () => {
          return new Response(
            JSON.stringify({
              error: 'Too many AI requests',
              retryAfter: 60,
            }),
            {
              status: 429,
              headers: {
                'Retry-After': '60',
                'X-RateLimit-Limit': '10',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
              },
            }
          );
        };
      });

      const request = createMockRequest({
        bio: 'Test bio',
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(429);
      expect(result.error).toBe('Too many AI requests');
      expect(response.headers.get('Retry-After')).toBe('60');
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

    it('should track successful enhancements', async () => {
      const requestBody = {
        bio: 'Track this enhancement',
        model: 'phi-3.5',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 20, subscription_plan: 'pro' },
        error: null,
      });

      mockEnhanceBio.mockResolvedValue({
        enhanced: 'Tracked enhancement',
        quality: 92,
        model: 'phi-3.5',
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
        event: 'ai_bio_enhanced',
        properties: {
          model: 'phi-3.5',
          quality: 92,
          credits_used: 1,
          subscription_plan: 'pro',
        },
      });
    });

    it('should track enhancement failures', async () => {
      const requestBody = {
        bio: 'This will fail',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 0 },
        error: null,
      });

      const request = createMockRequest(requestBody);
      await POST(request);

      expect(mockTrackEvent).toHaveBeenCalledWith({
        userId: mockUserId,
        event: 'ai_bio_enhancement_failed',
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

    it('should handle bio that is already high quality', async () => {
      const highQualityBio = `
        Accomplished software engineer with over a decade of experience 
        architecting scalable distributed systems. Specialized in cloud-native 
        applications, microservices, and DevOps practices. Led teams of 20+ 
        engineers delivering mission-critical applications.
      `.trim();

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 10 },
        error: null,
      });

      mockEnhanceBio.mockResolvedValue({
        enhanced: highQualityBio, // AI returns same bio
        quality: 95,
        model: 'llama-3.1-70b',
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest({
        bio: highQualityBio,
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.quality).toBeGreaterThan(90);

      // Should still track high quality enhancements
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Bio enhanced'),
        expect.objectContaining({
          quality: 95,
        })
      );
    });

    it('should sanitize bio input', async () => {
      const maliciousBio = '<script>alert("XSS")</script>I am a developer';

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockUserId, ai_credits: 5 },
        error: null,
      });

      mockEnhanceBio.mockResolvedValue({
        enhanced: 'I am a developer with expertise...',
        quality: 80,
        model: 'llama-3.1-70b',
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'any' },
        error: null,
      });

      const request = createMockRequest({
        bio: maliciousBio,
      });

      await POST(request);

      // Should sanitize before sending to AI
      expect(mockEnhanceBio).toHaveBeenCalledWith(
        expect.not.stringContaining('<script>'),
        undefined
      );
    });
  });
});
