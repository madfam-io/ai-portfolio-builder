/**
 * Portfolio Preview API
 * Generates live preview HTML for portfolio editor
 */

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { transformDbPortfolioToApi } from '@/lib/utils/portfolio-transformer';
import {
  previewQuerySchema,
  previewBodySchema,
  createValidationError,
} from '@/lib/validations/api';

import type { Portfolio } from '@/types/portfolio';

// Template imports
import { renderDeveloperTemplate } from '@/lib/templates/developer';
import { renderDesignerTemplate } from '@/lib/templates/designer';
import { renderConsultantTemplate } from '@/lib/templates/consultant';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validationResult = previewQuerySchema.safeParse({
      portfolioId: searchParams.get('portfolioId'),
      template: searchParams.get('template'),
    });

    if (!validationResult.success) {
      return NextResponse.json(createValidationError(validationResult.error), {
        status: 400,
      });
    }

    const { portfolioId, template } = validationResult.data;

    // Get portfolio data from database or from request body
    const supabase = await createClient();
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data: dbPortfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();

    if (error || !dbPortfolio) {
      logger.error('Failed to fetch portfolio for preview', {
        portfolioId,
        error,
      });
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    const portfolio = transformDbPortfolioToApi(dbPortfolio);

    // Generate HTML based on template
    let html = '';
    switch (template) {
      case 'designer':
        html = renderDesignerTemplate(portfolio);
        break;
      case 'consultant':
        html = renderConsultantTemplate(portfolio);
        break;
      case 'developer':
      default:
        html = renderDeveloperTemplate(portfolio);
        break;
    }

    // Wrap in base HTML with live reload script
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolio.name} - Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    * { transition: all 0.2s ease; }
  </style>
</head>
<body>
  ${html}
  
  <!-- Live Reload Script -->
  <script>
    // Listen for updates from parent window
    window.addEventListener('message', (event) => {
      if (event.data.type === 'UPDATE_PORTFOLIO') {
        // In a real implementation, we would update the DOM directly
        // For now, we'll reload the iframe
        window.location.reload();
      }
    });
    
    // Notify parent that preview is ready
    window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
  </script>
</body>
</html>
    `;

    return new NextResponse(fullHtml, {
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'SAMEORIGIN', // Allow framing from same origin only
      },
    });
  } catch (error) {
    logger.error('Preview generation failed', { error });
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

// POST endpoint for receiving portfolio updates
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = previewBodySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(createValidationError(validationResult.error), {
        status: 400,
      });
    }

    const { portfolio, template } = validationResult.data;

    // Ensure portfolio has required fields for rendering
    const portfolioForRender = {
      ...portfolio,
      id: portfolio.id || 'preview', // Provide default ID for preview
      userId: portfolio.userId || 'preview-user',
      experience: portfolio.experience || [],
      education: portfolio.education || [],
      projects: portfolio.projects || [],
      skills: portfolio.skills || [],
      certifications: portfolio.certifications || [],
      contact: portfolio.contact || {},
      social: portfolio.social || {},
      template: portfolio.template || template || 'developer',
      customization: portfolio.customization || {},
      status: portfolio.status || 'draft',
    } as Portfolio;

    // Generate HTML based on template
    let html = '';
    switch (template) {
      case 'designer':
        html = renderDesignerTemplate(portfolioForRender);
        break;
      case 'consultant':
        html = renderConsultantTemplate(portfolioForRender);
        break;
      case 'developer':
      default:
        html = renderDeveloperTemplate(portfolioForRender);
        break;
    }

    return NextResponse.json({ html });
  } catch (error) {
    logger.error('Preview update failed', { error });
    return NextResponse.json(
      { error: 'Failed to update preview' },
      { status: 500 }
    );
  }
}
