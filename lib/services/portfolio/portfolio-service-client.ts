/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { logger } from '@/lib/utils/logger';
import {
  Portfolio,
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
} from '@/types/portfolio';

/**
 * Client-side Portfolio Service
 * Uses API endpoints instead of direct database access
 */
export class PortfolioServiceClient {
  private baseUrl = '/api/v1/portfolios';

  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    try {
      const response = await fetch(`${this.baseUrl}?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios');
      }
      return response.json();
    } catch (error) {
      logger.error('Error fetching portfolios:', error as Error);
      throw error;
    }
  }

  async getPortfolio(id: string): Promise<Portfolio> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }
      return response.json();
    } catch (error) {
      logger.error('Error fetching portfolio:', error as Error);
      throw error;
    }
  }

  async createPortfolio(data: CreatePortfolioDTO): Promise<Portfolio> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create portfolio');
      }
      return response.json();
    } catch (error) {
      logger.error('Error creating portfolio:', error as Error);
      throw error;
    }
  }

  async updatePortfolio(
    id: string,
    data: UpdatePortfolioDTO
  ): Promise<Portfolio> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update portfolio');
      }
      return response.json();
    } catch (error) {
      logger.error('Error updating portfolio:', error as Error);
      throw error;
    }
  }

  async deletePortfolio(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete portfolio');
      }
    } catch (error) {
      logger.error('Error deleting portfolio:', error as Error);
      throw error;
    }
  }
}

export const portfolioServiceClient = new PortfolioServiceClient();
