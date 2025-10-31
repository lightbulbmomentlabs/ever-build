'use client';

/**
 * Mobile Utility Hooks
 *
 * Provides hooks for responsive design and mobile detection
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect if screen matches a media query
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]);

  return matches;
}

/**
 * Hook to detect if screen is in mobile breakpoint (< 768px)
 * @returns boolean indicating if screen is mobile size
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * Hook to detect device orientation
 * @returns 'portrait' | 'landscape' | null
 */
export function useOrientation(): 'portrait' | 'landscape' | null {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | null>(null);

  useEffect(() => {
    const updateOrientation = () => {
      if (window.matchMedia('(orientation: portrait)').matches) {
        setOrientation('portrait');
      } else if (window.matchMedia('(orientation: landscape)').matches) {
        setOrientation('landscape');
      }
    };

    // Set initial value
    updateOrientation();

    // Listen for orientation changes
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}

/**
 * Hook to detect if device has touch capability
 * @returns boolean indicating if device supports touch
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - for older browsers
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouch;
}

/**
 * Combined mobile context hook
 * @returns object with mobile state information
 */
export function useMobileContext() {
  const isMobile = useIsMobile();
  const orientation = useOrientation();
  const isTouch = useIsTouchDevice();

  return {
    isMobile,
    orientation,
    isTouch,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
}
