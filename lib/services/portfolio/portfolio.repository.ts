import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import {
  Portfolio,
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
} from '@/types/portfolio';

import { getMockPortfolios } from './__mocks__/portfolio.mock';
import { PortfolioMapper } from './portfolio.mapper';

import type { QueryOptions } from '@/lib/services/base';

/**
 * Portfolio repository for data access layer
 * Implements BaseRepository interface for consistent data access patterns
 */
export class PortfolioRepository {
  private supabase: any;
  private useMockData: boolean;

  constructor() {
    this.useMockData =
      process.env.NODE_ENV === 'development' && !process.env.SUPABASE_URL;
  }

  private async getClient(): Promise<any> {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  /**
   * Get all portfolios (optionally filtered)
   */
  findAll(options?: QueryOptions): Promise<Portfolio[]> {
    // For now, we'll use a default userId from options or return empty array
    // In a real implementation, this would use proper filtering
    const userId = options?.filters?.userId as string;
    if (!userId) {
      logger.warn('findAll called without userId filter');
      return Promise.resolve([]);
    }
    return this.findByUserId(userId);
  }

  /**
   * Get all portfolios for a user
   */
  async findByUserId(userId: string): Promise<Portfolio[]> {
    try {
      if (this.useMockData) {
        return getMockPortfolios().filter(p => p.userId === userId);
      }

      const client = await this.getClient();
      const { data, error } = await client
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        logger.error('Error fetching portfolios:', error as Error);
        throw error;
      }

      return data.map(PortfolioMapper.fromDatabase);
    } catch (error) {
      logger.error('Repository error in findByUserId:', error as Error);
      throw error;
    }
  }

  /**
   * Get a specific portfolio by ID
   */
  async findById(id: string): Promise<Portfolio | null> {
    try {
      if (this.useMockData) {
        return getMockPortfolios().find(p => p.id === id) || null;
      }

      const client = await this.getClient();
      const { data, error } = await client
        .from('portfolios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        logger.error('Error fetching portfolio:', error as Error);
        throw error;
      }

      return data ? PortfolioMapper.fromDatabase(data) : null;
    } catch (error) {
      logger.error('Repository error in findById:', error as Error);
      throw error;
    }
  }

  /**
   * Create a new portfolio
   */
  async create(
    data: CreatePortfolioDTO & { userId: string }
  ): Promise<Portfolio> {
    try {
      if (this.useMockData) {
        const newPortfolio: Portfolio = {
          id: `portfolio-${Date.now()}`,
          userId: data.userId,
          name: data.name,
          title: data.title,
          bio: data.bio || '',
          contact: { email: '', location: '' },
          social: {},
          experience: [],
          education: [],
          projects: [],
          skills: [],
          certifications: [],
          template: data.template,
          customization: PortfolioMapper.fromDatabase({}).customization,
          aiSettings: PortfolioMapper.fromDatabase({}).aiSettings,
          status: 'draft',
          subdomain: this.generateSubdomain(data.name),
          views: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return newPortfolio;
      }

      const dbData = PortfolioMapper.toDatabase({
        ...data,
        subdomain: this.generateSubdomain(data.name),
        status: 'draft',
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const client = await this.getClient();
      const { data: created, error } = await client
        .from('portfolios')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating portfolio:', error as Error);
        throw error;
      }

      return PortfolioMapper.fromDatabase(created);
    } catch (error) {
      logger.error('Repository error in create:', error as Error);
      throw error;
    }
  }

  /**
   * Update an existing portfolio
   */
  async update(
    id: string,
    data: UpdatePortfolioDTO
  ): Promise<Portfolio | null> {
    try {
      if (this.useMockData) {
        const portfolio = getMockPortfolios().find(p => p.id === id);
        if (!portfolio) return null;
        return { ...portfolio, ...data, updatedAt: new Date() };
      }

      const dbData = PortfolioMapper.toDatabase({
        ...data,
        updatedAt: new Date(),
      });

      const client = await this.getClient();
      const { data: updated, error } = await client
        .from('portfolios')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        logger.error('Error updating portfolio:', error as Error);
        throw error;
      }

      return updated ? PortfolioMapper.fromDatabase(updated) : null;
    } catch (error) {
      logger.error('Repository error in update:', error as Error);
      throw error;
    }
  }

  /**
   * Delete a portfolio
   */
  async delete(id: string): Promise<boolean> {
    try {
      if (this.useMockData) {
        return true;
      }

      const client = await this.getClient();
      const { error } = await client.from('portfolios').delete().eq('id', id);

      if (error) {
        logger.error('Error deleting portfolio:', error as Error);
        throw error;
      }

      return true;
    } catch (error) {
      logger.error('Repository error in delete:', error as Error);
      throw error;
    }
  }

  /**
   * Find portfolio by subdomain
   */
  async findBySubdomain(subdomain: string): Promise<Portfolio | null> {
    try {
      if (this.useMockData) {
        return (
          getMockPortfolios().find(
            p => p.subdomain === subdomain && p.status === 'published'
          ) || null
        );
      }

      const client = await this.getClient();
      const { data, error } = await client
        .from('portfolios')
        .select('*')
        .eq('subdomain', subdomain)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        logger.error('Error fetching portfolio by subdomain:', error as Error);
        throw error;
      }

      return data ? PortfolioMapper.fromDatabase(data) : null;
    } catch (error) {
      logger.error('Repository error in findBySubdomain:', error as Error);
      throw error;
    }
  }

  /**
   * Check subdomain availability
   */
  checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    return this.isSubdomainAvailable(subdomain);
  }

  /**
   * Check subdomain availability
   */
  async isSubdomainAvailable(subdomain: string): Promise<boolean> {
    try {
      if (this.useMockData) {
        return !getMockPortfolios().some(p => p.subdomain === subdomain);
      }

      const client = await this.getClient();
      const { data, error } = await client
        .from('portfolios')
        .select('id')
        .eq('subdomain', subdomain)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error checking subdomain:', error as Error);
        throw error;
      }

      return !data;
    } catch (error) {
      logger.error('Repository error in isSubdomainAvailable:', error as Error);
      throw error;
    }
  }

  /**
   * Find published portfolios for a user
   */
  async findPublished(userId: string): Promise<Portfolio[]> {
    try {
      if (this.useMockData) {
        return getMockPortfolios().filter(
          p => p.userId === userId && p.publishedAt !== null
        );
      }

      const client = await this.getClient();
      const { data, error } = await client
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .eq('published', true)
        .order('updated_at', { ascending: false });

      if (error) {
        logger.error('Error fetching published portfolios:', error as Error);
        throw error;
      }

      return data ? data.map(PortfolioMapper.fromDatabase) : [];
    } catch (error) {
      logger.error('Repository error in findPublished:', error as Error);
      throw error;
    }
  }

  /**
   * Increment view count
   */
  async incrementViews(id: string): Promise<void> {
    try {
      if (this.useMockData) return;

      const client = await this.getClient();
      const { error } = await client.rpc('increment_portfolio_views', {
        portfolio_id: id,
      });

      if (error) {
        logger.error('Error incrementing views:', error);
        throw error;
      }
    } catch (error) {
      logger.error('Repository error in incrementViews:', error as Error);
      throw error;
    }
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
}
