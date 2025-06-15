import { logger } from '@/lib/utils/logger';

/**
 * @fileoverview Geolocation detection utility for automatic language setting
 *
 * This module detects user's geographic location to automatically set the most
 * appropriate default language for PRISMA SaaS platform.
 *
 * Features:
 * - Detects Spanish-speaking countries for Spanish default
 * - Detects English-speaking countries for English default
 * - Fallback to Spanish for MADFAM's primary market (Mexico/LATAM)
 * - Privacy-conscious detection using browser APIs
 *
 * @author MADFAM Development Team
 * @version 1.0.0 - Initial geolocation detection
 */

/**
 * Spanish-speaking countries (ISO 3166-1 alpha-2 codes)
 * Primary target markets for PRISMA
 */
const SPANISH_SPEAKING_COUNTRIES = [
  'AR', // Argentina
  'BO', // Bolivia
  'CL', // Chile
  'CO', // Colombia
  'CR', // Costa Rica
  'CU', // Cuba
  'DO', // Dominican Republic
  'EC', // Ecuador
  'SV', // El Salvador
  'GQ', // Equatorial Guinea
  'GT', // Guatemala
  'HN', // Honduras
  'MX', // Mexico (primary market)
  'NI', // Nicaragua
  'PA', // Panama
  'PY', // Paraguay
  'PE', // Peru
  'PR', // Puerto Rico
  'ES', // Spain
  'UY', // Uruguay
  'VE', // Venezuela
];

/**
 * English-speaking countries (ISO 3166-1 alpha-2 codes)
 * Secondary target markets for international expansion
 */
const ENGLISH_SPEAKING_COUNTRIES = [
  'US', // United States
  'CA', // Canada
  'GB', // United Kingdom
  'AU', // Australia
  'NZ', // New Zealand
  'IE', // Ireland
  'ZA', // South Africa
  'IN', // India
  'SG', // Singapore
  'MY', // Malaysia
  'PH', // Philippines
  'NG', // Nigeria
  'KE', // Kenya
  'GH', // Ghana
  'JM', // Jamaica
  'TT', // Trinidad and Tobago
  'BB', // Barbados
  'BS', // Bahamas
  'BZ', // Belize
  'GY', // Guyana
];

/**
 * Country code to flag emoji mapping
 * Provides visual representation for detected countries
 */
const COUNTRY_FLAGS: Record<string, string> = {
  // Spanish-speaking countries
  AR: '🇦🇷',
  BO: '🇧🇴',
  CL: '🇨🇱',
  CO: '🇨🇴',
  CR: '🇨🇷',
  CU: '🇨🇺',
  DO: '🇩🇴',
  EC: '🇪🇨',
  SV: '🇸🇻',
  GQ: '🇬🇶',
  GT: '🇬🇹',
  HN: '🇭🇳',
  MX: '🇲🇽',
  NI: '🇳🇮',
  PA: '🇵🇦',
  PY: '🇵🇾',
  PE: '🇵🇪',
  PR: '🇵🇷',
  ES: '🇪🇸',
  UY: '🇺🇾',
  VE: '🇻🇪',

  // English-speaking countries
  US: '🇺🇸',
  CA: '🇨🇦',
  GB: '🇬🇧',
  AU: '🇦🇺',
  NZ: '🇳🇿',
  IE: '🇮🇪',
  ZA: '🇿🇦',
  IN: '🇮🇳',
  SG: '🇸🇬',
  MY: '🇲🇾',
  PH: '🇵🇭',
  NG: '🇳🇬',
  KE: '🇰🇪',
  GH: '🇬🇭',
  JM: '🇯🇲',
  TT: '🇹🇹',
  BB: '🇧🇧',
  BS: '🇧🇸',
  BZ: '🇧🇿',
  GY: '🇬🇾',

  // Default flags for language groups (Mexico for Spanish, USA for English)
  ES_DEFAULT: '🇲🇽',
  EN_DEFAULT: '🇺🇸',
};

/**
 * Language detection result interface
 */
export interface LanguageDetectionResult {
  /** Detected language code */
  language: 'es' | 'en';
  /** Country code (if detected) */
  countryCode?: string;
  /** Country flag emoji */
  flag: string;
  /** Detection method used */
  method: 'geolocation' | 'timezone' | 'browser' | 'fallback';
  /** Whether detection was successful */
  confident: boolean;
}

/**
 * Detects user's country from IP geolocation using a free service
 *
 * @returns Promise resolving to country code or null if detection fails
 */
async function detectCountryFromIP(): Promise<string | null> {
  try {
    // Using ipapi.co for free IP geolocation (1000 requests/day limit)
    const response = await fetch('https://ipapi.co/country/', {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
      },
    });

    if (response.ok) {
      const countryCode = (await response.text()).trim().toUpperCase();

      // Validate country code format (2 characters)
      if (countryCode.length === 2 && /^[A-Z]{2}$/.test(countryCode)) {
        return countryCode;
      }
    }
  } catch (error) {
    // IP geolocation failed - this is expected in many environments
    // Only log in development to avoid console noise
    if (process.env.NODE_ENV === 'development') {
      logger.debug('IP geolocation detection failed:', { error });
    }
  }

  return null;
}

/**
 * Detects user's likely country from timezone
 * Less accurate but works as fallback when IP detection fails
 *
 * @returns Estimated country code or null
 */
