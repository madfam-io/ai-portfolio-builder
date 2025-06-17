/**
 * Mock MFA Service for testing
 */

export const mockMFAService = {
  setupMFA: jest.fn().mockResolvedValue({
    secret: 'MOCK_SECRET',
    qrCodeUrl: 'data:image/png;base64,MOCK_QR_CODE',
    backupCodes: ['123456', '789012'],
  }),
  
  verifyMFASetup: jest.fn().mockResolvedValue(true),
  
  verifyMFAToken: jest.fn().mockResolvedValue({
    valid: true,
    remainingBackupCodes: 2,
  }),
  
  generateBackupCodes: jest.fn().mockResolvedValue(['123456', '789012']),
  
  disableMFA: jest.fn().mockResolvedValue({ success: true }),
};

export const setupMFA = mockMFAService.setupMFA;
export const verifyMFASetup = mockMFAService.verifyMFASetup;
export const verifyMFAToken = mockMFAService.verifyMFAToken;
export const generateBackupCodes = mockMFAService.generateBackupCodes;
export const disableMFA = mockMFAService.disableMFA;

export default mockMFAService;