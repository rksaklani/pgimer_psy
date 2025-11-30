/**
 * Responsive Design Utilities
 * 
 * This file provides utility functions and constants for responsive design
 * across the application.
 */

/**
 * Breakpoint constants (matching Tailwind CSS defaults)
 */
export const BREAKPOINTS = {
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices (large desktops)
  '2xl': 1536, // 2X Large devices (larger desktops)
};

/**
 * Responsive spacing scale
 * Use these for consistent spacing across breakpoints
 */
export const SPACING = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

/**
 * Responsive font sizes
 */
export const FONT_SIZES = {
  xs: 'text-xs',      // 12px
  sm: 'text-sm',      // 14px
  base: 'text-base',  // 16px
  lg: 'text-lg',      // 18px
  xl: 'text-xl',      // 20px
  '2xl': 'text-2xl',  // 24px
  '3xl': 'text-3xl',  // 30px
  '4xl': 'text-4xl',  // 36px
};

/**
 * Common responsive class patterns
 */
export const RESPONSIVE_CLASSES = {
  // Container padding
  containerPadding: 'p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8',
  
  // Container spacing
  containerSpacing: 'space-y-4 sm:space-y-5 md:space-y-6',
  
  // Grid columns
  gridCols1: 'grid-cols-1',
  gridCols2: 'grid-cols-1 sm:grid-cols-2',
  gridCols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  gridCols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  
  // Flex direction
  flexCol: 'flex-col sm:flex-row',
  flexColReverse: 'flex-col-reverse sm:flex-row',
  
  // Text sizes
  textSmall: 'text-xs sm:text-sm',
  textBase: 'text-sm sm:text-base',
  textLarge: 'text-base sm:text-lg',
  textXLarge: 'text-lg sm:text-xl md:text-2xl',
  
  // Button sizes
  buttonSmall: 'px-2.5 py-1.5 text-xs sm:px-3 sm:text-sm',
  buttonMedium: 'px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-base',
  buttonLarge: 'px-4 py-2.5 text-base sm:px-6 sm:py-3 sm:text-lg',
  
  // Icon sizes
  iconSmall: 'h-4 w-4 sm:h-5 sm:w-5',
  iconMedium: 'h-5 w-5 sm:h-6 sm:w-6',
  iconLarge: 'h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8',
};

/**
 * Hook to detect current breakpoint
 * @returns {string} Current breakpoint name
 */
export const useBreakpoint = () => {
  if (typeof window === 'undefined') return 'lg';
  
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

/**
 * Check if current viewport is mobile
 * @returns {boolean}
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
};

/**
 * Check if current viewport is tablet
 * @returns {boolean}
 */
export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
};

/**
 * Check if current viewport is desktop
 * @returns {boolean}
 */
export const isDesktop = () => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= BREAKPOINTS.lg;
};

/**
 * Responsive gap utilities
 */
export const GAP = {
  xs: 'gap-1 sm:gap-2',
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4',
  lg: 'gap-4 sm:gap-5 md:gap-6',
  xl: 'gap-6 sm:gap-8',
};

/**
 * Responsive padding utilities
 */
export const PADDING = {
  xs: 'p-2 sm:p-3',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5 md:p-6',
  lg: 'p-5 sm:p-6 md:p-8',
  xl: 'p-6 sm:p-8 md:p-10',
};

/**
 * Responsive margin utilities
 */
export const MARGIN = {
  xs: 'm-2 sm:m-3',
  sm: 'm-3 sm:m-4',
  md: 'm-4 sm:m-5 md:m-6',
  lg: 'm-5 sm:m-6 md:m-8',
  xl: 'm-6 sm:m-8 md:m-10',
};

