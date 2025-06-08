import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig) {
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
