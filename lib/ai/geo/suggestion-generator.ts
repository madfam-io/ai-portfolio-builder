/**
 * Suggestion Generator
 * Generates improvement suggestions based on GEO analysis
 */

interface Suggestion {
  type: 'keyword' | 'readability' | 'structure' | 'length' | 'style';
  priority: 'high' | 'medium' | 'low';
  message: string;
  impact: number;
}

interface AnalysisMetrics {
  keywordScore: number;
  readabilityScore: number;
  structureScore: number;
  lengthScore: number;
  uniquenessScore: number;
  wordCount: number;
  sentenceCount: number;
  keywordDensity: number;
}

export class SuggestionGenerator {
  /**
   * Generate improvement suggestions
   */
  generateSuggestions(
    content: string,
    keywords: string[],
    scoreBreakdown: any,
    contentType: string
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const metrics = this.analyzeContent(content, keywords);

    // Generate suggestions based on scores
    if (scoreBreakdown.keyword < 70) {
      suggestions.push(...this.generateKeywordSuggestions(metrics, keywords));
    }

    if (scoreBreakdown.readability < 70) {
      suggestions.push(...this.generateReadabilitySuggestions(metrics));
    }

    if (scoreBreakdown.structure < 70) {
      suggestions.push(...this.generateStructureSuggestions(metrics, contentType));
    }

    if (scoreBreakdown.length < 70) {
      suggestions.push(...this.generateLengthSuggestions(metrics, contentType));
    }

    // Sort by priority and impact
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : b.impact - a.impact;
    });
  }

  /**
   * Analyze content metrics
   */
  private analyzeContent(content: string, keywords: string[]): AnalysisMetrics {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let keywordCount = 0;
    const contentLower = content.toLowerCase();
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
      const matches = contentLower.match(regex) || [];
      keywordCount += matches.length;
    }

    return {
      keywordScore: 0, // Will be set from scoreBreakdown
      readabilityScore: 0,
      structureScore: 0,
      lengthScore: 0,
      uniquenessScore: 0,
      wordCount: words.length,
      sentenceCount: sentences.length,
      keywordDensity: words.length > 0 ? (keywordCount / words.length) * 100 : 0,
    };
  }

  /**
   * Generate keyword-related suggestions
   */
  private generateKeywordSuggestions(
    metrics: AnalysisMetrics,
    keywords: string[]
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];

    if (metrics.keywordDensity < 1) {
      suggestions.push({
        type: 'keyword',
        priority: 'high',
        message: `Include keywords "${keywords.join('", "')}" more naturally in your content`,
        impact: 25,
      });
    } else if (metrics.keywordDensity > 3) {
      suggestions.push({
        type: 'keyword',
        priority: 'high',
        message: 'Reduce keyword repetition to avoid over-optimization',
        impact: 20,
      });
    }

    if (keywords.length > 0 && metrics.keywordDensity === 0) {
      suggestions.push({
        type: 'keyword',
        priority: 'high',
        message: 'Your content doesn\'t include any of the target keywords',
        impact: 30,
      });
    }

    return suggestions;
  }

  /**
   * Generate readability suggestions
   */
  private generateReadabilitySuggestions(metrics: AnalysisMetrics): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const avgWordsPerSentence = metrics.wordCount / Math.max(1, metrics.sentenceCount);

    if (avgWordsPerSentence > 20) {
      suggestions.push({
        type: 'readability',
        priority: 'high',
        message: 'Break down long sentences for better readability',
        impact: 20,
      });
    }

    if (avgWordsPerSentence < 10) {
      suggestions.push({
        type: 'readability',
        priority: 'medium',
        message: 'Combine short sentences for better flow',
        impact: 15,
      });
    }

    // Check for passive voice indicators
    const passiveIndicators = ['was', 'were', 'been', 'being'];
    const passiveCount = passiveIndicators.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (metrics.wordCount.toString().match(regex) || []).length;
    }, 0);

    if (passiveCount > metrics.sentenceCount * 0.3) {
      suggestions.push({
        type: 'readability',
        priority: 'medium',
        message: 'Use more active voice for stronger impact',
        impact: 15,
      });
    }

    return suggestions;
  }

  /**
   * Generate structure suggestions
   */
  private generateStructureSuggestions(
    metrics: AnalysisMetrics,
    contentType: string
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Check for basic structure elements
    const hasHeaders = /^#{1,3}\s/m.test(contentType);
    const hasLists = /^[•\-*]\s/m.test(contentType) || /^\d+\.\s/m.test(contentType);

    if (!hasHeaders && metrics.wordCount > 100) {
      suggestions.push({
        type: 'structure',
        priority: 'medium',
        message: 'Add section headers to organize your content',
        impact: 15,
      });
    }

    if (!hasLists && contentType === 'experience') {
      suggestions.push({
        type: 'structure',
        priority: 'high',
        message: 'Use bullet points to highlight achievements and responsibilities',
        impact: 20,
      });
    }

    // Content-specific suggestions
    if (contentType === 'project') {
      const hasOverview = /overview|description|about/i.test(contentType);
      const hasTech = /technolog|tools?|stack|built with/i.test(contentType);
      const hasOutcome = /result|outcome|impact|achievement/i.test(contentType);

      if (!hasOverview) {
        suggestions.push({
          type: 'structure',
          priority: 'high',
          message: 'Add a project overview section',
          impact: 15,
        });
      }

      if (!hasTech) {
        suggestions.push({
          type: 'structure',
          priority: 'medium',
          message: 'Include technologies used in the project',
          impact: 10,
        });
      }

      if (!hasOutcome) {
        suggestions.push({
          type: 'structure',
          priority: 'high',
          message: 'Highlight project outcomes and achievements',
          impact: 20,
        });
      }
    }

    return suggestions;
  }

  /**
   * Generate length suggestions
   */
  private generateLengthSuggestions(
    metrics: AnalysisMetrics,
    contentType: string
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];

    const idealRanges: Record<string, { min: number; max: number }> = {
      bio: { min: 50, max: 150 },
      project: { min: 100, max: 300 },
      experience: { min: 150, max: 400 },
      default: { min: 100, max: 250 },
    };

    const range = idealRanges[contentType] || idealRanges.default;

    if (metrics.wordCount < range.min) {
      const deficit = range.min - metrics.wordCount;
      suggestions.push({
        type: 'length',
        priority: 'high',
        message: `Add ${deficit} more words to meet minimum length`,
        impact: 25,
      });

      // Specific expansion suggestions
      if (contentType === 'bio') {
        suggestions.push({
          type: 'length',
          priority: 'medium',
          message: 'Include your key skills and achievements',
          impact: 15,
        });
      } else if (contentType === 'project') {
        suggestions.push({
          type: 'length',
          priority: 'medium',
          message: 'Expand on challenges faced and solutions implemented',
          impact: 15,
        });
      }
    } else if (metrics.wordCount > range.max) {
      suggestions.push({
        type: 'length',
        priority: 'medium',
        message: `Reduce content by ${metrics.wordCount - range.max} words for optimal length`,
        impact: 15,
      });

      suggestions.push({
        type: 'length',
        priority: 'low',
        message: 'Focus on most impactful points and remove redundancy',
        impact: 10,
      });
    }

    return suggestions;
  }

  /**
   * Generate style suggestions
   */
  generateStyleSuggestions(content: string, tone: string): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Check tone consistency
    const casualIndicators = ['gonna', 'wanna', 'hey', 'cool', 'awesome'];
    const formalIndicators = ['furthermore', 'moreover', 'therefore', 'hence'];

    const hasCasual = casualIndicators.some(word => 
      new RegExp(`\\b${word}\\b`, 'i').test(content)
    );
    const hasFormal = formalIndicators.some(word => 
      new RegExp(`\\b${word}\\b`, 'i').test(content)
    );

    if (tone === 'professional' && hasCasual) {
      suggestions.push({
        type: 'style',
        priority: 'medium',
        message: 'Replace casual language with more professional alternatives',
        impact: 15,
      });
    }

    if (tone === 'casual' && hasFormal) {
      suggestions.push({
        type: 'style',
        priority: 'low',
        message: 'Consider using more conversational language',
        impact: 10,
      });
    }

    return suggestions;
  }
}