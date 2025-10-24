/**
 * EverBuild Brand Colors
 *
 * This file exports the official EverBuild brand color palette
 * as defined in EverBuild-Brand.md
 *
 * Use these constants for programmatic color access in React components
 */

export const BrandColors = {
  // Primary Palette - Trust & Strength
  primary: {
    charcoalBlue: '#2C3E50',
    steelGray: '#95A5A6',
    everbuildOrange: '#E67E22',
    concreteWhite: '#F4F4F4',
  },

  // Secondary Palette - Modern Construction
  secondary: {
    blueprintTeal: '#1ABC9C',
    sandstoneTan: '#D7BFAE',
    oliveGreen: '#7F8C6B',
  },

  // Highlight & Feedback Colors
  feedback: {
    successGreen: '#27AE60',
    warningAmber: '#F39C12',
    errorRed: '#C0392B',
  },

  // Theme-specific mappings
  light: {
    bg: '#F4F4F4',
    text: '#2C3E50',
    secondary: '#95A5A6',
    accent: '#E67E22',
    link: '#1ABC9C',
    border: '#E0E0E0',
    cardBg: '#FFFFFF',
    hover: '#F8F9FA',
  },

  dark: {
    bg: '#2C3E50',
    text: '#F4F4F4',
    secondary: '#95A5A6',
    accent: '#E67E22',
    link: '#1ABC9C',
    border: '#3E4C59',
    cardBg: '#34495E',
    hover: '#3E4C59',
  },
} as const;

/**
 * CSS Variable Names
 * Use these to reference CSS custom properties in inline styles
 */
export const CSSVars = {
  // Primary Colors
  charcoalBlue: 'var(--color-charcoal-blue)',
  steelGray: 'var(--color-steel-gray)',
  everbuildOrange: 'var(--color-everbuild-orange)',
  concreteWhite: 'var(--color-concrete-white)',

  // Secondary Colors
  blueprintTeal: 'var(--color-blueprint-teal)',
  sandstoneTan: 'var(--color-sandstone-tan)',
  oliveGreen: 'var(--color-olive-green)',

  // Feedback Colors
  successGreen: 'var(--color-success-green)',
  warningAmber: 'var(--color-warning-amber)',
  errorRed: 'var(--color-error-red)',

  // Semantic Colors
  bg: 'var(--color-bg)',
  text: 'var(--color-text)',
  secondary: 'var(--color-secondary)',
  accent: 'var(--color-accent)',
  link: 'var(--color-link)',
  border: 'var(--color-border)',
  cardBg: 'var(--color-card-bg)',
  hover: 'var(--color-hover)',
  focus: 'var(--color-focus)',
  disabled: 'var(--color-disabled)',
} as const;

/**
 * Tailwind-compatible color object
 * Use this for extending Tailwind config if needed
 */
export const tailwindColors = {
  'charcoal-blue': BrandColors.primary.charcoalBlue,
  'steel-gray': BrandColors.primary.steelGray,
  'everbuild-orange': BrandColors.primary.everbuildOrange,
  'concrete-white': BrandColors.primary.concreteWhite,
  'blueprint-teal': BrandColors.secondary.blueprintTeal,
  'sandstone-tan': BrandColors.secondary.sandstoneTan,
  'olive-green': BrandColors.secondary.oliveGreen,
  'success-green': BrandColors.feedback.successGreen,
  'warning-amber': BrandColors.feedback.warningAmber,
  'error-red': BrandColors.feedback.errorRed,
};

// Type exports for better TypeScript support
export type BrandColorKey = keyof typeof BrandColors;
export type CSSVarKey = keyof typeof CSSVars;
