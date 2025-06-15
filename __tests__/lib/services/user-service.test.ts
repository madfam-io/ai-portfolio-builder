import { UserService } from '@/lib/services/user-service';
import { createClient } from '@/lib/supabase/server';
import { cache } from '@/lib/cache/redis-cache.server';
import { logger } from '@/lib/utils/logger';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/cache/redis-cache.server');
jest.mock('@/lib/utils/logger');

describe('UserService', () => {
  let userService: UserService;
  let mockSupabase: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      locale: 'en'
    },
    created_at: '2023-01-01T00:00:00Z',
    last_sign_in_at: '2023-12-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
        updateUser: jest.fn(),
        signOut: jest.fn()
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis()
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    userService = new UserService();
  });

  describe('getCurrentUser', () => {
    it('should return current authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const user = await userService.getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });

    it('should return null when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const user = await userService.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should handle auth errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: null,
        error: new Error('Auth error')
      });

      await expect(userService.getCurrentUser()).rejects.toThrow('Auth error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getUserProfile', () => {
    it('should return cached profile if available', async () => {
      const cachedProfile = {
        id: 'user-123',
        displayName: 'Cached User',
        email: 'cached@example.com'
      };

      (cache.get as jest.Mock).mockResolvedValue(cachedProfile);

      const profile = await userService.getUserProfile('user-123');

      expect(profile).toEqual(cachedProfile);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should fetch and cache profile if not cached', async () => {
      const dbProfile = {
        id: 'user-123',
        email: 'test@example.com',
        display_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        bio: 'Test bio',
        preferences: { theme: 'dark' }
      };

      (cache.get as jest.Mock).mockResolvedValue(null);
      mockSupabase.single.mockResolvedValue({
        data: dbProfile,
        error: null
      });

      const profile = await userService.getUserProfile('user-123');

      expect(profile).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        bio: 'Test bio',
        preferences: { theme: 'dark' }
      });

      expect(cache.set).toHaveBeenCalledWith(
        'user:user-123',
        expect.objectContaining({ id: 'user-123' }),
        300 // 5 minutes
      );
    });

    it('should return null for non-existent user', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });

      const profile = await userService.getUserProfile('non-existent');

      expect(profile).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile in database', async () => {
      const updates = {
        displayName: 'Updated Name',
        bio: 'Updated bio'
      };

      mockSupabase.single.mockResolvedValue({
        data: { id: 'user-123', ...updates },
        error: null
      });

      const result = await userService.updateUserProfile('user-123', updates);

      expect(result).toBe(true);
      expect(mockSupabase.update).toHaveBeenCalledWith({
        display_name: 'Updated Name',
        bio: 'Updated bio',
        updated_at: expect.any(Date)
      });
    });

    it('should update auth metadata for display name', async () => {
      const updates = { displayName: 'New Name' };

      mockSupabase.single.mockResolvedValue({
        data: { id: 'user-123' },
        error: null
      });

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      await userService.updateUserProfile('user-123', updates);

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        data: { full_name: 'New Name' }
      });
    });

    it('should invalidate cache after update', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: 'user-123' },
        error: null
      });

      await userService.updateUserProfile('user-123', { bio: 'New bio' });

      expect(cache.del).toHaveBeenCalledWith('user:user-123');
    });

    it('should handle update errors', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Update failed')
      });

      const result = await userService.updateUserProfile('user-123', { bio: 'New' });

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      const profile = {
        preferences: {
          theme: 'dark',
          language: 'es',
          emailNotifications: true
        }
      };

      jest.spyOn(userService, 'getUserProfile').mockResolvedValue(profile as any);

      const preferences = await userService.getUserPreferences('user-123');

      expect(preferences).toEqual(profile.preferences);
    });

    it('should return default preferences if none set', async () => {
      jest.spyOn(userService, 'getUserProfile').mockResolvedValue({
        id: 'user-123',
        preferences: {}
      } as any);

      const preferences = await userService.getUserPreferences('user-123');

      expect(preferences).toEqual({
        theme: 'light',
        language: 'es',
        emailNotifications: true,
        marketingEmails: false
      });
    });
  });

  describe('updateUserPreferences', () => {
    it('should merge preferences updates', async () => {
      const existingPrefs = {
        theme: 'dark',
        language: 'es'
      };

      jest.spyOn(userService, 'getUserPreferences').mockResolvedValue(existingPrefs);
      jest.spyOn(userService, 'updateUserProfile').mockResolvedValue(true);

      const result = await userService.updateUserPreferences('user-123', {
        language: 'en',
        emailNotifications: false
      });

      expect(result).toBe(true);
      expect(userService.updateUserProfile).toHaveBeenCalledWith('user-123', {
        preferences: {
          theme: 'dark',
          language: 'en',
          emailNotifications: false
        }
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user account and data', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });

      mockSupabase.eq.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await userService.deleteUser('user-123');

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('should prevent deleting other users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'current-user' } },
        error: null
      });

      await expect(userService.deleteUser('other-user')).rejects.toThrow('Unauthorized');
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockPortfolios = [
        { id: '1', status: 'published', views: 100 },
        { id: '2', status: 'draft', views: 50 },
        { id: '3', status: 'published', views: 200 }
      ];

      mockSupabase.eq.mockResolvedValue({
        data: mockPortfolios,
        error: null
      });

      const stats = await userService.getUserStats('user-123');

      expect(stats).toEqual({
        totalPortfolios: 3,
        publishedPortfolios: 2,
        totalViews: 350,
        lastActive: expect.any(Date)
      });
    });

    it('should cache stats', async () => {
      const cachedStats = {
        totalPortfolios: 5,
        publishedPortfolios: 3,
        totalViews: 500
      };

      (cache.get as jest.Mock).mockResolvedValue(cachedStats);

      const stats = await userService.getUserStats('user-123');

      expect(stats).toEqual(cachedStats);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('searchUsers', () => {
    it('should search users by query', async () => {
      const searchResults = [
        { id: '1', display_name: 'John Doe', email: 'john@example.com' },
        { id: '2', display_name: 'Jane Doe', email: 'jane@example.com' }
      ];

      mockSupabase.or = jest.fn().mockReturnThis();
      mockSupabase.limit = jest.fn().mockResolvedValue({
        data: searchResults,
        error: null
      });

      const results = await userService.searchUsers('doe');

      expect(results).toHaveLength(2);
      expect(mockSupabase.or).toHaveBeenCalledWith(
        'display_name.ilike.%doe%,email.ilike.%doe%'
      );
    });

    it('should limit search results', async () => {
      mockSupabase.or = jest.fn().mockReturnThis();
      mockSupabase.limit = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      await userService.searchUsers('test', 5);

      expect(mockSupabase.limit).toHaveBeenCalledWith(5);
    });
  });
});