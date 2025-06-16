import { Portfolio } from '@/types/portfolio';

/**
 * Dynamic Sitemap Generation
 * Generates XML sitemaps for portfolios
 */

/**
 * Generate XML sitemap for a portfolio
 */
function generatePortfolioSitemap(
  portfolio: Portfolio,
  baseUrl: string = 'https://prisma.madfam.io'
): string {
  const portfolioUrl = portfolio.customDomain
    ? `https://${portfolio.customDomain}`
    : `${baseUrl}/${portfolio.subdomain}`;

  const entries: Array<{
    url: string;
    lastModified: Date;
    changeFrequency:
      | 'always'
      | 'hourly'
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'yearly'
      | 'never';
    priority: number;
  }> = [];

  // Home page - highest priority
  entries.push({
    url: portfolioUrl,
    lastModified: portfolio.updatedAt,
    changeFrequency: 'weekly',
    priority: 1.0,
  });

  // About page
  entries.push({
    url: `${portfolioUrl}/about`,
    lastModified: portfolio.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  });

  // Projects page
  if (portfolio.projects.length > 0) {
    entries.push({
      url: `${portfolioUrl}/projects`,
      lastModified: portfolio.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    });

    // Individual project pages
    portfolio.projects.forEach((project, index) => {
      entries.push({
        url: `${portfolioUrl}/projects/${generateSlug(project.title)}`,
        lastModified: portfolio.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7 - index * 0.05, // Decrease priority for each project
      });
    });
  }

  // Experience page
  if (portfolio.experience.length > 0) {
    entries.push({
      url: `${portfolioUrl}/experience`,
      lastModified: portfolio.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // Contact page
  entries.push({
    url: `${portfolioUrl}/contact`,
    lastModified: portfolio.updatedAt,
    changeFrequency: 'yearly',
    priority: 0.6,
  });

  // Generate XML
  return generateSitemapXML(entries);
}

/**
 * Generate sitemap index for multiple portfolios
 */
function generateSitemapIndex(
  portfolios: Portfolio[],
  baseUrl: string = 'https://prisma.madfam.io'
): string {
  const sitemaps = portfolios
    .filter(p => p.status === 'published')
    .map(portfolio => {
      const url = portfolio.customDomain
        ? `https://${portfolio.customDomain}/sitemap.xml`
        : `${baseUrl}/${portfolio.subdomain}/sitemap.xml`;

      return `
  <sitemap>
    <loc>${url}</loc>
    <lastmod>${portfolio.updatedAt.toISOString()}</lastmod>
  </sitemap>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('')}
</sitemapindex>`;
}

/**
 * Generate sitemap XML from entries
 */
function generateSitemapXML(
  entries: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: string;
    priority: number;
  }>
): string {
  const urlElements = entries.map(
    entry => `
  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements.join('')}
</urlset>`;
}

/**
 * Generate URL slug from text
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  };

  return text.replace(/[&<>"']/g, m => map[m] || m);
}

/**
 * Generate robots.txt content
 */
function generateRobotsTxt(
  sitemapUrl: string,
  disallowPaths: string[] = []
): string {
  const lines = ['User-agent: *', 'Allow: /'];

  // Add disallow rules
  disallowPaths.forEach(path => {
    lines.push(`Disallow: ${path}`);
  });

  // Common disallow patterns
  lines.push('Disallow: /api/');
  lines.push('Disallow: /admin/');
  lines.push('Disallow: /_next/');
  lines.push('Disallow: /preview/');

  // Allow specific bots full access
  lines.push('');
  lines.push('User-agent: Googlebot');
  lines.push('Allow: /');

  lines.push('');
  lines.push('User-agent: Bingbot');
  lines.push('Allow: /');

  // Add sitemap
  lines.push('');
  lines.push(`Sitemap: ${sitemapUrl}`);

  // Crawl delay
  lines.push('');
  lines.push('Crawl-delay: 1');

  return lines.join('\n');
}

/**
 * Generate news sitemap for blog posts
 */
function generateNewsSitemap(
  posts: Array<{
    title: string;
    url: string;
    publishedDate: Date;
    keywords: string[];
    language?: string;
  }>,
  publication: {
    name: string;
    language: string;
  }
): string {
  const newsElements = posts
    .filter(post => {
      // Only include posts from last 2 days for news sitemap
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      return post.publishedDate > twoDaysAgo;
    })
    .map(
      post => `
  <url>
    <loc>${escapeXml(post.url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(publication.name)}</news:name>
        <news:language>${publication.language}</news:language>
      </news:publication>
      <news:publication_date>${post.publishedDate.toISOString()}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
      ${post.keywords && post.keywords.length > 0 ? `<news:keywords>${escapeXml(post.keywords.join(', '))}</news:keywords>` : ''}
    </news:news>
  </url>`
    );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsElements.join('')}
</urlset>`;
}

/**
 * Generate image sitemap
 */
function generateImageSitemap(
  images: Array<{
    pageUrl: string;
    imageUrl: string;
    caption?: string;
    title?: string;
    geoLocation?: string;
  }>
): string {
  // Group images by page
  const imagesByPage = images.reduce(
    (acc, img) => {
      if (!acc[img.pageUrl]) {
        acc[img.pageUrl] = [];
      }
      acc[img.pageUrl]?.push(img);
      return acc;
    },
    {} as Record<string, typeof images>
  );

  const urlElements = Object.entries(imagesByPage).map(
    ([pageUrl, pageImages]) => {
      const imageElements = pageImages.map(
        img => `
    <image:image>
      <image:loc>${escapeXml(img.imageUrl)}</image:loc>
      ${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ''}
      ${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ''}
      ${img.geoLocation ? `<image:geo_location>${escapeXml(img.geoLocation)}</image:geo_location>` : ''}
    </image:image>`
      );

      return `
  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    ${imageElements.join('')}
  </url>`;
    }
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlElements.join('')}
</urlset>`;
}
