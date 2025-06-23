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
 * Routing Module
 *
 * Export all routing functionality
 */

export * from './gateway-config';
export * from './intelligent-router';

// Re-export for convenience
export {
  DEFAULT_GATEWAY_CONFIGS,
  GatewayFeeCalculator,
} from './gateway-config';
export { IntelligentRouter } from './intelligent-router';
