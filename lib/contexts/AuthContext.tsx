/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import { User as SupabaseUser } from '@supabase/supabase-js';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { getCurrentUser, onAuthStateChange } from '@/lib/auth/auth';
import {
  hasPermission,
  canAccessFeature,
  canSwitchToAdminMode,
  isSubscriptionActive as checkSubscriptionActive,
  getDaysUntilExpiration,
  getPermissionLevel,
  PLAN_FEATURES,
} from '@/lib/auth/roles';
import { logger } from '@/lib/utils/logger';
import {
  User,
  SubscriptionPlan,
  AdminPermission,
  SessionData,
} from '@/types/auth';

/**
 * Enhanced Authentication Context for PRISMA
 * Handles both customer and admin authentication with role-based access control
 *
 * Features:
 * - Customer subscription management (Free, Pro, Business, Enterprise)
 * - Admin role hierarchy (Viewer → Support → Moderator → Manager → Developer → Architect)
 * - Admin mode switching (view as user vs admin interface)
 * - User impersonation for support
 * - Permission-based access control
 * - Subscription limits and feature flags
 */

interface AuthContextType {
  // Authentication state
  loading: boolean;
  user: User | null;
  supabaseUser: SupabaseUser | null; // Keep original Supabase user for compatibility
  session: SessionData | null;

  // User type and permissions
  isAdmin: boolean;
  isInAdminMode: boolean;
  isImpersonating: boolean;
  permissions: AdminPermission[];
  subscriptionPlan?: SubscriptionPlan;
  permissionLevel: string;

  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Admin functionality
  switchToAdminMode: () => Promise<void>;
  switchToUserMode: () => Promise<void>;
  impersonateUser: (userId: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;

  // Permission checking
  canAccess: (permission: AdminPermission) => boolean;
  canAccessFeature: (feature: string) => boolean;
  hasReachedLimit: (
    limitType: 'portfolios' | 'aiEnhancements',
    currentUsage: number
  ) => boolean;

  // Profile management
  updateProfile: (updates: Partial<User>) => Promise<void>;
  upgradeSubscription: (plan: SubscriptionPlan) => Promise<void>;
  refreshUser: () => Promise<void>;

  // Subscription info
  isSubscriptionActive: boolean;
  daysUntilExpiration: number | null;
  usageStats: {
    portfoliosCreated: number;
    aiEnhancementsUsed: number;
    monthlyViews: number;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);

  // Get current effective user (impersonated user or actual user)
  const effectiveUser = impersonatedUser || user;

  /**
   * Mock user profile loader (in real implementation, this would fetch from Supabase)
   * For now, we'll create a mock admin user for demonstration
   */
  const loadUserProfile = useCallback(
    (supabaseUser: SupabaseUser): User | null => {
      try {
        // Mock implementation - in real app, this would query the database
        const isAdminEmail =
          supabaseUser.email?.includes('admin') ||
          supabaseUser.email?.includes('madfam') ||
          supabaseUser.email?.includes('prisma');

        const mockUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name:
            supabaseUser.user_metadata?.name ||
            supabaseUser.email?.split('@')[0] ||
            'User',
          avatarUrl: supabaseUser.user_metadata?.avatar_url,
          accountType: isAdminEmail ? 'admin' : 'customer',
          status: 'active',
          createdAt: new Date(supabaseUser.created_at),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          language: 'es',
          featureFlags: {},

          // Mock customer profile for non-admin users
          customerProfile: !isAdminEmail
            ? {
                subscriptionPlan: 'free',
                subscriptionStatus: 'active',
                subscriptionStartDate: new Date(),
                portfoliosCreated: 0,
                aiEnhancementsUsed: 1,
                monthlyPortfolioViews: 0,
                maxPortfolios: 1,
                maxAiEnhancements: 3,
                customDomainEnabled: false,
                analyticsEnabled: false,
                prioritySupport: false,
              }
            : undefined,

          // Mock admin profile for admin users
          adminProfile: isAdminEmail
            ? {
                adminRole: 'admin_architect', // Highest level for demo
                department: 'engineering',
                hireDate: new Date('2024-01-01'),
                isInAdminMode: false, // Start in user mode
                permissions: [
                  'users:read',
                  'users:create',
                  'users:update',
                  'users:delete',
                  'users:suspend',
                  'portfolios:read',
                  'portfolios:moderate',
                  'portfolios:delete',
                  'templates:manage',
                  'subscriptions:read',
                  'subscriptions:modify',
                  'billing:read',
                  'billing:refund',
                  'analytics:read',
                  'analytics:export',
                  'system:configure',
                  'system:deploy',
                  'system:logs',
                  'support:tickets',
                  'support:escalate',
                  'impersonation:users',
                  'experiments:manage',
                ],
                adminActions: [],
              }
            : undefined,
        };

        return mockUser;
      } catch (error) {
        logger.error(
          'Failed to load user profile',
          error instanceof Error ? error : new Error(String(error))
        );
        return null;
      }
    },
    []
  );

