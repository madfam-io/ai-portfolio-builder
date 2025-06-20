import { z } from 'zod';
import { describe, test, it, expect, jest, beforeEach } from '@jest/globals';
import {
  createPortfolioSchema,
  updatePortfolioSchema,
  portfolioQuerySchema,
  subdomainCheckSchema,
  publishPortfolioSchema,
} from '@/lib/validation/schemas/portfolio';

describe('Portfolio Validation Schemas', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  describe('createPortfolioSchema', () => {
    it('should validate valid portfolio creation data', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        template: 'developer',
      };

      const result = createPortfolioSchema.safeParse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept optional fields', async () => {
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

      const result = createPortfolioSchema.safeParse(validData);
      expect(result.projects).toHaveLength(1);
      expect(result.socialLinks?.linkedin).toBe(
        'https://linkedin.com/in/johndoe'

    });

    it('should reject invalid name', async () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        template: 'developer',
      };

      expect(() => createPortfolioSchema.safeParse(invalidData)).toThrow(
        'Name must be at least 2 characters'

    });

    it('should reject invalid email', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        template: 'developer',
      };

      expect(() => createPortfolioSchema.safeParse(invalidData)).toThrow(
        'Invalid email format'

    });

    it('should reject invalid template', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        template: 'invalid-template',
      };

      expect(() => createPortfolioSchema.safeParse(invalidData)).toThrow();
    });

    it('should validate social links', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        template: 'developer',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'not-a-url',
        },
      };

      expect(() => createPortfolioSchema.safeParse(validData)).toThrow(
        'Invalid URL format'

    });
  });

  describe('updatePortfolioSchema', () => {
    it('should allow partial updates', async () => {
      const updateData = {
        name: 'Jane Doe',
      };

      const result = updatePortfolioSchema.safeParse(updateData);
      expect(result).toEqual(updateData);
    });

    it('should allow updating settings', async () => {
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

      const result = updatePortfolioSchema.safeParse(updateData);
      expect(result.settings?.customColors?.primary).toBe('#FF0000');
    });

    it('should reject invalid color format', async () => {
      const updateData = {
        settings: {
          customColors: {
            primary: 'red',
          },
        },
      };

      expect(() => updatePortfolioSchema.safeParse(updateData)).toThrow();
    });
  });

  describe('portfolioQuerySchema', () => {
    it('should parse query parameters with defaults', async () => {
      const query = {};

      const result = portfolioQuerySchema.safeParse(query);
      expect(result).toEqual({
        page: 1,
        limit: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
    });

    it('should parse and coerce string numbers', async () => {
      const query = {
        page: '2',
        limit: '25',
      };

      const result = portfolioQuerySchema.safeParse(query);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
    });

    it('should validate status filter', async () => {
      const query = {
        status: 'published',
      };

      const result = portfolioQuerySchema.safeParse(query);
      expect(result.status).toBe('published');
    });

    it('should reject invalid status', async () => {
      const query = {
        status: 'invalid',
      };

      expect(() => portfolioQuerySchema.safeParse(query)).toThrow();
    });

    it('should enforce limit constraints', async () => {
      const query = {
        limit: '150',
      };

      expect(() => portfolioQuerySchema.safeParse(query)).toThrow();
    });
  });

  describe('subdomainCheckSchema', () => {
    it('should validate valid subdomain', async () => {
      const data = {
        subdomain: 'john-doe-portfolio',
      };

      const result = subdomainCheckSchema.safeParse(data);
      expect(result.subdomain).toBe('john-doe-portfolio');
    });

    it('should reject subdomain with uppercase', async () => {
      const data = {
        subdomain: 'JohnDoe',
      };

      expect(() => subdomainCheckSchema.safeParse(data)).toThrow(
        'Subdomain can only contain lowercase letters, numbers, and hyphens'

    });

    it('should reject subdomain starting with hyphen', async () => {
      const data = {
        subdomain: '-johndoe',
      };

      expect(() => subdomainCheckSchema.safeParse(data)).toThrow(
        'Subdomain must start with a letter or number'

    });

    it('should reject subdomain ending with hyphen', async () => {
      const data = {
        subdomain: 'johndoe-',
      };

      expect(() => subdomainCheckSchema.safeParse(data)).toThrow(
        'Subdomain must end with a letter or number'

    });

    it('should reject too short subdomain', async () => {
      const data = {
        subdomain: 'ab',
      };

      expect(() => subdomainCheckSchema.safeParse(data)).toThrow(
        'Subdomain must be at least 3 characters'

    });

    it('should reject too long subdomain', async () => {
      const data = {
        subdomain: 'a'.repeat(64),
      };

      expect(() => subdomainCheckSchema.safeParse(data)).toThrow(
        'Subdomain must be less than 63 characters'

    });
  });

  describe('publishPortfolioSchema', () => {
    it('should validate publish request with subdomain', async () => {
      const data = {
        subdomain: 'john-portfolio',
      };

      const result = publishPortfolioSchema.safeParse(data);
      expect(result.subdomain).toBe('john-portfolio');
    });

    it('should allow custom domain', async () => {
      const data = {
        subdomain: 'john-portfolio',
        customDomain: 'john.example.com',
      };

      const result = publishPortfolioSchema.safeParse(data);
      expect(result.customDomain).toBe('john.example.com');
    });

    it('should apply subdomain validation rules', async () => {
      const data = {
        subdomain: 'INVALID',
      };

      expect(() => publishPortfolioSchema.safeParse(data)).toThrow();
    });
  });
});
