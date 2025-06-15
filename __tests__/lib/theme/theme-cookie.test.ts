import { cookies } from 'next/headers';
import { getThemeFromCookie, setThemeCookie } from '@/lib/theme/theme-cookie';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('Theme Cookie', () => {
  describe('getThemeFromCookie', () => {
    it('should return theme from cookie when valid', () => {
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'light' }),
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      const theme = getThemeFromCookie();
      expect(theme).toBe('light');
      expect(mockCookieStore.get).toHaveBeenCalledWith('theme-preference');
    });

    it('should return dark theme when cookie has dark value', () => {
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'dark' }),
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      const theme = getThemeFromCookie();
      expect(theme).toBe('dark');
    });

    it('should return system theme when cookie has system value', () => {
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'system' }),
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      const theme = getThemeFromCookie();
      expect(theme).toBe('system');
    });

    it('should return default dark theme when cookie is not set', () => {
      const mockCookieStore = {
        get: jest.fn().mockReturnValue(null),
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      const theme = getThemeFromCookie();
      expect(theme).toBe('dark');
    });

    it('should return default dark theme when cookie has invalid value', () => {
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'invalid-theme' }),
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      const theme = getThemeFromCookie();
      expect(theme).toBe('dark');
    });
  });

  describe('setThemeCookie', () => {
    const originalDocument = global.document;

    beforeEach(() => {
      // Mock document.cookie
      Object.defineProperty(global, 'document', {
        value: { cookie: '' },
        writable: true,
      });
    });

    afterEach(() => {
      global.document = originalDocument;
    });

    it('should set light theme cookie', () => {
      setThemeCookie('light');
      expect(document.cookie).toContain('theme-preference=light');
      expect(document.cookie).toContain('path=/');
      expect(document.cookie).toContain('max-age=31536000');
      expect(document.cookie).toContain('SameSite=Lax');
    });

    it('should set dark theme cookie', () => {
      setThemeCookie('dark');
      expect(document.cookie).toContain('theme-preference=dark');
    });

    it('should set system theme cookie', () => {
      setThemeCookie('system');
      expect(document.cookie).toContain('theme-preference=system');
    });
  });
});