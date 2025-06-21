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

import { logger } from '@/lib/utils/logger';

import { getSeedConfig } from './index';

import type { SeedingOptions } from '@/lib/database/seeder';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * @fileoverview GitHub Integration and Repository Seed Data
 * @module data/seeds/github-data
 *
 * Generates realistic GitHub integration data and repository information.
 * Creates comprehensive repository data with commits, contributors, and metrics.
 */

// getUserTemplates imported but not used in current implementation
/**
 * GitHub integration templates
 */
const GITHUB_INTEGRATION_TEMPLATES = [
  {
    userId: '00000000-0000-0000-0000-000000000001',
    username: 'juan-dev-mx',
    accessToken: 'gho_dummy_token_1234567890',
    isActive: true,
  },
  {
    userId: '00000000-0000-0000-0000-000000000002',
    username: 'maria-design',
    accessToken: 'gho_dummy_token_0987654321',
    isActive: true,
  },
  {
    userId: '00000000-0000-0000-0000-000000000004',
    username: 'sarah-johnson-dev',
    accessToken: 'gho_dummy_token_1122334455',
    isActive: true,
  },
];

interface RepositoryTemplate {
  name: string;
  fullName: string;
  description: string;
  language: string;
  isPrivate: boolean;
  stars: number;
  forks: number;
  openIssues: number;
  size: number;
  topics: string[];
  locByLanguage?: Record<string, number>;
}

/**
 * Repository templates with realistic data
 */
const REPOSITORY_TEMPLATES: RepositoryTemplate[] = [
  {
    name: 'ecommerce-platform',
    fullName: 'juan-dev-mx/ecommerce-platform',
    description: 'Full-stack e-commerce platform built with React and Node.js',
    language: 'JavaScript',
    isPrivate: false,
    stars: 45,
    forks: 12,
    openIssues: 3,
    size: 15420,
    locByLanguage: {
      JavaScript: 8500,
      TypeScript: 4200,
      CSS: 1800,
      HTML: 920,
    },
    topics: ['ecommerce', 'react', 'nodejs', 'postgresql', 'stripe'],
  },
  {
    name: 'task-manager-app',
    fullName: 'juan-dev-mx/task-manager-app',
    description:
      'Collaborative task management application with real-time updates',
    language: 'Vue',
    isPrivate: false,
    stars: 23,
    forks: 7,
    openIssues: 1,
    size: 8340,
    locByLanguage: {
      Vue: 5200,
      JavaScript: 2100,
      CSS: 840,
      HTML: 200,
    },
    topics: ['vue', 'firebase', 'realtime', 'collaboration'],
  },
  {
    name: 'design-system',
    fullName: 'maria-design/design-system',
    description: 'Comprehensive design system and component library',
    language: 'TypeScript',
    isPrivate: false,
    stars: 78,
    forks: 19,
    openIssues: 5,
    size: 12800,
    locByLanguage: {
      TypeScript: 7800,
      CSS: 3200,
      SCSS: 1500,
      MDX: 300,
    },
    topics: ['design-system', 'react', 'storybook', 'typescript'],
  },
  {
    name: 'ux-research-tools',
    fullName: 'maria-design/ux-research-tools',
    description: 'Collection of UX research tools and templates',
    language: 'JavaScript',
    isPrivate: true,
    stars: 12,
    forks: 3,
    openIssues: 2,
    size: 5600,
    locByLanguage: {
      JavaScript: 3400,
      HTML: 1200,
      CSS: 800,
      JSON: 200,
    },
    topics: ['ux', 'research', 'templates', 'figma'],
  },
  {
    name: 'scalable-api',
    fullName: 'sarah-johnson-dev/scalable-api',
    description: 'Highly scalable REST API with microservices architecture',
    language: 'Go',
    isPrivate: false,
    stars: 156,
    forks: 34,
    openIssues: 8,
    size: 28900,
    locByLanguage: {
      Go: 18500,
      Docker: 2400,
      Makefile: 1200,
      YAML: 800,
      Shell: 600,
    },
    topics: ['go', 'microservices', 'docker', 'kubernetes', 'api'],
  },
];

/**
 * Generate GitHub integration for a user
 */
