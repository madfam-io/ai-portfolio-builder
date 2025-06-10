/**
 * Date utility functions for dynamic year and date handling
 */

/**
 * Get the current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get the end of current year date
 */
export function getEndOfYearDate(): string {
  const currentYear = getCurrentYear();
  return `December 31st, ${currentYear}`;
}

/**
 * Get the end of current year date in Spanish
 */
export function getEndOfYearDateSpanish(): string {
  const currentYear = getCurrentYear();
  return `31 de diciembre de ${currentYear}`;
}

/**
 * Get current month and year for "Last updated" text
 */
export function getLastUpdatedDate(): string {
  const date = new Date();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${year}`;
}

/**
 * Get current month and year in Spanish
 */
export function getLastUpdatedDateSpanish(): string {
  const date = new Date();
  const month = date.toLocaleString('es-ES', { month: 'long' });
  const year = date.getFullYear();
  // Capitalize first letter
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${capitalizedMonth} ${year}`;
}

/**
 * Format a copyright string with the current year
 */
export function getCopyrightText(
  companyName: string = 'PRISMA by MADFAM'
): string {
  return `© ${getCurrentYear()} ${companyName}`;
}

/**
 * Get a date N months from now (useful for promotional deadlines)
 */
export function getDateMonthsFromNow(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

/**
 * Format a promotional deadline (e.g., "Offer expires March 31st, 2025")
 */
export function getPromotionalDeadline(monthsFromNow: number = 3): {
  en: string;
  es: string;
} {
  const deadline = getDateMonthsFromNow(monthsFromNow);

  // English format
  const enMonth = deadline.toLocaleString('en-US', { month: 'long' });
  const enDay = deadline.getDate();
  const enYear = deadline.getFullYear();
  const enSuffix = getDaySuffix(enDay);

  // Spanish format
  const esMonth = deadline.toLocaleString('es-ES', { month: 'long' });
  const esDay = deadline.getDate();
  const esYear = deadline.getFullYear();

  return {
    en: `${enMonth} ${enDay}${enSuffix}, ${enYear}`,
    es: `${esDay} de ${esMonth} de ${esYear}`,
  };
}

/**
 * Get the appropriate suffix for a day number (1st, 2nd, 3rd, etc.)
 */
function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }

  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}
