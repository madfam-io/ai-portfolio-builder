/**
 * SEO Metadata Generation Utilities
 * Generates meta tags, Open Graph, and Twitter Card data
 */

import { Portfolio, SEOMetadata } from '@/types/portfolio';

/**
 * Generate complete metadata for a portfolio page
 */
export function generatePortfolioMetadata(
  portfolio: Portfolio,
  baseUrl: string = 'https://prisma.madfam.io'
): SEOMetadata {
  const url = portfolio.customDomain
    ? `https://${portfolio.customDomain}`
    : `${baseUrl}/${portfolio.subdomain}`;

  const title = generateTitle(portfolio);
  const description = generateDescription(portfolio);
  const keywords = generateKeywords(portfolio);

  return {
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogImage: portfolio.avatarUrl || `${baseUrl}/og-default.png`,
    twitterCard: 'summary_large_image',
    twitterCreator: extractTwitterHandle(portfolio.social.twitter),
    canonicalUrl: url,
    robots:
      portfolio.status === 'published' ? 'index,follow' : 'noindex,nofollow',
  };
}

/**
 * Generate SEO-friendly title
 */
function generateTitle(portfolio: Portfolio): string {
  const parts = [portfolio.name];

  if (portfolio.title) {
    parts.push(portfolio.title);
  }

  // Add location if available for local SEO
  if (portfolio.contact.location) {
    parts.push(portfolio.contact.location);
  }

  // Add branding
  parts.push('Portfolio');

  return parts.join(' | ').slice(0, 60); // Google typically displays ~60 chars
}

/**
 * Generate compelling meta description
 */
function generateDescription(portfolio: Portfolio): string {
  let description = portfolio.bio || '';

  // Add key skills if bio is short
  if (description.length < 100 && portfolio.skills.length > 0) {
    const topSkills = portfolio.skills
      .slice(0, 3)
      .map(s => s.name)
      .join(', ');
    description += ` Specializing in ${topSkills}.`;
  }

  // Add call to action
  if (description.length < 140) {
    description += ' View portfolio and get in touch.';
  }

  // Trim to optimal length (155-160 chars)
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  return description;
}

/**
 * Generate relevant keywords
 */
function generateKeywords(portfolio: Portfolio): string[] {
  const keywords: Set<string> = new Set();

  // Add name and title
  keywords.add(portfolio.name.toLowerCase());
  portfolio.title
    .toLowerCase()
    .split(' ')
    .forEach(word => {
      if (word.length > 3) keywords.add(word);
    });

  // Add top skills
  portfolio.skills.slice(0, 10).forEach(skill => {
    keywords.add(skill.name.toLowerCase());
  });

  // Add industry/role keywords
  const roleKeywords = extractRoleKeywords(portfolio.title);
  roleKeywords.forEach(kw => keywords.add(kw));

  // Add location for local SEO
  if (portfolio.contact.location) {
    keywords.add(portfolio.contact.location.toLowerCase());
  }

  // Add experience-related keywords
  if (portfolio.experience.length > 0) {
    const currentRole = portfolio.experience.find(exp => exp.current);
    if (currentRole) {
      if (currentRole.position) {
        keywords.add(currentRole.position.toLowerCase());
      }
    }
  }

  return Array.from(keywords).slice(0, 10); // Limit to 10 keywords
}

/**
 * Extract role-based keywords
 */
function extractRoleKeywords(title: string): string[] {
  const keywords: string[] = [];
  const lowerTitle = title.toLowerCase();

  // Common role patterns
  const patterns = [
    {
      pattern: /developer|engineer|programmer/,
      keywords: ['developer', 'software', 'coding'],
    },
    {
      pattern: /designer|ux|ui/,
      keywords: ['designer', 'design', 'user experience'],
    },
    {
      pattern: /manager|lead|director/,
      keywords: ['management', 'leadership', 'team'],
    },
    {
      pattern: /consultant|advisor/,
      keywords: ['consultant', 'consulting', 'advisory'],
    },
    { pattern: /analyst|data/, keywords: ['analyst', 'analysis', 'data'] },
    {
      pattern: /marketing|growth/,
      keywords: ['marketing', 'digital marketing', 'growth'],
    },
  ];

  patterns.forEach(({ pattern, keywords: roleKeywords }) => {
    if (pattern.test(lowerTitle)) {
      keywords.push(...roleKeywords);
    }
  });

  return keywords;
}

/**
 * Extract Twitter handle from URL
 */
function extractTwitterHandle(twitterUrl?: string): string | undefined {
  if (!twitterUrl) return undefined;

  const match = twitterUrl.match(/twitter\.com\/(@?\w+)/);
  if (match && match[1]) {
    return match[1].startsWith('@') ? match[1] : `@${match[1]}`;
  }

  return undefined;
}

