/**
 * Authentication and Authorization Types for PRISMA
 * Defines user roles, permissions, and access control
 */

// Customer Subscription Plans
export type SubscriptionPlan = 'free' | 'pro' | 'business' | 'enterprise';

// Admin Privilege Levels
export type AdminRole =
  | 'admin_viewer' // View-only access to admin panels
  | 'admin_support' // Customer support capabilities
  | 'admin_moderator' // Content moderation and user management
  | 'admin_manager' // Full user and content management
  | 'admin_developer' // System configuration and analytics
  | 'admin_architect'; // Full system access including infrastructure

// User Account Types
export type UserAccountType = 'customer' | 'admin';

// User Status
export type UserStatus =
  | 'active'
  | 'suspended'
  | 'pending_verification'
  | 'deactivated';

/**
 * Customer-specific data and subscription info
 */
export interface CustomerProfile {
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'trialing';
  subscriptionStartDate: Date;
  subscriptionEndDate?: Date;
  trialEndDate?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  // Usage tracking
  portfoliosCreated: number;
  aiEnhancementsUsed: number;
  monthlyPortfolioViews: number;

  // Plan limits
  maxPortfolios: number;
  maxAiEnhancements: number;
  customDomainEnabled: boolean;
  analyticsEnabled: boolean;
  prioritySupport: boolean;
}

/**
 * Admin-specific data and permissions
 */
export interface AdminProfile {
  adminRole: AdminRole;
  department: 'engineering' | 'support' | 'marketing' | 'sales' | 'management';
  hireDate: Date;
  lastAdminActivity?: Date;

  // Admin session management
  isInAdminMode: boolean;
  lastViewSwitchAt?: Date;

  // Permissions
  permissions: AdminPermission[];

  // Audit trail
  adminActions: AdminAction[];
}

/**
 * Granular admin permissions
 */
export type AdminPermission =
  // User Management
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:suspend'

  // Content Management
  | 'portfolios:read'
  | 'portfolios:moderate'
  | 'portfolios:delete'
  | 'templates:manage'

  // Subscription Management
  | 'subscriptions:read'
  | 'subscriptions:modify'
  | 'billing:read'
  | 'billing:refund'

  // System Management
  | 'analytics:read'
  | 'analytics:export'
  | 'system:configure'
  | 'system:deploy'
  | 'system:logs'

  // Support
  | 'support:tickets'
  | 'support:escalate'
  | 'impersonation:users'
  
  // Experiments
  | 'experiments:manage';

/**
 * Admin action audit log
 */
export interface AdminAction {
  id: string;
  adminId: string;
  action: string;
  targetType: 'user' | 'portfolio' | 'subscription' | 'system';
  targetId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

/**
 * Complete user profile combining base info with role-specific data
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  accountType: UserAccountType;
  status: UserStatus;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;

  // Contact information
  phone?: string;
  timezone?: string;
  language: 'es' | 'en';

  // Role-specific profiles
  customerProfile?: CustomerProfile;
  adminProfile?: AdminProfile;

  // Feature flags
  featureFlags: Record<string, boolean>;
}

/**
 * Permission context for UI and API authorization
 */
export interface PermissionContext {
  user: User;
  isAdmin: boolean;
  isInAdminMode: boolean;
  permissions: AdminPermission[];
  subscriptionPlan?: SubscriptionPlan;
  canAccess: (permission: AdminPermission) => boolean;
  canAccessFeature: (feature: string) => boolean;
  switchToAdminMode: () => Promise<void>;
  switchToUserMode: () => Promise<void>;
}

/**
 * Session data stored in JWT or session storage
 */
export interface SessionData {
  userId: string;
  email: string;
  accountType: UserAccountType;
  isInAdminMode: boolean;
  permissions: AdminPermission[];
  subscriptionPlan?: SubscriptionPlan;
  expiresAt: Date;
}

/**
 * API request context for authorization middleware
 */
export interface RequestContext {
  user: User;
  session: SessionData;
  ipAddress: string;
  userAgent: string;
  isAdmin: boolean;
  hasPermission: (permission: AdminPermission) => boolean;
}

/**
 * Subscription plan features and limits
 */
export interface PlanFeatures {
  maxPortfolios: number;
  maxAiEnhancements: number;
  customDomain: boolean;
  analytics: boolean;
  prioritySupport: boolean;
  collaborators: number;
  storageGb: number;
  brandingRemoval: boolean;
  seoOptimization: boolean;
  advancedTemplates: boolean;
}

/**
 * Plan configuration mapping
 */
export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  free: {
    maxPortfolios: 1,
    maxAiEnhancements: 3,
    customDomain: false,
    analytics: false,
    prioritySupport: false,
    collaborators: 0,
    storageGb: 1,
    brandingRemoval: false,
    seoOptimization: false,
    advancedTemplates: false,
  },
  pro: {
    maxPortfolios: 5,
    maxAiEnhancements: 50,
    customDomain: true,
    analytics: true,
    prioritySupport: false,
    collaborators: 2,
    storageGb: 10,
    brandingRemoval: true,
    seoOptimization: true,
    advancedTemplates: true,
  },
  business: {
    maxPortfolios: 25,
    maxAiEnhancements: 200,
    customDomain: true,
    analytics: true,
    prioritySupport: true,
    collaborators: 10,
    storageGb: 50,
    brandingRemoval: true,
    seoOptimization: true,
    advancedTemplates: true,
  },
  enterprise: {
    maxPortfolios: -1, // Unlimited
    maxAiEnhancements: -1, // Unlimited
    customDomain: true,
    analytics: true,
    prioritySupport: true,
    collaborators: -1, // Unlimited
    storageGb: 500,
    brandingRemoval: true,
    seoOptimization: true,
    advancedTemplates: true,
  },
};

/**
 * Admin role permission mapping
 */
export const ADMIN_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  admin_viewer: [
    'users:read',
    'portfolios:read',
    'subscriptions:read',
    'analytics:read',
  ],
  admin_support: [
    'users:read',
    'users:update',
    'portfolios:read',
    'portfolios:moderate',
    'subscriptions:read',
    'billing:read',
    'support:tickets',
    'impersonation:users',
  ],
  admin_moderator: [
    'users:read',
    'users:update',
    'users:suspend',
    'portfolios:read',
    'portfolios:moderate',
    'portfolios:delete',
    'subscriptions:read',
    'support:tickets',
    'support:escalate',
  ],
  admin_manager: [
    'users:read',
    'users:create',
    'users:update',
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
    'support:tickets',
    'support:escalate',
    'impersonation:users',
    'experiments:manage',
  ],
  admin_developer: [
    'users:read',
    'users:update',
    'portfolios:read',
    'templates:manage',
    'subscriptions:read',
    'analytics:read',
    'analytics:export',
    'system:configure',
    'system:logs',
    'experiments:manage',
  ],
  admin_architect: [
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
};
