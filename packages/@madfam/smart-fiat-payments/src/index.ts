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

// Module exports - export everything from each module
// Rollup will warn about conflicts but will handle them
export * from './card-intelligence';
export * from './geo';
export * from './routing';
export * from './pricing';
export * from './performance';
export * from './business-intelligence';
export * from './ai';
export * from './enterprise';
export * from './research';
export * from './white-label';
export * from './subscription';
export * from './consulting';

// Main class (already exported from ./smart-payments)
// export { SmartPayments } from './smart-payments';

// Convenience re-exports (already exported from modules above)
export { CardDetector } from './card-intelligence/detector';
export { GeographicalContextEngine } from './geo/context-engine';
export { IntelligentRouter } from './routing/intelligent-router';
export { DynamicPricingEngine } from './pricing/dynamic-pricing';
// Already exported above: PaymentIntelligenceEngine, CompetitiveIntelligenceEngine, PaymentOptimizationEngine
export { EnterpriseSecurityModule } from './enterprise/security-module';
// Already exported above: IndustryResearchEngine, WhiteLabelPlatform, SubscriptionManager, ConsultingPipeline

// Default export
export { SmartPayments as default } from './smart-payments';
