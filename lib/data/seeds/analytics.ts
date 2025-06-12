/**
 * @fileoverview Analytics and Metrics Seed Data
 * @module data/seeds/analytics
 * 
 * Generates realistic analytics data including portfolio views, code metrics,
 * commit analytics, pull requests, and performance metrics.
 */

import { logger } from '@/lib/utils/logger';
import { getSeedConfig } from './index';
import type { SeedingOptions } from '@/lib/database/seeder';

/**
 * Generate code metrics for a repository
 */
function generateCodeMetrics(repositoryId: string, daysBack: number): any[] {
  const metrics = [];
  const languages = {
    'JavaScript': Math.floor(Math.random() * 10000) + 5000,
    'TypeScript': Math.floor(Math.random() * 8000) + 3000,
    'CSS': Math.floor(Math.random() * 2000) + 500,
    'HTML': Math.floor(Math.random() * 1000) + 200,
  };

  const totalLoc = Object.values(languages).reduce((sum, lines) => sum + lines, 0);

  // Generate metrics for the last N days
  for (let i = 0; i < daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Add some variance to the metrics over time
    const variance = 1 + (Math.random() - 0.5) * 0.1; // ±5% variance
    const currentLoc = Math.floor(totalLoc * variance);
    
    // Adjust languages proportionally
    const adjustedLanguages: { [key: string]: number } = {};
    Object.entries(languages).forEach(([lang, lines]) => {
      adjustedLanguages[lang] = Math.floor(lines * variance);
    });

    metrics.push({
      id: `metrics-${repositoryId}-${dateString}`,
      repository_id: repositoryId,
      metric_date: dateString,
      loc_total: currentLoc,
      loc_by_language: JSON.stringify(adjustedLanguages),
      file_count: Object.keys(languages).length + Math.floor(Math.random() * 10),
      commit_count: Math.floor(Math.random() * 20) + 1,
      contributor_count: Math.floor(Math.random() * 5) + 1,
      commits_last_30_days: Math.floor(Math.random() * 100) + 10,
      contributors_last_30_days: Math.floor(Math.random() * 8) + 1,
      calculated_at: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
    });
  }

  return metrics;
}

/**
 * Generate commit analytics for a repository
 */
function generateCommitAnalytics(repositoryId: string, daysBack: number): any[] {
  const analytics = [];

  for (let i = 0; i < daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Skip some days to make it realistic (not every day has commits)
    if (Math.random() < 0.3) continue; // 70% of days have commits

    const commitCount = Math.floor(Math.random() * 15) + 1;
    const uniqueAuthors = Math.min(commitCount, Math.floor(Math.random() * 4) + 1);
    const additions = Math.floor(Math.random() * 500) + 50;
    const deletions = Math.floor(Math.random() * 200) + 10;
    const peakHour = Math.floor(Math.random() * 24); // Random peak hour

    analytics.push({
      id: `commit-analytics-${repositoryId}-${dateString}`,
      repository_id: repositoryId,
      commit_date: dateString,
      commit_count: commitCount,
      unique_authors: uniqueAuthors,
      additions,
      deletions,
      peak_hour: peakHour,
      created_at: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
    });
  }

  return analytics;
}

/**
 * Generate pull requests for a repository
 */
