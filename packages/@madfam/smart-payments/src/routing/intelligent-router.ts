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
 * Intelligent Gateway Router
 *
 * Selects optimal payment gateway based on multiple factors
 */

import {
  Gateway,
  PaymentContext,
  PaymentOptions,
  GatewayOption,
  SelectionFactor,
  SelectionReasoning,
  CardInfo,
  GeographicalContext,
  Customer,
  Money,
  InstallmentOption,
  DisplayFees,
  FeeBreakdown,
} from '../types';
import {
  DEFAULT_GATEWAY_CONFIGS,
  GatewayFeeCalculator,
} from './gateway-config';
import { CardDetector } from '../card-intelligence/detector';
import { GeographicalContextEngine } from '../geo/context-engine';

export interface RouterConfig {
  enableUserChoice?: boolean;
  userChoiceThreshold?: number; // Percentage difference to show alternatives
  preferProfitableGateways?: boolean;
  blockHighRiskGateways?: string[];
  customGatewayConfigs?: Record<string, unknown>;
}

/**
 * Main routing engine
 */
export class IntelligentRouter {
  private feeCalculator: GatewayFeeCalculator;
  private cardDetector: CardDetector;
  private geoEngine: GeographicalContextEngine;

  constructor(
    private config: RouterConfig = {},
    cardDetector?: CardDetector,
    geoEngine?: GeographicalContextEngine
  ) {
    this.feeCalculator = new GatewayFeeCalculator();
    this.cardDetector = cardDetector || new CardDetector();
    this.geoEngine = geoEngine || new GeographicalContextEngine();
  }

  /**
   * Route payment to optimal gateway
   */
  async route(context: PaymentContext): Promise<PaymentOptions> {
    // Extract context information
    const { amount, cardInfo, geoContext, customer } = context;

    // Get available gateways
    const availableGateways = await this.getAvailableGateways(
      cardInfo,
      geoContext,
      customer
    );

    if (availableGateways.length === 0) {
      throw new Error('No available payment gateways for this transaction');
    }

    // Score each gateway
    const scoredGateways = await this.scoreGateways(availableGateways, context);

    // Sort by score (higher is better)
    scoredGateways.sort((a, b) => b.score - a.score);

    // Determine if user choice should be offered
    const shouldOfferChoice = this.shouldOfferUserChoice(scoredGateways);

    // Build gateway options
    const gatewayOptions = await this.buildGatewayOptions(
      scoredGateways.slice(0, shouldOfferChoice ? 3 : 1),
      context
    );

    // Generate reasoning
    const reasoning = this.generateReasoning(
      scoredGateways[0],
      context,
      shouldOfferChoice
    );

    return {
      recommendedGateway: gatewayOptions[0],
      alternativeGateways: gatewayOptions.slice(1),
      userChoice: shouldOfferChoice,
      reasoning,
      pricingContext: context.pricingContext || {
        displayPrice: amount,
        displayCurrency: amount.currency,
        basePrice: amount,
        reasoning: {
          applied: 'base_price',
          explanation: 'Base pricing applied',
          factors: [],
        },
        discountApplied: false,
        eligibleDiscounts: [],
      },
    };
  }

  /**
   * Get available gateways for the transaction
   */
  private async getAvailableGateways(
    cardInfo?: CardInfo,
    geoContext?: GeographicalContext,
    customer?: Customer
  ): Promise<Gateway[]> {
    let gateways: Gateway[] = Object.keys(DEFAULT_GATEWAY_CONFIGS) as Gateway[];

    // Filter by card support
    if (cardInfo) {
      gateways = gateways.filter(g => cardInfo.supportedGateways.includes(g));
    }

    // Filter by country support
    if (geoContext?.ipCountry) {
      gateways = gateways.filter(g => {
        const config = DEFAULT_GATEWAY_CONFIGS[g];
        return (
          config.supportedCountries.includes('*') ||
          config.supportedCountries.includes(geoContext.ipCountry!)
        );
      });
    }

    // Filter blocked gateways
    if (this.config.blockHighRiskGateways) {
      gateways = gateways.filter(
        g => !this.config.blockHighRiskGateways!.includes(g)
      );
    }

    // Filter based on customer preferences
    if (customer?.preferences?.preferredGateway) {
      // Move preferred to front if available
      const preferred = customer.preferences.preferredGateway;
      if (gateways.includes(preferred)) {
        gateways = [preferred, ...gateways.filter(g => g !== preferred)];
      }
    }

    return gateways;
  }

