/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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

const qrcodeMock = {
  toDataURL,
  toString,
  toBuffer,
  toFile,
};

export default qrcodeMock;
