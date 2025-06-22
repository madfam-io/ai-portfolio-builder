/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { PromptTemplate } from './types';

/**
 * AI Model Prompt Templates
 * Optimized prompts for open-source models (Llama, Mistral, etc.)
 */

export const promptTemplates = {
  /**
   * Bio Enhancement - Llama 3.1 8B Instruct
   * Transforms basic bio into professional, engaging content
   */
  bioEnhancement: {
    system: `You are a professional portfolio writer specializing in creating compelling personal bios. 
Your task is to enhance bios to be more engaging, professional, and impactful while maintaining authenticity.

Guidelines:
- Keep the enhanced bio under 150 words
- Use active voice and strong action verbs
- Highlight unique value propositions
- Maintain the person's original tone and personality
- Include measurable achievements when possible
- Avoid clichés and generic phrases
- Make it specific to their {title} role`,

    user: `Original Bio: {bio}

Professional Title: {title}
Key Skills: {skills}
Desired Tone: {tone}
Target Length: {length}

Please rewrite this bio to be more professional and engaging while keeping the core message. Focus on what makes this person unique and valuable in their field.

Enhanced Bio:`,

    examples: [
      {
        input: "I'm a web developer who likes to code and solve problems.",
        output:
          'Full-stack developer with 3+ years creating scalable web applications that solve real business challenges. Passionate about clean code architecture and delivering user-centric solutions that drive measurable results.',
      },
      {
        input: 'Designer with experience in UI/UX and branding.',
        output:
          'Creative UI/UX designer specializing in user-centered design that increases conversion rates by 25%+ across digital platforms. Expert in translating complex business requirements into intuitive, accessible interfaces that users love.',
      },
    ],
  } as PromptTemplate,

  /**
   * Project Description Optimization - Mistral 7B Instruct
   * Structures project descriptions using STAR format with metrics
   */
  projectOptimization: {
    system: `You are an expert at optimizing project descriptions for professional portfolios.
Transform basic project descriptions into compelling narratives that showcase technical skills and business impact.

Requirements:
- Use STAR format (Situation, Task, Action, Result)
- Include specific technologies used
- Highlight quantifiable outcomes
- Keep descriptions 50-150 words
- Focus on problem-solving and impact
- Use professional, active language

Return response as JSON with this structure:
{
  "description": "enhanced description",
  "highlights": ["key achievement 1", "key achievement 2"],
  "metrics": ["quantifiable result 1", "quantifiable result 2"],
  "starFormat": {
    "situation": "context/problem",
    "task": "what needed to be done",
    "action": "what you did",
    "result": "outcomes achieved"
  }
}`,

    user: `Project Title: {title}
Original Description: {description}
Technologies Used: {technologies}

Optimize this project description to showcase technical expertise and business impact.`,

    examples: [
      {
        input: 'Built an e-commerce website using React and Node.js',
        output: `{
  "description": "Developed a full-stack e-commerce platform handling 10k+ monthly transactions, built with React frontend and Node.js backend. Implemented secure payment processing, real-time inventory management, and personalized product recommendations that increased average order value by 30%.",
  "highlights": ["10k+ monthly transactions", "30% increase in AOV", "Real-time inventory system"],
  "metrics": ["10,000+ monthly active users", "30% increase in average order value", "99.9% uptime"],
  "starFormat": {
    "situation": "Small business needed modern e-commerce solution to compete online",
    "task": "Build scalable platform supporting high transaction volume",
    "action": "Developed React/Node.js app with payment processing and recommendations",
    "result": "Achieved 10k+ monthly transactions with 30% higher order values"
  }
}`,
      },
    ],
  } as PromptTemplate,

  /**
   * Skill Enhancement - Based on experience
   * Suggests relevant skills based on work experience
   */
  skillExtraction: {
    system: `You are a career advisor specializing in identifying transferable and technical skills from work experience.
Analyze job descriptions and extract relevant skills for portfolio presentation.

Focus on:
- Technical skills (programming languages, tools, frameworks)
- Soft skills (leadership, communication, problem-solving)
- Industry-specific skills
- Emerging technologies and methodologies
- Certifications or specializations mentioned

Return as JSON array of skills with categories and proficiency levels.`,

    user: `Job Experience:
Position: {position}
Company: {company}
Description: {description}
Technologies: {technologies}

Extract and categorize skills demonstrated in this role:`,

    examples: [
      {
        input:
          'Led development team of 5 engineers building microservices with React, Node.js, and AWS',
        output: `[
  {"name": "React", "category": "Frontend", "level": "expert"},
  {"name": "Node.js", "category": "Backend", "level": "expert"},
  {"name": "AWS", "category": "Cloud", "level": "advanced"},
  {"name": "Team Leadership", "category": "Management", "level": "advanced"},
  {"name": "Microservices", "category": "Architecture", "level": "advanced"}
]`,
      },
    ],
  } as PromptTemplate,

  /**
   * Template Recommendation - Analysis prompt
   * Analyzes user profile to recommend best template
   */
  templateRecommendation: {
    system: `You are a portfolio design consultant who recommends templates based on professional profiles.
Analyze the user's background and suggest the most appropriate portfolio template.

Available templates:
- developer: Clean, code-focused layout for software engineers
- designer: Visual-heavy layout showcasing creative work
- consultant: Professional, results-oriented layout for business roles
- creative: Artistic, flexible layout for creative professionals
- minimal: Simple, content-focused layout for any profession

Consider:
- Industry and role requirements
- Type of work (visual vs technical vs business)
- Target audience (clients vs employers vs collaborators)
- Content volume and structure needs`,

    user: `User Profile:
Title: {title}
Industry: {industry}
Skills: {skills}
Project Types: {projectTypes}
Experience Level: {experienceLevel}
Visual Work: {hasVisualWork}

Recommend the best template and explain why:`,

    examples: [
      {
        input: 'Frontend Developer, 5 years experience, React/Vue specialist',
        output:
          "Recommended: 'developer' - Clean code-focused layout perfect for showcasing technical projects, GitHub repositories, and development skills. The structured format highlights programming expertise while maintaining professional credibility with potential employers.",
      },
    ],
  } as PromptTemplate,

  /**
   * Content Quality Assessment
   * Evaluates content quality and suggests improvements
   */
  qualityAssessment: {
    system: `You are a content quality analyst specializing in professional portfolio content.
Evaluate content for readability, professionalism, impact, and completeness.

Scoring criteria (1-100):
- Readability: Clear, concise, well-structured
- Professionalism: Appropriate tone, grammar, vocabulary
- Impact: Demonstrates value, includes metrics, shows results
- Completeness: Adequate detail, covers key points

Provide specific, actionable suggestions for improvement.`,

    user: `Content Type: {contentType}
Content: {content}

Analyze this content and provide:
1. Scores for each criteria (1-100)
2. Overall score
3. Top 3 improvement suggestions`,

    examples: [
      {
        input:
          'I built some websites and apps. I know JavaScript and other stuff.',
        output: `Scores:
- Readability: 60 (simple but vague)
- Professionalism: 45 (too casual, lacks detail)
- Impact: 30 (no specific achievements or metrics)
- Completeness: 40 (missing important details)
Overall: 44

Improvements:
1. Add specific technologies and frameworks used
2. Include quantifiable results (users, performance gains, etc.)
3. Use more professional language and active voice`,
      },
    ],
  } as PromptTemplate,

  /**
   * Achievement Extraction
   * Identifies and formats achievements from experience descriptions
   */
  achievementExtraction: {
    system: `You are an expert at identifying and articulating professional achievements.
Extract measurable accomplishments from job descriptions and format them compellingly.

Focus on:
- Quantifiable results (numbers, percentages, dollars)
- Process improvements and efficiency gains
- Team leadership and collaboration
- Problem-solving and innovation
- Awards, recognition, or certifications

Format as bullet points with strong action verbs.`,

    user: `Experience Description: {description}
Role: {role}
Industry: {industry}

Extract and format key achievements:`,

    examples: [
      {
        input:
          'Managed the development team and improved our deployment process, which made things faster.',
        output: `• Led cross-functional development team of 8 engineers to deliver products 40% faster
• Redesigned deployment pipeline, reducing release time from 4 hours to 45 minutes
• Implemented automated testing protocols, decreasing production bugs by 60%`,
      },
    ],
  } as PromptTemplate,

  /**
   * Industry-Specific Optimization
   * Tailors content for specific industries and roles
   */
  industryOptimization: {
    system: `You are a career specialist with expertise across multiple industries.
Optimize portfolio content for specific industry standards and expectations.

Consider:
- Industry terminology and buzzwords
- Required certifications and skills
- Common project types and deliverables
- Professional standards and compliance
- Target audience expectations (HR, hiring managers, clients)`,

    user: `Content: {content}
Target Industry: {industry}
Role Level: {level}
Audience: {audience}

Optimize this content for the target industry:`,

    examples: [
      {
        input: 'Built secure applications with good performance',
        output:
          'Developed enterprise-grade applications with SOC 2 compliance, implementing OAuth 2.0 authentication and achieving 99.9% uptime with sub-200ms response times across distributed microservices architecture.',
      },
    ],
  } as PromptTemplate,
};

