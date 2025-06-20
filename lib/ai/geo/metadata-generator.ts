import { SEOMetadata, GEOSettings } from './types';
import { Portfolio, Skill, Education } from '@/types/portfolio';

/**
 * SEO Metadata and Structured Data Generator
 * Generates optimized metadata, structured data, and social sharing tags
 */

export class MetadataGenerator {
  /**
   * Generate comprehensive SEO metadata
   */
  generateMetadata(content: string, settings: GEOSettings): SEOMetadata {
    const title = this.generateTitle(content, settings);
    const metaDescription = this.generateMetaDescription(content, settings);
    const slug = this.generateSlug(title);
    const keywords = this.extractKeywords(content, settings);

    // Open Graph metadata
    const ogTitle = this.generateOGTitle(title, settings);
    const ogDescription = this.generateOGDescription(metaDescription, content);

    // Twitter Card metadata
    const twitterTitle = this.truncateForTwitter(title);
    const twitterDescription = this.truncateForTwitter(metaDescription, 200);

    // JSON-LD structured data
    const jsonLd = this.generateStructuredData(content, settings, {
      title,
      description: metaDescription,
      keywords,
    });

    return {
      title,
      metaDescription,
      focusKeyphrase: settings.primaryKeyword,
      slug,
      keywords,
      ogTitle,
      ogDescription,
      twitterCard: 'summary',
      twitterTitle,
      twitterDescription,
      jsonLd,
    };
  }

  /**
   * Generate SEO-optimized title
   */
  private generateTitle(content: string, settings: GEOSettings): string {
    const maxLength = 60;
    const primaryKeyword = settings.primaryKeyword;

    // Extract first sentence or heading
    const firstSentence = content.split(/[.!?\n]/)[0]?.trim() || '';

    let title = firstSentence;

    // Ensure primary keyword is included
    if (
      primaryKeyword &&
      title &&
      !title.toLowerCase().includes(primaryKeyword.toLowerCase())
    ) {
      // Try to naturally include the keyword
      if (title.length + primaryKeyword.length + 3 <= maxLength) {
        title = `${primaryKeyword} - ${title}`;
      } else {
        title = primaryKeyword;
      }
    }

    // Truncate if too long
    if (title.length > maxLength) {
      title = title.substring(0, maxLength - 3) + '...';
    }

    // Capitalize appropriately
    return title ? this.titleCase(title) : '';
  }

  /**
   * Generate meta description
   */
  private generateMetaDescription(
    content: string,
    settings: GEOSettings
  ): string {
    const maxLength = 160;
    const primaryKeyword = settings.primaryKeyword;

    // Extract key sentences
    const sentences = content
      .split(/[.!?]/)
      .filter(s => s.trim().length > 20)
      .slice(0, 3);

    let description = sentences.join('. ').trim();

    // Ensure primary keyword is included
    if (
      primaryKeyword &&
      !description.toLowerCase().includes(primaryKeyword.toLowerCase())
    ) {
      description = `${primaryKeyword}. ${description}`;
    }

    // Add call to action based on content goals
    const cta = this.generateCTA(settings.contentGoals);
    if (description.length + cta.length + 2 <= maxLength) {
      description += ` ${cta}`;
    }

    // Truncate if too long
    if (description.length > maxLength) {
      description = description.substring(0, maxLength - 3) + '...';
    }

    return description;
  }

  /**
   * Generate URL slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string, settings: GEOSettings): string[] {
    const keywords: Set<string> = new Set();

    // Add configured keywords
    if (settings.primaryKeyword) {
      keywords.add(settings.primaryKeyword);
    }
    settings.secondaryKeywords.forEach(kw => keywords.add(kw));

    // Extract additional relevant keywords (top 5 most frequent meaningful words)
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4); // Only meaningful words

    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    topWords.forEach(word => keywords.add(word));

    return Array.from(keywords).slice(0, 10); // Max 10 keywords
  }

  /**
   * Generate Open Graph title
   */
  private generateOGTitle(title: string, settings: GEOSettings): string {
    // OG titles can be slightly longer than meta titles
    const maxLength = 70;

    if (settings.targetAudience === 'clients') {
      return title.length <= maxLength
        ? title
        : title.substring(0, maxLength - 3) + '...';
    }

    return title;
  }

