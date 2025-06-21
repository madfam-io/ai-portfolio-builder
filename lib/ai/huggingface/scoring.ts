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

import { QualityScore } from '../types';

/**
 * Content Quality Scoring Module
 * Evaluates enhanced content across multiple dimensions
 */

export class ContentScorer {
  /**
   * Calculate quality score for enhanced content
   */
  calculateQualityScore(
    original: string,
    enhanced: string,
    expectedLength: { min: number; max: number }
  ): QualityScore {
    const clarity = this.scoreClarity(enhanced);
    const impact = this.scoreImpact(enhanced);
    const relevance = this.scoreRelevance(original, enhanced);
    const originality = this.scoreOriginality(original, enhanced);
    const professionalism = this.scoreProfessionalism(enhanced);

    const readability = (clarity + relevance) / 2;
    const completeness = this.scoreCompleteness(enhanced, expectedLength);

    const overall = (readability + professionalism + impact + completeness) / 4;

    const suggestions = this.generateSuggestions(
      enhanced,
      {
        clarity,
        impact,
        relevance,
        originality,
        professionalism,
        completeness,
      },
      expectedLength
    );

    return {
      overall,
      readability,
      professionalism,
      impact,
      completeness,
      suggestions,
    };
  }

  /**
   * Score content clarity
   */
  private scoreClarity(content: string): number {
    let score = 10;

    // Check sentence structure
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const avgSentenceLength =
      sentences.reduce((sum, s) => sum + s.split(' ').length, 0) /
      sentences.length;

    if (avgSentenceLength > 25) score -= 2;
    if (avgSentenceLength < 8) score -= 1;

    // Check for passive voice
    const passivePatterns = /\b(was|were|been|being|is|are|am)\s+\w+ed\b/gi;
    const passiveCount = (content.match(passivePatterns) || []).length;
    if (passiveCount > sentences.length * 0.3) score -= 1;

    // Check for complex words
    const complexWords = content.match(/\b\w{12,}\b/g) || [];
    if (complexWords.length > sentences.length * 0.5) score -= 1;

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Score content impact
   */
  private scoreImpact(content: string): number {
    let score = 7;

    // Check for action verbs
    const actionVerbs =
      /\b(achieved|created|developed|led|improved|increased|decreased|managed|built|designed|implemented)\b/gi;
    const actionCount = (content.match(actionVerbs) || []).length;
    score += Math.min(3, actionCount * 0.5);

    // Check for quantifiable results
    const metrics = /\b\d+%|\$\d+|\d+x|\d+\+/g;
    const metricCount = (content.match(metrics) || []).length;
    score += Math.min(2, metricCount);

    // Check for power words
    const powerWords =
      /\b(exceptional|outstanding|innovative|strategic|transformative|cutting-edge|revolutionary)\b/gi;
    const powerCount = (content.match(powerWords) || []).length;
    if (powerCount > 2) score -= 1; // Penalize overuse

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Score relevance to original
   */
  private scoreRelevance(original: string, enhanced: string): number {
    const originalWords = original.toLowerCase().split(/\s+/);
    const enhancedWords = enhanced.toLowerCase().split(/\s+/);

    // Check key word retention
    const keyWords = originalWords.filter(w => w.length > 4);
    const retainedWords = keyWords.filter(w => enhancedWords.includes(w));
    const retentionRate =
      keyWords.length > 0 ? retainedWords.length / keyWords.length : 0;

    // Base score on retention rate
    let score = 5 + retentionRate * 5;

    // Check if enhancement adds value
    if (enhanced.length < original.length * 0.8) score -= 2;
    if (enhanced.length > original.length * 3) score -= 1;

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Score originality
   */
  private scoreOriginality(original: string, enhanced: string): number {
    // Check for clichés
    const cliches =
      /\b(team player|self-starter|go-getter|think outside the box|synergy|leverage|passionate about|results-driven)\b/gi;
    const clicheCount = (enhanced.match(cliches) || []).length;

    let score = 10 - clicheCount;

    // Check for unique phrasing
    const originalPhrases: string[] = original.match(/\b\w+\s+\w+\b/g) || [];
    const enhancedPhrases: string[] = enhanced.match(/\b\w+\s+\w+\b/g) || [];
    const newPhrases = enhancedPhrases.filter(
      (p: string) => !originalPhrases.includes(p)
    );

    if (newPhrases.length > enhancedPhrases.length * 0.6) score += 1;

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Score professionalism
   */
  private scoreProfessionalism(content: string): number {
    let score = 10;

    // Check for informal language
    const informalPatterns =
      /\b(guys|stuff|things|basically|actually|really|very|just)\b/gi;
    const informalCount = (content.match(informalPatterns) || []).length;
    score -= Math.min(3, informalCount * 0.5);

    // Check for proper capitalization
    const properNouns = content.match(/\b[A-Z][a-z]+\b/g) || [];
    if (properNouns.length < 2) score -= 1;

    // Check for exclamation marks
    const exclamations = (content.match(/!/g) || []).length;
    if (exclamations > 1) score -= 1;

    // Check for all caps
    const allCaps = content.match(/\b[A-Z]{2,}\b/g) || [];
    if (allCaps.length > 0) score -= allCaps.length * 0.5;

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Score content completeness
   */
  private scoreCompleteness(
    content: string,
    expectedLength: { min: number; max: number }
  ): number {
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    let score = 10;

    // Check if content meets length requirements
    if (wordCount < expectedLength.min) {
      const ratio = wordCount / expectedLength.min;
      score = Math.max(0, ratio * 10);
    } else if (wordCount > expectedLength.max) {
      const excess = wordCount - expectedLength.max;
      const penalty = Math.min(3, excess / 50); // Deduct up to 3 points
      score = Math.max(7, 10 - penalty);
    }

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(
    content: string,
    scores: Record<string, number>,
    expectedLength: { min: number; max: number }
  ): string[] {
    const suggestions: string[] = [];

    // Length suggestions
    const wordCount = content.split(/\s+/).length;
    if (wordCount < expectedLength.min) {
      suggestions.push(
        `Consider expanding the content to at least ${expectedLength.min} words for better detail.`
      );
    } else if (wordCount > expectedLength.max) {
      suggestions.push(
        `Consider condensing the content to under ${expectedLength.max} words for better conciseness.`
      );
    }

    // Score-based suggestions
    if (scores.clarity !== undefined && scores.clarity < 7) {
      suggestions.push('Simplify sentence structure and reduce complex words.');
    }

    if (scores.impact !== undefined && scores.impact < 7) {
      suggestions.push(
        'Add more quantifiable achievements and action-oriented language.'
      );
    }

    if (scores.relevance !== undefined && scores.relevance < 7) {
      suggestions.push(
        'Ensure the enhanced content maintains key information from the original.'
      );
    }

    if (scores.originality !== undefined && scores.originality < 7) {
      suggestions.push('Avoid clichés and use more unique, specific language.');
    }

    if (scores.professionalism !== undefined && scores.professionalism < 7) {
      suggestions.push(
        'Use more formal language and check capitalization and punctuation.'
      );
    }

    return suggestions;
  }
}
