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
 * Gateway Configuration
 * 
 * Defines gateway capabilities, fees, and supported features
 */

import {
  Gateway,
  GatewayConfig,
  GatewayFeatures,
  TransactionFees,
  Money,
} from '../types';

/**
 * Default gateway configurations
 */
export const DEFAULT_GATEWAY_CONFIGS: Record<Gateway, GatewayConfig> = {
  stripe: {
    id: 'stripe',
    displayName: 'Stripe',
    priority: ['US', 'CA', 'GB', 'EU', 'AU', 'JP', 'SG', 'MX'],
    profitMargin: 0.029, // 2.9% base rate
    supportedCountries: ['US', 'CA', 'GB', 'EU', 'AU', 'JP', 'SG', 'HK', 'MX', 'BR', 'IN'],
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'HKD', 'MXN', 'BRL', 'INR'],
    features: {
      supportsInstallments: true,
      supports3DSecure: true,
      supportsRecurring: true,
      supportsRefunds: true,
      supportsPartialRefunds: true,
      supportsSavedCards: true,
      supportsMultiCurrency: true,
      localPaymentMethods: ['apple_pay', 'google_pay', 'sepa', 'ideal', 'giropay'],
    },
    processingTime: 'Instant',
    transactionFees: {
      percentage: 0.029, // 2.9%
      fixed: { amount: 0.30, currency: 'USD', display: '$0.30' },
      internationalCard: 0.01, // +1% for international cards
    },
  },
  
  mercadopago: {
    id: 'mercadopago',
    displayName: 'MercadoPago',
    priority: ['AR', 'BR', 'MX', 'CL', 'CO', 'PE', 'UY'],
    profitMargin: 0.0399, // 3.99% base rate in most countries
    supportedCountries: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
    supportedCurrencies: ['ARS', 'BRL', 'CLP', 'COP', 'MXN', 'PEN', 'UYU', 'USD'],
    features: {
      supportsInstallments: true,
      supports3DSecure: true,
      supportsRecurring: true,
      supportsRefunds: true,
      supportsPartialRefunds: true,
      supportsSavedCards: true,
      supportsMultiCurrency: false,
      localPaymentMethods: ['pix', 'boleto', 'oxxo', 'spei', 'rapipago', 'pagofacil'],
    },
    processingTime: 'Instant',
    transactionFees: {
      percentage: 0.0399, // 3.99%
      fixed: { amount: 0, currency: 'BRL', display: 'R$0' },
      internationalCard: 0.02, // +2% for international cards
    },
  },
  
  lemonsqueezy: {
    id: 'lemonsqueezy',
    displayName: 'LemonSqueezy',
    priority: ['*'], // Global
    profitMargin: 0.05, // 5% + $0.50
    supportedCountries: ['*'], // Global
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    features: {
      supportsInstallments: false,
      supports3DSecure: true,
      supportsRecurring: true,
      supportsRefunds: true,
      supportsPartialRefunds: false,
      supportsSavedCards: true,
      supportsMultiCurrency: true,
      localPaymentMethods: ['paypal'],
    },
    processingTime: 'Instant',
    transactionFees: {
      percentage: 0.05, // 5%
      fixed: { amount: 0.50, currency: 'USD', display: '$0.50' },
    },
  },
  
  paypal: {
    id: 'paypal',
    displayName: 'PayPal',
    priority: ['US', 'EU', 'GB', 'CA', 'AU'],
    profitMargin: 0.0349, // 3.49% + $0.49
    supportedCountries: ['*'], // Global with restrictions
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'],
    features: {
      supportsInstallments: true,
      supports3DSecure: false,
      supportsRecurring: true,
      supportsRefunds: true,
      supportsPartialRefunds: true,
      supportsSavedCards: true,
      supportsMultiCurrency: true,
      localPaymentMethods: ['venmo', 'paypal_credit'],
    },
    processingTime: 'Instant',
    transactionFees: {
      percentage: 0.0349, // 3.49%
      fixed: { amount: 0.49, currency: 'USD', display: '$0.49' },
      internationalCard: 0.015, // +1.5% for cross-border
    },
  },
  
  razorpay: {
    id: 'razorpay',
    displayName: 'Razorpay',
    priority: ['IN'],
    profitMargin: 0.02, // 2% domestic cards
    supportedCountries: ['IN'],
    supportedCurrencies: ['INR', 'USD'],
    features: {
      supportsInstallments: true,
      supports3DSecure: true,
      supportsRecurring: true,
      supportsRefunds: true,
      supportsPartialRefunds: true,
      supportsSavedCards: true,
      supportsMultiCurrency: false,
      localPaymentMethods: ['upi', 'netbanking', 'wallet', 'emi'],
    },
    processingTime: 'Instant',
    transactionFees: {
      percentage: 0.02, // 2% for domestic
      fixed: { amount: 0, currency: 'INR', display: '₹0' },
      internationalCard: 0.03, // +3% for international (total 5%)
    },
  },
  
  payu: {
    id: 'payu',
    displayName: 'PayU',
    priority: ['IN', 'PL', 'TR', 'RU', 'ZA', 'CO', 'MX', 'AR', 'BR'],
    profitMargin: 0.029, // Varies by country
    supportedCountries: ['IN', 'PL', 'TR', 'RU', 'ZA', 'CO', 'MX', 'AR', 'BR'],
    supportedCurrencies: ['INR', 'PLN', 'TRY', 'RUB', 'ZAR', 'COP', 'MXN', 'ARS', 'BRL', 'USD', 'EUR'],
    features: {
      supportsInstallments: true,
      supports3DSecure: true,
      supportsRecurring: true,
      supportsRefunds: true,
      supportsPartialRefunds: true,
      supportsSavedCards: true,
      supportsMultiCurrency: true,
      localPaymentMethods: ['blik', 'oxxo', 'boleto', 'eft'],
    },
    processingTime: 'Instant',
    transactionFees: {
      percentage: 0.029, // 2.9% average
      fixed: { amount: 3, currency: 'INR', display: '₹3' },
      internationalCard: 0.02, // +2% for international
    },
  },
  
  custom: {
    id: 'custom',
    displayName: 'Custom Gateway',
    priority: [],
    profitMargin: 0,
    supportedCountries: [],
    supportedCurrencies: [],
    features: {
      supportsInstallments: false,
      supports3DSecure: false,
      supportsRecurring: false,
      supportsRefunds: false,
      supportsPartialRefunds: false,
      supportsSavedCards: false,
      supportsMultiCurrency: false,
      localPaymentMethods: [],
    },
    processingTime: 'Unknown',
    transactionFees: {
      percentage: 0,
      fixed: { amount: 0, currency: 'USD', display: '$0' },
    },
  },
};

