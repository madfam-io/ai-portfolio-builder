import {
  generatePortfolioMetadata,
  generateMetaTags,
  generatePageMetadata,
  generateOpenGraphTags,
  generateTwitterTags,
  generateSchemaMarkup,
  sanitizeMetaContent,
  extractKeywords
} from '@/lib/seo/metadata';
import type { Portfolio } from '@/lib/types/portfolio';

describe('SEO Metadata Generation', () => {
  const mockPortfolio: Portfolio = {
    id: '123',
    name: 'John Doe',
    tagline: 'Full Stack Developer',
    bio: 'Passionate software engineer with 5+ years of experience building scalable web applications using React, Node.js, and TypeScript.',
    email: 'john@example.com',
    template: 'developer',
    subdomain: 'johndoe',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      twitter: 'https://twitter.com/johndoe'
    },
    projects: [
      {
        id: '1',
        title: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution built with React and Node.js',
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        featured: true
      }
    ],
    skills: [
      { id: '1', name: 'React', level: 90 },
      { id: '2', name: 'Node.js', level: 85 }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isPublished: true
  };

  describe('generatePortfolioMetadata', () => {
    it('should generate complete metadata for portfolio', () => {
      const metadata = generatePortfolioMetadata(mockPortfolio);

      expect(metadata.title).toContain('John Doe');
      expect(metadata.title).toContain('Full Stack Developer');
      expect(metadata.description).toContain('software engineer');
      expect(metadata.keywords).toContain('React');
      expect(metadata.keywords).toContain('Node.js');
      expect(metadata.author).toBe('John Doe');
    });

    it('should handle portfolio without tagline', () => {
      const portfolioWithoutTagline = { ...mockPortfolio, tagline: undefined };
      const metadata = generatePortfolioMetadata(portfolioWithoutTagline);

      expect(metadata.title).toContain('John Doe');
      expect(metadata.description).toBeTruthy();
    });

    it('should generate canonical URL', () => {
      const metadata = generatePortfolioMetadata(mockPortfolio, 'https://example.com');

      expect(metadata.canonical).toBe('https://example.com/johndoe');
    });

    it('should extract skills as keywords', () => {
      const metadata = generatePortfolioMetadata(mockPortfolio);

      expect(metadata.keywords).toContain('React');
      expect(metadata.keywords).toContain('Node.js');
    });

    it('should include project technologies in keywords', () => {
      const metadata = generatePortfolioMetadata(mockPortfolio);

      expect(metadata.keywords).toContain('PostgreSQL');
    });

    it('should limit description length', () => {
      const longBio = 'Very long bio that exceeds the recommended meta description length. '.repeat(10);
      const portfolioWithLongBio = { ...mockPortfolio, bio: longBio };
      
      const metadata = generatePortfolioMetadata(portfolioWithLongBio);

      expect(metadata.description.length).toBeLessThan(160);
    });
  });

  describe('generateMetaTags', () => {
    it('should generate basic meta tags', () => {
      const tags = generateMetaTags({
        title: 'John Doe - Developer',
        description: 'Full stack developer',
        keywords: 'React, Node.js',
        author: 'John Doe'
      });

      expect(tags['title']).toBe('John Doe - Developer');
      expect(tags['description']).toBe('Full stack developer');
      expect(tags['keywords']).toBe('React, Node.js');
      expect(tags['author']).toBe('John Doe');
    });

    it('should include viewport and charset', () => {
      const tags = generateMetaTags({
        title: 'Test',
        description: 'Test description'
      });

      expect(tags['viewport']).toBe('width=device-width, initial-scale=1');
      expect(tags['charset']).toBe('utf-8');
    });

    it('should include robots directive', () => {
      const tags = generateMetaTags({
        title: 'Test',
        description: 'Test',
        robots: 'index, follow'
      });

      expect(tags['robots']).toBe('index, follow');
    });

    it('should handle canonical URL', () => {
      const tags = generateMetaTags({
        title: 'Test',
        description: 'Test',
        canonical: 'https://example.com/portfolio'
      });

      expect(tags['canonical']).toBe('https://example.com/portfolio');
    });
  });

  describe('generatePageMetadata', () => {
    it('should generate metadata for different page types', () => {
      const homeMetadata = generatePageMetadata('home', {
        siteName: 'Portfolio Site'
      });

      expect(homeMetadata.title).toContain('Portfolio Site');
      expect(homeMetadata.description).toBeTruthy();
    });

    it('should generate about page metadata', () => {
      const aboutMetadata = generatePageMetadata('about', {
        siteName: 'John Doe Portfolio',
        description: 'Learn more about John'
      });

      expect(aboutMetadata.title).toContain('About');
      expect(aboutMetadata.description).toContain('John');
    });

    it('should generate contact page metadata', () => {
      const contactMetadata = generatePageMetadata('contact', {
        siteName: 'Portfolio'
      });

      expect(contactMetadata.title).toContain('Contact');
      expect(contactMetadata.description).toContain('Get in touch');
    });

    it('should handle custom page data', () => {
      const customMetadata = generatePageMetadata('custom', {
        title: 'Custom Page',
        description: 'Custom description',
        keywords: 'custom, page'
      });

      expect(customMetadata.title).toBe('Custom Page');
      expect(customMetadata.description).toBe('Custom description');
      expect(customMetadata.keywords).toBe('custom, page');
    });
  });

  describe('generateOpenGraphTags', () => {
    it('should generate Open Graph tags', () => {
      const ogTags = generateOpenGraphTags({
        title: 'John Doe - Developer',
        description: 'Full stack developer portfolio',
        url: 'https://johndoe.example.com',
        image: 'https://example.com/profile.jpg',
        type: 'website'
      });

      expect(ogTags['og:title']).toBe('John Doe - Developer');
      expect(ogTags['og:description']).toBe('Full stack developer portfolio');
      expect(ogTags['og:url']).toBe('https://johndoe.example.com');
      expect(ogTags['og:image']).toBe('https://example.com/profile.jpg');
      expect(ogTags['og:type']).toBe('website');
    });

    it('should include site name and locale', () => {
      const ogTags = generateOpenGraphTags({
        title: 'Test',
        description: 'Test',
        siteName: 'Portfolio Platform',
        locale: 'es_ES'
      });

      expect(ogTags['og:site_name']).toBe('Portfolio Platform');
      expect(ogTags['og:locale']).toBe('es_ES');
    });

    it('should handle missing image with default', () => {
      const ogTags = generateOpenGraphTags({
        title: 'Test',
        description: 'Test'
      });

      expect(ogTags['og:image']).toBeDefined();
      expect(ogTags['og:image']).toContain('default');
    });

    it('should include image dimensions', () => {
      const ogTags = generateOpenGraphTags({
        title: 'Test',
        description: 'Test',
        image: 'https://example.com/image.jpg',
        imageWidth: 1200,
        imageHeight: 630
      });

      expect(ogTags['og:image:width']).toBe('1200');
      expect(ogTags['og:image:height']).toBe('630');
    });
  });

  describe('generateTwitterTags', () => {
    it('should generate Twitter Card tags', () => {
      const twitterTags = generateTwitterTags({
        title: 'John Doe Portfolio',
        description: 'Full stack developer',
        image: 'https://example.com/profile.jpg',
        site: '@johndoe',
        creator: '@johndoe'
      });

      expect(twitterTags['twitter:card']).toBe('summary_large_image');
      expect(twitterTags['twitter:title']).toBe('John Doe Portfolio');
      expect(twitterTags['twitter:description']).toBe('Full stack developer');
      expect(twitterTags['twitter:image']).toBe('https://example.com/profile.jpg');
      expect(twitterTags['twitter:site']).toBe('@johndoe');
      expect(twitterTags['twitter:creator']).toBe('@johndoe');
    });

    it('should handle missing Twitter handles', () => {
      const twitterTags = generateTwitterTags({
        title: 'Test',
        description: 'Test'
      });

      expect(twitterTags['twitter:card']).toBe('summary');
      expect(twitterTags['twitter:site']).toBeUndefined();
    });

    it('should use different card types based on image', () => {
      const withImageTags = generateTwitterTags({
        title: 'Test',
        description: 'Test',
        image: 'https://example.com/image.jpg'
      });

      const withoutImageTags = generateTwitterTags({
        title: 'Test',
        description: 'Test'
      });

      expect(withImageTags['twitter:card']).toBe('summary_large_image');
      expect(withoutImageTags['twitter:card']).toBe('summary');
    });
  });

  describe('generateSchemaMarkup', () => {
    it('should generate Person schema for portfolio', () => {
      const schema = generateSchemaMarkup('person', mockPortfolio);

      expect(schema['@type']).toBe('Person');
      expect(schema.name).toBe('John Doe');
      expect(schema.jobTitle).toBe('Full Stack Developer');
      expect(schema.description).toContain('software engineer');
      expect(schema.sameAs).toContain('https://linkedin.com/in/johndoe');
    });

    it('should generate WebSite schema', () => {
      const schema = generateSchemaMarkup('website', {
        name: 'John Doe Portfolio',
        url: 'https://johndoe.example.com',
        description: 'Portfolio website'
      });

      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe('John Doe Portfolio');
      expect(schema.url).toBe('https://johndoe.example.com');
    });

    it('should generate CreativeWork schema for projects', () => {
      const project = mockPortfolio.projects[0];
      const schema = generateSchemaMarkup('creativework', project);

      expect(schema['@type']).toBe('CreativeWork');
      expect(schema.name).toBe('E-commerce Platform');
      expect(schema.description).toContain('e-commerce solution');
    });

    it('should include JSON-LD context', () => {
      const schema = generateSchemaMarkup('person', mockPortfolio);

      expect(schema['@context']).toBe('https://schema.org');
    });

    it('should handle missing data gracefully', () => {
      const minimalPortfolio = {
        name: 'Jane Doe'
      };

      const schema = generateSchemaMarkup('person', minimalPortfolio);

      expect(schema['@type']).toBe('Person');
      expect(schema.name).toBe('Jane Doe');
      expect(schema.jobTitle).toBeUndefined();
    });
  });

  describe('sanitizeMetaContent', () => {
    it('should remove HTML tags', () => {
      const dirty = '<script>alert("xss")</script>Clean content<b>bold</b>';
      const clean = sanitizeMetaContent(dirty);

      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('<b>');
      expect(clean).toContain('Clean content');
      expect(clean).toContain('bold');
    });

    it('should handle special characters', () => {
      const content = 'Content with "quotes" & ampersands < > symbols';
      const sanitized = sanitizeMetaContent(content);

      expect(sanitized).toContain('quotes');
      expect(sanitized).toContain('ampersands');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('should normalize whitespace', () => {
      const content = 'Text   with    extra\n\nspaces\t\tand\ttabs';
      const sanitized = sanitizeMetaContent(content);

      expect(sanitized).toBe('Text with extra spaces and tabs');
    });

    it('should truncate long content', () => {
      const longContent = 'Very long content. '.repeat(50);
      const sanitized = sanitizeMetaContent(longContent, 100);

      expect(sanitized.length).toBeLessThanOrEqual(100);
      expect(sanitized).not.toEndWith('...');
    });

    it('should handle empty and null content', () => {
      expect(sanitizeMetaContent('')).toBe('');
      expect(sanitizeMetaContent(null as any)).toBe('');
      expect(sanitizeMetaContent(undefined as any)).toBe('');
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'React developer with TypeScript and Node.js experience building REST APIs';
      const keywords = extractKeywords(text);

      expect(keywords).toContain('React');
      expect(keywords).toContain('TypeScript');
      expect(keywords).toContain('Node.js');
      expect(keywords).toContain('REST APIs');
    });

    it('should filter out common words', () => {
      const text = 'The quick brown fox jumps over the lazy developer';
      const keywords = extractKeywords(text);

      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('over');
      expect(keywords).toContain('developer');
      expect(keywords).toContain('quick');
    });

    it('should handle technical terms', () => {
      const text = 'Frontend developer using React.js, CSS3, HTML5, and JavaScript ES6+';
      const keywords = extractKeywords(text);

      expect(keywords).toContain('React.js');
      expect(keywords).toContain('CSS3');
      expect(keywords).toContain('HTML5');
      expect(keywords).toContain('ES6+');
    });

    it('should limit number of keywords', () => {
      const longText = 'keyword1 keyword2 keyword3 keyword4 keyword5 keyword6 keyword7 keyword8 keyword9 keyword10 keyword11 keyword12';
      const keywords = extractKeywords(longText, 5);

      expect(keywords.length).toBeLessThanOrEqual(5);
    });

    it('should handle empty text', () => {
      const keywords = extractKeywords('');
      expect(keywords).toEqual([]);
    });

    it('should preserve compound terms', () => {
      const text = 'Machine Learning and Artificial Intelligence expert';
      const keywords = extractKeywords(text);

      expect(keywords).toContain('Machine Learning');
      expect(keywords).toContain('Artificial Intelligence');
    });
  });

  describe('Edge cases and internationalization', () => {
    it('should handle non-English content', () => {
      const spanishPortfolio = {
        ...mockPortfolio,
        name: 'Juan Pérez',
        tagline: 'Desarrollador Full Stack',
        bio: 'Ingeniero de software apasionado con experiencia en React y Node.js'
      };

      const metadata = generatePortfolioMetadata(spanishPortfolio);

      expect(metadata.title).toContain('Juan Pérez');
      expect(metadata.description).toContain('Ingeniero');
    });

    it('should handle special characters in names', () => {
      const specialPortfolio = {
        ...mockPortfolio,
        name: 'François O\'Brien-Smith'
      };

      const metadata = generatePortfolioMetadata(specialPortfolio);

      expect(metadata.title).toContain('François O\'Brien-Smith');
    });

    it('should handle very long content gracefully', () => {
      const longPortfolio = {
        ...mockPortfolio,
        bio: 'Very long bio content that exceeds normal limits. '.repeat(100)
      };

      const metadata = generatePortfolioMetadata(longPortfolio);

      expect(metadata.description.length).toBeLessThan(200);
    });

    it('should handle missing social links', () => {
      const portfolioWithoutSocial = {
        ...mockPortfolio,
        socialLinks: {}
      };

      const schema = generateSchemaMarkup('person', portfolioWithoutSocial);

      expect(schema.sameAs).toBeUndefined();
    });
  });
});