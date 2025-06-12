/**
 * GEO-Enhanced Prompt Templates
 * SEO-aware prompts for content generation with keyword integration
 */

import { PromptTemplate } from '../types';

export const geoPromptTemplates = {
  /**
   * GEO-Enhanced Bio Generation
   * Creates SEO-optimized professional bios with keyword integration
   */
  geoBioEnhancement: {
    system: `You are an expert SEO content writer specializing in professional bios that rank well in search engines while maintaining authenticity and engagement.

Your task is to create a bio that:
1. Naturally incorporates the primary keyword within the first 50 words
2. Uses secondary keywords and LSI terms throughout
3. Maintains optimal keyword density (1-2%) without stuffing
4. Follows a clear structure with strong opening and closing
5. Includes power words and action verbs for engagement
6. Optimizes for featured snippets when possible
7. Targets the specified audience and search intent

Guidelines:
- Length: {targetLength} (50-150 words optimal for search engines)
- Include quantifiable achievements and specific expertise
- Use semantic variations of keywords
- Write in {tone} tone while maintaining professionalism
- Structure: Hook → Expertise → Value Proposition → Call to Action
- Ensure mobile readability with shorter sentences`,

    user: `Original Bio: {bio}

SEO Context:
- Primary Keyword: {primaryKeyword}
- Secondary Keywords: {secondaryKeywords}
- Professional Title: {title}
- Industry: {industry}
- Target Audience: {targetAudience}
- Key Skills: {skills}
- Tone: {tone}
- Content Goals: {contentGoals}

Generate an SEO-optimized bio that ranks well for the primary keyword while maintaining authenticity. Include relevant entities and semantic keywords naturally.

Enhanced Bio:`,

    examples: [
      {
        input: 'Software developer with experience in web development',
        output:
          "Full-stack software developer specializing in scalable web applications and cloud architecture. Expert in React, Node.js, and AWS, delivering high-performance solutions that increase user engagement by 40%. Passionate about clean code and agile methodologies, I help startups and enterprises build robust digital products. Let's transform your ideas into powerful web experiences.",
      },
    ],
  } as PromptTemplate,

  /**
   * GEO-Enhanced Project Descriptions
   * Optimizes project descriptions for search visibility and engagement
   */
  geoProjectOptimization: {
    system: `You are an SEO specialist who optimizes project descriptions for maximum search visibility and user engagement.

Create project descriptions that:
1. Target long-tail keywords related to the project type and technologies
2. Use structured data-friendly formatting (problems, solutions, results)
3. Include semantic keywords and related terms
4. Optimize for "how to" and problem-solving queries
5. Feature rich snippets eligibility (lists, steps, metrics)
6. Balance technical accuracy with accessibility
7. Include location-based keywords if relevant

Structure:
- Problem/Challenge (with keywords)
- Solution/Approach (with technologies)
- Results/Impact (with metrics)
- Technologies & Skills (as list for featured snippets)

Return as JSON with structured sections for easy parsing and schema markup.`,

    user: `Project: {title}
Description: {description}
Technologies: {technologies}

SEO Context:
- Primary Keyword: {primaryKeyword}
- Industry: {industry}
- Target Queries: {targetQueries}
- Location: {location}

Optimize this project description for search engines while showcasing technical expertise and business impact. Structure the content for rich snippets.`,

    examples: [
      {
        input: 'E-commerce website built with React',
        output: `{
  "title": "React E-commerce Platform - Scalable Online Store Solution",
  "description": "Developed a high-performance React e-commerce platform that handles 50,000+ daily transactions. Built with modern JAMstack architecture for optimal Core Web Vitals and SEO performance.",
  "problem": "Client needed a fast, SEO-friendly e-commerce solution to compete with established online retailers in the sustainable fashion industry.",
  "solution": "Implemented a headless commerce architecture using React, Next.js, and Shopify API. Optimized for mobile-first indexing with server-side rendering and progressive enhancement.",
  "results": {
    "metrics": [
      "250% increase in organic search traffic",
      "Page load time reduced to 1.2 seconds",
      "Core Web Vitals score: 98/100",
      "40% improvement in conversion rate"
    ]
  },
  "technologies": [
    "React 18 with Server Components",
    "Next.js 13 for SEO optimization",
    "Shopify Storefront API",
    "Tailwind CSS for responsive design",
    "Vercel Edge Functions"
  ],
  "keywords": "React e-commerce development, headless commerce solution, SEO-friendly online store, sustainable fashion platform"
}`,
      },
    ],
  } as PromptTemplate,

  /**
   * GEO-Enhanced Skill Descriptions
   * Optimizes skill presentations for professional visibility
   */
  geoSkillOptimization: {
    system: `Create SEO-optimized skill descriptions that improve professional visibility in search results.

Optimize for:
1. Skill-based search queries (e.g., "React developer", "Python expert")
2. Industry-specific terminology and certifications
3. Location + skill combinations
4. Problem-solving capabilities
5. Tools and frameworks combinations

Format skills for:
- LinkedIn optimization
- ATS (Applicant Tracking Systems)
- Google for Jobs
- Professional directories`,

    user: `Skills: {skills}
Experience Level: {experienceLevel}
Industry: {industry}
Target Role: {targetRole}
Location: {location}

Generate SEO-optimized skill descriptions with relevant keywords and industry terms.`,
  } as PromptTemplate,

  /**
   * Meta Description Generator
   * Creates compelling meta descriptions optimized for CTR
   */
  geoMetaDescription: {
    system: `Generate compelling meta descriptions that maximize click-through rates from search results.

Requirements:
- Length: 150-160 characters (optimal for desktop and mobile)
- Include primary keyword naturally
- Add a clear value proposition
- Include a call to action
- Create urgency or curiosity
- Match search intent
- Avoid keyword stuffing
- Use power words for emotional appeal`,

    user: `Content Summary: {contentSummary}
Primary Keyword: {primaryKeyword}
Target Audience: {targetAudience}
Value Proposition: {valueProposition}
Page Type: {pageType}

Generate an optimized meta description:`,
  } as PromptTemplate,

  /**
   * SEO Title Generator
   * Creates click-worthy titles optimized for search rankings
   */
  geoTitleGeneration: {
    system: `Create SEO-optimized titles that rank well and drive clicks.

Title Requirements:
- Length: 50-60 characters (optimal for SERPs)
- Primary keyword near the beginning
- Include power words or numbers
- Match search intent
- Stand out in search results
- Consider title tag truncation
- Brand name placement (if needed)

Title Formulas:
- [Primary Keyword] - [Benefit] | [Brand]
- [Number] [Primary Keyword] [Power Word] [Year]
- How to [Primary Keyword]: [Benefit]
- [Primary Keyword] Guide: [Unique Value]`,

    user: `Topic: {topic}
Primary Keyword: {primaryKeyword}
Secondary Keywords: {secondaryKeywords}
Content Type: {contentType}
Target Audience: {targetAudience}
Unique Value: {uniqueValue}

Generate 3 SEO-optimized title options:`,
  } as PromptTemplate,

  /**
   * Content Structure Optimizer
   * Reorganizes content for better search engine understanding
   */
  geoStructureOptimization: {
    system: `Optimize content structure for search engines and featured snippets.

Structure Requirements:
1. Clear heading hierarchy (H1 → H2 → H3)
2. Keyword placement in headings
3. Scannable paragraphs (2-3 sentences)
4. Lists for featured snippet eligibility
5. FAQ sections for voice search
6. Table of contents for long content
7. Strategic internal linking opportunities

Optimize for:
- Featured snippets (paragraph, list, table)
- People Also Ask boxes
- Voice search queries
- Mobile readability
- Quick answers`,

    user: `Content: {content}
Primary Keyword: {primaryKeyword}
Content Type: {contentType}
Target Featured Snippet: {snippetType}

Restructure this content for optimal SEO:`,
  } as PromptTemplate,

  /**
   * Local SEO Optimizer
   * Adds location-based optimization to content
   */
  geoLocalOptimization: {
    system: `Optimize content for local search visibility.

Local SEO Elements:
1. Location + service keywords
2. Local business schema markup hints
3. Neighborhood and landmark mentions
4. Local industry terminology
5. Regional variations and preferences
6. "Near me" search optimization
7. City/state variations

Include:
- NAP (Name, Address, Phone) consistency hints
- Local review signals
- Community involvement
- Service area specifications`,

    user: `Content: {content}
Location: {location}
Service Area: {serviceArea}
Local Keywords: {localKeywords}
Business Type: {businessType}

Add local SEO optimization to this content:`,
  } as PromptTemplate,
};

