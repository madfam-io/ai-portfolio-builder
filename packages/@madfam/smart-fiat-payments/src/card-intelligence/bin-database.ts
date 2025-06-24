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
 * BIN Database interface and implementation
 *
 * Handles Bank Identification Number lookups with multiple data sources
 */

import { CardInfo, CardBrand, CardType, BINLookupError } from '../types';

// BIN range data structure
interface BINRange {
  start: string;
  end: string;
  brand: CardBrand;
  type: CardType;
  issuerName: string;
  issuerCountry: string;
  issuerCurrency?: string;
}

// Hardcoded BIN ranges for common cards (fallback data)
const FALLBACK_BIN_RANGES: BINRange[] = [
  // Specific bank BINs first (more specific matches should come before generic ones)

  // Mexican banks (common BINs)
  {
    start: '421394',
    end: '421394',
    brand: 'visa',
    type: 'credit',
    issuerName: 'Banamex',
    issuerCountry: 'MX',
    issuerCurrency: 'MXN',
  },
  {
    start: '547074',
    end: '547074',
    brand: 'mastercard',
    type: 'credit',
    issuerName: 'Santander Mexico',
    issuerCountry: 'MX',
    issuerCurrency: 'MXN',
  },
  {
    start: '554620',
    end: '554629',
    brand: 'mastercard',
    type: 'debit',
    issuerName: 'BBVA Mexico',
    issuerCountry: 'MX',
    issuerCurrency: 'MXN',
  },

  // Brazilian banks
  {
    start: '548129',
    end: '548129',
    brand: 'mastercard',
    type: 'credit',
    issuerName: 'Banco do Brasil',
    issuerCountry: 'BR',
    issuerCurrency: 'BRL',
  },
  {
    start: '516259',
    end: '516259',
    brand: 'mastercard',
    type: 'credit',
    issuerName: 'Itaú',
    issuerCountry: 'BR',
    issuerCurrency: 'BRL',
  },

  // Indian banks
  {
    start: '461700',
    end: '461799',
    brand: 'visa',
    type: 'debit',
    issuerName: 'HDFC Bank',
    issuerCountry: 'IN',
    issuerCurrency: 'INR',
  },
  {
    start: '524338',
    end: '524338',
    brand: 'mastercard',
    type: 'credit',
    issuerName: 'ICICI Bank',
    issuerCountry: 'IN',
    issuerCurrency: 'INR',
  },

  // Regional cards
  {
    start: '506700',
    end: '506899',
    brand: 'elo',
    type: 'credit',
    issuerName: 'Elo',
    issuerCountry: 'BR',
  },
  {
    start: '636297',
    end: '636297',
    brand: 'elo',
    type: 'credit',
    issuerName: 'Elo',
    issuerCountry: 'BR',
  },

  // Generic ranges (must come after specific BINs)

  // Visa
  {
    start: '400000',
    end: '499999',
    brand: 'visa',
    type: 'credit',
    issuerName: 'Generic Visa',
    issuerCountry: 'US',
  },

  // Mastercard
  {
    start: '510000',
    end: '559999',
    brand: 'mastercard',
    type: 'credit',
    issuerName: 'Generic Mastercard',
    issuerCountry: 'US',
  },
  {
    start: '222100',
    end: '272099',
    brand: 'mastercard',
    type: 'credit',
    issuerName: 'Generic Mastercard',
    issuerCountry: 'US',
  },

  // American Express
  {
    start: '340000',
    end: '349999',
    brand: 'amex',
    type: 'credit',
    issuerName: 'American Express',
    issuerCountry: 'US',
  },
  {
    start: '370000',
    end: '379999',
    brand: 'amex',
    type: 'credit',
    issuerName: 'American Express',
    issuerCountry: 'US',
  },

  // Discover
  {
    start: '601100',
    end: '601199',
    brand: 'discover',
    type: 'credit',
    issuerName: 'Discover',
    issuerCountry: 'US',
  },
  {
    start: '644000',
    end: '659999',
    brand: 'discover',
    type: 'credit',
    issuerName: 'Discover',
    issuerCountry: 'US',
  },
];

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: 'USD',
  MX: 'MXN',
  BR: 'BRL',
  AR: 'ARS',
  CL: 'CLP',
  CO: 'COP',
  PE: 'PEN',
  IN: 'INR',
  GB: 'GBP',
  EU: 'EUR',
  CA: 'CAD',
  AU: 'AUD',
  JP: 'JPY',
  CN: 'CNY',
  SG: 'SGD',
  TH: 'THB',
  MY: 'MYR',
  ID: 'IDR',
  PH: 'PHP',
  VN: 'VND',
  KR: 'KRW',
  ZA: 'ZAR',
  NG: 'NGN',
  EG: 'EGP',
  KE: 'KES',
  MA: 'MAD',
  AE: 'AED',
  SA: 'SAR',
  TR: 'TRY',
  RU: 'RUB',
  UA: 'UAH',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  RO: 'RON',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  CH: 'CHF',
};

export interface BINDatabase {
  lookup(bin: string): Promise<Partial<CardInfo>>;
  isSupported(bin: string): boolean;
}

