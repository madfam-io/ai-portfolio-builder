# Prompt Template: Creating Portfolio Templates

## Context
You're creating a new portfolio template that helps specific professional groups showcase their work effectively.

## Template System Overview

### Current Templates
1. **Modern**: Dark theme, glassmorphism, tech-focused
2. **Minimal**: Clean, typography-focused, universal
3. **Creative**: Bold colors, visual-heavy, artistic
4. **Business**: Corporate, metrics-focused, professional
5. **Developer**: Code-themed, GitHub-ready, technical
6. **Designer**: Portfolio grid, visual showcase
7. **Consultant**: Case studies, results-oriented
8. **Educator**: Academic, publication-focused

### Template Requirements
- Mobile-first responsive design
- Support all portfolio sections
- Customizable color schemes
- Accessible (WCAG 2.1 AA)
- Performance optimized
- Print-friendly version

## Implementation Guide

### 1. Define Template Concept

```typescript
// types/templates.ts
interface NewTemplate {
  id: 'template-name';
  name: string;
  description: string;
  thumbnail: string;
  categories: TemplateCategory[];
  targetAudience: string[];
  features: string[];
  colorSchemes: ColorScheme[];
}
```

### 2. Create Template Component

```typescript
// components/templates/NewTemplate.tsx
import { cn } from '@/lib/utils';
import type { Portfolio, TemplateProps } from '@/types/templates';

export function NewTemplate({ 
  portfolio, 
  className,
  colorScheme = 'default' 
}: TemplateProps) {
  const colors = getColorScheme(colorScheme);
  
  return (
    <div className={cn(
      'min-h-screen font-sans',
      className
    )} style={{ 
      '--primary': colors.primary,
      '--secondary': colors.secondary,
      '--accent': colors.accent,
    }}>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <HeroSection portfolio={portfolio} />
      </section>
      
      {/* About Section */}
      {portfolio.about && (
        <section id="about" className="py-16 md:py-24">
          <AboutSection data={portfolio.about} />
        </section>
      )}
      
      {/* Projects Section */}
      {portfolio.projects?.length > 0 && (
        <section id="projects" className="py-16 md:py-24 bg-gray-50">
          <ProjectsSection projects={portfolio.projects} />
        </section>
      )}
      
      {/* Skills Section */}
      {portfolio.skills?.length > 0 && (
        <section id="skills" className="py-16 md:py-24">
          <SkillsSection skills={portfolio.skills} />
        </section>
      )}
      
      {/* Experience Section */}
      {portfolio.experience?.length > 0 && (
        <section id="experience" className="py-16 md:py-24 bg-gray-50">
          <ExperienceSection experience={portfolio.experience} />
        </section>
      )}
      
      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24">
        <ContactSection contact={portfolio.contact} />
      </section>
    </div>
  );
}
```

### 3. Create Section Components

```typescript
// Hero Section Example
function HeroSection({ portfolio }: { portfolio: Portfolio }) {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[var(--primary)]">
          {portfolio.name}
        </h1>
        <h2 className="text-2xl md:text-3xl text-[var(--secondary)] mb-6">
          {portfolio.title}
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
          {portfolio.bio}
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="lg" asChild>
            <a href="#contact">{portfolio.ctaText || 'Get In Touch'}</a>
          </Button>
          {portfolio.resumeUrl && (
            <Button variant="outline" size="lg" asChild>
              <a href={portfolio.resumeUrl} download>
                Download Resume
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Projects Section Example
function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Featured Projects
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

### 4. Implement Responsive Design

```typescript
// Responsive utilities
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Mobile-first approach
<div className="
  text-base           // Mobile
  md:text-lg          // Tablet
  lg:text-xl          // Desktop
  xl:text-2xl         // Large screens
">

// Responsive grid
<div className="
  grid 
  grid-cols-1         // Mobile: 1 column
  md:grid-cols-2      // Tablet: 2 columns
  lg:grid-cols-3      // Desktop: 3 columns
  gap-4 md:gap-6 lg:gap-8
">
```

### 5. Add Customization Options

```typescript
// Color schemes
const colorSchemes = {
  default: {
    primary: '#0F172A',
    secondary: '#64748B',
    accent: '#3B82F6',
    background: '#FFFFFF',
    surface: '#F8FAFC',
  },
  dark: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    accent: '#60A5FA',
    background: '#0F172A',
    surface: '#1E293B',
  },
  warm: {
    primary: '#7C2D12',
    secondary: '#C2410C',
    accent: '#FB923C',
    background: '#FFF7ED',
    surface: '#FED7AA',
  },
};

// Font options
const fontOptions = {
  serif: 'font-serif',
  sans: 'font-sans',
  mono: 'font-mono',
  display: 'font-display',
};
```

### 6. Optimize Performance

```typescript
// Lazy load images
import Image from 'next/image';
import { OptimizedImage } from '@/components/ui/optimized-image';

<OptimizedImage
  src={project.image}
  alt={project.title}
  width={600}
  height={400}
  className="rounded-lg"
  loading="lazy"
/>

// Code splitting for heavy components
const ProjectGallery = dynamic(
  () => import('./ProjectGallery'),
  { 
    loading: () => <Skeleton className="h-96" />,
    ssr: false 
  }
);
```

### 7. Ensure Accessibility

```typescript
// Semantic HTML
<header role="banner">
<nav role="navigation" aria-label="Main navigation">
<main role="main">
<footer role="contentinfo">

