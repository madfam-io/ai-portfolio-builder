'use client';

import {
  Portfolio,
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
  Project,
  Experience,
  Education,
  Skill,
  EnhancedProject,
  EnhancedExperience,
  TemplateCustomization,
} from '@/types/portfolio';

// Mock data for development
const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    userId: 'user-1',
    name: 'John Doe',
    title: 'Full Stack Developer',
    bio: 'Passionate developer with 5+ years of experience building web applications. Specialized in React, Node.js, and cloud technologies.',
    tagline: 'Building the future, one line of code at a time',
    avatarUrl: '',
    contact: {
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      availability: 'Available for freelance projects',
    },
    social: {
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      twitter: 'https://twitter.com/johndoe',
    },
    experience: [
      {
        id: 'exp-1',
        company: 'Tech Company Inc',
        position: 'Senior Full Stack Developer',
        startDate: '2021-01',
        current: true,
        description:
          'Leading development of modern web applications using React and Node.js',
        highlights: [
          'Led a team of 4 developers',
          'Improved application performance by 40%',
          'Implemented CI/CD pipelines',
        ],
        technologies: ['React', 'Node.js', 'TypeScript', 'AWS'],
      },
      {
        id: 'exp-2',
        company: 'Startup XYZ',
        position: 'Frontend Developer',
        startDate: '2019-03',
        endDate: '2020-12',
        current: false,
        description:
          'Developed responsive web applications and mobile interfaces',
        highlights: [
          'Built from scratch a customer portal',
          'Reduced loading time by 60%',
        ],
        technologies: ['React', 'Redux', 'SASS'],
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'University of Technology',
        degree: 'Bachelor',
        field: 'Computer Science',
        startDate: '2015-09',
        endDate: '2019-06',
        current: false,
        achievements: ['Magna Cum Laude', "Dean's List"],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'E-commerce Platform',
        description:
          'A full-featured e-commerce platform built with React and Node.js',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
        highlights: [
          'Supports multiple payment methods',
          'Real-time inventory management',
          'Mobile-responsive design',
        ],
        featured: true,
        order: 1,
        projectUrl: 'https://example-ecommerce.com',
        githubUrl: 'https://github.com/johndoe/ecommerce',
      },
      {
        id: 'proj-2',
        title: 'Task Management App',
        description:
          'A collaborative task management application with real-time updates',
        technologies: ['Vue.js', 'Firebase', 'Vuetify'],
        highlights: [
          'Real-time collaboration',
          'Drag-and-drop interface',
          'Team management features',
        ],
        featured: false,
        order: 2,
        projectUrl: 'https://taskapp-demo.com',
        githubUrl: 'https://github.com/johndoe/taskapp',
      },
    ],
    skills: [
      {
        name: 'JavaScript',
        level: 'expert',
        category: 'Programming Languages',
      },
      {
        name: 'TypeScript',
        level: 'advanced',
        category: 'Programming Languages',
      },
      {
        name: 'Python',
        level: 'intermediate',
        category: 'Programming Languages',
      },
      { name: 'React', level: 'expert', category: 'Frontend' },
      { name: 'Vue.js', level: 'advanced', category: 'Frontend' },
      { name: 'Node.js', level: 'advanced', category: 'Backend' },
      { name: 'PostgreSQL', level: 'intermediate', category: 'Database' },
      { name: 'AWS', level: 'intermediate', category: 'Cloud' },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        issueDate: '2023-03',
        expiryDate: '2026-03',
        credentialId: 'AWS-DEV-2023-001',
        credentialUrl: 'https://aws.amazon.com/verification',
      },
    ],
    template: 'developer',
    customization: {
      primaryColor: '#1a73e8',
      secondaryColor: '#34a853',
      accentColor: '#ea4335',
      fontFamily: 'Inter',
      headerStyle: 'minimal',
      sectionOrder: [
        'about',
        'experience',
        'projects',
        'skills',
        'education',
        'certifications',
      ],
      hiddenSections: [],
    },
    aiSettings: {
      enhanceBio: true,
      enhanceProjectDescriptions: true,
      generateSkillsFromExperience: false,
      tone: 'professional',
      targetLength: 'detailed',
    },
    status: 'draft',
    subdomain: 'johndoe',
    views: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
];

/**
 * Portfolio service for managing portfolio data
 * This is a mock implementation for development
 */
export class PortfolioService {
  private static instance: PortfolioService;
  private portfolios: Portfolio[] = [...mockPortfolios];

