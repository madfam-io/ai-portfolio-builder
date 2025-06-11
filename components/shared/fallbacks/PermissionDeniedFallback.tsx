/**
 * @fileoverview Permission Denied Fallback Components
 * 
 * Provides user-friendly permission denied displays when users
 * don't have adequate permissions for specific resources or actions.
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiLock, FiHome, FiArrowLeft, FiMail, FiShield } from 'react-icons/fi';
import { useLanguage } from '@/lib/i18n/refactored-context';

/**
 * Full Permission Denied Page
 */
export function PermissionDeniedPage({
  resource,
  requiredRole,
  onGoHome,
  onGoBack,
}: {
  resource?: string;
  requiredRole?: string;
  onGoHome?: () => void;
  onGoBack?: () => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      router.push('/');
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.back();
    }
  };

  const handleContactSupport = () => {
    const subject = 'Permission Request';
    const body = `
I need access to: ${resource || 'a specific resource'}
Current URL: ${window.location.href}
Required Role: ${requiredRole || 'Unknown'}

Please provide the necessary permissions or explain how to gain access.
    `.trim();

    window.location.href = `mailto:support@prisma.madfam.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-950 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          {/* Permission Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <FiLock className="w-10 h-10 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <FiShield className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t.errors.permissionDeniedTitle}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {resource 
                ? t.errors.permissionDeniedResource.replace('{resource}', resource)
                : t.errors.permissionDeniedDescription
              }
            </p>
            {requiredRole && (
              <p className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-4 py-2 inline-block">
                {t.errors.requiredRole}: <span className="font-medium">{requiredRole}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContactSupport}
              className="w-full flex items-center justify-center gap-3 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <FiMail className="w-5 h-5" />
              {t.errors.requestAccess}
            </button>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGoBack}
                className="flex-1 flex items-center justify-center gap-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <FiArrowLeft className="w-5 h-5" />
                {t.errors.goBack}
              </button>

              <button
                onClick={handleGoHome}
                className="flex-1 flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <FiHome className="w-5 h-5" />
                {t.errors.goToHomepage}
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.errors.needHelp}
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• {t.errors.contactSupport}</li>
              <li>• {t.errors.checkAccount}</li>
              <li>• {t.errors.reviewPermissions}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline Permission Denied Component
 */
export function InlinePermissionDenied({
  resource,
  action,
  onRequestAccess,
  compact = false,
}: {
  resource?: string;
  action?: string;
  onRequestAccess?: () => void;
  compact?: boolean;
}) {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-orange-600 dark:text-orange-400">
        <FiLock className="w-4 h-4" />
        <span className="text-sm">{t.errors.accessDenied}</span>
        {onRequestAccess && (
          <button
            onClick={onRequestAccess}
            className="text-sm underline hover:no-underline"
          >
            {t.errors.requestAccess}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <FiLock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
            {t.errors.accessDenied}
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
            {action && resource
              ? t.errors.permissionActionResource
                  .replace('{action}', action)
                  .replace('{resource}', resource)
              : resource
              ? t.errors.permissionResource.replace('{resource}', resource)
              : t.errors.permissionGeneric
            }
          </p>
          
          {onRequestAccess && (
            <button
              onClick={onRequestAccess}
              className="inline-flex items-center gap-2 text-sm bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
            >
              <FiMail className="w-4 h-4" />
              {t.errors.requestAccess}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Role-based Permission Check Component
 */
export function RoleBasedAccess({
  requiredRole,
  userRole,
  children,
  fallback,
}: {
  requiredRole: string;
  userRole?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { t } = useLanguage();

  // Simple role hierarchy
  const roleHierarchy: Record<string, number> = {
    user: 1,
    premium: 2,
    admin: 3,
    superadmin: 4,
  };

  const hasAccess = userRole 
    ? (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 999)
    : false;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <InlinePermissionDenied
      resource={`${requiredRole} ${t.errors.privileges}`}
      onRequestAccess={() => {
        const subject = 'Role Upgrade Request';
        const body = `
I would like to upgrade my account to: ${requiredRole}
Current Role: ${userRole || 'None'}
URL: ${window.location.href}

Please provide information about upgrading my account.
        `.trim();

        window.location.href = `mailto:support@prisma.madfam.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }}
    />
  );
}

/**
 * Feature-based Permission Check Component
 */
export function FeatureGate({
  feature,
  userFeatures,
  children,
  fallback,
}: {
  feature: string;
  userFeatures?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hasAccess = userFeatures?.includes(feature) || false;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <InlinePermissionDenied
      resource={feature}
      onRequestAccess={() => {
        const subject = 'Feature Access Request';
        const body = `
I would like access to the feature: ${feature}
Current URL: ${window.location.href}

Please provide information about accessing this feature.
        `.trim();

        window.location.href = `mailto:support@prisma.madfam.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }}
    />
  );
}