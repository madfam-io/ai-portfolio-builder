/**
 * @madfam/smart-payments
 * 
 * World-class payment gateway detection and routing system with AI-powered optimization
 * 
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 * 
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 * 
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

/**
 * Card Intelligence Module
 * 
 * Export all card intelligence functionality
 */

export * from './detector';
export * from './validators';
export * from './bin-database';

// Re-export for convenience
export { CardDetector } from './detector';
export { 
  InMemoryBINDatabase, 
  APIBINDatabase,
  type BINDatabase 
} from './bin-database';
export {
  validateCardNumber,
  validateExpiry,
  validateCVV,
  detectCardBrand,
  isValidLuhn,
  formatCardNumber,
  maskCardNumber,
  getCardBrandDisplayName
} from './validators';