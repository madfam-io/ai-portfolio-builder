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

import { ReactNode } from 'react';

import BackToTopButton from '@/components/BackToTopButton';
import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { LanguageProvider } from '@/lib/i18n/refactored-context';

/**
 * @fileoverview Base Layout Component for MADFAM AI Portfolio Builder
 *
 * This component provides the foundational layout structure for all public pages.
 * It ensures consistent navigation, footer, and i18n support across the application.
 *
 * Key Features:
 * - Unified header and footer for all pages
 * - Automatic i18n provider wrapping for multilingual support
 * - Dark mode support with proper background handling
 * - Back to top functionality for better UX
 * - Responsive design with min-height screen coverage
 * - Customizable className prop for page-specific styling
 *
 * Usage:
 * ```tsx
 * // Standard usage for most pages
 * <BaseLayout>
 *   <PageContent />
 * </BaseLayout>
 *
 * // With custom styling for special pages
 * <BaseLayout className="!bg-gray-50 dark:!bg-gray-900">
 *   <PageContent />
 * </BaseLayout>
 * ```
 *
 * Architecture:
 * - Wraps children with LanguageProvider for i18n
 * - Provides semantic HTML structure (header, main, footer)
 * - Includes accessibility enhancements (scroll to top)
 * - Handles theme switching with CSS classes
 *
 * @author MADFAM Development Team
 * @version 2.0.0 - Complete multilingual and navigation unification
 */

/**
 * Props interface for BaseLayout component
 */
interface BaseLayoutProps {
  /** Page content to be rendered within the layout structure */
  children: ReactNode;
  /**
   * Optional CSS classes to apply to the main container
   * Use !important prefix for overriding default backgrounds
   * @example "!bg-gray-50 dark:!bg-gray-900" for editor pages
   */
  className?: string;
  /** Whether to show the header (default: true) */
  showHeader?: boolean;
  /** Whether to show the footer (default: true) */
  showFooter?: boolean;
}

/**
 * Base Layout component providing unified structure for all public pages
 *
 * Structure:
 * - LanguageProvider: Enables i18n throughout the page
 * - Header: Navigation, language toggle, currency switcher
 * - Main: Page-specific content area
 * - Footer: Links, copyright, company information
 * - BackToTopButton: Accessibility enhancement for long pages
 *
 * @param {BaseLayoutProps} props - Component props
 * @returns {JSX.Element} Complete page layout with navigation and i18n
 */
export default function BaseLayout({
  children,
  className = '',
  showHeader = true,
  showFooter = true,
}: BaseLayoutProps): React.ReactElement {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className={`min-h-screen bg-white dark:bg-gray-900 ${className}`}>
          {/* Main navigation header with i18n and app controls */}
          {showHeader && <Header />}

          {/* Main content area - semantic HTML for accessibility */}
          <main>{children}</main>

          {/* Consistent footer across all pages */}
          {showFooter && <Footer />}

          {/* Accessibility enhancement for long pages */}
          <BackToTopButton />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}
