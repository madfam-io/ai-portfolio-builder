'use client';

/**
 * Admin Demo Page
 * Demonstrates the dual-user system with admin role management
 */

import React from 'react';

import AdminUserDashboard from '@/components/admin/AdminUserDashboard';
import { AuthProvider } from '@/lib/contexts/AuthContext';

export default function AdminDemoPage(): React.ReactElement {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminUserDashboard />
      </div>
    </AuthProvider>
  );
}
