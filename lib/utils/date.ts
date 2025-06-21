/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Date utility functions
 *
 * Lightweight date formatting utilities that replace date-fns
 * to reduce bundle size by ~38MB
 */

/**
 * Format distance to now (replacement for date-fns formatDistanceToNow)
 *
 * @param date - The date to format
 * @param options - Options for formatting
 * @returns Formatted string like "2 hours ago", "3 days ago", etc.
 */
export function formatDistanceToNow(
  date: Date | string | number,
  options?: { addSuffix?: boolean }
): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      const plural = count !== 1 ? 's' : '';
      const distance = `${count} ${interval.label}${plural}`;
      return options?.addSuffix ? `${distance} ago` : distance;
    }
  }

  return options?.addSuffix ? 'just now' : '0 seconds';
}

/**
 * Format date (replacement for date-fns format)
 *
 * @param date - The date to format
 * @param formatStr - Format string (supports common patterns)
 * @returns Formatted date string
 */
export function format(
  date: Date | string | number,
  formatStr: string
): string {
  const d = new Date(date);

  // Common format patterns
  const formatMap: Record<string, string> = {
    'MMM d, yyyy': d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    'MM/dd/yyyy': d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    'MMM d': d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    'MMMM yyyy': d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    }),
    'HH:mm': d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };

  return formatMap[formatStr] || d.toLocaleDateString();
}

/**
 * Parse ISO string to Date
 *
 * @param isoString - ISO date string
 * @returns Date object
 */
export function parseISO(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Check if date is valid
 *
 * @param date - Date to check
 * @returns true if valid date
 */
export function isValid(date: unknown): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Add days to date
 *
 * @param date - Starting date
 * @param days - Number of days to add
 * @returns New date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from date
 *
 * @param date - Starting date
 * @param days - Number of days to subtract
 * @returns New date
 */
export function subDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Get start of day
 *
 * @param date - Input date
 * @returns Date at start of day (00:00:00)
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 *
 * @param date - Input date
 * @returns Date at end of day (23:59:59.999)
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check if date is before another date
 *
 * @param date - Date to check
 * @param dateToCompare - Date to compare against
 * @returns true if date is before dateToCompare
 */
export function isBefore(date: Date, dateToCompare: Date): boolean {
  return date.getTime() < dateToCompare.getTime();
}

/**
 * Check if date is after another date
 *
 * @param date - Date to check
 * @param dateToCompare - Date to compare against
 * @returns true if date is after dateToCompare
 */
export function isAfter(date: Date, dateToCompare: Date): boolean {
  return date.getTime() > dateToCompare.getTime();
}

/**
 * Get current year
 *
 * @returns Current year as number
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get promotional deadline (30 days from now)
 *
 * @returns Date string for promotional deadline
 */
export function getPromotionalDeadline(): string {
  const deadline = addDays(new Date(), 30);
  return format(deadline, 'MMMM yyyy');
}

/**
 * Get last updated date formatted
 *
 * @returns Formatted date string
 */
export function getLastUpdatedDate(): string {
  return format(new Date(), 'MMM d, yyyy');
}

/**
 * Get last updated date in Spanish
 *
 * @returns Formatted date string in Spanish
 */
export function getLastUpdatedDateSpanish(): string {
  const date = new Date();
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
