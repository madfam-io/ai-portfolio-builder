/**
 * Keyword Research and Suggestions API
 * Provides keyword research and suggestions for SEO optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getGEOService } from '@/lib/ai/geo/geo-service';
import { createClient } from '@/lib/supabase/server';

// Request validation schema
const keywordResearchSchema = z.object({
  seedKeyword: z.string().min(2, 'Seed keyword must be at least 2 characters'),
  industry: z.string().optional(),
  contentType: z
    .enum(['bio', 'project', 'experience', 'skill', 'general'])
    .optional(),
  location: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user === null) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const validationResult = keywordResearchSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { seedKeyword, industry, contentType, location } =
      validationResult.data;

    // 3. Initialize GEO service
    const geoService = getGEOService();

    // 4. Research keywords
    const keywordResearch = await geoService.researchKeywords(
      seedKeyword,
      industry
    );

    // 5. Generate keyword variations
    const variations = generateKeywordVariations(seedKeyword, {
      industry,
      contentType,
      location,
    });

    // 6. Generate long-tail keywords
    const longTailKeywords = generateLongTailKeywords(seedKeyword, {
      industry,
      contentType,
      location,
    });

    // 7. Return keyword suggestions
    return NextResponse.json({
      success: true,
      data: {
        primaryKeyword: {
          keyword: seedKeyword,
          searchVolume: keywordResearch[0]?.searchVolume || 'N/A',
          difficulty: keywordResearch[0]?.difficulty || 'N/A',
          trends: keywordResearch[0]?.trends || 'stable',
        },
        relatedKeywords: keywordResearch[0]?.relatedKeywords || [],
        questions: keywordResearch[0]?.questions || [],
        variations,
        longTailKeywords,
        locationBased: location
          ? generateLocationKeywords(seedKeyword, location)
          : [],
        industrySpecific: industry
          ? generateIndustryKeywords(seedKeyword, industry)
          : [],
        recommendations: generateKeywordRecommendations({
          seedKeyword,
          industry,
          contentType,
          location,
        }),
      },
      metadata: {
        researchedAt: new Date().toISOString(),
        totalKeywords:
          (keywordResearch[0]?.relatedKeywords.length || 0) +
          variations.length +
          longTailKeywords.length,
      },
    });
  } catch (error) {
    console.error('Keyword research failed:', error);
    return NextResponse.json(
      { error: 'Failed to research keywords' },
      { status: 500 }
    );
  }
}

/**
 * Get trending keywords for industry
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user === null) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry') || 'technology';

    // Return trending keywords by industry
    const trendingKeywords = getTrendingKeywordsByIndustry(industry);

    return NextResponse.json({
      success: true,
      data: {
        industry,
        trending: trendingKeywords,
        categories: getKeywordCategories(industry),
        tips: getKeywordOptimizationTips(industry),
      },
    });
  } catch (error) {
    console.error('Failed to fetch trending keywords:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending keywords' },
      { status: 500 }
    );
  }
}

/**
 * Generate keyword variations
 */
function generateKeywordVariations(
  keyword: string,
  context: { industry?: string; contentType?: string; location?: string }
): string[] {
  const variations: string[] = [];
  const baseKeyword = keyword.toLowerCase();

  // Plural/singular variations
  if (!baseKeyword.endsWith('s')) {
    variations.push(`${baseKeyword}s`);
  } else {
    variations.push(baseKeyword.slice(0, -1));
  }

  // Professional variations
  variations.push(`professional ${baseKeyword}`);
  variations.push(`expert ${baseKeyword}`);
  variations.push(`senior ${baseKeyword}`);
  variations.push(`${baseKeyword} specialist`);
  variations.push(`${baseKeyword} consultant`);

  // Action variations
  variations.push(`hire ${baseKeyword}`);
  variations.push(`find ${baseKeyword}`);
  variations.push(`best ${baseKeyword}`);
  variations.push(`top ${baseKeyword}`);

  // Industry-specific variations
  if (context.industry) {
    variations.push(`${context.industry} ${baseKeyword}`);
    variations.push(`${baseKeyword} for ${context.industry}`);
  }

  // Location-specific variations
  if (context.location) {
    variations.push(`${baseKeyword} in ${context.location}`);
    variations.push(`${context.location} ${baseKeyword}`);
  }

  return [...new Set(variations)].slice(0, 15);
}

/**
 * Generate long-tail keywords
 */
function generateLongTailKeywords(
  keyword: string,
  context: { industry?: string; contentType?: string; location?: string }
): string[] {
  const longTails: string[] = [];
  const baseKeyword = keyword.toLowerCase();

  // Question-based long tails
  longTails.push(`how to become a ${baseKeyword}`);
  longTails.push(`what does a ${baseKeyword} do`);
  longTails.push(`${baseKeyword} salary expectations`);
  longTails.push(`${baseKeyword} skills required`);
  longTails.push(`${baseKeyword} job description`);

  // Service-based long tails
  longTails.push(`freelance ${baseKeyword} services`);
  longTails.push(`${baseKeyword} portfolio examples`);
  longTails.push(`hire ${baseKeyword} for project`);

  // Comparison long tails
  longTails.push(`${baseKeyword} vs alternatives`);
  longTails.push(`best ${baseKeyword} tools`);
  longTails.push(`${baseKeyword} certification guide`);

  // Industry-specific long tails
  if (context.industry) {
    longTails.push(`${baseKeyword} in ${context.industry} industry`);
    longTails.push(`${context.industry} ${baseKeyword} best practices`);
  }

  return longTails.slice(0, 10);
}

