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
 * Card validation utilities
 *
 * Comprehensive validation for card numbers, expiry dates, and CVV
 */

import { CardBrand, ValidationResult, ValidationError } from '../types';

/**
 * Card number validation patterns
 */
const CARD_PATTERNS: Record<CardBrand, RegExp> = {
  visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
  mastercard: /^5[1-5][0-9]{14}$|^2[2-7][0-9]{14}$/,
  amex: /^3[47][0-9]{13}$/,
  discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
  diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
  jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
  unionpay: /^62[0-9]{14,17}$/,
  elo: /^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)[0-9]{12}$/,
  hipercard: /^(606282|3841)[0-9]{10,13}$/,
  unknown: /^[0-9]{13,19}$/,
};

/**
 * CVV length by card brand
 */
const CVV_LENGTH: Record<CardBrand, number> = {
  visa: 3,
  mastercard: 3,
  amex: 4,
  discover: 3,
  diners: 3,
  jcb: 3,
  unionpay: 3,
  elo: 3,
  hipercard: 3,
  unknown: 3,
};

/**
 * Card number length ranges by brand
 */
const CARD_LENGTH: Record<CardBrand, { min: number; max: number }> = {
  visa: { min: 13, max: 19 },
  mastercard: { min: 16, max: 16 },
  amex: { min: 15, max: 15 },
  discover: { min: 16, max: 16 },
  diners: { min: 14, max: 14 },
  jcb: { min: 16, max: 16 },
  unionpay: { min: 16, max: 19 },
  elo: { min: 16, max: 16 },
  hipercard: { min: 16, max: 16 },
  unknown: { min: 13, max: 19 },
};

/**
 * Validate card number format and checksum
 */
export function validateCardNumber(cardNumber: string): ValidationResult {
  const errors: ValidationError[] = [];
  const cleanNumber = cardNumber.replace(/\D/g, '');

  // Check if empty
  if (!cleanNumber) {
    errors.push({
      field: 'cardNumber',
      code: 'REQUIRED',
      message: 'Card number is required',
    });
    return { valid: false, errors };
  }

  // Detect brand
  const brand = detectCardBrand(cleanNumber);

  // Check length
  const lengthRange = CARD_LENGTH[brand];
  if (
    cleanNumber.length < lengthRange.min ||
    cleanNumber.length > lengthRange.max
  ) {
    errors.push({
      field: 'cardNumber',
      code: 'INVALID_LENGTH',
      message: `${brand} card numbers must be between ${lengthRange.min} and ${lengthRange.max} digits`,
    });
  }

  // Check pattern
  const pattern = CARD_PATTERNS[brand];
  if (!pattern.test(cleanNumber)) {
    errors.push({
      field: 'cardNumber',
      code: 'INVALID_FORMAT',
      message: 'Invalid card number format',
    });
  }

  // Luhn check
  if (!isValidLuhn(cleanNumber)) {
    errors.push({
      field: 'cardNumber',
      code: 'INVALID_CHECKSUM',
      message: 'Invalid card number',
    });
  }

  return {
    valid: errors.length === 0,
    cardBrand: brand,
    cardType: 'credit', // Would need BIN lookup for accurate type
    errors,
  };
}

/**
 * Validate card expiry date
 */
