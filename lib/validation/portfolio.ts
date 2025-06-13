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
