/**
 * Mobile Constants
 *
 * Constants for mobile layout and interactions
 */

/**
 * Minimum touch target size for accessibility (WCAG 2.5.5)
 */
export const TOUCH_TARGET = {
  MIN_SIZE: 44, // 44x44px minimum
  COMFORTABLE_SIZE: 48, // 48x48px for comfortable tapping
} as const;

/**
 * Tailwind breakpoints (for reference)
 */
export const BREAKPOINTS = {
  SM: 640, // sm: @media (min-width: 640px)
  MD: 768, // md: @media (min-width: 768px)
  LG: 1024, // lg: @media (min-width: 1024px)
  XL: 1280, // xl: @media (min-width: 1280px)
} as const;

/**
 * Mobile-specific font sizes
 */
export const MOBILE_FONT_SIZES = {
  // Minimum 16px for inputs to prevent iOS zoom
  INPUT: '16px',
  BUTTON: '16px',
  BODY: '16px',
  SMALL: '14px',
  TINY: '12px',
} as const;

/**
 * Mobile-specific spacing
 */
export const MOBILE_SPACING = {
  CONTAINER_PADDING: '1rem', // 16px
  CARD_PADDING: '1.25rem', // 20px
  SECTION_SPACING: '1.5rem', // 24px
  ELEMENT_GAP: '0.5rem', // 8px between interactive elements
} as const;

/**
 * Mobile-specific dimensions
 */
export const MOBILE_DIMENSIONS = {
  HEADER_HEIGHT: 64, // Mobile header height
  NAV_WIDTH: 280, // Mobile drawer width
  MAX_MODAL_WIDTH: '100vw', // Full screen modals on mobile
} as const;
