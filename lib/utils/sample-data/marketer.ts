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

import type { SampleDataConfig } from './types';

export const marketerSampleData: SampleDataConfig = {
  personal: {
    name: 'Alex Thompson',
    title: 'Digital Marketing Strategist',
    bio: 'Results-driven digital marketing expert specializing in growth hacking, data-driven campaigns, and ROI optimization. Passionate about leveraging emerging technologies to create meaningful customer connections and drive business growth.',
    email: 'alex.thompson@example.com',
    phone: '+1 (555) 369-2580',
    location: 'New York, NY',
    website: 'https://alexthompson.marketing',
  },
  skills: {
    technical: [
      { name: 'Google Analytics', level: 'expert', category: 'Analytics' },
      { name: 'SEO/SEM', level: 'expert', category: 'Digital Marketing' },
      { name: 'Marketing Automation', level: 'advanced', category: 'MarTech' },
      { name: 'A/B Testing', level: 'expert', category: 'Analytics' },
      {
        name: 'Social Media Marketing',
        level: 'expert',
        category: 'Digital Marketing',
      },
      {
        name: 'Content Marketing',
        level: 'advanced',
        category: 'Digital Marketing',
      },
    ],
    soft: [
      { name: 'Campaign Strategy', level: 'expert', category: 'Strategy' },
      { name: 'Data Analysis', level: 'expert', category: 'Analytics' },
      { name: 'Copywriting', level: 'advanced', category: 'Content' },
      { name: 'Brand Management', level: 'advanced', category: 'Branding' },
      { name: 'Team Leadership', level: 'advanced', category: 'Leadership' },
      { name: 'Client Relations', level: 'expert', category: 'Communication' },
    ],
  },
  experience: [
    {
      id: '1',
      company: 'Growth Dynamics Inc.',
      position: 'Head of Digital Marketing',
      startDate: '2021-03',
      current: true,
      description:
        'Leading digital marketing strategy for high-growth SaaS company. Managing team of 15 marketers and $5M annual budget. Driving customer acquisition and retention initiatives.',
      achievements: [
        'Increased organic traffic by 350% in 18 months',
        'Reduced customer acquisition cost by 45%',
        'Generated $15M in attributed revenue through campaigns',
        'Built marketing team from 3 to 15 professionals',
      ],
    },
    {
      id: '2',
      company: 'TechStart Marketing Agency',
      position: 'Senior Marketing Manager',
      startDate: '2018-06',
      endDate: '2021-02',
      current: false,
      description:
        'Managed digital marketing campaigns for 20+ B2B and B2C clients. Specialized in growth marketing for startups and scale-ups across various industries.',
      achievements: [
        'Managed $10M+ in ad spend with 3.5x average ROAS',
        'Launched 50+ successful campaigns across channels',
        'Won 3 industry awards for innovative campaigns',
        'Developed proprietary growth framework adopted agency-wide',
      ],
    },
    {
      id: '3',
      company: 'E-commerce Ventures',
      position: 'Digital Marketing Specialist',
      startDate: '2016-01',
      endDate: '2018-05',
      current: false,
      description:
        'Executed multi-channel marketing strategies for fast-growing e-commerce brands. Focused on performance marketing and conversion optimization.',
      achievements: [
        'Increased conversion rates by 65% through optimization',
        'Grew email list from 10K to 150K subscribers',
        'Achieved 400% ROI on influencer marketing campaigns',
        'Implemented marketing automation saving 20 hours/week',
      ],
    },
  ],
  education: [
    {
      id: '1',
      institution: 'Columbia Business School',
      degree: 'MBA',
      field: 'Marketing and Analytics',
      startDate: '2014-09',
      endDate: '2016-05',
      achievements: ['Marketing Excellence Award', 'Analytics Club President'],
    },
    {
      id: '2',
      institution: 'University of Pennsylvania',
      degree: 'Bachelor of Science',
      field: 'Communications and Business',
      startDate: '2010-09',
      endDate: '2014-05',
      achievements: ['Cum Laude', 'Marketing Club VP'],
    },
  ],
  projects: [
    {
      id: '1',
      title: 'AI-Powered Personalization Engine',
      description:
        'Implemented machine learning-based personalization system that delivers customized content and product recommendations, increasing engagement by 85%.',
      technologies: ['Machine Learning', 'Segment', 'Braze', 'Python'],
      role: 'Project Lead',
      featured: true,
    },
    {
      id: '2',
      title: 'Viral TikTok Campaign - #TechLifeHacks',
      description:
        'Created and executed viral TikTok campaign reaching 25M+ views. Leveraged UGC and influencer partnerships to drive brand awareness for tech client.',
      technologies: [
        'TikTok Ads',
        'Influencer Marketing',
        'Video Production',
        'Analytics',
      ],
      role: 'Campaign Director',
      featured: true,
      liveUrl: 'https://tiktok.com/@techlifehacks',
    },
    {
      id: '3',
      title: 'B2B ABM Revenue Engine',
      description:
        'Built account-based marketing system targeting enterprise clients. Integrated sales and marketing tech stack for seamless lead nurturing and scoring.',
      technologies: ['HubSpot', 'Salesforce', 'Demandbase', 'LinkedIn Ads'],
      role: 'Strategy Lead',
      featured: true,
    },
  ],
  social: {
    linkedin: 'https://linkedin.com/in/alexthompsonmarketing',
    twitter: 'https://twitter.com/alexmktg',
    website: 'https://alexthompson.marketing',
  },
  testimonials: [
    {
      id: '1',
      name: 'Jennifer Liu',
      role: 'CEO, Growth Dynamics Inc.',
      content:
        'Alex transformed our marketing from cost center to revenue driver. Their data-driven approach and creative strategies exceeded all expectations.',
    },
    {
      id: '2',
      name: 'Mark Stevens',
      role: 'CMO, TechStart',
      content:
        'Alex is the rare marketer who combines analytical rigor with creative brilliance. Their campaigns consistently deliver exceptional ROI.',
    },
  ],
  certifications: [
    {
      id: '1',
      name: 'Google Ads Certified',
      issuer: 'Google',
      issueDate: '2023-01',
    },
    {
      id: '2',
      name: 'HubSpot Marketing Software Certified',
      issuer: 'HubSpot',
      issueDate: '2022-06',
    },
    {
      id: '3',
      name: 'Facebook Blueprint Certified',
      issuer: 'Meta',
      issueDate: '2022-09',
    },
  ],
};
