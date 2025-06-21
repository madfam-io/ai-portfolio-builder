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
 * Mock portfolio data for development and testing
 * This data should NOT be imported in production code
 */
export const mockPortfolios: Portfolio[] = [
  {
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
        technologies: ['Vue.js', 'Firebase', 'Vuetify'],
        highlights: [
          'Real-time collaboration',
          'Drag-and-drop interface',
          'Team management features',
        ],
        featured: false,
        order: 2,
        projectUrl: 'https://taskapp-demo.com',
        githubUrl: 'https://github.com/johndoe/taskapp',
      },
    ],
    skills: [
      {
        name: 'JavaScript',
        level: 'expert',
        category: 'Programming Languages',
      },
      {
        name: 'TypeScript',
        level: 'advanced',
        category: 'Programming Languages',
      },
      {
        name: 'Python',
        level: 'intermediate',
        category: 'Programming Languages',
      },
      { name: 'React', level: 'expert', category: 'Frontend' },
      { name: 'Vue.js', level: 'advanced', category: 'Frontend' },
      { name: 'Node.js', level: 'advanced', category: 'Backend' },
      { name: 'PostgreSQL', level: 'intermediate', category: 'Database' },
      { name: 'AWS', level: 'intermediate', category: 'Cloud' },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        issueDate: '2023-03',
        expiryDate: '2026-03',
        credentialId: 'AWS-DEV-2023-001',
        credentialUrl: 'https://aws.amazon.com/verification',
      },
    ],
    template: 'developer',
    customization: {
      primaryColor: '#1a73e8',
      secondaryColor: '#34a853',
      accentColor: '#ea4335',
      fontFamily: 'Inter',
      headerStyle: 'minimal',
      sectionOrder: [
        'about',
        'experience',
        'projects',
        'skills',
        'education',
        'certifications',
      ],
      hiddenSections: [],
    },
    aiSettings: {
      enhanceBio: true,
      enhanceProjectDescriptions: true,
      generateSkillsFromExperience: false,
      tone: 'professional',
      targetLength: 'detailed',
    },
    status: 'draft',
    subdomain: 'johndoe',
    views: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
];

/**
 * Get mock data for development environment only
 * @returns Array of mock portfolios or empty array in production
 */
export function getMockPortfolios(): Portfolio[] {
  if (process.env.NODE_ENV === 'production') {
    return [];
  }
  return mockPortfolios;
}
