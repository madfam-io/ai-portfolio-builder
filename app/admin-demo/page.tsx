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

import React from 'react';

import AdminUserDashboard from '@/components/admin/AdminUserDashboard';
import { AuthProvider } from '@/lib/contexts/AuthContext';

/**
 * Admin Demo Page
 * Demonstrates the dual-user system with admin role management
 */

export default function AdminDemoPage(): React.ReactElement {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 _dark:bg-gray-900">
        <AdminUserDashboard />
      </div>
    </AuthProvider>
  );
}
