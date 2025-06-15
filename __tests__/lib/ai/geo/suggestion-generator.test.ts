import { SuggestionGenerator } from '@/lib/ai/geo/suggestion-generator';

describe('SuggestionGenerator', () => {
  let generator: SuggestionGenerator;

  beforeEach(() => {
    generator = new SuggestionGenerator();
  });

  describe('generateSuggestions', () => {
    it('should generate suggestions for bio content', () => {
      const content = 'I am a developer.';
      const contentType = 'bio';
      const score = {
        overall: 45,
        keyword: 20,
        readability: 60,
        structure: 30,
        length: 40,
        uniqueness: 50
      };
      
      const suggestions = generator.generateSuggestions(content, contentType, score);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.category === 'keyword')).toBe(true);
      expect(suggestions.some(s => s.category === 'structure')).toBe(true);
      expect(suggestions.some(s => s.priority === 'high')).toBe(true);
    });

    it('should prioritize low-scoring areas', () => {
      const content = 'Developer with experience.';
      const score = {
        overall: 60,
        keyword: 10, // Very low
        readability: 80,
        structure: 70,
        length: 75,
        uniqueness: 65
      };
      
      const suggestions = generator.generateSuggestions(content, 'bio', score);
      
      const keywordSuggestions = suggestions.filter(s => s.category === 'keyword');
      expect(keywordSuggestions.length).toBeGreaterThan(0);
      expect(keywordSuggestions[0].priority).toBe('high');
    });

    it('should provide specific suggestions for projects', () => {
      const projectContent = 'Built a website.';
      const score = {
        overall: 40,
        keyword: 30,
        readability: 50,
        structure: 20,
        length: 35,
        uniqueness: 45
      };
      
      const suggestions = generator.generateSuggestions(projectContent, 'project', score);
      
      expect(suggestions.some(s => s.suggestion.includes('technologies'))).toBe(true);
      expect(suggestions.some(s => s.suggestion.includes('outcome') || s.suggestion.includes('result'))).toBe(true);
    });

    it('should handle high-scoring content with fewer suggestions', () => {
      const content = 'Excellent detailed bio with great structure and keywords.';
      const score = {
        overall: 90,
        keyword: 85,
        readability: 95,
        structure: 88,
        length: 92,
        uniqueness: 90
      };
      
      const suggestions = generator.generateSuggestions(content, 'bio', score);
      
      expect(suggestions.length).toBeLessThan(3);
      expect(suggestions.every(s => s.priority === 'low')).toBe(true);
    });
  });

  describe('categorize suggestions', () => {
    it('should categorize keyword-related suggestions', () => {
      const privateMethod = (generator as any).categorizeSuggestion.bind(generator);
      
      expect(privateMethod('Add more industry keywords')).toBe('keyword');
      expect(privateMethod('Include relevant technical terms')).toBe('keyword');
      expect(privateMethod('Optimize keyword density')).toBe('keyword');
    });

    it('should categorize readability suggestions', () => {
      const privateMethod = (generator as any).categorizeSuggestion.bind(generator);
      
      expect(privateMethod('Simplify complex sentences')).toBe('readability');
      expect(privateMethod('Break up long paragraphs')).toBe('readability');
      expect(privateMethod('Use simpler words')).toBe('readability');
    });

    it('should categorize structure suggestions', () => {
      const privateMethod = (generator as any).categorizeSuggestion.bind(generator);
      
      expect(privateMethod('Add section headings')).toBe('structure');
      expect(privateMethod('Use bullet points')).toBe('structure');
      expect(privateMethod('Organize with headers')).toBe('structure');
    });

    it('should categorize length suggestions', () => {
      const privateMethod = (generator as any).categorizeSuggestion.bind(generator);
      
      expect(privateMethod('Add more content')).toBe('length');
      expect(privateMethod('Expand your description')).toBe('length');
      expect(privateMethod('Content is too short')).toBe('length');
    });

    it('should default to general category', () => {
      const privateMethod = (generator as any).categorizeSuggestion.bind(generator);
      
      expect(privateMethod('Random suggestion text')).toBe('general');
    });
  });

  describe('priority assignment', () => {
    it('should assign high priority to very low scores', () => {
      const privateMethod = (generator as any).getPriority.bind(generator);
      
      expect(privateMethod(10)).toBe('high');
      expect(privateMethod(25)).toBe('high');
    });

    it('should assign medium priority to moderate scores', () => {
      const privateMethod = (generator as any).getPriority.bind(generator);
      
      expect(privateMethod(40)).toBe('medium');
      expect(privateMethod(55)).toBe('medium');
    });

    it('should assign low priority to good scores', () => {
      const privateMethod = (generator as any).getPriority.bind(generator);
      
      expect(privateMethod(70)).toBe('low');
      expect(privateMethod(85)).toBe('low');
    });
  });

  describe('content-specific suggestions', () => {
    it('should generate bio-specific suggestions', () => {
      const bioContent = 'Software developer';
      const score = {
        overall: 30,
        keyword: 40,
        readability: 50,
        structure: 20,
        length: 25,
        uniqueness: 35
      };
      
      const suggestions = generator.generateSuggestions(bioContent, 'bio', score);
      
      expect(suggestions.some(s => 
        s.suggestion.includes('professional summary') || 
        s.suggestion.includes('experience') ||
        s.suggestion.includes('skills')
      )).toBe(true);
    });

    it('should generate project-specific suggestions', () => {
      const projectContent = 'E-commerce site';
      const score = {
        overall: 35,
        keyword: 30,
        readability: 45,
        structure: 25,
        length: 30,
        uniqueness: 40
      };
      
      const suggestions = generator.generateSuggestions(projectContent, 'project', score);
      
      expect(suggestions.some(s => 
        s.suggestion.includes('technologies') || 
        s.suggestion.includes('challenges') ||
        s.suggestion.includes('outcomes')
      )).toBe(true);
    });

    it('should generate experience-specific suggestions', () => {
      const experienceContent = 'Worked at Company X';
      const score = {
        overall: 40,
        keyword: 35,
        readability: 55,
        structure: 30,
        length: 35,
        uniqueness: 45
      };
      
      const suggestions = generator.generateSuggestions(experienceContent, 'experience', score);
      
      expect(suggestions.some(s => 
        s.suggestion.includes('responsibilities') || 
        s.suggestion.includes('achievements') ||
        s.suggestion.includes('impact')
      )).toBe(true);
    });
  });

  describe('generateActionableSteps', () => {
    it('should provide specific action steps for each suggestion', () => {
      const suggestion = {
        suggestion: 'Add more technical keywords',
        priority: 'high' as const,
        category: 'keyword' as const,
        impact: 15
      };
      
      const steps = generator.generateActionableSteps(suggestion);
      
      expect(steps.length).toBeGreaterThan(0);
      expect(steps.every(step => step.length > 10)).toBe(true);
      expect(steps.some(step => step.includes('keyword') || step.includes('term'))).toBe(true);
    });

    it('should provide readability improvement steps', () => {
      const suggestion = {
        suggestion: 'Improve readability',
        priority: 'medium' as const,
        category: 'readability' as const,
        impact: 10
      };
      
      const steps = generator.generateActionableSteps(suggestion);
      
      expect(steps.some(step => 
        step.includes('sentence') || 
        step.includes('paragraph') ||
        step.includes('simple')
      )).toBe(true);
    });

    it('should provide structure improvement steps', () => {
      const suggestion = {
        suggestion: 'Better organize content',
        priority: 'medium' as const,
        category: 'structure' as const,
        impact: 12
      };
      
      const steps = generator.generateActionableSteps(suggestion);
      
      expect(steps.some(step => 
        step.includes('heading') || 
        step.includes('section') ||
        step.includes('bullet')
      )).toBe(true);
    });
  });

  describe('impact calculation', () => {
    it('should calculate higher impact for lower scores', () => {
      const privateMethod = (generator as any).calculateImpact.bind(generator);
      
      const lowScoreImpact = privateMethod(20, 100);
      const highScoreImpact = privateMethod(80, 100);
      
      expect(lowScoreImpact).toBeGreaterThan(highScoreImpact);
    });

    it('should consider area weight in impact', () => {
      const privateMethod = (generator as any).calculateImpact.bind(generator);
      
      const impact1 = privateMethod(50, 30); // 30% weight
      const impact2 = privateMethod(50, 10); // 10% weight
      
      expect(impact1).toBeGreaterThan(impact2);
    });

    it('should cap impact at reasonable maximum', () => {
      const privateMethod = (generator as any).calculateImpact.bind(generator);
      
      const impact = privateMethod(0, 100); // Worst score, highest weight
      
      expect(impact).toBeLessThanOrEqual(30);
      expect(impact).toBeGreaterThan(20);
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const score = {
        overall: 0,
        keyword: 0,
        readability: 0,
        structure: 0,
        length: 0,
        uniqueness: 0
      };
      
      const suggestions = generator.generateSuggestions('', 'bio', score);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].suggestion).toContain('add content');
    });

    it('should handle perfect scores', () => {
      const score = {
        overall: 100,
        keyword: 100,
        readability: 100,
        structure: 100,
        length: 100,
        uniqueness: 100
      };
      
      const suggestions = generator.generateSuggestions('Perfect content', 'bio', score);
      
      expect(suggestions.length).toBe(0);
    });

    it('should handle unknown content type', () => {
      const score = {
        overall: 50,
        keyword: 50,
        readability: 50,
        structure: 50,
        length: 50,
        uniqueness: 50
      };
      
      const suggestions = generator.generateSuggestions('Content', 'unknown', score);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.every(s => s.category !== undefined)).toBe(true);
    });

    it('should limit number of suggestions', () => {
      const score = {
        overall: 10,
        keyword: 10,
        readability: 10,
        structure: 10,
        length: 10,
        uniqueness: 10
      };
      
      const suggestions = generator.generateSuggestions('Bad content', 'bio', score);
      
      expect(suggestions.length).toBeLessThanOrEqual(10);
    });
  });
});