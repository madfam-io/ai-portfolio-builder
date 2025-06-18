/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { setupCommonMocks, createMockRequest, defaultSupabaseMock } from '@/__tests__/utils/api-route-test-helpers';

describe('Stripe Webhook Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const createWebhookRequest = (
    body: any,
    signature: string = 'test_signature'
  ) => {
    return {
      text: jest.fn().mockResolvedValue(JSON.stringify(body)),
      headers: {
        get: jest.fn((name: string) => {
          if (name === 'stripe-signature') return signature;
          return null;
        }),
      },
    } as unknown as NextRequest;
  };

  describe('checkout.session.completed', () => {
    it('should handle successful subscription checkout', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_subscription',
            customer: 'cus_123',
            subscription: 'sub_123',
            metadata: {
              userId: 'user_123',
              planId: 'pro',
            },
            customer_details: {
              email: 'test@example.com',
            },
          },
        },
      };

      const mockRequest = createMockRequest(mockEvent);

      mockHandleWebhookEvent.mockImplementation(
        async (_rawBody, _signature, handlers) => {
          // Call the checkout handler
          await handlers['checkout.session.completed'](mockEvent);
          return { received: true };
        }

      // Mock user lookup
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123', email: 'test@example.com' },
        error: null,
      });

      // Mock subscription update
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123', subscription_plan: 'pro' },
        error: null,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ received: true });

      // Verify user was updated with subscription
      expect(mockSupabase.update).toHaveBeenCalledWith({
        subscription_plan: 'pro',
        subscription_id: 'sub_123',
        stripe_customer_id: 'cus_123',
        subscription_status: 'active',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Subscription created for user',
        expect.objectContaining({
          userId: 'user_123',
          plan: 'pro',
        })
    });

    it('should handle AI credit pack purchase', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_credits',
            customer: 'cus_123',
            metadata: {
              userId: 'user_123',
              creditPack: 'medium',
              credits: '25',
            },
            payment_status: 'paid',
          },
        },
      };

      const mockRequest = createMockRequest(mockEvent);

      mockHandleWebhookEvent.mockImplementation(
        async (rawBody, signature, handlers) => {
          await handlers['checkout.session.completed'](mockEvent);
          return { received: true };
        }

      // Mock user lookup
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123', ai_credits: 10 },
        error: null,
      });

      // Mock credit update
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123', ai_credits: 35 },
        error: null,
      });

      // Mock credit purchase log
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'purchase_123' },
        error: null,
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(200);

      // Verify credits were added
      expect(mockSupabase.update).toHaveBeenCalledWith({
        ai_credits: 35, // 10 existing + 25 new
      });

      // Verify purchase was logged
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: 'user_123',
        pack_type: 'medium',
        credits: 25,
        amount: expect.any(Number),
        stripe_payment_id: 'cs_test_credits',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'AI credits purchased',
        expect.objectContaining({
          userId: 'user_123',
          pack: 'medium',
          credits: 25,
        })
    });

    it('should handle missing user gracefully', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_orphan',
            metadata: {
              userId: 'user_nonexistent',
              planId: 'pro',
            },
            subscription: 'sub_123',
          },
        },
      };

      const mockRequest = createMockRequest(mockEvent);

      mockHandleWebhookEvent.mockImplementation(
        async (rawBody, signature, handlers) => {
          await handlers['checkout.session.completed'](mockEvent);
          return { received: true };
        }

      // Mock user not found
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'User not found' },
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(200); // Webhook should still return 200
      expect(mockLogger.error).toHaveBeenCalledWith(
        'User not found for checkout session',
        expect.objectContaining({
          userId: 'user_nonexistent',
        })
    });
  });

  describe('customer.subscription.updated', () => {
    it('should update subscription status', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            items: {
              data: [
                {
                  price: {
                    id: 'price_pro',
                    product: 'prod_pro',
                  },
                },
              ],
            },
            current_period_end:
              Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          },
        },
      };

      const mockRequest = createMockRequest(mockEvent);

      mockHandleWebhookEvent.mockImplementation(
        async (rawBody, signature, handlers) => {
          await handlers['customer.subscription.updated'](mockEvent);
          return { received: true };
        }

      // Mock user lookup by Stripe customer ID
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123', subscription_id: 'sub_123' },
        error: null,
      });

      // Mock subscription update
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123' },
        error: null,
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(200);

      expect(mockSupabase.update).toHaveBeenCalledWith({
        subscription_status: 'active',
        subscription_period_end: expect.any(Date),
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Subscription updated',
        expect.objectContaining({
          subscriptionId: 'sub_123',
          status: 'active',
        })
    });

    it('should handle plan changes', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            items: {
              data: [
                {
                  price: {
                    id: 'price_business',
                    product: 'prod_business',
                  },
                },
              ],
            },
          },
        },
      };

      const mockRequest = createMockRequest(mockEvent);

      mockHandleWebhookEvent.mockImplementation(
        async (rawBody, signature, handlers) => {
          await handlers['customer.subscription.updated'](mockEvent);
          return { received: true };
        }

      // Mock user lookup
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123', subscription_plan: 'pro' },
        error: null,
      });

      // Mock plan update
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123' },
        error: null,
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(200);

      // Should detect plan change from price ID
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_plan: 'business',
        })
    });
  });

  describe('customer.subscription.deleted', () => {
    it('should downgrade user to free plan', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
          },
        },
      };

      const mockRequest = createMockRequest(mockEvent);

      mockHandleWebhookEvent.mockImplementation(
        async (rawBody, signature, handlers) => {
          await handlers['customer.subscription.deleted'](mockEvent);
          return { received: true };
        }

      // Mock user lookup
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123', subscription_id: 'sub_123' },
        error: null,
      });

      // Mock downgrade
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123' },
        error: null,
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(200);

      expect(mockSupabase.update).toHaveBeenCalledWith({
        subscription_plan: 'free',
        subscription_id: null,
        subscription_status: 'canceled',
        subscription_period_end: null,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Subscription canceled',
        expect.objectContaining({
          subscriptionId: 'sub_123',
        })
    });
  });

  describe('invoice.payment_failed', () => {
    it('should handle payment failures', async () => {
      const mockEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'inv_123',
            customer: 'cus_123',
            subscription: 'sub_123',
            attempt_count: 2,
          },
        },
      };

      const mockRequest = createMockRequest(mockEvent);

      mockHandleWebhookEvent.mockImplementation(
        async (rawBody, signature, handlers) => {
          await handlers['invoice.payment_failed'](mockEvent);
          return { received: true };
        }

      // Mock user lookup
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123', email: 'test@example.com' },
        error: null,
      });

      // Mock status update
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123' },
        error: null,
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(200);

      expect(mockSupabase.update).toHaveBeenCalledWith({
        subscription_status: 'past_due',
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Payment failed for subscription',
        expect.objectContaining({
          subscriptionId: 'sub_123',
          attemptCount: 2,
        })
    });
  });

  describe('Error Handling', () => {
    it('should handle missing signature', async () => {
      const mockRequest = createMockRequest({}, '');

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('No Stripe signature found');
    });

    it('should handle webhook processing errors', async () => {
      const mockRequest = createMockRequest({ type: 'test' });

      mockHandleWebhookEvent.mockRejectedValue(
        new Error('Webhook processing failed')

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Webhook error: Webhook processing failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Webhook processing error',
        expect.any(Error)

    });

    it('should handle database errors gracefully', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_db_error',
            metadata: { userId: 'user_123', planId: 'pro' },
            subscription: 'sub_123',
          },
        },
      };

      const mockRequest = createMockRequest(mockEvent);

      mockHandleWebhookEvent.mockImplementation(
        async (rawBody, signature, handlers) => {
          await handlers['checkout.session.completed'](mockEvent);
          return { received: true };
        }

      // Mock database error
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST000', message: 'Database connection failed' },
      });

      const response = await POST(mockRequest);

      // Should still return 200 to acknowledge receipt
      expect(response.status).toBe(200);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        expect.any(Error)

    });
  });

  describe('Event Validation', () => {
    it('should validate event signatures', async () => {
      const mockEvent = { type: 'test.event', data: {} };
      const mockRequest = createMockRequest(mockEvent, 'valid_signature');

      mockHandleWebhookEvent.mockResolvedValue({ received: true });

      await POST(mockRequest);

      expect(mockHandleWebhookEvent).toHaveBeenCalledWith(
        JSON.stringify(mockEvent),
        'valid_signature',
        expect.any(Object)

    });

    it('should handle unrecognized events', async () => {
      const mockEvent = {
        type: 'unknown.event.type',
        data: { object: {} },
      };

      const mockRequest = createMockRequest(mockEvent);

      mockHandleWebhookEvent.mockResolvedValue({ received: true });

      const response = await POST(mockRequest);

      expect(response.status).toBe(200);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Webhook received',
        expect.objectContaining({ type: 'unknown.event.type' })
    });
  });
});
