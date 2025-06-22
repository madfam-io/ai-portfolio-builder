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

export const transformCommitData = (
  commits: CommitData[]
): Array<{ date: string; commits: number }> => {
  return commits.map(item => ({
    date: item.commitDate,
    commits: item.commitCount,
  }));
};

export const transformLanguageData = (
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
