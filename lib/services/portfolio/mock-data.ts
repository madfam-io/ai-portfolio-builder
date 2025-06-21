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

import { Portfolio } from '@/types/portfolio';

/**
 * @fileoverview Mock data for portfolio service development
 * @module services/portfolio/mock-data
 *
 * This module provides realistic mock data for development and testing.
 * In production, this data is replaced by real database queries.
 */

/**
 * Mock portfolio for a Full Stack Developer
 */
export const mockDeveloperPortfolio: Portfolio = {
  id: '1',
  userId: 'user-1',
  name: 'John Doe',
  title: 'Full Stack Developer',
  bio: 'Passionate developer with 5+ years of experience building web applications. Specialized in React, Node.js, and cloud technologies.',
  tagline: 'Building the future, one line of code at a time',
  avatarUrl: '',
  contact: {
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    availability: 'Available for freelance projects',
  },
  social: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Company Inc',
      position: 'Senior Full Stack Developer',
      startDate: '2021-01',
      current: true,
      description:
        'Leading development of modern web applications using React and Node.js',
      highlights: [
        'Led a team of 4 developers',
        'Improved application performance by 40%',
        'Implemented CI/CD pipelines',
      ],
      technologies: ['React', 'Node.js', 'TypeScript', 'AWS'],
    },
    {
      id: 'exp-2',
      company: 'Startup XYZ',
      position: 'Frontend Developer',
      startDate: '2019-03',
      endDate: '2020-12',
      current: false,
      description:
        'Developed responsive web applications and mobile interfaces',
      highlights: [
        'Built from scratch a customer portal',
        'Reduced loading time by 60%',
      ],
      technologies: ['React', 'Redux', 'SASS'],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of Technology',
      degree: 'Bachelor',
      field: 'Computer Science',
      startDate: '2015-09',
      endDate: '2019-06',
      current: false,
      achievements: ['Magna Cum Laude', "Dean's List"],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'E-commerce Platform',
      description:
        'A full-featured e-commerce platform built with React and Node.js',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      highlights: [
        'Supports multiple payment methods',
        'Real-time inventory management',
        'Mobile-responsive design',
      ],
      featured: true,
      order: 1,
      projectUrl: 'https://example-ecommerce.com',
      githubUrl: 'https://github.com/johndoe/ecommerce',
    },
    {
      id: 'proj-2',
      title: 'Task Management App',
      description:
        'A collaborative task management application with real-time updates',
      technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
      highlights: [
        'Real-time collaboration',
        'Drag-and-drop interface',
        'Mobile app available',
      ],
      featured: false,
      order: 2,
    },
  ],
  skills: [
    {
      name: 'JavaScript',
      category: 'language',
      level: 'expert',
    },
    {
      name: 'TypeScript',
      category: 'language',
      level: 'advanced',
    },
    { name: 'React', category: 'framework', level: 'expert' },
    {
      name: 'Node.js',
      category: 'framework',
      level: 'advanced',
    },
    { name: 'AWS', category: 'tool', level: 'intermediate' },
  ],
  certifications: [],
  template: 'developer',
  customization: {
    primaryColor: '#6366f1',
    fontFamily: 'Inter',
  },
  status: 'published',
  customDomain: 'johndoe.dev',
  publishedAt: new Date('2024-01-15T10:00:00Z'),
  createdAt: new Date('2024-01-10T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
  views: 150,
  lastViewedAt: new Date('2024-01-20T15:30:00Z'),
};

/**
 * Mock portfolio for a UI/UX Designer
 */
export const mockDesignerPortfolio: Portfolio = {
  id: '2',
  userId: 'user-2',
  name: 'Jane Smith',
  title: 'UI/UX Designer',
  bio: 'Creative designer with a passion for creating beautiful and functional user experiences. 7+ years of experience in product design.',
  tagline: 'Designing experiences that delight users',
  avatarUrl: '',
  contact: {
    email: 'jane.smith@example.com',
    phone: '+1 (555) 987-6543',
    location: 'New York, NY',
    availability: 'Open to new opportunities',
  },
  social: {
    linkedin: 'https://linkedin.com/in/janesmith',
    dribbble: 'https://dribbble.com/janesmith',
    behance: 'https://behance.net/janesmith',
  },
  experience: [
    {
      id: 'exp-3',
      company: 'Design Studio Pro',
      position: 'Senior Product Designer',
      startDate: '2020-06',
      current: true,
      description: 'Leading product design for multiple client projects',
      highlights: [
        'Designed UI for 10+ mobile apps',
        'Established design system',
        'Mentored junior designers',
      ],
    },
  ],
  education: [
    {
      id: 'edu-2',
      institution: 'Art & Design Institute',
      degree: 'Bachelor',
      field: 'Graphic Design',
      startDate: '2013-09',
      endDate: '2017-06',
      current: false,
    },
  ],
  projects: [
    {
      id: 'proj-3',
      title: 'Banking App Redesign',
      description: 'Complete redesign of a mobile banking application',
      technologies: ['Figma', 'Principle', 'Adobe XD'],
      highlights: [
        'Increased user engagement by 45%',
        'Reduced support tickets by 30%',
      ],
      featured: true,
      order: 1,
    },
  ],
  skills: [
    { name: 'UI Design', category: 'design', level: 'expert' },
    {
      name: 'UX Research',
      category: 'design',
      level: 'advanced',
    },
    { name: 'Figma', category: 'tool', level: 'expert' },
  ],
  certifications: [],
  template: 'designer',
  customization: {
    primaryColor: '#ec4899',
    fontFamily: 'Poppins',
  },
  status: 'published',
  publishedAt: new Date('2024-01-12T10:00:00Z'),
  createdAt: new Date('2024-01-08T10:00:00Z'),
  updatedAt: new Date('2024-01-12T10:00:00Z'),
  views: 230,
  lastViewedAt: new Date('2024-01-20T18:45:00Z'),
};

/**
 * All mock portfolios for development
 */
export const mockPortfolios: Portfolio[] = [
  mockDeveloperPortfolio,
  mockDesignerPortfolio,
];

/**
 * Get a mock portfolio by ID
 */
export function getMockPortfolioById(id: string): Portfolio | undefined {
  return mockPortfolios.find(p => p.id === id);
}

/**
 * Get mock portfolios by user ID
 */
export function getMockPortfoliosByUserId(userId: string): Portfolio[] {
  return mockPortfolios.filter(p => p.userId === userId);
}

/**
 * Generate a new mock portfolio ID
 */
export function generateMockId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
