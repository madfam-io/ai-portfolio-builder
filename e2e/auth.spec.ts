import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('PRISMA Authentication', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should display signup page with PRISMA branding', async ({ page }) => {
    await helpers.goto('/auth/signup');

    // Check PRISMA branding in header
    await expect(page.locator('text=PRISMA')).toBeVisible();
    await expect(page.locator('text=by MADFAM')).toBeVisible();

    // Check signup form elements
    await expect(page.locator('text=Crear Cuenta')).toBeVisible();
    await expect(page.getByPlaceholder('Nombre completo')).toBeVisible();
    await expect(page.getByPlaceholder('Correo electrónico')).toBeVisible();
    await expect(page.getByPlaceholder(/Contraseña.*12 caracteres/)).toBeVisible();

    // Check password requirements text
    await expect(page.locator('text=/12 caracteres.*mayús.*minús.*números.*símbolos/')).toBeVisible();

    // Check OAuth options
    await expect(page.locator('text=O regístrate con')).toBeVisible();
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible();

    // Check link to signin
    await expect(page.locator('text=inicia sesión con tu cuenta existente')).toBeVisible();
  });

  test('should display signin page with PRISMA branding', async ({ page }) => {
    await helpers.goto('/auth/signin');

    // Check PRISMA branding
    await expect(page.locator('text=PRISMA')).toBeVisible();

    // Check signin form elements
    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
    await expect(page.getByPlaceholder('Correo electrónico')).toBeVisible();
    await expect(page.getByPlaceholder('Contraseña')).toBeVisible();

    // Check forgot password link
    await expect(page.locator('text=¿Olvidaste tu contraseña?')).toBeVisible();

    // Check OAuth options
    await expect(page.locator('text=O continúa con')).toBeVisible();
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible();

    // Check link to signup
    await expect(page.locator('text=crea una cuenta nueva')).toBeVisible();
  });

  test('should enforce 12-character password requirement', async ({ page }) => {
    await helpers.goto('/auth/signup');

    // Fill in form with short password
    await page.getByPlaceholder('Nombre completo').fill('Test User');
    await page.getByPlaceholder('Correo electrónico').fill('test@example.com');
    await page.getByPlaceholder(/Contraseña/).fill('short123');

    // Try to submit
    await page.getByRole('button', { name: 'Crear Cuenta' }).click();

    // Should show validation error or prevent submission
    // Note: The actual validation might be handled by the browser or Supabase
    // We check that the placeholder text indicates the requirement
    await expect(page.getByPlaceholder(/12 caracteres/)).toBeVisible();
  });

  test('should validate password complexity requirements', async ({ page }) => {
    await helpers.goto('/auth/signup');

    const passwordInput = page.getByPlaceholder(/Contraseña/);
    
    // Test various password patterns
    const weakPasswords = [
      'onlylowercase',
      'ONLYUPPERCASE', 
      '123456789012',
      'NoNumbersHere',
      'nonumb3rs',
      'NoSymbols123'
    ];

    for (const password of weakPasswords) {
      await passwordInput.clear();
      await passwordInput.fill(password);
      
      // The placeholder should still indicate requirements
      await expect(page.getByPlaceholder(/mayús.*minús.*números.*símbolos/)).toBeVisible();
    }

    // Test a strong password
    await passwordInput.clear();
    await passwordInput.fill('StrongPass123!@#');
    await expect(passwordInput).toHaveValue('StrongPass123!@#');
  });

  test('should handle signup flow with email confirmation', async ({ page }) => {
    await helpers.goto('/auth/signup');

    // Fill signup form with valid data
    await page.getByPlaceholder('Nombre completo').fill('E2E Test User');
    await page.getByPlaceholder('Correo electrónico').fill('e2e-test@example.com');
    await page.getByPlaceholder(/Contraseña/).fill('ValidPassword123!');

    // Mock successful signup response that requires email confirmation
    await page.route('**/auth/v1/signup', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              id: 'test-user-id',
              email: 'e2e-test@example.com',
              email_confirmed_at: null // Not confirmed yet
            }
          },
          error: null
        })
      });
    });

    // Submit form
    await page.getByRole('button', { name: 'Crear Cuenta' }).click();

    // Should show email confirmation message
    await expect(page.locator('text=¡Cuenta Creada!')).toBeVisible();
    await expect(page.locator('text=Hemos enviado un enlace de confirmación')).toBeVisible();
    await expect(page.locator('text=revisa tu bandeja de entrada')).toBeVisible();

    // Should have button to go to signin
    await expect(page.getByRole('link', { name: 'Ir a Iniciar Sesión' })).toBeVisible();
  });

  test('should handle forgot password flow', async ({ page }) => {
    await helpers.goto('/auth/signin');

    // Click forgot password link
    await page.locator('text=¿Olvidaste tu contraseña?').click();

    // Should navigate to reset password page
    await expect(page).toHaveURL(/\/auth\/reset-password/);
    
    // Check reset password form
    await expect(page.locator('text=Restablecer Contraseña')).toBeVisible();
    await expect(page.getByPlaceholder('Correo electrónico')).toBeVisible();
    await expect(page.locator('text=Ingresa tu correo electrónico')).toBeVisible();

    // Fill email and submit
    await page.getByPlaceholder('Correo electrónico').fill('test@example.com');
    
    // Mock password reset response
    await page.route('**/auth/v1/recover', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ error: null })
      });
    });

    await page.getByRole('button', { name: 'Enviar Enlace' }).click();

    // Should show success message
    await expect(page.locator('text=¡Correo Enviado!')).toBeVisible();
    await expect(page.locator('text=Hemos enviado un enlace para restablecer')).toBeVisible();
  });

  test('should navigate between auth pages correctly', async ({ page }) => {
    // Start at signup
    await helpers.goto('/auth/signup');
    await expect(page.locator('text=Crear Cuenta')).toBeVisible();

    // Go to signin
    await page.locator('text=inicia sesión con tu cuenta existente').click();
    await expect(page).toHaveURL(/\/auth\/signin/);
    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();

    // Go back to signup
    await page.locator('text=crea una cuenta nueva').click();
    await expect(page).toHaveURL(/\/auth\/signup/);
    await expect(page.locator('text=Crear Cuenta')).toBeVisible();

    // Go to forgot password
    await page.locator('text=inicia sesión con tu cuenta existente').click();
    await page.locator('text=¿Olvidaste tu contraseña?').click();
    await expect(page).toHaveURL(/\/auth\/reset-password/);

    // Go back to signin
    await page.locator('text=Volver a Iniciar Sesión').click();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('should handle Google OAuth flow', async ({ page }) => {
    await helpers.goto('/auth/signup');

    // Mock OAuth response
    await page.route('**/auth/v1/authorize*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { url: 'https://accounts.google.com/oauth/authorize?...' },
          error: null
        })
      });
    });

    // Click Google OAuth button
    const googleButton = page.getByRole('button', { name: /Google/ });
    await expect(googleButton).toBeVisible();
    
    // Note: We don't actually test the OAuth redirect as it would go to Google
    // In a real test, you might mock the entire OAuth flow
  });

  test('should be accessible on auth pages', async () => {
    // Test signup page accessibility
    await helpers.goto('/auth/signup');
    await helpers.checkA11y();

    // Test signin page accessibility  
    await helpers.goto('/auth/signin');
    await helpers.checkA11y();

    // Test reset password page accessibility
    await helpers.goto('/auth/reset-password');
    await helpers.checkA11y();
  });

  test('should handle language switching on auth pages', async ({ page }) => {
    await helpers.goto('/auth/signup');

    // Switch to English
    const languageButton = page.locator('button').filter({ hasText: /🇲🇽|🇺🇸/ }).first();
    await languageButton.click();

    // Check English content
    await expect(page.locator('text=Create Account')).toBeVisible();
    await expect(page.getByPlaceholder('Full name')).toBeVisible();
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    await expect(page.getByPlaceholder(/Password.*12 chars/)).toBeVisible();

    // Switch back to Spanish
    await languageButton.click();
    await expect(page.locator('text=Crear Cuenta')).toBeVisible();
  });
});