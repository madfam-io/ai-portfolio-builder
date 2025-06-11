/**
 * @fileoverview Portfolio service types and interfaces
 * @module services/portfolio/types
 */

import type { Portfolio } from '@/types/portfolio';

/**
 * Portfolio service configuration options
 */
export interface PortfolioServiceConfig {
  /**
   * Use mock data instead of real API calls
   * @default true in development, false in production
   */
  useMockData?: boolean;

  /**
   * API base URL for portfolio endpoints
   */
  apiBaseUrl?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
}

/**
 * Portfolio query options for filtering and pagination
 */
export interface PortfolioQueryOptions {
  /**
   * Filter by user ID
   */
  userId?: string;

  /**
   * Filter by template ID
   */
  templateId?: string;

  /**
   * Filter by publish status
   */
  isPublished?: boolean;

  /**
   * Page number for pagination
   * @default 1
   */
  page?: number;

  /**
   * Number of items per page
   * @default 10
   */
  limit?: number;

  /**
   * Sort field
   */
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'viewCount';

  /**
   * Sort order
   * @default 'desc'
   */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Portfolio service response wrapper
 */
export interface ServiceResponse<T> {
  /**
   * Response data
   */
  data?: T;

  /**
   * Error message if request failed
   */
  error?: string;

  /**
   * HTTP status code
   */
  status: number;

  /**
   * Additional metadata
   */
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

/**
 * Portfolio analytics data
 */
export interface PortfolioAnalytics {
  portfolioId: string;
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  topReferrers: Array<{
    source: string;
    count: number;
  }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

/**
 * Portfolio validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * Portfolio export options
 */
export interface ExportOptions {
  format: 'pdf' | 'json' | 'html';
  includeAnalytics?: boolean;
  includePrivateData?: boolean;
  template?: string;
}

/**
 * Portfolio import result
 */
export interface ImportResult {
  success: boolean;
  portfolio?: Portfolio;
  errors?: string[];
  warnings?: string[];
}
