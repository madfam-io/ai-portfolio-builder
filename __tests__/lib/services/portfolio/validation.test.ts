import { describe, test, it, expect } from '@jest/globals';
import {
  validateCreatePortfolio,
  validateUpdatePortfolio,
  sanitizePortfolioData,
} from '@/lib/services/portfolio/validation';
import {
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
  Portfolio,
} from '@/types/portfolio';

describe('Portfolio Validation', () => {
  describe('validateCreatePortfolio', () => {
    it('should validate valid portfolio creation data', () => {
      const validData: CreatePortfolioDTO = {
        name: 'John Doe',
        title: 'Software Developer',
        template: 'developer',
      };

      const result = validateCreatePortfolio(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require name field', () => {
      const dataWithoutName: CreatePortfolioDTO = {
        name: '',
        title: 'Software Developer',
        template: 'developer',
      };

      const result = validateCreatePortfolio(dataWithoutName);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        field: 'name',
        message: 'Name is required',
        code: 'REQUIRED_FIELD',
      });
    });

    it('should require title field', () => {
      const dataWithoutTitle: CreatePortfolioDTO = {
        name: 'John Doe',
        title: '',
        template: 'developer',
      };

      const result = validateCreatePortfolio(dataWithoutTitle);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        field: 'title',
        message: 'Title is required',
        code: 'REQUIRED_FIELD',
      });
    });

    it('should require template field', () => {
      const dataWithoutTemplate = {
        name: 'John Doe',
        title: 'Software Developer',
      } as CreatePortfolioDTO;

      const result = validateCreatePortfolio(dataWithoutTemplate);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        field: 'template',
        message: 'Template selection is required',
        code: 'REQUIRED_FIELD',
      });
    });

    it('should validate all required fields together', () => {
      const emptyData = {} as CreatePortfolioDTO;

      const result = validateCreatePortfolio(emptyData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors.map(e => e.field)).toEqual([
        'name',
        'title',
        'template',
      ]);
    });
  });

  describe('validateUpdatePortfolio', () => {
    it('should validate valid update data', () => {
      const validData: UpdatePortfolioDTO = {
        name: 'Jane Smith',
        bio: 'Experienced software developer with 10 years of expertise',
      };

      const result = validateUpdatePortfolio(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate name format', () => {
      const invalidNameData: UpdatePortfolioDTO = {
        name: 'John123@#$',
      };

      const result = validateUpdatePortfolio(invalidNameData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        field: 'name',
        message: 'Name contains invalid characters',
        code: 'INVALID_FORMAT',
      });
    });

    it('should validate bio length', () => {
      const shortBioData: UpdatePortfolioDTO = {
        bio: 'Too short',
      };

      const result = validateUpdatePortfolio(shortBioData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        field: 'bio',
        message: 'Bio must be between 10 and 500 characters',
        code: 'INVALID_LENGTH',
      });
    });

    it('should allow empty update (no fields)', () => {
      const emptyUpdate: UpdatePortfolioDTO = {};

      const result = validateUpdatePortfolio(emptyUpdate);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should only validate provided fields', () => {
      const partialUpdate: UpdatePortfolioDTO = {
        title: 'Senior Developer',
        // Name not provided, should not be validated
      };

      const result = validateUpdatePortfolio(partialUpdate);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate long bio', () => {
      const longBioData: UpdatePortfolioDTO = {
        bio: 'A'.repeat(501), // 501 characters
      };

      const result = validateUpdatePortfolio(longBioData);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('bio');
    });

    it('should accept valid international names', () => {
      const internationalNames = [
        'José García',
        'François Müller',
        'María José',
        "O'Connor",
        'Jean-Pierre',
      ];

      internationalNames.forEach(name => {
        const result = validateUpdatePortfolio({ name });
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('sanitizePortfolioData', () => {
    it('should trim string fields', () => {
      const dataWithSpaces = {
        name: '  John Doe  ',
        title: '  Developer  ',
        bio: '  Bio text  ',
        tagline: '  Tagline  ',
      };

      const sanitized = sanitizePortfolioData(dataWithSpaces);

      expect(sanitized.name).toBe('John Doe');
      expect(sanitized.title).toBe('Developer');
      expect(sanitized.bio).toBe('Bio text');
      expect(sanitized.tagline).toBe('Tagline');
    });

    it('should sanitize URLs by adding https protocol', () => {
      const dataWithUrls = {
        avatarUrl: 'example.com/avatar.jpg',
        social: {
          linkedin: 'linkedin.com/in/johndoe',
          github: 'github.com/johndoe',
          website: 'johndoe.com',
        },
      };

      const sanitized = sanitizePortfolioData(dataWithUrls);

      expect(sanitized.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(sanitized.social?.linkedin).toBe(
        'https://linkedin.com/in/johndoe'

      expect(sanitized.social?.github).toBe('https://github.com/johndoe');
      expect(sanitized.social?.website).toBe('https://johndoe.com');
    });

    it('should preserve existing https URLs', () => {
      const dataWithHttpsUrls = {
        avatarUrl: 'https://example.com/avatar.jpg',
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
      };

      const sanitized = sanitizePortfolioData(dataWithHttpsUrls);

      expect(sanitized.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(sanitized.social?.linkedin).toBe(
        'https://linkedin.com/in/johndoe'

    });

    it('should preserve http URLs', () => {
      const dataWithHttpUrls = {
        avatarUrl: 'http://example.com/avatar.jpg',
      };

      const sanitized = sanitizePortfolioData(dataWithHttpUrls);

      expect(sanitized.avatarUrl).toBe('http://example.com/avatar.jpg');
    });

    it('should remove javascript protocol URLs', () => {
      const maliciousData = {
        avatarUrl: 'javascript:alert("xss")',
        social: {
          website: 'javascript:void(0)',
        },
      };

      const sanitized = sanitizePortfolioData(maliciousData);

      expect(sanitized.avatarUrl).toBe('');
      expect(sanitized.social?.website).toBe('');
    });

    it('should remove data protocol URLs', () => {
      const dataProtocolUrls = {
        avatarUrl: 'data:text/html,<script>alert("xss")</script>',
        social: {
          website: 'data:image/svg+xml,<svg onload=alert(1)>',
        },
      };

      const sanitized = sanitizePortfolioData(dataProtocolUrls);

      expect(sanitized.avatarUrl).toBe('');
      expect(sanitized.social?.website).toBe('');
    });

    it('should handle custom social links array', () => {
      const dataWithCustomLinks = {
        social: {
          custom: [
            { label: 'Blog', url: 'myblog.com' },
            { label: 'Portfolio', url: 'https://portfolio.com' },
            { label: 'Bad', url: 'javascript:alert(1)' },
          ],
        },
      };

      const sanitized = sanitizePortfolioData(dataWithCustomLinks);

      expect(sanitized.social?.custom).toHaveLength(3);
      expect(sanitized.social?.custom?.[0].url).toBe('https://myblog.com');
      expect(sanitized.social?.custom?.[1].url).toBe('https://portfolio.com');
      expect(sanitized.social?.custom?.[2].url).toBe('');
    });

    it('should handle missing fields gracefully', () => {
      const minimalData = {
        name: 'John Doe',
      };

      const sanitized = sanitizePortfolioData(minimalData);

      expect(sanitized.name).toBe('John Doe');
      expect(sanitized.bio).toBeUndefined();
      expect(sanitized.social).toBeUndefined();
    });

    it('should preserve non-string social fields', () => {
      const dataWithMixedSocial = {
        social: {
          linkedin: 'linkedin.com/in/johndoe',
          verified: true, // Non-string field
          followers: 1000, // Non-string field
        },
      } as any;

      const sanitized = sanitizePortfolioData(dataWithMixedSocial);

      expect(sanitized.social?.linkedin).toBe(
        'https://linkedin.com/in/johndoe'

      expect((sanitized.social as any)?.verified).toBe(true);
      expect((sanitized.social as any)?.followers).toBe(1000);
    });

    it('should not modify original data', () => {
      const originalData = {
        name: '  John Doe  ',
        avatarUrl: 'example.com/avatar.jpg',
      };

      const originalCopy = JSON.parse(JSON.stringify(originalData));
      sanitizePortfolioData(originalData);

      expect(originalData).toEqual(originalCopy);
    });

    it('should handle all social platform fields', () => {
      const allSocialPlatforms = {
        social: {
          linkedin: 'linkedin.com',
          github: 'github.com',
          twitter: 'twitter.com',
          instagram: 'instagram.com',
          youtube: 'youtube.com',
          website: 'website.com',
          dribbble: 'dribbble.com',
          behance: 'behance.com',
        },
      };

      const sanitized = sanitizePortfolioData(allSocialPlatforms);

      Object.values(sanitized.social || {}).forEach(url => {
        if (typeof url === 'string') {
          expect(url).toMatch(/^https:\/\//);
        }
      });
    });
  });
});
