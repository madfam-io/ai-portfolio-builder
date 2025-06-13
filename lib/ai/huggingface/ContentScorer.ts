import { logger } from '@/lib/utils/logger';

import type { QualityScore } from '../types';

/**
 * Content Scorer for HuggingFace Service
 * Analyzes and scores content quality
 */
export class ContentScorer {
  /**
   * Score content quality
   */
  async scoreContent(content: string, type: string): Promise<QualityScore> {
    try {
      // Basic quality metrics
      const readability = this.calculateReadabilityScore(content);
      const professionalism = this.calculateProfessionalismScore(content);
      const impact = this.calculateImpactScore(content);
      const completeness = this.calculateCompletenessScore(content, type);

      const overall = Math.round(
        (readability + professionalism + impact + completeness) / 4
      );

      return {
        overall,
        readability,
        professionalism,
        impact,
        completeness,
        suggestions: this.generateImprovementSuggestions(overall, {
          readability,
          professionalism,
          impact,
          completeness,
        }),
      };
    } catch (error) {
      logger.error('Content scoring failed', error as Error);
      return {
        overall: 50,
        readability: 50,
        professionalism: 50,
        impact: 50,
        completeness: 50,
        suggestions: ['Unable to analyze content quality'],
      };
    }
  }

  /**
   * Calculate readability score using Flesch Reading Ease formula
   */
  private calculateReadabilityScore(content: string): number {
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim()).length;
    const syllables = this.countSyllables(content);

    if (sentences === 0 || words === 0) return 50;

    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    // Modified Flesch score for professional content (15-25 words per sentence is ideal)
    const idealRange = avgWordsPerSentence >= 15 && avgWordsPerSentence <= 25;
    const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    // Convert to 0-100 scale with bonus for ideal range
    const baseScore = Math.max(0, Math.min(100, fleschScore));
    return idealRange ? Math.min(100, baseScore + 10) : baseScore;
  }

  /**
   * Calculate professionalism score based on language patterns
   */
  private calculateProfessionalismScore(content: string): number {
    let score = 70; // Base score

    // Professional indicators (boost score)
    const professionalPatterns = [
      /\b(?:led|managed|developed|implemented|achieved|optimized|delivered)\b/gi,
      /\b(?:strategic|innovative|comprehensive|scalable|efficient)\b/gi,
      /\b\d+[%+]?\s*(?:increase|improvement|growth|reduction)\b/gi,
      /\b(?:expertise|proficient|skilled|experienced)\b/gi,
    ];

    // Unprofessional indicators (reduce score)
    const unprofessionalPatterns = [
      /\b(?:very|really|just|stuff|things|basically|actually)\b/gi,
      /[!]{2,}/g, // Multiple exclamation marks
      /\b(?:awesome|cool|nice|great)\b/gi, // Overly casual
      /\b(?:I think|I feel|maybe|probably)\b/gi, // Uncertainty
    ];

    professionalPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) score += Math.min(matches.length * 2, 15);
    });

    unprofessionalPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) score -= Math.min(matches.length * 3, 20);
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate impact score based on action words and metrics
   */
  private calculateImpactScore(content: string): number {
    let score = 60; // Base score

    // Impact indicators
    const impactPatterns = [
      /\b\d+[%+]?\b/g, // Numbers and percentages
      /\b(?:increased|decreased|improved|reduced|saved|generated)\b/gi,
      /\b(?:revenue|cost|efficiency|performance|satisfaction)\b/gi,
      /\b(?:million|thousand|hundred)\b/gi,
      /\b(?:award|recognition|certified|published)\b/gi,
    ];

    // Action verbs at sentence start
    const actionStarts = content.match(/^(?:Led|Managed|Developed|Created|Designed|Built|Implemented)/gm);
    if (actionStarts) score += Math.min(actionStarts.length * 5, 20);

    impactPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) score += Math.min(matches.length * 3, 20);
    });

    // Bonus for specific metrics
    if (content.match(/\b\d+[%+]\s*(?:increase|improvement|growth)/gi)) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate completeness score based on content type
   */
  private calculateCompletenessScore(content: string, type: string): number {
    const wordCount = content.split(/\s+/).length;
    let score = 70; // Base score

    // Expected elements by type
    const requirements = {
      bio: {
        minWords: 50,
        maxWords: 200,
        elements: [
          /\b(?:experience|years|expertise)\b/i,
          /\b(?:specializ|focus|passion)\b/i,
          /\b(?:industry|field|domain)\b/i,
        ],
      },
      project: {
        minWords: 30,
        maxWords: 150,
        elements: [
          /\b(?:built|created|developed|designed)\b/i,
          /\b(?:technology|tool|framework|stack)\b/i,
          /\b(?:result|outcome|impact|achievement)\b/i,
        ],
      },
    };

    const req = requirements[type as keyof typeof requirements] || requirements.bio;

    // Word count scoring
    if (wordCount < req.minWords) {
      score -= (req.minWords - wordCount) * 2;
    } else if (wordCount > req.maxWords) {
      score -= Math.min((wordCount - req.maxWords) * 0.5, 20);
    } else {
      score += 10; // Bonus for ideal length
    }

    // Check for required elements
    req.elements.forEach(pattern => {
      if (content.match(pattern)) score += 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in text (approximation)
   */
  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    words.forEach(word => {
      // Remove non-alphabetic characters
      word = word.replace(/[^a-z]/g, '');
      if (word.length <= 3) {
        count += 1;
      } else {
        // Count vowel groups as syllables
        const vowelGroups = word.match(/[aeiouy]+/g);
        count += vowelGroups ? vowelGroups.length : 1;
        // Adjust for silent e
        if (word.endsWith('e') && word.length > 3) count -= 1;
      }
    });

    return Math.max(words.length, count);
  }

  /**
   * Generate improvement suggestions based on scores
   */
  private generateImprovementSuggestions(
    overall: number,
    scores: Record<string, number>
  ): string[] {
    const suggestions: string[] = [];

    if (scores.readability !== undefined && scores.readability < 70) {
      suggestions.push('Consider using shorter sentences for better readability');
    }
    if (scores.professionalism !== undefined && scores.professionalism < 70) {
      suggestions.push('Use more professional language and active voice');
    }
    if (scores.impact !== undefined && scores.impact < 70) {
      suggestions.push('Add specific metrics and achievements to increase impact');
    }
    if (scores.completeness !== undefined && scores.completeness < 70) {
      suggestions.push('Include more relevant details about your experience and skills');
    }

    if (overall >= 85) {
      suggestions.push('Excellent content! Consider adding unique differentiators');
    }

    return suggestions;
  }
}