/**
 * Data transforms for analytics charts
 * Converts raw analytics data to chart-compatible formats
 */

export interface CommitDataPoint {
  date: string;
  commits: number;
}

export interface LanguageDataPoint {
  name: string;
  value: number;
  color: string;
}

interface CommitDayData {
  date: string;
  count?: number;
}

interface LanguageData {
  name: string;
  percentage?: number;
}

/**
 * Transform commit data for charts
 */
export function transformCommitData(
  commitsByDay: unknown[]
): CommitDataPoint[] {
  if (!Array.isArray(commitsByDay)) {
    return [];
  }

  return commitsByDay
    .filter((day): day is CommitDayData => 
      typeof day === 'object' && 
      day !== null && 
      'date' in day &&
      typeof day.date === 'string'
    )
    .map(day => ({
      date: day.date,
      commits: day.count || 0,
    }));
}

/**
 * Transform language data for charts
 */
export function transformLanguageData(
  languages: unknown[],
  colors: Record<string, string>
): LanguageDataPoint[] {
  if (!Array.isArray(languages)) {
    return [];
  }

  const validLanguages = languages.filter((lang): lang is LanguageData =>
    typeof lang === 'object' &&
    lang !== null &&
    'name' in lang &&
    typeof lang.name === 'string'
  );

  const sortedLanguages = validLanguages
    .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
    .slice(0, 8); // Top 8 languages

  const colorKeys = Object.keys(colors);

  return sortedLanguages.map((lang, index) => ({
    name: lang.name,
    value: lang.percentage || 0,
    color:
      colors[colorKeys[index % colorKeys.length] || 'primary'] ||
      colors.primary,
  }));
}
