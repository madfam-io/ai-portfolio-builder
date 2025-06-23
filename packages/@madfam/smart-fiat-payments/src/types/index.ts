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
 * @madfam/smart-fiat-payments - Core type definitions
 *
 * Comprehensive type system for payment gateway detection and routing
 */

// Money and currency types
export interface Money {
  amount: number;
  currency: string;
  display?: string;
}

// Card-related types
export interface CardInfo {
  bin: string;
  lastFour?: string;
  brand: CardBrand;
  type: CardType;
  issuerCountry: string;
  issuerName?: string;
  issuerCurrency?: string;
  supportedGateways: Gateway[];
  preferredGateway?: Gateway;
  localPaymentMethods?: LocalPaymentMethod[];
  features: CardFeatures;
}

export interface CardFeatures {
  supports3DSecure: boolean;
  supportsInstallments: boolean;
  supportsTokenization: boolean;
  requiresCVV: boolean;
  maxInstallments?: number;
}

export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'diners'
  | 'jcb'
  | 'unionpay'
  | 'elo'
  | 'hipercard'
  | 'unknown';

export type CardType = 'credit' | 'debit' | 'prepaid' | 'unknown';

// Gateway types
export type Gateway =
  | 'stripe'
  | 'mercadopago'
  | 'lemonsqueezy'
  | 'paypal'
  | 'razorpay'
  | 'payu'
  | 'custom';

export interface GatewayConfig {
  id: Gateway;
  displayName: string;
  priority: string[]; // Country codes
  profitMargin: number; // Percentage as decimal
  supportedCountries: string[];
  supportedCurrencies: string[];
  features: GatewayFeatures;
  processingTime: string;
  setupFee?: Money;
  transactionFees: TransactionFees;
}

export interface GatewayFeatures {
  supportsInstallments: boolean;
  supports3DSecure: boolean;
  supportsRecurring: boolean;
  supportsRefunds: boolean;
  supportsPartialRefunds: boolean;
  supportsSavedCards: boolean;
  supportsMultiCurrency: boolean;
  localPaymentMethods: string[];
}

export interface TransactionFees {
  percentage: number;
  fixed: Money;
  internationalCard?: number; // Additional percentage
  currency?: string;
}

// Geographical context types
export interface GeographicalContext {
  ipCountry: string | null;
  ipRegion?: string;
  ipCity?: string;
  ipCurrency: string;
  vpnDetected: boolean;
  vpnConfidence: number; // 0-1
  proxyDetected: boolean;
  timezone: string;
  language: string;
  suspiciousActivity: boolean;
  riskScore: number; // 0-100
}

export interface VPNCheckResult {
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  isHosting: boolean;
  confidence: number;
  provider?: string;
}

// Pricing types
export interface PricingContext {
  basePrice: Money;
  cardCountry?: string;
  ipCountry?: string;
  vpnDetected: boolean;
  customer?: Customer;
}

export interface PriceCalculation {
  displayPrice: Money;
  displayCurrency: string;
  basePrice: Money;
  adjustment?: PriceAdjustment;
  cardCountryPrice?: Money;
  reasoning: PricingReason;
  discountApplied: boolean;
  savingsAmount?: Money;
  eligibleDiscounts: Discount[];
}

export interface PriceAdjustment {
  type: 'discount' | 'markup' | 'none';
  percentage: number;
  amount: Money;
  reason: string;
}

export interface Discount {
  id: string;
  type: 'geographical' | 'promotional' | 'loyalty' | 'student';
  amount: number; // Percentage
  eligibility: DiscountEligibility;
  validUntil?: Date;
}

export interface DiscountEligibility {
  countries?: string[];
  minAccountAge?: number; // days
  requiresVerification?: boolean;
  maxUsage?: number;
}

// Routing and selection types
export interface PaymentContext {
  amount: Money;
  cardNumber?: string;
  cardInfo?: CardInfo;
  geoContext?: GeographicalContext;
  customer?: Customer;
  metadata?: Record<string, unknown>;
}

export interface PaymentOptions {
  recommendedGateway: GatewayOption;
  alternativeGateways: GatewayOption[];
  userChoice: boolean;
  reasoning: SelectionReasoning;
  pricingContext: PriceCalculation;
}

export interface GatewayOption {
  gateway: Gateway;
  displayName: string;
  fees: DisplayFees;
  estimatedTotal: Money;
  processingFee: Money;
  benefits: string[];
  drawbacks?: string[];
  processingTime: string;
  supportedFeatures: string[];
  installmentOptions?: InstallmentOption[];
  localizedName?: string;
  trustSignals?: string[];
}

