import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { DemoPortfolioService } from '@/lib/services/demo-portfolio-service';
import { DeveloperTemplate } from '@/components/templates/DeveloperTemplate';
import { DesignerTemplate } from '@/components/templates/DesignerTemplate';
import { ConsultantTemplate } from '@/components/templates/ConsultantTemplate';
import { BusinessTemplate } from '@/components/templates/BusinessTemplate';
import { CreativeTemplate } from '@/components/templates/CreativeTemplate';
import { MinimalTemplate } from '@/components/templates/MinimalTemplate';
import { EducatorTemplate } from '@/components/templates/EducatorTemplate';
import { ModernTemplate } from '@/components/templates/ModernTemplate';
import type { Portfolio } from '@/types/portfolio';

interface PageProps {
  params: {
    demoId: string;
  };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const demo = DemoPortfolioService.getDemo(params.demoId);

  if (!demo) {
    return {
      title: 'Demo Not Found',
    };
  }

  return {
    title: `${demo.name} - Demo Portfolio | PRISMA`,
    description: demo.description,
  };
}

export default function DemoPreviewPage({ params }: PageProps) {
  const demo = DemoPortfolioService.getDemo(params.demoId);

  if (!demo) {
    notFound();
  }

  // Create portfolio object from demo data
  const portfolio: Portfolio = {
    id: `demo-${demo.id}`,
    userId: 'demo-user',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: demo.sampleData.personal.name,
    title: demo.sampleData.personal.title,
    bio: demo.sampleData.personal.bio,
    avatarUrl: demo.sampleData.personal.avatarUrl,
    location: demo.sampleData.personal.location,
    contact: {
      email: demo.sampleData.personal.email,
      phone: demo.sampleData.personal.phone,
      location: demo.sampleData.personal.location,
    },
    skills: demo.sampleData.skills.technical.concat(
      demo.sampleData.skills.soft
    ),
    experience: demo.sampleData.experience,
    education: demo.sampleData.education || [],
    projects: demo.sampleData.projects,
    social: demo.sampleData.social,
    certifications: demo.sampleData.certifications || [],
    template: demo.template,
    customization: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      fontFamily: 'Inter',
    },
    status: 'published',
  };

  // Render appropriate template
  const renderTemplate = () => {
    switch (demo.template) {
      case 'developer':
        return <DeveloperTemplate portfolio={portfolio} />;
      case 'designer':
        return <DesignerTemplate portfolio={portfolio} />;
      case 'consultant':
        return <ConsultantTemplate portfolio={portfolio} />;
      case 'business':
        return <BusinessTemplate portfolio={portfolio} />;
      case 'creative':
        return <CreativeTemplate portfolio={portfolio} />;
      case 'minimal':
        return <MinimalTemplate portfolio={portfolio} />;
      case 'educator':
        return <EducatorTemplate portfolio={portfolio} />;
      case 'modern':
        return <ModernTemplate portfolio={portfolio} />;
      default:
        return <DeveloperTemplate portfolio={portfolio} />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Demo Banner */}
      <div className="bg-primary text-primary-foreground p-4 text-center">
        <p className="text-sm font-medium">
          This is a demo preview of the &quot;{demo.name}&quot; template.
          <a href="/quick-start" className="underline ml-2">
            Get started with this template →
          </a>
        </p>
      </div>

      {/* Template Preview */}
      {renderTemplate()}
    </div>
  );
}
