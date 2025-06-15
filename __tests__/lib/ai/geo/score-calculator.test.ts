import { GEOScoreCalculator } from '@/lib/ai/geo/score-calculator';

describe('GEOScoreCalculator', () => {
  let calculator: GEOScoreCalculator;

  beforeEach(() => {
    calculator = new GEOScoreCalculator();
  });

  describe('calculateGEOScore', () => {
    it('should calculate score for bio content', () => {
      const original = 'I am a developer.';
      const optimized = 'I am a skilled software developer with expertise in React and Node.js, passionate about creating scalable web applications.';
      const keywords = ['software developer', 'React', 'Node.js'];
      
      const score = calculator.calculateGEOScore(original, optimized, keywords, 'bio');
      
      expect(score.overall).toBeGreaterThan(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score).toHaveProperty('keyword');
      expect(score).toHaveProperty('readability');
      expect(score).toHaveProperty('structure');
      expect(score).toHaveProperty('length');
      expect(score).toHaveProperty('uniqueness');
    });

    it('should calculate higher score for optimized content', () => {
      const original = 'Developer with experience.';
      const optimized = `## Professional Summary

Experienced software developer with 8 years of expertise in full-stack development. Specialized in React, Node.js, and cloud technologies.

### Key Skills
- Frontend: React, TypeScript, Next.js
- Backend: Node.js, Express, PostgreSQL
- Cloud: AWS, Docker, Kubernetes`;
      
      const keywords = ['software developer', 'React', 'Node.js'];
      
      const originalScore = calculator.calculateGEOScore(original, original, keywords, 'bio');
      const optimizedScore = calculator.calculateGEOScore(original, optimized, keywords, 'bio');
      
      expect(optimizedScore.overall).toBeGreaterThan(originalScore.overall);
      expect(optimizedScore.structure).toBeGreaterThan(originalScore.structure);
    });

    it('should handle different content types with appropriate weights', () => {
      const content = 'Project description with React and Node.js implementation.';
      const keywords = ['React', 'Node.js'];
      
      const bioScore = calculator.calculateGEOScore(content, content, keywords, 'bio');
      const projectScore = calculator.calculateGEOScore(content, content, keywords, 'project');
      
      // Different content types should potentially have different scores due to different weights
      expect(bioScore).toBeDefined();
      expect(projectScore).toBeDefined();
    });

    it('should penalize keyword stuffing', () => {
      const normal = 'I am a React developer who builds React applications.';
      const stuffed = 'React React React developer React building React apps with React using React framework React.';
      const keywords = ['React'];
      
      const normalScore = calculator.calculateGEOScore(normal, normal, keywords, 'bio');
      const stuffedScore = calculator.calculateGEOScore(stuffed, stuffed, keywords, 'bio');
      
      expect(normalScore.keyword).toBeGreaterThan(stuffedScore.keyword);
    });

    it('should handle empty keywords array', () => {
      const content = 'Some content without specific keywords.';
      
      const score = calculator.calculateGEOScore(content, content, [], 'bio');
      
      expect(score.overall).toBeGreaterThan(0); // Should still calculate other metrics
      expect(score.keyword).toBe(0);
    });
  });

  describe('metric calculations', () => {
    it('should calculate readability score based on sentence complexity', () => {
      const simple = 'I code. It is fun. I like it.';
      const complex = 'The implementation of sophisticated algorithmic solutions necessitates comprehensive understanding.';
      
      const simpleScore = calculator.calculateGEOScore(simple, simple, [], 'bio');
      const complexScore = calculator.calculateGEOScore(complex, complex, [], 'bio');
      
      expect(simpleScore.readability).toBeGreaterThan(complexScore.readability);
    });

    it('should calculate structure score based on formatting', () => {
      const unstructured = 'Just a plain paragraph of text.';
      const structured = `## Title

This is a paragraph.

- First item
- Second item

### Subsection

More content here.`;
      
      const unstructuredScore = calculator.calculateGEOScore(unstructured, unstructured, [], 'bio');
      const structuredScore = calculator.calculateGEOScore(structured, structured, [], 'bio');
      
      expect(structuredScore.structure).toBeGreaterThan(unstructuredScore.structure);
    });

    it('should calculate length score based on content type', () => {
      const shortBio = 'Short bio.'; // Too short
      const idealBio = 'word '.repeat(80); // ~80 words, within ideal range
      const longBio = 'word '.repeat(200); // Too long
      
      const shortScore = calculator.calculateGEOScore(shortBio, shortBio, [], 'bio');
      const idealScore = calculator.calculateGEOScore(idealBio, idealBio, [], 'bio');
      const longScore = calculator.calculateGEOScore(longBio, longBio, [], 'bio');
      
      expect(idealScore.length).toBe(100);
      expect(shortScore.length).toBeLessThan(100);
      expect(longScore.length).toBeLessThan(100);
    });

    it('should calculate uniqueness score', () => {
      const repetitive = 'test test test test test test';
      const diverse = 'various different words with unique vocabulary';
      
      const repetitiveScore = calculator.calculateGEOScore(repetitive, repetitive, [], 'bio');
      const diverseScore = calculator.calculateGEOScore(diverse, diverse, [], 'bio');
      
      expect(diverseScore.uniqueness).toBeGreaterThan(repetitiveScore.uniqueness);
    });
  });

  describe('weight factors', () => {
    it('should apply bio-specific weights', () => {
      const weights = (calculator as any).getWeights('bio');
      
      expect(weights.readability).toBe(0.35); // Readability is most important for bios
      expect(weights.keyword).toBe(0.15); // Keywords less important
    });

    it('should apply project-specific weights', () => {
      const weights = (calculator as any).getWeights('project');
      
      expect(weights.keyword).toBe(0.25); // Keywords more important for projects
      expect(weights.structure).toBe(0.25); // Structure also important
    });

    it('should apply experience-specific weights', () => {
      const weights = (calculator as any).getWeights('experience');
      
      expect(weights.structure).toBe(0.30); // Structure most important for experience
    });

    it('should use default weights for unknown content type', () => {
      const weights = (calculator as any).getWeights('unknown');
      
      expect(weights).toBeDefined();
      expect(weights.readability).toBe(0.30);
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const score = calculator.calculateGEOScore('', '', [], 'bio');
      
      expect(score.overall).toBe(0);
      expect(score.readability).toBe(0);
    });

    it('should handle very long content', () => {
      const longContent = 'word '.repeat(1000);
      
      const score = calculator.calculateGEOScore(longContent, longContent, [], 'bio');
      
      expect(score).toBeDefined();
      expect(score.length).toBeLessThan(100); // Should penalize excessive length
    });

    it('should handle special characters and numbers', () => {
      const content = 'Developer @2023! Working with #React & Node.js - 100% committed.';
      
      const score = calculator.calculateGEOScore(content, content, ['React', 'Node.js'], 'bio');
      
      expect(score).toBeDefined();
      expect(score.keyword).toBeGreaterThan(0);
    });

    it('should normalize scores to 0-100 range', () => {
      const content = 'Test content';
      
      const score = calculator.calculateGEOScore(content, content, [], 'bio');
      
      Object.values(score).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });
  });
});