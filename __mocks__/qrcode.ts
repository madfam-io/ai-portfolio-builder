/**
 * Mock QRCode for testing
 */

export const toDataURL = jest
  .fn()
  .mockResolvedValue('data:image/png;base64,MOCK_QR_CODE_DATA');

export const toString = jest.fn().mockResolvedValue('<svg>mock qr code</svg>');

export const toBuffer = jest
  .fn()
  .mockResolvedValue(Buffer.from('mock qr code buffer'));

export const toFile = jest.fn().mockResolvedValue(undefined);

export default {
  toDataURL,
  toString,
  toBuffer,
  toFile,
};