/**
 * Gateway fee calculator
 */
export class GatewayFeeCalculator {
  constructor(private configs: Record<Gateway, GatewayConfig> = DEFAULT_GATEWAY_CONFIGS) {}
  
  /**
   * Calculate total fees for a transaction
   */
  calculateFees(
    gateway: Gateway,
    amount: Money,
    isInternational: boolean = false,
    installments?: number
  ): {
    processingFee: Money;
    percentageFee: Money;
    fixedFee: Money;
    internationalFee?: Money;
    installmentFee?: Money;
    totalFee: Money;
  } {
    const config = this.configs[gateway];
    if (!config) {
      throw new Error(`Unknown gateway: ${gateway}`);
    }
    
    const fees = config.transactionFees;
    
    // Base percentage fee
    const percentageFee: Money = {
      amount: amount.amount * fees.percentage,
      currency: amount.currency,
      display: this.formatMoney(amount.amount * fees.percentage, amount.currency),
    };
    
    // Fixed fee (convert if needed)
    const fixedFee = this.convertCurrency(fees.fixed, amount.currency);
    
    // International card fee
    let internationalFee: Money | undefined;
    if (isInternational && fees.internationalCard) {
      internationalFee = {
        amount: amount.amount * fees.internationalCard,
        currency: amount.currency,
        display: this.formatMoney(amount.amount * fees.internationalCard, amount.currency),
      };
    }
    
    // Installment fee (gateway specific)
    let installmentFee: Money | undefined;
    if (installments && installments > 1) {
      const installmentRate = this.getInstallmentRate(gateway, installments);
      if (installmentRate > 0) {
        installmentFee = {
          amount: amount.amount * installmentRate,
          currency: amount.currency,
          display: this.formatMoney(amount.amount * installmentRate, amount.currency),
        };
      }
    }
    
    // Total fee
    const totalFeeAmount = 
      percentageFee.amount + 
      fixedFee.amount + 
      (internationalFee?.amount || 0) + 
      (installmentFee?.amount || 0);
    
    const totalFee: Money = {
      amount: totalFeeAmount,
      currency: amount.currency,
      display: this.formatMoney(totalFeeAmount, amount.currency),
    };
    
    return {
      processingFee: totalFee,
      percentageFee,
      fixedFee,
      internationalFee,
      installmentFee,
      totalFee,
    };
  }
  
