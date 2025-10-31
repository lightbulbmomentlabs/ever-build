/**
 * Slugify Utility
 *
 * Converts text into URL-friendly slugs
 */

/**
 * Convert text to URL-friendly slug
 *
 * @param text - The text to slugify
 * @returns A URL-safe slug
 *
 * @example
 * slugify("River Ranch") // "river-ranch"
 * slugify("Project #123!") // "project-123"
 * slugify("  Spaces  Everywhere  ") // "spaces-everywhere"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
