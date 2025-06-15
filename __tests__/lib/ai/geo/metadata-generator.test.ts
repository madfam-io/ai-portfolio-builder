import { MetadataGenerator } from '@/lib/ai/geo/metadata-generator';

describe('MetadataGenerator', () => {
  let generator: MetadataGenerator;

  beforeEach(() => {
    generator = new MetadataGenerator();
  });

  describe('generateTitle', () => {
    it('should generate SEO-friendly title from content', () => {
      const content = 'Senior React Developer with 8 years of experience building scalable web applications';
      const keywords = ['react developer', 'web applications'];
      
      const title = generator.generateTitle(content, keywords);
      
      expect(title).toContain('React Developer');
      expect(title.length).toBeGreaterThan(20);
      expect(title.length).toBeLessThan(60); // SEO best practice
    });

    it('should include primary keyword in title', () => {
      const content = 'Experienced UX Designer creating user-centered digital experiences';
      const keywords = ['ux designer', 'digital experiences'];
      
      const title = generator.generateTitle(content, keywords);
      
      expect(title.toLowerCase()).toContain('ux designer');
    });

    it('should handle content without keywords', () => {
      const content = 'Professional with diverse experience';
      
      const title = generator.generateTitle(content, []);
      
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    it('should limit title length appropriately', () => {
      const longContent = 'Senior Full Stack Developer with extensive experience in React, Node.js, Python, Django, PostgreSQL, MongoDB, AWS, Docker, Kubernetes, CI/CD, and more';
      const keywords = ['full stack developer'];
      
      const title = generator.generateTitle(longContent, keywords);
      
      expect(title.length).toBeLessThan(60);
      expect(title).not.toContain('...');
    });
  });

  describe('generateDescription', () => {
    it('should generate meta description from content', () => {
      const content = 'Passionate software engineer with expertise in building scalable applications using modern technologies';
      const keywords = ['software engineer', 'scalable applications'];
      
      const description = generator.generateDescription(content, keywords);
      
      expect(description).toContain('software engineer');
      expect(description.length).toBeGreaterThan(50);
      expect(description.length).toBeLessThan(160); // SEO best practice
    });

    it('should prioritize keywords in description', () => {
      const content = 'Developer focused on creating innovative solutions';
      const keywords = ['react developer', 'innovative solutions'];
      
      const description = generator.generateDescription(content, keywords);
      
      expect(description.toLowerCase()).toContain('innovative solutions');
    });

    it('should handle long content by summarizing', () => {
      const longContent = 'A'.repeat(500);
      const keywords = ['developer'];
      
      const description = generator.generateDescription(longContent, keywords);
      
      expect(description.length).toBeLessThan(160);
      expect(description).toBeTruthy();
    });

    it('should add call-to-action when appropriate', () => {
      const content = 'Freelance designer available for projects';
      const keywords = ['freelance designer'];
      
      const description = generator.generateDescription(content, keywords);
      
      expect(description).toMatch(/(contact|hire|available|portfolio)/i);
    });
  });

  describe('generateSchema', () => {
    it('should generate Person schema for bio content', () => {
      const data = {
        name: 'John Doe',
        bio: 'Software Developer',
        email: 'john@example.com',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe'
        }
      };
      
      const schema = generator.generateSchema(data, 'bio');
      
      expect(schema['@type']).toBe('Person');
      expect(schema.name).toBe('John Doe');
      expect(schema.description).toBe('Software Developer');
      expect(schema.email).toBe('john@example.com');
      expect(schema.sameAs).toContain('https://linkedin.com/in/johndoe');
    });

    it('should generate CreativeWork schema for project', () => {
      const data = {
        title: 'E-commerce Platform',
        description: 'Built a scalable e-commerce solution',
        url: 'https://example.com/project',
        tags: ['React', 'Node.js']
      };
      
      const schema = generator.generateSchema(data, 'project');
      
      expect(schema['@type']).toBe('CreativeWork');
      expect(schema.name).toBe('E-commerce Platform');
      expect(schema.description).toBe('Built a scalable e-commerce solution');
      expect(schema.url).toBe('https://example.com/project');
      expect(schema.keywords).toBe('React, Node.js');
    });

    it('should generate Organization schema for experience', () => {
      const data = {
        company: 'Tech Corp',
        position: 'Senior Developer',
        description: 'Led development team',
        startDate: '2020-01-01',
        endDate: '2023-12-31'
      };
      
      const schema = generator.generateSchema(data, 'experience');
      
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Tech Corp');
      expect(schema.employee).toBeDefined();
      expect(schema.employee.jobTitle).toBe('Senior Developer');
    });

    it('should handle missing optional fields', () => {
      const data = {
        name: 'Jane Doe'
      };
      
      const schema = generator.generateSchema(data, 'bio');
      
      expect(schema['@type']).toBe('Person');
      expect(schema.name).toBe('Jane Doe');
      expect(schema.email).toBeUndefined();
      expect(schema.sameAs).toBeUndefined();
    });
  });

  describe('generateOpenGraph', () => {
    it('should generate Open Graph meta tags', () => {
      const data = {
        title: 'John Doe - Software Developer',
        description: 'Experienced developer building web applications',
        image: 'https://example.com/profile.jpg',
        url: 'https://example.com/portfolio'
      };
      
      const ogTags = generator.generateOpenGraph(data);
      
      expect(ogTags['og:title']).toBe('John Doe - Software Developer');
      expect(ogTags['og:description']).toBe('Experienced developer building web applications');
      expect(ogTags['og:image']).toBe('https://example.com/profile.jpg');
      expect(ogTags['og:url']).toBe('https://example.com/portfolio');
      expect(ogTags['og:type']).toBe('website');
    });

    it('should handle missing image with default', () => {
      const data = {
        title: 'Portfolio',
        description: 'My portfolio'
      };
      
      const ogTags = generator.generateOpenGraph(data);
      
      expect(ogTags['og:image']).toBeDefined();
      expect(ogTags['og:image']).toContain('default');
    });

    it('should add Twitter card tags', () => {
      const data = {
        title: 'Portfolio',
        description: 'My work',
        twitter: '@johndoe'
      };
      
      const ogTags = generator.generateOpenGraph(data);
      
      expect(ogTags['twitter:card']).toBe('summary_large_image');
      expect(ogTags['twitter:site']).toBe('@johndoe');
      expect(ogTags['twitter:title']).toBe('Portfolio');
    });
  });

  describe('extractMetaKeywords', () => {
    it('should extract relevant meta keywords', () => {
      const content = 'Full stack developer with React, Node.js, and AWS experience';
      const primaryKeywords = ['full stack developer'];
      
      const metaKeywords = generator.extractMetaKeywords(content, primaryKeywords);
      
      expect(metaKeywords).toContain('full stack developer');
      expect(metaKeywords).toContain('react');
      expect(metaKeywords).toContain('node.js');
      expect(metaKeywords).toContain('aws');
      expect(metaKeywords.length).toBeLessThanOrEqual(10); // Limit keywords
    });

    it('should prioritize primary keywords', () => {
      const content = 'Many skills including React and Node.js';
      const primaryKeywords = ['react developer', 'node.js expert'];
      
      const metaKeywords = generator.extractMetaKeywords(content, primaryKeywords);
      
      expect(metaKeywords[0]).toBe('react developer');
      expect(metaKeywords[1]).toBe('node.js expert');
    });

    it('should remove duplicates', () => {
      const content = 'React React React developer using React';
      const primaryKeywords = ['react'];
      
      const metaKeywords = generator.extractMetaKeywords(content, primaryKeywords);
      
      const reactCount = metaKeywords.filter(k => k.toLowerCase() === 'react').length;
      expect(reactCount).toBe(1);
    });

    it('should handle empty content', () => {
      const metaKeywords = generator.extractMetaKeywords('', []);
      expect(metaKeywords).toEqual([]);
    });
  });

  describe('generateCanonicalUrl', () => {
    it('should generate canonical URL', () => {
      const baseUrl = 'https://example.com';
      const path = '/portfolio/john-doe';
      
      const canonical = generator.generateCanonicalUrl(baseUrl, path);
      
      expect(canonical).toBe('https://example.com/portfolio/john-doe');
    });

    it('should handle trailing slashes', () => {
      const baseUrl = 'https://example.com/';
      const path = '/portfolio/';
      
      const canonical = generator.generateCanonicalUrl(baseUrl, path);
      
      expect(canonical).toBe('https://example.com/portfolio');
    });

    it('should handle missing protocol', () => {
      const baseUrl = 'example.com';
      const path = '/portfolio';
      
      const canonical = generator.generateCanonicalUrl(baseUrl, path);
      
      expect(canonical).toBe('https://example.com/portfolio');
    });

    it('should handle query parameters', () => {
      const baseUrl = 'https://example.com';
      const path = '/portfolio?utm_source=social';
      
      const canonical = generator.generateCanonicalUrl(baseUrl, path);
      
      expect(canonical).toBe('https://example.com/portfolio');
    });
  });

  describe('edge cases', () => {
    it('should handle non-English content gracefully', () => {
      const content = 'Desarrollador de software con experiencia';
      const keywords = ['software developer'];
      
      const title = generator.generateTitle(content, keywords);
      const description = generator.generateDescription(content, keywords);
      
      expect(title).toBeTruthy();
      expect(description).toBeTruthy();
    });

    it('should handle special characters in content', () => {
      const content = 'Developer & Designer @ Tech Co. - 100% Remote';
      const keywords = ['developer', 'designer'];
      
      const title = generator.generateTitle(content, keywords);
      
      expect(title).toBeTruthy();
      expect(title).not.toContain('undefined');
    });

    it('should handle very short content', () => {
      const content = 'Developer';
      const keywords = ['developer'];
      
      const title = generator.generateTitle(content, keywords);
      const description = generator.generateDescription(content, keywords);
      
      expect(title.length).toBeGreaterThan(content.length);
      expect(description.length).toBeGreaterThan(content.length);
    });
  });
});