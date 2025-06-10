import {
  createPortfolioSchema,
  updatePortfolioSchema,
  experienceSchema,
  educationSchema,
  projectSchema,
  skillSchema,
  certificationSchema,
  validatePortfolioName,
  validateSubdomain,
  validateEmail,
  validateUrl,
  socialLinksSchema,
  contactInfoSchema,
  templateCustomizationSchema,
} from '@/lib/validations/portfolio.validation';

describe('Portfolio Validation Schemas', () => {
  describe('createPortfolioSchema', () => {
    const validCreateData = {
      name: 'Test Portfolio',
      title: 'Software Developer',
      bio: 'A passionate developer',
      template: 'developer' as const,
    };

    it('should validate valid portfolio creation data', () => {
      const result = createPortfolioSchema.safeParse(validCreateData);
      expect(result.success).toBe(true);
    });

    it('should require name field', () => {
      const invalidData = { ...validCreateData };
      delete (invalidData as any).name;
      
      const result = createPortfolioSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require title field', () => {
      const invalidData = { ...validCreateData };
      delete (invalidData as any).title;
      
      const result = createPortfolioSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require template field', () => {
      const invalidData = { ...validCreateData };
      delete (invalidData as any).template;
      
      const result = createPortfolioSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate template enum values', () => {
      const validTemplates = ['developer', 'designer', 'consultant', 'educator', 'creative', 'business', 'minimal', 'modern'];
      
      validTemplates.forEach(template => {
        const result = createPortfolioSchema.safeParse({
          ...validCreateData,
          template,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid template values', () => {
      const result = createPortfolioSchema.safeParse({
        ...validCreateData,
        template: 'invalid-template',
      });
      expect(result.success).toBe(false);
    });

    it('should validate name length constraints', () => {
      // Too short
      const tooShort = createPortfolioSchema.safeParse({
        ...validCreateData,
        name: '',
      });
      expect(tooShort.success).toBe(false);

      // Too long
      const tooLong = createPortfolioSchema.safeParse({
        ...validCreateData,
        name: 'a'.repeat(101),
      });
      expect(tooLong.success).toBe(false);

      // Valid length
      const validLength = createPortfolioSchema.safeParse({
        ...validCreateData,
        name: 'Valid Name',
      });
      expect(validLength.success).toBe(true);
    });

    it('should allow optional bio', () => {
      const withoutBio = { ...validCreateData };
      delete (withoutBio as any).bio;
      
      const result = createPortfolioSchema.safeParse(withoutBio);
      expect(result.success).toBe(true);
    });

    it('should validate bio length', () => {
      const tooLongBio = createPortfolioSchema.safeParse({
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
      
      const result = updatePortfolioSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should allow empty updates', () => {
      const result = updatePortfolioSchema.safeParse({});
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
      
      const result = updatePortfolioSchema.safeParse(updateWithContact);
      expect(result.success).toBe(true);
    });
  });

  describe('experienceSchema', () => {
    const validExperience = {
      company: 'Tech Corp',
      position: 'Software Developer',
      startDate: '2023-01',
      current: true,
      description: 'Developing awesome software',
    };

    it('should validate valid experience', () => {
      const result = experienceSchema.safeParse(validExperience);
      expect(result.success).toBe(true);
    });

    it('should require company field', () => {
      const invalidData = { ...validExperience };
      delete (invalidData as any).company;
      
      const result = experienceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require position field', () => {
      const invalidData = { ...validExperience };
      delete (invalidData as any).position;
      
      const result = experienceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate employment types', () => {
      const validTypes = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
      
      validTypes.forEach(employmentType => {
        const result = experienceSchema.safeParse({
          ...validExperience,
          employmentType,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should limit highlights array length', () => {
      const tooManyHighlights = experienceSchema.safeParse({
        ...validExperience,
        highlights: Array(11).fill('highlight'),
      });
      expect(tooManyHighlights.success).toBe(false);
    });

    it('should limit technologies array length', () => {
      const tooManyTechnologies = experienceSchema.safeParse({
        ...validExperience,
        technologies: Array(21).fill('tech'),
      });
      expect(tooManyTechnologies.success).toBe(false);
    });
  });

  describe('projectSchema', () => {
    const validProject = {
      title: 'Awesome Project',
      description: 'This is an awesome project description',
      technologies: ['React', 'TypeScript', 'Node.js'],
      highlights: ['Feature 1', 'Feature 2'],
    };

    it('should validate valid project', () => {
      const result = projectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it('should require title and description', () => {
      const withoutTitle = { ...validProject };
      delete (withoutTitle as any).title;
      expect(projectSchema.safeParse(withoutTitle).success).toBe(false);

      const withoutDescription = { ...validProject };
      delete (withoutDescription as any).description;
      expect(projectSchema.safeParse(withoutDescription).success).toBe(false);
    });

    it('should validate URL fields', () => {
      const withUrls = {
        ...validProject,
        projectUrl: 'https://example.com',
        githubUrl: 'https://github.com/user/repo',
        liveUrl: 'https://live.example.com',
      };
      
      const result = projectSchema.safeParse(withUrls);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const withInvalidUrl = {
        ...validProject,
        projectUrl: 'not-a-url',
      };
      
      const result = projectSchema.safeParse(withInvalidUrl);
      expect(result.success).toBe(false);
    });

    it('should default featured to false', () => {
      const result = projectSchema.safeParse(validProject);
      if (result.success) {
        expect(result.data.featured).toBe(false);
      }
    });

    it('should default order to 0', () => {
      const result = projectSchema.safeParse(validProject);
      if (result.success) {
        expect(result.data.order).toBe(0);
      }
    });
  });

  describe('skillSchema', () => {
    const validSkill = {
      name: 'JavaScript',
      level: 'expert' as const,
      category: 'Programming Languages',
    };

    it('should validate valid skill', () => {
      const result = skillSchema.safeParse(validSkill);
      expect(result.success).toBe(true);
    });

    it('should require name field', () => {
      const invalidData = { ...validSkill };
      delete (invalidData as any).name;
      
      const result = skillSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate skill levels', () => {
      const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
      
      validLevels.forEach(level => {
        const result = skillSchema.safeParse({
          ...validSkill,
          level,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should allow optional level and category', () => {
      const minimalSkill = { name: 'JavaScript' };
      const result = skillSchema.safeParse(minimalSkill);
      expect(result.success).toBe(true);
    });
  });

  describe('educationSchema', () => {
    const validEducation = {
      institution: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2019-09',
      endDate: '2023-06',
      current: false,
    };

    it('should validate valid education', () => {
      const result = educationSchema.safeParse(validEducation);
      expect(result.success).toBe(true);
    });

    it('should require core fields', () => {
      const requiredFields = ['institution', 'degree', 'field', 'startDate'];
      
      requiredFields.forEach(field => {
        const invalidData = { ...validEducation };
        delete (invalidData as any)[field];
        
        const result = educationSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    it('should allow optional fields', () => {
      const minimalEducation = {
        institution: 'University',
        degree: 'Bachelor',
        field: 'Computer Science',
        startDate: '2019-09',
      };
      
      const result = educationSchema.safeParse(minimalEducation);
      expect(result.success).toBe(true);
    });
  });

  describe('certificationSchema', () => {
    const validCertification = {
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      issueDate: '2023-06',
    };

    it('should validate valid certification', () => {
      const result = certificationSchema.safeParse(validCertification);
      expect(result.success).toBe(true);
    });

    it('should require core fields', () => {
      const requiredFields = ['name', 'issuer', 'issueDate'];
      
      requiredFields.forEach(field => {
        const invalidData = { ...validCertification };
        delete (invalidData as any)[field];
        
        const result = certificationSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    it('should validate credential URL', () => {
      const withCredentialUrl = {
        ...validCertification,
        credentialUrl: 'https://aws.amazon.com/verification',
      };
      
      const result = certificationSchema.safeParse(withCredentialUrl);
      expect(result.success).toBe(true);
    });
  });

  describe('socialLinksSchema', () => {
    it('should validate social links', () => {
      const validSocialLinks = {
        linkedin: 'https://linkedin.com/in/user',
        github: 'https://github.com/user',
        twitter: 'https://twitter.com/user',
        website: 'https://user.example.com',
      };
      
      const result = socialLinksSchema.safeParse(validSocialLinks);
      expect(result.success).toBe(true);
    });

    it('should allow empty social links', () => {
      const result = socialLinksSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate custom social links', () => {
      const withCustomLinks = {
        custom: [
          {
            label: 'Portfolio',
            url: 'https://myportfolio.com',
            icon: 'portfolio',
          },
        ],
      };
      
      const result = socialLinksSchema.safeParse(withCustomLinks);
      expect(result.success).toBe(true);
    });
  });

  describe('contactInfoSchema', () => {
    it('should validate contact info', () => {
      const validContact = {
        email: 'user@example.com',
        phone: '+15551234567',
        location: 'San Francisco, CA',
        availability: 'Available for freelance',
      };
      
      const result = contactInfoSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    it('should validate email format', () => {
      const invalidEmail = contactInfoSchema.safeParse({
        email: 'invalid-email',
      });
      expect(invalidEmail.success).toBe(false);
    });

    it('should validate phone format', () => {
      const validPhones = ['+15551234567', '5551234567', '555.123.4567'];
      
      validPhones.forEach(phone => {
        const result = contactInfoSchema.safeParse({ phone });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('templateCustomizationSchema', () => {
    it('should validate color values', () => {
      const validColors = {
        primaryColor: '#1a73e8',
        secondaryColor: '#34a853',
        accentColor: '#ea4335',
      };
      
      const result = templateCustomizationSchema.safeParse(validColors);
      expect(result.success).toBe(true);
    });

    it('should reject invalid color formats', () => {
      const invalidColor = templateCustomizationSchema.safeParse({
        primaryColor: 'not-a-color',
      });
      expect(invalidColor.success).toBe(false);
    });

    it('should validate font and spacing options', () => {
      const validCustomization = {
        fontFamily: 'Inter',
        fontSize: 'medium' as const,
        spacing: 'normal' as const,
        borderRadius: 'small' as const,
      };
      
      const result = templateCustomizationSchema.safeParse(validCustomization);
      expect(result.success).toBe(true);
    });
  });

  describe('Validation Helper Functions', () => {
    describe('validatePortfolioName', () => {
      it('should validate correct portfolio names', () => {
        expect(validatePortfolioName('Valid Portfolio Name')).toBe(true);
        expect(validatePortfolioName('A')).toBe(true);
        expect(validatePortfolioName('a'.repeat(100))).toBe(true);
      });

      it('should reject invalid portfolio names', () => {
        expect(validatePortfolioName('')).toBe(false);
        expect(validatePortfolioName('a'.repeat(101))).toBe(false);
      });
    });

    describe('validateSubdomain', () => {
      it('should validate correct subdomains', () => {
        expect(validateSubdomain('validsubdomain')).toBe(true);
        expect(validateSubdomain('valid-subdomain')).toBe(true);
        expect(validateSubdomain('abc123')).toBe(true);
      });

      it('should reject invalid subdomains', () => {
        expect(validateSubdomain('invalid_subdomain')).toBe(false);
        expect(validateSubdomain('Invalid-Subdomain')).toBe(false);
        expect(validateSubdomain('-invalid')).toBe(false);
        expect(validateSubdomain('invalid-')).toBe(false);
        expect(validateSubdomain('a'.repeat(64))).toBe(false);
      });
    });

    describe('validateEmail', () => {
      it('should validate correct emails', () => {
        expect(validateEmail('user@example.com')).toBe(true);
        expect(validateEmail('test.email@domain.co.uk')).toBe(true);
        expect(validateEmail('user+tag@example.org')).toBe(true);
      });

      it('should reject invalid emails', () => {
        expect(validateEmail('invalid-email')).toBe(false);
        expect(validateEmail('user@')).toBe(false);
        expect(validateEmail('@domain.com')).toBe(false);
        expect(validateEmail('user space@domain.com')).toBe(false);
      });
    });

    describe('validateUrl', () => {
      it('should validate correct URLs', () => {
        expect(validateUrl('https://example.com')).toBe(true);
        expect(validateUrl('http://localhost:3000')).toBe(true);
        expect(validateUrl('https://sub.domain.co.uk/path')).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(validateUrl('not-a-url')).toBe(false);
        expect(validateUrl('https://')).toBe(false);
        expect(validateUrl('')).toBe(false);
      });
    });
  });
});