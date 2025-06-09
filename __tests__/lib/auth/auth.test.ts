/**
 * @jest-environment jsdom
 */
// Jest globals are available in test environment

// Mock Supabase before importing our auth module
const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    refreshSession: jest.fn(),
    updateUser: jest.fn(),
  },
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  signInWithOAuth,
  setSupabaseClient,
  resetSupabaseClient,
} from '@/lib/auth/auth';
import { resetAllMocks } from '../../utils/test-utils';

describe('Authentication Service', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
    // Set our mock client for each test
    setSupabaseClient(mockSupabaseClient as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset to default client after each test
    resetSupabaseClient();
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'SecureTest123!';
      const fullName = 'Test User';

      const mockResponse = {
        data: {
          user: { id: '123', email },
          session: { access_token: 'token123' },
        },
        error: null,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue(mockResponse);

      // Act
      const result = await signUp(email, password, fullName);

      // Assert
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      expect(result.data?.user?.email).toBe(email);
      expect(result.error).toBeNull();
    });

    it('should handle sign up errors', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'SecureTest123!';
      const errorMessage = 'User already registered';

      const mockResponse = {
        data: { user: null, session: null },
        error: { message: errorMessage },
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue(mockResponse);

      // Act
      const result = await signUp(email, password);

      // Assert
      expect(result.error?.message).toBe(errorMessage);
      expect(result.data.user).toBeNull();
    });

    it('should require valid email format', async () => {
      // Arrange
      const invalidEmail = 'not-an-email';
      const password = 'password123';

      // Act & Assert
      await expect(signUp(invalidEmail, password)).rejects.toThrow(
        'Invalid email format'
      );
    });

    it('should require minimum password length', async () => {
      // Arrange
      const email = 'test@example.com';
      const shortPassword = '123';

      // Act & Assert
      await expect(signUp(email, shortPassword)).rejects.toThrow(
        'Password must be at least 12 characters with uppercase, lowercase, numbers, and special characters'
      );
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'SecureTest123!';

      const mockResponse = {
        data: {
          user: { id: '123', email },
          session: { access_token: 'token123' },
        },
        error: null,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await signIn(email, password);

      // Assert
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password,
      });
      expect(result.data?.user?.email).toBe(email);
      expect(result.error).toBeNull();
    });

    it('should handle invalid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const errorMessage = 'Invalid credentials';

      const mockResponse = {
        data: { user: null, session: null },
        error: { message: errorMessage },
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await signIn(email, password);

      // Assert
      expect(result.error?.message).toBe(errorMessage);
      expect(result.data.user).toBeNull();
    });
  });

  describe('signInWithOAuth', () => {
    it('should initiate OAuth sign in with LinkedIn', async () => {
      // Arrange
      const provider = 'linkedin_oidc';
      const redirectTo = 'http://localhost:3000/auth/callback';

      const mockResponse = {
        data: { url: 'https://linkedin.com/oauth/authorize' },
        error: null,
      };

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue(mockResponse);

      // Act
      const result = await signInWithOAuth(provider, redirectTo);

      // Assert
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider,
        options: {
          redirectTo,
        },
      });
      expect(result.data?.url).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should initiate OAuth sign in with GitHub', async () => {
      // Arrange
      const provider = 'github';
      const redirectTo = 'http://localhost:3000/auth/callback';

      const mockResponse = {
        data: { url: 'https://github.com/login/oauth/authorize' },
        error: null,
      };

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue(mockResponse);

      // Act
      const result = await signInWithOAuth(provider, redirectTo);

      // Assert
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider,
        options: {
          redirectTo,
        },
      });
      expect(result.data?.url).toBeDefined();
    });
  });

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      // Arrange
      const mockResponse = { error: null };
      mockSupabaseClient.auth.signOut.mockResolvedValue(mockResponse);

      // Act
      const result = await signOut();

      // Assert
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('should handle sign out errors', async () => {
      // Arrange
      const errorMessage = 'Failed to sign out';
      const mockResponse = { error: { message: errorMessage } };
      mockSupabaseClient.auth.signOut.mockResolvedValue(mockResponse);

      // Act
      const result = await signOut();

      // Assert
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', async () => {
      // Arrange
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockResponse = {
        data: { user: mockUser },
        error: null,
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue(mockResponse);

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(result.data?.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should return null when not authenticated', async () => {
      // Arrange
      const mockResponse = {
        data: { user: null },
        error: null,
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue(mockResponse);

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result.data?.user).toBeNull();
    });

    it('should handle authentication errors', async () => {
      // Arrange
      const errorMessage = 'Authentication failed';
      const mockResponse = {
        data: { user: null },
        error: { message: errorMessage },
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue(mockResponse);

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result.error?.message).toBe(errorMessage);
    });
  });
});
