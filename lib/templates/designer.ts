import { Portfolio } from '@/types/portfolio';

/**
 * Designer Portfolio Template
 * Visual, creative design for designers and creatives
 */

export function renderDesignerTemplate(portfolio: Portfolio): string {
  const {
    name,
    title,
    bio,
    tagline,
    avatarUrl,
    contact,
    social,
    experience,
    projects,
    skills,
  } = portfolio;

  return `
    <div class="min-h-screen bg-black text-white">
      <!-- Navigation -->
      <nav class="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex justify-between items-center">
            <a href="#" class="text-2xl font-light tracking-wider">${name}</a>
            <div class="hidden md:flex gap-8">
              <a href="#work" class="hover:text-purple-400 transition-colors">Work</a>
              <a href="#about" class="hover:text-purple-400 transition-colors">About</a>
              <a href="#experience" class="hover:text-purple-400 transition-colors">Experience</a>
              <a href="#contact" class="hover:text-purple-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero -->
      <section class="min-h-screen flex items-center justify-center relative overflow-hidden">
        <!-- Animated Background -->
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div class="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div class="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div class="relative z-10 text-center px-6">
          ${
            avatarUrl
              ? `
            <img 
              src="${avatarUrl}" 
              alt="${name}" 
              class="w-32 h-32 rounded-full mx-auto mb-8 border-4 border-purple-500/50"
            />
          `
              : ''
          }
          <h1 class="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ${name}
          </h1>
          <p class="text-2xl md:text-3xl text-gray-300 mb-4">${title || 'Creative Designer'}</p>
          ${
            tagline
              ? `
            <p class="text-xl text-gray-400 italic max-w-2xl mx-auto">"${tagline}"</p>
          `
              : ''
          }
        </div>
      </section>

      <!-- Work/Projects -->
      ${
        projects && projects.length > 0
          ? `
        <section id="work" class="py-20 px-6">
          <div class="max-w-7xl mx-auto">
            <h2 class="text-5xl font-bold mb-16 text-center">
              <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Selected Work
              </span>
            </h2>
            <div class="grid md:grid-cols-2 gap-8">
              ${projects
                .map(
                  (project, index) => `
                <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                  ${
                    project.imageUrl
                      ? `
                    <img 
                      src="${project.imageUrl}" 
                      alt="${project.title}"
                      class="w-full h-64 object-cover"
                    />
                  `
                      : `
                    <div class="w-full h-64 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                      <span class="text-6xl font-bold text-white/10">${index + 1}</span>
                    </div>
                  `
                  }
                  <div class="p-8">
                    <h3 class="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                      ${project.title}
                    </h3>
                    ${
                      project.description
                        ? `
                      <p class="text-gray-400 mb-4">${project.description}</p>
                    `
                        : ''
                    }
                    ${
                      project.technologies && project.technologies.length > 0
                        ? `
                      <div class="flex flex-wrap gap-2 mb-4">
                        ${project.technologies
                          .map(
                            tech => `
                          <span class="px-3 py-1 bg-white/10 rounded-full text-sm">
                            ${tech}
                          </span>
                        `
                          )
                          .join('&apos;)}
                      </div>
                    `
                        : ''
                    }
                    ${
                      project.liveUrl || project.projectUrl
                        ? `
                      <a 
                        href="${project.liveUrl || project.projectUrl}" 
                        target="_blank"
                        class="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        View Project
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    `
                        : ''
                    }
                  </div>
                </div>
              `
                )
                .join('&apos;)}
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- About -->
      <section id="about" class="py-20 px-6 bg-white/5">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-5xl font-bold mb-12 text-center">
            <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              About Me
            </span>
          </h2>
          ${
            bio
              ? `
            <p class="text-xl text-gray-300 leading-relaxed text-center mb-12">
              ${bio}
            </p>
          `
              : ''
          }
          
          <!-- Skills -->
          ${
            skills && skills.length > 0
              ? `
            <div class="mt-16">
              <h3 class="text-2xl font-bold mb-8 text-center">Skills & Tools</h3>
              <div class="flex flex-wrap justify-center gap-3">
                ${skills
                  .map(
                    skill => `
                  <span class="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full">
                    ${skill.name}
                  </span>
                `
                  )
                  .join('&apos;)}
              </div>
            </div>
          `
              : ''
          }
        </div>
      </section>

      <!-- Experience -->
      ${
        experience && experience.length > 0
          ? `
        <section id="experience" class="py-20 px-6">
          <div class="max-w-4xl mx-auto">
            <h2 class="text-5xl font-bold mb-16 text-center">
              <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Experience
              </span>
            </h2>
            <div class="space-y-12">
              ${experience
                .map(
                  exp => `
                <div class="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-purple-500 before:to-pink-500">
                  <div class="absolute left-0 top-0 w-2 h-2 bg-purple-500 rounded-full -translate-x-[3.5px]"></div>
                  <h3 class="text-2xl font-bold text-purple-400">${exp.position}</h3>
                  <p class="text-xl text-gray-300">${exp.company}</p>
                  <p class="text-gray-500 mb-3">
                    ${exp.startDate} - ${exp.endDate || 'Present'}
                  </p>
                  ${
                    exp.description
                      ? `
                    <p class="text-gray-400">${exp.description}</p>
                  `
                      : ''
                  }
                </div>
              `
                )
                .join('&apos;)}
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- Contact -->
      <section id="contact" class="py-20 px-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-5xl font-bold mb-8">
            <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Let's Create Together
            </span>
          </h2>
          <p class="text-xl text-gray-400 mb-12">
            I'm always excited to work on new creative projects.
          </p>
          
          <div class="flex justify-center gap-6">
            ${
              contact?.email
                ? `
              <a 
                href="mailto:${contact.email}"
                class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                Get In Touch
              </a>
            `
                : ''
            }
            
            ${
              social
                ? `
              <div class="flex items-center gap-4">
                ${
                  social.behance
                    ? `
                  <a href="${social.behance}" target="_blank" class="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/>
                    </svg>
                  </a>
                `
                    : ''
                }
                ${
                  social.dribbble
                    ? `
                  <a href="${social.dribbble}" target="_blank" class="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.628 0-12 5.373-12 12s5.372 12 12 12 12-5.373 12-12-5.372-12-12-12zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.314 2.431-.314 2.275 0 4.368.779 6.043 2.072zm-10.516-.993c1.331 1.742 2.511 3.538 3.537 5.381-2.43.715-5.331 1.082-8.684 1.105.692-2.835 2.601-5.193 5.147-6.486zm-5.44 8.834l.013-.256c3.849-.005 7.169-.448 9.95-1.322.233.475.456.952.67 1.432-3.38 1.057-6.165 3.222-8.337 6.48-1.432-1.719-2.296-3.927-2.296-6.334zm3.829 7.81c1.969-3.088 4.482-5.098 7.598-6.027.928 2.42 1.609 4.91 2.043 7.46-3.349 1.291-6.953.666-9.641-1.433zm11.586.43c-.438-2.353-1.08-4.653-1.92-6.897 1.876-.265 3.94-.196 6.199.196-.437 2.786-2.028 5.192-4.279 6.701z"/>
                    </svg>
                  </a>
                `
                    : ''
                }
                ${
                  social.instagram
                    ? `
                  <a href="${social.instagram}" target="_blank" class="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                    </svg>
                  </a>
                `
                    : ''
                }
              </div>
            `
                : ''
            }
          </div>
        </div>
      </section>
    </div>

    <style>
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
      .animate-blob {
        animation: blob 7s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      .animation-delay-4000 {
        animation-delay: 4s;
      }
    </style>
  `;
}
