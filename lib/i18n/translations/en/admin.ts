/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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

  // Admin dashboard
  adminDashboard: 'Admin Dashboard',
  adminPanel: 'Admin Panel',
  adminOverview: 'Overview',
  systemStatus: 'System Status',

  // User details
  userId: 'User ID',
  email: 'Email',
  registeredDate: 'Registered Date',
  lastLogin: 'Last Login',
  accountType: 'Account Type',

  // System actions
  exportData: 'Export Data',
  importData: 'Import Data',
  systemSettings: 'System Settings',
  maintenanceMode: 'Maintenance Mode',

  // Reports
  reports: 'Reports',
  userActivityReport: 'User Activity Report',
  revenueReport: 'Revenue Report',
  usageReport: 'Usage Report',
  generateReport: 'Generate Report',

  // Notifications
  systemNotification: 'System Notification',
  sendNotification: 'Send Notification',
  notificationsSent: 'Notifications Sent',

  // Experiments
  experimentsTitle: 'A/B Testing Experiments',
  experimentsDescription:
    'Manage landing page experiments and track performance',
  experimentsNewExperiment: 'New Experiment',
  experimentsSearchPlaceholder: 'Search experiments...',
  experimentsAllStatus: 'All Status',
  experimentsActive: 'Active',
  experimentsPaused: 'Paused',
  experimentsCompleted: 'Completed',
  experimentsDraft: 'Draft',
  experimentsArchived: 'Archived',
  experimentsVisitors: 'visitors',
  experimentsConversion: 'conversion',
  experimentsCreated: 'Created',
  experimentsPauseTitle: 'Pause Experiment',
  experimentsResumeTitle: 'Resume Experiment',
  experimentsViewDetails: 'View Details',
  experimentsEditTitle: 'Edit Experiment',
  experimentsMarkCompleted: 'Mark as Completed',
  experimentsArchive: 'Archive',
  experimentsVariantPerformance: 'Variant Performance',
  experimentsControl: 'Control',
  experimentsWinner: 'Winner',
  experimentsTrafficAllocation: 'traffic allocation',
  experimentsConversions: 'Conversions',
  experimentsRate: 'Rate',
  experimentsNoResults: 'No experiments found matching your filters.',
  experimentsEmpty: 'No experiments created yet.',
  experimentsCreateFirst: 'Create Your First Experiment',
  experimentsNotFound: 'Experiment not found',
  experimentsLoading: 'Loading experiments...',
  experimentsRefresh: 'Refresh',
  experimentsExport: 'Export Data',
  experimentsTimeRange7d: 'Last 7 days',
  experimentsTimeRange14d: 'Last 14 days',
  experimentsTimeRange30d: 'Last 30 days',
  experimentsTimeRangeAll: 'All time',
} as const;
