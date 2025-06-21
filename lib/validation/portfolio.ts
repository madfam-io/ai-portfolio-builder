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

/**
 * Portfolio Validation
 *
 * Re-exports portfolio validation functions for backwards compatibility
 */

export {
  validateCreatePortfolio,
  validateUpdatePortfolio,
  sanitizePortfolioData,
} from '@/lib/services/portfolio/validation';

// Add missing validatePortfolioQuery function
export function validatePortfolioQuery(query: Record<string, any>) {
  return {
    success: true,
    data: {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      status: query.status,
      template: query.template,
      search: query.search,
    },
  };
}
