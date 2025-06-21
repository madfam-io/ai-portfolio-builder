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

/**
 * Readability Optimizer
 * Handles content readability improvements and analysis
 */

export class ReadabilityOptimizer {
  /**
   * Improve content readability
   */
  improveReadability(content: string): string {
    let improved = content;

    // Fix common readability issues
    improved = this.simplifyComplexSentences(improved);
    improved = this.removeJargon(improved);
    improved = this.improveTransitions(improved);
    improved = this.fixPassiveVoice(improved);

    return improved;
  }

  /**
   * Simplify complex sentences
   */
  private simplifyComplexSentences(content: string): string {
    const sentences = content.split(/(?<=[.!?])\s+/);
    const simplified = sentences.map(sentence => {
      // Count words
      const wordCount = sentence.split(/\s+/).length;

      // If sentence is too long, try to break it down
      if (wordCount > 25) {
        // Look for conjunctions to split on
        if (sentence.includes(', and ')) {
          return sentence.replace(/, and /g, '. Additionally, ');
        }
        if (sentence.includes(', but ')) {
          return sentence.replace(/, but /g, '. However, ');
        }
        if (sentence.includes(' which ')) {
          return sentence.replace(/ which /g, '. This ');
        }
      }

      return sentence;
    });

    return simplified.join(' ');
  }

  /**
   * Remove or replace jargon
   */
  private removeJargon(content: string): string {
    const jargonMap: Record<string, string> = {
      leverage: 'use',
      utilize: 'use',
      synergize: 'work together',
      ideate: 'brainstorm',
      'circle back': 'follow up',
      bandwidth: 'capacity',
      'paradigm shift': 'major change',
      'core competency': 'main skill',
      'value proposition': 'benefit',
      'actionable insights': 'useful findings',
    };

    let cleaned = content;

    for (const [jargon, replacement] of Object.entries(jargonMap)) {
      const regex = new RegExp(`\\b${jargon}\\b`, 'gi');
      cleaned = cleaned.replace(regex, replacement);
    }

    return cleaned;
  }

  /**
   * Improve transitions between sentences
   */
  private improveTransitions(content: string): string {
    const sentences = content.split(/(?<=[.!?])\s+/);
    const improved: string[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const prevSentence = i > 0 ? sentences[i - 1] : undefined;

      if (
        prevSentence &&
        sentence &&
        this.needsTransition(prevSentence, sentence)
      ) {
        // Add appropriate transition
        const transition = this.selectTransition(prevSentence, sentence);
        improved.push(transition + ' ' + sentence);
      } else if (sentence) {
        improved.push(sentence);
      }
    }

    return improved.join(' ');
  }

  /**
   * Check if sentences need a transition
   */
  private needsTransition(prev: string, current: string): boolean {
    // Simple heuristic: check if sentences are related but lack connection
    const prevWords = prev.toLowerCase().split(/\s+/);
    const currentWords = current.toLowerCase().split(/\s+/);

    // Check for shared topics
    const sharedWords = prevWords.filter(
      word => currentWords.includes(word) && word.length > 4
    );

    // If sentences share content but don't have transitions
    return sharedWords.length > 2 && !this.hasTransition(current);
  }

  /**
   * Check if sentence already has a transition
   */
  private hasTransition(sentence: string): boolean {
    const transitions = [
      'however',
      'therefore',
      'moreover',
      'furthermore',
      'additionally',
      'consequently',
      'nevertheless',
      'thus',
    ];

    const firstWord = sentence.split(/\s+/)[0]?.toLowerCase() || '';
    return transitions.includes(firstWord.replace(/[.,!?]/, ''));
  }

  /**
   * Select appropriate transition
   */
  private selectTransition(_prev: string, current: string): string {
    // Simple logic for demonstration
    if (
      current.toLowerCase().includes('but') ||
      current.toLowerCase().includes('however')
    ) {
      return 'However,';
    }
    if (
      current.toLowerCase().includes('also') ||
      current.toLowerCase().includes('too')
    ) {
      return 'Additionally,';
    }
    return 'Furthermore,';
  }

  /**
   * Fix passive voice constructions
   */
  private fixPassiveVoice(content: string): string {
    // Common passive voice patterns
    const passivePatterns = [
      { pattern: /was\s+(\w+ed)\s+by/gi, replacement: 'actively $1' },
      { pattern: /were\s+(\w+ed)\s+by/gi, replacement: 'actively $1' },
      { pattern: /has\s+been\s+(\w+ed)/gi, replacement: 'has $1' },
      { pattern: /have\s+been\s+(\w+ed)/gi, replacement: 'have $1' },
      { pattern: /is\s+being\s+(\w+ed)/gi, replacement: 'is $1ing' },
      { pattern: /are\s+being\s+(\w+ed)/gi, replacement: 'are $1ing' },
    ];

    let active = content;

    for (const { pattern, replacement } of passivePatterns) {
      active = active.replace(pattern, replacement);
    }

    return active;
  }

  /**
   * Calculate readability score
   */
  calculateReadabilityScore(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce(
      (count, word) => count + this.countSyllables(word),
      0
    );

    if (sentences.length === 0 || words.length === 0) return 0;

    // Flesch Reading Ease formula
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    const score =
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    // Normalize to 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in a word
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');

    if (word.length <= 3) return 1;

    // Count vowel groups
    const vowelGroups = word.match(/[aeiouy]+/g) || [];
    let count = vowelGroups.length;

    // Adjust for silent e
    if (word.endsWith('e') && count > 1) {
      count--;
    }

    // Adjust for common patterns
    if (word.endsWith('le') && count > 1) {
      count++;
    }

    return Math.max(1, count);
  }
}