export function validateExpiry(month: string, year: string): ValidationResult {
  const errors: ValidationError[] = [];

  // Parse values
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  // Validate month
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    errors.push({
      field: 'expiryMonth',
      code: 'INVALID_MONTH',
      message: 'Invalid expiry month',
    });
  }

  // Validate year
  const currentYear = new Date().getFullYear();
  const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;

  if (isNaN(yearNum) || fullYear > currentYear + 20) {
    errors.push({
      field: 'expiryYear',
      code: 'INVALID_YEAR',
      message: 'Invalid expiry year',
    });
  }

  // Check if expired
  if (errors.length === 0) {
    const currentMonth = new Date().getMonth() + 1;
    if (fullYear < currentYear || (fullYear === currentYear && monthNum < currentMonth)) {
      errors.push({
        field: 'expiry',
        code: 'EXPIRED',
        message: 'Card has expired',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate CVV
 */
export function validateCVV(
  cvv: string,
  cardBrand?: CardBrand
): ValidationResult {
  const errors: ValidationError[] = [];
  const cleanCVV = cvv.replace(/\D/g, '');

  // Check if empty
  if (!cleanCVV) {
    errors.push({
      field: 'cvv',
      code: 'REQUIRED',
      message: 'CVV is required',
    });
    return { valid: false, errors };
  }

  // Check length based on card brand
  const expectedLength = cardBrand ? CVV_LENGTH[cardBrand] : 3;
  if (cleanCVV.length !== expectedLength) {
    errors.push({
      field: 'cvv',
      code: 'INVALID_LENGTH',
      message: `CVV must be ${expectedLength} digits`,
    });
  }

  // Check if all digits
  if (!/^\d+$/.test(cvv)) {
    errors.push({
      field: 'cvv',
      code: 'INVALID_FORMAT',
      message: 'CVV must contain only digits',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Detect card brand from number
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const cleanNumber = cardNumber.replace(/\D/g, '');

  // Check each pattern
  for (const [brand, pattern] of Object.entries(CARD_PATTERNS)) {
    if (brand !== 'unknown' && pattern.test(cleanNumber)) {
      return brand as CardBrand;
    }
  }

  // Additional pattern matching for better detection
  const firstDigit = cleanNumber[0];
  const firstTwo = cleanNumber.substring(0, 2);
  const firstFour = cleanNumber.substring(0, 4);
  const firstSix = cleanNumber.substring(0, 6);

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
    firstTwo === '65' ||
    (parseInt(firstFour) >= 6440 && parseInt(firstFour) <= 6599)
  ) {
    return 'discover';
  }

  // Diners Club
  if (
    ['36', '38'].includes(firstTwo) ||
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

  // Elo (Brazilian)
  if (
    [
      '401178',
      '401179',
      '438935',
      '457631',
      '457632',
      '431274',
      '451416',
      '457393',
      '504175',
      '506699',
      '506770',
      '506771',
      '506772',
      '506773',
      '506774',
      '506775',
      '506776',
      '506777',
      '506778',
      '627780',
      '636297',
      '636368',
      '650031',
      '650032',
      '650033',
      '650035',
      '650036',
      '650037',
      '650038',
      '650039',
      '650040',
      '650041',
      '650042',
      '650043',
      '650044',
      '650045',
      '650046',
      '650047',
      '650048',
      '650049',
      '650050',
      '650051',
      '650052',
      '650053',
      '650054',
      '650055',
      '650056',
      '650057',
      '650058',
      '650059',
      '650060',
      '650061',
      '650062',
      '650063',
      '650064',
      '650065',
      '650066',
      '650067',
      '650068',
      '650069',
      '650070',
      '650071',
      '650072',
      '650073',
      '650074',
      '650075',
      '650076',
      '650077',
      '650078',
      '650079',
      '650080',
      '650081',
      '650082',
      '650083',
      '650084',
      '650085',
      '650086',
      '650087',
      '650088',
      '650089',
      '650090',
      '650091',
      '650092',
      '650093',
      '650094',
      '650095',
      '650096',
      '650097',
      '650098',
      '650099',
      '651652',
      '651653',
      '651654',
      '651655',
      '651656',
      '651657',
      '651658',
      '651659',
      '651660',
      '651661',
      '651662',
      '651663',
      '651664',
      '651665',
      '651666',
      '651667',
      '651668',
      '651669',
      '651670',
      '651671',
      '651672',
      '651673',
      '651674',
      '651675',
      '651676',
      '651677',
      '651678',
      '651679',
      '655000',
      '655001',
      '655002',
      '655003',
      '655004',
      '655005',
      '655006',
      '655007',
      '655008',
      '655009',
      '655010',
      '655011',
      '655012',
      '655013',
      '655014',
      '655015',
      '655016',
      '655017',
      '655018',
      '655019',
      '655020',
      '655021',
    ].includes(firstSix)
  ) {
    return 'elo';
  }

  // Hipercard (Brazilian)
  if (firstSix === '606282' || firstFour === '3841') {
    return 'hipercard';
  }

  return 'unknown';
}

/**
 * Luhn algorithm implementation
 */
export function isValidLuhn(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\D/g, '');

  if (!cleanNumber || cleanNumber.length < 13) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  // Loop through values starting from the rightmost
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);

    if (isNaN(digit)) {
      return false;
    }

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

/**
 * Format card number for display
 */
export function formatCardNumber(
  cardNumber: string,
  brand?: CardBrand
): string {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  const detectedBrand = brand || detectCardBrand(cleanNumber);

  // Format based on brand
  switch (detectedBrand) {
    case 'amex':
      // 4-6-5 format
      return cleanNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');

    case 'diners':
      // 4-6-4 format
      return cleanNumber.replace(/(\d{4})(\d{6})(\d{4})/, '$1 $2 $3');

    default:
      // 4-4-4-4 format
      return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }
}

/**
 * Mask card number for display (show only last 4 digits)
 */
export function maskCardNumber(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  const last4 = cleanNumber.slice(-4);
  const maskedLength = cleanNumber.length - 4;

  return '•'.repeat(maskedLength) + last4;
}

/**
 * Get card type name for display
 */
export function getCardBrandDisplayName(brand: CardBrand): string {
  const displayNames: Record<CardBrand, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unionpay: 'UnionPay',
    elo: 'Elo',
    hipercard: 'Hipercard',
    unknown: 'Card',
  };

  return displayNames[brand] || 'Card';
}
