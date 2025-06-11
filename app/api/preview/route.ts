/**
 * Portfolio Preview API
 * Generates live preview HTML for portfolio editor
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transformDbPortfolioToApi } from '@/lib/utils/portfolio-transformer';
import { logger } from '@/lib/utils/logger';

// Template imports
import { renderDeveloperTemplate } from '@/lib/templates/developer';
import { renderDesignerTemplate } from '@/lib/templates/designer';
import { renderConsultantTemplate } from '@/lib/templates/consultant';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');
    const template = searchParams.get('template') || 'developer';

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

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
export async function POST(request: NextRequest) {
  try {
    const { portfolio, template } = await request.json();

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio data is required' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ html });
  } catch (error) {
    logger.error('Preview update failed', { error });
    return NextResponse.json(
      { error: 'Failed to update preview' },
      { status: 500 }
    );
  }
}
