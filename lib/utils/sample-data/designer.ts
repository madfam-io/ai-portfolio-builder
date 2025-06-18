import type { SampleDataConfig } from './types';

export const designerSampleData: SampleDataConfig = {
  personal: {
    name: 'Maya Chen',
    title: 'Product Design Lead',
    bio: 'Award-winning product designer with 8 years of experience creating user-centered digital experiences. Passionate about inclusive design, accessibility, and building design systems that scale.',
    email: 'maya@example.com',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY',
  },
  experience: [
    {
      id: '1',
      position: 'Product Design Lead',
      company: 'DesignStudio Pro',
      startDate: '2020-01',
      current: true,
      description:
        'Lead designer for enterprise SaaS products. Manage design system and mentor junior designers.',
      highlights: [
        'Increased user engagement by 35% through redesign',
        'Built comprehensive design system used across 8 products',
        'Led user research initiatives with 500+ participants',
      ],
      technologies: [
        'Figma',
        'Sketch',
        'Adobe Creative Suite',
        'Principle',
        'InVision',
      ],
    },
  ],
  projects: [
    {
      id: '1',
      title: 'FinanceApp Mobile Redesign',
      description:
        'Complete redesign of mobile banking app focusing on accessibility and user experience improvements.',
      highlights: [
        'Improved task completion rate by 40%',
        'WCAG 2.1 AA compliant design',
        'Featured in UX Magazine',
      ],
      technologies: ['Figma', 'Principle', 'Adobe XD', 'UserTesting'],
      projectUrl: 'https://behance.net/maya/financeapp',
      imageUrl: '/demo/design1.jpg',
      featured: true,
      order: 1,
    },
  ],
  education: [
    {
      id: '1',
      institution: 'Parsons School of Design',
      degree: 'Bachelor of Fine Arts',
      field: 'Communication Design',
      startDate: '2012-09',
      endDate: '2016-05',
      current: false,
      achievements: ['Summa Cum Laude', 'Design Excellence Award'],
    },
  ],
  skills: {
    technical: [
      { name: 'UI Design', level: 'expert' },
      { name: 'UX Research', level: 'expert' },
      { name: 'Figma', level: 'expert' },
      { name: 'Prototyping', level: 'advanced' },
      { name: 'Design Systems', level: 'expert' },
    ],
    soft: [
      { name: 'Leadership' },
      { name: 'User Empathy' },
      { name: 'Presentation Skills' },
      { name: 'Collaboration' },
    ],
  },
  certifications: [
    {
      id: '1',
      name: 'Google UX Design Certificate',
      issuer: 'Google',
      issueDate: '2021-03',
      credentialId: 'GOOGLE-UX-2021',
    },
  ],
  social: {
    linkedin: 'https://linkedin.com/in/mayachen',
    behance: 'https://behance.net/mayachen',
    dribbble: 'https://dribbble.com/mayachen',
  },
};
