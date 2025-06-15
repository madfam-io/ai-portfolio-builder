import { KeywordAnalyzer } from '@/lib/ai/geo/keyword-analyzer';

describe('KeywordAnalyzer', () => {
  let analyzer: KeywordAnalyzer;

  beforeEach(() => {
    analyzer = new KeywordAnalyzer();
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'I am a React developer with experience in Node.js and TypeScript';
      const keywords = analyzer.extractKeywords(text);
      
      expect(keywords).toContain('react');
      expect(keywords).toContain('developer');
      expect(keywords).toContain('experience');
      expect(keywords).toContain('node.js');
      expect(keywords).toContain('typescript');
    });

    it('should filter out common stop words', () => {
      const text = 'The quick brown fox jumps over the lazy dog';
      const keywords = analyzer.extractKeywords(text);
      
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('over');
      expect(keywords).toContain('quick');
      expect(keywords).toContain('brown');
      expect(keywords).toContain('fox');
    });

    it('should handle empty text', () => {
      const keywords = analyzer.extractKeywords('');
      expect(keywords).toEqual([]);
    });

    it('should handle text with special characters', () => {
      const text = 'React@2023! Working with #TypeScript & Node.js - 100% awesome';
      const keywords = analyzer.extractKeywords(text);
      
      expect(keywords).toContain('react');
      expect(keywords).toContain('typescript');
      expect(keywords).toContain('node.js');
      expect(keywords).toContain('awesome');
    });

    it('should deduplicate keywords', () => {
      const text = 'React React React developer using React';
      const keywords = analyzer.extractKeywords(text);
      
      const reactCount = keywords.filter(k => k === 'react').length;
      expect(reactCount).toBe(1);
    });

    it('should preserve technical terms', () => {
      const text = 'Experience with AWS, CI/CD, REST APIs, and GraphQL';
      const keywords = analyzer.extractKeywords(text);
      
      expect(keywords).toContain('aws');
      expect(keywords).toContain('ci/cd');
      expect(keywords).toContain('rest');
      expect(keywords).toContain('apis');
      expect(keywords).toContain('graphql');
    });
  });

  describe('calculateKeywordDensity', () => {
    it('should calculate keyword density correctly', () => {
      const text = 'React developer with React experience building React applications';
      const keyword = 'react';
      
      const density = analyzer.calculateKeywordDensity(text, keyword);
      
      // 3 occurrences of 'react' out of 7 words
      expect(density).toBeCloseTo(42.86, 1);
    });

    it('should handle case-insensitive matching', () => {
      const text = 'REACT React react';
      const keyword = 'react';
      
      const density = analyzer.calculateKeywordDensity(text, keyword);
      
      expect(density).toBe(100);
    });

    it('should return 0 for keywords not in text', () => {
      const text = 'Python developer with Django experience';
      const keyword = 'react';
      
      const density = analyzer.calculateKeywordDensity(text, keyword);
      
      expect(density).toBe(0);
    });

    it('should handle empty text', () => {
      const density = analyzer.calculateKeywordDensity('', 'keyword');
      expect(density).toBe(0);
    });

    it('should handle empty keyword', () => {
      const density = analyzer.calculateKeywordDensity('Some text here', '');
      expect(density).toBe(0);
    });
  });

  describe('suggestRelatedKeywords', () => {
    it('should suggest related keywords for development terms', () => {
      const keywords = ['react', 'javascript'];
      const suggestions = analyzer.suggestRelatedKeywords(keywords);
      
      expect(suggestions).toContain('frontend');
      expect(suggestions).toContain('web development');
      expect(suggestions).toContain('component');
      expect(suggestions).toContain('ui');
    });

    it('should suggest design-related keywords', () => {
      const keywords = ['ui', 'ux'];
      const suggestions = analyzer.suggestRelatedKeywords(keywords);
      
      expect(suggestions).toContain('design');
      expect(suggestions).toContain('user experience');
      expect(suggestions).toContain('interface');
    });

    it('should handle backend keywords', () => {
      const keywords = ['node.js', 'api'];
      const suggestions = analyzer.suggestRelatedKeywords(keywords);
      
      expect(suggestions).toContain('backend');
      expect(suggestions).toContain('server');
      expect(suggestions).toContain('database');
    });

    it('should not duplicate existing keywords', () => {
      const keywords = ['react', 'frontend'];
      const suggestions = analyzer.suggestRelatedKeywords(keywords);
      
      expect(suggestions).not.toContain('react');
      expect(suggestions).not.toContain('frontend');
    });

    it('should handle empty keyword array', () => {
      const suggestions = analyzer.suggestRelatedKeywords([]);
      expect(suggestions).toEqual([]);
    });
  });

  describe('analyzeKeywordRelevance', () => {
    it('should score keywords by relevance to content', () => {
      const content = 'Senior React developer with 5 years of experience building scalable web applications using React, Redux, and TypeScript';
      const keywords = ['react', 'python', 'developer', 'experience'];
      
      const scores = analyzer.analyzeKeywordRelevance(content, keywords);
      
      expect(scores['react']).toBeGreaterThan(scores['python']);
      expect(scores['developer']).toBeGreaterThan(0);
      expect(scores['python']).toBe(0);
    });

    it('should consider keyword position in scoring', () => {
      const content = 'React developer specializing in modern web development';
      const keywords = ['react', 'development'];
      
      const scores = analyzer.analyzeKeywordRelevance(content, keywords);
      
      // 'React' appears first, should have higher score
      expect(scores['react']).toBeGreaterThan(scores['development']);
    });

    it('should handle empty content', () => {
      const scores = analyzer.analyzeKeywordRelevance('', ['keyword']);
      expect(scores['keyword']).toBe(0);
    });

    it('should handle empty keywords', () => {
      const scores = analyzer.analyzeKeywordRelevance('Some content', []);
      expect(scores).toEqual({});
    });
  });

  describe('edge cases', () => {
    it('should handle very long text', () => {
      const longText = 'word '.repeat(1000);
      const keywords = analyzer.extractKeywords(longText);
      
      expect(keywords).toBeDefined();
      expect(keywords.length).toBeGreaterThan(0);
    });

    it('should handle text with only stop words', () => {
      const text = 'the and or but if then';
      const keywords = analyzer.extractKeywords(text);
      
      expect(keywords.length).toBe(0);
    });

    it('should handle text with numbers', () => {
      const text = '10 years of experience with React 18 and Node 16';
      const keywords = analyzer.extractKeywords(text);
      
      expect(keywords).toContain('years');
      expect(keywords).toContain('experience');
      expect(keywords).toContain('react');
      expect(keywords).toContain('node');
    });

    it('should handle multilingual text gracefully', () => {
      const text = 'Developer with experiencia en React y Node.js';
      const keywords = analyzer.extractKeywords(text);
      
      expect(keywords).toContain('developer');
      expect(keywords).toContain('react');
      expect(keywords).toContain('node.js');
    });
  });
});