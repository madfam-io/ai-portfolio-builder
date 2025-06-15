import {
  detectUserLanguage,
  detectCountryFromIP,
  detectUserLanguageSync,
  getCountryInfo,
  isValidCountryCode,
  getLanguageFromCountry,
  getUserTimezone,
  formatCoordinates,
  calculateDistance,
  isValidLatLng
} from '@/lib/utils/geolocation';

// Mock fetch for IP-based detection
global.fetch = jest.fn();

// Mock navigator for browser API tests
const mockNavigator = {
  language: 'en-US',
  languages: ['en-US', 'en', 'es'],
  geolocation: {
    getCurrentPosition: jest.fn()
  }
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
});

describe('Geolocation Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('detectUserLanguage', () => {
    it('should detect language from IP geolocation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          country: 'ES',
          country_name: 'Spain'
        })
      });

      const language = await detectUserLanguage();
      
      expect(language).toBe('es');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('ipapi.co')
      );
    });

    it('should fallback to browser language if IP detection fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const language = await detectUserLanguage();
      
      expect(language).toBe('en');
    });

    it('should handle specific IP', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          country: 'MX',
          country_name: 'Mexico'
        })
      });

      const language = await detectUserLanguage('192.168.1.1');
      
      expect(language).toBe('es');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('192.168.1.1')
      );
    });

    it('should handle unsupported countries', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          country: 'JP',
          country_name: 'Japan'
        })
      });

      const language = await detectUserLanguage();
      
      expect(language).toBe('en'); // Fallback to English
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const language = await detectUserLanguage();
      
      expect(language).toBe('en');
    });
  });

  describe('detectCountryFromIP', () => {
    it('should return country info from IP', async () => {
      const mockResponse = {
        country: 'US',
        country_name: 'United States',
        city: 'New York',
        region: 'New York',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await detectCountryFromIP();
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle rate limiting', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const result = await detectCountryFromIP();
      
      expect(result).toBeNull();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await detectCountryFromIP();
      
      expect(result).toBeNull();
    });

    it('should handle malformed responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}) // Missing required fields
      });

      const result = await detectCountryFromIP();
      
      expect(result).toBeNull();
    });
  });

  describe('detectUserLanguageSync', () => {
    it('should detect from navigator.language', () => {
      mockNavigator.language = 'es-ES';
      
      const language = detectUserLanguageSync();
      
      expect(language).toBe('es');
    });

    it('should handle language variants', () => {
      mockNavigator.language = 'en-GB';
      
      const language = detectUserLanguageSync();
      
      expect(language).toBe('en');
    });

    it('should fallback to navigator.languages', () => {
      mockNavigator.language = 'unknown';
      mockNavigator.languages = ['es-MX', 'en-US'];
      
      const language = detectUserLanguageSync();
      
      expect(language).toBe('es');
    });

    it('should handle unsupported languages', () => {
      mockNavigator.language = 'fr-FR';
      mockNavigator.languages = ['fr-FR', 'de-DE'];
      
      const language = detectUserLanguageSync();
      
      expect(language).toBe('en'); // Fallback
    });

    it('should handle missing navigator', () => {
      const originalNavigator = window.navigator;
      delete (window as any).navigator;
      
      const language = detectUserLanguageSync();
      
      expect(language).toBe('en');
      
      window.navigator = originalNavigator;
    });
  });

  describe('getCountryInfo', () => {
    it('should return info for supported countries', () => {
      const usInfo = getCountryInfo('US');
      
      expect(usInfo).toEqual({
        code: 'US',
        name: 'United States',
        language: 'en',
        continent: 'North America',
        currency: 'USD'
      });
    });

    it('should return info for Spanish-speaking countries', () => {
      const esInfo = getCountryInfo('ES');
      const mxInfo = getCountryInfo('MX');
      
      expect(esInfo?.language).toBe('es');
      expect(mxInfo?.language).toBe('es');
    });

    it('should return null for unsupported countries', () => {
      const info = getCountryInfo('XX');
      
      expect(info).toBeNull();
    });

    it('should be case insensitive', () => {
      const info = getCountryInfo('us');
      
      expect(info?.code).toBe('US');
    });
  });

  describe('isValidCountryCode', () => {
    it('should validate correct ISO codes', () => {
      expect(isValidCountryCode('US')).toBe(true);
      expect(isValidCountryCode('ES')).toBe(true);
      expect(isValidCountryCode('GB')).toBe(true);
    });

    it('should reject invalid codes', () => {
      expect(isValidCountryCode('XX')).toBe(false);
      expect(isValidCountryCode('USA')).toBe(false);
      expect(isValidCountryCode('')).toBe(false);
      expect(isValidCountryCode('1')).toBe(false);
    });

    it('should handle case insensitivity', () => {
      expect(isValidCountryCode('us')).toBe(true);
      expect(isValidCountryCode('Us')).toBe(true);
    });
  });

  describe('getLanguageFromCountry', () => {
    it('should return language for country', () => {
      expect(getLanguageFromCountry('ES')).toBe('es');
      expect(getLanguageFromCountry('US')).toBe('en');
      expect(getLanguageFromCountry('MX')).toBe('es');
      expect(getLanguageFromCountry('AR')).toBe('es');
    });

    it('should return null for unknown countries', () => {
      expect(getLanguageFromCountry('XX')).toBeNull();
    });

    it('should handle case insensitivity', () => {
      expect(getLanguageFromCountry('es')).toBe('es');
    });
  });

  describe('getUserTimezone', () => {
    it('should get timezone from Intl API', () => {
      const originalIntl = global.Intl;
      global.Intl = {
        ...originalIntl,
        DateTimeFormat: jest.fn().mockReturnValue({
          resolvedOptions: () => ({ timeZone: 'America/New_York' })
        })
      } as any;

      const timezone = getUserTimezone();
      
      expect(timezone).toBe('America/New_York');
      
      global.Intl = originalIntl;
    });

    it('should fallback to UTC if detection fails', () => {
      const originalIntl = global.Intl;
      delete (global as any).Intl;

      const timezone = getUserTimezone();
      
      expect(timezone).toBe('UTC');
      
      global.Intl = originalIntl;
    });
  });

  describe('formatCoordinates', () => {
    it('should format coordinates correctly', () => {
      expect(formatCoordinates(40.7128, -74.0060)).toBe('40.7128, -74.0060');
      expect(formatCoordinates(0, 0)).toBe('0.0000, 0.0000');
    });

    it('should handle precision', () => {
      expect(formatCoordinates(40.712847, -74.005974, 2)).toBe('40.71, -74.01');
      expect(formatCoordinates(40.712847, -74.005974, 6)).toBe('40.712847, -74.005974');
    });

    it('should handle extreme coordinates', () => {
      expect(formatCoordinates(90, 180)).toBe('90.0000, 180.0000');
      expect(formatCoordinates(-90, -180)).toBe('-90.0000, -180.0000');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between coordinates', () => {
      // Distance between NYC and LA
      const nyc = { lat: 40.7128, lng: -74.0060 };
      const la = { lat: 34.0522, lng: -118.2437 };
      
      const distance = calculateDistance(nyc.lat, nyc.lng, la.lat, la.lng);
      
      expect(distance).toBeCloseTo(3944, 0); // ~3944 km
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      
      expect(distance).toBe(0);
    });

    it('should handle coordinates across date line', () => {
      const distance = calculateDistance(0, 179, 0, -179);
      
      expect(distance).toBeCloseTo(222, 0); // ~222 km across date line
    });

    it('should handle poles', () => {
      const distance = calculateDistance(90, 0, -90, 0);
      
      expect(distance).toBeCloseTo(20015, 0); // Half circumference
    });
  });

  describe('isValidLatLng', () => {
    it('should validate correct coordinates', () => {
      expect(isValidLatLng(40.7128, -74.0060)).toBe(true);
      expect(isValidLatLng(0, 0)).toBe(true);
      expect(isValidLatLng(90, 180)).toBe(true);
      expect(isValidLatLng(-90, -180)).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(isValidLatLng(91, 0)).toBe(false); // Lat > 90
      expect(isValidLatLng(-91, 0)).toBe(false); // Lat < -90
      expect(isValidLatLng(0, 181)).toBe(false); // Lng > 180
      expect(isValidLatLng(0, -181)).toBe(false); // Lng < -180
    });

    it('should reject non-numeric values', () => {
      expect(isValidLatLng(NaN, 0)).toBe(false);
      expect(isValidLatLng(0, NaN)).toBe(false);
      expect(isValidLatLng(Infinity, 0)).toBe(false);
      expect(isValidLatLng(0, -Infinity)).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle network timeouts', async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100);
      });
      
      (global.fetch as jest.Mock).mockReturnValueOnce(timeoutPromise);

      const result = await detectCountryFromIP();
      
      expect(result).toBeNull();
    });

    it('should handle malformed JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const result = await detectCountryFromIP();
      
      expect(result).toBeNull();
    });

    it('should handle browser compatibility issues', () => {
      const originalIntl = global.Intl;
      const originalNavigator = window.navigator;
      
      delete (global as any).Intl;
      delete (window as any).navigator;

      expect(() => detectUserLanguageSync()).not.toThrow();
      expect(() => getUserTimezone()).not.toThrow();
      
      global.Intl = originalIntl;
      window.navigator = originalNavigator;
    });

    it('should handle concurrent requests efficiently', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ country: 'US' })
      });

      const promises = Array.from({ length: 10 }, () => detectCountryFromIP());
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      expect(global.fetch).toHaveBeenCalledTimes(10);
    });
  });
});