import {
  portfolioSchema,
  validatePortfolio,
  validatePortfolioUpdate,
  validateProject,
  validateExperience,
  validateEducation,
  validateSkill,
  sanitizeInput,
  isValidUrl,
  isValidEmail,
  isValidSubdomain
} from '@/lib/validations/portfolio';

describe('Portfolio Validation', () => {
  describe('portfolioSchema', () => {
    it('should validate a complete portfolio', () => {
      const validPortfolio = {
        name: 'My Portfolio',
        title: 'Senior Developer',
        bio: 'Experienced software engineer with 10+ years',
        template: 'developer',
        contact: {
          email: 'test@example.com',
          phone: '+1234567890',
          location: 'San Francisco, CA'
        },
        social: {
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test'
        }
      };

      const result = portfolioSchema.safeParse(validPortfolio);
      expect(result.success).toBe(true);
    });

    it('should reject invalid portfolio data', () => {
      const invalidPortfolio = {
        name: '', // Empty name
        title: 'a', // Too short
        bio: 'Short', // Too short
        template: 'invalid-template'
      };

      const result = portfolioSchema.safeParse(invalidPortfolio);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toHaveLength(4);
      }
    });

    it('should enforce character limits', () => {
      const longPortfolio = {
        name: 'a'.repeat(101), // Exceeds 100 char limit
        title: 'Valid Title',
        bio: 'a'.repeat(1001), // Exceeds 1000 char limit
        template: 'developer'
      };

      const result = portfolioSchema.safeParse(longPortfolio);
      expect(result.success).toBe(false);
    });
  });

  describe('validatePortfolio', () => {
    it('should return true for valid portfolio', () => {
      const portfolio = {
        name: 'Valid Portfolio',
        title: 'Software Engineer',
        bio: 'Experienced developer with strong background',
        template: 'developer'
      };

      const { isValid, errors } = validatePortfolio(portfolio);
      expect(isValid).toBe(true);
      expect(errors).toEqual({});
    });

    it('should return errors for invalid portfolio', () => {
      const portfolio = {
        name: '',
        title: 'SE',
        bio: 'Bio',
        template: 'xyz'
      };

      const { isValid, errors } = validatePortfolio(portfolio);
      expect(isValid).toBe(false);
      expect(errors.name).toContain('required');
      expect(errors.title).toContain('at least 3 characters');
      expect(errors.bio).toContain('at least 10 characters');
      expect(errors.template).toContain('Invalid');
    });
  });

  describe('validateProject', () => {
    it('should validate a complete project', () => {
      const project = {
        title: 'E-commerce Platform',
        description: 'Built a scalable e-commerce platform serving thousands of users',
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        link: 'https://example.com',
        github: 'https://github.com/user/project',
        image: 'https://example.com/image.jpg',
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      };

      const { isValid, errors } = validateProject(project);
      expect(isValid).toBe(true);
      expect(errors).toEqual({});
    });

    it('should validate required fields only', () => {
      const minimalProject = {
        title: 'Simple Project',
        description: 'A basic project with minimal details provided'
      };

      const { isValid, errors } = validateProject(minimalProject);
      expect(isValid).toBe(true);
      expect(errors).toEqual({});
    });

    it('should reject invalid URLs', () => {
      const project = {
        title: 'Project',
        description: 'Valid description for the project',
        link: 'not-a-url',
        github: 'also-not-a-url'
      };

      const { isValid, errors } = validateProject(project);
      expect(isValid).toBe(false);
      expect(errors.link).toContain('valid URL');
      expect(errors.github).toContain('valid URL');
    });

    it('should validate date order', () => {
      const project = {
        title: 'Project',
        description: 'Valid description',
        startDate: '2023-12-31',
        endDate: '2023-01-01' // End before start
      };

      const { isValid, errors } = validateProject(project);
      expect(isValid).toBe(false);
      expect(errors.endDate).toContain('after start date');
    });
  });

  describe('validateExperience', () => {
    it('should validate work experience', () => {
      const experience = {
        company: 'Tech Corp',
        position: 'Senior Software Engineer',
        description: 'Led development of multiple high-impact projects',
        startDate: '2020-01-01',
        current: true,
        location: 'San Francisco, CA',
        achievements: [
          'Increased performance by 40%',
          'Led team of 5 developers'
        ]
      };

      const { isValid, errors } = validateExperience(experience);
      expect(isValid).toBe(true);
      expect(errors).toEqual({});
    });

    it('should require end date if not current', () => {
      const experience = {
        company: 'Old Company',
        position: 'Developer',
        description: 'Worked on various projects',
        startDate: '2018-01-01',
        current: false
        // Missing endDate
      };

      const { isValid, errors } = validateExperience(experience);
      expect(isValid).toBe(false);
      expect(errors.endDate).toContain('required');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World');
    });

    it('should remove SQL injection attempts', () => {
      const input = "Robert'; DROP TABLE students;--";
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('DROP TABLE');
    });

    it('should preserve valid special characters', () => {
      const input = 'Hello! How are you? I\'m fine & well.';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello! How are you? I\'m fine & well.');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World');
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://sub.domain.com/path?query=1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('user_123@subdomain.example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
    });
  });

  describe('isValidSubdomain', () => {
    it('should validate correct subdomains', () => {
      expect(isValidSubdomain('my-portfolio')).toBe(true);
      expect(isValidSubdomain('john-doe-2023')).toBe(true);
      expect(isValidSubdomain('portfolio123')).toBe(true);
    });

    it('should reject invalid subdomains', () => {
      expect(isValidSubdomain('my_portfolio')).toBe(false); // Underscore
      expect(isValidSubdomain('my.portfolio')).toBe(false); // Dot
      expect(isValidSubdomain('-portfolio')).toBe(false); // Starts with dash
      expect(isValidSubdomain('portfolio-')).toBe(false); // Ends with dash
      expect(isValidSubdomain('ab')).toBe(false); // Too short
      expect(isValidSubdomain('a'.repeat(64))).toBe(false); // Too long
    });
  });

  describe('validateSkill', () => {
    it('should validate skill with proficiency', () => {
      const skill = {
        name: 'JavaScript',
        category: 'Programming',
        proficiency: 90
      };

      const { isValid, errors } = validateSkill(skill);
      expect(isValid).toBe(true);
      expect(errors).toEqual({});
    });

    it('should reject invalid proficiency', () => {
      const skill = {
        name: 'React',
        proficiency: 150 // Over 100
      };

      const { isValid, errors } = validateSkill(skill);
      expect(isValid).toBe(false);
      expect(errors.proficiency).toContain('between 0 and 100');
    });
  });

  describe('validateEducation', () => {
    it('should validate education entry', () => {
      const education = {
        institution: 'Stanford University',
        degree: 'B.S. Computer Science',
        startDate: '2016-09-01',
        endDate: '2020-06-01',
        gpa: '3.8',
        achievements: ['Dean\'s List', 'Summa Cum Laude']
      };

      const { isValid, errors } = validateEducation(education);
      expect(isValid).toBe(true);
      expect(errors).toEqual({});
    });

    it('should validate GPA format', () => {
      const education = {
        institution: 'University',
        degree: 'B.S.',
        gpa: '4.5' // Invalid GPA
      };

      const { isValid, errors } = validateEducation(education);
      expect(isValid).toBe(false);
      expect(errors.gpa).toContain('valid GPA');
    });
  });
});