import { test, expect } from '@playwright/test';

import { TestHelpers } from './utils/test-helpers';

test.describe('PRISMA Landing Page', () => {
  let helpers: TestHelpers;

  test.beforeEach(({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should display PRISMA landing page with correct branding', async ({
    page,
  }) => {
    await helpers.goto('/');

    // Check PRISMA branding
    await expect(page.locator('text=PRISMA')).toBeVisible();
    await expect(page.locator('text=by MADFAM')).toBeVisible();

    // Check main hero content with new PRISMA messaging
    await expect(
      page.locator('text=Tu portafolio, elevado por IA')
    ).toBeVisible();
    await expect(
      page.locator('text=Conecta tus perfiles. Mejora tu historia.')
    ).toBeVisible();
    await expect(page.locator('text=Publica en minutos.')).toBeVisible();

    // Check key CTAs are present
    await expect(page.getByRole('button', { name: /ver demo/i })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /prueba gratuita/i })
    ).toBeVisible();

    // Check navigation sections
    await expect(page.locator('text=Características')).toBeVisible();
    await expect(page.locator('text=Cómo Funciona')).toBeVisible();
    await expect(page.locator('text=Plantillas')).toBeVisible();
    await expect(page.locator('text=Precios')).toBeVisible();

    // Basic accessibility check
    await helpers.checkA11y();
  });

  test('should navigate to signup when CTA is clicked', async ({ page }) => {
    await helpers.goto('/');

    // Click the main CTA button
    await page.getByRole('button', { name: /prueba gratuita/i }).click();

    // Should navigate to signup page
    await expect(page).toHaveURL(/\/auth\/signup/);

    // Verify we're on the signup page
    await expect(page.locator('text=Crear Cuenta')).toBeVisible();
  });

  test('should handle geolocation-based language switching with flags', async ({
    page,
  }) => {
    await helpers.goto('/');

    // Wait for geolocation detection to complete
    await page.waitForTimeout(1000);

    // Check initial language (should be Spanish by default)
    await expect(
      page.locator('text=Tu portafolio, elevado por IA')
    ).toBeVisible();

    // Check for Mexican flag (default for Spanish)
    const languageButton = page
      .locator('button')
      .filter({ hasText: /🇲🇽|🇺🇸/ })
      .first();
    await expect(languageButton).toBeVisible();

    // Click language toggle to switch to English
    await languageButton.click();

    // Check that content changed to English
    await expect(
      page.locator('text=Your portfolio, elevated by AI')
    ).toBeVisible();
    await expect(
      page.locator('text=Connect your profiles. Enhance your story.')
    ).toBeVisible();

    // Check for US flag (default for English)
    await expect(
      page.locator('button').filter({ hasText: /🇺🇸/ }).first()
    ).toBeVisible();

    // Switch back to Spanish
    await page.locator('button').filter({ hasText: /🇺🇸/ }).first().click();

    // Check that content changed back to Spanish
    await expect(
      page.locator('text=Tu portafolio, elevado por IA')
    ).toBeVisible();
    await expect(
      page.locator('button').filter({ hasText: /🇲🇽/ }).first()
    ).toBeVisible();
  });

  test('should handle currency switching based on geolocation', async ({
    page,
  }) => {
    await helpers.goto('/');

    // Wait for geolocation detection
    await page.waitForTimeout(1000);

    // Check initial currency display
    const currencyButton = page
      .locator('button')
      .filter({ hasText: /\$.*(?:MXN|USD)/ })
      .first();
    await expect(currencyButton).toBeVisible();

    // Click currency toggle
    await currencyButton.click();

    // Verify currency changed (MXN <-> USD)
    await expect(currencyButton).toBeVisible();

    // Check pricing section shows appropriate currency
    await expect(page.locator('#pricing')).toBeVisible();
    await expect(page.locator('text=/\$|MX\$/').first()).toBeVisible();
  });

  test('should handle dark mode toggle', async ({ page }) => {
    await helpers.goto('/');

    // Find and click dark mode toggle button (moon/sun icon)
    const darkModeButton = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .filter({ hasText: '' })
      .nth(2);
    await darkModeButton.click();

    // Check that dark mode class is applied to html
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Check that background changed to dark
    await expect(page.locator('body')).toHaveClass(
      /dark:bg-gray-900|bg-gray-900/
    );

    // Toggle back to light mode
    await darkModeButton.click();

    // Check that dark mode class is removed
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should be responsive on mobile with PRISMA navigation', async ({
    page,
  }) => {
    await helpers.setMobileViewport();
    await helpers.goto('/');

    // Check PRISMA logo is visible on mobile
    await expect(page.locator('text=PRISMA')).toBeVisible();

    // Check mobile hamburger menu
    const mobileMenuButton = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first();
    await expect(mobileMenuButton).toBeVisible();

    // Open mobile menu
    await mobileMenuButton.click();

    // Check navigation items are present in mobile menu
    await expect(page.locator('text=Características')).toBeVisible();
    await expect(page.locator('text=Cómo Funciona')).toBeVisible();
    await expect(page.locator('text=Plantillas')).toBeVisible();
    await expect(page.locator('text=Precios')).toBeVisible();
    await expect(page.locator('text=About')).toBeVisible();

    // Check language and currency toggles in mobile menu
    await expect(
      page.locator('button').filter({ hasText: /🇲🇽|🇺🇸/ })
    ).toBeVisible();
    await expect(
      page.locator('button').filter({ hasText: /Currency/ })
    ).toBeVisible();

    // Close mobile menu
    await mobileMenuButton.click();
    await page.waitForTimeout(500); // Wait for menu animation
  });

  test('should display PRISMA pricing tiers correctly', async ({ page }) => {
    await helpers.goto('/');

    // Scroll to pricing section
    await page.locator('#pricing').scrollIntoViewIfNeeded();

    // Check PRISMA pricing tiers
    await expect(page.locator('text=Gratis')).toBeVisible();
    await expect(page.locator('text=PRO')).toBeVisible();
    await expect(page.locator('text=PRISMA+')).toBeVisible();
    await expect(page.locator('text=MÁS POPULAR')).toBeVisible();

    // Check pricing features
    await expect(page.locator('text=1 portafolio')).toBeVisible();
    await expect(page.locator('text=Subdominio PRISMA')).toBeVisible();
    await expect(page.locator('text=Dominio personalizado')).toBeVisible();
  });

  test('should show geolocation detection status', async ({ page }) => {
    await helpers.goto('/');

    // Wait for geolocation detection to complete
    await page.waitForTimeout(2000);

    // Check that language was detected (either Mexican flag for Spanish or US flag for English)
    const flagButton = page
      .locator('button')
      .filter({ hasText: /🇲🇽|🇺🇸/ })
      .first();
    await expect(flagButton).toBeVisible();

    // Verify currency was set based on location
    const currencyButton = page
      .locator('button')
      .filter({ hasText: /\$.*(?:MXN|USD)/ })
      .first();
    await expect(currencyButton).toBeVisible();
  });

  test('should load within performance budget', async ({ page: _ }) => {
    const loadTime = await helpers.measurePageLoad();

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
