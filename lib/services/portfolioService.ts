/**
 * Portfolio Service
 * Business logic for portfolio operations
 */

import { Portfolio, CreatePortfolioDTO, UpdatePortfolioDTO } from '@/types/portfolio';
import { createClient } from '@/lib/supabase/server';
import { transformApiPortfolioToDb } from '@/app/api/portfolios/route';
import { v4 as uuidv4 } from 'uuid';

export class PortfolioService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Get all portfolios for a user
   */
  async getUserPortfolios(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      template?: string;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, status, template, search } = options;

    let query = this.supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (template) {
      query = query.eq('template', template);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: portfolios, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch portfolios: ${error.message}`);
    }

    // Get total count
    const { count: totalCount } = await this.supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return {
      portfolios: portfolios || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    };
  }

  /**
   * Get a portfolio by ID
   */
  async getPortfolioById(portfolioId: string, userId: string) {
    const { data: portfolio, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Portfolio not found');
      }
      throw new Error(`Failed to fetch portfolio: ${error.message}`);
    }

    return portfolio;
  }

  /**
   * Create a new portfolio
   */
  async createPortfolio(userId: string, portfolioData: CreatePortfolioDTO) {
    // Generate unique subdomain
    const baseSubdomain = portfolioData.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const subdomain = await this.generateUniqueSubdomain(baseSubdomain);

    const newPortfolio = {
      id: uuidv4(),
      user_id: userId,
      name: portfolioData.name,
      title: portfolioData.title,
      bio: portfolioData.bio || '',
      tagline: '',
      avatar_url: null,
      contact: {},
      social: {},
      experience: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
      template: portfolioData.template,
      customization: {
        primaryColor: '#1a73e8',
        secondaryColor: '#34a853',
        fontFamily: 'Inter',
        headerStyle: 'minimal',
      },
      ai_settings: {
        enhanceBio: true,
        enhanceProjectDescriptions: true,
        generateSkillsFromExperience: false,
        tone: 'professional',
        targetLength: 'concise',
      },
      status: 'draft',
      subdomain,
      custom_domain: null,
      views: 0,
      last_viewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: null,
    };

    const { data: portfolio, error } = await this.supabase
      .from('portfolios')
      .insert(newPortfolio)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create portfolio: ${error.message}`);
    }

    return portfolio;
  }

  /**
   * Update a portfolio
   */
  async updatePortfolio(portfolioId: string, userId: string, updateData: UpdatePortfolioDTO) {
    // First check if portfolio exists and belongs to user
    await this.getPortfolioById(portfolioId, userId);

    // Handle subdomain uniqueness if being updated
    if (updateData.subdomain) {
      const { data: existingSubdomain } = await this.supabase
        .from('portfolios')
        .select('id')
        .eq('subdomain', updateData.subdomain)
        .neq('id', portfolioId)
        .single();

      if (existingSubdomain) {
        throw new Error('Subdomain already exists');
      }
    }

    // Transform API data to database format
    const dbUpdateData = transformApiPortfolioToDb(updateData);

    // Handle status change to published
    if (updateData.status === 'published') {
      dbUpdateData.published_at = new Date().toISOString();
    }

    const { data: updatedPortfolio, error } = await this.supabase
      .from('portfolios')
      .update(dbUpdateData)
      .eq('id', portfolioId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update portfolio: ${error.message}`);
    }

    return updatedPortfolio;
  }

  /**
   * Delete a portfolio
   */
  async deletePortfolio(portfolioId: string, userId: string) {
    // First check if portfolio exists and belongs to user
    const portfolio = await this.getPortfolioById(portfolioId, userId);

    const { error } = await this.supabase
      .from('portfolios')
      .delete()
      .eq('id', portfolioId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete portfolio: ${error.message}`);
    }

    return { name: portfolio.name };
  }

  /**
   * Generate a unique subdomain
   */
  private async generateUniqueSubdomain(baseSubdomain: string): Promise<string> {
    const { data: existingPortfolios } = await this.supabase
      .from('portfolios')
      .select('subdomain')
      .like('subdomain', `${baseSubdomain}%`);

    if (!existingPortfolios || existingPortfolios.length === 0) {
      return baseSubdomain;
    }

    const existingSubdomains = existingPortfolios.map(p => p.subdomain);
    let counter = 1;
    let uniqueSubdomain = baseSubdomain;

    while (existingSubdomains.includes(uniqueSubdomain)) {
      uniqueSubdomain = `${baseSubdomain}-${counter}`;
      counter++;
    }

    return uniqueSubdomain;
  }

  /**
   * Get portfolio analytics
   */
  async getPortfolioAnalytics(portfolioId: string, userId: string) {
    const portfolio = await this.getPortfolioById(portfolioId, userId);
    
    return {
      views: portfolio.views || 0,
      lastViewedAt: portfolio.last_viewed_at,
      status: portfolio.status,
      createdAt: portfolio.created_at,
      updatedAt: portfolio.updated_at,
      publishedAt: portfolio.published_at,
    };
  }

  /**
   * Increment portfolio views
   */
  async incrementPortfolioViews(portfolioId: string) {
    const { error } = await this.supabase.rpc('increment_portfolio_views', {
      portfolio_id: portfolioId,
    });

    if (error) {
      console.error('Failed to increment portfolio views:', error);
      // Don't throw error for analytics - it's not critical
    }
  }

  /**
   * Get portfolio by subdomain (public access)
   */
  async getPortfolioBySubdomain(subdomain: string) {
    const { data: portfolio, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('status', 'published')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Portfolio not found');
      }
      throw new Error(`Failed to fetch portfolio: ${error.message}`);
    }

    // Increment views asynchronously
    this.incrementPortfolioViews(portfolio.id).catch(console.error);

    return portfolio;
  }
}