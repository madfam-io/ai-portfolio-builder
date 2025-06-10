'use client';

/**
 * Admin Demo Page
 * Demonstrates the dual-user system with admin role management
 */

import React from 'react';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import AdminUserDashboard from '@/components/admin/AdminUserDashboard';

export default function AdminDemoPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminUserDashboard />
      </div>
    </AuthProvider>
  );
}