function generateGitHubIntegration(userId: string, index: number): unknown {
  const template = GITHUB_INTEGRATION_TEMPLATES.find(t => t.userId === userId);

  if (template) {
    return {
      id: `gh-integration-${userId}`,
      user_id: userId,
      github_id: Math.floor(Math.random() * 1000000) + 100000,
      username: template.username,
      access_token: template.accessToken, // In production, this would be encrypted
      refresh_token: `ghr_dummy_refresh_${Math.random().toString(36).substring(7)}`,
      scope: 'read:user,repo,read:org',
      token_type: 'bearer',
      is_active: template.isActive,
      last_synced_at: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      created_at: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ),
      updated_at: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ),
    };
  }

  // Generate for other users
  const username = `user-${index}-dev`;
  return {
    id: `gh-integration-${userId}`,
    user_id: userId,
    github_id: Math.floor(Math.random() * 1000000) + 100000,
    username,
    access_token: `gho_dummy_token_${Math.random().toString(36).substring(7)}`,
    refresh_token: `ghr_dummy_refresh_${Math.random().toString(36).substring(7)}`,
    scope: 'read:user,repo',
    token_type: 'bearer',
    is_active: Math.random() > 0.2, // 80% active
    last_synced_at: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    created_at: new Date(
      Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000
    ),
    updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  };
}

/**
 * Generate repository data
 */
function generateRepository(
  integrationId: string,
  userId: string,
  index: number,
  template?: RepositoryTemplate
): unknown {
  const languages = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Go',
    'Rust',
    'Java',
  ];
  const frameworks = [
    'react',
    'vue',
    'angular',
    'nextjs',
    'express',
    'fastapi',
  ];
  const topics = ['web', 'api', 'frontend', 'backend', 'fullstack', 'mobile'];

  const repoTemplate: RepositoryTemplate = template || {
    name: `project-${index}`,
    fullName: `user/project-${index}`,
    description: `Project ${index} description`,
    language: languages[index % languages.length] || 'JavaScript',
    isPrivate: Math.random() > 0.7,
    stars: Math.floor(Math.random() * 100),
    forks: Math.floor(Math.random() * 20),
    openIssues: Math.floor(Math.random() * 10),
    size: Math.floor(Math.random() * 50000) + 1000,
    topics: [
      frameworks[index % frameworks.length] || 'web',
      topics[index % topics.length] || 'fullstack',
      topics[(index + 1) % topics.length] || 'api',
    ],
  };

  // Generate realistic LOC distribution
  const totalLoc = repoTemplate.locByLanguage
    ? Object.values(repoTemplate.locByLanguage).reduce(
        (sum: number, lines: number) => sum + lines,
        0
      )
    : Math.floor(Math.random() * 20000) + 5000;

  const locByLanguage = repoTemplate.locByLanguage || {
    [repoTemplate.language]: totalLoc,
  };

  return {
    id: `repo-${integrationId}-${index}`,
    github_integration_id: integrationId,
    user_id: userId,
    github_id: Math.floor(Math.random() * 1000000000) + 100000000,
    name: repoTemplate.name,
    full_name: repoTemplate.fullName,
    description: repoTemplate.description,
    html_url: `https://github.com/${repoTemplate.fullName}`,
    clone_url: `https://github.com/${repoTemplate.fullName}.git`,
    ssh_url: `git@github.com:${repoTemplate.fullName}.git`,
    owner: repoTemplate.fullName.split('/')[0],
    default_branch: 'main',
    language: repoTemplate.language,
    languages: JSON.stringify(locByLanguage),
    topics: JSON.stringify(repoTemplate.topics || []),
    is_private: repoTemplate.isPrivate || false,
    is_fork: Math.random() > 0.85,
    is_archived: false,
    is_disabled: false,
    has_issues: true,
    has_projects: Math.random() > 0.3,
    has_wiki: Math.random() > 0.5,
    has_pages: Math.random() > 0.7,
    stars_count: repoTemplate.stars || 0,
    watchers_count: Math.floor((repoTemplate.stars || 0) * 1.2),
    forks_count: repoTemplate.forks || 0,
    open_issues_count: repoTemplate.openIssues || 0,
    size: repoTemplate.size || 0,
    pushed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    created_at: new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
    ),
    updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    last_synced_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
    is_active: true,
  };
}

/**
 * Seed GitHub integrations table
 */
