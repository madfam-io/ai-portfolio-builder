/**
 * Mock OTPAuth for testing
 */

export const TOTP = jest.fn().mockImplementation(config => ({
  generate: jest.fn().mockReturnValue('123456'),
  validate: jest.fn().mockReturnValue(true),
  toString: jest
    .fn()
    .mockReturnValue(
      'otpauth://totp/Test:user@example.com?secret=TESTSECRET&issuer=Test'
    ),
  secret: config?.secret || 'TESTSECRET',
  algorithm: config?.algorithm || 'SHA1',
  digits: config?.digits || 6,
  period: config?.period || 30,
  issuer: config?.issuer || 'Test',
  label: config?.label || 'user@example.com',
}));

export const Secret = {
  generate: jest.fn().mockReturnValue({
    base32: 'TESTSECRETBASE32',
    hex: 'testsecrethex',
    latin1: 'testsecretlen1',
  }),
};

export default {
  TOTP,
  Secret,
};