  /**
   * Get effective rate for comparison
   */
  getEffectiveRate(
    gateway: Gateway,
    amount: Money,
    isInternational: boolean = false
  ): number {
    const fees = this.calculateFees(gateway, amount, isInternational);
    return fees.totalFee.amount / amount.amount;
  }
  
  /**
   * Compare gateway costs
   */
  compareGateways(
    gateways: Gateway[],
    amount: Money,
    isInternational: boolean = false
  ): Array<{
    gateway: Gateway;
    fees: ReturnType<typeof this.calculateFees>;
    effectiveRate: number;
    savings?: Money;
  }> {
    const results = gateways.map(gateway => ({
      gateway,
      fees: this.calculateFees(gateway, amount, isInternational),
      effectiveRate: this.getEffectiveRate(gateway, amount, isInternational),
    }));
    
    // Sort by total fee
    results.sort((a, b) => a.fees.totalFee.amount - b.fees.totalFee.amount);
    
    // Calculate savings vs most expensive
    const mostExpensive = results[results.length - 1];
    
    return results.map(result => ({
      ...result,
      savings: result !== mostExpensive ? {
        amount: mostExpensive.fees.totalFee.amount - result.fees.totalFee.amount,
        currency: amount.currency,
        display: this.formatMoney(
          mostExpensive.fees.totalFee.amount - result.fees.totalFee.amount,
          amount.currency
        ),
      } : undefined,
    }));
  }
  
  // Private methods
  
  private getInstallmentRate(gateway: Gateway, months: number): number {
    // Gateway-specific installment rates
    const rates: Record<Gateway, Record<number, number>> = {
      mercadopago: {
        3: 0.0499,  // +4.99%
        6: 0.0699,  // +6.99%
        9: 0.0899,  // +8.99%
        12: 0.0999, // +9.99%
        18: 0.1299, // +12.99%
      },
      stripe: {
        3: 0.02,  // +2%
        6: 0.04,  // +4%
        12: 0.06, // +6%
      },
      razorpay: {
        3: 0.03,  // +3%
        6: 0.05,  // +5%
        9: 0.07,  // +7%
        12: 0.09, // +9%
      },
      payu: {
        3: 0.03,  // +3%
        6: 0.05,  // +5%
        12: 0.08, // +8%
      },
      paypal: {
        3: 0.02,  // +2%
        6: 0.04,  // +4%
        12: 0.06, // +6%
      },
      lemonsqueezy: {},
      custom: {},
    };
    
    return rates[gateway]?.[months] || 0;
  }
  
  private convertCurrency(money: Money, targetCurrency: string): Money {
    // Simplified currency conversion for demo
    // In production, would use real exchange rates
    if (money.currency === targetCurrency) {
      return money;
    }
    
    const rates: Record<string, Record<string, number>> = {
      USD: { EUR: 0.85, GBP: 0.73, INR: 83, BRL: 5.0, MXN: 17 },
      EUR: { USD: 1.18, GBP: 0.86, INR: 98, BRL: 5.9, MXN: 20 },
      GBP: { USD: 1.37, EUR: 1.16, INR: 114, BRL: 6.9, MXN: 23 },
    };
    
    const rate = rates[money.currency]?.[targetCurrency] || 1;
    const convertedAmount = money.amount * rate;
    
    return {
      amount: convertedAmount,
      currency: targetCurrency,
      display: this.formatMoney(convertedAmount, targetCurrency),
    };
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
      CLP: '$',
      COP: '$',
      PEN: 'S/',
    };
    
    const symbol = symbols[currency] || currency + ' ';
    return `${symbol}${amount.toFixed(2)}`;
  }
}