/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/utils/logger';
import {
  type Portfolio,
  type CreatePortfolioDTO,
  type UpdatePortfolioDTO,
} from '@/types/portfolio';

import { getMockPortfolios } from './__mocks__/portfolio.mock';
import { PortfolioMapper } from './portfolio.mapper';

import type { QueryOptions } from '@/lib/services/base';

/**
 * Portfolio repository for data access layer
 * Implements BaseRepository interface for consistent data access patterns
 */
export class PortfolioRepository {
  private useMockData: boolean;

  constructor() {
    this.useMockData =
      process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL;
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

      const data = await prisma.portfolio.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });

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

      const data = await prisma.portfolio.findUnique({
        where: { id },
      });

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

      const created = await prisma.portfolio.create({
        data: dbData,
      });

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

      const updated = await prisma.portfolio.update({
        where: { id },
        data: dbData,
      });

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

      await prisma.portfolio.delete({
        where: { id },
      });

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

      const data = await prisma.portfolio.findFirst({
        where: {
          subdomain,
          status: 'published',
        },
      });

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

      const data = await prisma.portfolio.findFirst({
        where: { subdomain },
        select: { id: true },
      });

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

      const data = await prisma.portfolio.findMany({
        where: {
          userId,
          status: 'published',
        },
        orderBy: { updatedAt: 'desc' },
      });

      return data.map(PortfolioMapper.fromDatabase);
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

      await prisma.portfolio.update({
        where: { id },
        data: {
          views: {
            increment: 1,
          },
        },
      });
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
