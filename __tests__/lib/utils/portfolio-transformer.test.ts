
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

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Portfolio } from '@/types/portfolio';
import {
  transformDbPortfolioToApi,
  transformApiPortfolioToDb,
  transformDbPortfoliosToApi,
  sanitizePortfolioData,
} from '@/lib/utils/portfolio-transformer';

describe('Portfolio Transformer Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('transformDbPortfolioToApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

    it('should transform basic database portfolio to API format', async () => {
      const dbPortfolio = {
        id: 'portfolio-123',
        user_id: 'user-456',
        name: 'My Portfolio',
        template: 'developer',
        status: 'published',
        subdomain: 'john-doe',
        custom_domain: 'johndoe.com',
        views: 150,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        data: {
          title: 'Senior Developer',
          bio: 'Experienced developer',
          tagline: 'Building amazing things',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      };

      const result = transformDbPortfolioToApi(dbPortfolio);

      expect(result).toMatchObject({
        id: 'portfolio-123',
        userId: 'user-456',
        name: 'My Portfolio',
        title: 'Senior Developer',
        bio: 'Experienced developer',
        tagline: 'Building amazing things',
        avatarUrl: 'https://example.com/avatar.jpg',
        template: 'developer',
        status: 'published',
        subdomain: 'john-doe',
        customDomain: 'johndoe.com',
        views: 150,
      });
      expect(result.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'));
      expect(result.updatedAt).toEqual(new Date('2024-01-15T00:00:00Z'));
    });

    it('should handle empty data field', async () => {
      const dbPortfolio = {
        id: 'portfolio-123',
        user_id: 'user-456',
        name: 'Empty Portfolio',
        template: 'designer',
        status: 'draft',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        data: null,
      };

      const result = transformDbPortfolioToApi(dbPortfolio);

      expect(result).toMatchObject({
        id: 'portfolio-123',
        userId: 'user-456',
        name: 'Empty Portfolio',
        title: '',
        bio: '',
        tagline: '',
        avatarUrl: null,
        contact: {},
        social: {},
        experience: [],
        education: [],
        projects: [],
        skills: [],
        certifications: [],
      });
    });

    it('should transform complex portfolio data', async () => {
      const dbPortfolio = {
        id: 'portfolio-123',
        user_id: 'user-456',
        name: 'Complete Portfolio',
        template: 'consultant',
        status: 'published',
        subdomain: 'jane-doe',
        views: 500,
        last_viewed_at: '2024-01-14T00:00:00Z',
        published_at: '2024-01-10T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        customization: {
          primaryColor: '#3B82F6',
          darkMode: true,
        },
        ai_settings: {
          enhanceBio: true,
          tone: 'professional',
        },
        data: {
          title: 'Business Consultant',
          bio: 'Strategic consultant with 10 years experience',
          contact: {
            email: 'jane@example.com',
            phone: '+1234567890',
            location: 'New York, USA',
          },
          social: {
            linkedin: 'https://linkedin.com/in/jane',
            twitter: 'https://twitter.com/jane',
          },
          experience: [
            {
              id: 'exp-1',
              company: 'Consulting Firm',
              position: 'Senior Consultant',
              startDate: '2020-01',
              current: true,
            },
          ],
          education: [
            {
              id: 'edu-1',
              institution: 'Business School',
              degree: 'MBA',
              field: 'Business Administration',
              endDate: '2018-05',
            },
          ],
          projects: [
            {
              id: 'proj-1',
              title: 'Strategic Transformation',
              description: 'Led digital transformation initiative',
              featured: true,
            },
          ],
          skills: [
            {
              name: 'Strategy',
              level: 'expert',
              category: 'Business',
            },
          ],
          certifications: [
            {
              id: 'cert-1',
              name: 'PMP Certification',
              issuer: 'PMI',
              issueDate: '2022-03',
            },
          ],
        },
      };

      const result = transformDbPortfolioToApi(dbPortfolio);

      expect(result).toMatchObject({
        id: 'portfolio-123',
        userId: 'user-456',
        name: 'Complete Portfolio',
        title: 'Business Consultant',
        bio: 'Strategic consultant with 10 years experience',
        template: 'consultant',
        status: 'published',
        subdomain: 'jane-doe',
        views: 500,
        contact: {
          email: 'jane@example.com',
          phone: '+1234567890',
          location: 'New York, USA',
        },
        social: {
          linkedin: 'https://linkedin.com/in/jane',
          twitter: 'https://twitter.com/jane',
        },
        customization: {
          primaryColor: '#3B82F6',
          darkMode: true,
        },
        aiSettings: {
          enhanceBio: true,
          tone: 'professional',
        },
      });

      expect(result.experience).toHaveLength(1);
      expect(result.education).toHaveLength(1);
      expect(result.projects).toHaveLength(1);
      expect(result.skills).toHaveLength(1);
      expect(result.certifications).toHaveLength(1);
      expect(result.lastViewedAt).toEqual(new Date('2024-01-14T00:00:00Z'));
      expect(result.publishedAt).toEqual(new Date('2024-01-10T00:00:00Z'));
    });

    it('should handle missing optional fields', async () => {
      const dbPortfolio = {
        id: 'portfolio-123',
        user_id: 'user-456',
        name: 'Minimal Portfolio',
        template: 'creative',
        status: 'draft',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        data: {
          title: 'Creative Professional',
        },
      };

      const result = transformDbPortfolioToApi(dbPortfolio);

      expect(result.customization).toEqual({});
      expect(result.aiSettings).toEqual({});
      expect(result.subdomain).toBeUndefined();
      expect(result.customDomain).toBeUndefined();
      expect(result.lastViewedAt).toBeUndefined();
      expect(result.publishedAt).toBeUndefined();
      expect(result.views).toBe(0);
    });

    it('should include raw data field', async () => {
      const customData = {
        title: 'Developer',
        bio: 'Full stack developer',
        customField: 'custom value',
      };

      const dbPortfolio = {
        id: 'portfolio-123',
        user_id: 'user-456',
        name: 'Portfolio',
        template: 'developer',
        status: 'draft',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        data: customData,
      };

      const result = transformDbPortfolioToApi(dbPortfolio);

      expect(result.data).toEqual(customData);
    });
  });

  describe('transformApiPortfolioToDb', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

    it('should transform basic API portfolio to database format', async () => {
      const apiPortfolio: Partial<Portfolio> = {
        id: 'portfolio-123',
        userId: 'user-456',
        name: 'My Portfolio',
        title: 'Senior Developer',
        bio: 'Experienced developer',
        tagline: 'Building amazing things',
        avatarUrl: 'https://example.com/avatar.jpg',
        template: 'developer',
        status: 'published',
        subdomain: 'john-doe',
        customDomain: 'johndoe.com',
        views: 150,
      };

      const result = transformApiPortfolioToDb(apiPortfolio);

      expect(result).toMatchObject({
        id: 'portfolio-123',
        user_id: 'user-456',
        name: 'My Portfolio',
        template: 'developer',
        status: 'published',
        subdomain: 'john-doe',
        slug: 'john-doe',
        custom_domain: 'johndoe.com',
        views: 150,
        data: {
          title: 'Senior Developer',
          bio: 'Experienced developer',
          tagline: 'Building amazing things',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      });
      expect(result.updated_at).toBeDefined();
    });

    it('should handle date fields correctly', async () => {
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const apiPortfolio: Partial<Portfolio> = {
        name: 'Portfolio',
        lastViewedAt: lastWeek,
        publishedAt: now,
      };

      const result = transformApiPortfolioToDb(apiPortfolio);

      expect(result.last_viewed_at).toBe(lastWeek.toISOString());
      expect(result.published_at).toBe(now.toISOString());
    });

    it('should handle date fields as strings', async () => {
      const apiPortfolio: Partial<Portfolio> = {
        name: 'Portfolio',
        lastViewedAt: '2024-01-01T00:00:00Z' as any,
        publishedAt: '2024-01-15T00:00:00Z' as any,
      };

      const result = transformApiPortfolioToDb(apiPortfolio);

      expect(result.last_viewed_at).toBe('2024-01-01T00:00:00Z');
      expect(result.published_at).toBe('2024-01-15T00:00:00Z');
    });

    it('should package complex data into data field', async () => {
      const apiPortfolio: Partial<Portfolio> = {
        name: 'Complete Portfolio',
        contact: {
          email: 'jane@example.com',
          phone: '+1234567890',
        },
        social: {
          linkedin: 'https://linkedin.com/in/jane',
        },
        experience: [
          {
            id: 'exp-1',
            company: 'Tech Corp',
            position: 'Senior Developer',
            startDate: '2020-01',
            current: true,
            description: 'Leading development team',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'University',
            degree: 'BS',
            field: 'Computer Science',
            endDate: '2019-05',
          },
        ],
        projects: [
          {
            id: 'proj-1',
            title: 'Project Alpha',
            description: 'Revolutionary app',
            technologies: ['React', 'Node.js'],
            featured: true,
          },
        ],
        skills: [
          {
            name: 'JavaScript',
            level: 'expert',
            category: 'Programming',
          },
        ],
        certifications: [
          {
            id: 'cert-1',
            name: 'AWS Certified',
            issuer: 'Amazon',
            issueDate: '2023-01',
          },
        ],
        customization: {
          primaryColor: '#FF0000',
          darkMode: false,
        },
        aiSettings: {
          enhanceBio: false,
          tone: 'casual',
        },
      };

      const result = transformApiPortfolioToDb(apiPortfolio);

      expect(result.data).toMatchObject({
        contact: apiPortfolio.contact,
        social: apiPortfolio.social,
        experience: apiPortfolio.experience,
        education: apiPortfolio.education,
        projects: apiPortfolio.projects,
        skills: apiPortfolio.skills,
        certifications: apiPortfolio.certifications,
      });
      expect(result.customization).toEqual(apiPortfolio.customization);
      expect(result.ai_settings).toEqual(apiPortfolio.aiSettings);
    });

    it('should merge raw data updates', async () => {
      const apiPortfolio: Partial<Portfolio> = {
        name: 'Portfolio',
        title: 'Developer',
        data: {
          title: 'Senior Developer', // This should override
          bio: 'Experienced developer',
          customField: 'custom value',
        },
      };

      const result = transformApiPortfolioToDb(apiPortfolio);

      expect(result.data).toMatchObject({
        title: 'Senior Developer', // From data field, not title field
        bio: 'Experienced developer',
        customField: 'custom value',
      });
    });

    it('should handle partial updates', async () => {
      const apiPortfolio: Partial<Portfolio> = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };

      const result = transformApiPortfolioToDb(apiPortfolio);

      expect(result.name).toBe('Updated Name');
      expect(result.data.bio).toBe('Updated bio');
      expect(result.id).toBeUndefined();
      expect(result.user_id).toBeUndefined();
    });

    it('should handle zero views', async () => {
      const apiPortfolio: Partial<Portfolio> = {
        name: 'Portfolio',
        views: 0,
      };

      const result = transformApiPortfolioToDb(apiPortfolio);

      expect(result.views).toBe(0);
    });
  });

  describe('transformDbPortfoliosToApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

    it('should batch transform multiple portfolios', async () => {
      const dbPortfolios = [
        {
          id: 'portfolio-1',
          user_id: 'user-1',
          name: 'Portfolio 1',
          template: 'developer',
          status: 'published',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          data: { title: 'Developer 1' },
        },
        {
          id: 'portfolio-2',
          user_id: 'user-2',
          name: 'Portfolio 2',
          template: 'designer',
          status: 'draft',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          data: { title: 'Designer 1' },
        },
      ];

      const results = transformDbPortfoliosToApi(dbPortfolios);

      expect(results).toHaveLength(2);
      expect(results[0]).toMatchObject({
        id: 'portfolio-1',
        userId: 'user-1',
        name: 'Portfolio 1',
        title: 'Developer 1',
        template: 'developer',
        status: 'published',
      });
      expect(results[1]).toMatchObject({
        id: 'portfolio-2',
        userId: 'user-2',
        name: 'Portfolio 2',
        title: 'Designer 1',
        template: 'designer',
        status: 'draft',
      });
    });

    it('should handle empty array', async () => {
      const results = transformDbPortfoliosToApi([]);
      expect(results).toEqual([]);
    });
  });

  describe('sanitizePortfolioData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

    it('should only include allowed fields', async () => {
      const data = {
        name: 'Portfolio',
        title: 'Developer',
        bio: 'Bio text',
        invalidField: 'should be removed',
        _privateField: 'should be removed',
        id: 'should be removed',
        userId: 'should be removed',
        createdAt: 'should be removed',
      };

      const result = sanitizePortfolioData(data as any);

      expect(result).toEqual({
        name: 'Portfolio',
        title: 'Developer',
        bio: 'Bio text',
      });
      expect(result).not.toHaveProperty('invalidField');
      expect(result).not.toHaveProperty('_privateField');
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('userId');
      expect(result).not.toHaveProperty('createdAt');
    });

    it('should ensure arrays are arrays', async () => {
      const data = {
        experience: 'not an array',
        education: null,
        projects: undefined,
        skills: {},
        certifications: 123,
      };

      const result = sanitizePortfolioData(data as any);

      expect(Array.isArray(result.experience)).toBe(true);
      expect(Array.isArray(result.education)).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
      expect(Array.isArray(result.skills)).toBe(true);
      expect(Array.isArray(result.certifications)).toBe(true);
    });

    it('should ensure objects are objects', async () => {
      const data = {
        contact: 'not an object',
        social: null,
        customization: [],
        aiSettings: 123,
      };

      const result = sanitizePortfolioData(data as any);

      expect(typeof result.contact).toBe('object');
      expect(typeof result.social).toBe('object');
      expect(typeof result.customization).toBe('object');
      expect(typeof result.aiSettings).toBe('object');
      expect(Array.isArray(result.contact)).toBe(false);
      expect(Array.isArray(result.social)).toBe(false);
    });

    it('should preserve valid data', async () => {
      const data = {
        name: 'Portfolio',
        template: 'developer',
        status: 'published',
        experience: [{ company: 'Tech Corp' }],
        education: [{ institution: 'University' }],
        contact: { email: 'test@example.com' },
        social: { linkedin: 'https://linkedin.com' },
        customization: { primaryColor: '#000000' },
      };

      const result = sanitizePortfolioData(data as any);

      expect(result).toEqual(data);
    });

    it('should handle all allowed fields', async () => {
      const data = {
        name: 'Test',
        title: 'Title',
        bio: 'Bio',
        tagline: 'Tagline',
        avatarUrl: 'https://example.com/avatar.jpg',
        contact: { email: 'test@test.com' },
        social: { twitter: '@test' },
        experience: [{ company: 'Company' }],
        education: [{ school: 'School' }],
        projects: [{ name: 'Project' }],
        skills: [{ name: 'Skill' }],
        certifications: [{ name: 'Cert' }],
        template: 'developer',
        customization: { theme: 'dark' },
        aiSettings: { enhance: true },
        status: 'draft',
        subdomain: 'test',
        customDomain: 'test.com',
      };

      const result = sanitizePortfolioData(data as any);

      expect(Object.keys(result).sort()).toEqual([
        'aiSettings',
        'avatarUrl',
        'bio',
        'certifications',
        'contact',
        'customDomain',
        'customization',
        'education',
        'experience',
        'name',
        'projects',
        'skills',
        'social',
        'status',
        'subdomain',
        'tagline',
        'template',
        'title',
      ]);
    });
  });
});
