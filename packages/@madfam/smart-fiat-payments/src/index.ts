/**
 * @madfam/smart-fiat-payments
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
 * @madfam/smart-fiat-payments
 *
 * World-class payment gateway detection and routing system
 */

// Main exports
export * from './smart-payments';
export * from './types';

// Card Intelligence exports
export * from './card-intelligence';
export { CardDetector } from './card-intelligence/detector';

// Geo exports
export * from './geo';
export { GeographicalContextEngine } from './geo/context-engine';

// Routing exports
export * from './routing';
export { IntelligentRouter } from './routing/intelligent-router';

// Pricing exports
export * from './pricing';
export { DynamicPricingEngine } from './pricing/dynamic-pricing';

// Performance exports
export * from './performance';

// Module exports - export everything from each module
// TypeScript will use the first export for conflicts
export * from './business-intelligence';
export * from './ai';
export * from './enterprise';
export * from './research';
export * from './white-label';
export * from './subscription';
export * from './consulting';

// Specific class exports
export { EnterpriseSecurityModule } from './enterprise/security-module';

// Default export
export { SmartPayments as default } from './smart-payments';
