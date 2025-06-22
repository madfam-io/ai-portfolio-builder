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

import { KeywordAnalyzer } from './keyword-analyzer';
import { MetadataGenerator } from './metadata-generator';
import { StructureOptimizer } from './optimizers/structure-optimizer';
import { ReadabilityOptimizer } from './optimizers/readability-optimizer';
import { GEOScoreCalculator } from './score-calculator';
import { SuggestionGenerator } from './suggestion-generator';
import {
  ContentStructure,
  ReadabilityMetrics,
  GEOContent,
  GEOScore,
  GEOSuggestion,
  GEOSettings,
  OptimizeContentRequest,
  OptimizeContentResponse,
} from './types';

/**
 * Content Optimizer
 * Main class for GEO content optimization
 */
export class ContentOptimizer {
  private keywordAnalyzer: KeywordAnalyzer;
  private metadataGenerator: MetadataGenerator;
  private structureOptimizer: StructureOptimizer;
  private readabilityOptimizer: ReadabilityOptimizer;
  private scoreCalculator: GEOScoreCalculator;
  private suggestionGenerator: SuggestionGenerator;

  constructor() {
    this.keywordAnalyzer = new KeywordAnalyzer();
    this.metadataGenerator = new MetadataGenerator();
    this.structureOptimizer = new StructureOptimizer();
    this.readabilityOptimizer = new ReadabilityOptimizer();
    this.scoreCalculator = new GEOScoreCalculator();
    this.suggestionGenerator = new SuggestionGenerator();
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
      optimizedContent = this.structureOptimizer.optimizeStructure(
        optimizedContent,
        request.contentType
      );
      appliedOptimizations.push('structure');
    }

    // Readability optimization
    optimizedContent =
      this.readabilityOptimizer.improveReadability(optimizedContent);
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
    const keywords = [
      request.settings.primaryKeyword,
      ...(request.settings.secondaryKeywords || []),
    ].filter(Boolean);

    const improvedScoreBreakdown = this.scoreCalculator.calculateGEOScore(
      request.content,
      optimizedContent,
      keywords,
      request.contentType
    );

    const improvedScore: GEOScore = {
      overall: improvedScoreBreakdown.overall,
      keyword: improvedScoreBreakdown.keyword,
      readability: improvedScoreBreakdown.readability,
      structure: improvedScoreBreakdown.structure,
      technical: 80, // Default technical score
      uniqueness: improvedScoreBreakdown.uniqueness,
    };

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
    const words = content.split(/\s+/).filter(w => w.length > 0);

    return {
      headings,
      paragraphCount: paragraphs.length,
      listCount: (content.match(/^[•\-*]\s/gm) || []).length,
      avgSentenceLength:
        sentences.length > 0 ? words.length / sentences.length : 0,
      avgParagraphLength:
        paragraphs.length > 0 ? words.length / paragraphs.length : 0,
      hasProperHierarchy: this.checkHeadingHierarchy(headings),
    };
  }

  /**
   * Calculate readability metrics
   */
  calculateReadability(content: string): ReadabilityMetrics {
    const readabilityScore =
      this.readabilityOptimizer.calculateReadabilityScore(content);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);

    const avgWordsPerSentence =
      sentences.length > 0 ? words.length / sentences.length : 0;
    const complexWords = words.filter(w => this.countSyllables(w) > 2).length;
    const level = this.getReadabilityLevel(readabilityScore);

    const avgSyllablesPerWord =
      words.length > 0
        ? words.reduce((sum, word) => sum + this.countSyllables(word), 0) /
          words.length
        : 0;

    return {
      fleschKincaid: this.calculateFleschKincaid(
        avgWordsPerSentence,
        avgSyllablesPerWord
      ),
      fleschReading: this.calculateFleschReading(
        avgWordsPerSentence,
        avgSyllablesPerWord
      ),
      gunningFog: this.calculateGunningFog(
        avgWordsPerSentence,
        complexWords,
        words.length
      ),
      avgWordsPerSentence,
      avgSyllablesPerWord,
      complexWordCount: complexWords,
      score: readabilityScore,
      level,
      suggestions: this.generateReadabilitySuggestions(
        readabilityScore,
        avgWordsPerSentence,
        complexWords
      ),
    };
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
    const geoSettings = settings as GEOSettings;
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

    const keywordList = [
      geoSettings.primaryKeyword,
      ...(geoSettings.secondaryKeywords || []),
    ].filter(Boolean);

    const scoreBreakdown = this.scoreCalculator.calculateGEOScore(
      content,
      content,
      keywordList,
      'portfolio'
    );

    const score = {
      overall: scoreBreakdown.overall,
      keyword: scoreBreakdown.keyword,
      readability: scoreBreakdown.readability,
      structure: scoreBreakdown.structure,
      technical: scoreBreakdown.length,
      uniqueness: scoreBreakdown.uniqueness,
    };

    const rawSuggestions = this.suggestionGenerator.generateSuggestions(
      content,
      keywordList,
      scoreBreakdown,
      'portfolio'
    );

    // Convert Suggestion[] to GEOSuggestion[]
    const suggestions: GEOSuggestion[] = rawSuggestions.map(s => ({
      type: s.type as
        | 'keyword'
        | 'structure'
        | 'readability'
        | 'technical'
        | 'content',
      priority: s.priority,
      message: s.message,
      impact: s.impact,
      action: this.generateActionForSuggestion(s),
    }));

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
   * Calculate original GEO score
   */
  private calculateGEOScore(content: string, settings: unknown): GEOScore {
    const geoSettings = settings as GEOSettings;
    const keywords = [
      geoSettings.primaryKeyword,
      ...(geoSettings.secondaryKeywords || []),
    ].filter(Boolean);

    const scoreBreakdown = this.scoreCalculator.calculateGEOScore(
      content,
      content,
      keywords,
      'portfolio'
    );

    return {
      overall: scoreBreakdown.overall,
      keyword: scoreBreakdown.keyword,
      readability: scoreBreakdown.readability,
      structure: scoreBreakdown.structure,
      technical: 80, // Default technical score
      uniqueness: scoreBreakdown.uniqueness,
    };
  }

  // Helper methods
  private extractHeadings(content: string, level: number): string[] {
    const pattern = new RegExp(`^#{${level}}\\s+(.+)$`, 'gm');
    const matches = content.match(pattern) || [];
    return matches.map(match => match.replace(/^#+\s+/, ''));
  }

  private checkHeadingHierarchy(headings: unknown): boolean {
    const headingData = headings as ContentStructure['headings'];
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

    return Math.max(1, count);
  }

  private calculateFleschKincaid(
    avgWordsPerSentence: number,
    avgSyllablesPerWord: number
  ): number {
    return 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  }

  private calculateFleschReading(
    avgWordsPerSentence: number,
    avgSyllablesPerWord: number
  ): number {
    return 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  }

  private calculateGunningFog(
    avgWordsPerSentence: number,
    complexWords: number,
    totalWords: number
  ): number {
    const percentageComplexWords =
      totalWords > 0 ? (complexWords / totalWords) * 100 : 0;
    return 0.4 * (avgWordsPerSentence + percentageComplexWords);
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

  private generateActionForSuggestion(suggestion: { type: string }): string {
    switch (suggestion.type) {
      case 'keyword':
        return 'Add or adjust keyword usage';
      case 'readability':
        return 'Simplify sentence structure';
      case 'structure':
        return 'Reorganize content hierarchy';
      case 'length':
        return 'Adjust content length';
      case 'style':
        return 'Refine writing style';
      default:
        return 'Review and improve content';
    }
  }
}