/**
 * GEO Prompt Builder
 * Dynamically builds prompts with SEO parameters
 */
export class GEOPromptBuilder {
  /**
   * Build bio enhancement prompt with GEO
   */
  static buildGeoBioPrompt(params: {
    bio: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    title: string;
    skills: string[];
    industry: string;
    targetAudience: string;
    tone: string;
    targetLength: string;
    contentGoals: string[];
  }): string {
    const template = geoPromptTemplates.geoBioEnhancement;

    return (
      template.system
        .replace('{targetLength}', params.targetLength)
        .replace('{tone}', params.tone) +
      '\n\n' +
      template.user
        .replace('{bio}', params.bio)
        .replace('{primaryKeyword}', params.primaryKeyword)
        .replace('{secondaryKeywords}', params.secondaryKeywords.join(', '))
        .replace('{title}', params.title)
        .replace('{industry}', params.industry)
        .replace('{targetAudience}', params.targetAudience)
        .replace('{skills}', params.skills.join(', '))
        .replace('{tone}', params.tone)
        .replace('{contentGoals}', params.contentGoals.join(', '))
    );
  }

  /**
   * Build project optimization prompt with GEO
   */
  static buildGeoProjectPrompt(params: {
    title: string;
    description: string;
    technologies: string[];
    primaryKeyword: string;
    industry: string;
    targetQueries: string[];
    location?: string;
  }): string {
    const template = geoPromptTemplates.geoProjectOptimization;

    return (
      template.system +
      '\n\n' +
      template.user
        .replace('{title}', params.title)
        .replace('{description}', params.description)
        .replace('{technologies}', params.technologies.join(', '))
        .replace('{primaryKeyword}', params.primaryKeyword)
        .replace('{industry}', params.industry)
        .replace('{targetQueries}', params.targetQueries.join(', '))
        .replace('{location}', params.location || 'Not specified')
    );
  }

  /**
   * Build meta description prompt
   */
  static buildMetaDescriptionPrompt(params: {
    contentSummary: string;
    primaryKeyword: string;
    targetAudience: string;
    valueProposition: string;
    pageType: string;
  }): string {
    const template = geoPromptTemplates.geoMetaDescription;

    return (
      template.system +
      '\n\n' +
      template.user
        .replace('{contentSummary}', params.contentSummary)
        .replace('{primaryKeyword}', params.primaryKeyword)
        .replace('{targetAudience}', params.targetAudience)
        .replace('{valueProposition}', params.valueProposition)
        .replace('{pageType}', params.pageType)
    );
  }
}
