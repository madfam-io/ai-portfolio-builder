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

import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { LinkedInClient } from '@/lib/services/integrations/linkedin/client';
import { LinkedInParser } from '@/lib/services/integrations/linkedin/parser';
import { type LinkedInFullProfile } from '@/lib/services/integrations/linkedin/types';
import { logger } from '@/lib/utils/logger';

interface ImportOptions {
  importBasicInfo?: boolean;
  importExperience?: boolean;
  importEducation?: boolean;
  importSkills?: boolean;
  importProjects?: boolean;
  importCertifications?: boolean;
  updateProfile?: boolean;
}

interface ProfileUpdates {
  title?: string;
  tagline?: string;
  experience?: unknown[];
  education?: unknown[];
  skills?: unknown[];
  projects?: unknown[];
  certifications?: unknown[];
  [key: string]: unknown;
}

// Helper to convert URLs object to array
function formatUrlsForPortfolio(urls: {
  linkedin?: string;
  website?: string;
  github?: string;
  twitter?: string;
}): string[] {
  const urlArray: string[] = [];
  if (urls.linkedin) urlArray.push(urls.linkedin);
  if (urls.website) urlArray.push(urls.website);
  if (urls.github) urlArray.push(urls.github);
  if (urls.twitter) urlArray.push(urls.twitter);
  return urlArray;
}

// Helper function to build portfolio updates based on options
function buildPortfolioUpdates(
  profileData: {
    title?: string;
    experience: unknown[];
    education: unknown[];
    skills: unknown[];
    projects: unknown[];
    certifications: unknown[];
    name?: string;
    avatar?: string;
    bio?: string;
    email?: string;
    location?: string;
    urls?: string[];
  },
  linkedInProfile: LinkedInFullProfile,
  options: ImportOptions
): ProfileUpdates {
  const updates: ProfileUpdates = {};

  if (options.importBasicInfo !== false) {
    updates.title = profileData.title;
    updates.tagline = LinkedInParser.generateBio(linkedInProfile);
  }

  if (options.importExperience !== false && profileData.experience.length > 0) {
    updates.experience = profileData.experience;
  }

  if (options.importEducation !== false && profileData.education.length > 0) {
    updates.education = profileData.education;
  }

  if (options.importSkills !== false && profileData.skills.length > 0) {
    updates.skills = profileData.skills;
  }

  if (options.importProjects !== false && profileData.projects.length > 0) {
    updates.projects = profileData.projects;
  }

  if (
    options.importCertifications !== false &&
    profileData.certifications.length > 0
  ) {
    updates.certifications = profileData.certifications;
  }

  return updates;
}

// Helper function to update existing portfolio
async function updateExistingPortfolio(params: {
  portfolioId: string;
  userId: string;
  profileData: {
    title?: string;
    experience: unknown[];
    education: unknown[];
    skills: unknown[];
    projects: unknown[];
    certifications: unknown[];
    name?: string;
    avatar?: string;
    bio?: string;
    email?: string;
    location?: string;
    urls?: string[];
  };
  linkedInProfile: LinkedInFullProfile;
  options: ImportOptions;
}) {
  const { portfolioId, userId, profileData, linkedInProfile, options } = params;

  // Verify user owns the portfolio
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id: portfolioId,
      userId: userId,
    },
    select: { id: true },
  });

  if (!portfolio) {
    return { error: 'Portfolio not found', status: 404 };
  }

  // Build updates based on options
  const updates = buildPortfolioUpdates(profileData, linkedInProfile, options);

  // Update portfolio
  try {
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        title: updates.title,
        bio: updates.tagline || '',
        experience: (updates.experience as any) || [],
        education: (updates.education as any) || [],
        skills: (updates.skills as any) || [],
        projects: (updates.projects as any) || [],
        certifications: (updates.certifications as any) || [],
        updatedAt: new Date(),
      },
    });
  } catch (updateError) {
    logger.error('Failed to update portfolio:', updateError as any);
    return { error: 'Failed to update portfolio', status: 500 };
  }

  // Update user profile if needed
  if (options.updateProfile !== false && profileData.name) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: profileData.name,
          image: profileData.avatar,
        },
      });
    } catch (error) {
      // Log but don't fail if user update fails
      logger.error('Failed to update user profile:', error as any);
    }
  }

  return {
    success: true,
    portfolioId,
    imported: {
      basicInfo: options.importBasicInfo !== false,
      experience:
        options.importExperience !== false && profileData.experience.length > 0,
      education:
        options.importEducation !== false && profileData.education.length > 0,
      skills: options.importSkills !== false && profileData.skills.length > 0,
      projects:
        options.importProjects !== false && profileData.projects.length > 0,
      certifications:
        options.importCertifications !== false &&
        profileData.certifications.length > 0,
    },
  };
}

