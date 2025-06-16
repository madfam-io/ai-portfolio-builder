/**
 * Utilities for the publish page
 */

/**
 * Generate a subdomain from a portfolio name
 */
export function generateSubdomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
