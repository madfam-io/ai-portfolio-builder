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
 * Subscription Management System
 *
 * Comprehensive tiered subscription model with usage tracking, billing, and optimization
 */

import { Money } from '../types';
import { PerformanceMonitor } from '../performance';

export interface SubscriptionConfig {
  billingCycles: BillingCycle[];
  plans: SubscriptionPlan[];
  usageMetrics: UsageMetric[];
  pricingRules: PricingRule[];
  discountPrograms: DiscountProgram[];
  enterpriseFeatures: EnterpriseFeature[];
}

export interface BillingCycle {
  id: string;
  name: string;
  duration: number; // days
  discountPercentage: number;
  popular: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier: 'starter' | 'professional' | 'enterprise' | 'custom';
  basePrice: Money;
  features: PlanFeature[];
  limits: UsageLimit[];
  support: SupportLevel;
  sla: ServiceLevelAgreement;
  targetMarket: string[];
  competitiveAdvantages: string[];
}

export interface PlanFeature {
  feature: string;
  included: boolean;
  limit?: number;
  description: string;
  businessValue: string;
}

export interface UsageLimit {
  metric: string;
  limit: number;
  overage: OverageRule;
  softLimit?: number; // Warning threshold
  resetPeriod: 'monthly' | 'daily' | 'annually';
}

export interface OverageRule {
  enabled: boolean;
  ratePerUnit: Money;
  tiers: OverageTier[];
  maxOverage?: Money;
}

export interface OverageTier {
  threshold: number;
  rate: Money;
  description: string;
}

export interface SupportLevel {
  responseTime: {
    critical: string;
    high: string;
    medium: string;
    low: string;
  };
  channels: ('email' | 'chat' | 'phone' | 'video')[];
  availability: string;
  dedicatedManager: boolean;
  onboardingIncluded: boolean;
  trainingHours: number;
}

export interface ServiceLevelAgreement {
  uptime: number; // percentage
  responseTime: number; // milliseconds
  resolution: {
    critical: number; // hours
    high: number;
    medium: number;
    low: number;
  };
  credits: SLACredit[];
}

export interface SLACredit {
  threshold: number; // below this uptime percentage
  creditPercentage: number; // percentage of monthly fee
}

export interface UsageMetric {
  id: string;
  name: string;
  unit: string;
  billable: boolean;
  trackingGranularity: 'real_time' | 'hourly' | 'daily';
  aggregationMethod: 'sum' | 'max' | 'average';
}

export interface PricingRule {
  id: string;
  name: string;
  condition: string;
  action: PricingAction;
  priority: number;
  active: boolean;
}

export interface PricingAction {
  type: 'discount' | 'surcharge' | 'override' | 'tier_change';
  value: number;
  description: string;
}

export interface DiscountProgram {
  id: string;
  name: string;
  type: 'volume' | 'loyalty' | 'promotional' | 'enterprise' | 'partner';
  eligibility: DiscountEligibility;
  discount: DiscountStructure;
  duration: DiscountDuration;
  stackable: boolean;
}

export interface DiscountEligibility {
  criteria: string[];
  minimumCommitment?: number; // months
  minimumUsage?: UsageThreshold[];
  customerSegments: string[];
}

export interface UsageThreshold {
  metric: string;
  threshold: number;
  period: 'monthly' | 'quarterly' | 'annually';
}

export interface DiscountStructure {
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  maxDiscount?: Money;
  tiers?: DiscountTier[];
}

export interface DiscountTier {
  threshold: number;
  discount: number;
  description: string;
}

export interface DiscountDuration {
  type: 'permanent' | 'temporary' | 'trial';
  months?: number;
  endDate?: Date;
  autoRenew?: boolean;
}

export interface EnterpriseFeature {
  feature: string;
  description: string;
  minimumTier: string;
  additionalCost?: Money;
  setupRequired: boolean;
  customization: boolean;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: string;
  startDate: Date;
  endDate?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  pricing: SubscriptionPricing;
  usage: UsageTracking;
  discounts: AppliedDiscount[];
  addOns: AddOnSubscription[];
  customizations: Customization[];
  metadata: Record<string, unknown>;
}

