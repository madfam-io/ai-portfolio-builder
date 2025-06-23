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
  BenchmarkComparison,
  CompetitiveAdvantageReport,
  CompetitiveAnalysisConfig,
  CompetitivePositioning,
  CompetitorAnalysis,
  CustomerSegment,
  FraudCostAnalysis,
  HiddenFee,
  IndustryBenchmark,
  MarketPositioning,
  MarketTrend,
  NewsItem,
  Opportunity,
  OptimizationRecommendation,
  PaymentIntelligenceConfig,
  PaymentIntelligenceReport,
  ROICalculation,
  RevenueImpactAnalysis,
  RevenueModelingConfig,
  SpecialRate,
  StrategicRecommendation,
  TechnicalCapabilities,
  Threat,
  VolumeDiscount
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
  CompetitiveLandscape as ResearchCompetitiveLandscape,
  MarketAnalysis as ResearchMarketAnalysis,
  TechnologyTrend as ResearchTechnologyTrend,
  // Other non-conflicting exports
  ActionableInsight,
  CompetitiveForce,
  ConsolidationAnalysis,
  ConsumerTrend,
  DecliningTrend,
  EmergingTrend,
  Evidence,
  GeographicAnalysis,
  Implementation,
  IndustryReport,
  KeyFinding,
  MarketPrediction,
  MarketSegment,
  MediaAsset,
  PredictionScenario,
  RegulatoryTrend,
  ResearchConfig,
  ResearchSource,
  ThoughtLeadershipOpportunity,
  TrendAnalysis,
  TrendIntersection
} from './research';

// White Label exports (with aliases for conflicts)
export {
  WhiteLabelPlatform,
  // Alias conflicting exports
  Customization as WhiteLabelCustomization,
  PricingModel as WhiteLabelPricingModel,
  // Other non-conflicting exports
  ActiveCustomization,
  ApiCredentials,
  BrandingConfig,
  ComplianceRequirements,
  ComputeMetrics,
  CustomCompliance,
  CustomerSummary,
  DashboardTheme,
  DataResidency,
  EfficiencyMetrics,
  EmailTemplate,
  FeatureSet,
  InstanceMetrics,
  IntegrationSettings,
  OnboardingPhase,
  OnboardingPlan,
  PartnerDashboard,
  PartnerOverview,
  PartnerResource,
  PeakUsage,
  Permission,
  ResponseTime,
  RetryPolicy,
  RevenueAnalytics,
  RevenueBreakdown,
  RevenueTrend,
  SSOAttribute,
  SSOConfiguration,
  StorageMetrics,
  SupportChannel,
  SupportMetrics,
  SupportTier,
  UsageAnalytics,
  UsageRate,
  WebhookEndpoint,
  WhiteLabelConfig,
  WhiteLabelInstance
} from './white-label';

// Subscription exports (with aliases for conflicts)
export {
  SubscriptionManager,
  // Alias conflicting exports
  Customization as SubscriptionCustomization,
  DiscountStructure as SubscriptionDiscountStructure,
  DiscountEligibility as SubscriptionDiscountEligibility,
  SupportLevel as SubscriptionSupportLevel,
  // Other non-conflicting exports
  AddOnSubscription,
  AppliedDiscount,
  BillingCycle,
  BillingHistory,
  CostBreakdown,
  Credit,
  DiscountDuration,
  DiscountProgram,
  DiscountTier,
  EnterpriseFeature,
  Invoice,
  InvoiceDiscount,
  InvoiceLineItem,
  OptimizationImpact,
  OptimizationSuggestion,
  OverageRule,
  OverageTier,
  Payment,
  PeriodComparison,
  PlanDistribution,
  PlanFeature,
  PricingAction,
  PricingRule,
  SLACredit,
  ServiceLevelAgreement,
  Subscription,
  SubscriptionAnalytics,
  SubscriptionConfig,
  SubscriptionPlan,
  SubscriptionPricing,
  SubscriptionStatus,
  TaxBreakdown,
  UsageAlert,
  UsageData,
  UsageLimit,
  UsageMetric,
  UsagePattern,
  UsageProjection,
  UsageReport,
  UsageThreshold,
  UsageTracking
} from './subscription';

// Consulting exports (with aliases for conflicts)
export {
  ConsultingPipeline,
  // Alias conflicting exports
  RiskAssessment as ConsultingRiskAssessment,
  DiscountStructure as ConsultingDiscountStructure,
  CompetitiveAnalysis as ConsultingCompetitiveAnalysis,
  // Other non-conflicting exports
  ActiveRisk,
  BudgetApproval,
  BudgetVariance,
  CapacityAnalytics,
  CaseStudy,
  CaseStudyResult,
  ChangeImpact,
  ChangeRequest,
  ClientAcceptance,
  ClientContact,
  ClientFeedback,
  CompetitorWinRate,
  Consultant,
  ConsultantAvailability,
  ConsultingCompetitor,
  ConsultingConfig,
  ConsultingEngagement,
  ConsultingOpportunity,
  ConsultingPricingModel,
  ConsultingProposal,
  ConsultingService,
  Deliverable,
  DeliveryMethod,
  DurationFactor,
  EngagementBudget,
  EngagementDeliverable,
  EngagementMilestone,
  EngagementOutcome,
  EngagementPhase,
  EngagementPlan,
  EngagementPlanPhase,
  EngagementProgress,
  EngagementRisk,
  EngagementScope,
  EngagementStatus,
  EngagementTeam,
  EngagementTimeline,
  EngagementType,
  ExpertiseArea,
  MarketPositionAnalytics,
  Methodology,
  MethodologyPhase,
  MilestonePayment,
  OpportunityDetails,
  OpportunityTimeline,
  PaymentTerms,
  PhaseActivity,
  PhaseProgress,
  PipelineHealth,
  PlanMilestone,
  PricingBreakdown,
  PricingOption,
  ProfitabilityAnalytics,
  ProjectRisk,
  ProposalDetails,
  ProposalPricing,
  ProposalTeam,
  ProposalTerms,
  QualificationScore,
  QualityMetric,
  QualityPlan,
  QualityPlanMetric,
  QualityReview,
  QualityStandard,
  SatisfactionAnalytics,
  SatisfactionTrend,
  ServiceDuration,
  ServicePricing,
  ServiceProfitability,
  ServiceSatisfaction,
  Specialization,
  SuccessMetric,
  TeamMember,
  TeamSizeRange,
  UtilizationAnalytics,
  UtilizationByLevel,
  ValueDriver
} from './consulting';

// Default export
export { SmartPayments as default } from './smart-payments';
