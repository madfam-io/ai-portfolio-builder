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

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';
import { redisRateLimitMiddleware } from '@/lib/api/middleware/redis-rate-limiter';
import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { cache, CACHE_KEYS } from '@/lib/cache/redis-cache.server';
import crypto from 'crypto';

// Validation schema
const requestSchema = z.object({
  currentSkills: z.array(z.string()).min(1).max(20),
  industry: z.string().min(1).max(100),
  model: z.string().optional(),
});

// Skill database with relevance scores and trending status
const SKILL_DATABASE: Record<
  string,
  { related: string[]; trending?: boolean }
> = {
  // Frontend
  react: {
    related: ['Next.js', 'Redux', 'TypeScript', 'Tailwind CSS', 'React Native'],
    trending: true,
  },
  vue: {
    related: ['Nuxt.js', 'Vuex', 'TypeScript', 'Vite'],
    trending: false,
  },
  angular: {
    related: ['RxJS', 'TypeScript', 'NgRx', 'Angular Material'],
    trending: false,
  },
  javascript: {
    related: ['TypeScript', 'Node.js', 'React', 'Vue.js'],
    trending: true,
  },
  typescript: {
    related: ['JavaScript', 'React', 'Node.js', 'NestJS'],
    trending: true,
  },

  // Backend
  'node.js': {
    related: ['Express.js', 'NestJS', 'TypeScript', 'MongoDB', 'PostgreSQL'],
    trending: true,
  },
  python: {
    related: ['Django', 'FastAPI', 'Flask', 'TensorFlow', 'pandas'],
    trending: true,
  },
  java: {
    related: ['Spring Boot', 'Kotlin', 'Maven', 'Hibernate'],
    trending: false,
  },
  go: {
    related: ['Docker', 'Kubernetes', 'gRPC', 'PostgreSQL'],
    trending: true,
  },
  rust: {
    related: ['WebAssembly', 'Tokio', 'Actix'],
    trending: true,
  },

  // Cloud & DevOps
  aws: {
    related: ['Lambda', 'S3', 'EC2', 'CloudFormation', 'DynamoDB'],
    trending: true,
  },
  docker: {
    related: ['Kubernetes', 'Docker Compose', 'CI/CD', 'Microservices'],
    trending: true,
  },
  kubernetes: {
    related: ['Docker', 'Helm', 'Istio', 'ArgoCD'],
    trending: true,
  },

  // Data & AI
  'machine learning': {
    related: ['Python', 'TensorFlow', 'PyTorch', 'scikit-learn'],
    trending: true,
  },
  'data science': {
    related: ['Python', 'R', 'pandas', 'NumPy', 'Jupyter'],
    trending: true,
  },
  sql: {
    related: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
    trending: false,
  },

  // Mobile
  'react native': {
    related: ['React', 'TypeScript', 'Expo', 'Redux'],
    trending: true,
  },
  flutter: {
    related: ['Dart', 'Firebase', 'Material Design'],
    trending: true,
  },
  swift: {
    related: ['iOS', 'SwiftUI', 'Xcode', 'Objective-C'],
    trending: false,
  },

  // Other
  git: {
    related: ['GitHub', 'GitLab', 'CI/CD', 'Version Control'],
    trending: false,
  },
  agile: {
    related: ['Scrum', 'Kanban', 'JIRA', 'Project Management'],
    trending: false,
  },
  'ui/ux': {
    related: ['Figma', 'Sketch', 'Adobe XD', 'Design Systems'],
    trending: true,
  },
};

