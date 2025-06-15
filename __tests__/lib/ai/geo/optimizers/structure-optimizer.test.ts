import { StructureOptimizer } from '@/lib/ai/geo/optimizers/structure-optimizer';

describe('StructureOptimizer', () => {
  let optimizer: StructureOptimizer;

  beforeEach(() => {
    optimizer = new StructureOptimizer();
  });

  describe('optimizeStructure', () => {
    it('should optimize bio content structure', () => {
      const bioContent = 'I am a software developer with 10 years of experience in web development. I specialize in React and Node.js. I have worked on various projects including e-commerce platforms and SaaS applications.';
      
      const result = optimizer.optimizeStructure(bioContent, 'bio');
      
      expect(result).toContain('## Professional Summary');
      expect(result.split('\n\n').length).toBeGreaterThan(1);
    });

    it('should optimize project content structure', () => {
      const projectContent = 'Built an e-commerce platform using React and Node.js.';
      
      const result = optimizer.optimizeStructure(projectContent, 'project');
      
      expect(result).toContain('### Project Overview');
      expect(result).toContain('### Technologies Used');
      expect(result).toContain('### Key Outcomes');
    });

    it('should optimize experience content structure', () => {
      const experienceContent = `2020-2023 Senior Developer at Tech Corp
Led development team of 5 engineers
Implemented CI/CD pipeline
Reduced deployment time by 60%`;
      
      const result = optimizer.optimizeStructure(experienceContent, 'experience');
      
      expect(result).toContain('###');
      expect(result).toContain('•');
    });

    it('should handle generic content type', () => {
      const genericContent = 'This is some generic content that needs structure.';
      
      const result = optimizer.optimizeStructure(genericContent, 'unknown');
      
      expect(result).toBe(genericContent); // Should apply basic structure
    });
  });

  describe('structureBio', () => {
    it('should add professional summary header for long bios', () => {
      const longBio = 'A' + ' really long bio'.repeat(10);
      const privateMethod = (optimizer as any).structureBio.bind(optimizer);
      
      const result = privateMethod(longBio);
      
      expect(result).toContain('## Professional Summary');
    });

    it('should handle short bios without adding header', () => {
      const shortBio = 'Short bio.';
      const privateMethod = (optimizer as any).structureBio.bind(optimizer);
      
      const result = privateMethod(shortBio);
      
      expect(result).not.toContain('## Professional Summary');
      expect(result).toBe('Short bio.');
    });

    it('should preserve multiple paragraphs', () => {
      const multiParagraphBio = `First paragraph with introduction.

Second paragraph with more details about experience.

Third paragraph with achievements.`;
      
      const privateMethod = (optimizer as any).structureBio.bind(optimizer);
      const result = privateMethod(multiParagraphBio);
      
      expect(result.split('\n\n').length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('structureProject', () => {
    it('should add missing overview section', () => {
      const project = 'A project built with React.';
      const privateMethod = (optimizer as any).structureProject.bind(optimizer);
      
      const result = privateMethod(project);
      
      expect(result).toContain('### Project Overview');
      expect(result.indexOf('### Project Overview')).toBe(0);
    });

    it('should not duplicate existing sections', () => {
      const project = `### Overview
This is my project overview.

### Technologies
React, Node.js`;
      
      const privateMethod = (optimizer as any).structureProject.bind(optimizer);
      const result = privateMethod(project);
      
      expect(result.match(/overview/gi)?.length).toBe(1);
      expect(result).not.toContain('[Add technologies here]');
    });

    it('should add outcomes section for substantial projects', () => {
      const project = 'A'.repeat(200); // Long project description
      const privateMethod = (optimizer as any).structureProject.bind(optimizer);
      
      const result = privateMethod(project);
      
      expect(result).toContain('### Key Outcomes');
    });
  });

  describe('structureExperience', () => {
    it('should convert to bullet points when no structure exists', () => {
      const experience = `Developed web applications. Managed team of developers. Improved system performance.`;
      
      const privateMethod = (optimizer as any).structureExperience.bind(optimizer);
      const result = privateMethod(experience);
      
      expect(result).toContain('•');
      expect(result.split('•').length).toBe(4); // 3 bullets + 1 empty before first
    });

    it('should preserve existing bullet points', () => {
      const experience = `• Led development team
• Implemented new features
• Improved performance`;
      
      const privateMethod = (optimizer as any).structureExperience.bind(optimizer);
      const result = privateMethod(experience);
      
      expect(result).toBe(experience);
    });

    it('should handle date formatting', () => {
      const experience = `2020 Started as Junior Developer
2022 Promoted to Senior Developer`;
      
      const privateMethod = (optimizer as any).structureExperience.bind(optimizer);
      const result = privateMethod(experience);
      
      expect(result).toContain('### 2020');
      expect(result).toContain('### 2022');
    });
  });

  describe('addBasicStructure', () => {
    it('should break long paragraphs', () => {
      const longText = 'This is a sentence. '.repeat(50);
      const privateMethod = (optimizer as any).addBasicStructure.bind(optimizer);
      
      const result = privateMethod(longText);
      
      expect(result.split('\n\n').length).toBeGreaterThan(1);
    });

    it('should preserve short paragraphs', () => {
      const shortText = 'This is a short paragraph.';
      const privateMethod = (optimizer as any).addBasicStructure.bind(optimizer);
      
      const result = privateMethod(shortText);
      
      expect(result).toBe(shortText);
    });

    it('should handle empty content', () => {
      const privateMethod = (optimizer as any).addBasicStructure.bind(optimizer);
      
      expect(privateMethod('')).toBe('');
      expect(privateMethod('   ')).toBe('');
    });

    it('should handle content with existing paragraph breaks', () => {
      const content = `First paragraph.

Second paragraph.

Third paragraph.`;
      
      const privateMethod = (optimizer as any).addBasicStructure.bind(optimizer);
      const result = privateMethod(content);
      
      expect(result).toBe(content);
    });
  });

  describe('edge cases', () => {
    it('should handle null or undefined content gracefully', () => {
      expect(() => optimizer.optimizeStructure('', 'bio')).not.toThrow();
      expect(optimizer.optimizeStructure('', 'bio')).toBe('');
    });

    it('should handle content with special characters', () => {
      const content = 'Content with @mentions, #hashtags, and $symbols!';
      
      const result = optimizer.optimizeStructure(content, 'bio');
      
      expect(result).toContain('@mentions');
      expect(result).toContain('#hashtags');
    });

    it('should preserve URLs in content', () => {
      const content = 'Check out my work at https://example.com';
      
      const result = optimizer.optimizeStructure(content, 'project');
      
      expect(result).toContain('https://example.com');
    });

    it('should handle mixed line endings', () => {
      const content = 'Line one\r\nLine two\nLine three\r\n\r\nNew paragraph';
      
      const result = optimizer.optimizeStructure(content, 'bio');
      
      expect(result).toBeTruthy();
      expect(result.includes('\r')).toBe(false); // Should normalize line endings
    });
  });
});