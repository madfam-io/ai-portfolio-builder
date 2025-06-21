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

import { Metadata } from 'next';
import { MarketplaceContent } from './components/MarketplaceContent';

export const metadata: Metadata = {
  title: 'Premium Templates Marketplace | PRISMA',
  description:
    'Browse and purchase premium portfolio templates designed by professionals. Stand out with unique, industry-specific designs.',
};

export default function MarketplacePage() {
  return <MarketplaceContent />;
}