/**
 * Generate metadata for specific page types
 */
export function generatePageMetadata(
  pageType: 'home' | 'about' | 'projects' | 'contact' | 'blog',
  portfolio: Portfolio,
  _additionalData?: any
): SEOMetadata {
  const baseMetadata = generatePortfolioMetadata(portfolio);

  switch (pageType) {
    case 'home':
      return baseMetadata;

    case 'about':
      return {
        ...baseMetadata,
        title: `About ${portfolio.name} | ${portfolio.title}`,
        description: `Learn more about ${portfolio.name}, a ${portfolio.title}. ${portfolio.bio}`,
      };

    case 'projects':
      const projectCount = portfolio.projects.length;
      return {
        ...baseMetadata,
        title: `Projects by ${portfolio.name} | ${projectCount} Portfolio Pieces`,
        description: `Explore ${projectCount} projects showcasing ${portfolio.name}'s expertise in ${portfolio.skills
          .slice(0, 3)
          .map(s => s.name)
          .join(', ')}.`,
      };

    case 'contact':
      return {
        ...baseMetadata,
        title: `Contact ${portfolio.name} | Get in Touch`,
        description: `Connect with ${portfolio.name}, ${portfolio.title}. Available for ${portfolio.contact?.availability || 'new opportunities'}.`,
        robots: 'index,follow,noarchive', // Don't archive contact pages
      };

    case 'blog':
      return {
        ...baseMetadata,
        title: `Blog | ${portfolio.name}`,
        description: `Insights and articles by ${portfolio.name} on ${portfolio.skills
          .slice(0, 2)
          .map(s => s.name)
          .join(', ')} and more.`,
      };

    default:
      return baseMetadata;
  }
}

/**
 * Generate JSON-LD script tag
 */
export function generateJSONLDScript(data: any): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}

/**
 * Generate all meta tags as HTML
 */
export function generateMetaTags(metadata: SEOMetadata): string {
  const tags: string[] = [];

  // Basic meta tags
  tags.push(`<title>${escapeHtml(metadata.title)}</title>`);
  tags.push(
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`
  );

  if (metadata.keywords.length > 0) {
    tags.push(
      `<meta name="keywords" content="${escapeHtml(metadata.keywords.join(', '))}" />`
    );
  }

  // Canonical URL
  if (metadata.canonicalUrl) {
    tags.push(`<link rel="canonical" href="${metadata.canonicalUrl}" />`);
  }

  // Robots
  if (metadata.robots) {
    tags.push(`<meta name="robots" content="${metadata.robots}" />`);
  }

  // Open Graph
  tags.push(
    `<meta property="og:title" content="${escapeHtml(metadata.ogTitle || metadata.title)}" />`
  );
  tags.push(
    `<meta property="og:description" content="${escapeHtml(metadata.ogDescription || metadata.description)}" />`
  );
  tags.push(`<meta property="og:type" content="website" />`);

  if (metadata.ogImage) {
    tags.push(`<meta property="og:image" content="${metadata.ogImage}" />`);
  }

  if (metadata.canonicalUrl) {
    tags.push(`<meta property="og:url" content="${metadata.canonicalUrl}" />`);
  }

  // Twitter Card
  tags.push(
    `<meta name="twitter:card" content="${metadata.twitterCard || 'summary'}" />`
  );
  tags.push(
    `<meta name="twitter:title" content="${escapeHtml(metadata.ogTitle || metadata.title)}" />`
  );
  tags.push(
    `<meta name="twitter:description" content="${escapeHtml(metadata.ogDescription || metadata.description)}" />`
  );

  if (metadata.ogImage) {
    tags.push(`<meta name="twitter:image" content="${metadata.ogImage}" />`);
  }

  if (metadata.twitterCreator) {
    tags.push(
      `<meta name="twitter:creator" content="${metadata.twitterCreator}" />`
    );
  }

  return tags.join('\n');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, m => map[m] || m);
}

/**
 * Generate hreflang tags for multilingual support
 */
export function generateHreflangTags(
  currentUrl: string,
  languages: Array<{ code: string; url: string }>
): string {
  const tags = languages.map(
    lang =>
      `<link rel="alternate" hreflang="${lang.code}" href="${lang.url}" />`
  );

  // Add x-default for language selection page
  tags.push(
    `<link rel="alternate" hreflang="x-default" href="${currentUrl}" />`
  );

  return tags.join('\n');
}

/**
 * Generate sitemap entry
 */
export function generateSitemapEntry(
  url: string,
  lastModified: Date,
  changeFrequency:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never' = 'weekly',
  priority: number = 0.5
): string {
  return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}