  /**
   * Generate Open Graph description
   */
  private generateOGDescription(
    metaDescription: string,
    content: string
  ): string {
    // OG descriptions can be up to 200 characters
    const maxLength = 200;

    if (metaDescription.length <= maxLength) {
      return metaDescription;
    }

    // Try to create a more comprehensive description
    const firstParagraph = content.split(/\n\n/)[0];
    if (!firstParagraph) return metaDescription;

    return firstParagraph.length <= maxLength
      ? firstParagraph
      : firstParagraph.substring(0, maxLength - 3) + '...';
  }

  /**
   * Generate structured data (JSON-LD)
   */
  private generateStructuredData(
    _content: string,
    settings: GEOSettings,
    metadata: { title: string; description: string; keywords: string[] }
  ): Record<string, unknown> {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': this.determineSchemaType(settings),
      name: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords.join(', '),
    };

    // Add type-specific properties
    switch (settings.targetAudience) {
      case 'employers':
        return {
          ...baseSchema,
          '@type': 'Person',
          jobTitle: settings.primaryKeyword,
          knowsAbout: metadata.keywords,
        };

      case 'clients':
        return {
          ...baseSchema,
          '@type': 'Service',
          serviceType: settings.primaryKeyword,
          provider: {
            '@type': 'Person',
            name: 'Portfolio Owner', // This would be dynamic in real implementation
          },
        };

      default:
        return baseSchema;
    }
  }

  /**
   * Determine appropriate Schema.org type
   */
  private determineSchemaType(settings: GEOSettings): string {
    const typeMap: Record<string, string> = {
      professional: 'Person',
      creative: 'CreativeWork',
      technical: 'TechArticle',
      academic: 'ScholarlyArticle',
    };

    return typeMap[settings.tone] || 'WebPage';
  }

  /**
   * Generate call to action
   */
  private generateCTA(contentGoals: string[]): string {
    const ctaMap: Record<string, string> = {
      convert: 'Get in touch today.',
      engage: 'Learn more.',
      inform: 'Discover how.',
      rank: 'Read more.',
    };

    const primaryGoal = contentGoals[0] || 'engage';
    return ctaMap[primaryGoal] || 'Learn more.';
  }

  /**
   * Title case helper
   */
  private titleCase(str: string): string {
    const smallWords = new Set([
      'a',
      'an',
      'the',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
    ]);

    return str
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index === 0 || !smallWords.has(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  }

  /**
   * Truncate text for Twitter
   */
  private truncateForTwitter(text: string, maxLength: number = 70): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Generate social sharing metadata
   */
  generateSocialMetadata(
    content: string,
    platform: 'facebook' | 'twitter' | 'linkedin',
    settings: GEOSettings
  ): Record<string, string> {
    const baseMetadata = {
      title: this.generateTitle(content, settings),
      description: this.generateMetaDescription(content, settings),
    };

    switch (platform) {
      case 'facebook':
        return {
          'og:title': baseMetadata.title,
          'og:description': baseMetadata.description,
          'og:type': 'website',
          'og:locale': 'en_US',
        };

      case 'twitter':
        return {
          'twitter:card': 'summary',
          'twitter:title': this.truncateForTwitter(baseMetadata.title),
          'twitter:description': this.truncateForTwitter(
            baseMetadata.description,
            200
          ),
        };

      case 'linkedin':
        return {
          'og:title': baseMetadata.title,
          'og:description': baseMetadata.description,
          'og:type': 'profile',
        };

      default:
        return baseMetadata;
    }
  }

  /**
   * Generate portfolio-specific structured data
   */
  generatePortfolioStructuredData(
    portfolio: Portfolio
  ): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: portfolio.name,
        jobTitle: portfolio.title,
        description: portfolio.bio,
        sameAs: [
          portfolio.social?.linkedin,
          portfolio.social?.github,
          portfolio.social?.twitter,
        ].filter(Boolean),
        knowsAbout: portfolio.skills?.map((s: Skill) => s.name) || [],
        alumniOf:
          portfolio.education?.map((edu: Education) => ({
            '@type': 'EducationalOrganization',
            name: edu.institution,
          })) || [],
        worksFor: portfolio.experience?.[0]
          ? {
              '@type': 'Organization',
              name: portfolio.experience[0].company,
            }
          : undefined,
      },
    };
  }

  /**
   * Generate breadcrumb structured data
   */
  generateBreadcrumbData(path: string[]): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: path.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item,
        item:
          index < path.length - 1
            ? `/${path.slice(0, index + 1).join('/')}`
            : undefined,
      })),
    };
  }
}