/**
 * Generate location-based keywords
 */
function generateLocationKeywords(keyword: string, location: string): string[] {
  const locationKeywords: string[] = [];
  const baseKeyword = keyword.toLowerCase();
  const locationLower = location.toLowerCase();

  locationKeywords.push(`${baseKeyword} ${locationLower}`);
  locationKeywords.push(`${baseKeyword} in ${locationLower}`);
  locationKeywords.push(`${baseKeyword} near ${locationLower}`);
  locationKeywords.push(`${locationLower} ${baseKeyword} services`);
  locationKeywords.push(`best ${baseKeyword} ${locationLower}`);
  locationKeywords.push(`local ${baseKeyword} ${locationLower}`);

  return locationKeywords;
}

/**
 * Generate industry-specific keywords
 */
function generateIndustryKeywords(keyword: string, industry: string): string[] {
  const industryKeywords: string[] = [];
  const baseKeyword = keyword.toLowerCase();
  const industryLower = industry.toLowerCase();

  industryKeywords.push(`${industryLower} ${baseKeyword}`);
  industryKeywords.push(`${baseKeyword} for ${industryLower}`);
  industryKeywords.push(`${industryLower} industry ${baseKeyword}`);
  industryKeywords.push(`${baseKeyword} in ${industryLower} sector`);
  industryKeywords.push(`${industryLower} ${baseKeyword} expert`);

  return industryKeywords;
}

/**
 * Generate keyword recommendations
 */
function generateKeywordRecommendations(context: {
  seedKeyword: string;
  industry?: string;
  contentType?: string;
  location?: string;
}): string[] {
  const recommendations: string[] = [];

  // General recommendations
  recommendations.push(
    `Use "${context.seedKeyword}" in your page title and H1 heading`
  );
  recommendations.push('Include variations in H2 and H3 headings');
  recommendations.push('Maintain 1-2% keyword density for primary keyword');
  recommendations.push('Use LSI keywords naturally throughout content');

  // Content-type specific recommendations
  if (context.contentType === 'bio') {
    recommendations.push('Include keyword in the first sentence of your bio');
    recommendations.push('Use professional variations (expert, specialist)');
  } else if (context.contentType === 'project') {
    recommendations.push(
      'Use action-oriented keywords (developed, built, created)'
    );
    recommendations.push('Include technology-specific keywords');
  }

  // Location-specific recommendations
  if (context.location) {
    recommendations.push(`Include "${context.location}" for local SEO`);
    recommendations.push('Add location to meta description');
  }

  return recommendations.slice(0, 5);
}

/**
 * Get trending keywords by industry
 */
function getTrendingKeywordsByIndustry(industry: string): string[] {
  const trendingByIndustry: Record<string, string[]> = {
    technology: [
      'AI developer',
      'machine learning engineer',
      'cloud architect',
      'DevOps specialist',
      'full-stack developer',
      'blockchain developer',
      'cybersecurity expert',
      'data scientist',
    ],
    design: [
      'UX designer',
      'UI designer',
      'product designer',
      'design system',
      'user research',
      'interaction design',
      'visual designer',
      'design thinking',
    ],
    marketing: [
      'growth hacker',
      'content strategist',
      'SEO specialist',
      'social media manager',
      'digital marketer',
      'marketing automation',
      'conversion optimization',
      'brand strategist',
    ],
    business: [
      'business analyst',
      'project manager',
      'product manager',
      'strategy consultant',
      'operations manager',
      'business development',
      'agile coach',
      'change management',
    ],
  };

  const industryKeywords = trendingByIndustry[industry.toLowerCase()];
  if (industryKeywords) {
    return industryKeywords;
  }
  return trendingByIndustry.technology || [];
}

/**
 * Get keyword categories
 */
function getKeywordCategories(industry: string): Record<string, string[]> {
  return {
    skills: [`${industry} skills`, `technical skills`, `soft skills`],
    roles: [`${industry} roles`, `job titles`, `positions`],
    tools: [`${industry} tools`, `software`, `platforms`],
    certifications: [`${industry} certifications`, `qualifications`],
    trends: [`${industry} trends`, `emerging technologies`],
  };
}

/**
 * Get keyword optimization tips
 */
function getKeywordOptimizationTips(industry: string): string[] {
  return [
    `Focus on "${industry}" + skill combinations`,
    'Use question-based keywords for featured snippets',
    'Include location for local opportunities',
    'Target long-tail keywords for less competition',
    'Update keywords based on industry trends',
  ];
}
