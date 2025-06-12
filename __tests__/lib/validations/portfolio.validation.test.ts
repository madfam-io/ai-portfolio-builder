
import { portfolioSchema, projectSchema, experienceSchema, educationSchema } from '@/lib/validations/portfolio';

describe('Portfolio Validation', () => {
  describe('portfolioSchema', () => {
    it('should validate a complete portfolio', () => {
      const validPortfolio = {
        name: 'John Doe',
        title: 'Software Engineer',
        bio: 'Experienced developer',
        template: 'developer',
        subdomain: 'johndoe'
      };

      const result = portfolioSchema.safeParse(validPortfolio);
      expect(result.success).toBe(true);
    });

    it('should fail with missing required fields', () => {
      const invalidPortfolio = {
        name: 'John Doe'
      };

      const result = portfolioSchema.safeParse(invalidPortfolio);
      expect(result.success).toBe(false);
    });
  });

  describe('projectSchema', () => {
    it('should validate a project', () => {
      const validProject = {
        title: 'My Project',
        description: 'A great project',
        technologies: ['React', 'Node.js']
      };

      const result = projectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });
  });

  describe('experienceSchema', () => {
    it('should validate experience', () => {
      const validExperience = {
        company: 'Tech Corp',
        position: 'Developer',
        startDate: '2020-01',
        current: true
      };

      const result = experienceSchema.safeParse(validExperience);
      expect(result.success).toBe(true);
    });
  });

  describe('educationSchema', () => {
    it('should validate education', () => {
      const validEducation = {
        institution: 'University',
        degree: 'Bachelor',
        field: 'Computer Science',
        startDate: '2016-09',
        endDate: '2020-05'
      };

      const result = educationSchema.safeParse(validEducation);
      expect(result.success).toBe(true);
    });
  });
});
