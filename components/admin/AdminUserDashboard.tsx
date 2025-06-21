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

'use client';

import {
  Activity,
  AlertTriangle,
  Check,
  DollarSign,
  Eye,
  Layers,
  Settings,
  Shield,
  Star,
  ToggleLeft,
  ToggleRight,
  User,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { logger } from '@/lib/utils/logger';

/**
 * Admin User Dashboard Component
 * Allows admins to manage users, view analytics, and switch between admin/user modes
 */

export default function AdminUserDashboard(): React.ReactElement {
  const {
    user,
    isAdmin,
    isInAdminMode,
    isImpersonating,
    permissionLevel,
    canAccess,
    switchToAdminMode,
    switchToUserMode,
    impersonateUser,
    stopImpersonation,
    usageStats,
  } = useAuth();
  const { t } = useLanguage();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <Shield className="mx-auto mb-4 text-6xl text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t.adminAccessDenied}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t.adminNoPermission}
        </p>
      </div>
    );
  }

  const handleModeSwitch = async () => {
    try {
      if (isInAdminMode) {
        await switchToUserMode();
      } else {
        await switchToAdminMode();
      }
    } catch (error) {
      logger.error(
        'Failed to switch admin mode',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  const handleImpersonation = async (userId: string) => {
    try {
      if (isImpersonating) {
        await stopImpersonation();
        setSelectedUser(null);
      } else {
        await impersonateUser(userId);
        setSelectedUser(userId);
      }
    } catch (error) {
      logger.error(
        'Failed to impersonate user',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  // Mock users data - in real implementation, this would come from API
  const mockUsers = [
    {
      id: '1',
      name: 'Ana García',
      email: 'ana@example.com',
      subscriptionPlan: 'pro',
      status: 'active',
      portfolios: 3,
      lastActive: '2 hours ago',
    },
    {
      id: '2',
      name: 'Carlos Mendez',
      email: 'carlos@example.com',
      subscriptionPlan: 'free',
      status: 'active',
      portfolios: 1,
      lastActive: '1 day ago',
    },
    {
      id: '3',
      name: 'Sofia Rodriguez',
      email: 'sofia@example.com',
      subscriptionPlan: 'business',
      status: 'suspended',
      portfolios: 8,
      lastActive: '5 days ago',
    },
  ];

  const systemStats = {
    totalUsers: 1247,
    activeSubscriptions: 892,
    monthlyRevenue: 24560,
    portfoliosCreated: 3421,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="text-2xl text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t.adminDashboard}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {permissionLevel}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Impersonation Banner */}
              {isImpersonating && (
                <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-lg">
                  <Eye className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {t.adminImpersonatingUser}
                  </span>
                  <button
                    onClick={() => handleImpersonation('')}
                    className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                  >
                    <ToggleLeft className="text-lg" />
                  </button>
                </div>
              )}

              {/* Mode Switch */}
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm ${!isInAdminMode ? 'font-bold text-blue-600' : 'text-gray-600'}`}
                >
                  {t.adminUserView}
                </span>
                <button
                  onClick={handleModeSwitch}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={
                    isInAdminMode
                      ? t.adminSwitchToUserView
                      : t.adminSwitchToAdminView
                  }
                >
                  {isInAdminMode ? (
                    <ToggleRight className="text-2xl text-blue-600" />
                  ) : (
                    <ToggleLeft className="text-2xl text-gray-400" />
                  )}
                </button>
                <span
                  className={`text-sm ${isInAdminMode ? 'font-bold text-blue-600' : 'text-gray-600'}`}
                >
                  {t.adminAdminView}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Image
                  src={user?.avatarUrl || '/default-avatar.png'}
                  alt={user?.name || 'User avatar'}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      {isInAdminMode ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t.adminTotalUsers}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {systemStats.totalUsers.toLocaleString()}
                  </p>
                </div>
                <Users className="text-2xl text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t.adminActiveSubscriptions}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {systemStats.activeSubscriptions.toLocaleString()}
                  </p>
                </div>
                <Star className="text-2xl text-yellow-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t.adminMonthlyRevenue}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ${systemStats.monthlyRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="text-2xl text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t.adminPortfoliosCreated}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {systemStats.portfoliosCreated.toLocaleString()}
                  </p>
                </div>
                <Activity className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/admin/experiments"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    A/B Testing
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage landing page experiments
                  </p>
                </div>
                <Layers className="text-3xl text-purple-600" />
              </div>
            </Link>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer opacity-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Analytics
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    View platform analytics
                  </p>
                </div>
                <Activity className="text-3xl text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer opacity-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Settings
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Configure platform settings
                  </p>
                </div>
                <Settings className="text-3xl text-gray-600" />
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t.adminUserManagement}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t.adminManageUsers}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.adminUser}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.adminSubscription}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.adminStatus}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.adminPortfolios}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.adminLastActive}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.adminActions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {mockUsers.map(user => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <User className="text-gray-600 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.subscriptionPlan === 'business'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : user.subscriptionPlan === 'pro'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {user.subscriptionPlan.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.status === 'active' ? (
                            <Check className="text-green-500 mr-2" />
                          ) : (
                            <AlertTriangle className="text-red-500 mr-2" />
                          )}
                          <span
                            className={`text-sm ${
                              user.status === 'active'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {user.portfolios}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.lastActive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {canAccess('impersonation:users') && (
                          <button
                            onClick={() => handleImpersonation(user.id)}
                            className={`mr-3 px-3 py-1 rounded-lg text-sm transition-colors ${
                              selectedUser === user.id
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                            }`}
                          >
                            {selectedUser === user.id
                              ? t.adminStop
                              : t.adminViewAs}
                          </button>
                        )}
                        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                          <Settings />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* User View Content */
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t.adminWelcomeBack?.replace('{name}', user?.name || '') ||
                `Welcome back, ${user?.name}!`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t.adminCurrentlyViewing} {t.adminSwitchToAdminView}.
            </p>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {t.adminPortfoliosCreatedStat}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {usageStats.portfoliosCreated}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {t.adminAiEnhancementsUsed}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {usageStats.aiEnhancementsUsed}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {t.adminMonthlyViews}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {usageStats.monthlyViews}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
