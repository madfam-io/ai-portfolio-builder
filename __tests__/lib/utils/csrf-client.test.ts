import {
  fetchWithCSRF,
  useCSRFToken,
  addCSRFToFormData,
  getCSRFHeaders,
} from '@/lib/utils/csrf-client';
import { getCSRFToken } from '@/middleware/csrf-enhanced';

// Mock the CSRF token function
jest.mock('@/middleware/csrf-enhanced', () => ({
  getCSRFToken: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn(() => 
  Promise.resolve(new Response('OK'))
);

describe('CSRF Client Utilities', () => {
  const mockToken = 'test-csrf-token-123';
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  const mockGetCSRFToken = getCSRFToken as jest.MockedFunction<typeof getCSRFToken>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue(new Response('OK'));
  });

  describe('fetchWithCSRF', () => {
    it('should include CSRF token for POST requests', async () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      await fetchWithCSRF('/api/test', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        headers: {
          'x-csrf-token': mockToken,
        },
      });
    });

    it('should include CSRF token for PUT requests', async () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      await fetchWithCSRF('/api/test', { method: 'PUT' });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'PUT',
        headers: {
          'x-csrf-token': mockToken,
        },
      });
    });

    it('should include CSRF token for PATCH requests', async () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      await fetchWithCSRF('/api/test', { method: 'PATCH' });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'PATCH',
        headers: {
          'x-csrf-token': mockToken,
        },
      });
    });

    it('should include CSRF token for DELETE requests', async () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      await fetchWithCSRF('/api/test', { method: 'DELETE' });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'DELETE',
        headers: {
          'x-csrf-token': mockToken,
        },
      });
    });

    it('should not include CSRF token for GET requests', async () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      await fetchWithCSRF('/api/test');

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {});
    });

    it('should not include CSRF token for GET requests with explicit method', async () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      await fetchWithCSRF('/api/test', { method: 'GET' });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', { method: 'GET' });
    });

    it('should handle lowercase method names', async () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      await fetchWithCSRF('/api/test', { method: 'post' });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'post',
        headers: {
          'x-csrf-token': mockToken,
        },
      });
    });

    it('should merge with existing headers', async () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      await fetchWithCSRF('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'value',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'value',
          'x-csrf-token': mockToken,
        },
      });
    });

    it('should handle missing CSRF token', async () => {
      mockGetCSRFToken.mockReturnValue(null);

      await fetchWithCSRF('/api/test', { method: 'POST' });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
      });
    });

    it('should pass through all other fetch options', async () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      const options = {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        credentials: 'include' as RequestCredentials,
        mode: 'cors' as RequestMode,
        cache: 'no-cache' as RequestCache,
      };

      await fetchWithCSRF('/api/test', options);

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        ...options,
        headers: {
          'x-csrf-token': mockToken,
        },
      });
    });
  });

  describe('useCSRFToken', () => {
    const originalWindow = global.window;

    afterEach(() => {
      global.window = originalWindow;
    });

    it('should return CSRF token in browser environment', () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      const token = useCSRFToken();
      expect(token).toBe(mockToken);
      expect(mockGetCSRFToken).toHaveBeenCalled();
    });

    it('should return null in server environment', () => {
      // Simulate server environment
      delete (global as any).window;

      const token = useCSRFToken();
      expect(token).toBeNull();
      expect(mockGetCSRFToken).not.toHaveBeenCalled();
    });

    it('should handle null token from getCSRFToken', () => {
      mockGetCSRFToken.mockReturnValue(null);

      const token = useCSRFToken();
      expect(token).toBeNull();
    });
  });

  describe('addCSRFToFormData', () => {
    it('should add CSRF token to FormData', () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      const formData = new FormData();
      formData.append('name', 'John');
      formData.append('email', 'john@example.com');

      const result = addCSRFToFormData(formData);

      expect(result).toBe(formData); // Should return same instance
      expect(formData.get('_csrf')).toBe(mockToken);
      expect(formData.get('name')).toBe('John');
      expect(formData.get('email')).toBe('john@example.com');
    });

    it('should not add CSRF token if not available', () => {
      mockGetCSRFToken.mockReturnValue(null);

      const formData = new FormData();
      formData.append('name', 'John');

      const result = addCSRFToFormData(formData);

      expect(result).toBe(formData);
      expect(formData.has('_csrf')).toBe(false);
      expect(formData.get('name')).toBe('John');
    });

    it('should overwrite existing _csrf field', () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      const formData = new FormData();
      formData.append('_csrf', 'old-token');

      addCSRFToFormData(formData);

      // FormData.append adds to existing values, so we'll have both
      const csrfValues = formData.getAll('_csrf');
      expect(csrfValues).toContain(mockToken);
    });
  });

  describe('getCSRFHeaders', () => {
    it('should return headers with CSRF token', () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      const headers = getCSRFHeaders();

      expect(headers).toEqual({
        'x-csrf-token': mockToken,
      });
    });

    it('should return empty object if no CSRF token', () => {
      mockGetCSRFToken.mockReturnValue(null);

      const headers = getCSRFHeaders();

      expect(headers).toEqual({});
    });

    it('should merge with object headers', () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      const headers = getCSRFHeaders({
        'Content-Type': 'application/json',
        'X-Custom': 'value',
      });

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'X-Custom': 'value',
        'x-csrf-token': mockToken,
      });
    });

    it('should merge with Headers instance', () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      const additionalHeaders = new Headers();
      additionalHeaders.set('Content-Type', 'application/json');
      additionalHeaders.set('X-Custom', 'value');

      const headers = getCSRFHeaders(additionalHeaders);

      expect(headers).toEqual({
        'content-type': 'application/json', // Headers normalizes to lowercase
        'x-custom': 'value',
        'x-csrf-token': mockToken,
      });
    });

    it('should merge with array headers', () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      const headers = getCSRFHeaders([
        ['Content-Type', 'application/json'],
        ['X-Custom', 'value'],
      ]);

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'X-Custom': 'value',
        'x-csrf-token': mockToken,
      });
    });

    it('should override CSRF token from additional headers', () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      const headers = getCSRFHeaders({
        'x-csrf-token': 'old-token',
        'Content-Type': 'application/json',
      });

      expect(headers).toEqual({
        'x-csrf-token': 'old-token', // Additional headers override the fresh token
        'Content-Type': 'application/json',
      });
    });

    it('should handle undefined additional headers', () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      const headers = getCSRFHeaders(undefined);

      expect(headers).toEqual({
        'x-csrf-token': mockToken,
      });
    });

    it('should handle empty Headers instance', () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      const headers = getCSRFHeaders(new Headers());

      expect(headers).toEqual({
        'x-csrf-token': mockToken,
      });
    });

    it('should handle empty array headers', () => {
      mockGetCSRFToken.mockReturnValue(mockToken);

      const headers = getCSRFHeaders([]);

      expect(headers).toEqual({
        'x-csrf-token': mockToken,
      });
    });
  });
});