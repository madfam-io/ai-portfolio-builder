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

import { Portfolio } from '@/types/portfolio';

export interface PortfolioPreviewProps {
  portfolio: Portfolio;
  mode?: 'desktop' | 'tablet' | 'mobile';
  activeSection?: string;
  onSectionClick?: (section: string) => void;
  isInteractive?: boolean;
}

export interface SectionProps {
  portfolio: Portfolio;
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
  isInteractive?: boolean;
}

export interface PreviewStyles extends React.CSSProperties {
  '--primary-color'?: string;
  '--secondary-color'?: string;
  '--accent-color'?: string;
  fontFamily?: string;
}