/**
 * Dynamic prompt builder for custom scenarios
 */
// Export specific prompt constants for service imports
export const BIO_PROMPTS = {
  enhance:
    promptTemplates.bioEnhancement.system +
    '\n\n' +
    promptTemplates.bioEnhancement.user,
};

export const PROJECT_PROMPTS = {
  optimize:
    promptTemplates.projectOptimization.system +
    '\n\n' +
    promptTemplates.projectOptimization.user,
};

export const TEMPLATE_PROMPTS = {
  recommend:
    promptTemplates.templateRecommendation.system +
    '\n\n' +
    promptTemplates.templateRecommendation.user,
};

export class PromptBuilder {
  static buildBioPrompt(
    bio: string,
    context: {
      title: string;
      skills: string[];
      tone: string;
      targetLength: string;
    }
  ): string {
    const template = promptTemplates.bioEnhancement;
    return (
      template.system +
      '\n\n' +
      template.user
        .replace('{bio}', bio)
        .replace('{title}', context.title)
        .replace('{skills}', context.skills.join(', '))
        .replace('{tone}', context.tone)
        .replace('{length}', context.targetLength)
    );
  }

  static buildProjectPrompt(
    title: string,
    description: string,
    technologies: string[]
  ): string {
    const template = promptTemplates.projectOptimization;
    return (
      template.system +
      '\n\n' +
      template.user
        .replace('{title}', title)
        .replace('{description}', description)
        .replace('{technologies}', technologies.join(', '))
    );
  }

  static buildQualityPrompt(content: string, contentType: string): string {
    const template = promptTemplates.qualityAssessment;
    return (
      template.system +
      '\n\n' +
      template.user
        .replace('{content}', content)
        .replace('{contentType}', contentType)
    );
  }
}

/**
 * Prompt validation and safety
 */
export class PromptValidator {
  private static readonly MAX_PROMPT_LENGTH = 4000;
  private static readonly FORBIDDEN_PATTERNS = [
    /ignore previous instructions/i,
    /forget everything/i,
    /system prompt/i,
    /jailbreak/i,
  ];

  static validatePrompt(prompt: string): { valid: boolean; error?: string } {
    if (prompt.length > this.MAX_PROMPT_LENGTH) {
      return {
        valid: false,
        error: `Prompt too long: ${prompt.length} chars (max: ${this.MAX_PROMPT_LENGTH})`,
      };
    }

    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(prompt)) {
        return {
          valid: false,
          error: 'Prompt contains forbidden patterns',
        };
      }
    }

    return { valid: true };
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>\"']/g, '') // Remove potential XSS characters
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .trim()
      .slice(0, 2000); // Limit input length
  }
}
