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
 * Card Intelligence Detector
 *
 * Advanced card detection with BIN lookup, validation, and gateway recommendations
 */

import { LRUCache } from 'lru-cache';
import {
  CardInfo,
  CardBrand,
  CardType,
  Gateway,
  ValidationResult,
  ValidationError,
  BINLookupResponse,
  LocalPaymentMethod,
  CardFeatures,
} from '../types';
import { BINDatabase, InMemoryBINDatabase } from './bin-database';

// Gateway support by country
const GATEWAY_COUNTRY_SUPPORT: Record<Gateway, string[]> = {
  stripe: ['US', 'CA', 'GB', 'EU', 'AU', 'JP', 'SG', 'HK', 'MX', 'BR', 'IN'],
  mercadopago: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
  lemonsqueezy: ['*'], // Global
  paypal: ['*'], // Global but with restrictions
  razorpay: ['IN'],
  payu: ['IN', 'PL', 'TR', 'RU', 'ZA', 'CO', 'MX', 'AR', 'BR'],
  custom: [],
};

// Local payment methods by country
const LOCAL_PAYMENT_METHODS: Record<string, LocalPaymentMethod[]> = {
  MX: [
    {
      id: 'oxxo',
      name: 'OXXO',
      type: 'cash',
      countries: ['MX'],
      gateway: 'mercadopago',
      processingTime: '1-2 days',
    },
    {
      id: 'spei',
      name: 'SPEI',
      type: 'bank_transfer',
      countries: ['MX'],
      gateway: 'mercadopago',
      processingTime: 'Instant',
    },
  ],
  BR: [
    {
      id: 'boleto',
      name: 'Boleto Bancário',
      type: 'cash',
      countries: ['BR'],
      gateway: 'mercadopago',
      processingTime: '1-3 days',
    },
    {
      id: 'pix',
      name: 'PIX',
      type: 'bank_transfer',
      countries: ['BR'],
      gateway: 'mercadopago',
      processingTime: 'Instant',
    },
  ],
  IN: [
    {
      id: 'upi',
      name: 'UPI',
      type: 'wallet',
      countries: ['IN'],
      gateway: 'razorpay',
      processingTime: 'Instant',
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      type: 'bank_transfer',
      countries: ['IN'],
      gateway: 'razorpay',
      processingTime: 'Instant',
    },
  ],
  AR: [
    {
      id: 'rapipago',
      name: 'Rapipago',
      type: 'cash',
      countries: ['AR'],
      gateway: 'mercadopago',
      processingTime: '1-2 days',
    },
    {
      id: 'pagofacil',
      name: 'Pago Fácil',
      type: 'cash',
      countries: ['AR'],
      gateway: 'mercadopago',
      processingTime: '1-2 days',
    },
  ],
};

export interface CardDetectorConfig {
  binDatabase?: BINDatabase;
  cacheSize?: number;
  cacheTTL?: number;
}

/**
 * Main card detection and intelligence class
 */
export class CardDetector {
  private binDatabase: BINDatabase;
  private cache: LRUCache<string, CardInfo>;

  constructor(config: CardDetectorConfig = {}) {
    this.binDatabase = config.binDatabase || new InMemoryBINDatabase();
    this.cache = new LRUCache<string, CardInfo>({
      max: config.cacheSize || 1000,
      ttl: (config.cacheTTL || 3600) * 1000, // Convert to milliseconds
    });
  }

  /**
   * Detect card country and information from card number
   */
  async detectCardCountry(cardNumber: string): Promise<CardInfo> {
    const cleanNumber = this.cleanCardNumber(cardNumber);
    const bin = cleanNumber.substring(0, 8);

    // Check cache first
    const cached = this.cache.get(bin);
    if (cached) {
      return cached;
    }

    // Lookup BIN information
    const binInfo = await this.binDatabase.lookup(bin);

    // Enhance with additional data
    const cardInfo = await this.enhanceCardInfo(binInfo, cleanNumber);

    // Cache the result
    this.cache.set(bin, cardInfo);

    return cardInfo;
  }

  /**
   * Get card type from number
   */
  detectCardType(cardNumber: string): CardType {
    // This is simplified - in production would use BIN database
    const cleanNumber = this.cleanCardNumber(cardNumber);
    const firstDigit = cleanNumber[0];

    // Basic detection based on first digit
    if (firstDigit === '4' || firstDigit === '5') {
      return 'credit'; // Most Visa/MC are credit
    } else if (firstDigit === '3') {
      return 'credit'; // Amex/Diners are usually credit
    }

    return 'unknown';
  }

  /**
   * Validate card number
   */
  async validateCard(cardNumber: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const cleanNumber = this.cleanCardNumber(cardNumber);

    // Check length
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      errors.push({
        field: 'cardNumber',
        code: 'INVALID_LENGTH',
        message: 'Card number must be between 13 and 19 digits',
      });
    }

    // Luhn algorithm check
    if (!this.isValidLuhn(cleanNumber)) {
      errors.push({
        field: 'cardNumber',
        code: 'INVALID_LUHN',
        message: 'Invalid card number',
      });
    }

    // Detect brand
    const cardInfo = await this.detectCardCountry(cardNumber);

