import {
  Portfolio,
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
} from '@/types/portfolio';

import { ValidationResult } from './types';

/**
 * @fileoverview Portfolio validation utilities
 * @module services/portfolio/validation
 *
 * This module provides comprehensive validation for portfolio data
 * to ensure data integrity and consistency.
 */

/**
 * Validation rules configuration
 */
const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
  },
  title: {
    minLength: 2,
    maxLength: 100,
  },
  bio: {
    minLength: 10,
    maxLength: 500,
  },
  tagline: {
    maxLength: 100,
  },
  url: {
    pattern: /^https?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    pattern: /^[\d\s()+-]+$/,
  },
} as const;

/**
 * Validates a complete portfolio object
 *
 * @param portfolio - Portfolio to validate
 * @returns Validation result with errors and warnings
 */
function validatePortfolio(portfolio: Portfolio): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  // Validate required fields
  if (!portfolio.name) {
    errors.push({
      field: 'name',
      message: 'Name is required',
      code: 'REQUIRED_FIELD',
    });
  } else if (!validateName(portfolio.name)) {
    errors.push({
      field: 'name',
      message: 'Name contains invalid characters',
      code: 'INVALID_FORMAT',
    });
  }

  if (!portfolio.title) {
    errors.push({
      field: 'title',
      message: 'Title is required',
      code: 'REQUIRED_FIELD',
    });
  }

  // Validate optional fields
  if (portfolio.bio && !validateBio(portfolio.bio)) {
    errors.push({
      field: 'bio',
      message: `Bio must be between ${VALIDATION_RULES.bio.minLength} and ${VALIDATION_RULES.bio.maxLength} characters`,
      code: 'INVALID_LENGTH',
    });
  }

  if (portfolio.contact?.email && !validateEmail(portfolio.contact.email)) {
    errors.push({
      field: 'contact.email',
      message: 'Invalid email format',
      code: 'INVALID_FORMAT',
    });
  }

  // Validate URLs
  const urlFields = [
    { field: 'avatarUrl', value: portfolio.avatarUrl },
    { field: 'social.linkedin', value: portfolio.social?.linkedin },
    { field: 'social.github', value: portfolio.social?.github },
    { field: 'social.twitter', value: portfolio.social?.twitter },
  ];

  urlFields.forEach(({ field, value }) => {
    if (value && !validateUrl(value)) {
      errors.push({
        field,
        message: 'Invalid URL format',
        code: 'INVALID_URL',
      });
    }
  });

  // Add warnings for missing recommended fields
  if (!portfolio.bio) {
    warnings.push({
      field: 'bio',
      message: 'Adding a bio helps visitors understand your background',
      code: 'RECOMMENDED_FIELD',
    });
  }

  if (!portfolio.projects || portfolio.projects.length === 0) {
    warnings.push({
      field: 'projects',
      message: 'Adding projects showcases your work',
      code: 'RECOMMENDED_FIELD',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates portfolio creation data
 *
 * @param data - Portfolio creation DTO
 * @returns Validation result
 */
export function validateCreatePortfolio(
  data: CreatePortfolioDTO
): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  // Name is required for creation
  if (!data.name) {
    errors.push({
      field: 'name',
      message: 'Name is required',
      code: 'REQUIRED_FIELD',
    });
  }

  // Title is required for creation
  if (!data.title) {
    errors.push({
      field: 'title',
      message: 'Title is required',
      code: 'REQUIRED_FIELD',
    });
  }

  // Template must be specified
  if (!data.template) {
    errors.push({
      field: 'template',
      message: 'Template selection is required',
      code: 'REQUIRED_FIELD',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates portfolio update data
 *
 * @param data - Portfolio update DTO
 * @returns Validation result
 */
export function validateUpdatePortfolio(
  data: UpdatePortfolioDTO
): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  // Validate only provided fields
  if (data.name !== undefined && !validateName(data.name)) {
    errors.push({
      field: 'name',
      message: 'Name contains invalid characters',
      code: 'INVALID_FORMAT',
    });
  }

  if (data.bio !== undefined && !validateBio(data.bio)) {
    errors.push({
      field: 'bio',
      message: `Bio must be between ${VALIDATION_RULES.bio.minLength} and ${VALIDATION_RULES.bio.maxLength} characters`,
      code: 'INVALID_LENGTH',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Individual field validators
 */

function validateName(name: string): boolean {
  return (
    name.length >= VALIDATION_RULES.name.minLength &&
    name.length <= VALIDATION_RULES.name.maxLength &&
    VALIDATION_RULES.name.pattern.test(name)
  );
}

function validateBio(bio: string): boolean {
  return (
    bio.length >= VALIDATION_RULES.bio.minLength &&
    bio.length <= VALIDATION_RULES.bio.maxLength
  );
}

function validateEmail(email: string): boolean {
  return VALIDATION_RULES.email.pattern.test(email);
}

function validateUrl(url: string): boolean {
  return VALIDATION_RULES.url.pattern.test(url);
}

/**
 * Sanitizes portfolio data before saving
 * Removes any potentially harmful content
 *
 * @param data - Portfolio data to sanitize
 * @returns Sanitized data
 */
export function sanitizePortfolioData<T extends Partial<Portfolio>>(
  data: T
): T {
  const sanitized = { ...data };

  // Trim string fields
  if (sanitized.name) sanitized.name = sanitized.name.trim();
  if (sanitized.title) sanitized.title = sanitized.title.trim();
  if (sanitized.bio) sanitized.bio = sanitized.bio.trim();
  if (sanitized.tagline) sanitized.tagline = sanitized.tagline.trim();

  // Sanitize URLs
  if (sanitized.avatarUrl) {
    sanitized.avatarUrl = sanitizeUrl(sanitized.avatarUrl);
  }

  // Sanitize social links
  if (sanitized.social) {
    // Sanitize string URL fields
    const urlFields: (keyof typeof sanitized.social)[] = [
      'linkedin',
      'github',
      'twitter',
      'instagram',
      'youtube',
      'website',
      'dribbble',
      'behance',
    ];

    urlFields.forEach(field => {
      const value = sanitized.social?.[field as keyof typeof sanitized.social];
      if (typeof value === 'string') {
        (sanitized.social as any)[field] = sanitizeUrl(value);
      }
    });

    // Handle custom array separately if it exists
    if (sanitized.social.custom && Array.isArray(sanitized.social.custom)) {
      sanitized.social.custom = sanitized.social.custom.map(link => ({
        ...link,
        url: sanitizeUrl(link.url),
      }));
    }
  }

  return sanitized;
}

/**
 * Sanitizes a URL by removing potentially harmful content
 */
function sanitizeUrl(url: string): string {
  // Remove javascript: and data: protocols
  if (url.startsWith('javascript:') || url.startsWith('data:')) {
    return '';
  }

  // Ensure URL starts with http:// or https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url.trim();
}
