import { logger } from '@/lib/utils/logger';
import { getSeedConfig } from '../index';
import type { SeedingOptions } from '@/lib/database/seeder';

/**
 * Generate portfolio analytics
 */
export function generatePortfolioAnalytics(
  portfolioId: string,
  daysBack: number
): any[] {
  const analytics = [];

  for (let i = 0; i < daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Skip some days for realism
    if (Math.random() < 0.4) continue; // 60% of days have views

    const views = Math.floor(Math.random() * 50) + 1;
    const uniqueVisitors = Math.floor(views * 0.7); // ~70% unique visitors
    const avgTimeSpent = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
    const bounceRate = Math.random() * 0.5 + 0.2; // 20-70% bounce rate

    // Generate some referrer data
    const referrers = ['direct', 'google', 'linkedin', 'github', 'twitter'];
    const referrerData: { [key: string]: number } = {};
    let remainingViews = views;

    referrers.forEach((referrer, index) => {
      if (remainingViews > 0 && index < referrers.length - 1) {
        const refViews = Math.floor(Math.random() * (remainingViews / 2)) + 1;
        referrerData[referrer] = refViews;
        remainingViews -= refViews;
      } else if (index === referrers.length - 1) {
        referrerData[referrer] = remainingViews;
      }
    });

    analytics.push({
      id: `portfolio-analytics-${portfolioId}-${dateString}`,
      portfolio_id: portfolioId,
      date: dateString,
      views,
      unique_visitors: uniqueVisitors,
      avg_time_spent: avgTimeSpent,
      bounce_rate: bounceRate,
      referrers: JSON.stringify(referrerData),
      devices: JSON.stringify({
        desktop: Math.floor(views * 0.6),
        mobile: Math.floor(views * 0.3),
        tablet: Math.floor(views * 0.1),
      }),
      countries: JSON.stringify({
        Mexico: Math.floor(views * 0.4),
        'United States': Math.floor(views * 0.3),
        Spain: Math.floor(views * 0.2),
        Other: Math.floor(views * 0.1),
      }),
      created_at: new Date(
        date.getTime() + Math.random() * 24 * 60 * 60 * 1000
      ),
    });
  }

  return analytics;
}

/**
 * Seed portfolio analytics table
 */
export async function seedPortfolioAnalytics(
  client: any,
  options: SeedingOptions
): Promise<number> {
  const config = getSeedConfig(options.mode);
  const { analyticsDays } = config;

  logger.info(`Seeding portfolio analytics for ${analyticsDays} days...`);

  try {
    // Check for existing analytics
    const { count: existingCount } = await client
      .from('portfolio_analytics')
      .select('*', { count: 'exact', head: true });

    if (existingCount > 0 && options.skipExisting) {
      logger.info(
        `Portfolio analytics table already has ${existingCount} records, skipping`
      );
      return existingCount;
    }

    // Get all published portfolios
    const { data: portfolios, error: portfoliosError } = await client
      .from('portfolios')
      .select('id')
      .eq('status', 'published');

    if (portfoliosError || !portfolios) {
      throw new Error(
        `Failed to fetch portfolios: ${portfoliosError?.message}`
      );
    }

    if (portfolios.length === 0) {
      logger.warn(
        'No published portfolios found, skipping portfolio analytics seeding'
      );
      return 0;
    }

    // Generate analytics for all portfolios
    const allAnalytics = [];
    for (const portfolio of portfolios) {
      const analytics = generatePortfolioAnalytics(portfolio.id, analyticsDays);
      allAnalytics.push(...analytics);
    }

    // Insert analytics in batches
    const batchSize = options.batchSize || 50;
    let insertedCount = 0;

    for (let i = 0; i < allAnalytics.length; i += batchSize) {
      const batch = allAnalytics.slice(i, i + batchSize);

      const { data, error } = await client
        .from('portfolio_analytics')
        .insert(batch)
        .select('id');

      if (error) {
        logger.error(
          `Error inserting portfolio analytics batch ${i / batchSize + 1}:`,
          error
        );
        throw error;
      }

      insertedCount += data?.length || 0;
    }

    logger.info(
      `Successfully seeded ${insertedCount} portfolio analytics records`
    );
    return insertedCount;
  } catch (error) {
    logger.error(
      'Error seeding portfolio analytics:',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}
