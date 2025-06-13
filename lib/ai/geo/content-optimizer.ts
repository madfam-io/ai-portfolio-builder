import { KeywordAnalyzer } from './keyword-analyzer';
import { MetadataGenerator } from './metadata-generator';
import {
  ContentStructure,
  ReadabilityMetrics,
  GEOContent,
  GEOScore,
  GEOSuggestion,
  OptimizeContentRequest,
  OptimizeContentResponse,
} from './types';

/**
 * Content Structure and Readability Optimizer
 * Optimizes content structure, readability, and clarity for better search engine understanding
 */

export class ContentOptimizer {
  private keywordAnalyzer: KeywordAnalyzer;
  private metadataGenerator: MetadataGenerator;

  constructor() {
    this.keywordAnalyzer = new KeywordAnalyzer();
    this.metadataGenerator = new MetadataGenerator();
  }

  /**
   * Optimize content for GEO
   */
  async optimizeContent(
    request: OptimizeContentRequest
  ): Promise<OptimizeContentResponse> {
    const startTime = Date.now();

    // Analyze original content
    const originalScore = this.calculateGEOScore(
      request.content,
      request.settings
    );

    // Apply optimizations
    let optimizedContent = request.content;
    const appliedOptimizations: string[] = [];

    // Structure optimization
    if (request.settings.enableKeywordOptimization) {
      optimizedContent = this.optimizeStructure(
        optimizedContent,
        request.contentType
      );
      appliedOptimizations.push('structure');
    }

    // Readability optimization
    optimizedContent = this.optimizeReadability(
      optimizedContent,
      request.settings.readabilityLevel
    );
    appliedOptimizations.push('readability');

    // Keyword optimization
    if (request.settings.enableKeywordOptimization) {
      optimizedContent = this.optimizeKeywords(
        optimizedContent,
        request.settings.primaryKeyword,
        request.settings.secondaryKeywords
      );
      appliedOptimizations.push('keywords');
    }

    // Generate GEO content
    const geoContent = await this.generateGEOContent(
      optimizedContent,
      request.settings
    );

    // Calculate improved score
    const improvedScore = this.calculateGEOScore(
      optimizedContent,
      request.settings
    );

    return {
      optimizedContent: geoContent,
      originalScore,
      improvedScore,
      appliedOptimizations,
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Analyze content structure
   */
  analyzeStructure(content: string): ContentStructure {
    const headings = {
      h1: this.extractHeadings(content, 1),
      h2: this.extractHeadings(content, 2),
      h3: this.extractHeadings(content, 3),
      h4: this.extractHeadings(content, 4),
      h5: this.extractHeadings(content, 5),
      h6: this.extractHeadings(content, 6),
    };

    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const lists = content.match(/^[\-\*\d]+\.\s+.+$/gm) || [];

    const avgSentenceLength =
      sentences.reduce((sum, s) => sum + s.split(' ').length, 0) /
      sentences.length;
    const avgParagraphLength =
      paragraphs.reduce((sum, p) => sum + p.split(' ').length, 0) /
      paragraphs.length;

    return {
      headings,
      paragraphCount: paragraphs.length,
      listCount: lists.length,
      avgSentenceLength,
      avgParagraphLength,
      hasProperHierarchy: this.checkHeadingHierarchy(headings),
    };
  }

  /**
   * Calculate readability metrics
   */
  calculateReadability(content: string): ReadabilityMetrics {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce(
      (sum, word) => sum + this.countSyllables(word),
      0
    );

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease
    const fleschReading =
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    // Flesch-Kincaid Grade Level
    const fleschKincaid =
      0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

    // Gunning Fog Index
    const complexWords = words.filter(
      word => this.countSyllables(word) >= 3
    ).length;
    const gunningFog =
      0.4 * (avgWordsPerSentence + (100 * complexWords) / words.length);

    const score = Math.max(0, Math.min(100, fleschReading));
    const level = this.getReadabilityLevel(score);

    return {
      fleschKincaid: Number(fleschKincaid.toFixed(1)),
      fleschReading: Number(fleschReading.toFixed(1)),
      gunningFog: Number(gunningFog.toFixed(1)),
      avgWordsPerSentence: Number(avgWordsPerSentence.toFixed(1)),
      avgSyllablesPerWord: Number(avgSyllablesPerWord.toFixed(1)),
      complexWordCount: complexWords,
      score,
      level,
      suggestions: this.generateReadabilitySuggestions(
        score,
        avgWordsPerSentence,
        complexWords
      ),
    };
  }

  /**
   * Optimize content structure
   */
  private optimizeStructure(content: string, contentType: string): string {
    let optimized = content;

    // Add structure based on content type
    switch (contentType) {
      case 'bio':
        optimized = this.structureBio(content);
        break;
      case 'project':
        optimized = this.structureProject(content);
        break;
      case 'experience':
        optimized = this.structureExperience(content);
        break;
      default:
        optimized = this.addBasicStructure(content);
    }

    return optimized;
  }

  /**
   * Structure bio content
   */
  private structureBio(content: string): string {
    // Ensure bio has clear sections
    const sections = content.split(/\n\n+/);

    if (sections.length === 1) {
      // Single paragraph - split into introduction and details
      const sentences = content.split(/[.!?]+/).filter(s => s.trim());
      if (sentences.length > 3) {
        const intro = sentences.slice(0, 2).join('. ') + '.';
        const details = sentences.slice(2).join('. ') + '.';
        return `${intro}\n\n${details}`;
      }
    }

    return content;
  }

  /**
   * Structure project content
   */
  private structureProject(content: string): string {
    // Ensure project has key sections
    const hasOverview = /overview|description|about/i.test(content);
    const hasTechnologies = /technolog|built with|stack|tools/i.test(content);
    const hasResults = /result|outcome|impact|achiev/i.test(content);

    let structured = content;

    if (!hasOverview) {
      structured = `## Overview\n${structured}`;
    }

    if (!hasTechnologies) {
      structured += '\n\n## Technologies Used\n[Add technologies]';
    }

    if (!hasResults) {
      structured += '\n\n## Key Results\n[Add results and impact]';
    }

    return structured;
  }

  /**
   * Structure experience content
   */
  private structureExperience(content: string): string {
    // Ensure experience has responsibilities and achievements
    const hasResponsibilities = /responsibilit|duties|role/i.test(content);
    const hasAchievements = /achiev|accomplish|result|impact/i.test(content);

    let structured = content;

    if (!hasResponsibilities && !hasAchievements) {
      // Transform content into bullet points
      const sentences = content.split(/[.!?]+/).filter(s => s.trim());
      if (sentences.length > 2) {
        structured = sentences.map(s => `• ${s.trim()}`).join('\n');
      }
    }

    return structured;
  }

  /**
   * Add basic structure to content
   */
  private addBasicStructure(content: string): string {
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());

    // Ensure proper paragraph breaks
    if (paragraphs.length === 1 && content.length > 500) {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim());
      const sentencesPerParagraph = 4;
      const structured: string[] = [];

      for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
        const paragraph =
          sentences.slice(i, i + sentencesPerParagraph).join('. ') + '.';
        structured.push(paragraph);
      }

      return structured.join('\n\n');
    }

