import { KeywordAnalysis, KeywordResearch } from './types';

/**
 * Keyword Analysis and Optimization Module
 * Analyzes content for keyword optimization and provides recommendations
 */

/**
 * Natural Language Processing utilities for keyword extraction
 */
export class KeywordAnalyzer {
  private readonly stopWords = new Set([
    'a',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'by',
    'for',
    'from',
    'has',
    'he',
    'in',
    'is',
    'it',
    'its',
    'of',
    'on',
    'that',
    'the',
    'to',
    'was',
    'will',
    'with',
    'the',
    'this',
    'but',
    'they',
    'have',
    'had',
    'what',
    'when',
    'where',
    'who',
    'which',
    'why',
    'how',
  ]);

  /**
   * Analyze content for keywords and entities
   */
  analyzeContent(
    content: string,
    primaryKeyword?: string,
    secondaryKeywords: string[] = []
  ): KeywordAnalysis {
    const words = this.extractWords(content);
    const phrases = this.extractPhrases(content);
    const entities = this.extractEntities(content);

    // Calculate keyword density
    const density = this.calculateKeywordDensity(content, [
      ...(primaryKeyword ? [primaryKeyword] : []),
      ...secondaryKeywords,
    ]);

    // Extract LSI keywords
    const lsiKeywords = this.extractLSIKeywords(words, phrases);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      density,
      primaryKeyword,
      content.length
    );

