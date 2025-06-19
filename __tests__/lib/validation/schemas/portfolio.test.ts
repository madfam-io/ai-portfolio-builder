
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

import { describe, test, it, expect, jest, beforeEach } from '@jest/globals';
import {
  createPortfolioSchema,
  updatePortfolioSchema,
  portfolioQuerySchema,
  subdomainCheckSchema,
  publishPortfolioSchema,
} from '@/lib/validation/schemas/portfolio';

describe('Portfolio Validation Schemas', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  describe('createPortfolioSchema', () => {
    it('should validate valid portfolio creation data', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        template: 'developer',
      };

      const result = createPortfolioSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept optional fields', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        template: 'designer',
        tagline: 'Creative Designer',
        bio: 'I am a creative designer with 10 years of experience',
        projects: [
          {
            title: 'Project 1',
            description: 'A great project',
            technologies: ['React', 'Node.js'],
            featured: true,
          },
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
        },
      };

      const result = createPortfolioSchema.parse(validData);
      expect(result.projects).toHaveLength(1);
      expect(result.socialLinks?.linkedin).toBe(
        'https://linkedin.com/in/johndoe'

    });

    it('should reject invalid name', async () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        template: 'developer',
      };

      expect(() => createPortfolioSchema.parse(invalidData)).toThrow(
        'Name must be at least 2 characters'

    });

    it('should reject invalid email', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        template: 'developer',
      };

      expect(() => createPortfolioSchema.parse(invalidData)).toThrow(
        'Invalid email format'

    });

    it('should reject invalid template', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        template: 'invalid-template',
      };

      expect(() => createPortfolioSchema.parse(invalidData)).toThrow();
    });

    it('should validate social links', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        template: 'developer',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'not-a-url',
        },
      };

      expect(() => createPortfolioSchema.parse(validData)).toThrow(
        'Invalid URL format'

    });
  });

  describe('updatePortfolioSchema', () => {
    it('should allow partial updates', async () => {
      const updateData = {
        name: 'Jane Doe',
      };

      const result = updatePortfolioSchema.parse(updateData);
      expect(result).toEqual(updateData);
    });

    it('should allow updating settings', async () => {
      const updateData = {
        settings: {
          showEmail: false,
          showPhone: true,
          customColors: {
            primary: '#FF0000',
            secondary: '#00FF00',
          },
        },
      };

      const result = updatePortfolioSchema.parse(updateData);
      expect(result.settings?.customColors?.primary).toBe('#FF0000');
    });

    it('should reject invalid color format', async () => {
      const updateData = {
        settings: {
          customColors: {
            primary: 'red',
          },
        },
      };

      expect(() => updatePortfolioSchema.parse(updateData)).toThrow();
    });
  });

  describe('portfolioQuerySchema', () => {
    it('should parse query parameters with defaults', async () => {
      const query = {};

      const result = portfolioQuerySchema.parse(query);
      expect(result).toEqual({
        page: 1,
        limit: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
    });

    it('should parse and coerce string numbers', async () => {
      const query = {
        page: '2',
        limit: '25',
      };

      const result = portfolioQuerySchema.parse(query);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
    });

    it('should validate status filter', async () => {
      const query = {
        status: 'published',
      };

      const result = portfolioQuerySchema.parse(query);
      expect(result.status).toBe('published');
    });

    it('should reject invalid status', async () => {
      const query = {
        status: 'invalid',
      };

      expect(() => portfolioQuerySchema.parse(query)).toThrow();
    });

    it('should enforce limit constraints', async () => {
      const query = {
        limit: '150',
      };

      expect(() => portfolioQuerySchema.parse(query)).toThrow();
    });
  });

  describe('subdomainCheckSchema', () => {
    it('should validate valid subdomain', async () => {
      const data = {
        subdomain: 'john-doe-portfolio',
      };

      const result = subdomainCheckSchema.parse(data);
      expect(result.subdomain).toBe('john-doe-portfolio');
    });

    it('should reject subdomain with uppercase', async () => {
      const data = {
        subdomain: 'JohnDoe',
      };

      expect(() => subdomainCheckSchema.parse(data)).toThrow(
        'Subdomain can only contain lowercase letters, numbers, and hyphens'

    });

    it('should reject subdomain starting with hyphen', async () => {
      const data = {
        subdomain: '-johndoe',
      };

      expect(() => subdomainCheckSchema.parse(data)).toThrow(
        'Subdomain must start with a letter or number'

    });

    it('should reject subdomain ending with hyphen', async () => {
      const data = {
        subdomain: 'johndoe-',
      };

      expect(() => subdomainCheckSchema.parse(data)).toThrow(
        'Subdomain must end with a letter or number'

    });

    it('should reject too short subdomain', async () => {
      const data = {
        subdomain: 'ab',
      };

      expect(() => subdomainCheckSchema.parse(data)).toThrow(
        'Subdomain must be at least 3 characters'

    });

    it('should reject too long subdomain', async () => {
      const data = {
        subdomain: 'a'.repeat(64),
      };

      expect(() => subdomainCheckSchema.parse(data)).toThrow(
        'Subdomain must be less than 63 characters'

    });
  });

  describe('publishPortfolioSchema', () => {
    it('should validate publish request with subdomain', async () => {
      const data = {
        subdomain: 'john-portfolio',
      };

      const result = publishPortfolioSchema.parse(data);
      expect(result.subdomain).toBe('john-portfolio');
    });

    it('should allow custom domain', async () => {
      const data = {
        subdomain: 'john-portfolio',
        customDomain: 'john.example.com',
      };

      const result = publishPortfolioSchema.parse(data);
      expect(result.customDomain).toBe('john.example.com');
    });

    it('should apply subdomain validation rules', async () => {
      const data = {
        subdomain: 'INVALID',
      };

      expect(() => publishPortfolioSchema.parse(data)).toThrow();
    });
  });
});
