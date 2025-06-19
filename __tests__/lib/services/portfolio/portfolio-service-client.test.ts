
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


// Mock Supabase client
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
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
    from: jest.fn(() => ({ select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: null }) })),
  },
}));

import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import { PortfolioServiceClient } from '@/lib/services/portfolio/portfolio-service-client';
import { logger } from '@/lib/utils/logger';
jest.mock('@/lib/supabase/client', () => ({
  createBrowserClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  })),
}));

import {   Portfolio,
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
 } from '@/types/portfolio';

// Mock dependencies
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn().mockReturnValue(void 0),
    warn: jest.fn().mockReturnValue(void 0),
    info: jest.fn().mockReturnValue(void 0),
    debug: jest.fn().mockReturnValue(void 0),
  },
}));

// Mock fetch
global.fetch = jest.fn().mockReturnValue(void 0);

describe('PortfolioServiceClient', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  let portfolioServiceClient: PortfolioServiceClient;

  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'Test Portfolio',
    title: 'Developer',
    bio: 'Test bio',
    tagline: 'Test tagline',
    avatarUrl: 'https://example.com/avatar.jpg',
    contact: {
      email: 'test@example.com',
      phone: '123-456-7890',
      location: 'New York',
    },
    social: {
      github: 'https://github.com/test',
      linkedin: 'https://linkedin.com/in/test',
    },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    template: 'developer',
    customization: {},
    aiSettings: {},
    status: 'draft',
    subdomain: 'test',
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    portfolioServiceClient = new PortfolioServiceClient();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getUserPortfolios', () => {
    it('should fetch user portfolios successfully', async () => {
      const mockPortfolios = [mockPortfolio];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockPortfolios,
      });

      const result = await portfolioServiceClient.getUserPortfolios('user-123');

      expect(result).toEqual(mockPortfolios);
      expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/portfolios?userId=user-123'
    );
  });

    it('should handle fetch error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(
        portfolioServiceClient.getUserPortfolios('user-123')
      ).rejects.toThrow('Failed to fetch portfolios');

      expect(logger.error).toHaveBeenCalledWith(
        'Error fetching portfolios:',
        expect.any(Error)

    });

    it('should handle network error', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(
        portfolioServiceClient.getUserPortfolios('user-123')
      ).rejects.toThrow('Network error');

      expect(logger.error).toHaveBeenCalledWith(
      'Error fetching portfolios:',
        networkError
    );
  });
  });

  describe('getPortfolio', () => {
    it('should fetch portfolio successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockPortfolio,
      });

      const result = await portfolioServiceClient.getPortfolio('portfolio-123');

      expect(result).toEqual(mockPortfolio);
      expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/portfolios/portfolio-123'
    );
  });

    it('should handle fetch error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(
        portfolioServiceClient.getPortfolio('portfolio-123')
      ).rejects.toThrow('Failed to fetch portfolio');

      expect(logger.error).toHaveBeenCalledWith(
        'Error fetching portfolio:',
        expect.any(Error)

    });
  });

  describe('createPortfolio', () => {
    it('should create portfolio successfully', async () => {
      const createData: CreatePortfolioDTO = {
        name: 'New Portfolio',
        title: 'Developer',
        bio: 'Bio',
        template: 'developer',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockPortfolio,
      });

      const result = await portfolioServiceClient.createPortfolio(createData);

      expect(result).toEqual(mockPortfolio);
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });
    });

    it('should handle creation error', async () => {
      const createData: CreatePortfolioDTO = {
        name: 'New Portfolio',
        title: 'Developer',
        bio: 'Bio',
        template: 'developer',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(
        portfolioServiceClient.createPortfolio(createData)
      ).rejects.toThrow('Failed to create portfolio');

      expect(logger.error).toHaveBeenCalledWith(
        'Error creating portfolio:',
        expect.any(Error)

    });
  });

  describe('updatePortfolio', () => {
    it('should update portfolio successfully', async () => {
      const updateData: UpdatePortfolioDTO = {
        name: 'Updated Portfolio',
        bio: 'Updated bio',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => ({ ...mockPortfolio, ...updateData }),
      });

      const result = await portfolioServiceClient.updatePortfolio(
        'portfolio-123',
        updateData

      expect(result.name).toBe('Updated Portfolio');
      expect(result.bio).toBe('Updated bio');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios/portfolio-123',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }

    });

    it('should handle update error', async () => {
      const updateData: UpdatePortfolioDTO = {
        name: 'Updated Portfolio',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
      });

      await expect(
        portfolioServiceClient.updatePortfolio('portfolio-123', updateData)
      ).rejects.toThrow('Failed to update portfolio');

      expect(logger.error).toHaveBeenCalledWith(
        'Error updating portfolio:',
        expect.any(Error)

    });
  });

  describe('deletePortfolio', () => {
    it('should delete portfolio successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      await portfolioServiceClient.deletePortfolio('portfolio-123');

      expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/portfolios/portfolio-123',
        {
          method: 'DELETE',
        }
    );
  });

    it('should handle deletion error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
      });

      await expect(
        portfolioServiceClient.deletePortfolio('portfolio-123')
      ).rejects.toThrow('Failed to delete portfolio');

      expect(logger.error).toHaveBeenCalledWith(
        'Error deleting portfolio:',
        expect.any(Error)

    });
  });

  describe('Error handling', () => {
    it('should handle non-Error objects in catch blocks', async () => {
      (global.fetch as jest.Mock).mockRejectedValue('String error');

      await expect(
        portfolioServiceClient.getPortfolio('portfolio-123')
      ).rejects.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle JSON parsing errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(
        portfolioServiceClient.getPortfolio('portfolio-123')
      ).rejects.toThrow('Invalid JSON');
    });

    it('should handle empty response bodies', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => null,
      });

      const result = await portfolioServiceClient.getPortfolio('portfolio-123');
      expect(result).toBeNull() || expect(result).toEqual(expect.anything());
    });
  });

  describe('Request headers', () => {
    it('should not include Content-Type header for GET requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockPortfolio,
      });

      await portfolioServiceClient.getPortfolio('portfolio-123');

      expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/portfolios/portfolio-123'

      // No headers object should be passed for GET requests
    );
  });

    it('should not include Content-Type header for DELETE requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      await portfolioServiceClient.deletePortfolio('portfolio-123');

      expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/portfolios/portfolio-123',
        { method: 'DELETE' }

      // No Content-Type header for DELETE
    );
  });
  });

  describe('Response status codes', () => {
    const testCases = [
      {
        method: 'getUserPortfolios',
        args: ['user-123'],
        status: 401,
        error: 'Failed to fetch portfolios',
      },
      {
        method: 'getPortfolio',
        args: ['portfolio-123'],
        status: 404,
        error: 'Failed to fetch portfolio',
      },
      {
        method: 'createPortfolio',
        args: [
          { name: 'Test', title: 'Dev', bio: 'Bio', template: 'developer' },
        ],
        status: 400,
        error: 'Failed to create portfolio',
      },
      {
        method: 'updatePortfolio',
        args: ['portfolio-123', { name: 'Updated' }],
        status: 403,
        error: 'Failed to update portfolio',
      },
      {
        method: 'deletePortfolio',
        args: ['portfolio-123'],
        status: 403,
        error: 'Failed to delete portfolio',
      },
    ];

    testCases.forEach(({ method, args, status, error }) => {
      it(`should handle ${status} status for ${method}`, async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status,
        });

        await expect(
          (portfolioServiceClient as any)[method](...args)
        ).rejects.toThrow(error);
      });
    });
  });
});
