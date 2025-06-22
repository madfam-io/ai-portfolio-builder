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
