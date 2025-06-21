/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { Portfolio } from '@/types/portfolio';
import { DeveloperTemplate } from '@/components/templates/DeveloperTemplate';
import { DesignerTemplate } from '@/components/templates/DesignerTemplate';
import { ConsultantTemplate } from '@/components/templates/ConsultantTemplate';
import PublicPortfolioLayout from '@/components/layouts/PublicPortfolioLayout';

interface PageProps {
  params: {
    subdomain: string;
  };
}

async function getPortfolio(subdomain: string): Promise<Portfolio | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/v1/public/${subdomain}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data?.portfolio || null;
  } catch (_error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const portfolio = await getPortfolio(params.subdomain);

  if (!portfolio) {
    return {
      title: 'Portfolio Not Found',
      description: 'The portfolio you are looking for does not exist.',
    };
  }

  // Extract SEO data from portfolio
  const seoTitle = portfolio.data?.seoTitle as string | undefined;
  const seoDescription = portfolio.data?.seoDescription as string | undefined;
  const seoKeywords = portfolio.data?.seoKeywords as string | undefined;

  const title = seoTitle || `${portfolio.name} - ${portfolio.title}`;
  const description =
    seoDescription ||
    portfolio.bio ||
    `Professional portfolio of ${portfolio.name}`;
  const keywords = seoKeywords || '';

  return {
    title,
    description,
    keywords: keywords
      .split(',')
      .map((k: string) => k.trim())
      .filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://${params.subdomain}.prisma.madfam.io`,
      siteName: 'PRISMA Portfolio',
      images: portfolio.avatarUrl
        ? [
            {
              url: portfolio.avatarUrl,
              width: 1200,
              height: 630,
              alt: portfolio.name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: portfolio.avatarUrl ? [portfolio.avatarUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const portfolio = await getPortfolio(params.subdomain);

  if (!portfolio) {
    notFound();
  }

  // Select template based on portfolio template type
  const renderTemplate = () => {
    switch (portfolio.template) {
      case 'developer':
        return <DeveloperTemplate portfolio={portfolio} />;
      case 'designer':
        return <DesignerTemplate portfolio={portfolio} />;
      case 'consultant':
      case 'business':
        return <ConsultantTemplate portfolio={portfolio} />;
      case 'educator':
        // For now, use consultant template for educator
        return <ConsultantTemplate portfolio={portfolio} />;
      case 'creative':
        // For now, use designer template for creative
        return <DesignerTemplate portfolio={portfolio} />;
      case 'minimal':
      case 'modern':
      default:
        // Default to developer template
        return <DeveloperTemplate portfolio={portfolio} />;
    }
  };

  return <PublicPortfolioLayout>{renderTemplate()}</PublicPortfolioLayout>;
}
