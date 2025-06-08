import { Page, expect } from '@playwright/test'

// Test data
export const testUser = {
  email: 'e2e.test@example.com',
  password: 'TestPassword123!',
  fullName: 'E2E Test User',
}

export const testPortfolio = {
  title: 'E2E Test Portfolio',
  bio: 'This is a test bio for E2E testing',
  tagline: 'E2E Test Professional',
}

// Helper functions for common E2E operations
export class TestHelpers {
  constructor(private page: Page) {}

  // Navigation helpers
  async goto(path: string) {
    await this.page.goto(path)
    await this.page.waitForLoadState('networkidle')
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  // Authentication helpers
  async signUp(email: string, password: string, fullName?: string) {
    await this.goto('/auth/signup')
    
    if (fullName) {
      await this.page.fill('[data-testid="signup-name"]', fullName)
    }
    await this.page.fill('[data-testid="signup-email"]', email)
    await this.page.fill('[data-testid="signup-password"]', password)
    await this.page.click('[data-testid="signup-submit"]')
    
    // Wait for redirect or success message
    await this.page.waitForURL(/\/dashboard|\/auth\/verify/)
  }

  async signIn(email: string, password: string) {
    await this.goto('/auth/signin')
    
    await this.page.fill('[data-testid="signin-email"]', email)
    await this.page.fill('[data-testid="signin-password"]', password)
    await this.page.click('[data-testid="signin-submit"]')
    
    // Wait for redirect to dashboard
    await this.page.waitForURL('/dashboard')
  }

  async signOut() {
    await this.page.click('[data-testid="user-menu"]')
    await this.page.click('[data-testid="signout-button"]')
    await this.page.waitForURL('/')
  }

  // Portfolio helpers
  async createPortfolio(portfolioData: typeof testPortfolio) {
    // Assumes user is authenticated and on dashboard
    await this.page.click('[data-testid="create-portfolio"]')
    
    await this.page.fill('[data-testid="portfolio-title"]', portfolioData.title)
    await this.page.fill('[data-testid="portfolio-bio"]', portfolioData.bio)
    await this.page.fill('[data-testid="portfolio-tagline"]', portfolioData.tagline)
    
    await this.page.click('[data-testid="portfolio-save"]')
    
    // Wait for save to complete
    await expect(this.page.locator('[data-testid="save-success"]')).toBeVisible()
  }

  async publishPortfolio() {
    await this.page.click('[data-testid="publish-portfolio"]')
    await this.page.click('[data-testid="confirm-publish"]')
    
    // Wait for publish confirmation
    await expect(this.page.locator('[data-testid="publish-success"]')).toBeVisible()
  }

  // Form helpers
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`[data-testid="${field}"]`, value)
    }
  }

  async submitForm(submitButtonTestId = 'submit-button') {
    await this.page.click(`[data-testid="${submitButtonTestId}"]`)
  }

  // Wait helpers
  async waitForToast(message?: string) {
    const toast = this.page.locator('[data-testid="toast"]')
    await expect(toast).toBeVisible()
    
    if (message) {
      await expect(toast).toContainText(message)
    }
    
    return toast
  }

  async waitForModal(modalTestId: string) {
    const modal = this.page.locator(`[data-testid="${modalTestId}"]`)
    await expect(modal).toBeVisible()
    return modal
  }

  async closeModal(modalTestId: string) {
    await this.page.click(`[data-testid="${modalTestId}-close"]`)
    await expect(this.page.locator(`[data-testid="${modalTestId}"]`)).not.toBeVisible()
  }

  // API helpers
  async mockApiCall(url: string, response: any, status = 200) {
    await this.page.route(url, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })
  }

  async interceptApiCall(url: string) {
    const responses: any[] = []
    
    await this.page.route(url, route => {
      responses.push(route.request().postDataJSON())
      route.continue()
    })
    
    return responses
  }

  // Screenshot helpers
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `e2e/screenshots/${name}.png`,
      fullPage: true 
    })
  }

  // Responsive testing helpers
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 })
  }

  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 })
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1920, height: 1080 })
  }

  // Performance helpers
  async measurePageLoad() {
    const startTime = Date.now()
    await this.page.waitForLoadState('networkidle')
    const endTime = Date.now()
    return endTime - startTime
  }

  // Accessibility helpers
  async checkA11y() {
    // Basic accessibility checks
    const hasMainLandmark = await this.page.locator('main, [role="main"]').count()
    expect(hasMainLandmark).toBeGreaterThan(0)
    
    const hasH1 = await this.page.locator('h1').count()
    expect(hasH1).toBeGreaterThan(0)
    
    // Check for form labels
    const inputs = await this.page.locator('input').count()
    const labels = await this.page.locator('label').count()
    if (inputs > 0) {
      expect(labels).toBeGreaterThan(0)
    }
  }
}

// Database helpers for E2E testing
export async function cleanupTestData() {
  // Clean up test data after tests
  // This would connect to your test database and clean up
  console.log('🧹 Cleaning up E2E test data')
}

export async function seedTestData() {
  // Seed test data before tests
  console.log('🌱 Seeding E2E test data')
}