export async function seedGitHubIntegrations(
  client: SupabaseClient,
  options: SeedingOptions
): Promise<number> {
  logger.info('Seeding GitHub integrations...');

  try {
    // Check for existing integrations
    const { count: existingCount } = await client
      .from('github_integrations')
      .select('*', { count: 'exact', head: true });

    if (existingCount && existingCount > 0 && options.skipExisting) {
      logger.info(
        `GitHub integrations table already has ${existingCount} records, skipping`
      );
      return existingCount;
    }

    // Get all users to create integrations for
    const { data: users, error: usersError } = await client
      .from('users')
      .select('id');

    if (usersError || !users) {
      throw new Error(`Failed to fetch users: ${usersError?.message}`);
    }

    if (users.length === 0) {
      logger.warn('No users found, skipping GitHub integrations seeding');
      return 0;
    }

    // Generate integrations (not all users will have GitHub integrations)
    const integrations = [];
    const integrationChance = 0.6; // 60% of users have GitHub integrations

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      if (!user) continue;

      if (
        Math.random() < integrationChance ||
        i < GITHUB_INTEGRATION_TEMPLATES.length
      ) {
        const integration = generateGitHubIntegration(user.id, i);
        integrations.push(integration);
      }
    }

    // Insert integrations in batches
    const batchSize = options.batchSize || 10;
    let insertedCount = 0;

    for (let i = 0; i < integrations.length; i += batchSize) {
      const batch = integrations.slice(i, i + batchSize);

      const { data, error } = await client
        .from('github_integrations')
        .insert(batch)
        .select('id');

      if (error) {
        logger.error(
          `Error inserting GitHub integration batch ${i / batchSize + 1}:`,
          error
        );
        throw error;
      }

      insertedCount += data?.length || 0;
    }

    logger.info(`Successfully seeded ${insertedCount} GitHub integrations`);
    return insertedCount;
  } catch (error) {
    logger.error(
      'Error seeding GitHub integrations:',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Seed repositories table
 */
export async function seedRepositories(
  client: SupabaseClient,
  options: SeedingOptions
): Promise<number> {
  const config = getSeedConfig(options.mode);
  const { repositoriesPerUser } = config;

  logger.info(
    `Seeding repositories (${repositoriesPerUser} per integration)...`
  );

  try {
    // Check for existing repositories
    const { count: existingCount } = await client
      .from('repositories')
      .select('*', { count: 'exact', head: true });

    if (existingCount && existingCount > 0 && options.skipExisting) {
      logger.info(
        `Repositories table already has ${existingCount} records, skipping`
      );
      return existingCount;
    }

    // Get all GitHub integrations
    const { data: integrations, error: integrationsError } = await client
      .from('github_integrations')
      .select('id, user_id, username')
      .eq('is_active', true);

    if (integrationsError || !integrations) {
      throw new Error(
        `Failed to fetch GitHub integrations: ${integrationsError?.message}`
      );
    }

    if (integrations.length === 0) {
      logger.warn(
        'No GitHub integrations found, skipping repositories seeding'
      );
      return 0;
    }

    // Generate repositories
    const repositories = [];
    let templateIndex = 0;

    for (const integration of integrations) {
      for (let repoIndex = 0; repoIndex < repositoriesPerUser; repoIndex++) {
        // Use template for first few repositories
        const template =
          templateIndex < REPOSITORY_TEMPLATES.length
            ? REPOSITORY_TEMPLATES[templateIndex]
            : undefined;

        const repository = generateRepository(
          integration.id,
          integration.user_id,
          repoIndex,
          template
        );

        repositories.push(repository);
        templateIndex++;
      }
    }

    // Insert repositories in batches
    const batchSize = options.batchSize || 10;
    let insertedCount = 0;

    for (let i = 0; i < repositories.length; i += batchSize) {
      const batch = repositories.slice(i, i + batchSize);

      const { data, error } = await client
        .from('repositories')
        .insert(batch)
        .select('id');

      if (error) {
        logger.error(
          `Error inserting repository batch ${i / batchSize + 1}:`,
          error
        );
        throw error;
      }

      insertedCount += data?.length || 0;
    }

    logger.info(`Successfully seeded ${insertedCount} repositories`);
    return insertedCount;
  } catch (error) {
    logger.error(
      'Error seeding repositories:',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Combined seeding function for GitHub data
 */
export async function seedGitHubData(
  client: SupabaseClient,
  options: SeedingOptions
): Promise<number> {
  let totalCount = 0;

  // Seed integrations first
  totalCount += await seedGitHubIntegrations(client, options);

  // Then seed repositories
  totalCount += await seedRepositories(client, options);

  return totalCount;
}
