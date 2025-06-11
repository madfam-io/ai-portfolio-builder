/**
 * @fileoverview Admin dashboard English translations
 * @module i18n/translations/en/admin
 */

export default {
  // Access control
  adminAccessDenied: 'Access Denied',
  adminNoPermission:
    'You do not have permission to access this administrative area.',

  // View modes
  adminUserView: 'User View',
  adminAdminView: 'Admin View',
  adminSwitchToUserView: 'Switch to User View',
  adminSwitchToAdminView: 'Switch to Admin View',
  adminImpersonatingUser: 'Impersonating User',

  // Dashboard stats
  adminTotalUsers: 'Total Users',
  adminActiveSubscriptions: 'Active Subscriptions',
  adminMonthlyRevenue: 'Monthly Revenue',
  adminPortfoliosCreated: 'Portfolios Created',
  adminPortfoliosCreatedStat: 'Portfolios Created',
  adminAiEnhancementsUsed: 'AI Enhancements Used',
  adminMonthlyViews: 'Monthly Views',

  // User management
  adminUserManagement: 'User Management',
  adminManageUsers: 'Manage user accounts, subscriptions, and system settings.',
  adminUser: 'User',
  adminSubscription: 'Subscription',
  adminStatus: 'Status',
  adminPortfolios: 'Portfolios',
  adminLastActive: 'Last Active',
  adminActions: 'Actions',
  adminViewAs: 'View As',
  adminStop: 'Stop',

  // Welcome message
  adminWelcomeBack: 'Welcome back, {name}!',
  adminCurrentlyViewing:
    "You are currently viewing PRISMA from a user's perspective.",

  // Status values
  adminStatusActive: 'active',
  adminStatusSuspended: 'suspended',

  // Plan types
  adminPlanFree: 'FREE',
  adminPlanPro: 'PRO',
  adminPlanBusiness: 'BUSINESS',
} as const;
