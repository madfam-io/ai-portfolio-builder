import { test, expect } from '@playwright/test'
import { TestHelpers } from './utils/test-helpers'

test.describe('Landing Page', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
  })

  test('should display the landing page correctly', async ({ page }) => {
    await helpers.goto('/')
    
    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Portafolio Impresionante')
    
    // Check key CTAs are present
    await expect(page.getByTestId('watch-demo')).toBeVisible()
    await expect(page.getByTestId('start-trial')).toBeVisible()
    
    // Check navigation
    await expect(page.getByTestId('nav-features')).toBeVisible()
    await expect(page.getByTestId('nav-pricing')).toBeVisible()
    
    // Basic accessibility check
    await helpers.checkA11y()
  })

  test('should navigate to signup when CTA is clicked', async ({ page }) => {
    await helpers.goto('/')
    
    // Click the main CTA
    await page.getByTestId('start-trial').click()
    
    // Should show coming soon modal for now
    await helpers.waitForModal('coming-soon-modal')
    
    // Close modal
    await helpers.closeModal('coming-soon-modal')
  })

  test('should handle language switching', async ({ page }) => {
    await helpers.goto('/')
    
    // Switch to English
    await page.getByTestId('language-toggle').click()
    
    // Check that content changed to English
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Stunning Portfolio')
    
    // Switch back to Spanish
    await page.getByTestId('language-toggle').click()
    
    // Check that content changed back to Spanish
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Portafolio Impresionante')
  })

  test('should handle currency switching', async ({ page }) => {
    await helpers.goto('/')
    
    // Check initial currency (MXN)
    await expect(page.getByTestId('currency-display')).toContainText('$19')
    
    // Switch currency
    await page.getByTestId('currency-toggle').click()
    
    // Check currency changed to USD
    await expect(page.getByTestId('currency-display')).toContainText('$19')
  })

  test('should handle dark mode toggle', async ({ page }) => {
    await helpers.goto('/')
    
    // Toggle dark mode
    await page.getByTestId('dark-mode-toggle').click()
    
    // Check that dark mode class is applied
    await expect(page.locator('html')).toHaveClass(/dark/)
    
    // Toggle back to light mode
    await page.getByTestId('dark-mode-toggle').click()
    
    // Check that dark mode class is removed
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await helpers.setMobileViewport()
    await helpers.goto('/')
    
    // Check mobile navigation
    await expect(page.getByTestId('mobile-menu-toggle')).toBeVisible()
    
    // Open mobile menu
    await page.getByTestId('mobile-menu-toggle').click()
    await expect(page.getByTestId('mobile-menu')).toBeVisible()
    
    // Check navigation items are present
    await expect(page.getByTestId('mobile-nav-features')).toBeVisible()
    await expect(page.getByTestId('mobile-nav-pricing')).toBeVisible()
    
    // Close mobile menu
    await page.getByTestId('mobile-menu-close').click()
    await expect(page.getByTestId('mobile-menu')).not.toBeVisible()
  })

  test('should load within performance budget', async ({ page }) => {
    const loadTime = await helpers.measurePageLoad()
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })
})