import {
  scoreContent,
  calculateReadabilityScore,
  calculateKeywordScore,
  calculateStructureScore,
  calculateLengthScore,
  ContentScore,
  ContentType
} from '@/lib/ai/huggingface/scoring';

describe('Content Scoring', () => {
  describe('scoreContent', () => {
    it('should score bio content comprehensively', () => {
      const bioContent = `## Professional Summary

I am a passionate software developer with over 5 years of experience building scalable web applications. 
My expertise includes React, Node.js, and cloud technologies. I specialize in creating efficient, 
user-friendly solutions that drive business growth.

### Key Skills
- Frontend: React, TypeScript, Next.js
- Backend: Node.js, Express, PostgreSQL
- Cloud: AWS, Docker, Kubernetes`;

      const keywords = ['software developer', 'React', 'Node.js'];
      const score = scoreContent(bioContent, 'bio', keywords);

      expect(score.overall).toBeGreaterThan(70);
      expect(score.readability).toBeGreaterThan(60);
      expect(score.keywords).toBeGreaterThan(50);
      expect(score.structure).toBeGreaterThan(80);
      expect(score.length).toBeGreaterThan(70);
    });

    it('should score project content appropriately', () => {
      const projectContent = `### E-commerce Platform

Built a scalable e-commerce solution handling 10,000+ daily transactions.

**Technologies:** React, Node.js, PostgreSQL, Redis
**Outcomes:** 40% performance improvement, 99.9% uptime`;

      const keywords = ['e-commerce', 'React', 'scalable'];
      const score = scoreContent(projectContent, 'project', keywords);

      expect(score.overall).toBeGreaterThan(60);
      expect(score.structure).toBeGreaterThan(70);
      expect(score.keywords).toBeGreaterThan(40);
    });

    it('should handle empty content', () => {
      const score = scoreContent('', 'bio', []);

      expect(score.overall).toBe(0);
      expect(score.readability).toBe(0);
      expect(score.keywords).toBe(0);
      expect(score.structure).toBe(0);
      expect(score.length).toBe(0);
    });

    it('should handle content without keywords', () => {
      const content = 'This is a simple bio without any technical terms.';
      const score = scoreContent(content, 'bio', ['python', 'django']);

      expect(score.keywords).toBe(0);
      expect(score.overall).toBeGreaterThan(0); // Other metrics still count
    });
  });

  describe('calculateReadabilityScore', () => {
    it('should score simple sentences highly', () => {
      const simpleText = 'I build apps. They work well. Users love them.';
      const score = calculateReadabilityScore(simpleText);

      expect(score).toBeGreaterThan(80);
    });

    it('should score complex sentences lower', () => {
      const complexText = 'The implementation of sophisticated algorithmic paradigms necessitates comprehensive understanding of computational complexity theory and advanced data structures, requiring extensive expertise.';
      const score = calculateReadabilityScore(complexText);

      expect(score).toBeLessThan(50);
    });

    it('should handle mixed complexity appropriately', () => {
      const mixedText = 'I am a developer. I specialize in creating sophisticated machine learning algorithms that optimize business processes.';
      const score = calculateReadabilityScore(mixedText);

      expect(score).toBeGreaterThan(50);
      expect(score).toBeLessThan(80);
    });

    it('should handle empty text', () => {
      expect(calculateReadabilityScore('')).toBe(0);
    });

    it('should handle single word', () => {
      expect(calculateReadabilityScore('Developer')).toBeGreaterThan(90);
    });
  });

  describe('calculateKeywordScore', () => {
    it('should score content with all keywords highly', () => {
      const content = 'React developer building Node.js applications with TypeScript';
      const keywords = ['React', 'Node.js', 'TypeScript'];
      
      const score = calculateKeywordScore(content, keywords);
      
      expect(score).toBe(100);
    });

    it('should score partial keyword matches proportionally', () => {
      const content = 'Python developer with Django experience';
      const keywords = ['Python', 'Django', 'React', 'Node.js'];
      
      const score = calculateKeywordScore(content, keywords);
      
      expect(score).toBe(50); // 2 out of 4 keywords
    });

    it('should handle case-insensitive matching', () => {
      const content = 'REACT developer using react and React';
      const keywords = ['react'];
      
      const score = calculateKeywordScore(content, keywords);
      
      expect(score).toBe(100);
    });

    it('should handle empty keywords', () => {
      const score = calculateKeywordScore('Some content', []);
      expect(score).toBe(100); // No keywords to match
    });

    it('should handle empty content', () => {
      const score = calculateKeywordScore('', ['keyword']);
      expect(score).toBe(0);
    });

    it('should detect keywords in different word forms', () => {
      const content = 'Developing applications using developer tools';
      const keywords = ['develop'];
      
      const score = calculateKeywordScore(content, keywords);
      
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('calculateStructureScore', () => {
    it('should score well-structured content highly', () => {
      const structured = `# Title

## Section 1
Content here.

## Section 2
- Point 1
- Point 2

### Subsection
More content.`;

      const score = calculateStructureScore(structured);
      
      expect(score).toBeGreaterThan(80);
    });

    it('should score unstructured content lower', () => {
      const unstructured = 'This is just one long paragraph without any formatting or structure whatsoever.';
      
      const score = calculateStructureScore(unstructured);
      
      expect(score).toBeLessThan(30);
    });

    it('should recognize lists as structure', () => {
      const withLists = `My skills:
- JavaScript
- Python
- Java
- Go`;

      const score = calculateStructureScore(withLists);
      
      expect(score).toBeGreaterThan(50);
    });

    it('should recognize numbered lists', () => {
      const numberedList = `Steps to success:
1. Plan
2. Execute
3. Review
4. Improve`;

      const score = calculateStructureScore(numberedList);
      
      expect(score).toBeGreaterThan(50);
    });

    it('should handle empty content', () => {
      expect(calculateStructureScore('')).toBe(0);
    });

    it('should recognize bold and italic formatting', () => {
      const formatted = '**Important:** This is *emphasized* text with formatting.';
      
      const score = calculateStructureScore(formatted);
      
      expect(score).toBeGreaterThan(30);
    });
  });

  describe('calculateLengthScore', () => {
    describe('bio content', () => {
      it('should score ideal length bios perfectly', () => {
        const idealBio = 'word '.repeat(120); // ~120 words
        const score = calculateLengthScore(idealBio, 'bio');
        
        expect(score).toBeGreaterThan(90);
      });

      it('should penalize very short bios', () => {
        const shortBio = 'I am a developer.';
        const score = calculateLengthScore(shortBio, 'bio');
        
        expect(score).toBeLessThan(30);
      });

      it('should penalize very long bios', () => {
        const longBio = 'word '.repeat(300); // ~300 words
        const score = calculateLengthScore(longBio, 'bio');
        
        expect(score).toBeLessThan(70);
      });
    });

    describe('project content', () => {
      it('should score ideal length projects highly', () => {
        const idealProject = 'word '.repeat(80); // ~80 words
        const score = calculateLengthScore(idealProject, 'project');
        
        expect(score).toBeGreaterThan(90);
      });

      it('should allow shorter projects than bios', () => {
        const shortProject = 'word '.repeat(40); // ~40 words
        const score = calculateLengthScore(shortProject, 'project');
        
        expect(score).toBeGreaterThan(70);
      });
    });

    describe('experience content', () => {
      it('should score ideal length experience highly', () => {
        const idealExperience = 'word '.repeat(100); // ~100 words
        const score = calculateLengthScore(idealExperience, 'experience');
        
        expect(score).toBeGreaterThan(90);
      });
    });

    it('should handle empty content', () => {
      expect(calculateLengthScore('', 'bio')).toBe(0);
    });

    it('should handle unknown content type with defaults', () => {
      const content = 'word '.repeat(75);
      const score = calculateLengthScore(content, 'unknown' as ContentType);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    });
  });

  describe('Content scoring edge cases', () => {
    it('should handle Unicode content', () => {
      const unicodeContent = 'Développeur with 經驗 in программирование 🚀';
      const score = scoreContent(unicodeContent, 'bio', ['developer']);
      
      expect(score.overall).toBeGreaterThan(0);
    });

    it('should handle content with only punctuation', () => {
      const punctuationOnly = '...!!!???';
      const score = scoreContent(punctuationOnly, 'bio', []);
      
      expect(score.overall).toBe(0);
    });

    it('should handle very long single words', () => {
      const longWord = 'a'.repeat(50);
      const score = scoreContent(longWord, 'bio', []);
      
      expect(score.readability).toBeLessThan(50);
    });

    it('should provide feedback suggestions', () => {
      const poorContent = 'developer';
      const score = scoreContent(poorContent, 'bio', ['developer'], true);
      
      expect(score.feedback).toBeDefined();
      expect(score.feedback?.length).toBeGreaterThan(0);
      expect(score.feedback).toContain('too short');
    });

    it('should suggest improvements for low structure', () => {
      const unstructured = 'Just a plain paragraph of text without any formatting.';
      const score = scoreContent(unstructured, 'bio', [], true);
      
      expect(score.feedback).toBeDefined();
      expect(score.feedback?.some(f => f.includes('heading') || f.includes('structure'))).toBe(true);
    });

    it('should calculate consistent overall scores', () => {
      const content = 'Sample bio content for testing.';
      const score1 = scoreContent(content, 'bio', []);
      const score2 = scoreContent(content, 'bio', []);
      
      expect(score1.overall).toBe(score2.overall);
    });
  });

  describe('Type exports', () => {
    it('should export ContentScore interface', () => {
      const score: ContentScore = {
        overall: 80,
        readability: 85,
        keywords: 75,
        structure: 80,
        length: 80,
        feedback: ['Good job!']
      };
      
      expect(score).toBeDefined();
    });

    it('should export ContentType', () => {
      const types: ContentType[] = ['bio', 'project', 'experience'];
      expect(types).toHaveLength(3);
    });
  });
});