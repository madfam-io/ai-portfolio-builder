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
 * Demo Portfolio Service
 *
 * Manages quick start demo portfolios for new users
 */

import { v4 as uuidv4 } from 'uuid';
import { Portfolio } from '@/types/portfolio';
import type { SampleDataConfig } from '@/lib/utils/sample-data/types';
import {
  developerSampleData,
  designerSampleData,
  consultantSampleData,
  businessSampleData,
  creativeSampleData,
  educatorSampleData,
  marketerSampleData,
  freelancerSampleData,
} from '@/lib/utils/sample-data';
import { TEMPLATE_CONFIGS } from '@/lib/templates/templateConfig';
import type { TemplateType } from '@/types/portfolio';
import { createClient } from '@/lib/supabase/client';
import { track } from '@/lib/monitoring/unified/events';

export interface DemoPortfolio {
  id: string;
  name: string;
  description: string;
  industry: string;
  template: TemplateType;
  thumbnail: string;
  features: string[];
  sampleData: SampleDataConfig;
  popularity: number;
}

// Pre-configured demo portfolios for quick start
export const DEMO_PORTFOLIOS: DemoPortfolio[] = [
  {
    id: 'dev-startup',
    name: 'Startup Developer',
    description: 'Perfect for developers working in fast-paced startups',
    industry: 'Technology',
    template: 'developer',
    thumbnail: '/images/demos/dev-startup.png',
    features: ['GitHub Integration', 'Project Metrics', 'Tech Stack Display'],
    sampleData: developerSampleData,
    popularity: 95,
  },
  {
    id: 'ui-designer',
    name: 'UI/UX Designer',
    description: 'Showcase your design work with visual impact',
    industry: 'Design',
    template: 'designer',
    thumbnail: '/images/demos/ui-designer.png',
    features: ['Portfolio Gallery', 'Case Studies', 'Design Process'],
    sampleData: designerSampleData,
    popularity: 92,
  },
  {
    id: 'business-consultant',
    name: 'Business Consultant',
    description: 'Professional portfolio for management consultants',
    industry: 'Consulting',
    template: 'consultant',
    thumbnail: '/images/demos/business-consultant.png',
    features: ['Client Testimonials', 'Case Studies', 'ROI Metrics'],
    sampleData: consultantSampleData,
    popularity: 88,
  },
  {
    id: 'creative-freelancer',
    name: 'Creative Freelancer',
    description: 'Stand out with a unique creative portfolio',
    industry: 'Creative',
    template: 'creative',
    thumbnail: '/images/demos/creative-freelancer.png',
    features: ['Visual Gallery', 'Client Work', 'Creative Process'],
    sampleData: creativeSampleData,
    popularity: 90,
  },
  {
    id: 'tech-educator',
    name: 'Tech Educator',
    description: 'Ideal for teachers, trainers, and course creators',
    industry: 'Education',
    template: 'educator',
    thumbnail: '/images/demos/tech-educator.png',
    features: ['Course Catalog', 'Student Testimonials', 'Resources'],
    sampleData: educatorSampleData,
    popularity: 85,
  },
  {
    id: 'executive-leader',
    name: 'Executive Leader',
    description: 'Professional portfolio for C-suite executives',
    industry: 'Business',
    template: 'business',
    thumbnail: '/images/demos/executive-leader.png',
    features: ['Leadership Experience', 'Board Positions', 'Speaking'],
    sampleData: businessSampleData,
    popularity: 87,
  },
  {
    id: 'digital-marketer',
    name: 'Digital Marketer',
    description: 'Showcase campaigns and marketing results',
    industry: 'Marketing',
    template: 'modern',
    thumbnail: '/images/demos/digital-marketer.png',
    features: ['Campaign Results', 'Analytics', 'Client Success'],
    sampleData: marketerSampleData,
    popularity: 86,
  },
  {
    id: 'minimal-professional',
    name: 'Minimal Professional',
    description: 'Clean and elegant for any profession',
    industry: 'General',
    template: 'minimal',
    thumbnail: '/images/demos/minimal-professional.png',
    features: ['Clean Design', 'Focus on Content', 'Easy Navigation'],
    sampleData: freelancerSampleData,
    popularity: 91,
  },
];