function detectCountryFromTimezone(): string | null {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Common timezone to country mappings for our target markets
    const timezoneCountryMap: Record<string, string> = {
      // Spanish-speaking countries
      'America/Mexico_City': 'MX',
      'America/Cancun': 'MX',
      'America/Merida': 'MX',
      'America/Monterrey': 'MX',
      'America/Matamoros': 'MX',
      'America/Mazatlan': 'MX',
      'America/Chihuahua': 'MX',
      'America/Hermosillo': 'MX',
      'America/Tijuana': 'MX',
      'America/Buenos_Aires': 'AR',
      'America/Argentina/Buenos_Aires': 'AR',
      'America/Bogota': 'CO',
      'America/Lima': 'PE',
      'America/Santiago': 'CL',
      'America/Caracas': 'VE',
      'Europe/Madrid': 'ES',

      // English-speaking countries
      'America/New_York': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Los_Angeles': 'US',
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'Europe/London': 'GB',
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
      'Pacific/Auckland': 'NZ',
    };

    return timezoneCountryMap[timezone] || null;
  } catch (error) {
    // Timezone detection failed - this is expected in some environments
    return null;
  }
}

/**
 * Detects user's language from browser settings
 *
 * @returns Detected language code or null
 */
function detectLanguageFromBrowser(): 'es' | 'en' | null {
  try {
    // Get browser language preferences
    const browserLanguages = [
      navigator.language,
      ...(navigator.languages || []),
    ];

    for (const lang of browserLanguages) {
      const langCode = lang.toLowerCase().split('-')[0];

      if (langCode === 'es' || langCode === 'spa') {
        return 'es';
      }
      if (langCode === 'en' || langCode === 'eng') {
        return 'en';
      }
    }

    return null;
  } catch (error) {
    // Browser language detection failed - this is expected in some environments
    return null;
  }
}

/**
 * Determines appropriate language based on country code
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Language code and confidence level
 */
function getLanguageFromCountry(countryCode: string): {
  language: 'es' | 'en';
  confident: boolean;
} {
  if (SPANISH_SPEAKING_COUNTRIES.includes(countryCode)) {
    return { language: 'es', confident: true };
  }

  if (ENGLISH_SPEAKING_COUNTRIES.includes(countryCode)) {
    return { language: 'en', confident: true };
  }

  // For unknown countries, fallback to Spanish (MADFAM's primary market)
  return { language: 'es', confident: false };
}

/**
 * Gets appropriate flag emoji for country or language
 *
 * @param countryCode - Country code (optional)
 * @param language - Language code
 * @returns Flag emoji
 */
function getFlag(
  countryCode: string | undefined,
  language: 'es' | 'en'
): string {
  if (countryCode && COUNTRY_FLAGS[countryCode]) {
    return COUNTRY_FLAGS[countryCode];
  }

  // Default flag for language
  const defaultFlag =
    language === 'es'
      ? COUNTRY_FLAGS['ES_DEFAULT']
      : COUNTRY_FLAGS['EN_DEFAULT'];
  return defaultFlag || '🇲🇽'; // Fallback to Mexican flag if undefined
}

/**
 * Detects user's preferred language based on geographic location and browser settings
 *
 * Uses multiple detection methods in order of reliability:
 * 1. IP-based geolocation (most accurate for location)
 * 2. Timezone detection (fallback geolocation)
 * 3. Browser language preferences (user setting)
 * 4. Spanish fallback (MADFAM's primary market)
 *
 * @returns Promise resolving to language detection result
 */
async function detectUserLanguage(): Promise<LanguageDetectionResult> {
  // Method 1: Try IP-based geolocation first
  try {
    const countryCode = await detectCountryFromIP();
    if (countryCode) {
      const { language, confident } = getLanguageFromCountry(countryCode);

      return {
        language,
        countryCode,
        flag: getFlag(countryCode, language),
        method: 'geolocation',
        confident,
      };
    }
  } catch (error) {
    // IP detection failed, trying timezone detection
  }

  // Method 2: Fallback to timezone detection
  const timezoneCountry = detectCountryFromTimezone();
  if (timezoneCountry) {
    const { language, confident } = getLanguageFromCountry(timezoneCountry);

    return {
      language,
      countryCode: timezoneCountry,
      flag: getFlag(timezoneCountry, language),
      method: 'timezone',
      confident,
    };
  }

  // Method 3: Try browser language detection
  const browserLanguage = detectLanguageFromBrowser();
  if (browserLanguage) {
    return {
      language: browserLanguage,
      flag: getFlag(undefined, browserLanguage),
      method: 'browser',
      confident: true,
    };
  }

  // Method 4: Final fallback to Spanish (MADFAM's primary market)
  return {
    language: 'es',
    flag: COUNTRY_FLAGS['ES_DEFAULT'] || '🇲🇽',
    method: 'fallback',
    confident: false,
  };
}

/**
 * Quick synchronous language detection for immediate UI rendering
 * Uses only browser settings and timezone (no async IP detection)
 *
 * @returns Language detection result (synchronous)
 */
function detectUserLanguageSync(): LanguageDetectionResult {
  // Try timezone detection first
  const timezoneCountry = detectCountryFromTimezone();
  if (timezoneCountry) {
    const { language, confident } = getLanguageFromCountry(timezoneCountry);

    return {
      language,
      countryCode: timezoneCountry,
      flag: getFlag(timezoneCountry, language),
      method: 'timezone',
      confident,
    };
  }

  // Try browser language detection
  const browserLanguage = detectLanguageFromBrowser();
  if (browserLanguage) {
    return {
      language: browserLanguage,
      flag: getFlag(undefined, browserLanguage),
      method: 'browser',
      confident: true,
    };
  }

  // Fallback to Spanish
  return {
    language: 'es',
    flag: COUNTRY_FLAGS['ES_DEFAULT'] || '🇲🇽',
    method: 'fallback',
    confident: false,
  };
}
