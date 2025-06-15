import { ReadabilityOptimizer } from '@/lib/ai/geo/optimizers/readability-optimizer';

describe('ReadabilityOptimizer', () => {
  let optimizer: ReadabilityOptimizer;

  beforeEach(() => {
    optimizer = new ReadabilityOptimizer();
  });

  describe('improveReadability', () => {
    it('should simplify complex sentences', () => {
      const complexText = 'This is a very long sentence with multiple clauses, and it contains many different ideas that could be better expressed as separate sentences, which would make the content much easier to read and understand.';
      
      const result = optimizer.improveReadability(complexText);
      
      // Should break into multiple sentences
      expect(result.split('. ').length).toBeGreaterThan(1);
      expect(result).toContain('Additionally');
    });

    it('should remove business jargon', () => {
      const jargonText = 'We need to leverage our core competencies to synergize with stakeholders and ideate on the value proposition.';
      
      const result = optimizer.improveReadability(jargonText);
      
      expect(result).not.toContain('leverage');
      expect(result).not.toContain('synergize');
      expect(result).toContain('use');
      expect(result).toContain('work together');
    });

    it('should improve transitions between sentences', () => {
      const text = 'I am a developer. I have experience with React. I built many projects.';
      
      const result = optimizer.improveReadability(text);
      
      // Should add transitions where appropriate
      expect(result).toMatch(/(Furthermore|Additionally|Moreover)/);
    });

    it('should fix passive voice', () => {
      const passiveText = 'The project was completed by the team. The code was reviewed by senior developers.';
      
      const result = optimizer.improveReadability(passiveText);
      
      // Should convert to more active voice
      expect(result).not.toMatch(/was\s+\w+ed\s+by/);
    });

    it('should handle empty or short content', () => {
      expect(optimizer.improveReadability('')).toBe('');
      expect(optimizer.improveReadability('Short.')).toBe('Short.');
    });
  });

  describe('calculateReadabilityScore', () => {
    it('should calculate score for simple text', () => {
      const simpleText = 'I am a developer. I like to code. Programming is fun.';
      
      const score = optimizer.calculateReadabilityScore(simpleText);
      
      expect(score).toBeGreaterThan(60); // Simple text should have high score
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate lower score for complex text', () => {
      const complexText = 'The implementation of sophisticated algorithmic solutions necessitates comprehensive understanding of computational complexity theory and advanced data structures.';
      
      const score = optimizer.calculateReadabilityScore(complexText);
      
      expect(score).toBeLessThan(60); // Complex text should have lower score
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle edge cases', () => {
      expect(optimizer.calculateReadabilityScore('')).toBe(0);
      expect(optimizer.calculateReadabilityScore('Word')).toBeGreaterThan(0);
    });

    it('should consider sentence length in scoring', () => {
      const shortSentences = 'I code. It is fun. I like it.';
      const longSentence = 'I enjoy coding because it allows me to create innovative solutions to complex problems while continuously learning new technologies and methodologies.';
      
      const shortScore = optimizer.calculateReadabilityScore(shortSentences);
      const longScore = optimizer.calculateReadabilityScore(longSentence);
      
      expect(shortScore).toBeGreaterThan(longScore);
    });
  });

  describe('private methods', () => {
    it('should count syllables correctly', () => {
      // Access private method through any type assertion for testing
      const countSyllables = (optimizer as any).countSyllables.bind(optimizer);
      
      expect(countSyllables('hello')).toBe(2); // hel-lo
      expect(countSyllables('beautiful')).toBe(3); // beau-ti-ful
      expect(countSyllables('the')).toBe(1);
      expect(countSyllables('comfortable')).toBe(3); // com-for-table (silent e)
      expect(countSyllables('people')).toBe(2); // peo-ple
    });

    it('should handle jargon replacement case-insensitively', () => {
      const text = 'We must LEVERAGE our skills and Utilize our resources.';
      
      const result = optimizer.improveReadability(text);
      
      expect(result).not.toContain('LEVERAGE');
      expect(result).not.toContain('Utilize');
      expect(result).toContain('use');
    });

    it('should identify when transitions are needed', () => {
      const needsTransition = (optimizer as any).needsTransition.bind(optimizer);
      
      // Sentences with shared content
      const prev1 = 'React is a popular framework.';
      const curr1 = 'React helps build user interfaces.';
      expect(needsTransition(prev1, curr1)).toBe(true);
      
      // Sentences without shared content
      const prev2 = 'The weather is nice.';
      const curr2 = 'I like programming.';
      expect(needsTransition(prev2, curr2)).toBe(false);
      
      // Sentence already has transition
      const prev3 = 'React is great.';
      const curr3 = 'However, React has a learning curve.';
      expect(needsTransition(prev3, curr3)).toBe(false);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle text with special characters', () => {
      const text = 'Hello! How are you? I\'m fine... Thanks!!!';
      
      const result = optimizer.improveReadability(text);
      
      expect(result).toBeTruthy();
      expect(() => optimizer.calculateReadabilityScore(text)).not.toThrow();
    });

    it('should handle text with numbers and symbols', () => {
      const text = 'In 2023, we achieved 150% growth @ $2.5M revenue.';
      
      const result = optimizer.improveReadability(text);
      
      expect(result).toContain('2023');
      expect(result).toContain('150%');
    });

    it('should preserve markdown formatting', () => {
      const markdown = '## Title\n\n**Bold text** and *italic text*\n\n- List item';
      
      const result = optimizer.improveReadability(markdown);
      
      expect(result).toContain('## Title');
      expect(result).toContain('**Bold text**');
      expect(result).toContain('- List item');
    });
  });
});