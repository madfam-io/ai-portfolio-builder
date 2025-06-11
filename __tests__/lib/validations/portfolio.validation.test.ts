import {
  validateCreatePortfolio,
  validateUpdatePortfolio,
  validatePortfolioQuery,
} from '@/lib/validations/portfolio';

describe('Portfolio Validation Schemas', () => {
  describe('createPortfolioSchema', () => {
    const validCreateData = {
      name: 'John Doe',
      title: 'Full Stack Developer',
      bio: 'Experienced developer with expertise in modern web technologies',
      template: 'developer',
    };

    it('should validate valid portfolio creation data', () => {
      const result = validateCreatePortfolio(validCreateData);
      expect(result.success).toBe(true);
    });

    it('should require name field', () => {
      const invalidData = { ...validCreateData };
      delete (invalidData as any).name;

      const result = validateCreatePortfolio(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require title field', () => {
      const invalidData = { ...validCreateData };
      delete (invalidData as any).title;

      const result = validateCreatePortfolio(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require template field', () => {
      const invalidData = { ...validCreateData };
      delete (invalidData as any).template;

      const result = validateCreatePortfolio(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate template enum values', () => {
      const validTemplates = [
        'developer',
        'designer',
        'consultant',
        'educator',
        'creative',
        'business',
        'minimal',
        'modern',
      ];

      validTemplates.forEach(template => {
        const result = validateCreatePortfolio({
          ...validCreateData,
          template,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid template values', () => {
      const result = validateCreatePortfolio({
        ...validCreateData,
        template: 'invalid-template',
      });
      expect(result.success).toBe(false);
    });

    it('should validate name length', () => {
      const tooShortName = validateCreatePortfolio({
        ...validCreateData,
        name: '',
      });
      expect(tooShortName.success).toBe(false);

      const tooLongName = validateCreatePortfolio({
        ...validCreateData,
        name: 'a'.repeat(101),
      });
      expect(tooLongName.success).toBe(false);

      const validLength = validateCreatePortfolio({
        ...validCreateData,
        name: 'Valid Name',
      });
      expect(validLength.success).toBe(true);
    });

    it('should allow optional bio', () => {
      const withoutBio = { ...validCreateData };
      delete (withoutBio as any).bio;

      const result = validateCreatePortfolio(withoutBio);
      expect(result.success).toBe(true);
    });

    it('should validate bio length', () => {
      const tooLongBio = validateCreatePortfolio({
        ...validCreateData,
        bio: 'a'.repeat(2001),
      });
      expect(tooLongBio.success).toBe(false);
    });
  });

  describe('updatePortfolioSchema', () => {
    it('should validate partial updates', () => {
      const partialUpdate = {
        name: 'Updated Name',
      };

      const result = validateUpdatePortfolio(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should allow empty updates', () => {
      const result = validateUpdatePortfolio({});
      expect(result.success).toBe(true);
    });

    it('should validate nested contact info', () => {
      const updateWithContact = {
        contact: {
          email: 'test@example.com',
          phone: '+15551234567',
          location: 'San Francisco, CA',
        },
      };

      const result = validateUpdatePortfolio(updateWithContact);
      expect(result.success).toBe(true);
    });

    it('should allow subdomain updates', () => {
      const updateWithSubdomain = {
        subdomain: 'newsubdomain',
      };

      const result = validateUpdatePortfolio(updateWithSubdomain);
      expect(result.success).toBe(true);
    });

    it('should validate status updates', () => {
      const validStatuses = ['draft', 'published', 'archived'];

      validStatuses.forEach(status => {
        const result = validateUpdatePortfolio({ status });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('portfolioQuerySchema', () => {
    it('should validate query parameters', () => {
      const validQuery = {
        status: 'published',
        template: 'developer',
        limit: '10',
        offset: '0',
        sort: 'createdAt',
        order: 'desc',
      };

      const result = validatePortfolioQuery(validQuery);
      expect(result.success).toBe(true);
    });

    it('should transform string numbers to numbers', () => {
      const query = {
        limit: '20',
        offset: '10',
      };

      const result = validatePortfolioQuery(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(10);
      }
    });

    it('should reject invalid sort fields', () => {
      const invalidSort = {
        sort: 'invalidField',
      };

      const result = validatePortfolioQuery(invalidSort);
      expect(result.success).toBe(false);
    });

    it('should validate order values', () => {
      const validOrders = ['asc', 'desc'];

      validOrders.forEach(order => {
        const result = validatePortfolioQuery({ order });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid order values', () => {
      const result = validatePortfolioQuery({ order: 'invalid' });
      expect(result.success).toBe(false);
    });
  });
});
