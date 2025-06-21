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
 * Seed Script for Premium Templates
 *
 * This script populates the database with initial premium templates for the marketplace
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const premiumTemplates = [
  {
    id: uuidv4(),
    name: 'Executive Pro',
    slug: 'executive-pro',
    description:
      'Premium portfolio template for C-suite executives and senior leaders',
    long_description:
      'Elevate your professional presence with Executive Pro. This premium template is specifically designed for senior executives, C-suite professionals, and industry leaders who need to showcase their strategic vision, leadership experience, and transformational achievements.',
    category: 'professional',
    tags: ['executive', 'leadership', 'corporate', 'premium'],
    price_usd: 149,
    price_mxn: 2980,
    price_eur: 139,
    discount_percentage: 0,
    template_type: 'business',
    thumbnail_url: '/images/templates/executive-pro-thumb.jpg',
    gallery_images: [
      '/images/templates/executive-pro-1.jpg',
      '/images/templates/executive-pro-2.jpg',
      '/images/templates/executive-pro-3.jpg',
    ],
    features: [
      {
        icon: 'briefcase',
        title: 'Executive Dashboard',
        description:
          'Showcase key metrics and achievements with a professional dashboard layout',
      },
      {
        icon: 'chart',
        title: 'Leadership Timeline',
        description:
          'Present your career progression with an elegant interactive timeline',
      },
      {
        icon: 'users',
        title: 'Board & Advisory Roles',
        description:
          'Dedicated sections for board positions and advisory engagements',
      },
      {
        icon: 'award',
        title: 'Recognition Showcase',
        description: 'Highlight awards, publications, and speaking engagements',
      },
    ],
    industries: [
      'Business',
      'Finance',
      'Technology',
      'Healthcare',
      'Consulting',
    ],
    best_for: ['CEOs', 'C-Suite Executives', 'Board Members', 'Senior Leaders'],
    customization_options: [
      {
        id: 'color-scheme',
        name: 'Color Scheme',
        type: 'color',
        options: [
          'Corporate Blue',
          'Executive Black',
          'Royal Purple',
          'Forest Green',
        ],
        default: 'Corporate Blue',
      },
      {
        id: 'layout',
        name: 'Layout Style',
        type: 'layout',
        options: ['Classic', 'Modern', 'Bold'],
        default: 'Classic',
      },
    ],
    author_name: 'PRISMA Design Team',
    status: 'active',
    featured: true,
    best_seller: true,
    new_arrival: false,
    purchases_count: 342,
    rating: 4.9,
    reviews_count: 87,
  },
  {
    id: uuidv4(),
    name: 'Creative Studio',
    slug: 'creative-studio',
    description:
      'Stunning portfolio template for designers, artists, and creative professionals',
    long_description:
      'Transform your creative work into an immersive experience with Creative Studio. This template features bold visuals, smooth animations, and a gallery-focused layout that puts your creative work front and center.',
    category: 'creative',
    tags: ['creative', 'design', 'art', 'portfolio', 'gallery'],
    price_usd: 129,
    price_mxn: 2580,
    price_eur: 119,
    discount_percentage: 20,
    template_type: 'creative',
    thumbnail_url: '/images/templates/creative-studio-thumb.jpg',
    gallery_images: [
      '/images/templates/creative-studio-1.jpg',
      '/images/templates/creative-studio-2.jpg',
      '/images/templates/creative-studio-3.jpg',
    ],
    features: [
      {
        icon: 'image',
        title: 'Masonry Gallery',
        description: 'Beautiful masonry layout for showcasing visual work',
      },
      {
        icon: 'play',
        title: 'Video Integration',
        description: 'Seamlessly embed video reels and motion graphics',
      },
      {
        icon: 'layers',
        title: 'Project Case Studies',
        description:
          'Deep-dive into your creative process with detailed case studies',
      },
      {
        icon: 'palette',
        title: 'Color Customization',
        description: 'Full control over color schemes to match your brand',
      },
    ],
    industries: ['Design', 'Creative', 'Marketing', 'Media', 'Entertainment'],
    best_for: ['Designers', 'Artists', 'Photographers', 'Creative Directors'],
    customization_options: [
      {
        id: 'gallery-style',
        name: 'Gallery Style',
        type: 'layout',
        options: ['Masonry', 'Grid', 'Carousel', 'Full-width'],
        default: 'Masonry',
      },
      {
        id: 'animation',
        name: 'Animation Style',
        type: 'component',
        options: ['Subtle', 'Dynamic', 'Minimal', 'Playful'],
        default: 'Dynamic',
      },
    ],
    author_name: 'Creative Studio Pro',
    status: 'active',
    featured: true,
    best_seller: false,
    new_arrival: true,
    purchases_count: 256,
    rating: 4.8,
    reviews_count: 62,
  },
  {
    id: uuidv4(),
    name: 'Tech Innovator',
    slug: 'tech-innovator',
    description:
      'Modern portfolio template for developers, engineers, and tech professionals',
    long_description:
      'Showcase your technical expertise with Tech Innovator. Features code highlighting, GitHub integration, project metrics, and a clean, minimal design that lets your technical achievements shine.',
    category: 'technical',
    tags: ['developer', 'engineer', 'tech', 'programming', 'modern'],
    price_usd: 99,
    price_mxn: 1980,
    price_eur: 89,
    discount_percentage: 0,
    template_type: 'developer',
    thumbnail_url: '/images/templates/tech-innovator-thumb.jpg',
    gallery_images: [
      '/images/templates/tech-innovator-1.jpg',
      '/images/templates/tech-innovator-2.jpg',
      '/images/templates/tech-innovator-3.jpg',
    ],
    features: [
      {
        icon: 'code',
        title: 'Code Showcase',
        description:
          'Syntax-highlighted code snippets with multiple theme options',
      },
      {
        icon: 'git',
        title: 'GitHub Integration',
        description: 'Display your GitHub stats and contribution graph',
      },
      {
        icon: 'terminal',
        title: 'Tech Stack Display',
        description: 'Visual representation of your technical skills and tools',
      },
      {
        icon: 'cpu',
        title: 'Project Metrics',
        description: 'Show performance metrics and technical achievements',
      },
    ],
    industries: [
      'Technology',
      'Software',
      'Engineering',
      'Data Science',
      'AI/ML',
    ],
    best_for: [
      'Software Engineers',
      'Full-Stack Developers',
      'DevOps Engineers',
      'Data Scientists',
    ],
    customization_options: [
      {
        id: 'code-theme',
        name: 'Code Theme',
        type: 'component',
        options: ['Dark', 'Light', 'Monokai', 'GitHub'],
        default: 'Dark',
      },
      {
        id: 'layout-density',
        name: 'Layout Density',
        type: 'layout',
        options: ['Compact', 'Comfortable', 'Spacious'],
        default: 'Comfortable',
      },
    ],
    author_name: 'Dev Studio',
    status: 'active',
    featured: true,
    best_seller: true,
    new_arrival: false,
    purchases_count: 523,
    rating: 4.9,
    reviews_count: 145,
  },
  {
    id: uuidv4(),
    name: 'Consultant Elite',
    slug: 'consultant-elite',
    description:
      'Professional template for consultants and advisory professionals',
    long_description:
      'Present your consulting expertise with authority and professionalism. Consultant Elite features client testimonials, case study showcases, and service offerings in a layout that builds trust and credibility.',
    category: 'professional',
    tags: ['consultant', 'advisory', 'professional', 'business'],
    price_usd: 119,
    price_mxn: 2380,
    price_eur: 109,
    discount_percentage: 15,
    template_type: 'consultant',
    thumbnail_url: '/images/templates/consultant-elite-thumb.jpg',
    gallery_images: [
      '/images/templates/consultant-elite-1.jpg',
      '/images/templates/consultant-elite-2.jpg',
      '/images/templates/consultant-elite-3.jpg',
    ],
    features: [
      {
        icon: 'briefcase',
        title: 'Service Packages',
        description:
          'Present your consulting services with clear pricing tiers',
      },
      {
        icon: 'chart',
        title: 'ROI Calculator',
        description: 'Interactive calculator showing client value proposition',
      },
      {
        icon: 'users',
        title: 'Client Testimonials',
        description: 'Powerful testimonial section with video support',
      },
      {
        icon: 'book',
        title: 'Resource Library',
        description: 'Share whitepapers, guides, and thought leadership',
      },
    ],
    industries: ['Consulting', 'Business', 'Finance', 'Strategy', 'Management'],
    best_for: [
      'Management Consultants',
      'Business Advisors',
      'Strategy Consultants',
      'Independent Consultants',
    ],
    customization_options: [
      {
        id: 'trust-elements',
        name: 'Trust Elements',
        type: 'component',
        options: ['Certifications', 'Client Logos', 'Awards', 'All'],
        default: 'All',
      },
    ],
    author_name: 'Business Pro Designs',
    status: 'active',
    featured: false,
    best_seller: true,
    new_arrival: false,
    purchases_count: 189,
    rating: 4.7,
    reviews_count: 43,
  },
  {
    id: uuidv4(),
    name: 'Academic Scholar',
    slug: 'academic-scholar',
    description:
      'Comprehensive template for educators, researchers, and academics',
    long_description:
      'Perfect for showcasing your academic journey, research contributions, and teaching excellence. Features publication lists, course catalogs, and research project showcases.',
    category: 'academic',
    tags: ['education', 'research', 'academic', 'teaching', 'scholar'],
    price_usd: 89,
    price_mxn: 1780,
    price_eur: 79,
    discount_percentage: 0,
    template_type: 'educator',
    thumbnail_url: '/images/templates/academic-scholar-thumb.jpg',
    gallery_images: [
      '/images/templates/academic-scholar-1.jpg',
      '/images/templates/academic-scholar-2.jpg',
      '/images/templates/academic-scholar-3.jpg',
    ],
    features: [
      {
        icon: 'book',
        title: 'Publication Manager',
        description: 'Organized display of research papers and publications',
      },
      {
        icon: 'graduation',
        title: 'Course Catalog',
        description: 'Showcase your teaching portfolio and course materials',
      },
      {
        icon: 'microscope',
        title: 'Research Projects',
        description: 'Detailed research project presentations with outcomes',
      },
      {
        icon: 'award',
        title: 'Grants & Awards',
        description: 'Highlight your academic achievements and funding',
      },
    ],
    industries: [
      'Education',
      'Research',
      'Healthcare',
      'Science',
      'Technology',
    ],
    best_for: [
      'Professors',
      'Researchers',
      'PhD Candidates',
      'Academic Leaders',
    ],
    customization_options: [
      {
        id: 'citation-style',
        name: 'Citation Style',
        type: 'component',
        options: ['APA', 'MLA', 'Chicago', 'Harvard'],
        default: 'APA',
      },
    ],
    author_name: 'Academic Designs Co',
    status: 'active',
    featured: false,
    best_seller: false,
    new_arrival: true,
    purchases_count: 134,
    rating: 4.6,
    reviews_count: 28,
  },
];

async function seedPremiumTemplates() {
  console.log('Starting premium template seeding...');

  for (const template of premiumTemplates) {
    try {
      const { error } = await supabase
        .from('premium_templates')
        .insert(template);

      if (error) {
        console.error(`Failed to insert template ${template.name}:`, error);
      } else {
        console.log(`✓ Inserted template: ${template.name}`);
      }
    } catch (error) {
      console.error(`Error inserting template ${template.name}:`, error);
    }
  }

  console.log('Premium template seeding completed!');
}

// Run the seeding
seedPremiumTemplates().catch(console.error);
