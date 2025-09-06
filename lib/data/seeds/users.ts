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

import { logger } from '@/lib/utils/logger';

import { getSeedConfig } from './index';

import type { SeedingOptions } from '@/lib/database/seeder';
import type { PrismaClient } from '@prisma/client';

/**
 * @fileoverview User Seed Data
 * @module data/seeds/users
 *
 * Generates realistic user accounts for development and testing.
 * Includes users across all subscription tiers with proper relationships.
 */

/**
 * Predefined user templates for consistent testing
 */
const USER_TEMPLATES = [
  {
    email: 'john.developer@example.com',
    full_name: 'John Martinez',
    subscription_tier: 'free',
    preferred_language: 'es',
    preferred_currency: 'MXN',
    timezone: 'America/Mexico_City',
    profile: {
      title: 'Full Stack Developer',
      bio: 'Desarrollador apasionado con 5+ años de experiencia en aplicaciones web modernas.',
      location: 'Ciudad de México, México',
      avatar_url: 'https://i.pravatar.cc/150?img=1',
    },
  },
  {
    email: 'maria.designer@example.com',
    full_name: 'María González',
    subscription_tier: 'pro',
    preferred_language: 'es',
    preferred_currency: 'MXN',
    timezone: 'America/Mexico_City',
    profile: {
      title: 'UX/UI Designer',
      bio: 'Diseñadora creativa especializada en experiencias de usuario que conectan.',
      location: 'Guadalajara, México',
      avatar_url: 'https://i.pravatar.cc/150?img=2',
    },
  },
  {
    email: 'carlos.consultant@example.com',
    full_name: 'Carlos Hernández',
    subscription_tier: 'business',
    preferred_language: 'es',
    preferred_currency: 'MXN',
    timezone: 'America/Mexico_City',
    profile: {
      title: 'Business Consultant',
      bio: 'Consultor estratégico ayudando a empresas a transformar sus operaciones.',
      location: 'Monterrey, México',
      avatar_url: 'https://i.pravatar.cc/150?img=3',
    },
  },
  {
    email: 'sarah.developer@example.com',
    full_name: 'Sarah Johnson',
    subscription_tier: 'pro',
    preferred_language: 'en',
    preferred_currency: 'USD',
    timezone: 'America/New_York',
    profile: {
      title: 'Senior Software Engineer',
      bio: 'Passionate about building scalable applications and mentoring developers.',
      location: 'Austin, TX, USA',
      avatar_url: 'https://i.pravatar.cc/150?img=4',
    },
  },
  {
    email: 'alex.designer@example.com',
    full_name: 'Alex Chen',
    subscription_tier: 'free',
    preferred_language: 'en',
    preferred_currency: 'USD',
    timezone: 'America/Los_Angeles',
    profile: {
      title: 'Product Designer',
      bio: 'Creating beautiful and intuitive user experiences for digital products.',
      location: 'San Francisco, CA, USA',
      avatar_url: 'https://i.pravatar.cc/150?img=5',
    },
  },
  {
    email: 'emma.consultant@example.com',
    full_name: 'Emma Wilson',
    subscription_tier: 'business',
    preferred_language: 'en',
    preferred_currency: 'USD',
    timezone: 'America/New_York',
    profile: {
      title: 'Digital Marketing Consultant',
      bio: 'Helping businesses grow through strategic digital marketing initiatives.',
      location: 'New York, NY, USA',
      avatar_url: 'https://i.pravatar.cc/150?img=6',
    },
  },
];

/**
 * Generate additional users beyond templates
 */
