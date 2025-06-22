/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * DeepSeek Prompt Builders
 *
 * Centralized prompt construction for all DeepSeek AI features
 */

import { BIO_PROMPTS, PROJECT_PROMPTS, TEMPLATE_PROMPTS } from '../prompts';
import { BioContext, UserProfile } from '../types';

/**
 * Build bio enhancement prompt
 */
export function buildBioPrompt(bio: string, context: BioContext): string {
  return `${BIO_PROMPTS.enhance}

Current bio: "${bio}"

Context:
- Title: ${context.title}
- Skills: ${context.skills.join(', ')}
- Industry: ${context.industry || 'Not specified'}
- Tone: ${context.tone}
- Target length: ${context.targetLength}
- Experience: ${context.experience.map(exp => `${exp.position} at ${exp.company} (${exp.yearsExperience} years)`).join(', ')}

Please enhance this bio to be more compelling while keeping it authentic. Use reasoning to analyze what makes this professional unique and craft a bio that highlights their value proposition.`;
}

/**
 * Build project optimization prompt
 */
export function buildProjectPrompt(
  description: string,
  technologies: string[],
  industryContext?: string
): string {
  const contextLine = industryContext
    ? `\nIndustry/Context: "${industryContext}"`
    : '';
  return `${PROJECT_PROMPTS.optimize}

Description: "${description}"
Technologies: ${technologies.join(', ')}${contextLine}

Please optimize this project description to highlight key achievements, quantifiable results, and technical impact. Focus on specific metrics and outcomes.`;
}

/**
 * Build template recommendation prompt
 */
export function buildTemplatePrompt(profile: UserProfile): string {
  return `${TEMPLATE_PROMPTS.recommend}

User Profile:
- Title: ${profile.title}
- Skills: ${profile.skills.join(', ')}
- Project Count: ${profile.projectCount}
- Has Design Work: ${profile.hasDesignWork}
- Industry: ${profile.industry || 'Not specified'}
- Experience Level: ${profile.experienceLevel}

Available templates: developer, designer, consultant, educator, creative, business

Use reasoning to analyze this profile and recommend the most suitable template. Consider their role, skills, and work type.`;
}

/**
 * Build content scoring prompt
 */
export function buildScoringPrompt(content: string, type: string): string {
  return `Analyze and score this ${type} content on multiple dimensions:

Content: "${content}"

Please provide scores (0-100) for:
1. Overall quality
2. Readability
3. Professionalism
4. Impact/persuasiveness
5. Completeness

Also provide specific suggestions for improvement. Use reasoning to explain your scoring decisions.`;
}
