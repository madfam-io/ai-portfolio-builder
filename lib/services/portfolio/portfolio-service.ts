/**
 * @fileoverview Main portfolio service with modular architecture
 * @module services/portfolio/portfolio-service
 *
 * This service provides a clean API for portfolio operations,
 * delegating to specialized modules for specific functionality.
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

import { PortfolioRepository } from './repository';
import { PortfolioValidator } from './validator';
import { PortfolioTransformer } from './transformer';
import { PortfolioAnalyticsService } from './analytics';
import { PortfolioExportService } from './export';
import { PortfolioImportService } from './import';

/**
 * Main portfolio service class
 * Provides high-level portfolio operations with proper separation of concerns
 */
export class PortfolioService {
  private static instance: PortfolioService;

  private readonly repository: PortfolioRepository;
  private readonly validator: PortfolioValidator;
  private readonly transformer: PortfolioTransformer;
  private readonly analytics: PortfolioAnalyticsService;
  private readonly exporter: PortfolioExportService;
  private readonly importer: PortfolioImportService;

  /**
   * Private constructor for singleton pattern
   */
  private constructor(config?: PortfolioServiceConfig) {
    this.repository = new PortfolioRepository(config);
    this.validator = new PortfolioValidator();
    this.transformer = new PortfolioTransformer();
    this.analytics = new PortfolioAnalyticsService(this.repository);
    this.exporter = new PortfolioExportService();
    this.importer = new PortfolioImportService(this.validator);
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: PortfolioServiceConfig): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService(config);
    }
    return PortfolioService.instance;
  }

  /**
   * Get all portfolios for a user with optional filtering
   *
   * @param userId - User ID to filter by
   * @param options - Query options for filtering and pagination
   * @returns Service response with portfolios array
   *
   * @example
   * ```typescript
   * const { data, error } = await portfolioService.getUserPortfolios('user-123', {
   *   isPublished: true,
   *   sortBy: 'updatedAt',
   *   limit: 10
   * });
   * ```
   */
  async getUserPortfolios(
    userId: string,
    options?: PortfolioQueryOptions
  ): Promise<ServiceResponse<Portfolio[]>> {
    try {
      const portfolios = await this.repository.findByUserId(userId, options);
      return {
        data: portfolios,
        status: 200,
        meta: {
          total: portfolios.length,
          page: options?.page || 1,
          limit: options?.limit || 10,
          hasMore: false, // Would be calculated from total count in real implementation
        },
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to fetch portfolios',
        status: 500,
      };
    }
  }

  /**
   * Get a specific portfolio by ID
   *
   * @param id - Portfolio ID
   * @returns Service response with portfolio or null
   */
  async getPortfolio(id: string): Promise<ServiceResponse<Portfolio | null>> {
    try {
      const portfolio = await this.repository.findById(id);
      return {
        data: portfolio,
        status: portfolio ? 200 : 404,
        error: portfolio ? undefined : 'Portfolio not found',
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to fetch portfolio',
        status: 500,
      };
    }
  }

  /**
   * Create a new portfolio
   *
   * @param data - Portfolio creation data
   * @returns Service response with created portfolio
   */
  async createPortfolio(
    data: CreatePortfolioDTO & { userId: string }
  ): Promise<ServiceResponse<Portfolio>> {
    try {
      // Validate input
      const validation = this.validator.validateCreate(data);
      if (!validation.isValid) {
        return {
          error: 'Validation failed',
          status: 400,
          meta: { errors: validation.errors },
        };
      }

      // Transform and create
      const portfolio = await this.repository.create(data);

      return {
        data: portfolio,
        status: 201,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to create portfolio',
        status: 500,
      };
    }
  }

  /**
   * Update an existing portfolio
   *
   * @param id - Portfolio ID
   * @param data - Update data
   * @returns Service response with updated portfolio
   */
  async updatePortfolio(
    id: string,
    data: UpdatePortfolioDTO
  ): Promise<ServiceResponse<Portfolio | null>> {
    try {
      // Validate input
      const validation = this.validator.validateUpdate(data);
      if (!validation.isValid) {
        return {
          error: 'Validation failed',
          status: 400,
          meta: { errors: validation.errors },
        };
      }

      // Update portfolio
      const portfolio = await this.repository.update(id, data);

      return {
        data: portfolio,
        status: portfolio ? 200 : 404,
        error: portfolio ? undefined : 'Portfolio not found',
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to update portfolio',
        status: 500,
      };
    }
  }

  /**
   * Delete a portfolio
   *
   * @param id - Portfolio ID
   * @returns Service response with success boolean
   */
  async deletePortfolio(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const success = await this.repository.delete(id);
      return {
        data: success,
        status: success ? 204 : 404,
        error: success ? undefined : 'Portfolio not found',
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to delete portfolio',
        status: 500,
      };
    }
  }

  /**
   * Publish a portfolio
   *
   * @param id - Portfolio ID
   * @returns Service response with published portfolio
   */
  async publishPortfolio(
    id: string
  ): Promise<ServiceResponse<Portfolio | null>> {
    try {
      const portfolio = await this.repository.publish(id);
      return {
        data: portfolio,
        status: portfolio ? 200 : 404,
        error: portfolio ? undefined : 'Portfolio not found',
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to publish portfolio',
        status: 500,
      };
    }
  }

  /**
   * Get portfolio analytics
   *
   * @param id - Portfolio ID
   * @returns Service response with analytics data
   */
  async getPortfolioAnalytics(
    id: string
  ): Promise<ServiceResponse<PortfolioAnalytics | null>> {
    try {
      const analytics = await this.analytics.getAnalytics(id);
      return {
        data: analytics,
        status: analytics ? 200 : 404,
        error: analytics ? undefined : 'Portfolio not found',
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to fetch analytics',
        status: 500,
      };
    }
  }

  /**
   * Export a portfolio
   *
   * @param id - Portfolio ID
   * @param options - Export options
   * @returns Service response with exported data
   */
  async exportPortfolio(
    id: string,
    options: ExportOptions
  ): Promise<ServiceResponse<string | Buffer>> {
    try {
      const portfolio = await this.repository.findById(id);
      if (!portfolio) {
        return {
          error: 'Portfolio not found',
          status: 404,
        };
      }

      const exported = await this.exporter.export(portfolio, options);
      return {
        data: exported,
        status: 200,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to export portfolio',
        status: 500,
      };
    }
  }

  /**
   * Import a portfolio from external data
   *
   * @param data - Import data (JSON, LinkedIn, etc.)
   * @param userId - User ID for the imported portfolio
   * @returns Service response with import result
   */
  async importPortfolio(
    data: unknown,
    userId: string
  ): Promise<ServiceResponse<ImportResult>> {
    try {
      const result = await this.importer.import(data, userId);

      if (result.success && result.portfolio) {
        // Save the imported portfolio
        const created = await this.repository.create({
          ...result.portfolio,
          userId,
        });

        result.portfolio = created;
      }

      return {
        data: result,
        status: result.success ? 201 : 400,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to import portfolio',
        status: 500,
      };
    }
  }

  /**
   * Search portfolios by query
   *
   * @param query - Search query
   * @param userId - User ID to scope the search
   * @returns Service response with matching portfolios
   */
  async searchPortfolios(
    query: string,
    userId: string
  ): Promise<ServiceResponse<Portfolio[]>> {
    try {
      const portfolios = await this.repository.search(query, userId);
      return {
        data: portfolios,
        status: 200,
        meta: {
          total: portfolios.length,
        },
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Search failed',
        status: 500,
      };
    }
  }

  /**
   * Clone an existing portfolio
   *
   * @param id - Portfolio ID to clone
   * @param newName - Name for the cloned portfolio
   * @param userId - User ID for the cloned portfolio
   * @returns Service response with cloned portfolio
   */
  async clonePortfolio(
    id: string,
    newName: string,
    userId: string
  ): Promise<ServiceResponse<Portfolio | null>> {
    try {
      const portfolio = await this.repository.clone(id, newName, userId);
      return {
        data: portfolio,
        status: portfolio ? 201 : 404,
        error: portfolio ? undefined : 'Portfolio not found',
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to clone portfolio',
        status: 500,
      };
    }
  }
}

/**
 * Export singleton instance
 */
export const portfolioService = PortfolioService.getInstance();