/**
 * In-memory BIN database with fallback data
 * In production, this would connect to a proper BIN API service
 */
export class InMemoryBINDatabase implements BINDatabase {
  private ranges: BINRange[] = FALLBACK_BIN_RANGES;

  async lookup(bin: string): Promise<Partial<CardInfo>> {
    // Validate BIN format
    if (!bin || bin.length < 6) {
      throw new BINLookupError('BIN must be at least 6 digits');
    }

    // Clean BIN (remove spaces, dashes)
    const cleanBIN = bin.replace(/\D/g, '');

    // Find matching range
    const range = this.findRange(cleanBIN);

    if (!range) {
      // Default response for unknown BINs
      return {
        bin: cleanBIN.substring(0, 6),
        brand: this.detectBrandByPattern(cleanBIN),
        type: 'credit',
        issuerCountry: 'US', // Default to US
        issuerCurrency: 'USD',
        features: {
          supports3DSecure: true,
          supportsInstallments: false,
          supportsTokenization: true,
          requiresCVV: true,
        },
      };
    }

    return {
      bin: cleanBIN.substring(0, 6),
      brand: range.brand,
      type: range.type,
      issuerCountry: range.issuerCountry,
      issuerName: range.issuerName,
      issuerCurrency:
        range.issuerCurrency ||
        COUNTRY_CURRENCY_MAP[range.issuerCountry] ||
        'USD',
      features: this.getCardFeatures(range),
    };
  }

  isSupported(bin: string): boolean {
    const cleanBIN = bin.replace(/\D/g, '');
    // Only consider a BIN supported if we have specific data for it
    return this.findRange(cleanBIN) !== null;
  }

  private findRange(bin: string): BINRange | null {
    for (const range of this.ranges) {
      const binNum = parseInt(bin.substring(0, range.start.length), 10);
      const startNum = parseInt(range.start, 10);
      const endNum = parseInt(range.end, 10);

      if (binNum >= startNum && binNum <= endNum) {
        return range;
      }
    }
    return null;
  }

  private detectBrandByPattern(bin: string): CardBrand {
    const firstDigit = bin[0];
    const firstTwo = bin.substring(0, 2);
    const firstFour = bin.substring(0, 4);

    // Visa
    if (firstDigit === '4') return 'visa';

    // Mastercard
    if (
      ['51', '52', '53', '54', '55'].includes(firstTwo) ||
      (parseInt(firstFour) >= 2221 && parseInt(firstFour) <= 2720)
    ) {
      return 'mastercard';
    }

    // American Express
    if (['34', '37'].includes(firstTwo)) return 'amex';

    // Discover
    if (
      firstFour === '6011' ||
      (parseInt(firstFour) >= 6440 && parseInt(firstFour) <= 6599)
    ) {
      return 'discover';
    }

    // Diners Club
    if (
      ['36', '38', '30'].includes(firstTwo) ||
      (parseInt(firstFour) >= 3000 && parseInt(firstFour) <= 3059) ||
      (parseInt(firstFour) >= 3095 && parseInt(firstFour) <= 3099)
    ) {
      return 'diners';
    }

    // JCB
    if (parseInt(firstFour) >= 3528 && parseInt(firstFour) <= 3589) {
      return 'jcb';
    }

    // UnionPay
    if (firstTwo === '62' || firstTwo === '88') {
      return 'unionpay';
    }

    return 'unknown';
  }

  private getCardFeatures(range: BINRange): CardInfo['features'] {
    // Determine features based on card brand and country
    const isLatam = ['MX', 'BR', 'AR', 'CL', 'CO', 'PE'].includes(
      range.issuerCountry
    );
    const isAsia = [
      'IN',
      'SG',
      'MY',
      'TH',
      'ID',
      'PH',
      'VN',
      'KR',
      'JP',
      'CN',
    ].includes(range.issuerCountry);

    return {
      supports3DSecure: !['amex'].includes(range.brand), // Most cards except some Amex
      supportsInstallments: isLatam || range.issuerCountry === 'TR', // LATAM and Turkey commonly support installments
      supportsTokenization: true, // Most modern cards support this
      requiresCVV: range.brand !== 'unionpay', // UnionPay often doesn't require CVV
      maxInstallments: isLatam ? 12 : undefined, // LATAM cards often support up to 12 months
    };
  }
}

/**
 * API-based BIN database (for production use)
 * This would connect to services like BinList.net, Binbase, etc.
 */
export class APIBINDatabase implements BINDatabase {
  constructor(
    private apiKey: string,
    private apiUrl: string,
    private fallback: BINDatabase = new InMemoryBINDatabase()
  ) {}

  async lookup(bin: string): Promise<Partial<CardInfo>> {
    try {
      // In production, make API call here
      // For now, use fallback
      return this.fallback.lookup(bin);
    } catch (error) {
      // Fallback to in-memory database
      return this.fallback.lookup(bin);
    }
  }

  isSupported(bin: string): boolean {
    return this.fallback.isSupported(bin);
  }
}