  /**
   * Create session data from user
   */
  const createSession = useCallback((user: User): SessionData => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

    return {
      userId: user.id,
      email: user.email,
      accountType: user.accountType,
      isInAdminMode: user.adminProfile?.isInAdminMode || false,
      permissions: user.adminProfile?.permissions || [],
      subscriptionPlan: user.customerProfile?.subscriptionPlan,
      expiresAt,
    };
  }, []);

  /**
   * Authentication methods (mock implementations for now)
   */
  const signIn = useCallback(async (email: string, _password: string) => {
    logger.info('Sign in attempt', { email });
    await Promise.resolve(); // Implementation would go here
  }, []);

  const signUp = useCallback(
    async (email: string, _password: string, name: string) => {
      logger.info('Sign up attempt', { email, name });
      // Implementation would go here
      await Promise.resolve();
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      const { signOut: authSignOut } = await import('@/lib/auth/auth');
      await authSignOut();
      setSupabaseUser(null);
      setUser(null);
      setSession(null);
      setImpersonatedUser(null);
    } catch (error) {
      logger.warn('Sign out failed - auth service not available', {
        error: (error as Error).message,
      });
      setSupabaseUser(null);
      setUser(null);
      setSession(null);
      setImpersonatedUser(null);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    logger.info('Reset password for', { email });
    // Implementation would go here
    await Promise.resolve();
  }, []);

  /**
   * Admin mode switching
   */
  const switchToAdminMode = useCallback(async () => {
    if (!user || !canSwitchToAdminMode(user)) {
      throw new Error('Cannot switch to admin mode');
    }

    if (!user.adminProfile) {
      throw new Error('Admin profile not found');
    }

    const updatedUser: User = {
      ...user,
      adminProfile: {
        ...user.adminProfile,
        isInAdminMode: true,
        lastViewSwitchAt: new Date(),
      },
    };

    setUser(updatedUser);
    setSession(createSession(updatedUser));

    logger.info('Switched to admin mode');
    await Promise.resolve();
  }, [user, createSession]);

  const switchToUserMode = useCallback(async () => {
    if (!user || !user.adminProfile) {
      throw new Error('Cannot switch to user mode');
    }

    const updatedUser = {
      ...user,
      adminProfile: {
        ...user.adminProfile,
        isInAdminMode: false,
        lastViewSwitchAt: new Date(),
      },
    };

    setUser(updatedUser);
    setSession(createSession(updatedUser));

    // Clear impersonation when switching to user mode
    setImpersonatedUser(null);

    logger.info('Switched to user mode');
    await Promise.resolve();
  }, [user, createSession]);

  /**
   * User impersonation (admin only)
   */
  const impersonateUser = useCallback(
    async (targetUserId: string) => {
      if (!user || !hasPermission(user, 'impersonation:users')) {
        throw new Error('No permission to impersonate users');
      }

      // In real implementation, this would load the target user from database
      await Promise.resolve(); // Simulate async database call

      const mockTargetUser: User = {
        id: targetUserId,
        email: `user${targetUserId}@example.com`,
        name: `Test User ${targetUserId}`,
        accountType: 'customer',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        language: 'es',
        featureFlags: {},
        customerProfile: {
          subscriptionPlan: 'pro',
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          portfoliosCreated: 2,
          aiEnhancementsUsed: 15,
          monthlyPortfolioViews: 150,
          maxPortfolios: 5,
          maxAiEnhancements: 50,
          customDomainEnabled: true,
          analyticsEnabled: true,
          prioritySupport: false,
        },
      };

      setImpersonatedUser(mockTargetUser);
      logger.info('Now impersonating user', { email: mockTargetUser.email });
    },
    [user]
  );

  const stopImpersonation = useCallback(async () => {
    if (impersonatedUser) {
      logger.info('Stopped impersonating', { email: impersonatedUser.email });
      setImpersonatedUser(null);
    }
    await Promise.resolve();
  }, [impersonatedUser]);

  /**
   * Profile management (stub implementations)
   */
  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return;
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      logger.info('Profile updated', { updates });
      await Promise.resolve();
    },
    [user]
  );

  const upgradeSubscription = useCallback(async (plan: SubscriptionPlan) => {
    logger.info('Upgrading to plan', { plan });
    // Implementation would integrate with Stripe
    await Promise.resolve();
  }, []);

  const refreshUser = useCallback(async () => {
    if (!supabaseUser) return;
    const freshUser = await loadUserProfile(supabaseUser);
    if (freshUser) {
      setUser(freshUser);
      setSession(createSession(freshUser));
    }
  }, [supabaseUser, loadUserProfile, createSession]);

  /**
   * Permission and feature checking
   */
  const canAccess = useCallback(
    (permission: AdminPermission): boolean => {
      return effectiveUser ? hasPermission(effectiveUser, permission) : false;
    },
    [effectiveUser]
  );

  const canAccessFeatureCheck = useCallback(
    (feature: string): boolean => {
      return effectiveUser
        ? canAccessFeature(
            effectiveUser,
            feature as keyof typeof PLAN_FEATURES.free
          )
        : false;
    },
    [effectiveUser]
  );

  const hasReachedLimit = useCallback(
    (
      limitType: 'portfolios' | 'aiEnhancements',
      currentUsage: number
    ): boolean => {
      if (!effectiveUser || effectiveUser.accountType === 'admin') return false;
      if (!effectiveUser.customerProfile) return true;

      const { maxPortfolios, maxAiEnhancements } =
        effectiveUser.customerProfile;

      switch (limitType) {
        case 'portfolios':
          return maxPortfolios !== -1 && currentUsage >= maxPortfolios;
        case 'aiEnhancements':
          return maxAiEnhancements !== -1 && currentUsage >= maxAiEnhancements;
        default:
          return false;
      }
    },
    [effectiveUser]
  );

  // Initialize auth state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get initial user
        const { data, error } = await getCurrentUser();
        if (!error && data.user) {
          setSupabaseUser(data.user);
          const userProfile = await loadUserProfile(data.user);
          if (userProfile) {
            setUser(userProfile);
            setSession(createSession(userProfile));
          }
        }
        setLoading(false);

        // Listen for auth changes
        const {
          data: { subscription },
        } = onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setSupabaseUser(session.user);
            const userProfile = await loadUserProfile(session.user);
            if (userProfile) {
              setUser(userProfile);
              setSession(createSession(userProfile));
            }
          } else {
            setSupabaseUser(null);
            setUser(null);
            setSession(null);
            setImpersonatedUser(null);
          }
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        logger.warn('Authentication service not available', {
          error: (error as Error).message,
        });
        setSupabaseUser(null);
        setUser(null);
        setSession(null);
        setLoading(false);
        return () => {};
      }
    };

    const cleanup = checkAuth();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [loadUserProfile, createSession]);

  // Calculate subscription status and stats
  const isSubscriptionActiveStatus = effectiveUser
    ? checkSubscriptionActive(effectiveUser)
    : false;
  const daysUntilExpiration = effectiveUser
    ? getDaysUntilExpiration(effectiveUser)
    : null;
  const permissionLevel = effectiveUser
    ? getPermissionLevel(effectiveUser)
    : 'Unknown';

  const usageStats = {
    portfoliosCreated: effectiveUser?.customerProfile?.portfoliosCreated || 0,
    aiEnhancementsUsed: effectiveUser?.customerProfile?.aiEnhancementsUsed || 0,
    monthlyViews: effectiveUser?.customerProfile?.monthlyPortfolioViews || 0,
  };

  const value: AuthContextType = {
    // Auth state
    loading,
    user: effectiveUser,
    supabaseUser, // Keep for compatibility with existing code
    session,

    // User type and permissions
    isAdmin: effectiveUser?.accountType === 'admin' || false,
    isInAdminMode: effectiveUser?.adminProfile?.isInAdminMode || false,
    isImpersonating: !!impersonatedUser,
    permissions: effectiveUser?.adminProfile?.permissions || [],
    subscriptionPlan: effectiveUser?.customerProfile?.subscriptionPlan,
    permissionLevel,

    // Auth methods
    signIn,
    signUp,
    signOut,
    resetPassword,

    // Admin methods
    switchToAdminMode,
    switchToUserMode,
    impersonateUser,
    stopImpersonation,

    // Permission methods
    canAccess,
    canAccessFeature: canAccessFeatureCheck,
    hasReachedLimit,

    // Profile methods
    updateProfile,
    upgradeSubscription,
    refreshUser,

    // Subscription info
    isSubscriptionActive: isSubscriptionActiveStatus,
    daysUntilExpiration,
    usageStats,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a safe default when outside AuthProvider for backwards compatibility
    return {
      loading: false,
      user: null,
      supabaseUser: null,
      session: null,
      isAdmin: false,
      isInAdminMode: false,
      isImpersonating: false,
      permissions: [],
      permissionLevel: 'Unknown',
      signIn: async () => {},
      signUp: async () => {},
      signOut: async () => {},
      resetPassword: async () => {},
      switchToAdminMode: () => {
        throw new Error('Not in AuthProvider');
      },
      switchToUserMode: () => {
        throw new Error('Not in AuthProvider');
      },
      impersonateUser: () => {
        throw new Error('Not in AuthProvider');
      },
      stopImpersonation: async () => {},
      canAccess: () => false,
      canAccessFeature: () => false,
      hasReachedLimit: () => true,
      updateProfile: async () => {},
      upgradeSubscription: async () => {},
      refreshUser: async () => {},
      isSubscriptionActive: false,
      daysUntilExpiration: null,
      usageStats: {
        portfoliosCreated: 0,
        aiEnhancementsUsed: 0,
        monthlyViews: 0,
      },
    };
  }
  return context;
}