function generateUser(index: number): any {
  const languages = ['es', 'en'];
  const currencies = ['MXN', 'USD', 'EUR'];
  const tiers = ['FREE', 'PRO', 'BUSINESS'];
  const timezones = [
    'America/Mexico_City',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/Madrid',
    'Europe/London',
  ];

  const language = languages[index % languages.length];
  const isSpanish = language === 'es';

  const names = isSpanish
    ? ['Ana', 'Luis', 'Carmen', 'Diego', 'Isabel', 'Miguel', 'Sofía', 'Pablo']
    : [
        'David',
        'Lisa',
        'Michael',
        'Jennifer',
        'Robert',
        'Amanda',
        'Daniel',
        'Michelle',
      ];

  const lastNames = isSpanish
    ? [
        'García',
        'Rodríguez',
        'López',
        'Martínez',
        'Sánchez',
        'Pérez',
        'González',
        'Fernández',
      ]
    : [
        'Smith',
        'Johnson',
        'Williams',
        'Brown',
        'Jones',
        'Garcia',
        'Miller',
        'Davis',
      ];

  const firstName = names[index % names.length];
  const lastName =
    lastNames[Math.floor(index / names.length) % lastNames.length];

  if (!firstName || !lastName) {
    throw new Error('Failed to generate user name');
  }

  return {
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`,
    full_name: `${firstName} ${lastName}`,
    subscription_tier: tiers[index % tiers.length],
    preferred_language: language,
    preferred_currency:
      language === 'es' ? 'MXN' : currencies[index % currencies.length],
    timezone: timezones[index % timezones.length],
    profile: {
      title: isSpanish ? 'Profesional' : 'Professional',
      bio: isSpanish
        ? 'Profesional experimentado buscando nuevas oportunidades.'
        : 'Experienced professional seeking new opportunities.',
      location: isSpanish ? 'México' : 'United States',
      avatar_url: `https://i.pravatar.cc/150?img=${(index % 50) + 10}`,
    },
  };
}

/**
 * Seed users table with realistic test data
 */
export async function seedUsers(
  client: PrismaClient,
  options: SeedingOptions
): Promise<number> {
  const config = getSeedConfig(options.mode);
  const { usersCount } = config;

  logger.info(`Seeding ${usersCount} users...`);

  try {
    // Check for existing users
    const existingCount = await client.user.count();

    if (existingCount && existingCount > 0 && options.skipExisting) {
      logger.info(`Users table already has ${existingCount} records, skipping`);
      return existingCount || 0;
    }

    // Prepare user data
    const users = [];

    // Add predefined templates first
    for (let i = 0; i < Math.min(USER_TEMPLATES.length, usersCount); i++) {
      const template = USER_TEMPLATES[i];
      if (!template) continue;

      users.push({
        // id: `00000000-0000-0000-0000-00000000000${i + 1}`, // Prisma auto-generates IDs
        email: template.email,
        name: template.full_name,
        image: template.profile.avatar_url,
        subscriptionTier: template.subscription_tier.toUpperCase() as any,
        subscriptionStatus: 'ACTIVE' as any,
        subscriptionExpiresAt: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ), // 1 year from now
        portfolioCount: 0,
        aiRequestsCount: Math.floor(Math.random() * 50),
        aiRequestsResetAt: new Date(),
        preferredLanguage: template.preferred_language,
        preferredCurrency: template.preferred_currency,
        timezone: template.timezone,
        // createdAt and updatedAt are auto-managed by Prisma
      });
    }

    // Generate additional users if needed
    for (let i = USER_TEMPLATES.length; i < usersCount; i++) {
      const userData = generateUser(i);
      users.push({
        // id: `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`, // Prisma auto-generates IDs
        email: userData.email,
        name: userData.full_name,
        image: (userData.profile as { avatar_url: string }).avatar_url,
        subscriptionTier: (userData.subscription_tier as string).toUpperCase() as any,
        subscriptionStatus: 'ACTIVE' as any,
        subscriptionExpiresAt: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ),
        portfolioCount: 0,
        aiRequestsCount: Math.floor(Math.random() * 30),
        aiRequestsResetAt: new Date(),
        preferredLanguage: userData.preferred_language,
        preferredCurrency: userData.preferred_currency,
        timezone: userData.timezone,
        // createdAt and updatedAt are auto-managed by Prisma
      });
    }

    // Insert users in batches
    const batchSize = options.batchSize || 10;
    let insertedCount = 0;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      try {
        const result = await client.user.createMany({
          data: batch,
        });
        insertedCount += result.count;
      } catch (error) {
        logger.error(
          `Error inserting user batch ${i / batchSize + 1}:`,
          error as Error
        );
        throw error;
      }
    }

    logger.info(`Successfully seeded ${insertedCount} users`);
    return insertedCount;
  } catch (error) {
    logger.error(
      'Error seeding users:',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Get user templates for referencing in other seeds
 */
export function getUserTemplates() {
  return USER_TEMPLATES.map((template, index) => ({
    ...template,
    id: `00000000-0000-0000-0000-00000000000${index + 1}`,
  }));
}
