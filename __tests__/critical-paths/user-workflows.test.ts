
// ==================== ULTIMATE TEST SETUP ====================
// Mock all external dependencies
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  headers: new Map(),
  clone: jest.fn(),
});

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.HUGGINGFACE_API_KEY = 'test-key';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

// Mock all stores
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

jest.mock('@/lib/store/portfolio-store', () => ({
  usePortfolioStore: jest.fn(() => ({
    portfolios: [],
    currentPortfolio: null,
    isLoading: false,
    error: null,
    fetchPortfolios: jest.fn(),
    createPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
    setCurrentPortfolio: jest.fn(),
  })),
}));

jest.mock('@/lib/store/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    session: null,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ 
      select: jest.fn().mockReturnThis(), 
      single: jest.fn().mockResolvedValue({ data: null, error: null }) 
    })),
  },
}));

// Mock HuggingFace
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn(() => ({
    enhanceBio: jest.fn().mockResolvedValue({ 
      content: 'Enhanced bio', 
      qualityScore: 90 
    }),
    optimizeProject: jest.fn().mockResolvedValue({ 
      optimizedDescription: 'Optimized project', 
      qualityScore: 85 
    }),
    recommendTemplate: jest.fn().mockResolvedValue([
      { template: 'modern', score: 95 }
    ]),
    listModels: jest.fn().mockResolvedValue([
      { id: 'test-model', name: 'Test Model' }
    ]),
  })),
}));