function generatePullRequests(repositoryId: string, count: number): any[] {
  const states = ['open', 'closed', 'merged'];
  const titles = [
    'Add new feature for user authentication',
    'Fix bug in data validation',
    'Improve performance of API endpoints',
    'Update documentation',
    'Refactor component structure',
    'Add unit tests for core functionality',
    'Fix security vulnerability',
    'Optimize database queries',
    'Update dependencies',
    'Improve error handling',
  ];

  const pullRequests = [];

  for (let i = 0; i < count; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    const state = states[Math.floor(Math.random() * states.length)];
    
    // Generate realistic timing
    let mergedAt = null;
    let closedAt = null;
    let cycleTimeHours = null;
    let leadTimeHours = null;

    if (state === 'merged' || state === 'closed') {
      const closeTime = new Date(createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
      if (state === 'merged') {
        mergedAt = closeTime;
        cycleTimeHours = Math.floor((closeTime.getTime() - createdAt.getTime()) / (60 * 60 * 1000));
        leadTimeHours = cycleTimeHours + Math.floor(Math.random() * 48); // Add review time
      } else {
        closedAt = closeTime;
        cycleTimeHours = Math.floor((closeTime.getTime() - createdAt.getTime()) / (60 * 60 * 1000));
      }
    }

    pullRequests.push({
      id: `pr-${repositoryId}-${i}`,
      repository_id: repositoryId,
      pr_number: i + 1,
      title: titles[i % titles.length],
      body: `Description for pull request ${i + 1}`,
      state,
      author: `contributor-${Math.floor(Math.random() * 5) + 1}`,
      assignees: JSON.stringify([]),
      reviewers: JSON.stringify([`reviewer-${Math.floor(Math.random() * 3) + 1}`]),
      labels: JSON.stringify(['enhancement', 'feature'].slice(0, Math.floor(Math.random() * 2) + 1)),
      additions: Math.floor(Math.random() * 300) + 10,
      deletions: Math.floor(Math.random() * 100) + 5,
      changed_files: Math.floor(Math.random() * 10) + 1,
      commits: Math.floor(Math.random() * 8) + 1,
      comments: Math.floor(Math.random() * 15),
      review_comments: Math.floor(Math.random() * 8),
      cycle_time_hours: cycleTimeHours,
      lead_time_hours: leadTimeHours,
      created_at: createdAt,
      updated_at: new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      merged_at: mergedAt,
      closed_at: closedAt,
    });
  }

  return pullRequests;
}

/**
 * Generate portfolio analytics
 */
function generatePortfolioAnalytics(portfolioId: string, daysBack: number): any[] {
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
        'Mexico': Math.floor(views * 0.4),
        'United States': Math.floor(views * 0.3),
        'Spain': Math.floor(views * 0.2),
        'Other': Math.floor(views * 0.1),
      }),
      created_at: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
    });
  }

  return analytics;
}

/**
 * Seed code metrics table
 */
