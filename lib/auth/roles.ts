import {
  User,
  AdminPermission,
  AdminRole,
  SubscriptionPlan,
  PermissionContext,
  ADMIN_PERMISSIONS,
  PLAN_FEATURES,
} from '@/types/auth';

/**
 * Role-based Access Control (RBAC) utilities for PRISMA
 * Handles permission checking, role management, and admin mode switching
 */

/**
 * Check if user has specific admin permission
 */
export function hasPermission(
  user: User,
  permission: AdminPermission
): boolean {
  if (user.accountType !== 'admin' || !user.adminProfile) {
    return false;
  }

  // Only check permissions if user is in admin mode
  if (!user.adminProfile.isInAdminMode) {
    return false;
  }

  return user.adminProfile.permissions.includes(permission);
}

/**
 * Check if user can access a feature based on subscription plan
 */
export function canAccessFeature(
  user: User,
  feature: keyof typeof PLAN_FEATURES.free
): boolean {
  if (user.accountType === 'admin') {
    return true; // Admins have access to all features
  }

  if (!user.customerProfile) {
    return false;
  }

  const planFeatures = PLAN_FEATURES[user.customerProfile.subscriptionPlan];
  return Boolean(planFeatures[feature]);
}

/**
 * Check if user has reached their plan limits
 */
export function hasReachedLimit(
  user: User,
  limitType: 'portfolios' | 'aiEnhancements',
  currentUsage: number
): boolean {
  if (user.accountType === 'admin') {
    return false; // Admins have no limits
  }

  if (!user.customerProfile) {
    return true; // No profile means no access
  }

  const planFeatures = PLAN_FEATURES[user.customerProfile.subscriptionPlan];

  switch (limitType) {
    case 'portfolios':
      return (
        planFeatures.maxPortfolios !== -1 &&
        currentUsage >= planFeatures.maxPortfolios
      );
    case 'aiEnhancements':
      return (
        planFeatures.maxAiEnhancements !== -1 &&
        currentUsage >= planFeatures.maxAiEnhancements
      );
    default:
      return false;
  }
}

/**
 * Get user's permission level description
 */
export function getPermissionLevel(user: User): string {
  if (user.accountType === 'admin' && user.adminProfile) {
    const roleDescriptions: Record<AdminRole, string> = {
      admin_viewer: 'View-Only Admin',
      admin_support: 'Support Admin',
      admin_moderator: 'Content Moderator',
      admin_manager: 'Admin Manager',
      admin_developer: 'Developer Admin',
      admin_architect: 'System Architect',
    };
    return roleDescriptions[user.adminProfile.adminRole];
  }

  if (user.customerProfile) {
    const planDescriptions: Record<SubscriptionPlan, string> = {
      free: 'Free User',
      pro: 'Pro Subscriber',
      business: 'Business Subscriber',
      enterprise: 'Enterprise Client',
    };
    return planDescriptions[user.customerProfile.subscriptionPlan];
  }

  return 'Unknown';
}

/**
 * Get all permissions for an admin role
 */
export function getRolePermissions(role: AdminRole): AdminPermission[] {
  return ADMIN_PERMISSIONS[role] || [];
}

/**
 * Check if admin role can perform specific actions
 */
export function canPerformAction(
  role: AdminRole,
  action: AdminPermission
): boolean {
  return ADMIN_PERMISSIONS[role]?.includes(action) || false;
}

/**
 * Validate if user can switch to admin mode
 */
export function canSwitchToAdminMode(user: User): boolean {
  return (
    user.accountType === 'admin' &&
    user.status === 'active' &&
    user.adminProfile !== undefined
  );
}

/**
 * Validate if user can impersonate other users
 */
export function canImpersonateUsers(user: User): boolean {
  return hasPermission(user, 'impersonation:users');
}

/**
 * Get subscription plan display name
 */
export function getPlanDisplayName(plan: SubscriptionPlan): string {
  const displayNames: Record<SubscriptionPlan, string> = {
    free: 'PRISMA Free',
    pro: 'PRISMA Pro',
    business: 'PRISMA Business',
    enterprise: 'PRISMA Enterprise',
  };
  return displayNames[plan];
}

/**
 * Get plan pricing information
 */
export function getPlanPricing(
  plan: SubscriptionPlan,
  currency: 'USD' | 'MXN' | 'EUR'
) {
  const pricing = {
    free: { USD: 0, MXN: 0, EUR: 0 },
    pro: { USD: 29, MXN: 149, EUR: 25 },
    business: { USD: 79, MXN: 399, EUR: 69 },
    enterprise: { USD: 299, MXN: 1499, EUR: 249 },
  };

  return {
    amount: pricing[plan][currency],
    currency,
    period: plan === 'free' ? null : 'month',
  };
}

/**
 * Check if subscription is active and not expired
 */
export function isSubscriptionActive(user: User): boolean {
  if (user.accountType === 'admin') {
    return true; // Admins always have access
  }

  if (!user.customerProfile) {
    return false;
  }

  const { subscriptionStatus, subscriptionEndDate } = user.customerProfile;

  // Free plan is always considered active
  if (user.customerProfile.subscriptionPlan === 'free') {
    return subscriptionStatus === 'active';
  }

  // Check if subscription is active and not expired
  const isActive =
    subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
  const notExpired = !subscriptionEndDate || new Date() < subscriptionEndDate;

  return isActive && notExpired;
}

/**
 * Get days until subscription expires
 */
export function getDaysUntilExpiration(user: User): number | null {
  if (user.accountType === 'admin' || !user.customerProfile) {
    return null;
  }

  const { subscriptionEndDate, trialEndDate } = user.customerProfile;
  const expirationDate = subscriptionEndDate || trialEndDate;

  if (!expirationDate) {
    return null;
  }

  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Generate permission context for the current user
 */
export function createPermissionContext(user: User): PermissionContext {
  const isAdmin = user.accountType === 'admin';
  const isInAdminMode = (isAdmin && user.adminProfile?.isInAdminMode) || false;
  const permissions =
    isAdmin && user.adminProfile ? user.adminProfile.permissions : [];

  return {
    user,
    isAdmin,
    isInAdminMode,
    permissions,
    subscriptionPlan: user.customerProfile?.subscriptionPlan,
    canAccess: (permission: AdminPermission) => hasPermission(user, permission),
    canAccessFeature: (feature: string) =>
      canAccessFeature(user, feature as any),
    switchToAdminMode: () => {
      // This would be implemented in the auth service
      throw new Error('switchToAdminMode must be implemented by auth service');
    },
    switchToUserMode: () => {
      // This would be implemented in the auth service
      throw new Error('switchToUserMode must be implemented by auth service');
    },
  };
}

/**
 * Admin role hierarchy for permission inheritance
 */
export const ADMIN_ROLE_HIERARCHY: Record<AdminRole, number> = {
  admin_viewer: 1,
  admin_support: 2,
  admin_moderator: 3,
  admin_manager: 4,
  admin_developer: 5,
  admin_architect: 6,
};

/**
 * Check if one admin role is higher than another
 */
export function isHigherRole(role1: AdminRole, role2: AdminRole): boolean {
  return ADMIN_ROLE_HIERARCHY[role1] > ADMIN_ROLE_HIERARCHY[role2];
}

/**
 * Get required role for specific permission
 */
export function getRequiredRoleForPermission(
  permission: AdminPermission
): AdminRole | null {
  for (const [role, permissions] of Object.entries(ADMIN_PERMISSIONS)) {
    if (permissions.includes(permission)) {
      return role as AdminRole;
    }
  }
  return null;
}
