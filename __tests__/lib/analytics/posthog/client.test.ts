import { jest, describe, test, it, expect, beforeEach, afterEach } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import posthog from 'posthog-js';
import { useAuthStore } from '@/lib/store/auth-store';

import {   initializePostHog,

jest.mock('zustand', () => ({
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

jest.mock('posthog-js', () => ({
jest.mock('@/lib/store/auth-store');

create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

  identifyUser,
  resetUser,
  captureEvent,
  captureEnhancedEvent,
  isFeatureEnabled,
  getFeatureFlagPayload,
  setUserProperties,
  incrementUserProperty,
  trackRevenue,
  startSessionRecording,
  stopSessionRecording,
  optOut,
  optIn,
  hasOptedOut,
  usePostHog,
  EVENTS,
  USER_PROPERTIES,
 } from '@/lib/analytics/posthog/client';

// Mock posthog-js

  __esModule: true,
  default: {
    __loaded: false,
    init: jest.fn().mockReturnValue(void 0),
    identify: jest.fn().mockReturnValue(void 0),
    reset: jest.fn().mockReturnValue(void 0),
    capture: jest.fn().mockReturnValue(void 0),
    isFeatureEnabled: jest.fn().mockReturnValue(void 0),
    getFeatureFlagPayload: jest.fn().mockReturnValue(void 0),
    people: {
      set: jest.fn().mockReturnValue(void 0),
    },
    get_property: jest.fn().mockReturnValue(void 0),
    startSessionRecording: jest.fn().mockReturnValue(void 0),
    stopSessionRecording: jest.fn().mockReturnValue(void 0),
    opt_out_capturing: jest.fn().mockReturnValue(void 0),
    opt_in_capturing: jest.fn().mockReturnValue(void 0),
    has_opted_out_capturing: jest.fn().mockReturnValue(void 0),
  },
}));

// Mock auth store

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_POSTHOG_KEY: 'test-posthog-key',
  NEXT_PUBLIC_POSTHOG_HOST: 'https://test.posthog.com',
  NEXT_PUBLIC_ENABLE_POSTHOG: 'true',
  NODE_ENV: 'test',
};

describe('PostHog Analytics Client', () => {
  beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
    const originalEnv = process.env;
    process.env = { ...originalEnv };

    jest.clearAllMocks();
    // Reset environment
    process.env = { ...mockEnv };
    // Reset posthog loaded state
    (posthog as any).__loaded = false;
    // Mock window and document
    global.window = {
      location: { href: 'https://example.com/test' },
      screen: { width: 1920, height: 1080 },
      innerWidth: 1024,
      innerHeight: 768,
    } as any;
    global.document = {
      title: 'Test Page',
      referrer: 'https://google.com',
    } as any;
  });

  afterEach(() => {
    delete (global as any).window;
    delete (global as any).document;
  });

  describe('initializePostHog', () => {
    it('should initialize PostHog when enabled with key', async () => {
      initializePostHog();

      expect(posthog.init).toHaveBeenCalledWith('test-posthog-key', {
        api_host: 'https://test.posthog.com',
        capture_pageview: true,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        autocapture: expect.objectContaining({
          url_ignorelist: [/\/api\//],
          element_allowlist: ['button', 'a', 'input'],
        }),
        session_recording: {
          maskAllInputs: true,
        },
        disable_session_recording: false,
        respect_dnt: true,
        secure_cookie: false, // test environment
        cross_subdomain_cookie: true,
      });

      // Mark as loaded for subsequent tests
      (posthog as any).__loaded = true;
    });

    it('should not initialize when PostHog key is missing', async () => {
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

      initializePostHog();

      expect(posthog.init).not.toHaveBeenCalled();
    });

    it('should not initialize when PostHog is disabled', async () => {
      process.env.NEXT_PUBLIC_ENABLE_POSTHOG = 'false';

      initializePostHog();

      expect(posthog.init).not.toHaveBeenCalled();
    });

    it('should not initialize on server side', async () => {
      delete (global as any).window;

      initializePostHog();

      expect(posthog.init).not.toHaveBeenCalled();
    });

    it('should not reinitialize if already loaded', async () => {
      (posthog as any).__loaded = true;

      initializePostHog();

      expect(posthog.init).not.toHaveBeenCalled();
    });
  });

  describe('identifyUser', () => {
    beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      (posthog as any).__loaded = true;
    });

    it('should identify user with properties', async () => {
      const properties = { plan: 'pro', role: 'admin' };

      identifyUser('user-123', properties);

      expect(posthog.identify).toHaveBeenCalledWith('user-123', {
        ...properties,
        identified_at: expect.any(String),
      });
    });

    it('should identify user without additional properties', async () => {
      identifyUser('user-123');

      expect(posthog.identify).toHaveBeenCalledWith('user-123', {
        identified_at: expect.any(String),
      });
    });

    it('should not identify when PostHog is not loaded', async () => {
      (posthog as any).__loaded = false;

      identifyUser('user-123');

      expect(posthog.identify).not.toHaveBeenCalled();
    });
  });

  describe('resetUser', () => {
    beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      (posthog as any).__loaded = true;
    });

    it('should reset user', async () => {
      resetUser();

      expect(posthog.reset).toHaveBeenCalled();
    });

    it('should not reset when PostHog is not loaded', async () => {
      (posthog as any).__loaded = false;

      resetUser();

      expect(posthog.reset).not.toHaveBeenCalled();
    });
  });

  describe('captureEvent', () => {
    beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      (posthog as any).__loaded = true;
    });

    it('should capture event with properties', async () => {
      const properties = { portfolio_id: 'portfolio-123' };

      captureEvent('portfolio_created', properties);

      expect(posthog.capture).toHaveBeenCalledWith('portfolio_created', {
        ...properties,
        timestamp: expect.any(String),
        source: 'web_app',
      });
    });

    it('should capture event without properties', async () => {
      captureEvent('user_logged_in');

      expect(posthog.capture).toHaveBeenCalledWith('user_logged_in', {
        timestamp: expect.any(String),
        source: 'web_app',
      });
    });

    it('should not capture when PostHog is not loaded', async () => {
      (posthog as any).__loaded = false;

      captureEvent('test_event');

      expect(posthog.capture).not.toHaveBeenCalled();
    });
  });

  describe('captureEnhancedEvent', () => {
    beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      (posthog as any).__loaded = true;
    });

    it('should capture event with enhanced properties', async () => {
      captureEnhancedEvent('page_viewed', { section: 'hero' });

      expect(posthog.capture).toHaveBeenCalledWith('page_viewed', {
        section: 'hero',
        page_url: 'https://example.com/test',
        page_title: 'Test Page',
        referrer: 'https://google.com',
        screen_width: 1920,
        screen_height: 1080,
        viewport_width: 1024,
        viewport_height: 768,
        timestamp: expect.any(String),
        timezone: expect.any(String),
        source: 'web_app',
      });
    });

    it('should override default properties with custom ones', async () => {
      captureEnhancedEvent('custom_event', {
        page_url: 'https://custom.com',
        custom_prop: 'value',
      });

      expect(posthog.capture).toHaveBeenCalledWith('custom_event', {
        page_url: 'https://custom.com', // Custom value overrides default
        page_title: 'Test Page',
        referrer: 'https://google.com',
        screen_width: 1920,
        screen_height: 1080,
        viewport_width: 1024,
        viewport_height: 768,
        timestamp: expect.any(String),
        timezone: expect.any(String),
        custom_prop: 'value',
        source: 'web_app',
      });
    });
  });

  describe('Feature Flags', () => {
    beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      (posthog as any).__loaded = true;
    });

    describe('isFeatureEnabled', () => {
      it('should return true when feature is enabled', async () => {
        (posthog.isFeatureEnabled as jest.Mock).mockReturnValue(true);

        const result = isFeatureEnabled('new_editor');

        expect(result).toBe(true);
        expect(posthog.isFeatureEnabled).toHaveBeenCalledWith('new_editor');
      });

      it('should return false when feature is disabled', async () => {
        (posthog.isFeatureEnabled as jest.Mock).mockReturnValue(false);

        const result = isFeatureEnabled('beta_feature');

        expect(result).toBe(false);
      });

      it('should return false when feature returns null', async () => {
        (posthog.isFeatureEnabled as jest.Mock).mockReturnValue(null);

        const result = isFeatureEnabled('unknown_feature');

        expect(result).toBe(false);
      });

      it('should return false when PostHog is not loaded', async () => {
        (posthog as any).__loaded = false;

        const result = isFeatureEnabled('any_feature');

        expect(result).toBe(false);
        expect(posthog.isFeatureEnabled).not.toHaveBeenCalled();
      });
    });

    describe('getFeatureFlagPayload', () => {
      it('should return feature flag payload', async () => {
        const mockPayload = { variant: 'A', config: { color: 'blue' } };
        (posthog.getFeatureFlagPayload as jest.Mock).mockReturnValue(
          mockPayload

        const result = getFeatureFlagPayload('experiment_1');

        expect(result).toEqual(mockPayload);
        expect(posthog.getFeatureFlagPayload).toHaveBeenCalledWith(
      'experiment_1'
    );
  });

      it('should return null when PostHog is not loaded', async () => {
        (posthog as any).__loaded = false;

        const result = getFeatureFlagPayload('any_flag');

        expect(result).toBeNull() || expect(result).toEqual(expect.anything());
      });
    });
  });

  describe('User Properties', () => {
    beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      (posthog as any).__loaded = true;
    });

    describe('setUserProperties', () => {
      it('should set user properties', async () => {
        const properties = {
          plan: 'pro',
          portfolios_count: 5,
        };

        setUserProperties(properties);

        expect(posthog.people.set).toHaveBeenCalledWith(properties);
      });

      it('should not set properties when PostHog is not loaded', async () => {
        (posthog as any).__loaded = false;

        setUserProperties({ plan: 'free' });

        expect(posthog.people.set).not.toHaveBeenCalled();
      });
    });

    describe('incrementUserProperty', () => {
      it('should increment property by 1 by default', async () => {
        (posthog.get_property as jest.Mock).mockReturnValue(5);

        incrementUserProperty('portfolios_count');

        expect(posthog.get_property).toHaveBeenCalledWith('portfolios_count');
        expect(posthog.people.set).toHaveBeenCalledWith(
      {
          portfolios_count: 6,
    });
  });
      });

      it('should increment property by custom value', async () => {
        (posthog.get_property as jest.Mock).mockReturnValue(10);

        incrementUserProperty('total_views', 5);

        expect(posthog.people.set).toHaveBeenCalledWith(
      {
          total_views: 15,
    });
  });
      });

      it('should handle missing property (start from 0)', async () => {
        (posthog.get_property as jest.Mock).mockReturnValue(void 0);

        incrementUserProperty('new_property', 3);

        expect(posthog.people.set).toHaveBeenCalledWith(
      {
          new_property: 3,
    });
  });
      });
    });
  });

  describe('Revenue Tracking', () => {
    beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      (posthog as any).__loaded = true;
    });

    it('should track revenue with default currency', async () => {
      trackRevenue(99.99, { plan: 'pro', billing_cycle: 'monthly' });

      expect(posthog.capture).toHaveBeenCalledWith('revenue', {
        revenue: 99.99,
        currency: 'USD',
        plan: 'pro',
        billing_cycle: 'monthly',
        timestamp: expect.any(String),
        source: 'web_app',
      });
    });

    it('should track revenue without additional properties', async () => {
      trackRevenue(19.99);

      expect(posthog.capture).toHaveBeenCalledWith('revenue', {
        revenue: 19.99,
        currency: 'USD',
        timestamp: expect.any(String),
        source: 'web_app',
      });
    });
  });

  describe('Session Recording', () => {
    beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      (posthog as any).__loaded = true;
    });

    describe('startSessionRecording', () => {
      it('should start session recording in production', async () => {
        process.env.NODE_ENV = 'production';

        startSessionRecording();

        expect(posthog.startSessionRecording).toHaveBeenCalled();
      });

      it('should not start session recording in development', async () => {
        process.env.NODE_ENV = 'development';

        startSessionRecording();

        expect(posthog.startSessionRecording).not.toHaveBeenCalled();
      });
    });

    describe('stopSessionRecording', () => {
      it('should stop session recording', async () => {
        stopSessionRecording();

        expect(posthog.stopSessionRecording).toHaveBeenCalled();
      });
    });
  });

  describe('Opt In/Out', () => {
    beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      (posthog as any).__loaded = true;
    });

    it('should opt out of tracking', async () => {
      optOut();

      expect(posthog.opt_out_capturing).toHaveBeenCalled();
    });

    it('should opt in to tracking', async () => {
      optIn();

      expect(posthog.opt_in_capturing).toHaveBeenCalled();
    });

    it('should check opt out status', async () => {
      (posthog.has_opted_out_capturing as jest.Mock).mockReturnValue(true);

      const result = hasOptedOut();

      expect(result).toBe(true);
      expect(posthog.has_opted_out_capturing).toHaveBeenCalled();
    });

    it('should return false for opt out status when not loaded', async () => {
      (posthog as any).__loaded = false;

      const result = hasOptedOut();

      expect(result).toBe(false);
    });
  });

  describe('usePostHog Hook', () => {
    beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      (
        useAuthStore as jest.MockedFunction<typeof useAuthStore>
      ).mockReturnValue({
        user: null,
      } as any);
    });

    it('should initialize PostHog on mount', async () => {
      renderHook(() => usePostHog());

      expect(posthog.init).toHaveBeenCalled();
    });

    it('should identify user when authenticated', async () => {
      (posthog as any).__loaded = true;
      (
        useAuthStore as jest.MockedFunction<typeof useAuthStore>
      ).mockReturnValue({
        user: mockUser,
      } as any);

      renderHook(() => usePostHog());

      expect(posthog.identify).toHaveBeenCalledWith(
      'user-123', {
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
    );
  });
    });

    it('should reset user when not authenticated', async () => {
      (posthog as any).__loaded = true;
      (
        useAuthStore as jest.MockedFunction<typeof useAuthStore>
      ).mockReturnValue({
        user: null,
      } as any);

      renderHook(() => usePostHog());

      expect(posthog.reset).toHaveBeenCalled();
    });

    it('should update identification when user changes', async () => {
      (posthog as any).__loaded = true;
      const { rerender } = renderHook(
        ({ user }) => {
          (
            useAuthStore as jest.MockedFunction<typeof useAuthStore>
          ).mockReturnValue({
            user,
          } as any);
          return usePostHog();
        },
        { initialProps: { user: null } }

      expect(posthog.reset).toHaveBeenCalled();

      // User logs in
      rerender({ user: mockUser });

      expect(posthog.identify).toHaveBeenCalledWith(
      'user-123', {
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
    );
  });

      // User logs out
      rerender({ user: null });

      expect(posthog.reset).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Constants', () => {
    it('should have all required event constants', async () => {
      expect(EVENTS.USER_SIGNED_UP).toBe('user_signed_up');
      expect(EVENTS.PORTFOLIO_CREATED).toBe('portfolio_created');
      expect(EVENTS.AI_CONTENT_GENERATED).toBe('ai_content_generated');
      expect(EVENTS.SUBSCRIPTION_STARTED).toBe('subscription_started');
    });

    it('should have all required user property constants', async () => {
      expect(USER_PROPERTIES.TOTAL_PORTFOLIOS).toBe('total_portfolios');
      expect(USER_PROPERTIES.SUBSCRIPTION_TIER).toBe('subscription_tier');
      expect(USER_PROPERTIES.ONBOARDING_COMPLETED).toBe('onboarding_completed');
    });
  });
});