  /**
   * Score gateways based on multiple factors
   */
  private async scoreGateways(
    gateways: Gateway[],
    context: PaymentContext
  ): Promise<
    Array<{
      gateway: Gateway;
      score: number;
      factors: SelectionFactor[];
    }>
  > {
    const { amount, cardInfo, geoContext, customer } = context;

    return Promise.all(
      gateways.map(async gateway => {
        const factors: SelectionFactor[] = [];
        let score = 50; // Base score

        // Factor 1: Transaction fees
        const fees = this.feeCalculator.calculateFees(
          gateway,
          amount,
          this.isInternationalCard(cardInfo, geoContext)
        );

        const feePercentage = fees.totalFee.amount / amount.amount;

        if (feePercentage < 0.03) {
          factors.push({
            factor: 'low_fees',
            weight: 25,
            impact: 'positive',
            description: `Low processing fees (${(feePercentage * 100).toFixed(2)}%)`,
          });
          score += 25;
        } else if (feePercentage > 0.05) {
          factors.push({
            factor: 'high_fees',
            weight: -20,
            impact: 'negative',
            description: `High processing fees (${(feePercentage * 100).toFixed(2)}%)`,
          });
          score -= 20;
        }

        // Factor 2: Local payment method support
        if (cardInfo?.localPaymentMethods) {
          const config = DEFAULT_GATEWAY_CONFIGS[gateway];
          const hasLocalSupport = cardInfo.localPaymentMethods.some(lpm =>
            config.features.localPaymentMethods.includes(lpm.id)
          );

          if (hasLocalSupport) {
            factors.push({
              factor: 'local_payment_support',
              weight: 20,
              impact: 'positive',
              description: 'Supports local payment methods',
            });
            score += 20;
          }
        }

        // Factor 3: Geographical optimization
        if (geoContext?.ipCountry) {
          const config = DEFAULT_GATEWAY_CONFIGS[gateway];
          if (config.priority.includes(geoContext.ipCountry)) {
            factors.push({
              factor: 'geographical_optimization',
              weight: 15,
              impact: 'positive',
              description: `Optimized for ${geoContext.ipCountry}`,
            });
            score += 15;
          }
        }

        // Factor 4: Installment support
        if (this.isInstallmentEligible(context)) {
          const config = DEFAULT_GATEWAY_CONFIGS[gateway];
          if (config.features.supportsInstallments) {
            factors.push({
              factor: 'installment_support',
              weight: 10,
              impact: 'positive',
              description: 'Supports installment payments',
            });
            score += 10;
          }
        }

        // Factor 5: Customer history
        if (customer?.preferences?.preferredGateway === gateway) {
          factors.push({
            factor: 'customer_preference',
            weight: 15,
            impact: 'positive',
            description: "Customer's preferred gateway",
          });
          score += 15;
        }

        // Factor 6: Risk assessment
        if (geoContext?.riskScore && geoContext.riskScore > 50) {
          // Prefer gateways with better fraud protection
          if (gateway === 'stripe' || gateway === 'paypal') {
            factors.push({
              factor: 'fraud_protection',
              weight: 10,
              impact: 'positive',
              description: 'Strong fraud protection for high-risk transaction',
            });
            score += 10;
          }
        }

        // Factor 7: Profitability (if enabled)
        if (this.config.preferProfitableGateways) {
          const profitScore = this.calculateProfitabilityScore(gateway, amount);
          if (profitScore > 0) {
            factors.push({
              factor: 'profitability',
              weight: profitScore,
              impact: 'positive',
              description: 'Higher profit margin',
            });
            score += profitScore;
          }
        }

        return {
          gateway,
          score: Math.max(0, Math.min(100, score)),
          factors,
        };
      })
    );
  }