export interface QuickStartOptions {
  userId?: string;
  demoId: string;
  customizations?: {
    name?: string;
    title?: string;
    colors?: {
      primary?: string;
      secondary?: string;
    };
  };
  aiEnhance?: boolean;
}

export class DemoPortfolioService {
  /**
   * Get all available demo portfolios
   */
  static getAvailableDemos(industry?: string): DemoPortfolio[] {
    let demos = [...DEMO_PORTFOLIOS];

    if (industry) {
      demos = demos.filter(
        demo => demo.industry.toLowerCase() === industry.toLowerCase()
      );
    }

    // Sort by popularity
    return demos.sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * Get a specific demo portfolio
   */
  static getDemo(demoId: string): DemoPortfolio | null {
    return DEMO_PORTFOLIOS.find(demo => demo.id === demoId) || null;
  }

  /**
   * Create a portfolio from a demo template
   */
  static async createFromDemo(options: QuickStartOptions): Promise<{
    portfolioId: string;
    portfolio: Partial<Portfolio>;
    isTemporary: boolean;
  }> {
    const demo = this.getDemo(options.demoId);
    if (!demo) {
      throw new Error('Demo portfolio not found');
    }

    // Track demo selection
    await track.portfolio.create('demo-' + uuidv4(), async () => {}, {
      template: demo.template,
      ai_assisted: options.aiEnhance,
    });

    // Transform demo data to portfolio format
    const { personal, skills, ...restSampleData } = demo.sampleData;

    // Create portfolio content from demo
    const portfolioContent: Partial<Portfolio> = {
      // Personal info
      name: options.customizations?.name || personal.name,
      title: options.customizations?.title || personal.title,
      bio: personal.bio,
      avatarUrl: personal.avatarUrl,

      // Contact info
      contact: {
        email: personal.email,
        phone: personal.phone,
        location: personal.location,
      },

      // Skills - flatten the skill groups
      skills: [...skills.technical, ...skills.soft],

      // Rest of the data
      ...restSampleData,
    };

    // Create portfolio settings
    const portfolioSettings = {
      template: demo.template,
      theme: {
        mode: 'light',
        colors: {
          primary:
            TEMPLATE_CONFIGS[demo.template]?.colorScheme?.primary || '#3B82F6',
          secondary:
            TEMPLATE_CONFIGS[demo.template]?.colorScheme?.secondary ||
            '#1E40AF',
          accent:
            TEMPLATE_CONFIGS[demo.template]?.colorScheme?.accent || '#06B6D4',
          background:
            TEMPLATE_CONFIGS[demo.template]?.colorScheme?.background ||
            '#F8FAFC',
          text: TEMPLATE_CONFIGS[demo.template]?.colorScheme?.text || '#1E293B',
          ...(options.customizations?.colors || {}),
        },
        font: {
          heading: 'Inter',
          body: 'Inter',
        },
      },
      seo: {
        title: `${portfolioContent.name} - ${portfolioContent.title}`,
        description: portfolioContent.bio,
        keywords: portfolioContent.skills?.map(skill => skill.name) || [],
      },
      customization: {
        showProjects: true,
        showExperience: true,
        showEducation: true,
        showSkills: true,
        showTestimonials: false,
        projectsFirst: demo.template === 'developer',
      },
    };

    // If user is logged in, save to database
    if (options.userId) {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data: portfolio, error } = await supabase
        .from('portfolios')
        .insert({
          user_id: options.userId,
          name: `${demo.name} Portfolio`,
          slug: `demo-${demo.id}-${Date.now()}`,
          content: portfolioContent,
          settings: portfolioSettings,
          is_published: false,
          is_demo: true,
          demo_id: demo.id,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        portfolioId: portfolio.id,
        portfolio,
        isTemporary: false,
      };
    }

    // For non-logged in users, return temporary portfolio
    const temporaryId = `temp-${uuidv4()}`;
    const temporaryPortfolio = {
      id: temporaryId,
      name: `${demo.name} Portfolio`,
      content: portfolioContent,
      settings: portfolioSettings,
      is_published: false,
      is_demo: true,
      demo_id: demo.id,
      created_at: new Date().toISOString(),
    };

    // Store in session storage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        `demo-portfolio-${temporaryId}`,
        JSON.stringify(temporaryPortfolio)
      );
    }

