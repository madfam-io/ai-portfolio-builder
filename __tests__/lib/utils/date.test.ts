import {
  formatDistanceToNow,
  format,
  parseISO,
  isValid,
  isBefore,
  isAfter,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears
} from '@/lib/utils/date';

describe('Date Utilities', () => {
  const testDate = new Date('2024-01-15T10:30:00.000Z');
  const testDateString = '2024-01-15T10:30:00.000Z';

  describe('formatDistanceToNow', () => {
    it('should format recent dates', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const result = formatDistanceToNow(fiveMinutesAgo);
      expect(result).toContain('5 minutes');
    });

    it('should handle "about" prefix', () => {
      const result = formatDistanceToNow(testDate, { addSuffix: true });
      expect(result).toMatch(/ago$/);
    });

    it('should handle future dates', () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const result = formatDistanceToNow(future, { addSuffix: true });
      expect(result).toMatch(/in .+ day/);
    });

    it('should handle same date', () => {
      const now = new Date();
      const result = formatDistanceToNow(now);
      expect(result).toContain('less than a minute');
    });

    it('should handle different time units', () => {
      const now = new Date();
      
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      expect(formatDistanceToNow(oneHourAgo)).toContain('about 1 hour');
      
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      expect(formatDistanceToNow(oneDayAgo)).toContain('1 day');
    });
  });

  describe('format', () => {
    it('should format with common patterns', () => {
      expect(format(testDate, 'yyyy-MM-dd')).toBe('2024-01-15');
      expect(format(testDate, 'dd/MM/yyyy')).toBe('15/01/2024');
      expect(format(testDate, 'MMM d, yyyy')).toBe('Jan 15, 2024');
      expect(format(testDate, 'MMMM do, yyyy')).toBe('January 15th, 2024');
    });

    it('should format time patterns', () => {
      expect(format(testDate, 'HH:mm')).toBe('10:30');
      expect(format(testDate, 'h:mm a')).toBe('10:30 AM');
      expect(format(testDate, 'HH:mm:ss')).toBe('10:30:00');
    });

    it('should format weekdays and months', () => {
      expect(format(testDate, 'EEEE')).toBe('Monday');
      expect(format(testDate, 'EEE')).toBe('Mon');
      expect(format(testDate, 'MMMM')).toBe('January');
      expect(format(testDate, 'MMM')).toBe('Jan');
    });

    it('should handle ISO format', () => {
      const result = format(testDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      expect(result).toMatch(/2024-01-15T10:30:00\.000\+00:00/);
    });

    it('should handle invalid date', () => {
      const invalidDate = new Date('invalid');
      expect(() => format(invalidDate, 'yyyy-MM-dd')).toThrow();
    });
  });

  describe('parseISO', () => {
    it('should parse ISO date strings', () => {
      const parsed = parseISO(testDateString);
      expect(parsed.getTime()).toBe(testDate.getTime());
    });

    it('should handle date-only strings', () => {
      const parsed = parseISO('2024-01-15');
      expect(parsed.getFullYear()).toBe(2024);
      expect(parsed.getMonth()).toBe(0); // January
      expect(parsed.getDate()).toBe(15);
    });

    it('should handle timezone offsets', () => {
      const withTz = parseISO('2024-01-15T10:30:00+05:00');
      expect(withTz).toBeInstanceOf(Date);
    });

    it('should throw for invalid ISO strings', () => {
      expect(() => parseISO('not-a-date')).toThrow();
      expect(() => parseISO('2024-13-45')).toThrow();
    });
  });

  describe('isValid', () => {
    it('should validate dates correctly', () => {
      expect(isValid(testDate)).toBe(true);
      expect(isValid(new Date('2024-01-15'))).toBe(true);
      expect(isValid(new Date('invalid'))).toBe(false);
      expect(isValid(null as any)).toBe(false);
      expect(isValid(undefined as any)).toBe(false);
    });
  });

  describe('comparison functions', () => {
    const date1 = new Date('2024-01-15');
    const date2 = new Date('2024-01-20');

    it('should compare dates with isBefore', () => {
      expect(isBefore(date1, date2)).toBe(true);
      expect(isBefore(date2, date1)).toBe(false);
      expect(isBefore(date1, date1)).toBe(false);
    });

    it('should compare dates with isAfter', () => {
      expect(isAfter(date2, date1)).toBe(true);
      expect(isAfter(date1, date2)).toBe(false);
      expect(isAfter(date1, date1)).toBe(false);
    });
  });

  describe('date arithmetic - addition', () => {
    it('should add days', () => {
      const result = addDays(testDate, 5);
      expect(format(result, 'yyyy-MM-dd')).toBe('2024-01-20');
    });

    it('should add weeks', () => {
      const result = addWeeks(testDate, 2);
      expect(format(result, 'yyyy-MM-dd')).toBe('2024-01-29');
    });

    it('should add months', () => {
      const result = addMonths(testDate, 1);
      expect(format(result, 'yyyy-MM-dd')).toBe('2024-02-15');
    });

    it('should add years', () => {
      const result = addYears(testDate, 1);
      expect(format(result, 'yyyy-MM-dd')).toBe('2025-01-15');
    });

    it('should handle month boundaries', () => {
      const endOfMonth = new Date('2024-01-31');
      const result = addMonths(endOfMonth, 1);
      // Should handle Feb having fewer days
      expect(result.getMonth()).toBe(1); // February
    });
  });

  describe('date arithmetic - subtraction', () => {
    it('should subtract days', () => {
      const result = subDays(testDate, 5);
      expect(format(result, 'yyyy-MM-dd')).toBe('2024-01-10');
    });

    it('should subtract weeks', () => {
      const result = subWeeks(testDate, 2);
      expect(format(result, 'yyyy-MM-dd')).toBe('2024-01-01');
    });

    it('should subtract months', () => {
      const result = subMonths(testDate, 1);
      expect(format(result, 'yyyy-MM-dd')).toBe('2023-12-15');
    });

    it('should subtract years', () => {
      const result = subYears(testDate, 1);
      expect(format(result, 'yyyy-MM-dd')).toBe('2023-01-15');
    });
  });

  describe('start/end of period functions', () => {
    it('should get start and end of day', () => {
      const start = startOfDay(testDate);
      const end = endOfDay(testDate);
      
      expect(format(start, 'yyyy-MM-dd HH:mm:ss')).toBe('2024-01-15 00:00:00');
      expect(format(end, 'yyyy-MM-dd HH:mm:ss')).toBe('2024-01-15 23:59:59');
    });

    it('should get start and end of week', () => {
      const start = startOfWeek(testDate);
      const end = endOfWeek(testDate);
      
      // Week starts on Sunday
      expect(start.getDay()).toBe(0);
      expect(end.getDay()).toBe(6);
    });

    it('should get start and end of month', () => {
      const start = startOfMonth(testDate);
      const end = endOfMonth(testDate);
      
      expect(start.getDate()).toBe(1);
      expect(format(start, 'yyyy-MM-dd')).toBe('2024-01-01');
      expect(format(end, 'yyyy-MM-dd')).toBe('2024-01-31');
    });

    it('should get start and end of year', () => {
      const start = startOfYear(testDate);
      const end = endOfYear(testDate);
      
      expect(format(start, 'yyyy-MM-dd')).toBe('2024-01-01');
      expect(format(end, 'yyyy-MM-dd')).toBe('2024-12-31');
    });
  });

  describe('difference calculations', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-01-15');

    it('should calculate difference in days', () => {
      expect(differenceInDays(date2, date1)).toBe(14);
      expect(differenceInDays(date1, date2)).toBe(-14);
    });

    it('should calculate difference in weeks', () => {
      expect(differenceInWeeks(date2, date1)).toBe(2);
    });

    it('should calculate difference in months', () => {
      const monthLater = new Date('2024-03-01');
      expect(differenceInMonths(monthLater, date1)).toBe(2);
    });

    it('should calculate difference in years', () => {
      const yearLater = new Date('2026-01-01');
      expect(differenceInYears(yearLater, date1)).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle leap years', () => {
      const leapDay = new Date('2024-02-29');
      expect(isValid(leapDay)).toBe(true);
      
      const nonLeapDay = new Date('2023-02-29');
      expect(isValid(nonLeapDay)).toBe(false);
    });

    it('should handle daylight saving time', () => {
      const beforeDST = new Date('2024-03-09T10:00:00.000Z');
      const afterDST = addDays(beforeDST, 1);
      
      expect(differenceInDays(afterDST, beforeDST)).toBe(1);
    });

    it('should handle different timezones', () => {
      const utc = new Date('2024-01-15T12:00:00.000Z');
      const formatted = format(utc, 'yyyy-MM-dd HH:mm');
      expect(formatted).toBe('2024-01-15 12:00');
    });

    it('should handle very old dates', () => {
      const oldDate = new Date('1900-01-01');
      expect(isValid(oldDate)).toBe(true);
      expect(format(oldDate, 'yyyy')).toBe('1900');
    });

    it('should handle far future dates', () => {
      const futureDate = new Date('2100-12-31');
      expect(isValid(futureDate)).toBe(true);
      expect(format(futureDate, 'yyyy')).toBe('2100');
    });
  });

  describe('performance considerations', () => {
    it('should handle batch operations efficiently', () => {
      const dates = Array.from({ length: 1000 }, (_, i) => 
        addDays(testDate, i)
      );
      
      const start = Date.now();
      dates.forEach(date => format(date, 'yyyy-MM-dd'));
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should be fast
    });

    it('should not mutate original dates', () => {
      const original = new Date(testDate);
      const modified = addDays(testDate, 5);
      
      expect(testDate.getTime()).toBe(original.getTime());
      expect(modified.getTime()).not.toBe(original.getTime());
    });
  });
});