  static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  /**
   * Get all portfolios for a user
   */
  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    // Simulate API delay
    await this.delay(300);
    return this.portfolios.filter(p => p.userId === userId);
  }

  /**
   * Get a specific portfolio by ID
   */
  async getPortfolio(id: string): Promise<Portfolio | null> {
    await this.delay(200);
    return this.portfolios.find(p => p.id === id) || null;
  }

  /**
   * Create a new portfolio
   */
  async createPortfolio(
    data: CreatePortfolioDTO & { userId: string }
  ): Promise<Portfolio> {
    await this.delay(500);

    const newPortfolio: Portfolio = {
      id: `portfolio-${Date.now()}`,
      userId: data.userId,
      name: data.name,
      title: data.title,
      bio: data.bio || '',
      contact: {
        email: '',
        location: '',
      },
      social: {},
      experience: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
      template: data.template,
      customization: {
        primaryColor: '#1a73e8',
        secondaryColor: '#34a853',
        accentColor: '#ea4335',
        fontFamily: 'Inter',
        headerStyle: 'minimal',
        sectionOrder: [
          'about',
          'experience',
          'projects',
          'skills',
          'education',
          'certifications',
        ],
        hiddenSections: [],
      },
      aiSettings: {
        enhanceBio: true,
        enhanceProjectDescriptions: true,
        generateSkillsFromExperience: false,
        tone: 'professional',
        targetLength: 'detailed',
      },
      status: 'draft',
      subdomain: this.generateSubdomain(data.name),
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.portfolios.push(newPortfolio);
    return newPortfolio;
  }

  /**
   * Update an existing portfolio
   */
  async updatePortfolio(
    id: string,
    data: UpdatePortfolioDTO
  ): Promise<Portfolio | null> {
    await this.delay(400);

    const index = this.portfolios.findIndex(p => p.id === id);
    if (index === -1) return null;

    const current = this.portfolios[index];
    if (!current) return null;

    // Build updated portfolio with type safety
    const updated: Portfolio = {
      id: current.id,
      userId: current.userId,
      name: data.name ?? current.name,
      title: data.title ?? current.title,
      bio: data.bio ?? current.bio,
      tagline: data.tagline ?? current.tagline,
      avatarUrl: data.avatarUrl ?? current.avatarUrl,
      contact: data.contact ?? current.contact,
      social: data.social ?? current.social,
      experience: data.experience ?? current.experience,
      education: data.education ?? current.education,
      projects: data.projects ?? current.projects,
      skills: data.skills ?? current.skills,
      certifications: data.certifications ?? current.certifications,
      template: data.template ?? current.template,
      customization: data.customization ?? current.customization,
      aiSettings: data.aiSettings ?? current.aiSettings,
      status: data.status ?? current.status,
      subdomain: current.subdomain,
      customDomain: current.customDomain,
      views: current.views,
      lastViewedAt: current.lastViewedAt,
      createdAt: current.createdAt,
      updatedAt: new Date(),
      publishedAt: data.publishedAt ?? current.publishedAt,
    };

    this.portfolios[index] = updated;
    return updated;
  }

  /**
   * Delete a portfolio
   */
  async deletePortfolio(id: string): Promise<boolean> {
    await this.delay(300);

    const index = this.portfolios.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.portfolios.splice(index, 1);
    return true;
  }

  /**
   * Publish a portfolio
   */
  async publishPortfolio(id: string): Promise<Portfolio | null> {
    const index = this.portfolios.findIndex(p => p.id === id);
    if (index === -1) return null;

    const current = this.portfolios[index];
    if (!current) return null;

    const updated: Portfolio = {
      id: current.id,
      userId: current.userId,
      name: current.name,
      title: current.title,
      bio: current.bio,
      tagline: current.tagline,
      avatarUrl: current.avatarUrl,
      contact: current.contact,
      social: current.social,
      experience: current.experience,
      education: current.education,
      projects: current.projects,
      skills: current.skills,
      certifications: current.certifications,
      template: current.template,
      customization: current.customization,
      aiSettings: current.aiSettings,
      status: 'published',
      subdomain: current.subdomain,
      customDomain: current.customDomain,
      views: current.views,
      lastViewedAt: current.lastViewedAt,
      createdAt: current.createdAt,
      updatedAt: new Date(),
      publishedAt: new Date(),
    };

    this.portfolios[index] = updated;
    return updated;
  }

  /**
   * Unpublish a portfolio
   */
  async unpublishPortfolio(id: string): Promise<Portfolio | null> {
    const portfolio = await this.updatePortfolio(id, {
      status: 'draft',
    });

    return portfolio;
  }

  /**
   * Get portfolio analytics
   */
  async getPortfolioAnalytics(id: string): Promise<{
    views: number;
    uniqueVisitors: number;
    topPages: string[];
    referrers: string[];
  } | null> {
    await this.delay(200);

    const portfolio = this.portfolios.find(p => p.id === id);
    if (!portfolio) return null;

    return {
      views: portfolio.views || 0,
      uniqueVisitors: Math.floor((portfolio.views || 0) * 0.7),
      topPages: ['/', '/projects', '/experience'],
      referrers: ['direct', 'linkedin.com', 'github.com'],
    };
  }

  /**
   * Clone a portfolio
   */
  async clonePortfolio(
    id: string,
    newName: string,
    userId: string
  ): Promise<Portfolio | null> {
    const original = await this.getPortfolio(id);
    if (!original) return null;

    const cloned: Portfolio = {
      ...original,
      id: `portfolio-${Date.now()}`,
      userId,
      name: newName,
      subdomain: this.generateSubdomain(newName),
      status: 'draft',
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: undefined,
    };

    this.portfolios.push(cloned);
    return cloned;
  }

  /**
   * Search portfolios by keywords
   */
  async searchPortfolios(query: string, userId: string): Promise<Portfolio[]> {
    await this.delay(300);

    const userPortfolios = this.portfolios.filter(p => p.userId === userId);

    if (!query.trim()) return userPortfolios;

    return userPortfolios.filter(
      portfolio =>
        portfolio.name.toLowerCase().includes(query.toLowerCase()) ||
        portfolio.title.toLowerCase().includes(query.toLowerCase()) ||
        portfolio.bio.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Generate a unique subdomain from name
   */
  private generateSubdomain(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);

    const timestamp = Date.now().toString().slice(-4);
    return `${base}${timestamp}`;
  }

  /**
   * Add or update a project
   */
  async upsertProject(
    portfolioId: string,
    project: Partial<EnhancedProject>
  ): Promise<EnhancedProject | null> {
    await this.delay(300);

    const portfolioIndex = this.portfolios.findIndex(p => p.id === portfolioId);
    if (portfolioIndex === -1) return null;

    const portfolio = this.portfolios[portfolioIndex];
    if (!portfolio) return null;

    const newProject: Project = {
      id: project.id || `proj-${Date.now()}`,
      title: project.title || '',
      description: project.description || '',
      imageUrl: project.imageUrl,
      projectUrl: project.projectUrl,
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl,
      technologies: project.technologies || [],
      highlights: project.highlights || [],
      featured: project.featured || false,
      order: project.order || 0,
    };

    const existingIndex = portfolio.projects.findIndex(
      p => p.id === newProject.id
    );
    if (existingIndex >= 0) {
      portfolio.projects[existingIndex] = newProject;
    } else {
      portfolio.projects.push(newProject);
    }

    portfolio.updatedAt = new Date();
    this.portfolios[portfolioIndex] = portfolio;

    return {
      ...newProject,
      shortDescription: project.shortDescription,
      role: project.role,
      demoUrl: project.demoUrl,
      images: project.images,
      challenges: project.challenges,
      solutions: project.solutions,
      impact: project.impact,
      startDate: project.startDate,
      endDate: project.endDate,
      isCurrent: project.isCurrent,
      aiEnhanced: project.aiEnhanced,
      aiEnhancementDate: project.aiEnhancementDate,
    };
  }

  /**
   * Delete a project
   */
  async deleteProject(
    portfolioId: string,
    projectId: string
  ): Promise<boolean> {
    await this.delay(200);

    const portfolioIndex = this.portfolios.findIndex(p => p.id === portfolioId);
    if (portfolioIndex === -1) return false;

    const portfolio = this.portfolios[portfolioIndex];
    if (!portfolio) return false;

    const projectIndex = portfolio.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return false;

    portfolio.projects.splice(projectIndex, 1);
    portfolio.updatedAt = new Date();
    this.portfolios[portfolioIndex] = portfolio;

    return true;
  }

  /**
   * Add or update experience
   */
  async upsertExperience(
    portfolioId: string,
    experience: Partial<EnhancedExperience>
  ): Promise<EnhancedExperience | null> {
    await this.delay(300);

    const portfolioIndex = this.portfolios.findIndex(p => p.id === portfolioId);
    if (portfolioIndex === -1) return null;

    const portfolio = this.portfolios[portfolioIndex];
    if (!portfolio) return null;

    const newExperience: Experience = {
      id: experience.id || `exp-${Date.now()}`,
      company: experience.company || '',
      position: experience.position || '',
      startDate: experience.startDate || '',
      endDate: experience.endDate,
      current: experience.current || false,
      description: experience.description || '',
      highlights: experience.highlights || [],
      technologies: experience.technologies || [],
    };

    const existingIndex = portfolio.experience.findIndex(
      e => e.id === newExperience.id
    );
    if (existingIndex >= 0) {
      portfolio.experience[existingIndex] = newExperience;
    } else {
      portfolio.experience.push(newExperience);
    }

    portfolio.updatedAt = new Date();
    this.portfolios[portfolioIndex] = portfolio;

    return {
      ...newExperience,
      employmentType: experience.employmentType,
      responsibilities: experience.responsibilities,
      achievements: experience.achievements,
      aiEnhanced: experience.aiEnhanced,
      aiEnhancementDate: experience.aiEnhancementDate,
    };
  }

  /**
   * Delete an experience
   */
  async deleteExperience(
    portfolioId: string,
    experienceId: string
  ): Promise<boolean> {
    await this.delay(200);

    const portfolioIndex = this.portfolios.findIndex(p => p.id === portfolioId);
    if (portfolioIndex === -1) return false;

    const portfolio = this.portfolios[portfolioIndex];
    if (!portfolio) return false;

    const experienceIndex = portfolio.experience.findIndex(
      e => e.id === experienceId
    );
    if (experienceIndex === -1) return false;

    portfolio.experience.splice(experienceIndex, 1);
    portfolio.updatedAt = new Date();
    this.portfolios[portfolioIndex] = portfolio;

    return true;
  }

  /**
   * Add or update education
   */
  async upsertEducation(
    portfolioId: string,
    education: Partial<Education>
  ): Promise<Education | null> {
    await this.delay(300);

    const portfolioIndex = this.portfolios.findIndex(p => p.id === portfolioId);
    if (portfolioIndex === -1) return null;

    const portfolio = this.portfolios[portfolioIndex];
    if (!portfolio) return null;

    const newEducation: Education = {
      id: education.id || `edu-${Date.now()}`,
      institution: education.institution || '',
      degree: education.degree || '',
      field: education.field || '',
      startDate: education.startDate || '',
      endDate: education.endDate,
      current: education.current || false,
      description: education.description,
      achievements: education.achievements || [],
    };

    const existingIndex = portfolio.education.findIndex(
      e => e.id === newEducation.id
    );
    if (existingIndex >= 0) {
      portfolio.education[existingIndex] = newEducation;
    } else {
      portfolio.education.push(newEducation);
    }

    portfolio.updatedAt = new Date();
    this.portfolios[portfolioIndex] = portfolio;

    return newEducation;
  }

  /**
   * Add or update skill
   */
  async upsertSkill(
    portfolioId: string,
    skill: Partial<Skill>
  ): Promise<Skill | null> {
    await this.delay(200);

    const portfolioIndex = this.portfolios.findIndex(p => p.id === portfolioId);
    if (portfolioIndex === -1) return null;

    const portfolio = this.portfolios[portfolioIndex];
    if (!portfolio) return null;

    const newSkill: Skill = {
      name: skill.name || '',
      level: skill.level,
      category: skill.category,
    };

    const existingIndex = portfolio.skills.findIndex(
      s => s.name === newSkill.name
    );
    if (existingIndex >= 0) {
      portfolio.skills[existingIndex] = newSkill;
    } else {
      portfolio.skills.push(newSkill);
    }

    portfolio.updatedAt = new Date();
    this.portfolios[portfolioIndex] = portfolio;

    return newSkill;
  }

  /**
   * Delete a skill
   */
  async deleteSkill(portfolioId: string, skillName: string): Promise<boolean> {
    await this.delay(200);

    const portfolioIndex = this.portfolios.findIndex(p => p.id === portfolioId);
    if (portfolioIndex === -1) return false;

    const portfolio = this.portfolios[portfolioIndex];
    if (!portfolio) return false;

    const skillIndex = portfolio.skills.findIndex(s => s.name === skillName);
    if (skillIndex === -1) return false;

    portfolio.skills.splice(skillIndex, 1);
    portfolio.updatedAt = new Date();
    this.portfolios[portfolioIndex] = portfolio;

    return true;
  }

  /**
   * Check subdomain availability
   */
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    await this.delay(100);

    const existing = this.portfolios.find(p => p.subdomain === subdomain);
    return !existing;
  }

  /**
   * Update portfolio subdomain
   */
  async updateSubdomain(
    portfolioId: string,
    subdomain: string
  ): Promise<boolean> {
    await this.delay(200);

    // Check availability first
    const isAvailable = await this.checkSubdomainAvailability(subdomain);
    if (!isAvailable) return false;

    const portfolioIndex = this.portfolios.findIndex(p => p.id === portfolioId);
    if (portfolioIndex === -1) return false;

    const portfolio = this.portfolios[portfolioIndex];
    if (!portfolio) return false;

    portfolio.subdomain = subdomain;
    portfolio.updatedAt = new Date();
    this.portfolios[portfolioIndex] = portfolio;

    return true;
  }

  /**
   * Get portfolio by subdomain (for public viewing)
   */
  async getPortfolioBySubdomain(subdomain: string): Promise<Portfolio | null> {
    await this.delay(200);

    const portfolio = this.portfolios.find(
      p => p.subdomain === subdomain && p.status === 'published'
    );

    if (portfolio) {
      // Increment view count
      portfolio.views = (portfolio.views || 0) + 1;
      portfolio.lastViewedAt = new Date();
    }

    return portfolio || null;
  }

  /**
   * Update portfolio template and preserve data
   */
  async updateTemplate(
    portfolioId: string,
    template: string
  ): Promise<Portfolio | null> {
    await this.delay(300);

    const portfolioIndex = this.portfolios.findIndex(p => p.id === portfolioId);
    if (portfolioIndex === -1) return null;

    const portfolio = this.portfolios[portfolioIndex];
    if (!portfolio) return null;

    // Update template while preserving existing data
    portfolio.template = template as any;
    const defaultTheme = this.getDefaultThemeForTemplate(template);
    portfolio.customization = {
      ...portfolio.customization,
      ...(defaultTheme || {}),
    };
    portfolio.updatedAt = new Date();

    this.portfolios[portfolioIndex] = portfolio;
    return portfolio;
  }

  /**
   * Reorder items (projects, experiences, etc.)
   */
  async reorderItems(
    portfolioId: string,
    itemType: 'projects' | 'experience' | 'education' | 'skills',
    itemIds: string[]
  ): Promise<boolean> {
    await this.delay(200);

    const portfolioIndex = this.portfolios.findIndex(p => p.id === portfolioId);
    if (portfolioIndex === -1) return false;

    const portfolio = this.portfolios[portfolioIndex];
    if (!portfolio) return false;

    if (itemType === 'projects') {
      const reorderedProjects = itemIds
        .map(id => portfolio.projects.find(p => p.id === id))
        .filter(Boolean) as Project[];

      // Update order property
      reorderedProjects.forEach((project, index) => {
        project.order = index;
      });

      portfolio.projects = reorderedProjects;
    }

    portfolio.updatedAt = new Date();
    this.portfolios[portfolioIndex] = portfolio;

    return true;
  }

  /**
   * Auto-save portfolio changes
   */
  async autoSave(
    portfolioId: string,
    changes: Partial<UpdatePortfolioDTO>
  ): Promise<boolean> {
    // Don't show delay for auto-save to feel instant
    const portfolio = await this.updatePortfolio(portfolioId, changes);
    return !!portfolio;
  }

  /**
   * Get template-specific default theme
   */
  private getDefaultThemeForTemplate(
    template: string
  ): Partial<TemplateCustomization> {
    const themes: Record<string, Partial<TemplateCustomization>> = {
      developer: {
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        accentColor: '#10b981',
        fontFamily: 'Inter',
        darkMode: true,
      },
      designer: {
        primaryColor: '#ec4899',
        secondaryColor: '#f97316',
        accentColor: '#8b5cf6',
        fontFamily: 'Poppins',
        darkMode: false,
      },
      business: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        accentColor: '#10b981',
        fontFamily: 'Open Sans',
        darkMode: false,
      },
      consultant: {
        primaryColor: '#059669',
        secondaryColor: '#0d9488',
        accentColor: '#0ea5e9',
        fontFamily: 'Inter',
        darkMode: false,
      },
      creative: {
        primaryColor: '#7c3aed',
        secondaryColor: '#c026d3',
        accentColor: '#f59e0b',
        fontFamily: 'Poppins',
        darkMode: false,
      },
      educator: {
        primaryColor: '#dc2626',
        secondaryColor: '#ea580c',
        accentColor: '#059669',
        fontFamily: 'Open Sans',
        darkMode: false,
      },
    };

    return themes[template] ?? themes.developer ?? {};
  }

  /**
   * Simulate API delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const portfolioService = PortfolioService.getInstance();
