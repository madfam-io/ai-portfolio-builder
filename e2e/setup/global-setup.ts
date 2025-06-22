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

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig): Promise<void> {
  // Global setup for E2E tests

  // Start browser for auth state setup if needed
  const browser = await chromium.launch();

  // You can perform global setup here, such as:
  // - Creating test users
  // - Setting up test database
  // - Preparing test data

  console.log('🧪 E2E Global Setup: Environment prepared');

  await browser.close();
}

export default globalSetup;
