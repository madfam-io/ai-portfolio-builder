/**
 * GEO Score Calculator
 * Calculates comprehensive GEO scores for optimized content
 */

interface ContentMetrics {
  keywordDensity: number;
  readabilityScore: number;
  structureScore: number;
  lengthScore: number;
  uniquenessScore: number;
}

interface GEOScoreBreakdown {
  overall: number;
  keyword: number;
  readability: number;
  structure: number;
  length: number;
  uniqueness: number;
}

export class GEOScoreCalculator {
  /**
   * Calculate overall GEO score
   */
  calculateGEOScore(
    original: string,
    optimized: string,
    keywords: string[],
    contentType: string
  ): GEOScoreBreakdown {
    const metrics = this.calculateMetrics(optimized, keywords, contentType);

    // Weight factors based on content type
    const weights = this.getWeights(contentType);

    // Calculate individual scores
    const scores = {
      keyword: this.normalizeScore(metrics.keywordDensity * 100),
      readability: metrics.readabilityScore,
      structure: metrics.structureScore,
      length: metrics.lengthScore,
      uniqueness: metrics.uniquenessScore,
    };

    // Calculate weighted overall score
    const overall =
      scores.keyword * weights.keyword +
      scores.readability * weights.readability +
      scores.structure * weights.structure +
      scores.length * weights.length +
      scores.uniqueness * weights.uniqueness;

    return {
      overall: Math.round(overall),
      ...scores,
    };
  }

  /**
   * Calculate content metrics
   */
  private calculateMetrics(
    content: string,
    keywords: string[],
    contentType: string
  ): ContentMetrics {
    return {
      keywordDensity: this.calculateKeywordDensity(content, keywords),
      readabilityScore: this.calculateReadability(content),
      structureScore: this.calculateStructureScore(content, contentType),
      lengthScore: this.calculateLengthScore(content, contentType),
      uniquenessScore: this.calculateUniquenessScore(content),
    };
  }

  /**
   * Get weight factors based on content type
   */
  private getWeights(contentType: string): Record<string, number> {
    const weights: Record<string, Record<string, number>> = {
      bio: {
        keyword: 0.15,
        readability: 0.35,
        structure: 0.2,
        length: 0.15,
        uniqueness: 0.15,
      },
      project: {
        keyword: 0.25,
        readability: 0.25,
        structure: 0.25,
        length: 0.1,
        uniqueness: 0.15,
      },
      experience: {
        keyword: 0.2,
        readability: 0.25,
        structure: 0.3,
        length: 0.1,
        uniqueness: 0.15,
      },
      default: {
        keyword: 0.2,
        readability: 0.3,
        structure: 0.25,
        length: 0.1,
        uniqueness: 0.15,
      },
    };

    return weights[contentType] || weights.default;
  }

  /**
   * Calculate keyword density
   */
  private calculateKeywordDensity(content: string, keywords: string[]): number {
    if (keywords.length === 0) return 0;

    const contentLower = content.toLowerCase();
    const words = contentLower.split(/\s+/);
    const totalWords = words.length;

    let keywordCount = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
      const matches = contentLower.match(regex) || [];
      keywordCount += matches.length;
    }

    // Optimal keyword density is 1-3%
    const density = (keywordCount / totalWords) * 100;
    if (density < 1) return density;
    if (density > 3) return 3 - (density - 3) * 0.5; // Penalize over-optimization
    return density;
  }

  /**
   * Calculate readability score
   */
  private calculateReadability(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    // Simple readability metrics
    const avgWordsPerSentence = words.length / sentences.length;
    const avgWordLength =
      words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // Ideal ranges
    const idealWordsPerSentence = 15;
    const idealWordLength = 5;

    // Calculate score based on deviation from ideal
    const sentenceScore =
      100 - Math.abs(avgWordsPerSentence - idealWordsPerSentence) * 2;
    const wordScore = 100 - Math.abs(avgWordLength - idealWordLength) * 10;

    return Math.max(0, Math.min(100, (sentenceScore + wordScore) / 2));
  }

  /**
   * Calculate structure score
   */
  private calculateStructureScore(
    content: string,
    contentType: string
  ): number {
    let score = 50; // Base score

    // Check for headers
    if (content.match(/^#{1,3}\s/m)) score += 15;

    // Check for lists
    if (content.match(/^[•\-*]\s/m) || content.match(/^\d+\.\s/m)) score += 15;

    // Check for paragraphs
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) score += 10;

    // Content-specific checks
    if (contentType === 'project') {
      if (content.toLowerCase().includes('overview')) score += 5;
      if (content.toLowerCase().includes('technolog')) score += 5;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate length score
   */
  private calculateLengthScore(content: string, contentType: string): number {
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

    const idealLengths: Record<string, { min: number; max: number }> = {
      bio: { min: 50, max: 150 },
      project: { min: 100, max: 300 },
      experience: { min: 150, max: 400 },
      default: { min: 100, max: 250 },
    };

    const ideal = idealLengths[contentType] || idealLengths.default;

    if (wordCount < ideal.min) {
      return (wordCount / ideal.min) * 100;
    } else if (wordCount > ideal.max) {
      const excess = wordCount - ideal.max;
      return Math.max(50, 100 - (excess / ideal.max) * 50);
    }

    return 100;
  }

  /**
   * Calculate uniqueness score
   */
  private calculateUniquenessScore(content: string): number {
    const words = content
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3);
    const uniqueWords = new Set(words);

    if (words.length === 0) return 0;

    const uniquenessRatio = uniqueWords.size / words.length;

    // Optimal uniqueness is around 0.6-0.8
    if (uniquenessRatio < 0.6) {
      return uniquenessRatio * 166.67; // Scale up to 100
    } else if (uniquenessRatio > 0.8) {
      // Too unique might indicate lack of key theme reinforcement
      return 100 - (uniquenessRatio - 0.8) * 100;
    }

    return 100;
  }

  /**
   * Normalize score to 0-100 range
   */
  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
