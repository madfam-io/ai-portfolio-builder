import { test, expect } from '@playwright/test';
import { PRISMATestHelpers } from './utils/test-helpers';

test.describe('PRISMA Geolocation Features', () => {
  let helpers: PRISMATestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new PRISMATestHelpers(page);
  });

  test('should detect Mexican location and show Spanish with Mexican flag', async ({ page }) => {
    // Mock geolocation to return Mexico
    await page.addInitScript(() => {
      // Mock the IP geolocation API
      window.fetch = ((originalFetch) => {
        return (...args) => {
          const [url] = args;
          if (typeof url === 'string' && url.includes('ipapi.co/country/')) {
            return Promise.resolve(new Response('MX', { status: 200 }));
          }
          return originalFetch(...args);
        };
      })(window.fetch);

      // Mock browser timezone to Mexico
      Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
        value: () => ({ timeZone: 'America/Mexico_City' })
      });
    });

    await helpers.goto('/');
    await helpers.waitForGeolocationDetection();

    // Should show Spanish content
    await expect(page.locator('text=Tu portafolio, elevado por IA')).toBeVisible();
    await expect(page.locator('text=Conecta tus perfiles. Mejora tu historia.')).toBeVisible();

    // Should show Mexican flag
    await expect(page.locator('button').filter({ hasText: /🇲🇽/ })).toBeVisible();

    // Should show MXN currency
    await expect(page.locator('button').filter({ hasText: /MXN/ })).toBeVisible();

    // Pricing should show Mexican pesos
    await page.locator('#pricing').scrollIntoViewIfNeeded();
    await expect(page.locator('text=MX$149')).toBeVisible();
    await expect(page.locator('text=MX$399')).toBeVisible();
  });

  test('should detect US location and show English with US flag', async ({ page }) => {
    // Mock geolocation to return US
    await page.addInitScript(() => {
      // Mock the IP geolocation API
      window.fetch = ((originalFetch) => {
        return (...args) => {
          const [url] = args;
          if (typeof url === 'string' && url.includes('ipapi.co/country/')) {
            return Promise.resolve(new Response('US', { status: 200 }));
          }
          return originalFetch(...args);
        };
      })(window.fetch);

      // Mock browser timezone to US
      Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
        value: () => ({ timeZone: 'America/New_York' })
      });
    });

    await helpers.goto('/');
    await helpers.waitForGeolocationDetection();

    // Should show English content
    await expect(page.locator('text=Your portfolio, elevated by AI')).toBeVisible();
    await expect(page.locator('text=Connect your profiles. Enhance your story.')).toBeVisible();

    // Should show US flag
    await expect(page.locator('button').filter({ hasText: /🇺🇸/ })).toBeVisible();

    // Should show USD currency
    await expect(page.locator('button').filter({ hasText: /USD/ })).toBeVisible();

    // Pricing should show US dollars
    await page.locator('#pricing').scrollIntoViewIfNeeded();
    await expect(page.locator('text=$19')).toBeVisible();
    await expect(page.locator('text=$49')).toBeVisible();
  });

  test('should handle geolocation API failure gracefully', async ({ page }) => {
    // Mock geolocation API to fail
    await page.addInitScript(() => {
      window.fetch = ((originalFetch) => {
        return (...args) => {
          const [url] = args;
          if (typeof url === 'string' && url.includes('ipapi.co/country/')) {
            return Promise.reject(new Error('Network error'));
          }
          return originalFetch(...args);
        };
      })(window.fetch);
    });

    await helpers.goto('/');
    await page.waitForTimeout(2000);

    // Should fallback to Spanish (default for PRISMA/MADFAM)
    await expect(page.locator('text=Tu portafolio, elevado por IA')).toBeVisible();

    // Should show Mexican flag as default
    await expect(page.locator('button').filter({ hasText: /🇲🇽/ })).toBeVisible();
  });

  test('should detect Spanish-speaking countries correctly', async ({ page }) => {
    const spanishCountries = ['AR', 'CO', 'PE', 'CL', 'ES'];

    for (const country of spanishCountries) {
      // Mock geolocation to return Spanish-speaking country
      await page.addInitScript((countryCode) => {
        window.fetch = ((originalFetch) => {
          return (...args) => {
            const [url] = args;
            if (typeof url === 'string' && url.includes('ipapi.co/country/')) {
              return Promise.resolve(new Response(countryCode, { status: 200 }));
            }
            return originalFetch(...args);
          };
        })(window.fetch);
      }, country);

      await helpers.goto('/');
      await helpers.waitForGeolocationDetection();

      // Should show Spanish content
      await expect(page.locator('text=Tu portafolio, elevado por IA')).toBeVisible();

      // Should show appropriate flag (specific country or Mexican default)
      const hasCountryFlag = await page.locator('button').filter({ 
        hasText: new RegExp(`🇦🇷|🇨🇴|🇵🇪|🇨🇱|🇪🇸|🇲🇽`) 
      }).count() > 0;
      expect(hasCountryFlag).toBeTruthy();
    }
  });

  test('should detect English-speaking countries correctly', async ({ page }) => {
    const englishCountries = ['CA', 'GB', 'AU', 'NZ'];

    for (const country of englishCountries) {
      // Mock geolocation to return English-speaking country
      await page.addInitScript((countryCode) => {
        window.fetch = ((originalFetch) => {
          return (...args) => {
            const [url] = args;
            if (typeof url === 'string' && url.includes('ipapi.co/country/')) {
              return Promise.resolve(new Response(countryCode, { status: 200 }));
            }
            return originalFetch(...args);
          };
        })(window.fetch);
      }, country);

      await helpers.goto('/');
      await helpers.waitForGeolocationDetection();

      // Should show English content
      await expect(page.locator('text=Your portfolio, elevated by AI')).toBeVisible();

      // Should show appropriate flag (specific country or US default)
      const hasCountryFlag = await page.locator('button').filter({ 
        hasText: new RegExp(`🇨🇦|🇬🇧|🇦🇺|🇳🇿|🇺🇸`) 
      }).count() > 0;
      expect(hasCountryFlag).toBeTruthy();
    }
  });

  test('should use browser language as fallback when geolocation fails', async ({ page }) => {
    // Mock geolocation to fail and set browser language to English
    await page.addInitScript(() => {
      // Mock geolocation API to fail
      window.fetch = ((originalFetch) => {
        return (...args) => {
          const [url] = args;
          if (typeof url === 'string' && url.includes('ipapi.co/country/')) {
            return Promise.reject(new Error('Network error'));
          }
          return originalFetch(...args);
        };
      })(window.fetch);

      // Mock browser language to English
      Object.defineProperty(navigator, 'language', {
        get: () => 'en-US',
        configurable: true
      });
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
        configurable: true
      });
    });

    await helpers.goto('/');
    await page.waitForTimeout(2000);

    // Should show English content based on browser language
    await expect(page.locator('text=Your portfolio, elevated by AI')).toBeVisible();
  });

  test('should persist language preference after manual change', async ({ page }) => {
    await helpers.goto('/');
    await helpers.waitForGeolocationDetection();

    // Start with Spanish (default)
    await expect(page.locator('text=Tu portafolio, elevado por IA')).toBeVisible();

    // Switch to English manually
    await helpers.switchLanguage('en');
    
    // Refresh page
    await page.reload();
    await page.waitForTimeout(1000);

    // Should remember English preference despite geolocation
    await expect(page.locator('text=Your portfolio, elevated by AI')).toBeVisible();
  });

  test('should show correct currency based on country detection', async ({ page }) => {
    // Test with different country/currency combinations
    const testCases = [
      { country: 'MX', expectedCurrency: 'MXN', expectedSymbol: 'MX$' },
      { country: 'US', expectedCurrency: 'USD', expectedSymbol: '$' },
      { country: 'CO', expectedCurrency: 'MXN', expectedSymbol: 'MX$' }, // Default to MXN for other Spanish countries
      { country: 'CA', expectedCurrency: 'USD', expectedSymbol: '$' }, // Default to USD for other English countries
    ];

    for (const testCase of testCases) {
      // Mock geolocation
      await page.addInitScript((countryCode) => {
        window.fetch = ((originalFetch) => {
          return (...args) => {
            const [url] = args;
            if (typeof url === 'string' && url.includes('ipapi.co/country/')) {
              return Promise.resolve(new Response(countryCode, { status: 200 }));
            }
            return originalFetch(...args);
          };
        })(window.fetch);
      }, testCase.country);

      await helpers.goto('/');
      await helpers.waitForGeolocationDetection();

      // Check currency display
      await expect(page.locator('button').filter({ 
        hasText: testCase.expectedCurrency 
      })).toBeVisible();

      // Check pricing section
      await page.locator('#pricing').scrollIntoViewIfNeeded();
      await expect(page.locator(`text=${testCase.expectedSymbol}`).first()).toBeVisible();
    }
  });

  test('should handle timezone-based detection when IP fails', async ({ page }) => {
    // Mock IP detection to fail, rely on timezone
    await page.addInitScript(() => {
      // Mock IP API to fail
      window.fetch = ((originalFetch) => {
        return (...args) => {
          const [url] = args;
          if (typeof url === 'string' && url.includes('ipapi.co/country/')) {
            return Promise.reject(new Error('IP detection failed'));
          }
          return originalFetch(...args);
        };
      })(window.fetch);

      // Mock timezone to Mexico
      Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
        value: () => ({ timeZone: 'America/Mexico_City' })
      });
    });

    await helpers.goto('/');
    await helpers.waitForGeolocationDetection();

    // Should detect Spanish based on timezone
    await expect(page.locator('text=Tu portafolio, elevado por IA')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /🇲🇽/ })).toBeVisible();
  });

  test('should show appropriate flag emojis for detected countries', async ({ page }) => {
    const flagTests = [
      { country: 'MX', expectedFlag: '🇲🇽' },
      { country: 'US', expectedFlag: '🇺🇸' },
      { country: 'AR', expectedFlag: '🇦🇷' },
      { country: 'ES', expectedFlag: '🇪🇸' },
      { country: 'CA', expectedFlag: '🇨🇦' },
      { country: 'GB', expectedFlag: '🇬🇧' },
    ];

    for (const flagTest of flagTests) {
      // Mock geolocation
      await page.addInitScript((countryCode) => {
        window.fetch = ((originalFetch) => {
          return (...args) => {
            const [url] = args;
            if (typeof url === 'string' && url.includes('ipapi.co/country/')) {
              return Promise.resolve(new Response(countryCode, { status: 200 }));
            }
            return originalFetch(...args);
          };
        })(window.fetch);
      }, flagTest.country);

      await helpers.goto('/');
      await helpers.waitForGeolocationDetection();

      // Should show correct flag
      await expect(page.locator('button').filter({ 
        hasText: flagTest.expectedFlag 
      })).toBeVisible();
    }
  });

  test('should handle unknown countries with fallback', async ({ page }) => {
    // Mock unknown country
    await page.addInitScript(() => {
      window.fetch = ((originalFetch) => {
        return (...args) => {
          const [url] = args;
          if (typeof url === 'string' && url.includes('ipapi.co/country/')) {
            return Promise.resolve(new Response('XX', { status: 200 })); // Unknown country
          }
          return originalFetch(...args);
        };
      })(window.fetch);
    });

    await helpers.goto('/');
    await helpers.waitForGeolocationDetection();

    // Should fallback to Spanish (PRISMA's primary market)
    await expect(page.locator('text=Tu portafolio, elevado por IA')).toBeVisible();

    // Should show Mexican flag as default
    await expect(page.locator('button').filter({ hasText: /🇲🇽/ })).toBeVisible();
  });
});