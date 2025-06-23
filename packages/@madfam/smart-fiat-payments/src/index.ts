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

// Business Intelligence exports (with aliases for conflicts)
export {
  PaymentIntelligenceEngine,
  CompetitiveIntelligenceEngine,
  // Alias conflicting exports
  CompetitorProfile as BICompetitorProfile,
  ExecutiveSummary as BIExecutiveSummary,
  PricingModel as BIPricingModel,
  // Other non-conflicting exports
  PaymentTrend,
  MarketAnalysis,
  CompetitiveInsight,
  IntelligenceReport,
  CompetitorAnalysis,
  MarketIntelligence,
  PaymentMethodAnalysis,
  RegionalAnalysis,
  CustomerSegmentAnalysis,
  PricingAnalysis,
  FeatureComparison,
  MarketPositioning,
  StrategicRecommendation
} from './business-intelligence';

// AI exports
export * from './ai';

// Enterprise exports
export * from './enterprise';
export { EnterpriseSecurityModule } from './enterprise/security-module';

// Research exports (with aliases for conflicts)
export {
  IndustryResearchEngine,
  // Alias conflicting exports
  CompetitorProfile as ResearchCompetitorProfile,
  ExecutiveSummary as ResearchExecutiveSummary,
  // Other non-conflicting exports
  ResearchReport,
  MarketTrend,
  IndustryInsight,
  PaymentMethodAdoption,
  GeographicalExpansion,
  TechnologyTrend,
  RegulatoryUpdate,
  InvestmentOpportunity,
  PartnershipOpportunity,
  StrategicInitiative,
  InnovationStrategy,
  MarketForecast,
  CompetitiveStrategy,
  ResearchInsight,
  StrategicRecommendation as ResearchStrategicRecommendation
} from './research';

// White Label exports (with aliases for conflicts)
export {
  WhiteLabelPlatform,
  // Alias conflicting exports
  Customization as WhiteLabelCustomization,
  PricingModel as WhiteLabelPricingModel,
  // Other non-conflicting exports
  WhiteLabelConfig,
  Branding,
  Theme,
  ClientConfiguration,
  FeatureToggle,
  Integration,
  Analytics,
  SupportConfig,
  DeploymentConfig,
  ClientMetrics,
  RevenueShare,
  ClientSubscription,
  CustomizationValidation,
  ClientValidation,
  DeploymentStatus,
  ClientHealth,
  WhiteLabelClient,
  ClientDashboard,
  ActiveCustomization
} from './white-label';

// Subscription exports (with aliases for conflicts)
export {
  SubscriptionManager,
  // Alias conflicting exports
  Customization as SubscriptionCustomization,
  DiscountStructure as SubscriptionDiscountStructure,
  DiscountEligibility as SubscriptionDiscountEligibility,
  // Other non-conflicting exports
  SubscriptionPlan,
  SubscriptionFeatures,
  UsageTracking,
  BillingConfig,
  SubscriptionMetrics,
  ChurnPrediction,
  ExpansionOpportunity,
  UsageAlert,
  SubscriptionHealth,
  RevenueMetrics,
  CustomerLifecycleStage,
  RetentionStrategy,
  PricingExperiment,
  SubscriptionAnalytics,
  CustomerSegment,
  SubscriptionTier,
  AddonConfig,
  UsageLimit,
  OverageHandling,
  SubscriptionStatus,
  BillingCycle,
  PaymentSchedule,
  CancellationReason,
  WinbackCampaign,
  UpgradeIncentive,
  LoyaltyProgram,
  ReferralProgram
} from './subscription';

// Consulting exports (with aliases for conflicts)
export {
  ConsultingPipeline,
  // Alias conflicting exports
  RiskAssessment as ConsultingRiskAssessment,
  DiscountStructure as ConsultingDiscountStructure,
  // Other non-conflicting exports
  ConsultingConfig,
  ConsultingService,
  Consultant,
  EngagementType,
  ConsultingPricingModel,
  DeliveryMethod,
  ExpertiseArea,
  Deliverable,
  QualityStandard,
  Methodology,
  MethodologyPhase,
  ServiceDuration,
  DurationFactor,
  ServicePricing,
  PricingTier,
  SuccessMetric,
  CaseStudy,
  ClientTestimonial,
  EngagementTracking,
  ConsultingMetrics,
  Pipeline,
  ConsultingLead,
  Proposal,
  Contract,
  ProjectManagement,
  ClientSatisfaction,
  ConsultingRevenue,
  KnowledgeAsset,
  ThoughtLeadership,
  MarketPresence,
  ConsultantProfile,
  SkillMatrix,
  Certification,
  ClientRelationship,
  EngagementHistory,
  ConsultingOpportunity,
  CrossSellOpportunity,
  PartnerNetwork,
  ReferralSource,
  CompetitiveLandscape as ConsultingCompetitiveLandscape,
  ConsultingInsight,
  StrategicPartnership,
  ConsultingAnalytics,
  PerformanceMetrics as ConsultingPerformanceMetrics,
  QualityMetrics,
  FinancialMetrics,
  ClientMetrics as ConsultingClientMetrics,
  MarketMetrics,
  OperationalMetrics
} from './consulting';

// Default export
export { SmartPayments as default } from './smart-payments';