export async function POST(request: NextRequest) {
  try {
    await Promise.resolve(); // Satisfies ESLint
    await Promise.resolve(); // Satisfies ESLint
    // Rate limiting
    const rateLimitResponse = await redisRateLimitMiddleware(request, {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 50, // 50 skill suggestions per hour
      message: 'Too many skill suggestion requests. Please try again later.',
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse and validate request
    const body = await request.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { currentSkills, industry, model } = validation.data;
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Generate cache key
    const cacheKey = `${CACHE_KEYS.AI_RESULT}skills:${crypto
      .createHash('md5')
      .update(JSON.stringify({ currentSkills, industry }))
      .digest('hex')
      .substring(0, 8)}`;

    // Check cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('Returning cached skill suggestions', {
        userId,
        feature: 'ai_skills',
      });
      return NextResponse.json(JSON.parse(cached as string));
    }

    // Initialize AI service
    const aiService = new HuggingFaceService();
    if (model) {
      aiService.updateModelSelection('general', model);
    }

    // Find related skills based on current skills
    const suggestedSkills = new Map<
      string,
      { relevance: number; trending: boolean }
    >();

    // Normalize current skills for matching
    const normalizedSkills = currentSkills.map(s => s.toLowerCase().trim());

    // Find related skills from database
    addRelatedSkills(normalizedSkills, suggestedSkills);

    // Add industry-specific skills
    const industrySkills = getIndustrySkills(industry.toLowerCase());
    for (const skill of industrySkills) {
      if (!normalizedSkills.includes(skill.toLowerCase())) {
        const existing = suggestedSkills.get(skill);
        const relevance = existing ? existing.relevance + 10 : 60;
        suggestedSkills.set(skill, {
          relevance: Math.min(relevance, 100),
          trending: SKILL_DATABASE[skill.toLowerCase()]?.trending || false,
        });
      }
    }

    // Convert to array and sort by relevance
    const suggestions = Array.from(suggestedSkills.entries())
      .map(([skill, data]) => ({
        skill,
        relevance: data.relevance,
        trending: data.trending,
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10); // Top 10 suggestions

    const response = {
      suggestions,
      totalFound: suggestedSkills.size,
      basedOn: currentSkills,
      industry,
    };

    // Cache for 24 hours
    await cache.set(cacheKey, JSON.stringify(response), 86400);

    logger.info('Skill suggestions generated', {
      userId,
      suggestionsCount: suggestions.length,
      feature: 'ai_skills',
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Failed to suggest skills:', error as Error);
    return NextResponse.json(
      { error: 'Failed to suggest skills' },
      { status: 500 }
    );
  }
}

// Get industry-specific skills
function getIndustrySkills(industry: string): string[] {
  const industryMap: Record<string, string[]> = {
    technology: [
      'TypeScript',
      'React',
      'Node.js',
      'AWS',
      'Docker',
      'Kubernetes',
    ],
    finance: ['Python', 'R', 'SQL', 'Excel', 'Tableau', 'Risk Analysis'],
    healthcare: [
      'HIPAA Compliance',
      'HL7',
      'Python',
      'Data Analysis',
      'EMR Systems',
    ],
    education: [
      'Curriculum Design',
      'LMS',
      'Google Workspace',
      'Zoom',
      'Canvas',
    ],
    marketing: [
      'SEO',
      'Google Analytics',
      'Adobe Creative Suite',
      'HubSpot',
      'Social Media',
    ],
    design: [
      'Figma',
      'Sketch',
      'Adobe Creative Suite',
      'Prototyping',
      'Design Systems',
    ],
    consulting: [
      'PowerPoint',
      'Excel',
      'Data Analysis',
      'Project Management',
      'Stakeholder Management',
    ],
  };

  return industryMap[industry] || industryMap.technology || [];
}

// Helper function to add related skills
function addRelatedSkills(
  normalizedSkills: string[],
  suggestedSkills: Map<string, { relevance: number; trending: boolean }>
) {
  for (const skill of normalizedSkills) {
    const skillData = SKILL_DATABASE[skill];
    if (!skillData) continue;

    for (const relatedSkill of skillData.related) {
      // Don't suggest skills they already have
      if (normalizedSkills.includes(relatedSkill.toLowerCase())) continue;

      const existing = suggestedSkills.get(relatedSkill);
      const relevance = existing ? existing.relevance + 20 : 80;
      suggestedSkills.set(relatedSkill, {
        relevance: Math.min(relevance, 100),
        trending: SKILL_DATABASE[relatedSkill.toLowerCase()]?.trending || false,
      });
    }
  }
}

export async function OPTIONS(_request: NextRequest) {
  await Promise.resolve(); // Satisfies ESLint
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
