import { NextRequest } from 'next/server';
import { POST } from '../../../../../../app/api/v1/stripe/webhook/route';
import Stripe from 'stripe';

// Mock dependencies
jest.mock('@/lib/services/stripe/stripe', () => ({
  stripeService: {
    isAvailable: jest.fn(),
    verifyWebhookSignature: jest.fn(),
  },
}));

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

// Import mocked dependencies
import { stripeService } from '@/lib/services/stripe/stripe';
import { logger } from '@/lib/utils/logger';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

describe('Stripe Webhook API Route', () => {
  let mockSupabaseClient: any;
  let mockUpdate: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up Supabase mocks
    mockUpdate = jest.fn().mockResolvedValue({ error: null });
    mockSelect = jest.fn().mockResolvedValue({ data: null, error: null });
    mockInsert = jest.fn().mockResolvedValue({ error: null });
    
    mockSupabaseClient = {
      from: jest.fn((table: string) => {
        if (table === 'users') {
          return {
            update: jest.fn(() => ({
              eq: mockUpdate,
            })),
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: mockSelect,
              })),
            })),
          };
        }
        if (table === 'ai_credit_purchases') {
          return {
            insert: mockInsert,
          };
        }
        return {};
      }),
    };
    
    // Default mocks
    (stripeService.isAvailable as jest.Mock).mockReturnValue(true);
    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);
    (headers as jest.Mock).mockResolvedValue(
      new Map([['stripe-signature', 'valid-signature']])
    );
  });

  const createRequest = (body: string, signature?: string) => {
    const mockHeaders = new Map();
    if (signature) {
      mockHeaders.set('stripe-signature', signature);
    }
    
    (headers as jest.Mock).mockResolvedValue(mockHeaders);
    
    return {
      text: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  const createStripeEvent = (
    type: string,
    data: any
  ): Stripe.Event => ({
    id: 'evt_test_123',
    type: type as any,
    data: {
      object: data,
    },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    api_version: '2023-10-16',
    object: 'event',
  });

  describe('Basic Webhook Validation', () => {
    it('should return 503 when Stripe service is not available', async () => {
      (stripeService.isAvailable as jest.Mock).mockReturnValue(false);
      
      const request = createRequest('test-body');
      const response = await POST(request);
      
      expect(response.status).toBe(503);
      const body = await response.json();
      expect(body.error).toBe('Payment service unavailable');
      expect(logger.error).toHaveBeenCalledWith(
        'Stripe webhook received but service not available'
      );
    });

    it('should return 400 when stripe-signature header is missing', async () => {
      const request = createRequest('test-body');
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Missing signature');
      expect(logger.error).toHaveBeenCalledWith('Missing stripe-signature header');
    });

    it('should return 400 when webhook signature verification fails', async () => {
      (stripeService.verifyWebhookSignature as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      
      const request = createRequest('test-body', 'invalid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid signature');
      expect(logger.error).toHaveBeenCalledWith(
        'Webhook signature verification failed',
        { error: expect.any(Error) }
      );
    });

    it('should log event processing start', async () => {
      const event = createStripeEvent('customer.subscription.created', {
        id: 'sub_123',
        status: 'active',
      });
      
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const request = createRequest('test-body', 'valid-signature');
      await POST(request);
      
      expect(logger.info).toHaveBeenCalledWith(
        'Processing Stripe webhook',
        {
          eventId: 'evt_test_123',
          eventType: 'customer.subscription.created',
        }
      );
    });
  });

  describe('Checkout Session Completed', () => {
    it('should handle successful subscription checkout', async () => {
      const sessionData = {
        id: 'cs_test_123',
        customer: 'cus_test_123',
        metadata: {
          userId: 'user-123',
          planId: 'pro',
        },
      };
      
      const event = createStripeEvent('checkout.session.completed', sessionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      // Mock successful database update
      mockUpdate.mockResolvedValue({ error: null });
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.received).toBe(true);
      
      // Verify database update
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockUpdate).toHaveBeenCalled();
      
      expect(logger.info).toHaveBeenCalledWith(
        'User subscription updated after checkout',
        {
          userId: 'user-123',
          planId: 'pro',
          sessionId: 'cs_test_123',
        }
      );
    });

    it('should handle AI credit pack purchase', async () => {
      const sessionData = {
        id: 'cs_test_123',
        amount_total: 2000, // $20.00 in cents
        metadata: {
          userId: 'user-123',
          type: 'ai_credit_pack',
          credits: '100',
        },
      };
      
      const event = createStripeEvent('checkout.session.completed', sessionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      // Mock user fetch and update
      mockSelect.mockResolvedValue({
        data: { ai_credits: 50 },
        error: null,
      });
      mockUpdate.mockResolvedValue({ error: null });
      mockInsert.mockResolvedValue({ error: null });
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      
      // Verify credit update (50 + 100 = 150)
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        credits_purchased: 100,
        amount_paid: 2000,
        stripe_session_id: 'cs_test_123',
        created_at: expect.any(String),
      });
      
      expect(logger.info).toHaveBeenCalledWith(
        'AI credit pack purchase completed',
        {
          userId: 'user-123',
          credits: 100,
          newBalance: 150,
          sessionId: 'cs_test_123',
        }
      );
    });

    it('should handle missing userId in checkout session', async () => {
      const sessionData = {
        id: 'cs_test_123',
        metadata: {
          planId: 'pro', // Missing userId
        },
      };
      
      const event = createStripeEvent('checkout.session.completed', sessionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.error).toHaveBeenCalledWith(
        'Missing userId in checkout session',
        {
          sessionId: 'cs_test_123',
          metadata: { planId: 'pro' },
        }
      );
    });

    it('should handle missing planId in subscription checkout', async () => {
      const sessionData = {
        id: 'cs_test_123',
        metadata: {
          userId: 'user-123', // Missing planId
        },
      };
      
      const event = createStripeEvent('checkout.session.completed', sessionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.error).toHaveBeenCalledWith(
        'Missing planId in checkout session',
        {
          sessionId: 'cs_test_123',
          metadata: { userId: 'user-123' },
        }
      );
    });

    it('should handle database unavailable during checkout', async () => {
      const sessionData = {
        id: 'cs_test_123',
        metadata: {
          userId: 'user-123',
          planId: 'pro',
        },
      };
      
      const event = createStripeEvent('checkout.session.completed', sessionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      (createClient as jest.Mock).mockResolvedValue(null);
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.error).toHaveBeenCalledWith(
        'Database not available for checkout completion',
        {
          userId: 'user-123',
          sessionId: 'cs_test_123',
        }
      );
    });
  });

  describe('Subscription Lifecycle Events', () => {
    it('should handle subscription created', async () => {
      const subscriptionData = {
        id: 'sub_test_123',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
        metadata: {
          userId: 'user-123',
          planId: 'pro',
        },
      };
      
      const event = createStripeEvent('customer.subscription.created', subscriptionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: mockUpdate,
        }),
      });
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith('id', 'user-123');
      expect(logger.info).toHaveBeenCalledWith(
        'User subscription created',
        expect.objectContaining({
          userId: 'user-123',
          subscriptionId: 'sub_test_123',
          status: 'active',
        })
      );
    });

    it('should handle subscription updated', async () => {
      const subscriptionData = {
        id: 'sub_test_123',
        status: 'past_due',
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        metadata: {
          userId: 'user-123',
        },
      };
      
      const event = createStripeEvent('customer.subscription.updated', subscriptionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: mockUpdate,
        }),
      });
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.info).toHaveBeenCalledWith(
        'User subscription updated',
        expect.objectContaining({
          userId: 'user-123',
          subscriptionId: 'sub_test_123',
          status: 'past_due',
        })
      );
    });

    it('should handle subscription deleted/cancelled', async () => {
      const subscriptionData = {
        id: 'sub_test_123',
        status: 'canceled',
        metadata: {
          userId: 'user-123',
        },
      };
      
      const event = createStripeEvent('customer.subscription.deleted', subscriptionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: mockUpdate,
        }),
      });
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.info).toHaveBeenCalledWith(
        'User subscription cancelled',
        {
          userId: 'user-123',
          subscriptionId: 'sub_test_123',
        }
      );
    });

    it('should handle missing userId in subscription events', async () => {
      const subscriptionData = {
        id: 'sub_test_123',
        status: 'active',
        metadata: {}, // Missing userId
      };
      
      const event = createStripeEvent('customer.subscription.created', subscriptionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.error).toHaveBeenCalledWith(
        'Missing userId in subscription metadata',
        {
          subscriptionId: 'sub_test_123',
          metadata: {},
        }
      );
    });

    it('should handle database errors during subscription updates', async () => {
      const subscriptionData = {
        id: 'sub_test_123',
        status: 'active',
        metadata: {
          userId: 'user-123',
        },
      };
      
      const event = createStripeEvent('customer.subscription.updated', subscriptionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      // Override the default mock for this test
      mockUpdate.mockResolvedValue({
        error: new Error('Database error'),
      });
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.error).toHaveBeenCalledWith(
        'Error handling subscription update',
        expect.objectContaining({
          error: expect.any(Error),
          userId: 'user-123',
          subscriptionId: 'sub_test_123',
        })
      );
    });
  });

  describe('Payment Events', () => {
    it('should handle successful payment for subscription', async () => {
      const invoiceData = {
        id: 'in_test_123',
        subscription: 'sub_test_123',
        amount_paid: 2999, // $29.99
      };
      
      const event = createStripeEvent('invoice.payment_succeeded', invoiceData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.info).toHaveBeenCalledWith(
        'Payment succeeded for subscription',
        {
          subscriptionId: 'sub_test_123',
          invoiceId: 'in_test_123',
          amount: 2999,
        }
      );
    });

    it('should handle failed payment for subscription', async () => {
      const invoiceData = {
        id: 'in_test_123',
        subscription: 'sub_test_123',
        amount_due: 2999,
      };
      
      const event = createStripeEvent('invoice.payment_failed', invoiceData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.error).toHaveBeenCalledWith(
        'Payment failed for subscription',
        {
          subscriptionId: 'sub_test_123',
          invoiceId: 'in_test_123',
          amount: 2999,
        }
      );
    });

    it('should handle payment events for non-subscription invoices', async () => {
      const invoiceData = {
        id: 'in_test_123',
        subscription: null, // Not a subscription
        amount_paid: 1000,
      };
      
      const event = createStripeEvent('invoice.payment_succeeded', invoiceData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.info).toHaveBeenCalledWith(
        'Payment succeeded for non-subscription invoice',
        {
          invoiceId: 'in_test_123',
        }
      );
    });
  });

  describe('Unhandled Events', () => {
    it('should log unhandled webhook events', async () => {
      const event = createStripeEvent('customer.created', {
        id: 'cus_test_123',
      });
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.info).toHaveBeenCalledWith(
        'Unhandled webhook event',
        { eventType: 'customer.created' }
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors during processing', async () => {
      const event = createStripeEvent('checkout.session.completed', {
        id: 'cs_test_123',
        metadata: {
          userId: 'user-123',
          planId: 'pro',
        },
      });
      
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      (createClient as jest.Mock).mockRejectedValue(new Error('Unexpected error'));
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Webhook processing failed');
      expect(logger.error).toHaveBeenCalledWith(
        'Webhook processing failed',
        { error: expect.any(Error) }
      );
    });

    it('should handle AppError with custom status code', async () => {
      // Import the actual AppError class
      const { AppError } = await import('@/types/errors');
      
      const appError = new AppError('Custom error', 'CUSTOM_ERROR', 422);
      
      const event = createStripeEvent('checkout.session.completed', {
        id: 'cs_test_123',
        metadata: {
          userId: 'user-123',
          planId: 'pro',
        },
      });
      
      // First allow signature verification to succeed
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      // Then make the database operation fail with AppError
      (createClient as jest.Mock).mockRejectedValue(appError);
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.error).toBe('Custom error');
    });
  });

  describe('Credit Pack Purchase Edge Cases', () => {
    it('should handle missing credits metadata', async () => {
      const sessionData = {
        id: 'cs_test_123',
        metadata: {
          userId: 'user-123',
          type: 'ai_credit_pack',
          // Missing credits
        },
      };
      
      const event = createStripeEvent('checkout.session.completed', sessionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.error).toHaveBeenCalledWith(
        'Missing metadata for credit pack purchase',
        {
          sessionId: 'cs_test_123',
          metadata: {
            userId: 'user-123',
            type: 'ai_credit_pack',
          },
        }
      );
    });

    it('should handle database error when fetching user credits', async () => {
      const sessionData = {
        id: 'cs_test_123',
        metadata: {
          userId: 'user-123',
          type: 'ai_credit_pack',
          credits: '100',
        },
      };
      
      const event = createStripeEvent('checkout.session.completed', sessionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const mockSelect = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Fetch error'),
      });
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSelect,
          }),
        }),
      });
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch user for credit update',
        expect.objectContaining({
          error: expect.any(Error),
          userId: 'user-123',
        })
      );
    });

    it('should handle database error when updating user credits', async () => {
      const sessionData = {
        id: 'cs_test_123',
        metadata: {
          userId: 'user-123',
          type: 'ai_credit_pack',
          credits: '100',
        },
      };
      
      const event = createStripeEvent('checkout.session.completed', sessionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const mockSelect = jest.fn().mockResolvedValue({
        data: { ai_credits: 50 },
        error: null,
      });
      const mockUpdate = jest.fn().mockResolvedValue({
        error: new Error('Update error'),
      });
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSelect,
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: mockUpdate,
        }),
      });
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to update user credits',
        expect.objectContaining({
          error: expect.any(Error),
          userId: 'user-123',
          credits: 100,
        })
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete subscription lifecycle', async () => {
      const userId = 'user-123';
      const subscriptionId = 'sub_test_123';
      
      // 1. Checkout completed
      const checkoutEvent = createStripeEvent('checkout.session.completed', {
        id: 'cs_test_123',
        customer: 'cus_test_123',
        metadata: { userId, planId: 'pro' },
      });
      
      // 2. Subscription created
      const subscriptionEvent = createStripeEvent('customer.subscription.created', {
        id: subscriptionId,
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        metadata: { userId, planId: 'pro' },
      });
      
      // 3. Payment succeeded
      const paymentEvent = createStripeEvent('invoice.payment_succeeded', {
        id: 'in_test_123',
        subscription: subscriptionId,
        amount_paid: 2999,
      });
      
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: mockUpdate,
        }),
      });
      
      // Process each event
      for (const event of [checkoutEvent, subscriptionEvent, paymentEvent]) {
        (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
        
        const request = createRequest('test-body', 'valid-signature');
        const response = await POST(request);
        
        expect(response.status).toBe(200);
      }
      
      // Verify all events were logged
      expect(logger.info).toHaveBeenCalledWith(
        'User subscription updated after checkout',
        expect.any(Object)
      );
      expect(logger.info).toHaveBeenCalledWith(
        'User subscription created',
        expect.any(Object)
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Payment succeeded for subscription',
        expect.any(Object)
      );
    });

    it('should handle credit pack purchase with existing credits', async () => {
      const userId = 'user-123';
      const existingCredits = 25;
      const purchasedCredits = 100;
      
      const sessionData = {
        id: 'cs_test_123',
        amount_total: 2000,
        metadata: {
          userId,
          type: 'ai_credit_pack',
          credits: purchasedCredits.toString(),
        },
      };
      
      const event = createStripeEvent('checkout.session.completed', sessionData);
      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(event);
      
      const mockSelect = jest.fn().mockResolvedValue({
        data: { ai_credits: existingCredits },
        error: null,
      });
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: mockSelect,
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: mockUpdate,
            }),
          };
        }
        if (table === 'ai_credit_purchases') {
          return {
            insert: mockInsert,
          };
        }
        return {};
      });
      
      const request = createRequest('test-body', 'valid-signature');
      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(logger.info).toHaveBeenCalledWith(
        'AI credit pack purchase completed',
        {
          userId,
          credits: purchasedCredits,
          newBalance: existingCredits + purchasedCredits,
          sessionId: 'cs_test_123',
        }
      );
    });
  });
});