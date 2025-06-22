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

/**
 * Structure Optimizer
 * Handles content structure optimization for different content types
 */

export class StructureOptimizer {
  /**
   * Optimize content structure based on type
   */
  optimizeStructure(content: string, contentType: string): string {
    let structured = content;

    switch (contentType) {
      case 'bio':
        structured = this.structureBio(content);
        break;
      case 'project':
        structured = this.structureProject(content);
        break;
      case 'experience':
        structured = this.structureExperience(content);
        break;
      default:
        structured = this.addBasicStructure(content);
    }

    return structured;
  }

  /**
   * Structure bio content
   */
  private structureBio(content: string): string {
    const sections = content.split(/\n\n+/);
    let structured = '';

    // Add professional summary header
    if (sections[0] && sections[0].length > 50) {
      structured += '## Professional Summary\n\n' + sections[0] + '\n\n';
    }

    // Add remaining sections
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      if (section && section.length > 30) {
        structured += section + '\n\n';
      }
    }

    return structured.trim();
  }

  /**
   * Structure project content
   */
  private structureProject(content: string): string {
    // Extract project details
    const hasOverview = content.toLowerCase().includes('overview');
    const hasTechnologies = content.toLowerCase().includes('technolog');
    const hasOutcomes = content.toLowerCase().includes('outcome');

    let structured = content;

    // Add missing sections
    if (!hasOverview) {
      structured = '### Project Overview\n\n' + structured;
    }

    if (!hasTechnologies && content.length > 100) {
      structured += '\n\n### Technologies Used\n\n[Add technologies here]';
    }

    if (!hasOutcomes && content.length > 150) {
      structured += '\n\n### Key Outcomes\n\n[Add outcomes here]';
    }

    return structured;
  }

  /**
   * Structure experience content
   */
  private structureExperience(content: string): string {
    const lines = content.split('\n');
    let structured = '';

    for (const line of lines) {
      if (line.match(/^\d{4}/)) {
        // Date line - make it a header
        structured += '### ' + line + '\n\n';
      } else if (line.startsWith('•') || line.startsWith('-')) {
        // Already a bullet point
        structured += line + '\n';
      } else if (line.length > 50) {
        // Convert long lines to bullet points
        structured += '• ' + line + '\n';
      } else {
        structured += line + '\n';
      }
    }

    return structured.trim();
  }

  /**
   * Add basic structure to generic content
   */
  private addBasicStructure(content: string): string {
    const paragraphs = content.split(/\n\n+/);
    let structured = '';

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i]?.trim() || '';

      if (para.length > 200) {
        // Break long paragraphs
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
        structured += sentences.join('\n\n') + '\n\n';
      } else if (para.length > 0) {
        structured += para + '\n\n';
      }
    }

    return structured.trim();
  }
}
