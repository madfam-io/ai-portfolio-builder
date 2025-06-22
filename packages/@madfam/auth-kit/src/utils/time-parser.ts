/**
 * @madfam/auth-kit
 *
 * Time parsing utilities
 */

/**
 * Parse time string to milliseconds
 * Supports formats: '1d', '2h', '30m', '45s', '1000' (ms)
 */
export function parseTimeToMs(time: string | number): number {
  if (typeof time === 'number') {
    return time;
  }

  const match = time.match(/^(\d+)([dhms]?)$/);
  if (!match) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2] || 'ms';

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return value;
  }
}
