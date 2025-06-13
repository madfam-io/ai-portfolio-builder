import { Portfolio, Project, Experience, Education } from '@/types/portfolio';

/**
 * Structured Data Generation for SEO
 * Generates Schema.org JSON-LD structured data for portfolios
 */

/**
 * Generate complete structured data for a portfolio
 */
export function generatePortfolioStructuredData(portfolio: Portfolio): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generatePersonSchema(portfolio),
      generateWebPageSchema(portfolio),
      ...generateProjectSchemas(portfolio.projects),
      ...generateEmploymentSchemas(portfolio.experience),
      ...generateEducationSchemas(portfolio.education),
    ].filter(Boolean),
  };

  return JSON.stringify(structuredData, null, 2);
}

/**
 * Generate Person schema
 */
function generatePersonSchema(portfolio: Portfolio): unknown {
  const person: unknown = {
    '@type': 'Person',
    '@id': `#person-${portfolio.id}`,
    name: portfolio.name,
    jobTitle: portfolio.title,
    description: portfolio.bio,
  };

  // Add contact information
  if (portfolio.contact.email) {
    person.email = portfolio.contact.email;
  }
  if (portfolio.contact.phone) {
    person.telephone = portfolio.contact.phone;
  }
  if (portfolio.contact.location) {
    person.address = {
      '@type': 'PostalAddress',
      addressLocality: portfolio.contact.location,
    };
  }

  // Add social profiles
  const sameAs: string[] = [];
  if (portfolio.social.linkedin) sameAs.push(portfolio.social.linkedin);
  if (portfolio.social.github) sameAs.push(portfolio.social.github);
  if (portfolio.social.twitter) sameAs.push(portfolio.social.twitter);
  if (portfolio.social.website) sameAs.push(portfolio.social.website);

  if (sameAs.length > 0) {
    person.sameAs = sameAs;
  }

  // Add skills
  if (portfolio.skills && portfolio.skills.length > 0) {
    person.knowsAbout = portfolio.skills.map(skill => skill.name);
  }

  // Add current employment
  if (portfolio.experience && portfolio.experience.length > 0) {
    const currentJob = portfolio.experience.find(exp => exp.current);
    if (currentJob) {
      person.worksFor = {
        '@type': 'Organization',
        name: currentJob.company,
      };
    }
  }

  // Add education
  if (portfolio.education && portfolio.education.length > 0) {
    person.alumniOf = portfolio.education.map(edu => ({
      '@type': 'EducationalOrganization',
      name: edu.institution,
    }));
  }

  // Add image if available
  if (portfolio.avatarUrl) {
    person.image = portfolio.avatarUrl;
  }

  return person;
}

/**
 * Generate WebPage schema
 */
function generateWebPageSchema(portfolio: Portfolio): unknown {
  const webpage: unknown = {
    '@type': 'ProfilePage',
    '@id': `#webpage-${portfolio.id}`,
    name: `${portfolio.name} - ${portfolio.title}`,
    description: portfolio.bio,
    url:
      portfolio.customDomain ||
      `https://prisma.madfam.io/${portfolio.subdomain}`,
    about: { '@id': `#person-${portfolio.id}` },
    dateModified: portfolio.updatedAt,
    datePublished: portfolio.publishedAt || portfolio.createdAt,
  };

  // Add breadcrumb
  webpage.breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://prisma.madfam.io',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Portfolios',
        item: 'https://prisma.madfam.io/portfolios',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: portfolio.name,
      },
    ],
  };

  return webpage;
}

/**
 * Generate Project schemas
 */
function generateProjectSchemas(projects: Project[]): any[] {
  if (!projects || projects.length === 0) return [];

  return projects.map((project, index) => ({
    '@type': 'CreativeWork',
    '@id': `#project-${project.id}`,
    name: project.title,
    description: project.description,
    url: project.liveUrl || project.projectUrl,
    creator: { '@id': '#person' },
    position: index + 1,
    keywords: project.technologies.join(', '),
    ...(project.imageUrl && { image: project.imageUrl }),
    ...(project.githubUrl && {
      codeRepository: project.githubUrl,
    }),
  }));
}