export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'suspended'
  | 'expired';

export interface SubscriptionPricing {
  baseAmount: Money;
  discountAmount: Money;
  taxAmount: Money;
  totalAmount: Money;
  nextBillingAmount: Money;
  projectedOverage: Money;
}

export interface UsageTracking {
  currentPeriod: UsageData[];
  projectedUsage: UsageProjection[];
  alerts: UsageAlert[];
  optimizationSuggestions: OptimizationSuggestion[];
}

export interface UsageData {
  metric: string;
  current: number;
  limit: number;
  percentage: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: Date;
}

export interface UsageProjection {
  metric: string;
  projectedValue: number;
  confidence: number; // 0-100
  projectedOverage: Money;
  recommendation: string;
}

export interface UsageAlert {
  id: string;
  metric: string;
  threshold: number;
  currentValue: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  actionRequired: boolean;
  suggestions: string[];
}

export interface OptimizationSuggestion {
  type:
    | 'plan_upgrade'
    | 'plan_downgrade'
    | 'usage_optimization'
    | 'feature_toggle';
  title: string;
  description: string;
  impact: OptimizationImpact;
  effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
}

export interface OptimizationImpact {
  costSavings?: Money;
  additionalCost?: Money;
  performanceGain?: string;
  featureBenefit?: string;
}

export interface AppliedDiscount {
  discountId: string;
  name: string;
  amount: Money;
  percentage?: number;
  appliedAt: Date;
  expiresAt?: Date;
}

export interface AddOnSubscription {
  id: string;
  name: string;
  description: string;
  price: Money;
  billingCycle: string;
  status: 'active' | 'suspended' | 'canceled';
  usage?: UsageData[];
}

export interface Customization {
  type: string;
  name: string;
  configuration: any;
  additionalCost?: Money;
  setupFee?: Money;
}

export interface BillingHistory {
  invoices: Invoice[];
  payments: Payment[];
  credits: Credit[];
  usageReports: UsageReport[];
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: Money;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  lineItems: InvoiceLineItem[];
  taxBreakdown: TaxBreakdown[];
  discounts: InvoiceDiscount[];
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
  period?: {
    start: Date;
    end: Date;
  };
  metadata?: Record<string, unknown>;
}

export interface TaxBreakdown {
  taxType: string;
  rate: number;
  amount: Money;
  jurisdiction: string;
}

export interface InvoiceDiscount {
  name: string;
  amount: Money;
  percentage?: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: Money;
  method: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  processedAt: Date;
  failureReason?: string;
}

export interface Credit {
  id: string;
  amount: Money;
  reason: string;
  appliedAt: Date;
  expiresAt?: Date;
  remainingBalance: Money;
}

export interface UsageReport {
  period: {
    start: Date;
    end: Date;
  };
  metrics: UsageData[];
  costs: CostBreakdown[];
  comparisons: PeriodComparison[];
}

export interface CostBreakdown {
  category: string;
  amount: Money;
  percentage: number;
  comparison: string;
}

export interface PeriodComparison {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SubscriptionAnalytics {
  churnRate: number;
  averageRevenuePerUser: Money;
  customerLifetimeValue: Money;
  expansionRevenue: Money;
  planDistribution: PlanDistribution[];
  usagePatterns: UsagePattern[];
  satisfactionScore: number;
}

export interface PlanDistribution {
  planId: string;
  planName: string;
  customerCount: number;
  percentage: number;
  revenue: Money;
}

export interface UsagePattern {
  pattern: string;
  frequency: number;
  averageUsage: number;
  costImpact: Money;
  optimizationPotential: string;
}

/**
 * Subscription Management System
 */
export class SubscriptionManager {
  private config: SubscriptionConfig;
  private performanceMonitor: PerformanceMonitor;
  private subscriptions: Map<string, Subscription> = new Map();
  private usageTrackers: Map<string, any> = new Map();

  constructor(config: SubscriptionConfig) {
    this.config = config;
    this.performanceMonitor = new PerformanceMonitor({
      subscriptionCreate: 2000,
      usageTracking: 500,
      billingCalculation: 1000,
    });

    this.initializeDefaultPlans();
  }

