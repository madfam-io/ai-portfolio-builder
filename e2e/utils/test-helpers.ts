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

import { Page, expect } from '@playwright/test';

// Test data
export const testUser = {
  email: 'e2e.test@prismaportfolio.com',
  password: 'ValidPassword123!@#', // Updated to meet 12-character requirement with symbols
  fullName: 'PRISMA E2E Test User',
};

export const testPortfolio = {
  title: 'PRISMA Test Portfolio',
  bio: 'This is a test bio for PRISMA E2E testing with AI enhancement',
  tagline: 'PRISMA Professional Portfolio',
};

// Helper functions for common E2E operations
export class TestHelpers {
  constructor(protected page: Page) {}

  // Navigation helpers
  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // Authentication helpers
  async signUp(email: string, password: string, fullName?: string) {
    await this.goto('/auth/signup');

    if (fullName) {
      await this.page.getByPlaceholder('Nombre completo').fill(fullName);
    }
    await this.page.getByPlaceholder('Correo electrónico').fill(email);
    await this.page.getByPlaceholder(/Contraseña/).fill(password);
    await this.page.getByRole('button', { name: 'Crear Cuenta' }).click();

    // Wait for redirect or email confirmation message
    await this.page.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => {
      // If no redirect, might be waiting for email confirmation
      return this.page.waitForSelector('text=¡Cuenta Creada!', {
        timeout: 5000,
      });
    });
  }

  async signIn(email: string, password: string) {
    await this.goto('/auth/signin');

    await this.page.getByPlaceholder('Correo electrónico').fill(email);
    await this.page.getByPlaceholder('Contraseña').fill(password);
    await this.page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Wait for redirect to dashboard
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
  }

  async signOut() {
    // Click user menu in header
    await this.page
      .locator('button')
      .filter({ has: this.page.locator('svg') })
      .filter({ hasText: /User|Profile/ })
      .click();

    // Click sign out option
    await this.page.locator('text=Cerrar Sesión').click();

    // Wait for redirect to home
    await this.page.waitForURL('/', { timeout: 5000 });
  }

  // Portfolio helpers
  async createPortfolio(portfolioData: typeof testPortfolio) {
    // Assumes user is authenticated and on dashboard
    await this.page
      .getByRole('button', { name: /Crear.*Portafolio|Create.*Portfolio/ })
      .click();

    // Fill portfolio form
    await this.page
      .getByPlaceholder(/Nombre.*portafolio|Portfolio.*name/i)
      .fill(portfolioData.title);
    await this.page.getByPlaceholder(/Biografía|Bio/i).fill(portfolioData.bio);
    await this.page
      .getByPlaceholder(/Tagline|Lema/i)
      .fill(portfolioData.tagline);

    // Save portfolio
    await this.page.getByRole('button', { name: /Guardar|Save/ }).click();

    // Wait for save confirmation or redirect
    await this.page
      .waitForSelector('text=guardado|saved|creado|created', { timeout: 5000 })
      .catch(() => {
        // Fallback: wait for URL change or success indicator
        return this.page.waitForURL(/\/editor|\/dashboard/, { timeout: 5000 });
      });
  }

  async publishPortfolio() {
    await this.page.getByRole('button', { name: /Publicar|Publish/ }).click();

    // Confirm publication if modal appears
    const confirmButton = this.page.getByRole('button', {
      name: /Confirmar|Confirm/,
    });
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }

    // Wait for publish confirmation
    await this.page.waitForSelector('text=publicado|published|live', {
      timeout: 10000,
    });
  }

  // Form helpers
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      // Try multiple selector strategies
      const selectors = [
        `[data-testid="${field}"]`,
        `[name="${field}"]`,
        `[placeholder*="${field}"]`,
        `input[type="text"][placeholder*="${field.toLowerCase()}"]`,
        `input[type="email"][placeholder*="${field.toLowerCase()}"]`,
        `textarea[placeholder*="${field.toLowerCase()}"]`,
      ];

      let filled = false;
      for (const selector of selectors) {
        if ((await this.page.locator(selector).count()) > 0) {
          await this.page.locator(selector).first().fill(value);
          filled = true;
          break;
        }
      }

      if (!filled) {
        console.warn(`Could not find form field: ${field}`);
      }
    }
  }

  async submitForm(submitButtonText = 'Enviar|Submit|Guardar|Save') {
    // Try to find submit button by text content
    const submitButton = this.page.getByRole('button', {
      name: new RegExp(submitButtonText, 'i'),
    });

    if ((await submitButton.count()) > 0) {
      await submitButton.first().click();
    } else {
      // Fallback: look for any submit button
      await this.page
        .locator('button[type="submit"], input[type="submit"]')
        .first()
        .click();
    }
  }

  // Wait helpers
  async waitForToast(message?: string) {
    // Look for common toast/notification patterns
    const toastSelectors = [
      '[data-testid="toast"]',
      '.toast',
      '.notification',
      '.alert',
      '[role="alert"]',
      '.Toastify__toast',
    ];

    let toast;
    for (const selector of toastSelectors) {
      toast = this.page.locator(selector);
      if ((await toast.count()) > 0) {
        await expect(toast.first()).toBeVisible();
        break;
      }
    }

    if (message && toast) {
      await expect(toast.first()).toContainText(message);
    }

    return toast?.first();
  }

  async waitForModal(modalIdentifier?: string) {
    // Look for common modal patterns
    const modalSelectors = [
      modalIdentifier ? `[data-testid="${modalIdentifier}"]` : null,
      '.modal',
      '[role="dialog"]',
      '.MuiDialog-root',
      '.react-modal',
      '.modal-overlay',
    ].filter(Boolean) as string[];

    let modal;
    for (const selector of modalSelectors) {
      modal = this.page.locator(selector);
      if ((await modal.count()) > 0) {
        await expect(modal.first()).toBeVisible();
        return modal.first();
      }
    }

    throw new Error(
      `Modal not found${modalIdentifier ? ` for: ${modalIdentifier}` : ''}`
    );
  }

  async closeModal(modalIdentifier?: string) {
    // Try various close button patterns
    const closeSelectors = [
      modalIdentifier ? `[data-testid="${modalIdentifier}-close"]` : null,
      '.modal-close',
      '[aria-label="Close"]',
      '[aria-label="Cerrar"]',
      'button:has-text("×")',
      'button:has-text("Close")',
      'button:has-text("Cerrar")',
      '.close-button',
    ].filter(Boolean) as string[];

    for (const selector of closeSelectors) {
      if ((await this.page.locator(selector).count()) > 0) {
        await this.page.locator(selector).first().click();
        break;
      }
    }

    // Wait for modal to disappear
    await this.page.waitForTimeout(500);
  }

  // API helpers
  async mockApiCall(url: string, response: unknown, status = 200) {
    await this.page.route(url, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  async interceptApiCall(url: string) {
    const responses: unknown[] = [];

    await this.page.route(url, route => {
      responses.push(route.request().postDataJSON());
      route.continue();
    });

    return responses;
  }

  // Screenshot helpers
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `e2e/screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  // Responsive testing helpers
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  // Performance helpers
  async measurePageLoad() {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    const endTime = Date.now();
    return endTime - startTime;
  }

  // Accessibility helpers
  async checkA11y() {
    // Basic accessibility checks
    const hasMainLandmark = await this.page
      .locator('main, [role="main"]')
      .count();
    expect(hasMainLandmark).toBeGreaterThan(0);

    const hasH1 = await this.page.locator('h1').count();
    expect(hasH1).toBeGreaterThan(0);

    // Check for form labels
    const inputs = await this.page.locator('input').count();
    const labels = await this.page.locator('label').count();
    if (inputs > 0) {
      expect(labels).toBeGreaterThan(0);
    }
  }
}

// PRISMA-specific helpers
export class PRISMATestHelpers extends TestHelpers {
  // Check for PRISMA branding elements
  async verifyPRISMABranding() {
    await expect(this.page.locator('text=PRISMA')).toBeVisible();
    await expect(this.page.locator('text=by MADFAM')).toBeVisible();
  }

  // Wait for geolocation detection to complete
  async waitForGeolocationDetection() {
    await this.page.waitForTimeout(2000); // Give time for geolocation API

    // Verify flag is displayed (either Mexican or US)
    const flagButton = this.page
      .locator('button')
      .filter({ hasText: /🇲🇽|🇺🇸/ })
      .first();
    await expect(flagButton).toBeVisible();
  }

  // Switch language and verify change
  async switchLanguage(targetLang: 'es' | 'en') {
    const targetContent =
      targetLang === 'es'
        ? 'Tu portafolio, elevado por IA'
        : 'Your portfolio, elevated by AI';

    // Click language toggle
    const languageButton = this.page
      .locator('button')
      .filter({ hasText: /🇲🇽|🇺🇸/ })
      .first();
    await languageButton.click();

    // Verify content changed
    await expect(this.page.locator(`text=${targetContent}`)).toBeVisible();
  }
}

// Database helpers for E2E testing
export function cleanupTestData(): void {
  // Clean up PRISMA test data after tests
  console.log('🧹 Cleaning up PRISMA E2E test data');
  // TODO: Implement cleanup for Supabase test database
}

export function seedTestData(): void {
  // Seed PRISMA test data before tests
  console.log('🌱 Seeding PRISMA E2E test data');
  // TODO: Implement seeding for portfolios, users, etc.
}