    return {
      portfolioId: temporaryId,
      portfolio: temporaryPortfolio,
      isTemporary: true,
    };
  }

  /**
   * Get recommended demos based on user profile
   */
  static getRecommendedDemos(userProfile?: {
    industry?: string;
    experience?: string;
    goals?: string[];
  }): DemoPortfolio[] {
    let recommendations = [...DEMO_PORTFOLIOS];

    // Filter by industry if provided
    if (userProfile?.industry) {
      recommendations = recommendations.filter(
        demo =>
          demo.industry.toLowerCase() === userProfile.industry?.toLowerCase() ||
          demo.industry === 'General'
      );
    }

    // Sort by relevance
    recommendations.sort((a, b) => {
      let scoreA = a.popularity;
      let scoreB = b.popularity;

      // Boost score for matching industry
      if (userProfile?.industry) {
        if (a.industry === userProfile.industry) scoreA += 10;
        if (b.industry === userProfile.industry) scoreB += 10;
      }

      // Boost score based on experience level
      if (userProfile?.experience === 'senior' && a.template === 'business') {
        scoreA += 5;
      }
      if (userProfile?.experience === 'junior' && a.template === 'minimal') {
        scoreA += 5;
      }

      return scoreB - scoreA;
    });

    return recommendations.slice(0, 3);
  }

  /**
   * Clone a demo portfolio for customization
   */
  static async cloneDemo(
    demoId: string,
    userId: string,
    customName?: string
  ): Promise<string> {
    const demo = this.getDemo(demoId);
    if (!demo) {
      throw new Error('Demo portfolio not found');
    }

    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Check if user already has this demo
    const { data: existing } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .eq('demo_id', demoId)
      .single();

    if (existing) {
      return existing.id;
    }

    // Create new portfolio from demo
    const result = await this.createFromDemo({
      userId,
      demoId,
      customizations: {
        name: customName,
      },
    });

    return result.portfolioId;
  }

  /**
   * Get user's demo portfolios
   */
  static async getUserDemoPortfolios(userId: string): Promise<any[]> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .eq('is_demo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  /**
   * Convert temporary demo to permanent
   */
  static async convertToPermanent(
    temporaryId: string,
    userId: string
  ): Promise<string> {
    // Get temporary portfolio from session
    const stored = sessionStorage.getItem(`demo-portfolio-${temporaryId}`);
    if (!stored) {
      throw new Error('Temporary portfolio not found');
    }

    const temporaryPortfolio = JSON.parse(stored);
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Save to database
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: userId,
        name: temporaryPortfolio.name,
        slug: `portfolio-${Date.now()}`,
        content: temporaryPortfolio.content,
        settings: temporaryPortfolio.settings,
        is_published: false,
        is_demo: true,
        demo_id: temporaryPortfolio.demo_id,
      })
      .select()
      .single();

    if (error) throw error;

    // Clean up session storage
    sessionStorage.removeItem(`demo-portfolio-${temporaryId}`);

    // Track conversion
    await track.user.action(
      'demo_portfolio_converted',
      userId,
      async () => {},
      {
        demo_id: temporaryPortfolio.demo_id,
        temporary_id: temporaryId,
        permanent_id: portfolio.id,
      }
    );

    return portfolio.id;
  }
}