  /**
   * Create new subscription
   */
  async createSubscription(request: {
    customerId: string;
    planId: string;
    billingCycle: string;
    addOns?: string[];
    discountCodes?: string[];
    customizations?: Customization[];
    trialDays?: number;
  }): Promise<{
    subscription: Subscription;
    invoice?: Invoice;
    paymentRequired: boolean;
    trialEnd?: Date;
  }> {
    return this.performanceMonitor.measure('subscriptionCreate', async () => {
      const plan = this.config.plans.find(p => p.id === request.planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const subscriptionId = this.generateSubscriptionId();
      const currentDate = new Date();

      // Calculate trial end if applicable
      let trialEnd: Date | undefined;
      if (request.trialDays && request.trialDays > 0) {
        trialEnd = new Date(currentDate);
        trialEnd.setDate(trialEnd.getDate() + request.trialDays);
      }

      // Calculate billing period
      const billingCycle = this.config.billingCycles.find(
        bc => bc.id === request.billingCycle
      );
      if (!billingCycle) {
        throw new Error('Billing cycle not found');
      }

      const periodEnd = new Date(currentDate);
      periodEnd.setDate(periodEnd.getDate() + billingCycle.duration);

      // Calculate pricing
      const pricing = await this.calculateSubscriptionPricing(
        plan,
        billingCycle,
        request
      );

      // Create subscription
      const subscription: Subscription = {
        id: subscriptionId,
        customerId: request.customerId,
        planId: request.planId,
        status: request.trialDays ? 'trial' : 'active',
        billingCycle: request.billingCycle,
        startDate: currentDate,
        endDate: trialEnd,
        currentPeriodStart: currentDate,
        currentPeriodEnd: trialEnd || periodEnd,
        pricing,
        usage: {
          currentPeriod: this.initializeUsageTracking(plan),
          projectedUsage: [],
          alerts: [],
          optimizationSuggestions: [],
        },
        discounts: await this.applyDiscounts(
          request.discountCodes || [],
          pricing
        ),
        addOns: await this.processAddOns(request.addOns || []),
        customizations: request.customizations || [],
        metadata: {},
      };

      this.subscriptions.set(subscriptionId, subscription);

      // Generate initial invoice if payment required
      let invoice: Invoice | undefined;
      const paymentRequired =
        !request.trialDays && pricing.totalAmount.amount > 0;

      if (paymentRequired) {
        invoice = await this.generateInvoice(subscription);
      }

      return {
        subscription,
        invoice,
        paymentRequired,
        trialEnd,
      };
    });
  }

  /**
   * Track usage for subscription
   */
  async trackUsage(
    subscriptionId: string,
    metrics: Array<{
      metric: string;
      value: number;
      timestamp?: Date;
    }>
  ): Promise<{
    usage: UsageData[];
    alerts: UsageAlert[];
    suggestions: OptimizationSuggestion[];
  }> {
    return this.performanceMonitor.measure('usageTracking', async () => {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Update usage data
      for (const metric of metrics) {
        await this.updateUsageMetric(subscription, metric);
      }

      // Check for alerts
      const alerts = await this.checkUsageAlerts(subscription);

      // Generate optimization suggestions
      const suggestions =
        await this.generateOptimizationSuggestions(subscription);

      // Update subscription
      subscription.usage.alerts = alerts;
      subscription.usage.optimizationSuggestions = suggestions;
      this.subscriptions.set(subscriptionId, subscription);

      return {
        usage: subscription.usage.currentPeriod,
        alerts,
        suggestions,
      };
    });
  }

  /**
   * Calculate subscription billing
   */
  async calculateBilling(subscriptionId: string): Promise<{
    invoice: Invoice;
    projectedCharges: Money;
    usageCharges: Money;
    discounts: Money;
    taxes: Money;
  }> {
    return this.performanceMonitor.measure('billingCalculation', async () => {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const invoice = await this.generateInvoice(subscription);
      const breakdown = await this.calculateChargeBreakdown(subscription);

      return {
        invoice,
        projectedCharges: breakdown.projected,
        usageCharges: breakdown.usage,
        discounts: breakdown.discounts,
        taxes: breakdown.taxes,
      };
    });
  }

  /**
   * Analyze subscription metrics
   */
  async analyzeSubscriptionMetrics(): Promise<SubscriptionAnalytics> {
    const allSubscriptions = Array.from(this.subscriptions.values());

    const churnRate = this.calculateChurnRate(allSubscriptions);
    const averageRevenuePerUser = this.calculateARPU(allSubscriptions);
    const customerLifetimeValue = this.calculateCLV(allSubscriptions);
    const expansionRevenue = this.calculateExpansionRevenue(allSubscriptions);
    const planDistribution = this.analyzePlanDistribution(allSubscriptions);
    const usagePatterns = this.analyzeUsagePatterns(allSubscriptions);
    const satisfactionScore = await this.calculateSatisfactionScore();

    return {
      churnRate,
      averageRevenuePerUser,
      customerLifetimeValue,
      expansionRevenue,
      planDistribution,
      usagePatterns,
      satisfactionScore,
    };
  }

  /**
   * Optimize subscription pricing
   */
  async optimizeSubscriptionPricing(subscriptionId: string): Promise<{
    currentPlan: SubscriptionPlan;
    recommendedPlan?: SubscriptionPlan;
    potentialSavings?: Money;
    upgradeBenefits?: string[];
    optimizationReasons: string[];
  }> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const currentPlan = this.config.plans.find(
      p => p.id === subscription.planId
    );
    if (!currentPlan) {
      throw new Error('Current plan not found');
    }

    // Analyze usage patterns
    const usageAnalysis = await this.analyzeCustomerUsage(subscription);

    // Find optimal plan
    const recommendedPlan = await this.findOptimalPlan(
      subscription,
      usageAnalysis
    );

    // Calculate potential savings/costs
    const potentialSavings = recommendedPlan
      ? this.calculatePlanDifference(currentPlan, recommendedPlan)
      : undefined;

    // Generate optimization reasons
    const optimizationReasons = this.generateOptimizationReasons(
      subscription,
      usageAnalysis,
      recommendedPlan
    );

    const upgradeBenefits =
      recommendedPlan && recommendedPlan.tier !== currentPlan.tier
        ? this.getUpgradeBenefits(currentPlan, recommendedPlan)
        : undefined;

    return {
      currentPlan,
      recommendedPlan,
      potentialSavings,
      upgradeBenefits,
      optimizationReasons,
    };
  }