    return content;
  }

  /**
   * Optimize readability
   */
  private optimizeReadability(
    content: string,
    targetLevel: 'simple' | 'moderate' | 'advanced'
  ): string {
    let optimized = content;

    // Split long sentences
    const sentences = optimized.split(/[.!?]+/).filter(s => s.trim());
    const targetLength =
      targetLevel === 'simple' ? 15 : targetLevel === 'moderate' ? 20 : 25;

    const optimizedSentences = sentences.map(sentence => {
      const words = sentence.split(/\s+/);
      if (words.length > targetLength * 1.5) {
        // Find natural breaking points
        const midPoint = Math.floor(words.length / 2);
        const breakWords = [',', 'and', 'but', 'or', 'which', 'that'];

        let breakIndex = -1;
        for (let i = midPoint - 5; i < midPoint + 5; i++) {
          if (breakWords.some(word => words[i]?.toLowerCase() === word)) {
            breakIndex = i;
            break;
          }
        }

        if (breakIndex > 0) {
          const part1 = words.slice(0, breakIndex).join(' ');
          const part2 = words.slice(breakIndex + 1).join(' ');
          return `${part1}. ${part2}`;
        }
      }
      return sentence;
    });

    optimized = optimizedSentences.join('. ') + '.';

    // Simplify complex words if targeting simple readability
    if (targetLevel === 'simple') {
      optimized = this.simplifyComplexWords(optimized);
    }

    return optimized;
  }

  /**
   * Optimize keyword placement
   */
  private optimizeKeywords(
    content: string,
    primaryKeyword: string,
    secondaryKeywords: string[]
  ): string {
    return this.keywordAnalyzer.optimizeKeywordPlacement(
      content,
      primaryKeyword,
      secondaryKeywords
    );
  }

  /**
   * Generate complete GEO content
   */
  private async generateGEOContent(
    content: string,
    settings: unknown
  ): Promise<GEOContent> {
    const geoSettings = settings as any;
    const structure = this.analyzeStructure(content);
    const keywords = this.keywordAnalyzer.analyzeContent(
      content,
      geoSettings.primaryKeyword,
      geoSettings.secondaryKeywords
    );
    const readability = this.calculateReadability(content);
    const metadata = await this.metadataGenerator.generateMetadata(
      content,
      geoSettings
    );

    const score = this.calculateDetailedGEOScore(
      content,
      structure,
      keywords,
      readability
    );

    const suggestions = this.generateGEOSuggestions(
      score,
      structure,
      keywords,
      readability
    );

    return {
      content,
      structure,
      keywords,
      readability,
      metadata,
      score,
      suggestions,
    };
  }

  /**
   * Calculate GEO score
   */
  private calculateGEOScore(content: string, settings: unknown): GEOScore {
    const geoSettings = settings as any;
    const structure = this.analyzeStructure(content);
    const keywords = this.keywordAnalyzer.analyzeContent(
      content,
      geoSettings.primaryKeyword,
      geoSettings.secondaryKeywords
    );
    const readability = this.calculateReadability(content);

    return this.calculateDetailedGEOScore(
      content,
      structure,
      keywords,
      readability
    );
  }

  /**
   * Calculate detailed GEO score
   */
  private calculateDetailedGEOScore(
    content: string,
    structure: ContentStructure,
    keywords: unknown,
    readability: ReadabilityMetrics
  ): GEOScore {
    // Keyword score (0-100)
    const keywordScore = this.calculateKeywordScore(keywords);

    // Readability score (0-100)
    const readabilityScore = readability.score;

    // Structure score (0-100)
    const structureScore = this.calculateStructureScore(structure);

    // Technical score (0-100)
    const technicalScore = this.calculateTechnicalScore(content, structure);

    // Uniqueness score (0-100) - simplified for now
    const uniquenessScore = content.length > 300 ? 80 : 60;

    // Overall score (weighted average)
    const overall = Math.round(
      keywordScore * 0.25 +
        readabilityScore * 0.25 +
        structureScore * 0.2 +
        technicalScore * 0.15 +
        uniquenessScore * 0.15
    );

    return {
      overall,
      keyword: keywordScore,
      readability: readabilityScore,
      structure: structureScore,
      technical: technicalScore,
      uniqueness: uniquenessScore,
    };
  }

  /**
   * Calculate keyword score
   */
  private calculateKeywordScore(keywords: unknown): number {
    const keywordData = keywords as any;
    let score = 70; // Base score

    // Check primary keyword density
    if (
      keywordData.primaryKeyword &&
      keywordData.density[keywordData.primaryKeyword]
    ) {
      const density = keywordData.density[keywordData.primaryKeyword];
      if (density >= 0.5 && density <= 2.5) {
        score += 20;
      } else if (density < 0.5) {
        score -= 10;
      } else {
        score -= 20; // Over-optimization
      }
    }

    // Check for LSI keywords
    if (keywordData.lsiKeywords.length > 3) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate structure score
   */
  private calculateStructureScore(structure: ContentStructure): number {
    let score = 60; // Base score

    // Check heading hierarchy
    if (structure.hasProperHierarchy) {
      score += 20;
    }

    // Check for appropriate structure
    if (structure.headings.h2.length > 0) {
      score += 10;
    }

    // Check paragraph length
    if (
      structure.avgParagraphLength >= 50 &&
      structure.avgParagraphLength <= 150
    ) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate technical score
   */
  private calculateTechnicalScore(
    content: string,
    structure: ContentStructure
  ): number {
    let score = 70; // Base score

    // Check content length
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 300) {
      score += 15;
    }

    // Check for lists
    if (structure.listCount > 0) {
      score += 10;
    }

    // Check sentence variety
    if (
      structure.avgSentenceLength >= 10 &&
      structure.avgSentenceLength <= 20
    ) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate GEO suggestions
   */
  private generateGEOSuggestions(
    score: GEOScore,
    structure: ContentStructure,
    keywords: unknown,
    readability: ReadabilityMetrics
  ): GEOSuggestion[] {
    const keywordData = keywords as any;
    const suggestions: GEOSuggestion[] = [];

    // Keyword suggestions
    if (score.keyword < 70) {
      suggestions.push({
        type: 'keyword',
        priority: 'high',
        message: 'Keyword optimization needed',
        action:
          keywordData.recommendations[0] || 'Add primary keyword to content',
        impact: 15,
      });
    }

    // Structure suggestions
    if (score.structure < 70) {
      if (!structure.hasProperHierarchy) {
        suggestions.push({
          type: 'structure',
          priority: 'medium',
          message: 'Improve heading hierarchy',
          action: 'Use H2 tags for main sections and H3 for subsections',
          impact: 10,
        });
      }
    }

    // Readability suggestions
    if (score.readability < 70) {
      suggestions.push(
        ...readability.suggestions.map(s => ({
          type: 'readability' as const,
          priority: 'medium' as const,
          message: 'Improve readability',
          action: s,
          impact: 8,
        }))
      );
    }

    // Technical suggestions
    if (score.technical < 70) {
      const wordCount = structure.paragraphCount * structure.avgParagraphLength;
      if (wordCount < 300) {
        suggestions.push({
          type: 'content',
          priority: 'high',
          message: 'Content too short',
          action: 'Add more detailed information (minimum 300 words)',
          impact: 20,
        });
      }
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  // Helper methods

  private extractHeadings(content: string, level: number): string[] {
    const pattern = new RegExp(`^#{${level}}\\s+(.+)$`, 'gm');
    const matches = content.match(pattern) || [];
    return matches.map(match => match.replace(/^#+\s+/, ''));
  }

  private checkHeadingHierarchy(headings: unknown): boolean {
    const headingData = headings as any;
    // H1 should come before H2, H2 before H3, etc.
    if (headingData.h3.length > 0 && headingData.h2.length === 0) return false;
    if (headingData.h4.length > 0 && headingData.h3.length === 0) return false;
    return true;
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const isVowel = char ? /[aeiou]/.test(char) : false;
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }

    // Adjust for silent e
    if (word.endsWith('e')) {
      count--;
    }

    // Ensure at least 1 syllable
    return Math.max(1, count);
  }

  private getReadabilityLevel(
    score: number
  ): 'very-easy' | 'easy' | 'medium' | 'hard' | 'very-hard' {
    if (score >= 90) return 'very-easy';
    if (score >= 70) return 'easy';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'hard';
    return 'very-hard';
  }

  private generateReadabilitySuggestions(
    score: number,
    avgWordsPerSentence: number,
    complexWords: number
  ): string[] {
    const suggestions: string[] = [];

    if (score < 60) {
      suggestions.push('Simplify your writing for better readability');
    }

    if (avgWordsPerSentence > 20) {
      suggestions.push('Break long sentences into shorter ones');
    }

    if (complexWords > 20) {
      suggestions.push('Replace complex words with simpler alternatives');
    }

    return suggestions;
  }

  private simplifyComplexWords(content: string): string {
    const replacements: Record<string, string> = {
      utilize: 'use',
      implement: 'do',
      facilitate: 'help',
      demonstrate: 'show',
      accomplish: 'do',
      collaborate: 'work with',
      innovative: 'new',
      comprehensive: 'complete',
      fundamental: 'basic',
      methodology: 'method',
    };

    let simplified = content;
    Object.entries(replacements).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplified = simplified.replace(regex, simple);
    });

    return simplified;
  }
}
