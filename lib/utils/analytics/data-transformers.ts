/**
 * Data transformation utilities for analytics components
 */

interface CommitData {
  commitDate: string;
  commitCount: number;
}

interface LanguageData {
  language: string;
  percentage: number;
}

interface ChartColors {
  primary: string;
  secondary: string;
  accent: string;
  warning: string;
  danger: string;
}

const transformCommitData = (
  commits: CommitData[]
): Array<{ date: string; commits: number }> => {
  return commits.map(item => ({
    date: item.commitDate,
    commits: item.commitCount,
  }));
};

const transformLanguageData = (
  languages: LanguageData[],
  chartColors: ChartColors
): Array<{ name: string; value: number; color: string }> => {
  return languages.map((lang, index) => ({
    name: lang.language,
    value: lang.percentage,
    color:
      [
        chartColors.primary,
        chartColors.secondary,
        chartColors.accent,
        chartColors.warning,
        chartColors.danger,
      ][index % 5] || chartColors.primary,
  }));
};
