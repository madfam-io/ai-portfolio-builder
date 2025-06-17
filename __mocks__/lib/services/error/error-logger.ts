/**
 * Mock Error Logger for testing
 */

export const mockErrorLogger = {
  logError: jest.fn(),
  logWarning: jest.fn(),
  logInfo: jest.fn(),
  getErrorLogs: jest.fn().mockReturnValue([]),
  clearLogs: jest.fn(),
};

export const errorLogger = mockErrorLogger;

export default mockErrorLogger;