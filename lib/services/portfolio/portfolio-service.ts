import { cache, CACHE_KEYS } from '@/lib/cache/redis-cache';
import { logger } from '@/lib/utils/logger';
import {
  Portfolio,
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
  TemplateCustomization,
} from '@/types/portfolio';

import { PortfolioRepository } from './portfolio.repository';

/**
 * Portfolio service for managing portfolio business logic
 * Delegates data access to repository layer
 */
export class PortfolioService {
  private repository: PortfolioRepository;

  constructor() {
    this.repository = new PortfolioRepository();
  }

  /**
   * Get all portfolios for a user
   */
  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    try {
      logger.info('Fetching user portfolios', { userId });
      return await this.repository.findByUserId(userId);
    } catch (error) {
      logger.error('Failed to fetch user portfolios', error as Error, {
        userId,
      });
      throw error;
    }
  }

  /**
   * Get a specific portfolio by ID
   */
  async getPortfolio(id: string): Promise<Portfolio | null> {
    try {
      logger.info('Fetching portfolio', { portfolioId: id });

      // Check cache first
      const cacheKey = `${CACHE_KEYS.PORTFOLIO}${id}`;
      const cached = await cache.get<Portfolio>(cacheKey);
      if (cached) {
        logger.debug('Portfolio cache hit', { portfolioId: id });
        return cached;
      }

      // Fetch from database
      const portfolio = await this.repository.findById(id);

      // Cache the result
      if (portfolio) {
        await cache.set(cacheKey, portfolio, 300); // 5 minutes
      }

      return portfolio;
    } catch (error) {
      logger.error('Failed to fetch portfolio', error as Error, {
        portfolioId: id,
      });
      throw error;
    }
  }

  /**
   * Create a new portfolio
   */
  async createPortfolio(
    data: CreatePortfolioDTO & { userId: string }
  ): Promise<Portfolio> {
    try {
      logger.info('Creating new portfolio', {
        userId: data.userId,
        name: data.name,
      });
      const portfolio = await this.repository.create(data);
      logger.info('Portfolio created successfully', {
        portfolioId: portfolio.id,
      });
      return portfolio;
    } catch (error) {
      logger.error('Failed to create portfolio', error as Error, { data });
      throw error;
    }
  }

  /**
   * Update an existing portfolio
   */
  async updatePortfolio(
    id: string,
    data: UpdatePortfolioDTO
  ): Promise<Portfolio | null> {
    try {
      logger.info('Updating portfolio', { portfolioId: id });
      const portfolio = await this.repository.update(id, data);

      if (portfolio) {
        logger.info('Portfolio updated successfully', { portfolioId: id });

        // Invalidate cache
        const cacheKey = `${CACHE_KEYS.PORTFOLIO}${id}`;
        await cache.del(cacheKey);

        // Also invalidate user portfolios cache
        await cache.clearPattern(
          `${CACHE_KEYS.PORTFOLIO}user:${portfolio.userId}:*`
        );
      } else {
        logger.warn('Portfolio not found for update', { portfolioId: id });
      }
      return portfolio;
    } catch (error) {
      logger.error('Failed to update portfolio', error as Error, {
        portfolioId: id,
      });
      throw error;
    }
  }

  /**
   * Delete a portfolio
   */
  async deletePortfolio(id: string): Promise<boolean> {
    try {
      logger.info('Deleting portfolio', { portfolioId: id });
      const result = await this.repository.delete(id);
      logger.info('Portfolio deleted successfully', { portfolioId: id });
      return result;
    } catch (error) {
      logger.error('Failed to delete portfolio', error as Error, {
        portfolioId: id,
      });
      throw error;
    }
  }

  /**
   * Publish a portfolio
   */
  async publishPortfolio(id: string): Promise<Portfolio | null> {
    try {
      logger.info('Publishing portfolio', { portfolioId: id });
      const portfolio = await this.repository.update(id, {
        status: 'published',
        publishedAt: new Date(),
      });
      if (portfolio) {
        logger.info('Portfolio published successfully', { portfolioId: id });
      }
      return portfolio;
    } catch (error) {
      logger.error('Failed to publish portfolio', error as Error, {
        portfolioId: id,
      });
      throw error;
    }
  }

  /**
   * Unpublish a portfolio
   */
  async unpublishPortfolio(id: string): Promise<Portfolio | null> {
    try {
      logger.info('Unpublishing portfolio', { portfolioId: id });
      return await this.updatePortfolio(id, { status: 'draft' });
    } catch (error) {
      logger.error('Failed to unpublish portfolio', error as Error, {
        portfolioId: id,
      });
      throw error;
    }
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
    try {
      const portfolio = await this.repository.findById(id);
      if (!portfolio) return null;

      // TODO: Implement proper analytics tracking
      return {
        views: portfolio.views || 0,
        uniqueVisitors: Math.floor((portfolio.views || 0) * 0.7),
        topPages: ['/', '/projects', '/experience'],
        referrers: ['direct', 'linkedin.com', 'github.com'],
      };
    } catch (error) {
      logger.error('Failed to get portfolio analytics', error as Error, {
        portfolioId: id,
      });
      throw error;
    }
  }

  /**
   * Clone a portfolio
   */
  async clonePortfolio(
    id: string,
    newName: string,
    userId: string
  ): Promise<Portfolio | null> {
    try {
      logger.info('Cloning portfolio', { sourceId: id, newName, userId });

      const original = await this.repository.findById(id);
      if (!original) {
        logger.warn('Source portfolio not found', { portfolioId: id });
        return null;
      }

      const clonedData: CreatePortfolioDTO & { userId: string } = {
        userId,
        name: newName,
        title: original.title,
        bio: original.bio,
        template: original.template,
      };

      const cloned = await this.repository.create(clonedData);

      // Copy all the data
      const fullClone = await this.repository.update(cloned.id, {
        tagline: original.tagline,
        avatarUrl: original.avatarUrl,
        contact: original.contact,
        social: original.social,
        experience: original.experience,
        education: original.education,
        projects: original.projects,
        skills: original.skills,
        certifications: original.certifications,
        customization: original.customization,
        aiSettings: original.aiSettings,
      });

      logger.info('Portfolio cloned successfully', {
        sourceId: id,
        clonedId: cloned.id,
      });

      return fullClone;
    } catch (error) {
      logger.error('Failed to clone portfolio', error as Error, {
        portfolioId: id,
      });
      throw error;
    }
  }

  /**
   * Search portfolios by keywords
   */
  async searchPortfolios(query: string, userId: string): Promise<Portfolio[]> {
    try {
      logger.info('Searching portfolios', { query, userId });

      const userPortfolios = await this.repository.findByUserId(userId);

      if (!query.trim()) return userPortfolios;

      return userPortfolios.filter(
        portfolio =>
          portfolio.name.toLowerCase().includes(query.toLowerCase()) ||
          portfolio.title.toLowerCase().includes(query.toLowerCase()) ||
          portfolio.bio.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      logger.error('Failed to search portfolios', error as Error, {
        query,
        userId,
      });
      throw error;
    }
  }

  /**
   * Check subdomain availability
   */
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    try {
      return await this.repository.isSubdomainAvailable(subdomain);
    } catch (error) {
      logger.error('Failed to check subdomain availability', error as Error, {
        subdomain,
      });
      throw error;
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
      const isAvailable = await this.checkSubdomainAvailability(subdomain);
      if (!isAvailable) {
        logger.warn('Subdomain not available', { subdomain });
        return false;
      }

      const updated = await this.repository.update(portfolioId, { subdomain });
      return !!updated;
    } catch (error) {
      logger.error('Failed to update subdomain', error as Error, {
        portfolioId,
        subdomain,
      });
      throw error;
    }
  }

  /**
   * Get portfolio by subdomain (for public viewing)
   */
  async getPortfolioBySubdomain(subdomain: string): Promise<Portfolio | null> {
    try {
      const portfolio = await this.repository.findBySubdomain(subdomain);

      if (portfolio) {
        // Increment view count asynchronously
        this.repository.incrementViews(portfolio.id).catch(err =>
          logger.error('Failed to increment views', err as Error, {
            portfolioId: portfolio.id,
          })
        );
      }

      return portfolio;
    } catch (error) {
      logger.error('Failed to get portfolio by subdomain', error as Error, {
        subdomain,
      });
      throw error;
    }
  }

  /**
   * Update portfolio template and preserve data
   */
  async updateTemplate(
    portfolioId: string,
    template: string
  ): Promise<Portfolio | null> {
    try {
      const defaultTheme = this.getDefaultThemeForTemplate(template);

      const updated = await this.repository.update(portfolioId, {
        template: template as any,
        customization: defaultTheme as any,
      });

      return updated;
    } catch (error) {
      logger.error('Failed to update template', error as Error, {
        portfolioId,
        template,
      });
      throw error;
    }
  }

  /**
   * Auto-save portfolio changes
   */
  async autoSave(
    portfolioId: string,
    changes: Partial<UpdatePortfolioDTO>
  ): Promise<boolean> {
    try {
      const portfolio = await this.repository.update(portfolioId, changes);
      return !!portfolio;
    } catch (error) {
      logger.error('Auto-save failed', error as Error, { portfolioId });
      return false;
    }
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
}

// Export singleton instance for backward compatibility
export const portfolioService = new PortfolioService();
