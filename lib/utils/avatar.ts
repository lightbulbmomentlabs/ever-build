/**
 * Avatar Utility Functions
 *
 * Functions for generating initials and avatar colors for contacts
 */

/**
 * Get initials from a person's name
 * Examples:
 * - "John Doe" → "JD"
 * - "Jane" → "J"
 * - "Mary Jane Smith" → "MS" (first and last)
 */
export function getInitials(name: string): string {
  if (!name || !name.trim()) {
    return '??';
  }

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    // Single word: use first letter
    return words[0][0].toUpperCase();
  }

  // Multiple words: use first letter of first word and last word
  const firstInitial = words[0][0];
  const lastInitial = words[words.length - 1][0];

  return (firstInitial + lastInitial).toUpperCase();
}

/**
 * Generate a consistent background color for an avatar based on the name
 * Uses a predefined palette of colors that work well with white text
 */
export function getAvatarColor(name: string): string {
  // Predefined color palette (Tailwind colors that work well with white text)
  const colors = [
    '#EF4444', // red-500
    '#F59E0B', // amber-500
    '#10B981', // emerald-500
    '#06B6D4', // cyan-500
    '#3B82F6', // blue-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#F97316', // orange-500
    '#14B8A6', // teal-500
    '#6366F1', // indigo-500
    '#84CC16', // lime-500
    '#A855F7', // purple-500
  ];

  // Generate consistent index from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
