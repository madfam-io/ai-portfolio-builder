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

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MarketplaceService } from '@/lib/services/marketplace-service';
import { TemplateDetailContent } from './components/TemplateDetailContent';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const template = await MarketplaceService.getTemplate(params.slug);

  if (!template) {
    return {
      title: 'Template Not Found',
    };
  }

  return {
    title: `${template.name} - Premium Template | PRISMA`,
    description: template.description,
    openGraph: {
      title: template.name,
      description: template.description,
      images: template.thumbnailUrl ? [template.thumbnailUrl] : [],
    },
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const template = await MarketplaceService.getTemplate(params.slug);

  if (!template) {
    notFound();
  }

  return <TemplateDetailContent template={template} />;
}
