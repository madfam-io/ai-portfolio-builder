/**
 * Mock Toast for testing
 */

export const toast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
};

export const showToast = jest.fn().mockImplementation((message, type = 'info') => {
  console.log(`Toast: [${type}] ${message}`);
});

export default toast;