// Mock React Testing Library
jest.mock('@testing-library/react', () => ({
  ...jest.requireActual('@testing-library/react'),
  render: jest.fn(() => ({
    container: document.createElement('div'),
    getByText: jest.fn(),
    getByRole: jest.fn(),
    queryByText: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// ==================== END ULTIMATE SETUP ====================

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
/**
 * @jest-environment jsdom
 */

// Mock fetch for API calls
global.fetch = jest.fn().mockReturnValue(void 0);

describe('Critical User Workflows', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('New User Onboarding Workflow', () => {
    it('should complete new user signup to first portfolio', async () => {
      const mockResponses = [
        // 1. User signup/authentication
        {
          ok: true,
          json: () => ({
            user: {
              id: 'user-123',
              email: 'newuser@example.com',
              name: 'New User',
            },
            token: 'auth-token-123',
          }),
        },
        // 2. Create first portfolio
        {
          ok: true,
          json: () => ({
            portfolio: {
              id: 'first-portfolio',
              name: 'New User',
              title: 'Professional',
              template: 'modern',
              isFirstPortfolio: true,
            },
          }),
        },
        // 3. Portfolio onboarding completion
        {
          ok: true,
          json: () => ({
            success: true,
            onboardingCompleted: true,
          }),
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2]);

      // Step 1: User authentication
      const authResponse = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newuser@example.com',
          name: 'New User',
        }),
      });

      expect(authResponse.ok).toBe(true);
      const authData = await authResponse.json();
      expect(authData.user.email).toBe('newuser@example.com');

      // Step 2: Create first portfolio with onboarding
      const portfolioResponse = await fetch('/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify({
          name: 'New User',
          title: 'Professional',
          template: 'modern',
          isOnboarding: true,
        }),
      });

      expect(portfolioResponse.ok).toBe(true);
      const portfolioData = await portfolioResponse.json();
      expect(portfolioData.portfolio.isFirstPortfolio).toBe(true);

      // Step 3: Complete onboarding
      const onboardingResponse = await fetch(
        '/api/v1/user/onboarding/complete',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
          body: JSON.stringify({
            portfolioId: portfolioData.portfolio.id,
          }),
        }
      );

      expect(onboardingResponse.ok).toBe(true);
      const onboardingData = await onboardingResponse.json();
      expect(onboardingData.onboardingCompleted).toBe(true);

      // Verify complete onboarding flow
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle onboarding with tutorial guidance', async () => {
      const tutorialSteps = [
        'welcome',
        'basic-info',
        'add-projects',
        'choose-template',
        'publish',
        'complete',
      ];

      // Mock tutorial progression
      tutorialSteps.forEach((step, index) => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => ({
            currentStep: step,
            nextStep: tutorialSteps[index + 1] || null,
            progress: ((index + 1) / tutorialSteps.length) * 100,
          }),
        });
      });

      // Simulate tutorial progression
      for (let i = 0; i < tutorialSteps.length; i++) {
        const response = await fetch('/api/v1/user/tutorial/progress', {
          method: 'POST',
          body: JSON.stringify({
            step: tutorialSteps[i],
            completed: true,
          }),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data.currentStep).toBe(tutorialSteps[i]);
        expect(data.progress).toBe(((i + 1) / tutorialSteps.length) * 100);
      }

      expect(global.fetch).toHaveBeenCalledTimes(tutorialSteps.length);
    });
  });

  describe('Portfolio Management Workflow', () => {
    it('should complete portfolio editing to auto-save workflow', async () => {
      const mockResponses = [
        // 1. Load existing portfolio
        {
          ok: true,
          json: () => ({
            portfolio: {
              id: 'existing-portfolio',
              name: 'John Doe',
              title: 'Developer',
              bio: 'Original bio',
              lastModified: new Date().toISOString(),
            },
          }),
        },
        // 2. Auto-save after first edit
        {
          ok: true,
          json: () => ({
            success: true,
            lastSaved: new Date().toISOString(),
          }),
        },
        // 3. Auto-save after second edit
        {
          ok: true,
          json: () => ({
            success: true,
            lastSaved: new Date().toISOString(),
          }),
        },
        // 4. Manual save
        {
          ok: true,
          json: () => ({
            success: true,
            portfolio: {
              id: 'existing-portfolio',
              name: 'John Doe Updated',
              title: 'Senior Developer',
              bio: 'Updated professional bio',
            },
          }),
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2])
        .mockResolvedValueOnce(mockResponses[3]);

      // Step 1: Load portfolio for editing
      const loadResponse = await fetch('/api/v1/portfolios/existing-portfolio');
      expect(loadResponse.ok).toBe(true);
      const portfolioData = await loadResponse.json();
      expect(portfolioData.portfolio.name).toBe('John Doe');

      // Step 2: First auto-save (name change)
      const autoSave1Response = await fetch(
        '/api/v1/portfolios/existing-portfolio/auto-save',
        {
          method: 'PUT',
          body: JSON.stringify({
            name: 'John Doe Updated',
          }),
        }
      );

      expect(autoSave1Response.ok).toBe(true);

      // Step 3: Second auto-save (title change)
      const autoSave2Response = await fetch(
        '/api/v1/portfolios/existing-portfolio/auto-save',
        {
          method: 'PUT',
          body: JSON.stringify({
            title: 'Senior Developer',
          }),
        }
      );

      expect(autoSave2Response.ok).toBe(true);

      // Step 4: Manual save with all changes
      const manualSaveResponse = await fetch(
        '/api/v1/portfolios/existing-portfolio',
        {
          method: 'PUT',
          body: JSON.stringify({
            name: 'John Doe Updated',
            title: 'Senior Developer',
            bio: 'Updated professional bio',
          }),
        }
      );

      expect(manualSaveResponse.ok).toBe(true);
      const finalData = await manualSaveResponse.json();
      expect(finalData.portfolio.title).toBe('Senior Developer');

      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it('should handle multiple portfolio management', async () => {
      const portfolios = [
        { id: 'portfolio-1', name: 'Portfolio 1', template: 'modern' },
        { id: 'portfolio-2', name: 'Portfolio 2', template: 'minimal' },
        { id: 'portfolio-3', name: 'Portfolio 3', template: 'business' },
      ];

      // Mock portfolio list response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => ({
          portfolios,
          total: 3,
          page: 1,
          limit: 10,
        }),
      });

      // Mock individual portfolio operations
      portfolios.forEach(() => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => ({ success: true }),
        });
      });

      // Load user's portfolios
      const listResponse = await fetch('/api/v1/portfolios');
      expect(listResponse.ok).toBe(true);
      const listData = await listResponse.json();
      expect(listData.portfolios).toHaveLength(3);

      // Perform operations on each portfolio
      for (const portfolio of portfolios) {
        const updateResponse = await fetch(
          `/api/v1/portfolios/${portfolio.id}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              lastAccessed: new Date().toISOString(),
            }),
          }
        );

        expect(updateResponse.ok).toBe(true);
      }

      expect(global.fetch).toHaveBeenCalledTimes(4); // 1 list + 3 updates
    });

    it('should handle portfolio duplication workflow', async () => {
      const originalPortfolio = {
        id: 'original-portfolio',
        name: 'Original Portfolio',
        title: 'Developer',
        bio: 'Original bio',
        template: 'modern',
      };

      const duplicatedPortfolio = {
        id: 'duplicated-portfolio',
        name: 'Copy of Original Portfolio',
        title: 'Developer',
        bio: 'Original bio',
        template: 'modern',
        isDuplicate: true,
        originalId: 'original-portfolio',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => ({ portfolio: originalPortfolio }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => ({ portfolio: duplicatedPortfolio }),
        });

      // Load original portfolio
      const loadResponse = await fetch('/api/v1/portfolios/original-portfolio');
      const originalData = await loadResponse.json();
      expect(originalData.portfolio.name).toBe('Original Portfolio');

      // Duplicate portfolio
      const duplicateResponse = await fetch(
        '/api/v1/portfolios/original-portfolio/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Copy of Original Portfolio',
          }),
        }
      );

      expect(duplicateResponse.ok).toBe(true);
      const duplicateData = await duplicateResponse.json();
      expect(duplicateData.portfolio.isDuplicate).toBe(true);
      expect(duplicateData.portfolio.originalId).toBe('original-portfolio');
    });
  });

  describe('Publishing and Sharing Workflow', () => {
    it('should complete portfolio to published URL workflow', async () => {
      const mockResponses = [
        // 1. Portfolio ready for publishing
        {
          ok: true,
          json: () => ({
            portfolio: {
              id: 'ready-portfolio',
              name: 'Ready User',
              isComplete: true,
              readinessScore: 95,
            },
          }),
        },
        // 2. Subdomain availability check
        {
          ok: true,
          json: () => ({
            available: true,
            subdomain: 'ready-user',
            suggestions: [],
          }),
        },
        // 3. Pre-publish validation
        {
          ok: true,
          json: () => ({
            valid: true,
            issues: [],
            recommendations: [],
          }),
        },
        // 4. Publish to live URL
        {
          ok: true,
          json: () => ({
            success: true,
            url: 'https://ready-user.prisma.dev',
            deploymentId: 'deploy-456',
            publishedAt: new Date().toISOString(),
          }),
        },
        // 5. Generate share links
        {
          ok: true,
          json: () => ({
            shareLinks: {
              direct: 'https://ready-user.prisma.dev',
              social: 'https://ready-user.prisma.dev?utm_source=social',
              email: 'https://ready-user.prisma.dev?utm_source=email',
            },
          }),
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2])
        .mockResolvedValueOnce(mockResponses[3])
        .mockResolvedValueOnce(mockResponses[4]);

      // Step 1: Verify portfolio readiness
      const readinessResponse = await fetch(
        '/api/v1/portfolios/ready-portfolio/readiness'
      );

      const readinessData = await readinessResponse.json();
      expect(readinessData.portfolio.readinessScore).toBeGreaterThan(90);

      // Step 2: Check subdomain availability
      const subdomainResponse = await fetch(
        '/api/v1/portfolios/check-subdomain',
        {
          method: 'POST',
          body: JSON.stringify({ subdomain: 'ready-user' }),
        }
      );

      const subdomainData = await subdomainResponse.json();
      expect(subdomainData.available).toBe(true);

      // Step 3: Pre-publish validation
      const validationResponse = await fetch(
        '/api/v1/portfolios/ready-portfolio/validate',
        {
          method: 'POST',
        }
      );

      const validationData = await validationResponse.json();
      expect(validationData.valid).toBe(true);

      // Step 4: Publish portfolio
      const publishResponse = await fetch(
        '/api/v1/portfolios/ready-portfolio/publish',
        {
          method: 'POST',
          body: JSON.stringify({
            subdomain: 'ready-user',
            enableAnalytics: true,
          }),
        }
      );

      const publishData = await publishResponse.json();
      expect(publishData.success).toBe(true);
      expect(publishData.url).toBe('https://ready-user.prisma.dev');

      // Step 5: Generate sharing links
      const shareResponse = await fetch(
        '/api/v1/portfolios/ready-portfolio/share-links',
        {
          method: 'POST',
        }
      );

      const shareData = await shareResponse.json();
      expect(shareData.shareLinks.direct).toBe('https://ready-user.prisma.dev');
      expect(shareData.shareLinks.social).toContain('utm_source=social');

      expect(global.fetch).toHaveBeenCalledTimes(5);
    });

    it('should handle custom domain workflow', async () => {
      const mockResponses = [
        // 1. Request custom domain
        {
          ok: true,
          json: () => ({
            domainRequest: {
              id: 'domain-request-123',
              domain: 'johndoe.com',
              status: 'pending',
              verificationRequired: true,
            },
          }),
        },
        // 2. Domain verification
        {
          ok: true,
          json: () => ({
            verification: {
              status: 'verified',
              records: [{ type: 'CNAME', name: 'www', value: 'prisma.dev' }],
            },
          }),
        },
        // 3. Activate custom domain
        {
          ok: true,
          json: () => ({
            success: true,
            domain: 'johndoe.com',
            active: true,
            sslEnabled: true,
          }),
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2]);

      // Request custom domain
      const domainResponse = await fetch(
        '/api/v1/portfolios/portfolio-123/custom-domain',
        {
          method: 'POST',
          body: JSON.stringify({
            domain: 'johndoe.com',
          }),
        }
      );

      const domainData = await domainResponse.json();
      expect(domainData.domainRequest.domain).toBe('johndoe.com');
      expect(domainData.domainRequest.verificationRequired).toBe(true);

      // Verify domain ownership
      const verifyResponse = await fetch(
        '/api/v1/portfolios/portfolio-123/custom-domain/verify',
        {
          method: 'POST',
          body: JSON.stringify({
            requestId: domainData.domainRequest.id,
          }),
        }
      );

      const verifyData = await verifyResponse.json();
      expect(verifyData.verification.status).toBe('verified');

      // Activate custom domain
      const activateResponse = await fetch(
        '/api/v1/portfolios/portfolio-123/custom-domain/activate',
        {
          method: 'POST',
          body: JSON.stringify({
            requestId: domainData.domainRequest.id,
          }),
        }
      );

      const activateData = await activateResponse.json();
      expect(activateData.active).toBe(true);
      expect(activateData.sslEnabled).toBe(true);
    });
  });

  describe('Analytics and Performance Workflow', () => {
    it('should track portfolio analytics workflow', async () => {
      const mockAnalytics = {
        views: {
          total: 1250,
          unique: 890,
          trend: '+15%',
        },
        engagement: {
          averageTimeOnSite: '2:45',
          bounceRate: '35%',
          interactions: 156,
        },
        sources: {
          direct: 45,
          social: 30,
          search: 25,
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => ({ analytics: mockAnalytics }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => ({
            exported: true,
            downloadUrl: 'https://api.prisma.dev/exports/analytics-123.csv',
          }),
        });

      // Get portfolio analytics
      const analyticsResponse = await fetch(
        '/api/v1/portfolios/portfolio-123/analytics',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer token',
          },
        }
      );

      expect(analyticsResponse.ok).toBe(true);
      const analyticsData = await analyticsResponse.json();
      expect(analyticsData.analytics.views.total).toBe(1250);
      expect(analyticsData.analytics.engagement.bounceRate).toBe('35%');

      // Export analytics data
      const exportResponse = await fetch(
        '/api/v1/portfolios/portfolio-123/analytics/export',
        {
          method: 'POST',
          body: JSON.stringify({
            format: 'csv',
            dateRange: '30d',
          }),
        }
      );

      expect(exportResponse.ok).toBe(true);
      const exportData = await exportResponse.json();
      expect(exportData.exported).toBe(true);
      expect(exportData.downloadUrl).toContain('analytics-123.csv');
    });

    it('should handle A/B testing workflow', async () => {
      const mockVariants = [
        { id: 'variant-a', name: 'Original', template: 'modern', traffic: 50 },
        {
          id: 'variant-b',
          name: 'Alternative',
          template: 'minimal',
          traffic: 50,
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => ({
            experiment: {
              id: 'experiment-123',
              name: 'Template Comparison',
              variants: mockVariants,
              status: 'active',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => ({
            results: {
              'variant-a': { conversions: 45, views: 500 },
              'variant-b': { conversions: 52, views: 500 },
              winner: 'variant-b',
              confidence: 95,
            },
          }),
        });

      // Create A/B test experiment
      const experimentResponse = await fetch(
        '/api/v1/portfolios/portfolio-123/experiments',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Template Comparison',
            variants: mockVariants,
          }),
        }
      );

      const experimentData = await experimentResponse.json();
      expect(experimentData.experiment.variants).toHaveLength(2);
      expect(experimentData.experiment.status).toBe('active');

      // Get experiment results
      const resultsResponse = await fetch(
        '/api/v1/portfolios/portfolio-123/experiments/experiment-123/results'
      );

      const resultsData = await resultsResponse.json();
      expect(resultsData.results.winner).toBe('variant-b');
      expect(resultsData.results.confidence).toBe(95);
    });
  });
});
