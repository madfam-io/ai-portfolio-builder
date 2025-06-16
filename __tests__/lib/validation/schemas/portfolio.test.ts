import {
  createPortfolioSchema,
  updatePortfolioSchema,
  portfolioQuerySchema,
  subdomainCheckSchema,
  publishPortfolioSchema,
} from '@/lib/validation/schemas/portfolio';

describe('Portfolio Validation Schemas', () => {
  describe('createPortfolioSchema', () => {
    it('should validate valid portfolio creation data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        template: 'developer',
      };

      const result = createPortfolioSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept optional fields', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        template: 'designer',
        tagline: 'Creative Designer',
        bio: 'I am a creative designer with 10 years of experience',
        projects: [
          {
            title: 'Project 1',
            description: 'A great project',
            technologies: ['React', 'Node.js'],
            featured: true,
          },
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
        },
      };

      const result = createPortfolioSchema.parse(validData);
      expect(result.projects).toHaveLength(1);
      expect(result.socialLinks?.linkedin).toBe(
        'https://linkedin.com/in/johndoe'
      );
    });

    it('should reject invalid name', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        template: 'developer',
      };

      expect(() => createPortfolioSchema.parse(invalidData)).toThrow(
        'Name must be at least 2 characters'
      );
    });

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        template: 'developer',
      };

      expect(() => createPortfolioSchema.parse(invalidData)).toThrow(
        'Invalid email format'
      );
    });

    it('should reject invalid template', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        template: 'invalid-template',
      };

      expect(() => createPortfolioSchema.parse(invalidData)).toThrow();
    });

    it('should validate social links', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        template: 'developer',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'not-a-url',
        },
      };

      expect(() => createPortfolioSchema.parse(validData)).toThrow(
        'Invalid URL format'
      );
    });
  });

  describe('updatePortfolioSchema', () => {
    it('should allow partial updates', () => {
      const updateData = {
        name: 'Jane Doe',
      };

      const result = updatePortfolioSchema.parse(updateData);
      expect(result).toEqual(updateData);
    });

    it('should allow updating settings', () => {
      const updateData = {
        settings: {
          showEmail: false,
          showPhone: true,
          customColors: {
            primary: '#FF0000',
            secondary: '#00FF00',
          },
        },
      };

      const result = updatePortfolioSchema.parse(updateData);
      expect(result.settings?.customColors?.primary).toBe('#FF0000');
    });

    it('should reject invalid color format', () => {
      const updateData = {
        settings: {
          customColors: {
            primary: 'red',
          },
        },
      };

      expect(() => updatePortfolioSchema.parse(updateData)).toThrow();
    });
  });

  describe('portfolioQuerySchema', () => {
    it('should parse query parameters with defaults', () => {
      const query = {};

      const result = portfolioQuerySchema.parse(query);
      expect(result).toEqual({
        page: 1,
        limit: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
    });

    it('should parse and coerce string numbers', () => {
      const query = {
        page: '2',
        limit: '25',
      };

      const result = portfolioQuerySchema.parse(query);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
    });

    it('should validate status filter', () => {
      const query = {
        status: 'published',
      };

      const result = portfolioQuerySchema.parse(query);
      expect(result.status).toBe('published');
    });

    it('should reject invalid status', () => {
      const query = {
        status: 'invalid',
      };

      expect(() => portfolioQuerySchema.parse(query)).toThrow();
    });

    it('should enforce limit constraints', () => {
      const query = {
        limit: '150',
      };

      expect(() => portfolioQuerySchema.parse(query)).toThrow();
    });
  });

  describe('subdomainCheckSchema', () => {
    it('should validate valid subdomain', () => {
      const data = {
        subdomain: 'john-doe-portfolio',
      };

      const result = subdomainCheckSchema.parse(data);
      expect(result.subdomain).toBe('john-doe-portfolio');
    });

    it('should reject subdomain with uppercase', () => {
      const data = {
        subdomain: 'JohnDoe',
      };

      expect(() => subdomainCheckSchema.parse(data)).toThrow(
        'Subdomain can only contain lowercase letters, numbers, and hyphens'
      );
    });

    it('should reject subdomain starting with hyphen', () => {
      const data = {
        subdomain: '-johndoe',
      };

      expect(() => subdomainCheckSchema.parse(data)).toThrow(
        'Subdomain must start with a letter or number'
      );
    });

    it('should reject subdomain ending with hyphen', () => {
      const data = {
        subdomain: 'johndoe-',
      };

      expect(() => subdomainCheckSchema.parse(data)).toThrow(
        'Subdomain must end with a letter or number'
      );
    });

    it('should reject too short subdomain', () => {
      const data = {
        subdomain: 'ab',
      };

      expect(() => subdomainCheckSchema.parse(data)).toThrow(
        'Subdomain must be at least 3 characters'
      );
    });

    it('should reject too long subdomain', () => {
      const data = {
        subdomain: 'a'.repeat(64),
      };

      expect(() => subdomainCheckSchema.parse(data)).toThrow(
        'Subdomain must be less than 63 characters'
      );
    });
  });

  describe('publishPortfolioSchema', () => {
    it('should validate publish request with subdomain', () => {
      const data = {
        subdomain: 'john-portfolio',
      };

      const result = publishPortfolioSchema.parse(data);
      expect(result.subdomain).toBe('john-portfolio');
    });

    it('should allow custom domain', () => {
      const data = {
        subdomain: 'john-portfolio',
        customDomain: 'john.example.com',
      };

      const result = publishPortfolioSchema.parse(data);
      expect(result.customDomain).toBe('john.example.com');
    });

    it('should apply subdomain validation rules', () => {
      const data = {
        subdomain: 'INVALID',
      };

      expect(() => publishPortfolioSchema.parse(data)).toThrow();
    });
  });
});