  /**
   * Determine if user choice should be offered
   */
  private shouldOfferUserChoice(
    scoredGateways: Array<{ gateway: Gateway; score: number }>
  ): boolean {
    if (!this.config.enableUserChoice) {
      return false;
    }

    if (scoredGateways.length < 2) {
      return false;
    }

    // Check if top gateways are close in score
    const threshold = this.config.userChoiceThreshold || 10;
    const topScore = scoredGateways[0].score;
    const secondScore = scoredGateways[1].score;

    return topScore - secondScore <= threshold;
  }

  /**
   * Build detailed gateway options
   */
  private async buildGatewayOptions(
    scoredGateways: Array<{
      gateway: Gateway;
      score: number;
      factors: SelectionFactor[];
    }>,
    context: PaymentContext
  ): Promise<GatewayOption[]> {
    const { amount, cardInfo, geoContext } = context;

    return Promise.all(
      scoredGateways.map(async ({ gateway, factors }) => {
        const config = DEFAULT_GATEWAY_CONFIGS[gateway];
        const isInternational = this.isInternationalCard(cardInfo, geoContext);

        // Calculate fees
        const fees = this.feeCalculator.calculateFees(
          gateway,
          amount,
          isInternational
        );

        // Build fee breakdown
        const breakdown: FeeBreakdown = {
          baseFee: {
            amount: fees.percentageFee.amount + fees.fixedFee.amount,
            currency: amount.currency,
            display: this.formatMoney(
              fees.percentageFee.amount + fees.fixedFee.amount,
              amount.currency
            ),
          },
        };

        if (fees.internationalFee) {
          breakdown.internationalFee = fees.internationalFee;
        }

        // Display fees
        const displayFees: DisplayFees = {
          processing: fees.totalFee,
          display: `${((fees.totalFee.amount / amount.amount) * 100).toFixed(2)}% + ${fees.fixedFee.display}`,
          breakdown,
        };

        // Calculate total
        const estimatedTotal: Money = {
          amount: amount.amount + fees.totalFee.amount,
          currency: amount.currency,
          display: this.formatMoney(
            amount.amount + fees.totalFee.amount,
            amount.currency
          ),
        };

        // Build benefits and drawbacks
        const benefits = this.getGatewayBenefits(gateway, factors);
        const drawbacks = this.getGatewayDrawbacks(gateway, factors);

        // Get installment options if applicable
        const installmentOptions =
          this.isInstallmentEligible(context) &&
          config.features.supportsInstallments
            ? this.getInstallmentOptions(gateway, amount)
            : undefined;

        // Get trust signals
        const trustSignals = this.getTrustSignals(
          gateway,
          geoContext?.ipCountry
        );

        return {
          gateway,
          displayName: config.displayName,
          fees: displayFees,
          estimatedTotal,
          processingFee: fees.totalFee,
          benefits,
          drawbacks: drawbacks.length > 0 ? drawbacks : undefined,
          processingTime: config.processingTime,
          supportedFeatures: this.getSupportedFeatures(config.features),
          installmentOptions,
          localizedName: this.getLocalizedName(gateway, geoContext?.language),
          trustSignals: trustSignals.length > 0 ? trustSignals : undefined,
        };
      })
    );
  }

  /**
   * Generate user-friendly reasoning
   */
  private generateReasoning(
    topGateway: {
      gateway: Gateway;
      score: number;
      factors: SelectionFactor[];
    },
    context: PaymentContext,
    userChoice: boolean
  ): SelectionReasoning {
    const primaryFactors = topGateway.factors
      .filter(f => f.impact === 'positive')
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);

    const userFriendlyExplanation = this.buildUserFriendlyExplanation(
      topGateway.gateway,
      primaryFactors,
      userChoice
    );

    const technicalExplanation = this.buildTechnicalExplanation(
      topGateway,
      context
    );