  /**
   * Private helper methods
   */
  private initializeDefaultPlans(): void {
    this.config.plans = [
      {
        id: 'starter',
        name: 'Starter',
        description:
          'Perfect for small businesses getting started with payment optimization',
        tier: 'starter',
        basePrice: { amount: 99, currency: 'USD', display: '$99' },
        features: [
          {
            feature: 'Payment Optimization',
            included: true,
            description: 'AI-powered gateway routing',
            businessValue: 'Reduce processing costs by 10-15%',
          },
          {
            feature: 'Basic Analytics',
            included: true,
            description: 'Monthly payment reports',
            businessValue: 'Track payment performance',
          },
          {
            feature: 'Email Support',
            included: true,
            description: 'Business hours support',
            businessValue: 'Get help when needed',
          },
          {
            feature: 'Fraud Detection',
            included: false,
            description: 'Advanced fraud prevention',
            businessValue: 'Prevent fraudulent transactions',
          },
        ],
        limits: [
          {
            metric: 'transactions',
            limit: 1000,
            overage: {
              enabled: true,
              ratePerUnit: { amount: 0.1, currency: 'USD', display: '$0.10' },
              tiers: [],
            },
            resetPeriod: 'monthly',
          },
          {
            metric: 'volume',
            limit: 50000,
            overage: {
              enabled: false,
              ratePerUnit: { amount: 0, currency: 'USD', display: '$0' },
              tiers: [],
            },
            resetPeriod: 'monthly',
          },
        ],
        support: {
          responseTime: {
            critical: 'N/A',
            high: '24h',
            medium: '48h',
            low: '72h',
          },
          channels: ['email'],
          availability: 'Business hours',
          dedicatedManager: false,
          onboardingIncluded: false,
          trainingHours: 0,
        },
        sla: {
          uptime: 99.5,
          responseTime: 200,
          resolution: { critical: 48, high: 24, medium: 12, low: 8 },
          credits: [{ threshold: 99, creditPercentage: 5 }],
        },
        targetMarket: ['Small businesses', 'Startups', 'Solo entrepreneurs'],
        competitiveAdvantages: [
          'AI optimization at entry level',
          'No setup fees',
          'Quick implementation',
        ],
      },
      {
        id: 'professional',
        name: 'Professional',
        description:
          'Advanced features for growing businesses that need comprehensive payment intelligence',
        tier: 'professional',
        basePrice: { amount: 299, currency: 'USD', display: '$299' },
        features: [
          {
            feature: 'Payment Optimization',
            included: true,
            description: 'Advanced AI routing with A/B testing',
            businessValue: 'Reduce processing costs by 15-25%',
          },
          {
            feature: 'Advanced Analytics',
            included: true,
            description: 'Real-time dashboards and custom reports',
            businessValue: 'Make data-driven decisions',
          },
          {
            feature: 'Fraud Detection',
            included: true,
            description: 'ML-powered fraud prevention',
            businessValue: 'Prevent up to 99% of fraud attempts',
          },
          {
            feature: 'Business Intelligence',
            included: true,
            description: 'Revenue impact analysis',
            businessValue: 'Identify optimization opportunities',
          },
          {
            feature: 'API Access',
            included: true,
            description: 'Full REST API access',
            businessValue: 'Integrate with existing systems',
          },
          {
            feature: 'Chat Support',
            included: true,
            description: '24/7 chat support',
            businessValue: 'Get immediate help',
          },
        ],
        limits: [
          {
            metric: 'transactions',
            limit: 10000,
            overage: {
              enabled: true,
              ratePerUnit: { amount: 0.05, currency: 'USD', display: '$0.05' },
              tiers: [],
            },
            resetPeriod: 'monthly',
          },
          {
            metric: 'volume',
            limit: 500000,
            overage: {
              enabled: false,
              ratePerUnit: { amount: 0, currency: 'USD', display: '$0' },
              tiers: [],
            },
            resetPeriod: 'monthly',
          },
        ],
        support: {
          responseTime: {
            critical: '4h',
            high: '8h',
            medium: '24h',
            low: '48h',
          },
          channels: ['email', 'chat'],
          availability: '24/7',
          dedicatedManager: false,
          onboardingIncluded: true,
          trainingHours: 2,
        },
        sla: {
          uptime: 99.9,
          responseTime: 100,
          resolution: { critical: 24, high: 12, medium: 8, low: 4 },
          credits: [
            { threshold: 99.5, creditPercentage: 5 },
            { threshold: 99, creditPercentage: 10 },
          ],
        },
        targetMarket: [
          'Growing businesses',
          'E-commerce platforms',
          'SaaS companies',
        ],
        competitiveAdvantages: [
          'Comprehensive BI suite',
          'Advanced fraud protection',
          'API-first approach',
        ],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description:
          'Complete payment intelligence platform for large organizations with custom requirements',
        tier: 'enterprise',
        basePrice: { amount: 999, currency: 'USD', display: '$999' },
        features: [
          {
            feature: 'Payment Optimization',
            included: true,
            description: 'Enterprise AI with custom models',
            businessValue: 'Reduce processing costs by 25-35%',
          },
          {
            feature: 'Advanced Analytics',
            included: true,
            description: 'Executive dashboards and white-label reporting',
            businessValue: 'Enterprise-grade insights',
          },
          {
            feature: 'Fraud Detection',
            included: true,
            description: 'Custom fraud models with real-time training',
            businessValue: 'Industry-leading fraud prevention',
          },
          {
            feature: 'Business Intelligence',
            included: true,
            description: 'Competitive intelligence and industry research',
            businessValue: 'Market leadership insights',
          },
          {
            feature: 'White-Label Solutions',
            included: true,
            description: 'Full white-label platform',
            businessValue: 'Brand consistency across touchpoints',
          },
          {
            feature: 'Enterprise Security',
            included: true,
            description: 'SOC 2, PCI DSS compliance',
            businessValue: 'Meet enterprise security requirements',
          },
          {
            feature: 'Dedicated Support',
            included: true,
            description: 'Dedicated success manager',
            businessValue: 'Proactive optimization and support',
          },
        ],
        limits: [
          {
            metric: 'transactions',
            limit: 100000,
            overage: {
              enabled: true,
              ratePerUnit: { amount: 0.02, currency: 'USD', display: '$0.02' },
              tiers: [],
            },
            resetPeriod: 'monthly',
          },
          {
            metric: 'volume',
            limit: 10000000,
            overage: {
              enabled: false,
              ratePerUnit: { amount: 0, currency: 'USD', display: '$0' },
              tiers: [],
            },
            resetPeriod: 'monthly',
          },
        ],
        support: {
          responseTime: { critical: '1h', high: '2h', medium: '4h', low: '8h' },
          channels: ['email', 'chat', 'phone', 'video'],
          availability: '24/7',
          dedicatedManager: true,
          onboardingIncluded: true,
          trainingHours: 10,
        },
        sla: {
          uptime: 99.95,
          responseTime: 50,
          resolution: { critical: 4, high: 8, medium: 24, low: 48 },
          credits: [
            { threshold: 99.9, creditPercentage: 5 },
            { threshold: 99.5, creditPercentage: 10 },
            { threshold: 99, creditPercentage: 25 },
          ],
        },
        targetMarket: [
          'Enterprise corporations',
          'Large e-commerce',
          'Payment service providers',
        ],
        competitiveAdvantages: [
          'Complete platform suite',
          'Custom AI models',
          'Enterprise-grade compliance',
        ],
      },
    ];
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  private async calculateSubscriptionPricing(
    plan: SubscriptionPlan,
    billingCycle: BillingCycle,
    request: any
  ): Promise<SubscriptionPricing> {
    let baseAmount = plan.basePrice.amount;

    // Apply billing cycle discount
    if (billingCycle.discountPercentage > 0) {
      baseAmount *= 1 - billingCycle.discountPercentage / 100;
    }

    // Add customizations cost
    const customizationCost = (request.customizations || []).reduce(
      (sum: number, custom: Customization) =>
        sum + (custom.additionalCost?.amount || 0),
      0
    );

    const subtotal = baseAmount + customizationCost;
    const discountAmount = 0; // Will be calculated based on discount codes
    const taxAmount = subtotal * 0.08; // 8% tax (simplified)
    const totalAmount = subtotal - discountAmount + taxAmount;

    return {
      baseAmount: {
        amount: baseAmount,
        currency: plan.basePrice.currency,
        display: `$${baseAmount}`,
      },
      discountAmount: {
        amount: discountAmount,
        currency: plan.basePrice.currency,
        display: `$${discountAmount}`,
      },
      taxAmount: {
        amount: taxAmount,
        currency: plan.basePrice.currency,
        display: `$${taxAmount}`,
      },
      totalAmount: {
        amount: totalAmount,
        currency: plan.basePrice.currency,
        display: `$${totalAmount}`,
      },
      nextBillingAmount: {
        amount: totalAmount,
        currency: plan.basePrice.currency,
        display: `$${totalAmount}`,
      },
      projectedOverage: {
        amount: 0,
        currency: plan.basePrice.currency,
        display: '$0',
      },
    };
  }

  private initializeUsageTracking(plan: SubscriptionPlan): UsageData[] {
    return plan.limits.map(limit => ({
      metric: limit.metric,
      current: 0,
      limit: limit.limit,
      percentage: 0,
      trend: 'stable' as const,
      lastUpdated: new Date(),
    }));
  }

  private async applyDiscounts(
    discountCodes: string[],
    pricing: SubscriptionPricing
  ): Promise<AppliedDiscount[]> {
    return []; // Simplified - would implement discount code logic
  }

  private async processAddOns(
    addOnIds: string[]
  ): Promise<AddOnSubscription[]> {
    return []; // Simplified - would implement add-on processing
  }

  private async generateInvoice(subscription: Subscription): Promise<Invoice> {
    return {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      subscriptionId: subscription.id,
      amount: subscription.pricing.totalAmount,
      status: 'open',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      lineItems: [
        {
          description: 'Subscription fee',
          quantity: 1,
          unitPrice: subscription.pricing.baseAmount,
          totalPrice: subscription.pricing.baseAmount,
        },
      ],
      taxBreakdown: [
        {
          taxType: 'Sales Tax',
          rate: 8,
          amount: subscription.pricing.taxAmount,
          jurisdiction: 'US',
        },
      ],
      discounts: [],
    };
  }

  private async updateUsageMetric(
    subscription: Subscription,
    metric: { metric: string; value: number; timestamp?: Date }
  ): Promise<void> {
    const usageData = subscription.usage.currentPeriod.find(
      u => u.metric === metric.metric
    );
    if (usageData) {
      usageData.current += metric.value;
      usageData.percentage = (usageData.current / usageData.limit) * 100;
      usageData.lastUpdated = metric.timestamp || new Date();
    }
  }

  private async checkUsageAlerts(
    subscription: Subscription
  ): Promise<UsageAlert[]> {
    const alerts: UsageAlert[] = [];

    for (const usage of subscription.usage.currentPeriod) {
      if (usage.percentage > 80) {
        alerts.push({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          metric: usage.metric,
          threshold: 80,
          currentValue: usage.current,
          severity: usage.percentage > 95 ? 'critical' : 'warning',
          message: `${usage.metric} usage is at ${usage.percentage.toFixed(1)}% of limit`,
          actionRequired: usage.percentage > 95,
          suggestions:
            usage.percentage > 95
              ? ['Consider upgrading plan', 'Optimize usage patterns']
              : ['Monitor usage closely'],
        });
      }
    }

    return alerts;
  }

  private async generateOptimizationSuggestions(
    subscription: Subscription
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // Check if plan upgrade would be beneficial
    const averageUsage =
      subscription.usage.currentPeriod.reduce(
        (sum, u) => sum + u.percentage,
        0
      ) / subscription.usage.currentPeriod.length;

    if (averageUsage > 85) {
      suggestions.push({
        type: 'plan_upgrade',
        title: 'Consider Plan Upgrade',
        description:
          'Your usage patterns suggest you might benefit from a higher tier plan',
        impact: {
          featureBenefit: 'Higher limits and additional features',
          additionalCost: { amount: 200, currency: 'USD', display: '$200' },
        },
        effort: 'low',
        priority: 'medium',
      });
    }

    return suggestions;
  }

  private async calculateChargeBreakdown(subscription: Subscription): Promise<{
    projected: Money;
    usage: Money;
    discounts: Money;
    taxes: Money;
  }> {
    return {
      projected: subscription.pricing.nextBillingAmount,
      usage: subscription.pricing.projectedOverage,
      discounts: subscription.pricing.discountAmount,
      taxes: subscription.pricing.taxAmount,
    };
  }

  private calculateChurnRate(subscriptions: Subscription[]): number {
    const canceledThisMonth = subscriptions.filter(
      s =>
        s.status === 'canceled' &&
        s.endDate &&
        s.endDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    return (canceledThisMonth / subscriptions.length) * 100;
  }

  private calculateARPU(subscriptions: Subscription[]): Money {
    const totalRevenue = subscriptions.reduce(
      (sum, s) => sum + s.pricing.totalAmount.amount,
      0
    );
    const activeSubscriptions = subscriptions.filter(
      s => s.status === 'active'
    ).length;

    return {
      amount: totalRevenue / activeSubscriptions,
      currency: 'USD',
      display: `$${(totalRevenue / activeSubscriptions).toFixed(2)}`,
    };
  }

  private calculateCLV(subscriptions: Subscription[]): Money {
    const arpu = this.calculateARPU(subscriptions);
    const averageLifetime = 24; // months (estimated)

    return {
      amount: arpu.amount * averageLifetime,
      currency: 'USD',
      display: `$${(arpu.amount * averageLifetime).toFixed(2)}`,
    };
  }

  private calculateExpansionRevenue(subscriptions: Subscription[]): Money {
    // Simplified calculation - would track actual plan upgrades and add-ons
    return { amount: 25000, currency: 'USD', display: '$25,000' };
  }

  private analyzePlanDistribution(
    subscriptions: Subscription[]
  ): PlanDistribution[] {
    const distribution = new Map<string, { count: number; revenue: number }>();

    for (const subscription of subscriptions) {
      const current = distribution.get(subscription.planId) || {
        count: 0,
        revenue: 0,
      };
      current.count++;
      current.revenue += subscription.pricing.totalAmount.amount;
      distribution.set(subscription.planId, current);
    }

    return Array.from(distribution.entries()).map(([planId, data]) => {
      const plan = this.config.plans.find(p => p.id === planId);
      return {
        planId,
        planName: plan?.name || 'Unknown',
        customerCount: data.count,
        percentage: (data.count / subscriptions.length) * 100,
        revenue: {
          amount: data.revenue,
          currency: 'USD',
          display: `$${data.revenue}`,
        },
      };
    });
  }

  private analyzeUsagePatterns(subscriptions: Subscription[]): UsagePattern[] {
    return [
      {
        pattern: 'High volume, low transaction count',
        frequency: 15,
        averageUsage: 850000,
        costImpact: { amount: 12000, currency: 'USD', display: '$12,000' },
        optimizationPotential: 'Volume-based pricing optimization',
      },
      {
        pattern: 'Consistent daily usage',
        frequency: 32,
        averageUsage: 45000,
        costImpact: { amount: 5500, currency: 'USD', display: '$5,500' },
        optimizationPotential: 'Predictive scaling',
      },
    ];
  }

  private async calculateSatisfactionScore(): Promise<number> {
    // Simplified - would integrate with customer feedback systems
    return 87.3;
  }

  private async analyzeCustomerUsage(subscription: Subscription): Promise<unknown> {
    return {
      averageUsage:
        subscription.usage.currentPeriod.reduce(
          (sum, u) => sum + u.percentage,
          0
        ) / subscription.usage.currentPeriod.length,
      peakUsage: Math.max(
        ...subscription.usage.currentPeriod.map(u => u.percentage)
      ),
      growthTrend: 'increasing',
      utilizationEfficiency: 75,
    };
  }

  private async findOptimalPlan(
    subscription: Subscription,
    usageAnalysis: any
  ): Promise<SubscriptionPlan | undefined> {
    if (usageAnalysis.averageUsage > 85) {
      // Find next tier up
      const currentPlan = this.config.plans.find(
        p => p.id === subscription.planId
      );
      const tiers = ['starter', 'professional', 'enterprise', 'custom'];
      const currentTierIndex = tiers.indexOf(currentPlan?.tier || 'starter');

      if (currentTierIndex < tiers.length - 1) {
        return this.config.plans.find(
          p => p.tier === tiers[currentTierIndex + 1]
        );
      }
    }

    return undefined;
  }

  private calculatePlanDifference(
    currentPlan: SubscriptionPlan,
    recommendedPlan: SubscriptionPlan
  ): Money {
    const difference =
      recommendedPlan.basePrice.amount - currentPlan.basePrice.amount;
    return {
      amount: Math.abs(difference),
      currency: 'USD',
      display: `$${Math.abs(difference)}`,
    };
  }

  private generateOptimizationReasons(
    subscription: Subscription,
    usageAnalysis: any,
    recommendedPlan?: SubscriptionPlan
  ): string[] {
    const reasons: string[] = [];

    if (usageAnalysis.averageUsage > 85) {
      reasons.push('Current usage exceeds 85% of plan limits');
    }

    if (recommendedPlan) {
      reasons.push(
        `${recommendedPlan.name} plan offers better value for your usage patterns`
      );
      reasons.push(
        'Additional features would benefit your business operations'
      );
    }

    return reasons;
  }

  private getUpgradeBenefits(
    currentPlan: SubscriptionPlan,
    recommendedPlan: SubscriptionPlan
  ): string[] {
    const benefits: string[] = [];

    for (const feature of recommendedPlan.features) {
      const currentFeature = currentPlan.features.find(
        f => f.feature === feature.feature
      );
      if (!currentFeature?.included && feature.included) {
        benefits.push(feature.businessValue);
      }
    }

    return benefits;
  }
}
