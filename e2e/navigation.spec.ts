import { test, expect } from '@playwright/test';

import { TestHelpers } from './utils/test-helpers';

test.describe('Portfolio Builder Navigation', () => {
  let helpers: TestHelpers;

  test.beforeEach(({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should navigate from landing page to key sections', async ({
    page,
  }) => {
    await helpers.goto('/');

    // Test navigation to features section
    await page.locator('text=Características').click();
    await expect(page.locator('#features')).toBeInViewport();
    await expect(page.locator('text=Qué hace Portfolio Builder')).toBeVisible();

    // Test navigation to how it works
    await page.locator('text=Cómo Funciona').click();
    await expect(page.locator('#how-it-works')).toBeInViewport();
    await expect(page.locator('text=Cómo Funciona Portfolio Builder')).toBeVisible();

    // Test navigation to templates
    await page.locator('text=Plantillas').click();
    await expect(page.locator('#templates')).toBeInViewport();
    await expect(page.locator('text=Para Cada Profesional')).toBeVisible();

    // Test navigation to pricing
    await page.locator('text=Precios').click();
    await expect(page.locator('#pricing')).toBeInViewport();
    await expect(page.locator('text=Accede hoy')).toBeVisible();
  });

  test('should navigate to About page and back', async ({ page }) => {
    await helpers.goto('/');

    // Navigate to About page
    await page.locator('text=About').click();
    await expect(page).toHaveURL(/\/about/);

    // Check About page content
    await expect(page.locator('text=Acerca de Portfolio Builder')).toBeVisible();
    await expect(page.locator('text=Nuestra Misión')).toBeVisible();
    await expect(
      page.locator('text=democratizar la creación de portafolios')
    ).toBeVisible();

    // Check Portfolio Builder branding persists
    await expect(page.locator('text=Portfolio Builder')).toBeVisible();
    await expect(page.locator('text=by MADFAM')).toBeVisible();

    // Navigate back to home via logo
    await page.locator('text=Portfolio Builder').first().click();
    await expect(page).toHaveURL('/');
    await expect(
      page.locator('text=Tu portafolio, elevado por IA')
    ).toBeVisible();
  });

  test('should navigate to Dashboard page (unauthenticated)', async ({
    page,
  }) => {
    await helpers.goto('/');

    // Try to navigate to dashboard without authentication
    await helpers.goto('/dashboard');

    // Should redirect to signin or show authentication required
    // Depending on implementation, might redirect to /auth/signin
    const currentUrl = page.url();
    const isOnSignin = currentUrl.includes('/auth/signin');
    const isOnDashboard = currentUrl.includes('/dashboard');

    if (isOnSignin) {
      await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
    } else if (isOnDashboard) {
      // If on dashboard, should show authentication prompt or login form
      const hasAuthContent =
        (await page
          .locator('text=Iniciar Sesión, text=Sign In, text=Login')
          .count()) > 0;
      expect(hasAuthContent).toBeTruthy();
    }
  });

  test('should navigate to Editor page (unauthenticated)', async ({ page }) => {
    await helpers.goto('/editor');

    // Should redirect to signin or show authentication required
    const currentUrl = page.url();
    const isOnSignin = currentUrl.includes('/auth/signin');
    const isOnEditor = currentUrl.includes('/editor');

    if (isOnSignin) {
      await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
    } else if (isOnEditor) {
      // If on editor, should show authentication prompt
      const hasAuthContent =
        (await page
          .locator('text=Iniciar Sesión, text=Sign In, text=Login')
          .count()) > 0;
      expect(hasAuthContent).toBeTruthy();
    }
  });

  test('should maintain Portfolio Builder branding across all pages', async ({ page }) => {
    const pages = ['/', '/about', '/auth/signin', '/auth/signup'];

    for (const pagePath of pages) {
      await helpers.goto(pagePath);

      // Check Portfolio Builder logo and branding
      await expect(page.locator('text=Portfolio Builder')).toBeVisible();

      // Check that MADFAM attribution is present
      if (pagePath !== '/auth/signin' && pagePath !== '/auth/signup') {
        await expect(page.locator('text=by MADFAM')).toBeVisible();
      }
    }
  });

  test('should handle mobile navigation across pages', async ({ page }) => {
    await helpers.setMobileViewport();

    // Test mobile navigation on landing page
    await helpers.goto('/');

    const mobileMenuButton = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first();
    await mobileMenuButton.click();

    // Navigate to About from mobile menu
    await page.locator('text=About').click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator('text=Acerca de Portfolio Builder')).toBeVisible();

    // Test mobile navigation persistence
    await expect(page.locator('text=Portfolio Builder')).toBeVisible();

    // Go back to home
    await page.locator('text=Portfolio Builder').first().click();
    await expect(page).toHaveURL('/');
  });

  test('should handle back navigation correctly', async ({ page }) => {
    await helpers.goto('/');

    // Navigate to About
    await page.locator('text=About').click();
    await expect(page).toHaveURL(/\/about/);

    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL('/');

    // Navigate to signin
    await helpers.goto('/auth/signin');
    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();

    // Navigate to signup
    await page.locator('text=crea una cuenta nueva').click();
    await expect(page).toHaveURL(/\/auth\/signup/);

    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('should preserve language preference across navigation', async ({
    page,
  }) => {
    await helpers.goto('/');

    // Switch to English
    const languageButton = page
      .locator('button')
      .filter({ hasText: /🇲🇽|🇺🇸/ })
      .first();
    await languageButton.click();

    // Verify English content
    await expect(
      page.locator('text=Your portfolio, elevated by AI')
    ).toBeVisible();

    // Navigate to About page
    await page.locator('text=About').click();
    await expect(page).toHaveURL(/\/about/);

    // Should still be in English
    await expect(page.locator('text=About Portfolio Builder')).toBeVisible();
    await expect(page.locator('text=Our Mission')).toBeVisible();

    // Navigate to signup
    await helpers.goto('/auth/signup');

    // Should still be in English
    await expect(page.locator('text=Create Account')).toBeVisible();

    // Navigate back to home
    await helpers.goto('/');

    // Should still be in English
    await expect(
      page.locator('text=Your portfolio, elevated by AI')
    ).toBeVisible();
  });

  test('should handle footer navigation', async ({ page }) => {
    await helpers.goto('/');

    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();

    // Check footer links are present
    await expect(page.locator('text=Características')).toBeVisible();
    await expect(page.locator('text=Plantillas')).toBeVisible();
    await expect(page.locator('text=Precios')).toBeVisible();
    await expect(page.locator('text=Acerca de')).toBeVisible();

    // Test footer link navigation
    await page.locator('footer').locator('text=Acerca de').click();
    await expect(page).toHaveURL(/\/about/);

    // Check Portfolio Builder branding in footer
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(
      page.locator('text=© 2025 Portfolio Builder by MADFAM')
    ).toBeVisible();
    await expect(
      page.locator('text=Todos los derechos reservados')
    ).toBeVisible();
  });

  test('should handle pricing CTA navigation', async ({ page }) => {
    await helpers.goto('/');

    // Scroll to pricing section
    await page.locator('#pricing').scrollIntoViewIfNeeded();

    // Test "Comenzar Gratis" button
    const startFreeButton = page.locator('text=Comenzar Gratis').first();
    await startFreeButton.click();

    // Should navigate to signup
    await expect(page).toHaveURL(/\/auth\/signup/);
    await expect(page.locator('text=Crear Cuenta')).toBeVisible();
  });

  test('should handle 404 and error pages gracefully', async ({ page }) => {
    // Navigate to non-existent page
    const response = await page.goto('/non-existent-page');

    // Should either show 404 or redirect to home
    if (response?.status() === 404) {
      // Check for 404 content or should still have Portfolio Builder branding
      const hasError =
        (await page
          .locator('text=404, text=Not Found, text=Page not found')
          .count()) > 0;
      const hasPrisma = (await page.locator('text=Portfolio Builder').count()) > 0;

      expect(hasError || hasPrisma).toBeTruthy();
    } else {
      // If redirected to home, should show landing page
      await expect(
        page.locator('text=Tu portafolio, elevado por IA')
      ).toBeVisible();
    }
  });
});