/**
 * Generate Employment schemas
 */
function generateEmploymentSchemas(experiences: Experience[]): any[] {
  if (!experiences || experiences.length === 0) return [];

  return experiences.map(exp => ({
    '@type': 'EmployeeRole',
    '@id': `#employment-${exp.id}`,
    startDate: exp.startDate,
    endDate: exp.endDate || undefined,
    roleName: exp.position,
    worksFor: {
      '@type': 'Organization',
      name: exp.company,
    },
    description: exp.description,
    skills: exp.technologies?.join(', '),
  }));
}

/**
 * Generate Education schemas
 */
function generateEducationSchemas(education: Education[]): any[] {
  if (!education || education.length === 0) return [];

  return education.map(edu => ({
    '@type': 'EducationalOccupationalCredential',
    '@id': `#education-${edu.id}`,
    name: `${edu.degree} in ${edu.field}`,
    educationalLevel: edu.degree,
    competencyRequired: edu.field,
    credentialCategory: 'degree',
    dateCreated: edu.endDate,
    recognizedBy: {
      '@type': 'EducationalOrganization',
      name: edu.institution,
    },
  }));
}

/**
 * Generate Article schema for blog posts
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  content: string;
  author: string;
  datePublished: Date;
  dateModified?: Date;
  image?: string;
  keywords?: string[];
}): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    articleBody: article.content,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.datePublished.toISOString(),
    dateModified: (article.dateModified || article.datePublished).toISOString(),
    ...(article.image && { image: article.image }),
    ...(article.keywords && { keywords: article.keywords.join(', ') }),
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Generate Service schema for freelance services
 */
export function generateServiceSchema(service: {
  name: string;
  description: string;
  provider: string;
  category: string;
  price?: {
    min: number;
    max: number;
    currency: string;
  };
  areaServed?: string[];
}): string {
  const schema: unknown = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Person',
      name: service.provider,
    },
    serviceType: service.category,
  };

  if (service.price) {
    schema.offers = {
      '@type': 'Offer',
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: service.price.min,
        maxPrice: service.price.max,
        priceCurrency: service.price.currency,
      },
    };
  }

  if (service.areaServed) {
    schema.areaServed = service.areaServed;
  }

  return JSON.stringify(schema, null, 2);
}

/**
 * Generate FAQ schema
 */
export function generateFAQSchema(
  faqs: Array<{
    question: string;
    answer: string;
  }>
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Generate How-To schema for tutorials
 */
export function generateHowToSchema(howTo: {
  name: string;
  description: string;
  totalTime?: string;
  estimatedCost?: {
    value: number;
    currency: string;
  };
  supplies?: string[];
  tools?: string[];
  steps: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
}): string {
  const schema: unknown = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    step: howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };

  if (howTo.totalTime) {
    schema.totalTime = howTo.totalTime;
  }

  if (howTo.estimatedCost) {
    schema.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: howTo.estimatedCost.currency,
      value: howTo.estimatedCost.value,
    };
  }

  if (howTo.supplies) {
    schema.supply = howTo.supplies.map(supply => ({
      '@type': 'HowToSupply',
      name: supply,
    }));
  }

  if (howTo.tools) {
    schema.tool = howTo.tools.map(tool => ({
      '@type': 'HowToTool',
      name: tool,
    }));
  }

  return JSON.stringify(schema, null, 2);
}

/**
 * Generate LocalBusiness schema
 */
export function generateLocalBusinessSchema(business: {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  telephone?: string;
  email?: string;
  openingHours?: string[];
  priceRange?: string;
  image?: string;
}): string {
  const schema: unknown = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
  };

  if (business.telephone) {
    schema.telephone = business.telephone;
  }

  if (business.email) {
    schema.email = business.email;
  }

  if (business.openingHours) {
    schema.openingHoursSpecification = business.openingHours;
  }

  if (business.priceRange) {
    schema.priceRange = business.priceRange;
  }

  if (business.image) {
    schema.image = business.image;
  }

  return JSON.stringify(schema, null, 2);
}