// Skip links
<a href="#main" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// ARIA labels
<button aria-label="Open menu" aria-expanded={isOpen}>
<section aria-labelledby="projects-heading">
  <h2 id="projects-heading">Projects</h2>
```

### 8. Register Template

```typescript
// lib/templates/registry.ts
import { NewTemplate } from '@/components/templates/NewTemplate';

export const TEMPLATE_REGISTRY = {
  // ... existing templates
  'new-template': {
    id: 'new-template',
    name: 'New Template Name',
    description: 'Perfect for [target audience]',
    component: NewTemplate,
    thumbnail: '/templates/new-template-preview.png',
    categories: ['professional', 'modern'],
    features: [
      'Feature 1',
      'Feature 2',
      'Feature 3'
    ],
  },
};
```

### 9. Create Preview Assets

```bash
# Generate template preview
1. Create a demo portfolio with template
2. Take screenshot at 1200x800px
3. Save as /public/templates/new-template-preview.png
4. Optimize image (WebP format)
```

### 10. Add Template Tests

```typescript
// __tests__/templates/NewTemplate.test.tsx
describe('NewTemplate', () => {
  const mockPortfolio = createMockPortfolio();
  
  it('renders all sections correctly', () => {
    render(<NewTemplate portfolio={mockPortfolio} />);
    
    expect(screen.getByText(mockPortfolio.name)).toBeInTheDocument();
    expect(screen.getByText(mockPortfolio.title)).toBeInTheDocument();
    expect(screen.getAllByTestId('project-card')).toHaveLength(
      mockPortfolio.projects.length
    );
  });
  
  it('handles missing sections gracefully', () => {
    const minimalPortfolio = {
      ...mockPortfolio,
      projects: [],
      experience: [],
    };
    
    render(<NewTemplate portfolio={minimalPortfolio} />);
    
    expect(screen.queryByText('Projects')).not.toBeInTheDocument();
    expect(screen.queryByText('Experience')).not.toBeInTheDocument();
  });
  
  it('is responsive', () => {
    const { container } = render(<NewTemplate portfolio={mockPortfolio} />);
    
    // Test mobile layout
    expect(container.querySelector('.md\\:hidden')).toBeInTheDocument();
    
    // Test desktop layout
    expect(container.querySelector('.hidden.md\\:block')).toBeInTheDocument();
  });
});
```

## Template Design Patterns

### 1. Grid-Based Layout
```typescript
// Flexible grid system
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-8">Main content</div>
  <div className="col-span-12 md:col-span-4">Sidebar</div>
</div>
```

### 2. Card Components
```typescript
function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow",
      "p-6 border border-gray-200",
      className
    )}>
      {children}
    </div>
  );
}
```

### 3. Section Spacing
```typescript
// Consistent section spacing
const Section = ({ children, className, ...props }) => (
  <section 
    className={cn("py-16 md:py-24 px-4", className)} 
    {...props}
  >
    <div className="container mx-auto max-w-6xl">
      {children}
    </div>
  </section>
);
```

### 4. Typography Scale
```typescript
// Consistent typography
const headingStyles = {
  h1: "text-4xl md:text-5xl lg:text-6xl font-bold",
  h2: "text-3xl md:text-4xl font-semibold",
  h3: "text-2xl md:text-3xl font-semibold",
  h4: "text-xl md:text-2xl font-medium",
  body: "text-base md:text-lg",
  small: "text-sm md:text-base",
};
```

## Mobile Optimization

### Touch Targets
```typescript
// Minimum 44x44px touch targets
<button className="min-h-[44px] min-w-[44px] p-3">
  <Icon className="w-6 h-6" />
</button>
```

### Mobile Navigation
```typescript
function MobileNav({ sections }: { sections: Section[] }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right">
          <nav className="flex flex-col space-y-4">
            {sections.map(section => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setIsOpen(false)}
                className="text-lg py-2"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
```

## Print Styles

```typescript
// Print-friendly styles
<style jsx global>{`
  @media print {
    /* Hide non-essential elements */
    nav, .no-print { display: none; }
    
    /* Optimize for print */
    body { font-size: 12pt; }
    h1 { font-size: 18pt; }
    h2 { font-size: 16pt; }
    
    /* Force page breaks */
    .page-break { page-break-before: always; }
    
    /* Show URLs */
    a[href]:after { content: " (" attr(href) ")"; }
  }
`}</style>
```

## Template Categories

When creating templates, consider these categories:

1. **Industry-Specific**
   - Healthcare Professional
   - Legal Professional
   - Real Estate Agent
   - Financial Advisor

2. **Style-Based**
   - Minimalist
   - Bold & Creative
   - Classic Professional
   - Modern Tech

3. **Content-Focused**
   - Portfolio Heavy (many projects)
   - Experience Focused
   - Skills Showcase
   - Academic/Research

4. **Special Purpose**
   - Freelancer
   - Job Seeker
   - Entrepreneur
   - Speaker/Trainer

## Success Criteria

- [ ] Works on all devices (320px to 2560px)
- [ ] Loads in <3 seconds
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Supports all portfolio sections
- [ ] Customizable colors/fonts
- [ ] Print-friendly
- [ ] SEO optimized
- [ ] Smooth animations (respects prefers-reduced-motion)
- [ ] Clear visual hierarchy
- [ ] Professional appearance