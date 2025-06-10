/**
 * Portfolio Service Layer
 *
 * Handles all portfolio-related business logic and data operations
 */
// @ts-nocheck

import { createClient } from '@/lib/supabase/client';
import {
  Portfolio,
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
  Education,
  Skill,
  PortfolioSection,
  EnhancedProject,
  EnhancedExperience,
} from '@/types/portfolio';

export class PortfolioService {
  private supabase = createClient();

  /**
   * Create a new portfolio
   */
  async createPortfolio(
    userId: string,
    data: CreatePortfolioDTO
  ): Promise<Portfolio> {
    try {
      // Generate a unique slug
      const slug = await this.generateUniqueSlug(data.name);

      const { data: portfolio, error } = await this.supabase
        .from('portfolios')
        .insert({
          user_id: userId,
          name: data.name,
          title: data.title,
          bio: data.bio || '',
          template: data.template,
          slug,
          theme: this.getDefaultThemeForTemplate(data.template),
          social_links: {},
        })
        .select()
        .single();

      if (error || !portfolio)
        throw error || new Error('Failed to create portfolio');

      // Create default sections based on template
      if (portfolio?.id) {
        await this.createDefaultSections(portfolio.id, data.template);
      }

      return this.mapToPortfolio(portfolio);
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw new Error('Failed to create portfolio');
    }
  }

  /**
   * Get portfolio by ID
   */
  async getPortfolioById(portfolioId: string): Promise<Portfolio | null> {
    try {
      const { data, error } = await this.supabase
        .from('portfolios')
        .select(
          `
          *,
          portfolio_sections(*),
          portfolio_projects(*),
          portfolio_experiences(*),
          portfolio_education(*),
          portfolio_skills(*)
        `
        )
        .eq('id', portfolioId)
        .single();

      if (error || !data) return null;

      return this.mapToPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      return null;
    }
  }

