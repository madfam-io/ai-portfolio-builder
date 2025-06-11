/**
 * @fileoverview Temporary stub for portfolio service during refactoring
 * This file provides basic functionality while the full modular service is being built
 */

'use client';

import type {
  Portfolio,
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
} from '@/types/portfolio';

import type {
  PortfolioServiceConfig,
  PortfolioQueryOptions,
  ServiceResponse,
  PortfolioAnalytics,
  ExportOptions,
  ImportResult,
} from './types';

import { mockPortfolios } from './mock-data';

/**
 * Temporary portfolio service implementation
 * Uses mock data until full refactoring is complete
 */
export class PortfolioService {
  private static instance: PortfolioService;

  private constructor(config?: PortfolioServiceConfig) {
    void config; // Silence unused parameter warning
  }

  static getInstance(config?: PortfolioServiceConfig): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService(config);
    }
    return PortfolioService.instance;
  }

  async getUserPortfolios(
    userId: string,
    options?: PortfolioQueryOptions
  ): Promise<ServiceResponse<Portfolio[]>> {
    void userId;
    void options;

    return {
      data: mockPortfolios,
      status: 200,
    };
  }

  async getPortfolio(id: string): Promise<ServiceResponse<Portfolio | null>> {
    const portfolio = mockPortfolios.find(p => p.id === id) || null;
    return {
      data: portfolio,
      status: portfolio ? 200 : 404,
      error: portfolio ? undefined : 'Portfolio not found',
    };
  }

  async createPortfolio(
    data: CreatePortfolioDTO
  ): Promise<ServiceResponse<Portfolio>> {
    // Mock implementation - create minimal valid portfolio
    const newPortfolio: Portfolio = {
      id: `portfolio-${Date.now()}`,
      userId: 'mock-user-id',
      name: data.name,
      title: data.title,
      bio: data.bio || '',
      contact: {
        email: '',
        phone: '',
        location: '',
        availability: '',
      },
      social: {},
      experience: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
      template: data.template,
      customization: {},
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: undefined,
      views: 0,
    };

    return {
      data: newPortfolio,
      status: 201,
    };
  }

  async updatePortfolio(
    id: string,
    data: UpdatePortfolioDTO
  ): Promise<ServiceResponse<Portfolio>> {
    void id;
    void data;

    return {
      error: 'Update not implemented in stub',
      status: 501,
    };
  }

  async deletePortfolio(id: string): Promise<ServiceResponse<boolean>> {
    void id;

    return {
      data: true,
      status: 200,
    };
  }

  // Add stubs for other methods
  async publishPortfolio(id: string): Promise<ServiceResponse<Portfolio>> {
    void id;
    return {
      error: 'Publish not implemented in stub',
      status: 501,
    };
  }

  async getPortfolioAnalytics(
    id: string
  ): Promise<ServiceResponse<PortfolioAnalytics>> {
    void id;
    return {
      error: 'Analytics not implemented in stub',
      status: 501,
    };
  }

  async exportPortfolio(
    id: string,
    options: ExportOptions
  ): Promise<ServiceResponse<Blob>> {
    void id;
    void options;
    return {
      error: 'Export not implemented in stub',
      status: 501,
    };
  }

  async importPortfolio(
    data: any,
    userId: string
  ): Promise<ServiceResponse<ImportResult>> {
    void data;
    void userId;
    return {
      error: 'Import not implemented in stub',
      status: 501,
    };
  }

  async searchPortfolios(
    query: string,
    userId?: string
  ): Promise<ServiceResponse<Portfolio[]>> {
    void query;
    void userId;
    return {
      data: [],
      status: 200,
    };
  }

  async clonePortfolio(
    id: string,
    newName: string,
    userId: string
  ): Promise<ServiceResponse<Portfolio>> {
    void id;
    void newName;
    void userId;
    return {
      error: 'Clone not implemented in stub',
      status: 501,
    };
  }
}

// Export singleton instance
export const portfolioService = PortfolioService.getInstance();
