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
 * SmartPayments - Main orchestrator class
 * 
 * Coordinates all modules for intelligent payment processing
 */

import {
  SmartPaymentsConfig,
  PaymentContext,
  PaymentOptions,
  CardInfo,
  GeographicalContext,
  Money,
  Customer,
  Gateway,
  RiskAssessment,
  BINLookupResponse,
  GeoLookupResponse,
  PriceCalculation,
  SmartPaymentsError,
} from './types';
import { CardDetector } from './card-intelligence/detector';
import { GeographicalContextEngine } from './geo/context-engine';
import { IntelligentRouter } from './routing/intelligent-router';
import { DynamicPricingEngine } from './pricing/dynamic-pricing';

export interface ProcessPaymentRequest {
  amount: Money;
  cardNumber?: string;
  ipAddress?: string;
  headers?: Record<string, string>;
  customer?: Customer;
  metadata?: Record<string, any>;
  requestedCountry?: string;
  discountCode?: string;
}

export interface ProcessPaymentResponse {
  paymentOptions: PaymentOptions;
  cardInfo?: CardInfo;
  geoContext?: GeographicalContext;
  riskAssessment?: RiskAssessment;
  pricing: PriceCalculation;
  warnings?: string[];
}

/**
 * Main SmartPayments orchestrator
 */
export class SmartPayments {
  private cardDetector: CardDetector;
  private geoEngine: GeographicalContextEngine;
  private router: IntelligentRouter;
  private pricingEngine: DynamicPricingEngine;
  
  constructor(private config: SmartPaymentsConfig) {
    // Initialize components
    this.cardDetector = new CardDetector({
      cacheSize: config.cache?.maxSize,
      cacheTTL: config.cache?.ttl,
    });
    
    this.geoEngine = new GeographicalContextEngine({
      enableVPNDetection: config.fraudPrevention.enableVPNDetection,
      suspiciousCountries: config.fraudPrevention.suspiciousCountries,
      cacheSize: config.cache?.maxSize,
      cacheTTL: config.cache?.ttl,
    });
    
    this.router = new IntelligentRouter({
      enableUserChoice: config.ui?.showSavingsAmount !== false,
      preferProfitableGateways: true,
    }, this.cardDetector, this.geoEngine);
    
    this.pricingEngine = new DynamicPricingEngine({
      strategy: config.pricingStrategy,
      enableManipulationDetection: config.fraudPrevention.blockVPNDiscounts,
    });
  }
  
  /**
   * Process a payment request through the smart payments system
   */
  async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    const warnings: string[] = [];
    
