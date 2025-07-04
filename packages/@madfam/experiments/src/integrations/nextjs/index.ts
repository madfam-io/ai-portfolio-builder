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

// Export cookie managers
export {
  NextJsCookieManager,
  BrowserCookieManager,
  UniversalCookieManager,
} from './cookie-manager';

// Export persistence adapters
export { NextJsPersistenceAdapter } from './persistence';

// Export migration wrapper
export { LegacyFeatureFlagService } from './migration';