  /**
   * Get portfolio by slug (for public viewing)
   */
  async getPortfolioBySlug(slug: string): Promise<Portfolio | null> {
    try {
      const { data, error } = await this.supabase
        .from('portfolios')
        .select(
          `
          *,
          portfolio_sections(*),
          portfolio_projects(*),
          portfolio_experiences(*),
          portfolio_education(*),
          portfolio_skills(*)
        `
        )
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error || !data) return null;

      // Increment view count
      await this.incrementViewCount(data.id);

      return this.mapToPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio by slug:', error);
      return null;
    }
  }

  /**
   * Get all portfolios for a user
   */
  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    try {
      const { data, error } = await this.supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data.map(p => this.mapToPortfolio(p));
    } catch (error) {
      console.error('Error fetching user portfolios:', error);
      return [];
    }
  }

  /**
   * Update portfolio
   */
  async updatePortfolio(
    portfolioId: string,
    updates: UpdatePortfolioDTO
  ): Promise<Portfolio | null> {
    try {
      const { data, error } = await this.supabase
        .from('portfolios')
        .update({
          name: updates.name,
          title: updates.title,
          bio: updates.bio,
          tagline: updates.tagline,
          avatar_url: updates.avatarUrl,
          email: updates.contact?.email,
          phone: updates.contact?.phone,
          location: updates.contact?.location,
          social_links: updates.social,
          template: updates.template,
          theme: updates.customization,
          status: updates.status,
          published_at: updates.publishedAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', portfolioId)
        .select()
        .single();

      if (error) throw error;

      return this.mapToPortfolio(data);
    } catch (error) {
      console.error('Error updating portfolio:', error);
      return null;
    }
  }

  /**
   * Delete portfolio
   */
  async deletePortfolio(portfolioId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      return false;
    }
  }

  /**
   * Publish/Unpublish portfolio
   */
  async togglePublishStatus(
    portfolioId: string,
    publish: boolean
  ): Promise<boolean> {
    try {
      const updates: any = {
        is_published: publish,
        updated_at: new Date().toISOString(),
      };

      if (publish) {
        updates.published_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('portfolios')
        .update(updates)
        .eq('id', portfolioId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error toggling publish status:', error);
      return false;
    }
  }

  /**
   * Add or update a project
   */
  async upsertProject(
    portfolioId: string,
    project: Partial<EnhancedProject>
  ): Promise<EnhancedProject | null> {
    try {
      const projectData = {
        portfolio_id: portfolioId,
        title: project.title,
        description: project.description,
        short_description: project.shortDescription,
        role: project.role,
        project_url: project.projectUrl,
        github_url: project.githubUrl,
        demo_url: project.demoUrl,
        live_url: project.liveUrl,
        thumbnail_url: project.imageUrl,
        images: project.images || [],
        technologies: project.technologies || [],
        features: project.highlights || [],
        challenges: project.challenges,
        solutions: project.solutions,
        impact: project.impact,
        start_date: project.startDate,
        end_date: project.endDate,
        is_current: project.isCurrent,
        is_featured: project.featured,
        order_index: project.order || 0,
      };

      const { data, error } = await this.supabase
        .from('portfolio_projects')
        .upsert({
          id: project.id,
          ...projectData,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToProject(data);
    } catch (error) {
      console.error('Error upserting project:', error);
      return null;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  /**
   * Add or update experience
   */
  async upsertExperience(
    portfolioId: string,
    experience: Partial<EnhancedExperience>
  ): Promise<EnhancedExperience | null> {
    try {
      const experienceData = {
        portfolio_id: portfolioId,
        company: experience.company,
        position: experience.position,
        description: experience.description,
        location: experience.location,
        employment_type: experience.employmentType,
        start_date: experience.startDate,
        end_date: experience.endDate,
        is_current: experience.current,
        responsibilities: experience.responsibilities || [],
        achievements: experience.achievements || [],
        technologies: experience.technologies || [],
      };

      const { data, error } = await this.supabase
        .from('portfolio_experiences')
        .upsert({
          id: experience.id,
          ...experienceData,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToExperience(data);
    } catch (error) {
      console.error('Error upserting experience:', error);
      return null;
    }
  }

  /**
   * Update portfolio sections
   */
  async updateSection(
    sectionId: string,
    updates: Partial<PortfolioSection>
  ): Promise<PortfolioSection | null> {
    try {
      const { data, error } = await this.supabase
        .from('portfolio_sections')
        .update({
          title: updates.title,
          subtitle: updates.subtitle,
          content: updates.content,
          is_visible: updates.isVisible,
          order_index: updates.orderIndex,
          layout: updates.layout,
          styles: updates.styles,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sectionId)
        .select()
        .single();

      if (error) throw error;

      return this.mapToSection(data);
    } catch (error) {
      console.error('Error updating section:', error);
      return null;
    }
  }

  /**
   * Reorder sections
   */
  async reorderSections(
    portfolioId: string,
    sectionIds: string[]
  ): Promise<boolean> {
    try {
      const updates = sectionIds.map((id, index) => ({
        id,
        portfolio_id: portfolioId,
        order_index: index,
      }));

      const { error } = await this.supabase
        .from('portfolio_sections')
        .upsert(updates);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error reordering sections:', error);
      return false;
    }
  }

  /**
   * Check subdomain availability
   */
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('portfolios')
        .select('id')
        .eq('subdomain', subdomain)
        .single();

      if (error && error.code === 'PGRST116') {
        // No results found, subdomain is available
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking subdomain:', error);
      return false;
    }
  }

  /**
   * Update portfolio subdomain
   */
  async updateSubdomain(
    portfolioId: string,
    subdomain: string
  ): Promise<boolean> {
    try {
      // Validate subdomain format
      const subdomainRegex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
      if (!subdomainRegex.test(subdomain)) {
        throw new Error('Invalid subdomain format');
      }

      // Check availability
      const isAvailable = await this.checkSubdomainAvailability(subdomain);
      if (!isAvailable) {
        throw new Error('Subdomain is already taken');
      }

      const { error } = await this.supabase
        .from('portfolios')
        .update({ subdomain })
        .eq('id', portfolioId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating subdomain:', error);
      return false;
    }
  }

  // Private helper methods

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data } = await this.supabase
        .from('portfolios')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!data) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private getDefaultThemeForTemplate(template: string): any {
    const themes: Record<string, any> = {
      developer: {
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        accentColor: '#10b981',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Inter',
        darkMode: true,
      },
      designer: {
        primaryColor: '#ec4899',
        secondaryColor: '#f97316',
        accentColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Poppins',
        darkMode: false,
      },
      business: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        accentColor: '#10b981',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Open Sans',
        darkMode: false,
      },
    };

    return themes[template] || themes.developer;
  }

  private async createDefaultSections(portfolioId: string, template: string) {
    const sections = this.getDefaultSectionsForTemplate(template);

    for (let i = 0; i < sections.length; i++) {
      await this.supabase.from('portfolio_sections').insert({
        portfolio_id: portfolioId,
        type: sections[i].type,
        title: sections[i].title,
        content: sections[i].content || {},
        is_visible: true,
        order_index: i,
      });
    }
  }

  private getDefaultSectionsForTemplate(template: string): any[] {
    const commonSections = [
      { type: 'hero', title: 'Hero' },
      { type: 'about', title: 'About Me' },
      { type: 'experience', title: 'Experience' },
      { type: 'projects', title: 'Projects' },
      { type: 'skills', title: 'Skills' },
      { type: 'contact', title: 'Contact' },
    ];

    const templateSections: Record<string, any[]> = {
      developer: commonSections,
      designer: [
        ...commonSections.slice(0, 3),
        { type: 'projects', title: 'Portfolio' },
        ...commonSections.slice(4),
      ],
      business: [
        ...commonSections.slice(0, 3),
        { type: 'testimonials', title: 'Testimonials' },
        ...commonSections.slice(3),
      ],
    };

    return templateSections[template] || commonSections;
  }

  private async incrementViewCount(portfolioId: string) {
    await this.supabase.rpc('increment_portfolio_views', {
      portfolio_id: portfolioId,
    });
  }

  // Mapping functions

  private mapToPortfolio(data: any): Portfolio {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      title: data.title || '',
      bio: data.bio || '',
      tagline: data.subtitle,
      avatarUrl: data.avatar_url,
      contact: {
        email: data.email,
        phone: data.phone,
        location: data.location,
      },
      social: data.social_links || {},
      experience:
        data.portfolio_experiences?.map((e: any) => this.mapToExperience(e)) ||
        [],
      education:
        data.portfolio_education?.map((e: any) => this.mapToEducation(e)) || [],
      projects:
        data.portfolio_projects?.map((p: any) => this.mapToProject(p)) || [],
      skills: data.portfolio_skills?.map((s: any) => this.mapToSkill(s)) || [],
      certifications: [],
      template: data.template,
      customization: data.theme || {},
      status: data.is_published ? 'published' : 'draft',
      subdomain: data.subdomain,
      customDomain: data.custom_domain,
      views: data.view_count,
      lastViewedAt: data.last_viewed_at
        ? new Date(data.last_viewed_at)
        : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
    };
  }

  private mapToProject(data: any): EnhancedProject {
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      shortDescription: data.short_description,
      role: data.role,
      imageUrl: data.thumbnail_url,
      images: data.images || [],
      projectUrl: data.project_url,
      liveUrl: data.live_url || data.demo_url,
      githubUrl: data.github_url,
      demoUrl: data.demo_url,
      technologies: data.technologies || [],
      highlights: data.features || [],
      challenges: data.challenges,
      solutions: data.solutions,
      impact: data.impact,
      featured: data.is_featured || false,
      order: data.order_index || 0,
      startDate: data.start_date ? new Date(data.start_date) : undefined,
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      isCurrent: data.is_current,
      aiEnhanced: data.ai_enhanced,
      aiEnhancementDate: data.ai_enhancement_date
        ? new Date(data.ai_enhancement_date)
        : undefined,
    };
  }

  private mapToExperience(data: any): EnhancedExperience {
    return {
      id: data.id,
      company: data.company,
      position: data.position,
      startDate: data.start_date,
      endDate: data.end_date,
      current: data.is_current || false,
      description: data.description || '',
      location: data.location,
      employmentType: data.employment_type,
      highlights: data.achievements || [],
      technologies: data.technologies || [],
      responsibilities: data.responsibilities || [],
      achievements: data.achievements || [],
      aiEnhanced: data.ai_enhanced,
      aiEnhancementDate: data.ai_enhancement_date
        ? new Date(data.ai_enhancement_date)
        : undefined,
    };
  }

  private mapToEducation(data: any): Education {
    return {
      id: data.id,
      institution: data.institution,
      degree: data.degree || '',
      field: data.field_of_study || '',
      startDate: data.start_date,
      endDate: data.end_date,
      current: data.is_current || false,
      description: data.description,
      achievements: data.honors || [],
    };
  }

  private mapToSkill(data: any): Skill {
    return {
      name: data.name,
      level: this.mapProficiencyToLevel(data.proficiency),
      category: data.category,
    };
  }

  private mapProficiencyToLevel(proficiency?: number): Skill['level'] {
    if (!proficiency) return undefined;
    if (proficiency <= 1) return 'beginner';
    if (proficiency <= 2) return 'intermediate';
    if (proficiency <= 4) return 'advanced';
    return 'expert';
  }

  private mapToSection(data: any): PortfolioSection {
    return {
      id: data.id,
      portfolioId: data.portfolio_id,
      type: data.type,
      title: data.title,
      subtitle: data.subtitle,
      content: data.content || {},
      isVisible: data.is_visible,
      orderIndex: data.order_index,
      layout: data.layout,
      styles: data.styles,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

// Export a singleton instance
export const portfolioService = new PortfolioService();
