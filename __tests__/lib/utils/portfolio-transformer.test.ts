import React from 'react';
l<Portfolio> = {
        name: 'Portfolio',
        views: 0,
      };

      const result = transformApiPortfolioToDb(apiPortfolio);

      expect(result.views).toBe(0);
    });
  });

  describe('transformDbPortfoliosToApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

    it('should batch transform multiple portfolios', async () => {
      const dbPortfolios = [
        {
          id: 'portfolio-1',
          user_id: 'user-1',
          name: 'Portfolio 1',
          template: 'developer',
          status: 'published',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          data: { title: 'Developer 1' },
        },
        {
          id: 'portfolio-2',
          user_id: 'user-2',
          name: 'Portfolio 2',
          template: 'designer',
          status: 'draft',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          data: { title: 'Designer 1' },
        },
      ];

      const results = transformDbPortfoliosToApi(dbPortfolios);

      expect(results).toHaveLength(2);
      expect(results[0]).toMatchObject({
        id: 'portfolio-1',
        userId: 'user-1',
        name: 'Portfolio 1',
        title: 'Developer 1',
        template: 'developer',
        status: 'published',
      });
      expect(results[1]).toMatchObject({
        id: 'portfolio-2',
        userId: 'user-2',
        name: 'Portfolio 2',
        title: 'Designer 1',
        template: 'designer',
        status: 'draft',
      });
    });

    it('should handle empty array', async () => {
      const results = transformDbPortfoliosToApi([]);
      expect(results).toEqual([]);
    });
  });

  describe('sanitizePortfolioData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

    it('should only include allowed fields', async () => {
      const data = {
        name: 'Portfolio',
        title: 'Developer',
        bio: 'Bio text',
        invalidField: 'should be removed',
        _privateField: 'should be removed',
        id: 'should be removed',
        userId: 'should be removed',
        createdAt: 'should be removed',
      };

      const result = sanitizePortfolioData(data as any);

      expect(result).toEqual({
        name: 'Portfolio',
        title: 'Developer',
        bio: 'Bio text',
      });
      expect(result).not.toHaveProperty('invalidField');
      expect(result).not.toHaveProperty('_privateField');
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('userId');
      expect(result).not.toHaveProperty('createdAt');
    });

    it('should ensure arrays are arrays', async () => {
      const data = {
        experience: 'not an array',
        education: null,
        projects: undefined,
        skills: {},
        certifications: 123,
      };

      const result = sanitizePortfolioData(data as any);

      expect(Array.isArray(result.experience)).toBe(true);
      expect(Array.isArray(result.education)).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
      expect(Array.isArray(result.skills)).toBe(true);
      expect(Array.isArray(result.certifications)).toBe(true);
    });

    it('should ensure objects are objects', async () => {
      const data = {
        contact: 'not an object',
        social: null,
        customization: [],
        aiSettings: 123,
      };

      const result = sanitizePortfolioData(data as any);

      expect(typeof result.contact).toBe('object');
      expect(typeof result.social).toBe('object');
      expect(typeof result.customization).toBe('object');
      expect(typeof result.aiSettings).toBe('object');
      expect(Array.isArray(result.contact)).toBe(false);
      expect(Array.isArray(result.social)).toBe(false);
    });

    it('should preserve valid data', async () => {
      const data = {
        name: 'Portfolio',
        template: 'developer',
        status: 'published',
        experience: [{ company: 'Tech Corp' }],
        education: [{ institution: 'University' }],
        contact: { email: 'test@example.com' },
        social: { linkedin: 'https://linkedin.com' },
        customization: { primaryColor: '#000000' },
      };

      const result = sanitizePortfolioData(data as any);

      expect(result).toEqual(data);
    });

    it('should handle all allowed fields', async () => {
      const data = {
        name: 'Test',
        title: 'Title',
        bio: 'Bio',
        tagline: 'Tagline',
        avatarUrl: 'https://example.com/avatar.jpg',
        contact: { email: 'test@test.com' },
        social: { twitter: '@test' },
        experience: [{ company: 'Company' }],
        education: [{ school: 'School' }],
        projects: [{ name: 'Project' }],
        skills: [{ name: 'Skill' }],
        certifications: [{ name: 'Cert' }],
        template: 'developer',
        customization: { theme: 'dark' },
        aiSettings: { enhance: true },
        status: 'draft',
        subdomain: 'test',
        customDomain: 'test.com',
      };

      const result = sanitizePortfolioData(data as any);

      expect(Object.keys(result).sort()).toEqual([
        'aiSettings',
        'avatarUrl',
        'bio',
        'certifications',
        'contact',
        'customDomain',
        'customization',
        'education',
        'experience',
        'name',
        'projects',
        'skills',
        'social',
        'status',
        'subdomain',
        'tagline',
        'template',
        'title',
      ]);
    });
  });
});
