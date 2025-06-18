'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Mail, Phone, MapPin, ExternalLink, Github } from 'lucide-react';
import type { EditorBlock, BlockStyles } from '@/types/editor';

interface BlockRendererProps {
  block: EditorBlock;
  viewport: 'desktop' | 'tablet' | 'mobile';
  isEditing: boolean;
}

export function BlockRenderer({
  block,
  viewport,
  isEditing: _isEditing,
}: BlockRendererProps) {
  const getAppliedStyles = (): BlockStyles => {
    const responsiveStyles =
      block.responsive[viewport] || block.responsive.desktop;
    return { ...block.styles, ...responsiveStyles };
  };

  const appliedStyles = getAppliedStyles();

  const containerStyle: React.CSSProperties = {
    backgroundColor: appliedStyles.backgroundColor,
    backgroundImage: appliedStyles.backgroundImage,
    padding: appliedStyles.padding
      ? `${appliedStyles.padding.top}px ${appliedStyles.padding.right}px ${appliedStyles.padding.bottom}px ${appliedStyles.padding.left}px`
      : undefined,
    margin: appliedStyles.margin
      ? `${appliedStyles.margin.top}px ${appliedStyles.margin.right}px ${appliedStyles.margin.bottom}px ${appliedStyles.margin.left}px`
      : undefined,
    opacity: appliedStyles.opacity,
    borderRadius: appliedStyles.border?.radius,
    border: appliedStyles.border
      ? `${appliedStyles.border.width}px ${appliedStyles.border.style} ${appliedStyles.border.color}`
      : undefined,
    boxShadow: appliedStyles.shadow
      ? `${appliedStyles.shadow.x}px ${appliedStyles.shadow.y}px ${appliedStyles.shadow.blur}px ${appliedStyles.shadow.spread}px ${appliedStyles.shadow.color}`
      : undefined,
    overflow: appliedStyles.overflow,
  };

  const renderHeroBlock = () => (
    <section className="relative" style={containerStyle}>
      {block.data.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${block.data.backgroundImage})` }}
        />
      )}
      <div className="relative z-10 container mx-auto text-center">
        {block.data.showAvatar && (
          <Avatar className="w-32 h-32 mx-auto mb-6">
            <AvatarImage src={block.data.avatarUrl} alt={block.data.title} />
            <AvatarFallback>{block.data.title?.slice(0, 2)}</AvatarFallback>
          </Avatar>
        )}
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {block.data.title}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-6">
          {block.data.subtitle}
        </p>
        {block.data.description && (
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            {block.data.description}
          </p>
        )}
        {block.data.ctaText && block.data.ctaLink && (
          <Button size="lg" asChild>
            <a href={block.data.ctaLink}>{block.data.ctaText}</a>
          </Button>
        )}
      </div>
    </section>
  );

  const renderAboutBlock = () => (
    <section style={containerStyle}>
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {block.data.title}
        </h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-lg leading-relaxed mb-6">{block.data.content}</p>
            {block.data.facts && (
              <div className="grid grid-cols-2 gap-4">
                {block.data.facts.map(
                  (
                    fact: {
                      value: string;
                      label: string;
                    },
                    index: number
                  ) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {fact.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {fact.label}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
          {block.data.image && (
            <div className="flex justify-center">
              <div className="relative rounded-lg shadow-lg max-w-md w-full aspect-video">
                <Image
                  src={block.data.image}
                  alt="About"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderSkillsBlock = () => (
    <section style={containerStyle}>
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {block.data.title}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {block.data.skillCategories?.map(
            (
              category: {
                name: string;
                skills: Array<{
                  name: string;
                  level: number;
                }>;
              },
              index: number
            ) => (
              <div key={index}>
                <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
                <div className="space-y-4">
                  {category.skills.map(
                    (
                      skill: {
                        name: string;
                        level: number;
                      },
                      skillIndex: number
                    ) => (
                      <div key={skillIndex}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {skill.level}%
                          </span>
                        </div>
                        {block.data.displayType === 'bars' && (
                          <Progress value={skill.level} className="h-2" />
                        )}
                        {block.data.displayType === 'tags' && (
                          <Badge variant="secondary">{skill.name}</Badge>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );

  const renderProjectsBlock = () => (
    <section style={containerStyle}>
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {block.data.title}
        </h2>
        <div
          className={`grid gap-6 ${
            block.data.layout === 'grid'
              ? `md:grid-cols-${block.data.columns || 3}`
              : ''
          }`}
        >
          {block.data.projects?.map(
            (project: {
              id: string;
              title: string;
              description: string;
              image?: string;
              technologies?: string[];
              liveUrl?: string;
              githubUrl?: string;
            }) => (
              <Card key={project.id} className="overflow-hidden">
                {project.image && (
                  <div className="aspect-video bg-muted">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {project.description}
                  </p>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map(
                        (tech: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tech}
                          </Badge>
                        )
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {project.liveUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="h-4 w-4 mr-1" />
                          Code
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </section>
  );

  const renderExperienceBlock = () => (
    <section style={containerStyle}>
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {block.data.title}
        </h2>
        <div className="max-w-3xl mx-auto">
          {block.data.experiences?.map(
            (
              exp: {
                id: string;
                position: string;
                company: string;
                startDate: string;
                endDate?: string;
                location?: string;
                description: string;
                technologies?: string[];
              },
              _index: number
            ) => (
              <div key={exp.id} className="mb-8 last:mb-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold">{exp.position}</h3>
                    <p className="text-lg text-primary">{exp.company}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </div>
                </div>
                {exp.location && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {exp.location}
                  </p>
                )}
                <p className="mb-4">{exp.description}</p>
                {exp.technologies && (
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech: string, techIndex: number) => (
                      <Badge key={techIndex} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );

  const renderContactBlock = () => (
    <section style={containerStyle}>
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{block.data.title}</h2>
          {block.data.subtitle && (
            <p className="text-lg text-muted-foreground">
              {block.data.subtitle}
            </p>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            {block.data.contactInfo?.map(
              (
                info: {
                  icon: string;
                  label: string;
                  value: string;
                },
                index: number
              ) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {info.icon === 'mail' && <Mail className="h-5 w-5" />}
                    {info.icon === 'phone' && <Phone className="h-5 w-5" />}
                    {info.icon === 'map-pin' && <MapPin className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium">{info.label}</p>
                    <p className="text-muted-foreground">{info.value}</p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Contact Form */}
          {block.data.showForm && (
            <div className="space-y-4">
              {block.data.formFields?.map(
                (
                  field: {
                    label: string;
                    type: string;
                    required?: boolean;
                  },
                  index: number
                ) => (
                  <div key={index}>
                    <label className="block text-sm font-medium mb-1">
                      {field.label}{' '}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="w-full p-3 border rounded-md"
                        rows={4}
                        placeholder={`Enter your ${field.label.toLowerCase()}`}
                      />
                    ) : (
                      <input
                        type={field.type}
                        className="w-full p-3 border rounded-md"
                        placeholder={`Enter your ${field.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                )
              )}
              <Button className="w-full">Send Message</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderTextBlock = () => (
    <div style={containerStyle} className={`text-${block.data.alignment}`}>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: block.data.content }}
      />
    </div>
  );

  const renderImageBlock = () => (
    <div style={containerStyle} className={`text-${block.data.alignment}`}>
      <div className="relative">
        {block.data.link ? (
          <a href={block.data.link} target="_blank" rel="noopener noreferrer">
            <div
              className="relative"
              style={{ width: block.data.width, height: block.data.height }}
            >
              <Image
                src={block.data.url}
                alt={block.data.alt}
                fill
                className="object-contain"
              />
            </div>
          </a>
        ) : (
          <div
            className="relative"
            style={{ width: block.data.width, height: block.data.height }}
          >
            <Image
              src={block.data.url}
              alt={block.data.alt}
              fill
              className="object-contain"
            />
          </div>
        )}
        {block.data.caption && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {block.data.caption}
          </p>
        )}
      </div>
    </div>
  );

  const renderDividerBlock = () => (
    <div style={containerStyle} className={`text-${block.data.alignment}`}>
      <hr
        style={{
          width: block.data.width,
          height: `${block.data.thickness}px`,
          borderStyle: block.data.style,
          borderColor: block.data.color,
          backgroundColor: block.data.color,
          border: 'none',
        }}
      />
    </div>
  );

  const renderSpacerBlock = () => (
    <div style={{ ...containerStyle, height: `${block.data.height}px` }} />
  );

  const renderDefaultBlock = () => (
    <div
      style={containerStyle}
      className="p-8 text-center border-2 border-dashed border-muted"
    >
      <div className="text-muted-foreground">
        <p className="text-sm mb-2">Block Type: {block.type}</p>
        <p className="text-xs">
          This block type is not yet implemented in the renderer.
        </p>
      </div>
    </div>
  );

  // Render appropriate block based on type
  switch (block.type) {
    case 'hero':
      return renderHeroBlock();
    case 'about':
      return renderAboutBlock();
    case 'skills':
      return renderSkillsBlock();
    case 'projects':
      return renderProjectsBlock();
    case 'experience':
      return renderExperienceBlock();
    case 'contact':
      return renderContactBlock();
    case 'text':
      return renderTextBlock();
    case 'image':
      return renderImageBlock();
    case 'divider':
      return renderDividerBlock();
    case 'spacer':
      return renderSpacerBlock();
    default:
      return renderDefaultBlock();
  }
}