    return {
      factors: topGateway.factors,
      userFriendlyExplanation,
      technicalExplanation,
    };
  }

  // Helper methods

  private isInternationalCard(
    cardInfo?: CardInfo,
    geoContext?: GeographicalContext
  ): boolean {
    if (!cardInfo || !geoContext?.ipCountry) {
      return false;
    }

    return cardInfo.issuerCountry !== geoContext.ipCountry;
  }

  private isInstallmentEligible(context: PaymentContext): boolean {
    const { amount, cardInfo, geoContext } = context;

    // Country eligibility
    const eligibleCountries = ['MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'IN', 'TR'];
    const country = cardInfo?.issuerCountry || geoContext?.ipCountry;

    if (!country || !eligibleCountries.includes(country)) {
      return false;
    }

    // Amount threshold (varies by country)
    const thresholds: Record<string, number> = {
      MX: 300, // 300 MXN
      BR: 100, // 100 BRL
      AR: 5000, // 5000 ARS
      IN: 3000, // 3000 INR
    };

    const threshold = thresholds[country] || 50; // Default $50 USD
    return amount.amount >= threshold;
  }

  private calculateProfitabilityScore(gateway: Gateway, amount: Money): number {
    // Calculate merchant's profit margin with each gateway
    const config = DEFAULT_GATEWAY_CONFIGS[gateway];
    const effectiveRate = this.feeCalculator.getEffectiveRate(gateway, amount);

    // Lower effective rate = higher profit
    if (effectiveRate < 0.03) return 15;
    if (effectiveRate < 0.04) return 10;
    if (effectiveRate < 0.05) return 5;
    return 0;
  }

  private getGatewayBenefits(
    gateway: Gateway,
    factors: SelectionFactor[]
  ): string[] {
    const benefits: string[] = [];

    // Add factor-based benefits
    factors
      .filter(f => f.impact === 'positive')
      .forEach(f => benefits.push(f.description));

    // Add gateway-specific benefits
    const gatewayBenefits: Record<Gateway, string[]> = {
      stripe: ['Excellent fraud protection', 'Wide currency support'],
      mercadopago: ['Popular in Latin America', 'Local payment methods'],
      lemonsqueezy: ['Simple integration', 'Global coverage'],
      paypal: ['Trusted by customers', 'Buyer protection'],
      razorpay: ['Best for Indian market', 'UPI support'],
      payu: ['Multi-region support', 'Local expertise'],
      custom: [],
    };

    benefits.push(...(gatewayBenefits[gateway] || []));

    return [...new Set(benefits)]; // Remove duplicates
  }

  private getGatewayDrawbacks(
    gateway: Gateway,
    factors: SelectionFactor[]
  ): string[] {
    const drawbacks: string[] = [];

    // Add factor-based drawbacks
    factors
      .filter(f => f.impact === 'negative')
      .forEach(f => drawbacks.push(f.description));

    // Add gateway-specific drawbacks
    const gatewayDrawbacks: Record<Gateway, string[]> = {
      stripe: [],
      mercadopago: ['Limited to LATAM region'],
      lemonsqueezy: ['Higher fees', 'No installments'],
      paypal: ['No 3D Secure', 'Account required for some features'],
      razorpay: ['India only'],
      payu: ['Complex fee structure'],
      custom: ['Unknown reliability'],
    };

    drawbacks.push(...(gatewayDrawbacks[gateway] || []));

    return [...new Set(drawbacks)];
  }

  private getInstallmentOptions(
    gateway: Gateway,
    amount: Money
  ): InstallmentOption[] {
    const options: InstallmentOption[] = [];
    const months = [3, 6, 12];

    for (const month of months) {
      const interestRate = this.getInstallmentRate(gateway, month);
      const totalAmount = amount.amount * (1 + interestRate);
      const monthlyAmount = totalAmount / month;

      options.push({
        months: month,
        monthlyAmount: {
          amount: monthlyAmount,
          currency: amount.currency,
          display: this.formatMoney(monthlyAmount, amount.currency),
        },
        totalAmount: {
          amount: totalAmount,
          currency: amount.currency,
          display: this.formatMoney(totalAmount, amount.currency),
        },
        interestRate,
        label: `${month} months${interestRate > 0 ? ` (+${(interestRate * 100).toFixed(1)}%)` : ' interest-free'}`,
      });
    }

    return options;
  }

  private getInstallmentRate(gateway: Gateway, months: number): number {
    const rates: Record<Gateway, Record<number, number>> = {
      mercadopago: { 3: 0, 6: 0.05, 12: 0.1 },
      stripe: { 3: 0, 6: 0.03, 12: 0.06 },
      razorpay: { 3: 0.02, 6: 0.05, 12: 0.09 },
      payu: { 3: 0.03, 6: 0.05, 12: 0.08 },
      paypal: { 3: 0, 6: 0.04, 12: 0.08 },
      lemonsqueezy: {},
      custom: {},
    };

    return rates[gateway]?.[months] || 0;
  }

  private getSupportedFeatures(features: any): string[] {
    const supported: string[] = [];

    if (features.supports3DSecure) supported.push('3D Secure');
    if (features.supportsRecurring) supported.push('Subscriptions');
    if (features.supportsRefunds) supported.push('Refunds');
    if (features.supportsSavedCards) supported.push('Save cards');
    if (features.supportsMultiCurrency) supported.push('Multi-currency');

    return supported;
  }

  private getTrustSignals(gateway: Gateway, country?: string): string[] {
    const signals: string[] = [];

    const trustData: Record<Gateway, { users?: string; countries?: number }> = {
      stripe: { users: '3M+', countries: 47 },
      paypal: { users: '400M+', countries: 200 },
      mercadopago: { users: '100M+', countries: 18 },
      razorpay: { users: '10M+', countries: 1 },
      lemonsqueezy: { users: '10K+', countries: 150 },
      payu: { users: '300K+', countries: 50 },
      custom: {},
    };

    const data = trustData[gateway];
    if (data?.users) signals.push(`${data.users} users`);
    if (data?.countries)
      signals.push(`Available in ${data.countries} countries`);

    // Local trust signals
    if (
      country &&
      gateway === 'mercadopago' &&
      ['BR', 'AR', 'MX'].includes(country)
    ) {
      signals.push('Most popular in your country');
    }

    return signals;
  }

  private getLocalizedName(
    gateway: Gateway,
    language?: string
  ): string | undefined {
    if (!language || language === 'en') return undefined;

    const localized: Record<string, Record<Gateway, string>> = {
      es: {
        stripe: 'Stripe',
        mercadopago: 'MercadoPago',
        lemonsqueezy: 'LemonSqueezy',
        paypal: 'PayPal',
        razorpay: 'Razorpay',
        payu: 'PayU',
        custom: 'Personalizado',
      },
      pt: {
        stripe: 'Stripe',
        mercadopago: 'MercadoPago',
        lemonsqueezy: 'LemonSqueezy',
        paypal: 'PayPal',
        razorpay: 'Razorpay',
        payu: 'PayU',
        custom: 'Personalizado',
      },
    };

    return localized[language]?.[gateway];
  }

  private buildUserFriendlyExplanation(
    gateway: Gateway,
    factors: SelectionFactor[],
    userChoice: boolean
  ): string {
    const config = DEFAULT_GATEWAY_CONFIGS[gateway];
    const primaryReason =
      factors[0]?.description || 'optimal for this transaction';

    if (userChoice) {
      return `We recommend ${config.displayName} because it's ${primaryReason}. However, you have other great options to choose from below.`;
    }

    return `${config.displayName} is the best option because it's ${primaryReason}.`;
  }

  private buildTechnicalExplanation(
    topGateway: any,
    context: PaymentContext
  ): string {
    const factors = topGateway.factors
      .map(f => `${f.factor} (${f.impact}, weight: ${f.weight})`)
      .join(', ');

    return `Gateway: ${topGateway.gateway}, Score: ${topGateway.score}/100, Factors: ${factors}`;
  }

  private formatMoney(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      BRL: 'R$',
      MXN: '$',
      ARS: '$',
    };

    const symbol = symbols[currency] || currency + ' ';
    return `${symbol}${amount.toFixed(2)}`;
  }
}
