/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Test data factories for consistent test data generation
 */

import { Portfolio } from '@/types/portfolio';

// User factory
export const createUser = (overrides = {}) => ({
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Portfolio factory
export const createPortfolio = (
  overrides: Partial<Portfolio> = {}
): Portfolio => ({
  id: `portfolio-${Math.random().toString(36).substr(2, 9)}`,
  userId: 'user-123',
  title: 'My Professional Portfolio',
  bio: 'Experienced professional with a passion for excellence',
  template: 'developer',
  status: 'draft',
  subdomain: `portfolio-${Date.now()}`,
  customization: {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      background: '#FFFFFF',
      text: '#111827',
      accent: '#F59E0B',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    layout: {
      style: 'modern',
      spacing: 'normal',
    },
  },
  sections: {
    hero: {
      title: 'John Doe',
      subtitle: 'Full Stack Developer',
      description: 'Building amazing web experiences with modern technologies',
      image: '/images/profile.jpg',
    },
    about: {
      title: 'About Me',
      content:
        'Passionate developer with 5+ years of experience in building scalable web applications.',
      highlights: [
        '5+ years of professional experience',
        'Full stack development expertise',
        'Strong problem-solving skills',
      ],
    },
    experience: [
      {
        id: 'exp-1',
        position: 'Senior Developer',
        company: 'Tech Corp',
        startDate: '2020-01',
        endDate: 'present',
        description: 'Leading development of enterprise applications',
        achievements: [
          'Increased application performance by 40%',
          'Mentored 5 junior developers',
        ],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'E-commerce Platform',
        description:
          'Built a scalable e-commerce platform serving 10k+ users daily',
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        link: 'https://example.com',
        image: '/images/project1.jpg',
        featured: true,
      },
    ],
    skills: {
      technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      soft: ['Leadership', 'Communication', 'Problem Solving'],
      tools: ['Git', 'Docker', 'AWS', 'Jenkins'],
    },
    education: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Computer Science',
        institution: 'University of Technology',
        year: '2018',
        description: 'Graduated with honors',
      },
    ],
    contact: {
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      twitter: 'https://twitter.com/johndoe',
    },
  },
  seo: {
    title: 'John Doe - Full Stack Developer',
    description: 'Professional portfolio of John Doe, Full Stack Developer',
    keywords: ['developer', 'full stack', 'react', 'node.js'],
    ogImage: '/images/og-image.jpg',
  },
  analytics: {
    googleAnalyticsId: '',
    enableTracking: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: null,
  ...overrides,
});

// Project factory
export const createProject = (overrides = {}) => ({
  id: `project-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Sample Project',
  description: 'A sample project for testing',
  technologies: ['React', 'TypeScript'],
  link: 'https://example.com',
  image: '/images/project.jpg',
  featured: false,
  startDate: '2023-01',
  endDate: '2023-06',
  role: 'Lead Developer',
  ...overrides,
});

// Experience factory
export const createExperience = (overrides = {}) => ({
  id: `exp-${Math.random().toString(36).substr(2, 9)}`,
  position: 'Software Developer',
  company: 'Tech Company',
  startDate: '2020-01',
  endDate: 'present',
  description: 'Developing innovative solutions',
  achievements: [
    'Improved system performance by 30%',
    'Led team of 3 developers',
  ],
  location: 'Remote',
  ...overrides,
});

// Education factory
export const createEducation = (overrides = {}) => ({
  id: `edu-${Math.random().toString(36).substr(2, 9)}`,
  degree: 'Bachelor of Science',
  institution: 'University',
  year: '2019',
  description: 'Computer Science major',
  gpa: '3.8',
  honors: ["Dean's List", 'Cum Laude'],
  ...overrides,
});

// Analytics data factory
export const createAnalytics = (overrides = {}) => ({
  portfolioId: 'portfolio-123',
  views: 1250,
  uniqueVisitors: 875,
  avgDuration: 145, // seconds
  bounceRate: 0.32,
  conversionRate: 0.05,
  topSources: [
    { source: 'Direct', visits: 450, percentage: 0.36 },
    { source: 'LinkedIn', visits: 325, percentage: 0.26 },
    { source: 'Google', visits: 275, percentage: 0.22 },
    { source: 'Other', visits: 200, percentage: 0.16 },
  ],
  deviceBreakdown: {
    desktop: 65,
    mobile: 30,
    tablet: 5,
  },
  pageViews: [
    { page: 'Home', views: 1250 },
    { page: 'Projects', views: 850 },
    { page: 'About', views: 650 },
    { page: 'Contact', views: 450 },
  ],
  timeRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  },
  ...overrides,
});

// AI enhancement result factory
export const createAIEnhancement = (overrides = {}) => ({
  original: 'Original content',
  enhanced: 'Enhanced content with improved clarity and impact',
  score: 0.85,
  suggestions: [
    'Add more specific metrics',
    'Use action-oriented language',
    'Highlight key achievements',
  ],
  metadata: {
    model: 'llama3-8b-8192',
    processingTime: 1234,
    tokenCount: 150,
  },
  ...overrides,
});

// Template recommendation factory
export const createTemplateRecommendation = (overrides = {}) => ({
  recommended: 'developer',
  scores: {
    developer: 0.9,
    consultant: 0.7,
    designer: 0.5,
  },
  reasons: [
    'Technical background matches developer template',
    'Project-focused content suits developer layout',
    'Skills section aligns with developer template structure',
  ],
  metadata: {
    analysisTime: 567,
    confidence: 0.9,
  },
  ...overrides,
});

// Notification factory
export const createNotification = (overrides = {}) => ({
  id: `notif-${Math.random().toString(36).substr(2, 9)}`,
  type: 'info' as const,
  title: 'Notification',
  message: 'This is a test notification',
  duration: 5000,
  createdAt: Date.now(),
  ...overrides,
});

// Form data factories
export const createSignUpData = (overrides = {}) => ({
  email: 'newuser@example.com',
  password: 'SecurePassword123!',
  confirmPassword: 'SecurePassword123!',
  name: 'New User',
  acceptTerms: true,
  ...overrides,
});

export const createSignInData = (overrides = {}) => ({
  email: 'user@example.com',
  password: 'Password123!',
  rememberMe: false,
  ...overrides,
});

// API response factories
export const createApiSuccess = <T = any>(data: T, meta = {}) => ({
  success: true,
  data,
  error: null,
  meta: {
    timestamp: new Date().toISOString(),
    ...meta,
  },
});

export const createApiError = (
  message: string,
  code = 'UNKNOWN_ERROR',
  details = {}
) => ({
  success: false,
  data: null,
  error: {
    message,
    code,
    details,
  },
  meta: {
    timestamp: new Date().toISOString(),
  },
});

// File upload factory
export const createFile = (overrides: Partial<File> = {}): File => {
  const blob = new Blob(['test content'], { type: 'text/plain' });
  const file = new File([blob], 'test.txt', {
    type: 'text/plain',
    lastModified: Date.now(),
  });

  Object.assign(file, overrides);
  return file;
};

// Image file factory
export const createImageFile = (name = 'test.jpg'): File => {
  const blob = new Blob(['fake image data'], { type: 'image/jpeg' });
  return new File([blob], name, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
};

// PDF file factory
export const createPDFFile = (name = 'resume.pdf'): File => {
  const blob = new Blob(['%PDF-1.4 fake pdf content'], {
    type: 'application/pdf',
  });
  return new File([blob], name, {
    type: 'application/pdf',
    lastModified: Date.now(),
  });
};
