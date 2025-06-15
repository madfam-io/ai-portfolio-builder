// Node environment setup - minimal setup for API route tests
// This file intentionally does not set up window-based mocks

// Global test utilities for node environment
global.testUtils = {
  waitFor: (fn, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(async () => {
        try {
          const result = await fn();
          if (result) {
            clearInterval(interval);
            resolve(result);
          } else if (Date.now() - startTime > timeout) {
            clearInterval(interval);
            reject(new Error('Timeout waiting for condition'));
          }
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            clearInterval(interval);
            reject(error);
          }
        }
      }, 100);
    });
  }
};

// Increase timeout for API tests
jest.setTimeout(10000);