/**
 * @license MIT
 * Copyright (c) 2025 MADFAM
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @madfam/logger
 *
 * Data redaction utilities
 */

const REDACTED = '[REDACTED]';

/**
 * Redact sensitive data from objects
 */
export function redactData(
  data: any,
  redactKeys?: string[],
  redactPaths?: string[]
): any {
  if (!redactKeys && !redactPaths) {
    return data;
  }

  return redactObject(data, redactKeys || [], redactPaths || [], '');
}

function redactObject(
  obj: any,
  redactKeys: string[],
  redactPaths: string[],
  currentPath: string
): any {
  // Handle primitives
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item, index) =>
      redactObject(item, redactKeys, redactPaths, `${currentPath}[${index}]`)
    );
  }

  // Handle objects
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const path = currentPath ? `${currentPath}.${key}` : key;

    // Check if key should be redacted
    if (redactKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
      result[key] = REDACTED;
      continue;
    }

    // Check if path should be redacted
    if (redactPaths.includes(path)) {
      result[key] = REDACTED;
      continue;
    }

    // Recursively process nested objects
    result[key] = redactObject(value, redactKeys, redactPaths, path);
  }

  return result;
}

/**
 * Common sensitive field names to redact by default
 */
export const DEFAULT_REDACT_KEYS = [
  'password',
  'token',
  'secret',
  'apikey',
  'api_key',
  'access_token',
  'refresh_token',
  'private_key',
  'ssn',
  'social_security_number',
  'credit_card',
  'creditcard',
  'card_number',
  'cardnumber',
  'cvv',
  'cvc',
  'pin',
];
