/**
 * Shared test mocks and utilities for consistent testing
 */

import { Portfolio } from '@/types/portfolio';

/**
 * Create a mock portfolio with all required fields
 */
export function createMockPortfolio(overrides?: Partial<Portfolio>): Portfolio {
  return {
    id: 'portfolio-1',
    userId: 'user-1',
    name: 'John Doe',
    title: 'Software Developer',
    bio: 'Experienced developer with a passion for creating amazing web applications.',
    tagline: 'Building the future, one line at a time',
    avatarUrl: 'https://example.com/avatar.jpg',
    contact: {
      email: 'john@example.com',
      phone: '+1234567890',
      location: 'San Francisco, CA',
      availability: 'Available for freelance',
    },
    social: {
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      twitter: 'https://twitter.com/johndoe',
    },
    experience: [
      {
        id: 'exp-1',
        company: 'Tech Corp',
        position: 'Senior Developer',
        startDate: '2020-01',
        endDate: undefined,
        current: true,
        description: 'Leading development of web applications',
        highlights: ['Built scalable APIs', 'Led team of 5 developers'],
        technologies: ['React', 'Node.js', 'TypeScript'],
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2015',
        endDate: '2019',
        current: false,
        description: 'Focused on software engineering',
        achievements: ['Cum Laude', "Dean's List"],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce solution',
        imageUrl: 'https://example.com/project.jpg',
        projectUrl: 'https://example.com',
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com/johndoe/ecommerce',
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        highlights: ['100k+ users', '99.9% uptime'],
        featured: true,
        order: 0,
      },
    ],
    skills: [
      { name: 'JavaScript', level: 'expert', category: 'Programming' },
      { name: 'React', level: 'expert', category: 'Frontend' },
      { name: 'Node.js', level: 'advanced', category: 'Backend' },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        issueDate: '2023-01',
        expiryDate: '2026-01',
        credentialId: 'ABC123',
        credentialUrl: 'https://aws.amazon.com/verification/ABC123',
      },
    ],
    template: 'developer',
    customization: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      accentColor: '#10b981',
      fontFamily: 'Inter',
      headerStyle: 'minimal',
      sectionOrder: ['about', 'experience', 'projects', 'skills', 'education'],
      hiddenSections: [],
      darkMode: false,
    },
    aiSettings: {
      enhanceBio: true,
      enhanceProjectDescriptions: true,
      generateSkillsFromExperience: false,
      tone: 'professional',
      targetLength: 'detailed',
    },
    status: 'published',
    subdomain: 'johndoe',
    customDomain: undefined,
    views: 100,
    lastViewedAt: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    publishedAt: new Date('2024-01-10'),
    ...overrides,
  };
}

/**
 * Mock authenticated user
 */
export const mockAuthUser = {
  id: 'user-1',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
};

/**
 * Mock Supabase client with common operations
 */
export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: mockAuthUser, session: {} },
        error: null,
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: mockAuthUser, session: {} },
        error: null,
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      mockResolvedValue: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  };
}

/**
 * Mock portfolio service
 */
export function createMockPortfolioService() {
  const mockPortfolios = [createMockPortfolio()];

  return {
    getUserPortfolios: jest.fn().mockResolvedValue(mockPortfolios),
    getPortfolio: jest.fn().mockResolvedValue(mockPortfolios[0]),
    createPortfolio: jest.fn().mockResolvedValue(mockPortfolios[0]),
    updatePortfolio: jest.fn().mockResolvedValue(mockPortfolios[0]),
    deletePortfolio: jest.fn().mockResolvedValue(true),
    publishPortfolio: jest.fn().mockResolvedValue(mockPortfolios[0]),
    unpublishPortfolio: jest.fn().mockResolvedValue(mockPortfolios[0]),
    searchPortfolios: jest.fn().mockResolvedValue(mockPortfolios),
    checkSubdomainAvailability: jest.fn().mockResolvedValue(true),
    updateSubdomain: jest.fn().mockResolvedValue(true),
    getPortfolioBySubdomain: jest.fn().mockResolvedValue(mockPortfolios[0]),
    clonePortfolio: jest.fn().mockResolvedValue(mockPortfolios[0]),
  };
}

/**
 * Mock HuggingFace AI service
 */
export function createMockHuggingFaceService() {
  return {
    enhanceBio: jest.fn().mockResolvedValue({
      content: 'Enhanced professional bio with impactful achievements',
      confidence: 0.85,
      suggestions: [
        'Add quantifiable achievements',
        'Include specific technologies',
      ],
      wordCount: 50,
      qualityScore: 85,
      enhancementType: 'bio',
    }),
    optimizeProjectDescription: jest.fn().mockResolvedValue({
      description: 'Optimized project description with clear impact',
      highlights: ['Improved performance by 50%', 'Served 100k+ users'],
      extractedSkills: ['React', 'Node.js', 'PostgreSQL'],
      improvements: ['Added quantifiable metrics', 'Clarified technical stack'],
    }),
    recommendTemplate: jest.fn().mockResolvedValue({
      template: 'developer',
      confidence: 0.9,
      reasoning: 'Based on technical skills and project types',
      alternatives: [
        { template: 'consultant', confidence: 0.7 },
        { template: 'designer', confidence: 0.5 },
      ],
    }),
    healthCheck: jest.fn().mockResolvedValue(true),
    getAvailableModels: jest.fn().mockResolvedValue([
      {
        id: 'meta-llama/Llama-3.1-8B-Instruct',
        name: 'Llama 3.1 8B Instruct',
        provider: 'Meta',
        costPerRequest: 0.001,
        averageLatency: 1200,
        qualityRating: 0.85,
        capabilities: ['bio', 'project', 'template'],
        isRecommended: true,
        status: 'active',
      },
    ]),
  };
}

/**
 * Mock router with common navigation methods
 */
export function createMockRouter() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  };
}

/**
 * Mock auth context value
 */
export function createMockAuthContext(overrides?: any) {
  return {
    user: mockAuthUser,
    loading: false,
    error: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    ...overrides,
  };
}

/**
 * Create mock translations for testing
 */
export function createMockTranslations() {
  return {
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',

    // Dashboard
    dashboard: 'Dashboard',
    myPortfolios: 'My Portfolios',
    createNewPortfolio: 'Create New Portfolio',
    noPortfoliosYet: 'No portfolios yet',

    // Editor
    portfolioEditor: 'Portfolio Editor',
    publish: 'Publish',
    unpublish: 'Unpublish',
    preview: 'Preview',
    selectTemplate: 'Select Template',

    // Landing
    heroTitle: 'Your portfolio, elevated by AI.',
    features: 'Features',
    pricing: 'Pricing',
    getStarted: 'Get Started',

    // Add more as needed
  };
}