    try {
      // Step 1: Detect card information
      let cardInfo: CardInfo | undefined;
      if (request.cardNumber) {
        try {
          cardInfo = await this.cardDetector.detectCardCountry(request.cardNumber);
        } catch (error) {
          warnings.push('Could not detect card information');
        }
      }
      
      // Step 2: Build geographical context
      let geoContext: GeographicalContext | undefined;
      if (request.ipAddress) {
        try {
          geoContext = await this.geoEngine.buildContext(
            request.ipAddress,
            request.headers
          );
        } catch (error) {
          warnings.push('Could not determine geographical context');
        }
      }
      
      // Step 3: Calculate dynamic pricing
      const pricing = await this.pricingEngine.calculatePrice({
        basePrice: request.amount,
        cardCountry: cardInfo?.issuerCountry,
        ipCountry: geoContext?.ipCountry,
        vpnDetected: geoContext?.vpnDetected || false,
        customer: request.customer,
      });
      
      // Step 4: Assess risk
      let riskAssessment: RiskAssessment | undefined;
      if (geoContext) {
        riskAssessment = this.geoEngine.assessRisk(
          geoContext,
          cardInfo?.issuerCountry,
          request.customer
        );
        
        // Add warnings for high risk
        if (riskAssessment.risk === 'high' || riskAssessment.risk === 'critical') {
          warnings.push(riskAssessment.recommendation);
        }
      }
      
      // Step 5: Route to optimal gateway
      const paymentContext: PaymentContext = {
        amount: pricing.displayPrice,
        cardNumber: request.cardNumber,
        cardInfo,
        geoContext,
        customer: request.customer,
        metadata: request.metadata,
        pricingContext: pricing,
      };
      
      const paymentOptions = await this.router.route(paymentContext);
      
      // Step 6: Apply any additional business rules
      this.applyBusinessRules(paymentOptions, riskAssessment, warnings);
      
      return {
        paymentOptions,
        cardInfo,
        geoContext,
        riskAssessment,
        pricing,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      throw new SmartPaymentsError(
        'Failed to process payment',
        'PROCESSING_ERROR',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }
  
  /**
   * Lookup BIN information
   */
  async lookupBIN(bin: string): Promise<BINLookupResponse> {
    return this.cardDetector.lookupBIN(bin);
  }
  
  /**
   * Lookup geographical information
   */
  async lookupGeo(ipAddress: string, headers?: Record<string, string>): Promise<GeoLookupResponse> {
    return this.geoEngine.lookup(ipAddress, headers);
  }
  
  /**
   * Calculate fees for a specific gateway
   */
  calculateGatewayFees(gateway: Gateway, amount: Money, isInternational: boolean = false) {
    const feeCalculator = this.router['feeCalculator'];
    return feeCalculator.calculateFees(gateway, amount, isInternational);
  }
  
  /**
   * Get available gateways for a country
   */
  getAvailableGateways(country: string): Gateway[] {
    return Object.entries(this.config.gateways)
      .filter(([_, config]) => 
        config.supportedCountries.includes('*') || 
        config.supportedCountries.includes(country)
      )
      .map(([gateway]) => gateway as Gateway);
  }
  
  /**
   * Validate a discount code
   */
  validateDiscountCode(code: string, context: ProcessPaymentRequest): boolean {
    const discount = this.pricingEngine.validateDiscountCode(code, {
      basePrice: context.amount,
      cardCountry: undefined,
      ipCountry: undefined,
      vpnDetected: false,
      customer: context.customer,
    });
    
    return discount !== null;
  }
  
  // Private methods
  
  private applyBusinessRules(
    paymentOptions: PaymentOptions,
    riskAssessment?: RiskAssessment,
    warnings: string[]
  ): void {
    // High risk transactions
    if (riskAssessment && (riskAssessment.risk === 'high' || riskAssessment.risk === 'critical')) {
      // Force 3D Secure capable gateways
      const secure3DGateways = paymentOptions.alternativeGateways.filter(
        opt => opt.supportedFeatures.includes('3D Secure')
      );
      
      if (secure3DGateways.length > 0 && 
          !paymentOptions.recommendedGateway.supportedFeatures.includes('3D Secure')) {
        // Swap recommendation
        paymentOptions.alternativeGateways = [
          paymentOptions.recommendedGateway,
          ...paymentOptions.alternativeGateways.filter(g => g !== secure3DGateways[0])
        ];
        paymentOptions.recommendedGateway = secure3DGateways[0];
        warnings.push('Gateway changed due to security requirements');
      }
    }
    
    // Fraud prevention rules
    if (riskAssessment?.requiresManualReview) {
      paymentOptions.recommendedGateway.benefits.push('Enhanced fraud protection enabled');
    }
    
    // Maximum transaction limits
    const maxLimits: Record<Gateway, number> = {
      stripe: 999999,
      mercadopago: 50000,
      lemonsqueezy: 5000,
      paypal: 10000,
      razorpay: 100000,
      payu: 50000,
      custom: 1000,
    };
    
    const amount = paymentOptions.pricingContext.displayPrice.amount;
    if (amount > maxLimits[paymentOptions.recommendedGateway.gateway]) {
      warnings.push(`Transaction amount exceeds gateway limit`);
    }
  }
}