    return {
      valid: errors.length === 0,
      cardBrand: cardInfo.brand,
      cardType: cardInfo.type,
      errors,
    };
  }

  /**
   * Suggest optimal gateway based on card info
   */
  suggestOptimalGateway(cardInfo: CardInfo): Gateway {
    const { issuerCountry, supportedGateways } = cardInfo;

    // Priority order based on country and features
    const priorityMap: Record<string, Gateway[]> = {
      MX: ['stripe', 'mercadopago', 'lemonsqueezy'],
      BR: ['mercadopago', 'stripe', 'lemonsqueezy'],
      AR: ['mercadopago', 'lemonsqueezy'],
      IN: ['razorpay', 'stripe', 'lemonsqueezy'],
      US: ['stripe', 'lemonsqueezy', 'paypal'],
      EU: ['stripe', 'lemonsqueezy', 'paypal'],
    };

    const countryPriority = priorityMap[issuerCountry] || [
      'stripe',
      'lemonsqueezy',
    ];

    // Find first supported gateway from priority list
    for (const gateway of countryPriority) {
      if (supportedGateways.includes(gateway)) {
        return gateway;
      }
    }

    // Fallback to first supported gateway
    return supportedGateways[0] || 'stripe';
  }

  /**
   * Get bank info from BIN
   */
  async detectBankInfo(cardNumber: string): Promise<{
    bank: string;
    country: string;
    currency: string;
  }> {
    const cardInfo = await this.detectCardCountry(cardNumber);

    return {
      bank: cardInfo.issuerName || 'Unknown Bank',
      country: cardInfo.issuerCountry,
      currency: cardInfo.issuerCurrency || 'USD',
    };
  }

  /**
   * Perform BIN lookup with response wrapper
   */
  async lookupBIN(bin: string): Promise<BINLookupResponse> {
    try {
      const paddedBin = bin.padEnd(16, '0');
      const cacheKey = paddedBin.substring(0, 8);
      const cardInfo = await this.detectCardCountry(paddedBin);
      return {
        success: true,
        cardInfo,
        cached: this.cache.has(cacheKey),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        cached: false,
      };
    }
  }

  // Private methods

  private cleanCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\D/g, '');
  }

  private isValidLuhn(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;

    // Loop through values starting from the rightmost
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      const digitStr = cardNumber[i];
      if (!digitStr) continue;
      let digit = parseInt(digitStr, 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  private async enhanceCardInfo(
    binInfo: Partial<CardInfo>,
    cardNumber: string
  ): Promise<CardInfo> {
    const issuerCountry = binInfo.issuerCountry || 'US';

    // Determine supported gateways
    const supportedGateways = this.getSupportedGateways(
      issuerCountry,
      binInfo.brand || 'unknown'
    );

    // Get local payment methods
    const localPaymentMethods = LOCAL_PAYMENT_METHODS[issuerCountry] || [];

    // Determine preferred gateway
    const preferredGateway = await this.determinePreferredGateway(
      issuerCountry,
      supportedGateways,
      binInfo.features
    );

    return {
      bin: binInfo.bin || cardNumber.substring(0, 6),
      lastFour: cardNumber.slice(-4),
      brand: binInfo.brand || 'unknown',
      type: binInfo.type || 'credit',
      issuerCountry,
      issuerName: binInfo.issuerName,
      issuerCurrency: binInfo.issuerCurrency,
      supportedGateways,
      preferredGateway,
      localPaymentMethods,
      features: binInfo.features || this.getDefaultFeatures(),
    };
  }

  private getSupportedGateways(country: string, brand: CardBrand): Gateway[] {
    const gateways: Gateway[] = [];

    for (const [gateway, countries] of Object.entries(
      GATEWAY_COUNTRY_SUPPORT
    )) {
      if (countries.includes('*') || countries.includes(country)) {
        // Additional brand-specific checks
        if (
          gateway === 'paypal' &&
          brand === 'amex' &&
          !['US', 'CA'].includes(country)
        ) {
          continue; // PayPal doesn't support Amex in all countries
        }

        gateways.push(gateway as Gateway);
      }
    }

    return gateways;
  }

  private determinePreferredGateway(
    country: string,
    supportedGateways: Gateway[],
    _features?: CardFeatures
  ): Gateway {
    // Country-specific preferences
    const preferences: Record<string, Gateway> = {
      MX: 'stripe', // Better margins than MercadoPago
      BR: 'mercadopago', // Better local features
      AR: 'mercadopago', // Only viable option
      IN: 'razorpay', // Best local support
      US: 'stripe',
      GB: 'stripe',
      EU: 'stripe',
    };

    const preferred = preferences[country];
    if (preferred && supportedGateways.includes(preferred)) {
      return preferred;
    }

    // Default to Stripe if available
    if (supportedGateways.includes('stripe')) {
      return 'stripe';
    }

    // Otherwise first available
    return supportedGateways[0] || 'stripe';
  }

  private getDefaultFeatures(): CardFeatures {
    return {
      supports3DSecure: true,
      supportsInstallments: false,
      supportsTokenization: true,
      requiresCVV: true,
    };
  }
}
