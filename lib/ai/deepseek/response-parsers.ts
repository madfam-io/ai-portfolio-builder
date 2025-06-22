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
 * DeepSeek Response Parsers
 *
 * Parse and transform DeepSeek API responses into domain models
 */

import {
  EnhancedContent,
  ProjectEnhancement,
  TemplateRecommendation,
  QualityScore,
} from '../types';
import { DeepSeekResponse } from './types';

/**
 * Parse bio enhancement response
 */
export function parseBioResponse(
  response: DeepSeekResponse,
  originalBio: string
): EnhancedContent {
  const content = response.choices[0]?.message?.content || originalBio;
  const reasoning = response.choices[0]?.message?.reasoning || '';

  // Extract confidence from reasoning or estimate based on enhancement quality
  const confidence = estimateConfidence(content, reasoning);

  return {
    content,
    confidence,
    suggestions: extractSuggestions(reasoning),
    wordCount: content.split(' ').length,
    qualityScore: calculateQualityScore(content),
    enhancementType: 'bio',
  };
}

/**
 * Parse project optimization response
 */
export function parseProjectResponse(
  response: DeepSeekResponse,
  originalDescription: string,
  technologies: string[]
): ProjectEnhancement {
  const content = response.choices[0]?.message?.content || '';

  // Extract key achievements and impact metrics
  const keyAchievements = extractHighlights(content);
  const impactMetrics = extractMetrics(content);

  // Calculate confidence based on content quality
  const confidence = calculateProjectConfidence(
    content,
    keyAchievements,
    impactMetrics
  );

  return {
    original: originalDescription,
    enhanced: content,
    keyAchievements,
    technologies,
    impactMetrics,
    confidence,
  };
}

/**
 * Parse template recommendation response
 */
export function parseTemplateResponse(
  response: DeepSeekResponse
): TemplateRecommendation {
  const content = response.choices[0]?.message?.content || '';
  const reasoning = response.choices[0]?.message?.reasoning || '';

  // Extract recommended template
  const templates = [
    'developer',
    'designer',
    'consultant',
    'educator',
    'creative',
    'business',
  ];
  const recommendedTemplate =
    templates.find(template => content.toLowerCase().includes(template)) ||
    'developer';

  return {
    recommendedTemplate,
    confidence: estimateConfidence(content, reasoning),
    reasoning: reasoning || content,
    alternatives: templates
      .filter(t => t !== recommendedTemplate)
      .slice(0, 2)
      .map(template => ({
        template,
        score: Math.random() * 0.3 + 0.4, // Mock score between 0.4-0.7
        reasons: [`Alternative option for ${template} role`],
      })),
  };
}

/**
 * Parse content scoring response
 */
export function parseScoringResponse(response: DeepSeekResponse): QualityScore {
  const content = response.choices[0]?.message?.content || '';

  // Extract scores from response
  const overallMatch = content.match(/overall[:\s]+(\d+)/i);
  const readabilityMatch = content.match(/readability[:\s]+(\d+)/i);
  const professionalismMatch = content.match(/professionalism[:\s]+(\d+)/i);
  const impactMatch = content.match(/impact[:\s]+(\d+)/i);
  const completenessMatch = content.match(/completeness[:\s]+(\d+)/i);

  return {
    overall: parseInt(overallMatch?.[1] || '75'),
    readability: parseInt(readabilityMatch?.[1] || '80'),
    professionalism: parseInt(professionalismMatch?.[1] || '85'),
    impact: parseInt(impactMatch?.[1] || '70'),
    completeness: parseInt(completenessMatch?.[1] || '75'),
    suggestions: extractSuggestions(content),
  };
}

/**
 * Helper: Estimate confidence based on content quality
 */
function estimateConfidence(content: string, reasoning: string): number {
  let confidence = 0.7; // Base confidence

  if (reasoning.length > 100) confidence += 0.1;
  if (content.length > 200) confidence += 0.1;
  if (content.includes('specific') || content.includes('measurable'))
    confidence += 0.1;

  return Math.min(confidence, 0.95);
}

/**
 * Helper: Extract suggestions from content
 */
function extractSuggestions(content: string): string[] {
  const suggestions = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (
      line.includes('suggest') ||
      line.includes('recommend') ||
      line.includes('improve')
    ) {
      suggestions.push(line.trim());
    }
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

/**
 * Helper: Extract highlights from project content
 */
function extractHighlights(content: string): string[] {
  const highlights = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (
      line.trim().startsWith('•') ||
      line.trim().startsWith('-') ||
      line.trim().startsWith('*')
    ) {
      highlights.push(line.trim().substring(1).trim());
    }
  }

  return highlights.slice(0, 5);
}

/**
 * Helper: Extract metrics from content
 */
function extractMetrics(content: string): string[] {
  const metrics = [];
  const numberPattern = /\d+[%x]/g;
  const matches = content.match(numberPattern);

  if (matches) {
    metrics.push(...matches.slice(0, 3));
  }

  return metrics;
}

/**
 * Helper: Calculate quality score based on content characteristics
 */
function calculateQualityScore(content: string): number {
  let score = 50; // Base score

  if (content.length > 100) score += 10;
  if (content.length > 200) score += 10;
  if (content.includes('experience')) score += 5;
  if (content.includes('achieved') || content.includes('accomplished'))
    score += 10;
  if (content.match(/\d+/)) score += 5; // Contains numbers/metrics
  if (content.split('.').length > 3) score += 10; // Multiple sentences

  return Math.min(score, 100);
}

/**
 * Helper: Calculate confidence score for project enhancement
 */
function calculateProjectConfidence(
  content: string,
  keyAchievements: string[],
  impactMetrics: string[]
): number {
  let confidence = 0.5; // Base confidence

  // Increase confidence based on content quality
  if (content.length > 100) confidence += 0.1;
  if (keyAchievements.length > 0) confidence += 0.15;
  if (impactMetrics.length > 0) confidence += 0.15;
  if (content.includes('increased') || content.includes('improved'))
    confidence += 0.1;

  return Math.min(confidence, 1.0);
}
