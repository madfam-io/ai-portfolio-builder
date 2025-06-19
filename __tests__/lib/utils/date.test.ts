
import { describe, it, expect, beforeEach, afterEach, jest,  } from '@jest/globals';
import {   formatDistanceToNow,
  format,
  parseISO,
  isValid,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  getCurrentYear,
  getPromotionalDeadline,
  getLastUpdatedDate,
  getLastUpdatedDateSpanish,
 } from '@/lib/utils/date';

describe('Date Utilities', () => {
  // Mock current date for consistent testing
  const mockDate = new Date('2024-01-15T10:30:00.000Z');
  const originalDate = Date;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    // Mock Date constructor
    global.Date = jest.fn((...args) => {
      if (args.length === 0) {
        return mockDate;
      }
      return new originalDate(...args);
    }) as any;
    // Preserve static methods
    Object.setPrototypeOf(global.Date, originalDate);
    global.Date.now = () => mockDate.getTime();
    global.Date.parse = originalDate.parse;
    global.Date.UTC = originalDate.UTC;
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  describe('formatDistanceToNow', () => {
    it('should format seconds ago', async () => {
      const date = new Date('2024-01-15T10:29:30.000Z'); // 30 seconds ago
      expect(formatDistanceToNow(date)).toBe('30 seconds');
      expect(formatDistanceToNow(date, { addSuffix: true })).toBe(
        '30 seconds ago'
      );
    });

    it('should format minutes ago', async () => {
      const date = new Date('2024-01-15T10:25:00.000Z'); // 5 minutes ago
      expect(formatDistanceToNow(date)).toBe('5 minutes');
      expect(formatDistanceToNow(date, { addSuffix: true })).toBe(
        '5 minutes ago'
      );
    });

    it('should format hours ago', async () => {
      const date = new Date('2024-01-15T08:30:00.000Z'); // 2 hours ago
      expect(formatDistanceToNow(date)).toBe('2 hours');
      expect(formatDistanceToNow(date, { addSuffix: true })).toBe(
        '2 hours ago'
      );
    });

    it('should format days ago', async () => {
      const date = new Date('2024-01-12T10:30:00.000Z'); // 3 days ago
      expect(formatDistanceToNow(date)).toBe('3 days');
      expect(formatDistanceToNow(date, { addSuffix: true })).toBe('3 days ago');
    });

    it('should format weeks ago', async () => {
      const date = new Date('2024-01-01T10:30:00.000Z'); // 2 weeks ago
      expect(formatDistanceToNow(date)).toBe('2 weeks');
      expect(formatDistanceToNow(date, { addSuffix: true })).toBe(
        '2 weeks ago'
      );
    });

    it('should format months ago', async () => {
      const date = new Date('2023-11-15T10:30:00.000Z'); // 2 months ago
      expect(formatDistanceToNow(date)).toBe('2 months');
      expect(formatDistanceToNow(date, { addSuffix: true })).toBe(
        '2 months ago'
      );
    });

    it('should format years ago', async () => {
      const date = new Date('2022-01-15T10:30:00.000Z'); // 2 years ago
      expect(formatDistanceToNow(date)).toBe('2 years');
      expect(formatDistanceToNow(date, { addSuffix: true })).toBe(
        '2 years ago'
      );
    });

    it('should handle singular units', async () => {
      const date = new Date('2024-01-15T10:29:59.000Z'); // 1 second ago
      expect(formatDistanceToNow(date)).toBe('1 second');
      expect(formatDistanceToNow(date, { addSuffix: true })).toBe(
        '1 second ago'
      );
    });

    it('should handle just now', async () => {
      const date = new Date('2024-01-15T10:30:00.000Z'); // 0 seconds ago
      expect(formatDistanceToNow(date)).toBe('0 seconds');
      expect(formatDistanceToNow(date, { addSuffix: true })).toBe('just now');
    });

    it('should handle string dates', async () => {
      const date = '2024-01-15T10:25:00.000Z';
      expect(formatDistanceToNow(date, { addSuffix: true })).toBe(
        '5 minutes ago'
      );
    });

    it('should handle timestamp dates', async () => {
      const date = new Date('2024-01-15T10:25:00.000Z').getTime();
      expect(formatDistanceToNow(date, { addSuffix: true })).toBe(
        '5 minutes ago'
      );
    });
  });

  describe('format', () => {
    const testDate = new Date('2024-03-15T14:30:00.000Z');

    it('should format as MMM d, yyyy', async () => {
      expect(format(testDate, 'MMM d, yyyy')).toMatch(/Mar 15, 2024/);
    });

    it('should format as MM/dd/yyyy', async () => {
      expect(format(testDate, 'MM/dd/yyyy')).toMatch(/03\/15\/2024/);
    });

    it('should format as MMM d', async () => {
      expect(format(testDate, 'MMM d')).toMatch(/Mar 15/);
    });

    it('should format as MMMM yyyy', async () => {
      expect(format(testDate, 'MMMM yyyy')).toMatch(/March 2024/);
    });

    it('should format as HH:mm', async () => {
      // Time will vary based on timezone, so we just check format
      const result = format(testDate, 'HH:mm');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle unknown format strings', async () => {
      const result = format(testDate, 'unknown');
      expect(result).toBeTruthy();
      expect(result).toContain('2024');
    });

    it('should handle string dates', async () => {
      expect(format('2024-03-15T14:30:00.000Z', 'MMM d, yyyy')).toMatch(
        /Mar 15, 2024/
      );
    });

    it('should handle timestamp dates', async () => {
      expect(format(testDate.getTime(), 'MMM d, yyyy')).toMatch(/Mar 15, 2024/);
    });
  });

  describe('parseISO', () => {
    it('should parse ISO string to Date', async () => {
      const isoString = '2024-03-15T14:30:00.000Z';
      const date = parseISO(isoString);
      expect(date).toBeInstanceOf(originalDate);
      expect(date.toISOString()).toBe(isoString);
    });

    it('should handle invalid ISO strings', async () => {
      const date = parseISO('invalid');
      expect(date).toBeInstanceOf(originalDate);
      expect(isNaN(date.getTime())).toBe(true);
    });
  });

  describe('isValid', () => {
    it('should return true for valid dates', async () => {
      // Temporarily restore original Date for this test
      global.Date = originalDate;

      const validDate1 = new Date('2024-01-15');
      const validDate2 = new Date();
      expect(isValid(validDate1)).toBe(true);
      expect(isValid(validDate2)).toBe(true);

      // Restore mock
      global.Date = jest.fn((...args) => {
        if (args.length === 0) {
          return mockDate;
        }
        return new originalDate(...args);
      }) as any;
    });

    it('should return false for invalid dates', async () => {
      global.Date = originalDate;

      const invalidDate = new Date('invalid');
      expect(isValid(invalidDate)).toBe(false);
      expect(isValid('not a date')).toBe(false);
      expect(isValid(null)).toBe(false);
      expect(isValid(undefined)).toBe(false);
      expect(isValid(123)).toBe(false);

      // Restore mock
      global.Date = jest.fn((...args) => {
        if (args.length === 0) {
          return mockDate;
        }
        return new originalDate(...args);
      }) as any;
    });
  });

  describe('addDays', () => {
    it('should add positive days', async () => {
      const date = new Date('2024-01-15T12:00:00.000Z');
      const result = addDays(date, 5);
      // Check the result date
      const expected = new Date('2024-01-20T12:00:00.000Z');
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('should handle month overflow', async () => {
      const date = new Date('2024-01-30T12:00:00.000Z');
      const result = addDays(date, 5);
      const expected = new Date('2024-02-04T12:00:00.000Z');
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('should handle negative days', async () => {
      const date = new Date('2024-01-15T12:00:00.000Z');
      const result = addDays(date, -5);
      const expected = new Date('2024-01-10T12:00:00.000Z');
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('should not modify original date', async () => {
      const date = new Date('2024-01-15T12:00:00.000Z');
      const original = date.getTime();
      addDays(date, 5);
      expect(date.getTime()).toBe(original);
    });
  });

  describe('subDays', () => {
    it('should subtract days', async () => {
      const date = new Date('2024-01-15T12:00:00.000Z');
      const result = subDays(date, 5);
      const expected = new Date('2024-01-10T12:00:00.000Z');
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('should handle month underflow', async () => {
      const date = new Date('2024-01-03T12:00:00.000Z');
      const result = subDays(date, 5);
      const expected = new Date('2023-12-29T12:00:00.000Z');
      expect(result.getTime()).toBe(expected.getTime());
    });
  });

  describe('startOfDay', () => {
    it('should set time to start of day', async () => {
      const date = new Date('2024-01-15T14:30:45.123Z');
      const result = startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should preserve date', async () => {
      const date = new Date('2024-01-15T14:30:45.123Z');
      const result = startOfDay(date);
      expect(result.getDate()).toBe(date.getDate());
      expect(result.getMonth()).toBe(date.getMonth());
      expect(result.getFullYear()).toBe(date.getFullYear());
    });
  });

  describe('endOfDay', () => {
    it('should set time to end of day', async () => {
      const date = new Date('2024-01-15T14:30:45.123Z');
      const result = endOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    it('should preserve date', async () => {
      const date = new Date('2024-01-15T14:30:45.123Z');
      const result = endOfDay(date);
      expect(result.getDate()).toBe(date.getDate());
      expect(result.getMonth()).toBe(date.getMonth());
      expect(result.getFullYear()).toBe(date.getFullYear());
    });
  });

  describe('isBefore', () => {
    it('should return true when date is before', async () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      expect(isBefore(date1, date2)).toBe(true);
    });

    it('should return false when date is after', async () => {
      const date1 = new Date('2024-01-16');
      const date2 = new Date('2024-01-15');
      expect(isBefore(date1, date2)).toBe(false);
    });

    it('should return false when dates are equal', async () => {
      const date1 = new Date('2024-01-15T10:00:00Z');
      const date2 = new Date('2024-01-15T10:00:00Z');
      expect(isBefore(date1, date2)).toBe(false);
    });
  });

  describe('isAfter', () => {
    it('should return true when date is after', async () => {
      const date1 = new Date('2024-01-16');
      const date2 = new Date('2024-01-15');
      expect(isAfter(date1, date2)).toBe(true);
    });

    it('should return false when date is before', async () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      expect(isAfter(date1, date2)).toBe(false);
    });

    it('should return false when dates are equal', async () => {
      const date1 = new Date('2024-01-15T10:00:00Z');
      const date2 = new Date('2024-01-15T10:00:00Z');
      expect(isAfter(date1, date2)).toBe(false);
    });
  });

  describe('getCurrentYear', () => {
    it('should return current year', async () => {
      expect(getCurrentYear()).toBe(2024);
    });
  });

  describe('getPromotionalDeadline', () => {
    it('should return date 30 days from now', async () => {
      const result = getPromotionalDeadline();
      expect(result).toBe('February 2024');
    });
  });

  describe('getLastUpdatedDate', () => {
    it('should return formatted current date', async () => {
      const result = getLastUpdatedDate();
      expect(result).toMatch(/Jan 15, 2024/);
    });
  });

  describe('getLastUpdatedDateSpanish', () => {
    it('should return formatted date in Spanish', async () => {
      const result = getLastUpdatedDateSpanish();
      // The exact format depends on the environment's locale support
      expect(result).toContain('2024');
      expect(result.toLowerCase()).toMatch(/enero|january/); // May be enero or january depending on locale
    });
  });
});