    return {
      primaryKeyword:
        primaryKeyword || this.suggestPrimaryKeyword(words, phrases),
      secondaryKeywords:
        secondaryKeywords.length > 0
          ? secondaryKeywords
          : this.suggestSecondaryKeywords(words, phrases),
      lsiKeywords,
      entities,
      density,
      recommendations,
    };
  }

  /**
   * Extract individual words from content
   */
  private extractWords(content: string): Map<string, number> {
    const words = new Map<string, number>();
    const tokens = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));

    tokens.forEach(word => {
      words.set(word, (words.get(word) || 0) + 1);
    });

    return new Map([...words.entries()].sort((a, b) => b[1] - a[1]));
  }

  /**
   * Extract meaningful phrases (2-3 word combinations)
   */
  private extractPhrases(content: string): Map<string, number> {
    const phrases = new Map<string, number>();
    const sentences = content.toLowerCase().split(/[.!?]+/);

    sentences.forEach(sentence => {
      const words = sentence
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);

      // Extract 2-word phrases
      for (let i = 0; i < words.length - 1; i++) {
        const word1 = words[i];
        const word2 = words[i + 1];
        if (
          word1 &&
          word2 &&
          !this.stopWords.has(word1) &&
          !this.stopWords.has(word2)
        ) {
          const phrase = `${word1} ${word2}`;
          phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
        }
      }

      // Extract 3-word phrases
      for (let i = 0; i < words.length - 2; i++) {
        const wordsInPhrase = [words[i], words[i + 1], words[i + 2]];
        const nonStopWords = wordsInPhrase.filter(
          w => w && !this.stopWords.has(w)
        );

        if (nonStopWords.length >= 2) {
          const phrase = wordsInPhrase.join(' ');
          phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
        }
      }
    });

    return new Map([...phrases.entries()].sort((a, b) => b[1] - a[1]));
  }

  /**
   * Extract named entities (simple implementation)
   */
  private extractEntities(content: string): string[] {
    const entities: string[] = [];

    // Extract capitalized words (potential proper nouns)
    const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g;
    const matches = content.match(capitalizedPattern);

    if (matches) {
      matches.forEach(match => {
        // Filter out common sentence starters
        if (!this.stopWords.has(match.toLowerCase()) && match.length > 2) {
          entities.push(match);
        }
      });
    }

    // Extract common tech entities
    const techPatterns = [
      /\b(?:React|Vue|Angular|Node\.js|Python|Java|JavaScript|TypeScript)\b/gi,
      /\b(?:AWS|Azure|GCP|Docker|Kubernetes)\b/gi,
      /\b(?:AI|ML|API|REST|GraphQL|SQL|NoSQL)\b/gi,
    ];

    techPatterns.forEach(pattern => {
      const techMatches = content.match(pattern);
      if (techMatches) {
        entities.push(...techMatches);
      }
    });

    return [...new Set(entities)];
  }

  /**
   * Calculate keyword density
   */
  private calculateKeywordDensity(
    content: string,
    keywords: string[]
  ): Record<string, number> {
    const density: Record<string, number> = {};
    const totalWords = content.split(/\s+/).length;

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = content.match(regex);
      const count = matches ? matches.length : 0;
      density[keyword] = Number(((count / totalWords) * 100).toFixed(2));
    });

    return density;
  }

  /**
   * Extract LSI (Latent Semantic Indexing) keywords
   */
  private extractLSIKeywords(
    words: Map<string, number>,
    phrases: Map<string, number>
  ): string[] {
    const lsiKeywords: string[] = [];

    // Get top single words (excluding very common ones)
    const topWords = Array.from(words.entries())
      .slice(0, 10)
      .map(([word]) => word);

    // Get top phrases
    const topPhrases = Array.from(phrases.entries())
      .filter(([, count]) => count > 1)
      .slice(0, 5)
      .map(([phrase]) => phrase);

    lsiKeywords.push(...topWords, ...topPhrases);

    return lsiKeywords;
  }

  /**
   * Suggest primary keyword if not provided
   */
  private suggestPrimaryKeyword(
    words: Map<string, number>,
    phrases: Map<string, number>
  ): string {
    // Prefer meaningful phrases over single words
    const topPhrase = Array.from(phrases.entries())[0];
    const topWord = Array.from(words.entries())[0];

    if (topPhrase && topPhrase[1] > 2) {
      return topPhrase[0];
    }

    return topWord ? topWord[0] : '';
  }

  /**
   * Suggest secondary keywords
   */
  private suggestSecondaryKeywords(
    words: Map<string, number>,
    phrases: Map<string, number>
  ): string[] {
    const suggestions: string[] = [];

    // Add top phrases
    Array.from(phrases.entries())
      .slice(1, 4)
      .forEach(([phrase]) => suggestions.push(phrase));

    // Add top words
    Array.from(words.entries())
      .slice(1, 6)
      .forEach(([word]) => {
        if (!suggestions.some(s => s.includes(word))) {
          suggestions.push(word);
        }
      });

    return suggestions.slice(0, 5);
  }

  /**
   * Generate keyword optimization recommendations
   */
  private generateRecommendations(
    density: Record<string, number>,
    primaryKeyword: string | undefined,
    contentLength: number
  ): string[] {
    const recommendations: string[] = [];

    // Check primary keyword density
    if (primaryKeyword && density[primaryKeyword]) {
      const primaryDensity = density[primaryKeyword];

      if (primaryDensity < 0.5) {
        recommendations.push(
          `Increase usage of primary keyword "${primaryKeyword}" (current: ${primaryDensity}%, target: 1-2%)`
        );
      } else if (primaryDensity > 3) {
        recommendations.push(
          `Reduce keyword stuffing for "${primaryKeyword}" (current: ${primaryDensity}%, target: 1-2%)`
        );
      }
    } else if (primaryKeyword) {
      recommendations.push(
        `Primary keyword "${primaryKeyword}" not found in content`
      );
    }

    // Check content length
    if (contentLength < 300) {
      recommendations.push(
        'Content is too short for effective SEO (minimum 300 words recommended)'
      );
    }

    // Check for keyword variations
    if (primaryKeyword && !this.hasKeywordVariations(primaryKeyword, density)) {
      recommendations.push(
        `Add variations of "${primaryKeyword}" (plural, synonyms, related terms)`
      );
    }

    return recommendations;
  }

  /**
   * Check if content has keyword variations
   */
  private hasKeywordVariations(
    keyword: string,
    density: Record<string, number>
  ): boolean {
    const variations = [
      keyword + 's', // plural
      keyword + 'ing', // gerund
      keyword + 'ed', // past tense
    ];

    return variations.some(variation =>
      Object.keys(density).some(key =>
        key.toLowerCase().includes(variation.toLowerCase())
      )
    );
  }

  /**
   * Research keywords (mock implementation - would connect to real API)
   */
  researchKeywords(
    seed: string,
    industry?: string
  ): KeywordResearch[] {
    // This would typically call an external API like Google Keyword Planner
    // For now, we'll return mock data based on common patterns

    const mockKeywords: KeywordResearch[] = [
      {
        keyword: seed,
        searchVolume: 1000,
        difficulty: 50,
        relatedKeywords: [
          `${seed} services`,
          `${seed} solutions`,
          `best ${seed}`,
          `${seed} tips`,
          `${seed} guide`,
        ],
        questions: [
          `What is ${seed}?`,
          `How to use ${seed}?`,
          `Why is ${seed} important?`,
          `${seed} vs alternatives`,
        ],
        trends: 'stable',
      },
    ];

    // Add industry-specific keywords if provided
    if (industry) {
      mockKeywords.push({
        keyword: `${seed} for ${industry}`,
        searchVolume: 500,
        difficulty: 40,
        relatedKeywords: [
          `${industry} ${seed}`,
          `${seed} in ${industry}`,
          `${industry} ${seed} best practices`,
        ],
        questions: [
          `How does ${seed} work in ${industry}?`,
          `${industry} ${seed} benefits`,
        ],
        trends: 'rising',
      });
    }

    return mockKeywords;
  }

  /**
   * Optimize keyword placement in content
   */
  optimizeKeywordPlacement(
    content: string,
    primaryKeyword: string,
    _secondaryKeywords: string[] = []
  ): string {
    let optimizedContent = content;

    // Ensure primary keyword appears in first 100 words
    const first100Words = content.substring(0, 400); // Approximate
    if (!first100Words.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      // Find first sentence and try to naturally include the keyword
      const firstSentenceEnd = content.indexOf('.');
      if (firstSentenceEnd > 0) {
        const firstSentence = content.substring(0, firstSentenceEnd);
        // This is a simple implementation - in production, use NLP for natural insertion
        optimizedContent = content.replace(
          firstSentence,
          `${firstSentence} focusing on ${primaryKeyword}`
        );
      }
    }

    return optimizedContent;
  }
}