// Helper function to create new portfolio
async function createNewPortfolio(params: {
  userId: string;
  profileData: {
    title?: string;
    experience: unknown[];
    education: unknown[];
    skills: unknown[];
    projects: unknown[];
    certifications: unknown[];
    name?: string;
    avatar?: string;
    bio?: string;
    email?: string;
    location?: string;
    urls?: string[];
  };
  linkedInProfile: LinkedInFullProfile;
}) {
  const { userId, profileData, linkedInProfile } = params;

  try {
    const newPortfolio = await prisma.portfolio.create({
      data: {
        userId: userId,
        name: profileData.name || 'My Portfolio',
        title: profileData.title || 'My Portfolio',
        bio: LinkedInParser.generateBio(linkedInProfile) || '',
        tagline: LinkedInParser.generateBio(linkedInProfile),
        avatarUrl: profileData.avatar,
        contact: {
          email: profileData.email,
          location: profileData.location,
        },
        social: {
          linkedin: profileData.urls?.[0],
        },
        experience: profileData.experience as any,
        education: profileData.education as any,
        skills: profileData.skills as any,
        projects: profileData.projects as any,
        certifications: profileData.certifications as any,
        template: 'DEVELOPER', // Default template
        status: 'DRAFT',
        seoKeywords: [],
      },
      select: { id: true },
    });

    return {
      success: true,
      portfolioId: newPortfolio.id,
      created: true,
      imported: {
        basicInfo: true,
        experience: profileData.experience.length > 0,
        education: profileData.education.length > 0,
        skills: profileData.skills.length > 0,
        projects: profileData.projects.length > 0,
        certifications: profileData.certifications.length > 0,
      },
    };
  } catch (createError) {
    logger.error('Failed to create portfolio:', createError as any);
    return { error: 'Failed to create portfolio', status: 500 };
  }
}

/**
 * POST /api/v1/integrations/linkedin/import
 * Import LinkedIn profile data and create/update portfolio
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { portfolioId, options = {} } = body;

    // Get LinkedIn connection from Account table
    const connection = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: 'linkedin',
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'LinkedIn not connected' },
        { status: 404 }
      );
    }

    // Check if token has expired
    const expiresAt = connection.expires_at
      ? new Date(connection.expires_at * 1000)
      : new Date(0);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'LinkedIn token expired' },
        { status: 401 }
      );
    }

    // Initialize LinkedIn client
    const linkedInClient = new LinkedInClient();

    try {
      // Fetch full profile
      const linkedInProfile: LinkedInFullProfile =
        await linkedInClient.fetchFullProfile(connection.access_token || '');

      // Parse profile data
      const parsedProfile = LinkedInParser.parseProfile(linkedInProfile);

      if (!parsedProfile.success || !parsedProfile.data) {
        return NextResponse.json(
          { error: parsedProfile.error || 'Failed to parse profile' },
          { status: 400 }
        );
      }

      const profileData = parsedProfile.data;

      // Convert URLs object to array format for portfolio
      const formattedProfileData = {
        ...profileData,
        urls: formatUrlsForPortfolio(profileData.urls),
      };

      // Handle portfolio update or creation
      let result;
      if (portfolioId) {
        result = await updateExistingPortfolio({
          portfolioId,
          userId: user.id,
          profileData: formattedProfileData,
          linkedInProfile,
          options,
        });
      } else {
        result = await createNewPortfolio({
          userId: user.id,
          profileData: formattedProfileData,
          linkedInProfile,
        });
      }

      // Handle errors from helper functions
      if ('error' in result && 'status' in result) {
        return NextResponse.json(
          { error: result.error },
          { status: result.status }
        );
      }

      return NextResponse.json(result);
    } catch (error) {
      logger.error(
        'LinkedIn import failed:',
        error instanceof Error ? error : new Error(String(error))
      );
      return NextResponse.json(
        { error: 'Failed to import LinkedIn data' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error(
      'LinkedIn import endpoint error:',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
