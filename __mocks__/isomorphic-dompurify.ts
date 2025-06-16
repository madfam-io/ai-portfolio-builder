// Mock DOMPurify
const mockSanitize = (text: string, _options?: any) => {
  // Simple HTML tag removal for testing
  if (typeof text !== 'string') {
    return text;
  }
  return text.replace(/<[^>]*>/g, '');
};

const DOMPurify = {
  sanitize: mockSanitize,
  version: '3.2.6',
  removed: [],
  isSupported: true,
  setConfig: jest.fn(),
  clearConfig: jest.fn(),
  isValidAttribute: jest.fn(),
  addHook: jest.fn(),
  removeHook: jest.fn(),
  removeHooks: jest.fn(),
  removeAllHooks: jest.fn(),
};

// Export as default for ES modules and as module.exports for CommonJS
export default DOMPurify;
module.exports = DOMPurify;
