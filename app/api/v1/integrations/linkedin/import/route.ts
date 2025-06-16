import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LinkedInClient } from '@/lib/services/integrations/linkedin/client';
import { LinkedInParser } from '@/lib/services/integrations/linkedin/parser';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/v1/integrations/linkedin/import
 * Import LinkedIn profile data and create/update portfolio
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { portfolioId, options = {} } = body;

    // Get LinkedIn connection
    const { data: connection, error: connectionError } = await supabase
      .from('linkedin_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'LinkedIn not connected' },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (new Date(connection.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'LinkedIn token expired' },
        { status: 401 }
      );
    }

    // Initialize LinkedIn client
    const linkedInClient = new LinkedInClient();

    try {
      // Fetch full profile
      const linkedInProfile = await linkedInClient.fetchFullProfile(
        connection.access_token
      );

      // Parse profile data
      const parsedProfile = LinkedInParser.parseProfile(linkedInProfile);

      if (!parsedProfile.success || !parsedProfile.data) {
        return NextResponse.json(
          { error: parsedProfile.error || 'Failed to parse profile' },
          { status: 400 }
        );
      }

      const profileData = parsedProfile.data;

      // If portfolioId is provided, update existing portfolio
      if (portfolioId) {
        // Verify user owns the portfolio
        const { data: portfolio, error: portfolioError } = await supabase
          .from('portfolios')
          .select('id')
          .eq('id', portfolioId)
          .eq('user_id', user.id)
          .single();

        if (portfolioError || !portfolio) {
          return NextResponse.json(
            { error: 'Portfolio not found' },
            { status: 404 }
          );
        }

        // Update portfolio with LinkedIn data based on options
        const updates: any = {};

        if (options.importBasicInfo !== false) {
          updates.title = profileData.title;
          updates.tagline = LinkedInParser.generateBio(linkedInProfile);
        }

        if (
          options.importExperience !== false &&
          profileData.experience.length > 0
        ) {
          updates.experience = profileData.experience;
        }

        if (
          options.importEducation !== false &&
          profileData.education.length > 0
        ) {
          updates.education = profileData.education;
        }

        if (options.importSkills !== false && profileData.skills.length > 0) {
          updates.skills = profileData.skills;
        }

        if (
          options.importProjects !== false &&
          profileData.projects.length > 0
        ) {
          updates.projects = profileData.projects;
        }

        if (
          options.importCertifications !== false &&
          profileData.certifications.length > 0
        ) {
          updates.certifications = profileData.certifications;
        }

        // Update portfolio
        const { error: updateError } = await supabase
          .from('portfolios')
          .update({
            ...updates,
            linkedin_imported_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', portfolioId);

        if (updateError) {
          logger.error('Failed to update portfolio:', updateError);
          return NextResponse.json(
            { error: 'Failed to update portfolio' },
            { status: 500 }
          );
        }

        // Update user profile if needed
        if (options.updateProfile !== false) {
          await supabase
            .from('profiles')
            .update({
              full_name: profileData.name,
              avatar_url: profileData.avatar,
              bio: profileData.bio,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);
        }

        return NextResponse.json({
          success: true,
          portfolioId,
          imported: {
            basicInfo: options.importBasicInfo !== false,
            experience:
              options.importExperience !== false &&
              profileData.experience.length > 0,
            education:
              options.importEducation !== false &&
              profileData.education.length > 0,
            skills:
              options.importSkills !== false && profileData.skills.length > 0,
            projects:
              options.importProjects !== false &&
              profileData.projects.length > 0,
            certifications:
              options.importCertifications !== false &&
              profileData.certifications.length > 0,
          },
        });
      } else {
        // Create new portfolio from LinkedIn data
        const { data: newPortfolio, error: createError } = await supabase
          .from('portfolios')
          .insert({
            user_id: user.id,
            title: profileData.title || 'My Portfolio',
            tagline: LinkedInParser.generateBio(linkedInProfile),
            is_published: false,
            template: 'modern', // Default template
            theme: 'light',
            personal_info: {
              name: profileData.name,
              email: profileData.email,
              location: profileData.location,
              avatar_url: profileData.avatar,
            },
            experience: profileData.experience,
            education: profileData.education,
            skills: profileData.skills,
            projects: profileData.projects,
            certifications: profileData.certifications,
            social_links: profileData.urls,
            linkedin_imported_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          logger.error('Failed to create portfolio:', createError);
          return NextResponse.json(
            { error: 'Failed to create portfolio' },
            { status: 500 }
          );
        }

        return NextResponse.json({
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
        });
      }
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