export async function seedCodeMetrics(client: any, options: SeedingOptions): Promise<number> {
  const config = getSeedConfig(options.mode);
  const { analyticsDays } = config;

  logger.info(`Seeding code metrics for ${analyticsDays} days...`);

  try {
    // Check for existing metrics
    const { count: existingCount } = await client
      .from('code_metrics')
      .select('*', { count: 'exact', head: true });

    if (existingCount > 0 && options.skipExisting) {
      logger.info(`Code metrics table already has ${existingCount} records, skipping`);
      return existingCount;
    }

    // Get all repositories
    const { data: repositories, error: reposError } = await client
      .from('repositories')
      .select('id')
      .eq('is_active', true);

    if (reposError || !repositories) {
      throw new Error(`Failed to fetch repositories: ${reposError?.message}`);
    }

    if (repositories.length === 0) {
      logger.warn('No repositories found, skipping code metrics seeding');
      return 0;
    }

    // Generate metrics for all repositories
    const allMetrics = [];
    for (const repo of repositories) {
      const metrics = generateCodeMetrics(repo.id, analyticsDays);
      allMetrics.push(...metrics);
    }

    // Insert metrics in batches
    const batchSize = options.batchSize || 50;
    let insertedCount = 0;

    for (let i = 0; i < allMetrics.length; i += batchSize) {
      const batch = allMetrics.slice(i, i + batchSize);
      
      const { data, error } = await client
        .from('code_metrics')
        .insert(batch)
        .select('id');

      if (error) {
        logger.error(`Error inserting code metrics batch ${i / batchSize + 1}:`, error);
        throw error;
      }

      insertedCount += data?.length || 0;
    }

    logger.info(`Successfully seeded ${insertedCount} code metrics records`);
    return insertedCount;

  } catch (error) {
    logger.error('Error seeding code metrics:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Seed commit analytics table
 */
export async function seedCommitAnalytics(client: any, options: SeedingOptions): Promise<number> {
  const config = getSeedConfig(options.mode);
  const { analyticsDays } = config;

  logger.info(`Seeding commit analytics for ${analyticsDays} days...`);

  try {
    // Check for existing analytics
    const { count: existingCount } = await client
      .from('commit_analytics')
      .select('*', { count: 'exact', head: true });

    if (existingCount > 0 && options.skipExisting) {
      logger.info(`Commit analytics table already has ${existingCount} records, skipping`);
      return existingCount;
    }

    // Get all repositories
    const { data: repositories, error: reposError } = await client
      .from('repositories')
      .select('id')
      .eq('is_active', true);

    if (reposError || !repositories) {
      throw new Error(`Failed to fetch repositories: ${reposError?.message}`);
    }

    if (repositories.length === 0) {
      logger.warn('No repositories found, skipping commit analytics seeding');
      return 0;
    }

    // Generate analytics for all repositories
    const allAnalytics = [];
    for (const repo of repositories) {
      const analytics = generateCommitAnalytics(repo.id, analyticsDays);
      allAnalytics.push(...analytics);
    }

    // Insert analytics in batches
    const batchSize = options.batchSize || 50;
    let insertedCount = 0;

    for (let i = 0; i < allAnalytics.length; i += batchSize) {
      const batch = allAnalytics.slice(i, i + batchSize);
      
      const { data, error } = await client
        .from('commit_analytics')
        .insert(batch)
        .select('id');

      if (error) {
        logger.error(`Error inserting commit analytics batch ${i / batchSize + 1}:`, error);
        throw error;
      }

      insertedCount += data?.length || 0;
    }

    logger.info(`Successfully seeded ${insertedCount} commit analytics records`);
    return insertedCount;

  } catch (error) {
    logger.error('Error seeding commit analytics:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Seed pull requests table
 */
export async function seedPullRequests(client: any, options: SeedingOptions): Promise<number> {
  logger.info('Seeding pull requests...');

  try {
    // Check for existing pull requests
    const { count: existingCount } = await client
      .from('pull_requests')
      .select('*', { count: 'exact', head: true });

    if (existingCount > 0 && options.skipExisting) {
      logger.info(`Pull requests table already has ${existingCount} records, skipping`);
      return existingCount;
    }

    // Get all repositories
    const { data: repositories, error: reposError } = await client
      .from('repositories')
      .select('id')
      .eq('is_active', true);

    if (reposError || !repositories) {
      throw new Error(`Failed to fetch repositories: ${reposError?.message}`);
    }

    if (repositories.length === 0) {
      logger.warn('No repositories found, skipping pull requests seeding');
      return 0;
    }

    // Generate pull requests for all repositories
    const allPullRequests = [];
    for (const repo of repositories) {
      const prCount = Math.floor(Math.random() * 10) + 5; // 5-15 PRs per repo
      const pullRequests = generatePullRequests(repo.id, prCount);
      allPullRequests.push(...pullRequests);
    }

    // Insert pull requests in batches
    const batchSize = options.batchSize || 20;
    let insertedCount = 0;

    for (let i = 0; i < allPullRequests.length; i += batchSize) {
      const batch = allPullRequests.slice(i, i + batchSize);
      
      const { data, error } = await client
        .from('pull_requests')
        .insert(batch)
        .select('id');

      if (error) {
        logger.error(`Error inserting pull requests batch ${i / batchSize + 1}:`, error);
        throw error;
      }

      insertedCount += data?.length || 0;
    }

    logger.info(`Successfully seeded ${insertedCount} pull requests`);
    return insertedCount;

  } catch (error) {
    logger.error('Error seeding pull requests:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Seed portfolio analytics table
 */
export async function seedPortfolioAnalytics(client: any, options: SeedingOptions): Promise<number> {
  const config = getSeedConfig(options.mode);
  const { analyticsDays } = config;

  logger.info(`Seeding portfolio analytics for ${analyticsDays} days...`);

  try {
    // Check for existing analytics
    const { count: existingCount } = await client
      .from('portfolio_analytics')
      .select('*', { count: 'exact', head: true });

    if (existingCount > 0 && options.skipExisting) {
      logger.info(`Portfolio analytics table already has ${existingCount} records, skipping`);
      return existingCount;
    }

    // Get all published portfolios
    const { data: portfolios, error: portfoliosError } = await client
      .from('portfolios')
      .select('id')
      .eq('status', 'published');

    if (portfoliosError || !portfolios) {
      throw new Error(`Failed to fetch portfolios: ${portfoliosError?.message}`);
    }

    if (portfolios.length === 0) {
      logger.warn('No published portfolios found, skipping portfolio analytics seeding');
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
        logger.error(`Error inserting portfolio analytics batch ${i / batchSize + 1}:`, error);
        throw error;
      }

      insertedCount += data?.length || 0;
    }

    logger.info(`Successfully seeded ${insertedCount} portfolio analytics records`);
    return insertedCount;

  } catch (error) {
    logger.error('Error seeding portfolio analytics:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Combined seeding function for all analytics
 */
export async function seedAnalytics(client: any, options: SeedingOptions): Promise<number> {
  let totalCount = 0;
  
  // Seed in dependency order
  totalCount += await seedCodeMetrics(client, options);
  totalCount += await seedCommitAnalytics(client, options);
  totalCount += await seedPullRequests(client, options);
  totalCount += await seedPortfolioAnalytics(client, options);
  
  return totalCount;
}