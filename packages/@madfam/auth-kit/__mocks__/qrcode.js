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

// Create mock functions with explicit implementations
const toDataURL = _data =>
  Promise.resolve('data:image/png;base64,MOCK_QR_CODE_DATA');
const toString = (_data, _opts) => Promise.resolve('<svg>mock qr code</svg>');
const toBuffer = (_data, _opts) =>
  Promise.resolve(Buffer.from('mock qr code buffer'));
const toFile = (_data, _path, _opts) => Promise.resolve(undefined);

// Create the module exports
const QRCode = {
  toDataURL,
  toString,
  toBuffer,
  toFile,
};

module.exports = QRCode;
module.exports.toDataURL = toDataURL;
module.exports.toString = toString;
module.exports.toBuffer = toBuffer;
module.exports.toFile = toFile;
module.exports.default = QRCode;
module.exports.__esModule = true;
