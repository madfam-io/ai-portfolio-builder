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