export interface DisplayFees {
  processing: Money;
  display: string;
  breakdown?: FeeBreakdown;
}

export interface FeeBreakdown {
  baseFee: Money;
  internationalFee?: Money;
  conversionFee?: Money;
  tax?: Money;
}

export interface InstallmentOption {
  months: number;
  monthlyAmount: Money;
  totalAmount: Money;
  interestRate: number;
  label: string;
}

export interface SelectionReasoning {
  factors: SelectionFactor[];
  userFriendlyExplanation: string;
  technicalExplanation: string;
}

export interface SelectionFactor {
  factor: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

// Customer types
export interface Customer {
  id: string;
  email?: string;
  country?: string;
  accountCreatedAt: Date;
  previousPurchases: number;
  totalSpent: Money;
  riskProfile?: RiskProfile;
  preferences?: CustomerPreferences;
}

export interface CustomerPreferences {
  preferredGateway?: Gateway;
  preferredCurrency?: string;
  acceptedInstallments?: boolean;
}

export interface RiskProfile {
  score: number; // 0-100
  flags: RiskFlag[];
  lastUpdated: Date;
}

export interface RiskFlag {
  type: 'vpn_abuse' | 'chargeback' | 'fraud_attempt' | 'suspicious_behavior';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details?: string;
}

// Local payment methods
export interface LocalPaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'cash' | 'wallet' | 'card' | 'other';
  countries: string[];
  gateway: Gateway;
  processingTime: string;
  fees?: TransactionFees;
}

// Fraud and risk types
export interface RiskAssessment {
  risk: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  reason: string | null;
  factors: RiskFactor[];
  recommendation: string;
  requiresManualReview: boolean;
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence?: any;
}

export interface FraudCheckResult {
  passed: boolean;
  score: number;
  checks: FraudCheck[];
  recommendation: 'approve' | 'review' | 'decline';
}

export interface FraudCheck {
  name: string;
  passed: boolean;
  score: number;
  details?: string;
}

// Configuration types
export interface SmartPaymentsConfig {
  gateways: GatewayConfig[];
  pricingStrategy: PricingStrategy;
  fraudPrevention: FraudConfig;
  ui?: UIConfig;
  analytics?: AnalyticsConfig;
  cache?: import('../performance').CacheConfig;
}

export interface PricingStrategy {
  enableGeographicalPricing: boolean;
  baseCountry: string;
  baseCurrency: string;
  discounts: Record<string, number>; // Country -> multiplier
  roundingStrategy: 'none' | 'nearest' | 'up' | 'down';
  displayLocalCurrency: boolean;
}

export interface FraudConfig {
  enableVPNDetection: boolean;
  blockVPNDiscounts: boolean;
  requireCardCountryMatch: boolean;
  minAccountAge?: number; // days
  maxRiskScore: number;
  suspiciousCountries?: string[];
}

export interface UIConfig {
  showSavingsAmount: boolean;
  showProcessingTime: boolean;
  showGatewayLogos: boolean;
  showFeeBreakdown: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface AnalyticsConfig {
  trackGatewaySelection: boolean;
  trackPricingEvents: boolean;
  trackFraudAttempts: boolean;
  customTracker?: (event: AnalyticsEvent) => void;
}

// Analytics types
export interface AnalyticsEvent {
  type:
    | 'gateway_selected'
    | 'pricing_displayed'
    | 'fraud_detected'
    | 'edge_case';
  timestamp: Date;
  data: Record<string, unknown>;
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  cardBrand?: CardBrand;
  cardType?: CardType;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

// Response types
export interface BINLookupResponse {
  success: boolean;
  cardInfo?: CardInfo;
  error?: string;
  cached: boolean;
}

export interface GeoLookupResponse {
  success: boolean;
  context?: GeographicalContext;
  error?: string;
  cached: boolean;
}

// Utility types
export interface PricingReason {
  applied: 'card_country' | 'ip_country' | 'base_price';
  explanation: string;
  factors: string[];
}

export type CurrencyCode = string; // ISO 4217

// Error types
export class SmartPaymentsError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SmartPaymentsError';
  }
}

export class BINLookupError extends SmartPaymentsError {
  constructor(message: string, details?: any) {
    super(message, 'BIN_LOOKUP_ERROR', details);
    this.name = 'BINLookupError';
  }
}

export class GeoLookupError extends SmartPaymentsError {
  constructor(message: string, details?: any) {
    super(message, 'GEO_LOOKUP_ERROR', details);
    this.name = 'GeoLookupError';
  }
}

export class ConfigurationError extends SmartPaymentsError {
  constructor(message: string, details?: any) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}
