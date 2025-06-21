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

import { promptTemplates } from '../prompts';

import type { BioContext, ProjectEnhancement } from '../types';

/**
 * Prompt Builder for HuggingFace Service
 * Constructs optimized prompts for different AI tasks
 */
export class PromptBuilder {
  /**
   * Build bio enhancement prompt
   */
  buildBioPrompt(bio: string, context: BioContext): string {
    return promptTemplates.bioEnhancement.user
      .replace('{bio}', bio)
      .replace('{industry}', context.industry || 'general')
      .replace('{title}', context.title)
      .replace('{skills}', context.skills.join(', '))
      .replace('{tone}', context.tone || 'professional')
      .replace('{length}', context.targetLength || 'concise');
  }

  /**
   * Build project optimization prompt
   */
  buildProjectPrompt(
    description: string,
    technologies: string[],
    industryContext?: string
  ): string {
    return promptTemplates.projectOptimization.user
      .replace('{title}', industryContext || 'Project')
      .replace('{description}', description)
      .replace('{technologies}', technologies.join(', '));
  }

  /**
   * Build template recommendation prompt
   */
  buildTemplatePrompt(profile: {
    industry: string;
    experience: string;
    style: string;
  }): string {
    return `
      Based on the following professional profile:
      - Industry: ${profile.industry}
      - Experience Level: ${profile.experience}
      - Preferred Style: ${profile.style}
      
      Recommend the most suitable portfolio template from: developer, designer, consultant, business, creative, minimal, educator, modern.
      
      Provide your recommendation with reasoning.
    `;
  }

  /**
   * Build content scoring prompt
   */
  buildScoringPrompt(content: string, type: string): string {
    return `
      Analyze the following ${type} content for quality:
      
      "${content}"
      
      Score the content on:
      1. Readability (clarity and flow)
      2. Professionalism (tone and language)
      3. Impact (engagement and memorability)
      4. Completeness (all necessary information included)
      
      Provide scores from 0-100 for each category.
    `;
  }

  /**
   * Extract clean bio from AI response
   */
  extractBioFromResponse(response: string): string {
    // Remove common AI prefixes/suffixes
    const cleaned = response
      .replace(/^(Here's|Here is|The enhanced bio:|Enhanced bio:)/i, '')
      .replace(/^"/, '')
      .replace(/"$/, '')
      .trim();
    return cleaned;
  }

  /**
   * Parse project enhancement from AI response
   */
  parseProjectResponse(response: string): Partial<ProjectEnhancement> {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return parsed;
    } catch {
      // Fallback to text parsing
      return {
        enhanced: response.trim(),
        keyAchievements: this.extractAchievements(response),
        technologies: this.extractTechnologies(response),
      };
    }
  }

  /**
   * Extract achievements from text
   */
  private extractAchievements(text: string): string[] {
    const achievements: string[] = [];
    const lines = text.split('\n');

    lines.forEach(line => {
      if (line.match(/^\s*[-•*]\s*/) || line.match(/^\d+\.\s*/)) {
        achievements.push(
          line
            .replace(/^\s*[-•*]\s*/, '')
            .replace(/^\d+\.\s*/, '')
            .trim()
        );
      }
    });

    return achievements.slice(0, 3); // Top 3 achievements
  }

  /**
   * Extract technologies from text
   */
  private extractTechnologies(text: string): string[] {
    // Common technology patterns
    const techPatterns = [
      /(?:using|with|built with|technologies:|tech stack:)\s*([^.]+)/i,
      /\b([A-Z][a-zA-Z0-9]+(?:\.[a-zA-Z]+)?)\b/g, // CamelCase technologies
    ];

    const technologies = new Set<string>();

    techPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const techs = match[1].split(/[,;]/).map(t => t.trim());
          techs.forEach(tech => {
            if (tech.length > 2 && tech.length < 20) {
              technologies.add(tech);
            }
          });
        }
      }
    });

    return Array.from(technologies).slice(0, 5); // Top 5 technologies
  }
}
