/**
 * Unified Color System
 * 
 * This file defines the consistent color palette used throughout the application.
 * All components should use these color constants to ensure visual consistency.
 */

/**
 * Primary Color Palette (Blue/Indigo)
 * Main brand colors for primary actions, links, and highlights
 */
export const PRIMARY_COLORS = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7',  // Main primary color
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
};

/**
 * Secondary Color Palette (Slate/Gray)
 * Used for secondary elements, backgrounds, and text
 */
export const SECONDARY_COLORS = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
};

/**
 * Semantic Colors (using primary/secondary as base)
 * These maintain consistency while providing semantic meaning
 */
export const SEMANTIC_COLORS = {
  // Success - Use primary blue for success states
  success: {
    light: PRIMARY_COLORS[100],
    DEFAULT: PRIMARY_COLORS[600],
    dark: PRIMARY_COLORS[700],
    text: PRIMARY_COLORS[700],
  },
  
  // Error/Danger - Use red but consistent shades
  error: {
    light: '#fee2e2',
    DEFAULT: '#dc2626',
    dark: '#b91c1c',
    text: '#991b1b',
  },
  
  // Warning - Use amber but consistent shades
  warning: {
    light: '#fef3c7',
    DEFAULT: '#d97706',
    dark: '#b45309',
    text: '#92400e',
  },
  
  // Info - Use primary blue
  info: {
    light: PRIMARY_COLORS[100],
    DEFAULT: PRIMARY_COLORS[600],
    dark: PRIMARY_COLORS[700],
    text: PRIMARY_COLORS[700],
  },
};

/**
 * Background Colors
 */
export const BACKGROUND_COLORS = {
  primary: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50',
  card: 'bg-white/70 backdrop-blur-xl',
  cardHover: 'bg-white/80',
  overlay: 'bg-black/30 backdrop-blur-md',
  sidebar: 'bg-white/80 backdrop-blur-2xl',
  header: 'bg-white/70 backdrop-blur-2xl',
};

/**
 * Border Colors
 */
export const BORDER_COLORS = {
  default: 'border-white/40',
  primary: 'border-primary-500',
  secondary: 'border-secondary-300',
  error: 'border-red-500/60',
  focus: 'border-primary-500',
};

/**
 * Text Colors
 */
export const TEXT_COLORS = {
  primary: 'text-gray-900',
  secondary: 'text-gray-600',
  tertiary: 'text-gray-500',
  primaryBrand: 'text-primary-600',
  primaryBrandDark: 'text-primary-700',
  error: 'text-red-600',
  success: 'text-primary-700',
  white: 'text-white',
};

/**
 * Gradient Classes (Tailwind format)
 */
export const GRADIENTS = {
  primary: 'bg-gradient-to-r from-primary-600 to-primary-700',
  primaryHover: 'bg-gradient-to-r from-primary-700 to-primary-800',
  primaryLight: 'bg-gradient-to-r from-primary-100 to-primary-200',
  background: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50',
  card: 'bg-gradient-to-br from-white/70 to-white/50',
  text: 'bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700',
};

/**
 * Shadow Colors
 */
export const SHADOW_COLORS = {
  primary: 'shadow-primary-500/30',
  primaryLight: 'shadow-primary-500/20',
  default: 'shadow-gray-500/20',
};

/**
 * Role-based Colors (using primary palette variations)
 * All roles use primary color scheme with different shades
 */
export const ROLE_COLORS = {
  Admin: {
    bg: 'bg-gradient-to-r from-primary-600 to-primary-700',
    bgLight: 'bg-gradient-to-r from-primary-100 to-primary-200',
    text: 'text-primary-700',
    border: 'border-primary-200',
    icon: 'text-primary-600',
  },
  Faculty: {
    bg: 'bg-gradient-to-r from-primary-500 to-indigo-600',
    bgLight: 'bg-gradient-to-r from-primary-100 to-indigo-100',
    text: 'text-primary-700',
    border: 'border-primary-200',
    icon: 'text-primary-600',
  },
  Resident: {
    bg: 'bg-gradient-to-r from-primary-400 to-primary-600',
    bgLight: 'bg-gradient-to-r from-primary-100 to-primary-200',
    text: 'text-primary-700',
    border: 'border-primary-200',
    icon: 'text-primary-600',
  },
  'Psychiatric Welfare Officer': {
    bg: 'bg-gradient-to-r from-primary-600 to-primary-800',
    bgLight: 'bg-gradient-to-r from-primary-100 to-primary-200',
    text: 'text-primary-700',
    border: 'border-primary-200',
    icon: 'text-primary-600',
  },
};

/**
 * Status Colors (using primary palette)
 */
export const STATUS_COLORS = {
  active: {
    bg: 'bg-primary-100',
    text: 'text-primary-700',
    border: 'border-primary-200',
  },
  inactive: {
    bg: 'bg-secondary-100',
    text: 'text-secondary-600',
    border: 'border-secondary-200',
  },
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  completed: {
    bg: 'bg-primary-100',
    text: 'text-primary-700',
    border: 'border-primary-200',
  },
};

/**
 * Chart Colors (using primary palette)
 */
export const CHART_COLORS = {
  primary: PRIMARY_COLORS[600],
  secondary: PRIMARY_COLORS[400],
  tertiary: PRIMARY_COLORS[300],
  quaternary: PRIMARY_COLORS[200],
  background: PRIMARY_COLORS[50],
};

/**
 * Helper function to get consistent color classes
 */
export const getColorClasses = (type, variant = 'default') => {
  const colorMap = {
    button: {
      primary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800',
      secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800',
      outline: 'border-2 border-primary-600/60 text-primary-600 bg-white/30 hover:bg-white/50',
      ghost: 'text-primary-600 bg-white/20 hover:bg-white/40',
    },
    badge: {
      primary: 'bg-primary-100 text-primary-700 border-primary-200',
      secondary: 'bg-secondary-100 text-secondary-700 border-secondary-200',
      success: 'bg-primary-100 text-primary-700 border-primary-200',
      error: 'bg-red-100 text-red-700 border-red-200',
    },
    card: {
      default: 'bg-white/70 backdrop-blur-xl border-white/40',
      hover: 'bg-white/80 border-primary-200/50',
    },
  };

  return colorMap[type]?.[variant] || '';
};

