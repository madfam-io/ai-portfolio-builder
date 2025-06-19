'use client';

import React from 'react';
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Globe,
  Calendar,
  Trophy,
  Star,
  ExternalLink,
} from 'lucide-react';

import { Portfolio } from '@/types/portfolio';
import { renderSections, SectionRenderMap } from '@/lib/utils/template-sections';

interface ModernTemplateProps {
  portfolio: Portfolio;
}

export function ModernTemplateEnhanced({ portfolio }: ModernTemplateProps) {
  const socialLinks = [
    { platform: 'github', url: portfolio.social?.github, icon: Github },
    { platform: 'linkedin', url: portfolio.social?.linkedin, icon: Linkedin },
    { platform: 'twitter', url: portfolio.social?.twitter, icon: Twitter },
  ].filter(link => link.url);

  // Apply theme customization
  const getThemeStyles = () => {
    const custom = portfolio.customization;
    if (!custom) return {};

    return {
      '--primary-color': custom.primaryColor || '#00d4ff',
      '--secondary-color': custom.secondaryColor || '#7c3aed',
      '--accent-color': custom.accentColor || '#06b6d4',
      '--background-color': custom.backgroundColor || '#0a0a0a',
      '--text-color': custom.textColor || '#ffffff',
      '--font-family': custom.fontFamily || 'Inter, sans-serif',
      '--font-size': custom.fontSize === 'small' ? '14px' : custom.fontSize === 'large' ? '18px' : '16px',
      '--spacing': custom.spacing === 'compact' ? '0.5rem' : custom.spacing === 'relaxed' ? '2rem' : '1rem',
      '--border-radius': custom.borderRadius === 'none' ? '0' : custom.borderRadius === 'large' ? '1rem' : '0.5rem',
    } as React.CSSProperties;
  };

  // Define section renderers
  const sectionRenderMap: SectionRenderMap = {
    hero: () => (
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {portfolio.name}
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4">{portfolio.title}</p>
          {portfolio.tagline && (
            <p className="text-lg text-gray-400 mb-8">{portfolio.tagline}</p>
          )}
          <div className="flex justify-center gap-4 mb-8">
            {socialLinks.map(({ platform, url, icon: Icon }) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-gray-700 rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition-all"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </section>
    ),

    about: () => portfolio.bio && (
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-cyan-400">About Me</h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-gray-300 leading-relaxed">{portfolio.bio}</p>
          </div>
        </div>
      </section>
    ),

    experience: () => portfolio.experience?.length > 0 && (
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-cyan-400">Experience</h2>
          <div className="space-y-8">
            {portfolio.experience.map((exp, index) => (
              <div
                key={index}
                className="border-l-2 border-gray-700 pl-6 hover:border-cyan-400 transition-colors"
              >
                <h3 className="text-xl font-semibold text-white">{exp.position}</h3>
                <p className="text-cyan-400 mb-2">{exp.company}</p>
                <p className="text-sm text-gray-400 mb-3">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  {exp.location && ` • ${exp.location}`}
                </p>
                {exp.description && (
                  <p className="text-gray-300">{exp.description}</p>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i} className="text-gray-300 flex items-start">
                        <span className="text-cyan-400 mr-2">▸</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    projects: () => portfolio.projects?.length > 0 && (
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-cyan-400">Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.projects.map((project, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-cyan-400 transition-all"
              >
                <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
                <p className="text-gray-400 mb-4 line-clamp-3">{project.description}</p>
                {project.technologies && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-gray-800 text-cyan-400 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {(project.projectUrl || project.liveUrl || project.githubUrl) && (
                  <a
                    href={project.projectUrl || project.liveUrl || project.githubUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-cyan-400 hover:text-cyan-300"
                  >
                    View Project <ArrowUpRight className="w-4 h-4 ml-1" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    skills: () => portfolio.skills?.length > 0 && (
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-cyan-400">Skills</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.skills.map((skill, index) => {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              const skillLevel = typeof skill === 'object' && skill.level ? skill.level : 'advanced';
              const category = typeof skill === 'object' && skill.category ? skill.category : 'General';
              
              return (
                <div
                  key={index}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-cyan-400 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{skillName}</span>
                    <span className="text-cyan-400 text-sm capitalize">{skillLevel}</span>
                  </div>
                  <div className="text-xs text-gray-400">{category}</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width:
                          skillLevel === 'expert'
                            ? '95%'
                            : skillLevel === 'advanced'
                            ? '85%'
                            : skillLevel === 'intermediate'
                            ? '70%'
                            : '60%',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    ),

    education: () => portfolio.education?.length > 0 && (
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-cyan-400">Education</h2>
          <div className="space-y-6">
            {portfolio.education.map((edu, index) => (
              <div key={index} className="border-l-2 border-gray-700 pl-6">
                <h3 className="text-xl font-semibold">{edu.degree}</h3>
                <p className="text-cyan-400">{edu.institution}</p>
                <p className="text-sm text-gray-400">
                  {edu.startDate} - {edu.endDate}
                </p>
                {edu.description && (
                  <p className="text-gray-300 mt-2">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    certifications: () => portfolio.certifications?.length > 0 && (
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-cyan-400">Certifications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {portfolio.certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-cyan-400 transition-all"
              >
                <Trophy className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="text-lg font-semibold mb-2">{cert.name}</h3>
                <p className="text-gray-400 text-sm">{cert.issuer}</p>
                <p className="text-gray-500 text-xs mt-1">{cert.date}</p>
                {(cert.credentialUrl || cert.imageUrl) && (
                  <a
                    href={cert.credentialUrl || cert.imageUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mt-3 text-sm"
                  >
                    View Certificate <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    contact: () => (
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-cyan-400">Get In Touch</h2>
          <p className="text-gray-300 mb-8">
            I'm always open to discussing new opportunities and interesting projects.
          </p>
          <div className="flex justify-center gap-6">
            {portfolio.contact?.email && (
              <a
                href={`mailto:${portfolio.contact.email}`}
                className="inline-flex items-center px-6 py-3 bg-cyan-400 text-black font-medium rounded-lg hover:bg-cyan-300 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email Me
              </a>
            )}
            {portfolio.social?.linkedin && (
              <a
                href={portfolio.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-cyan-400 text-cyan-400 font-medium rounded-lg hover:bg-cyan-400 hover:text-black transition-all"
              >
                <Linkedin className="w-5 h-5 mr-2" />
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </section>
    ),
  };

  return (
    <div 
      className="min-h-screen bg-black text-white"
      style={getThemeStyles()}
    >
      <style jsx global>{`
        body {
          font-family: var(--font-family);
          font-size: var(--font-size);
        }
        
        .portfolio-section {
          padding: var(--spacing) 0;
        }
        
        * {
          --tw-border-radius: var(--border-radius);
        }
        
        /* Custom scrollbar for dark theme */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>

      {renderSections(portfolio, sectionRenderMap)}
    </div>
  );
}