import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LinkedInClient } from '@/lib/services/integrations/linkedin/client';
import { LinkedInParser } from '@/lib/services/integrations/linkedin/parser';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/v1/integrations/linkedin/profile
 * Fetch LinkedIn profile data for authenticated user
 */
export async function GET(request: NextRequest) {
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
      // TODO: Implement token refresh if refresh token is available
      return NextResponse.json(
        { error: 'LinkedIn token expired' },
        { status: 401 }
      );
    }

    // Initialize LinkedIn client
    const linkedInClient = new LinkedInClient();

    // Fetch full profile
    try {
      const linkedInProfile = await linkedInClient.fetchFullProfile(
        connection.access_token
      );

      // Parse profile data into portfolio format
      const parsedProfile = LinkedInParser.parseProfile(linkedInProfile);

      if (!parsedProfile.success) {
        return NextResponse.json(
          { error: parsedProfile.error || 'Failed to parse profile' },
          { status: 400 }
        );
      }

      // Update last sync timestamp
      await supabase
        .from('linkedin_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('user_id', user.id);

      return NextResponse.json({
        success: true,
        data: parsedProfile.data,
        lastSync: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('LinkedIn profile fetch failed:', error);
      return NextResponse.json(
        { error: 'Failed to fetch LinkedIn profile' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('LinkedIn profile endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/integrations/linkedin/profile
 * Disconnect LinkedIn integration
 */
export async function DELETE(request: NextRequest) {
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

    // Get LinkedIn connection
    const { data: connection, error: connectionError } = await supabase
      .from('linkedin_connections')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'LinkedIn not connected' },
        { status: 404 }
      );
    }

    // Revoke access (LinkedIn doesn't support programmatic revocation)
    const linkedInClient = new LinkedInClient();
    await linkedInClient.revokeAccess(connection.access_token);

    // Delete connection from database
    const { error: deleteError } = await supabase
      .from('linkedin_connections')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      logger.error('Failed to delete LinkedIn connection:', deleteError);
      return NextResponse.json(
        { error: 'Failed to disconnect LinkedIn' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'LinkedIn disconnected successfully',
    });
  } catch (error) {
    logger.error('LinkedIn disconnect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
