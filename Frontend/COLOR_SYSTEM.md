# Unified Color System

This document outlines the unified color system used throughout the PGIMER PSY application.

## Primary Color Palette

The application uses a **blue/indigo primary color scheme** for all UI elements:

- **Primary 50-900**: Blue shades from light to dark
- **Main Primary**: `primary-600` (#0284c7) - Used for primary actions, links, and highlights
- **Primary Dark**: `primary-700` (#0369a1) - Used for hover states and emphasis
- **Primary Light**: `primary-100` (#e0f2fe) - Used for backgrounds and subtle highlights

## Secondary Color Palette

- **Secondary 50-900**: Slate/gray shades for secondary elements, backgrounds, and text
- Used for neutral elements, borders, and text that doesn't need emphasis

## Color Usage Guidelines

### ✅ DO Use:
- `primary-*` colors for all primary actions, buttons, links, and highlights
- `secondary-*` colors for neutral elements, backgrounds, and secondary text
- Consistent gradient patterns: `from-primary-600 to-primary-700`
- Semantic colors only where absolutely necessary (error states)

### ❌ DON'T Use:
- Random color variations (green, purple, orange, pink, teal, cyan, etc.)
- Inconsistent color schemes across similar components
- Hardcoded color values outside the theme

## Component Color Standards

### Buttons
- **Primary**: `from-primary-600 to-primary-700`
- **Hover**: `from-primary-700 to-primary-800`
- **Outline**: `border-primary-600/60 text-primary-600`

### Badges
- **Primary/Success/Info**: `bg-primary-100 text-primary-700 border-primary-200`
- **Warning**: `bg-amber-100 text-amber-700 border-amber-200` (only for warnings)
- **Danger**: `bg-red-100 text-red-700 border-red-200` (only for errors)

### Cards
- **Background**: `bg-white/70 backdrop-blur-xl`
- **Border**: `border-white/40`
- **Hover**: `bg-white/80 border-primary-200/50`

### Stat Cards
All stat cards use primary color variations:
- `from-primary-500 to-primary-600`
- `from-primary-600 to-primary-700`
- `from-primary-700 to-primary-800`
- `from-primary-400 to-primary-500`
- `from-primary-500 to-indigo-600` (for variety while staying consistent)

### Role Colors
All user roles use primary color variations:
- **Admin**: `from-primary-600 to-primary-700`
- **Faculty**: `from-primary-500 to-primary-600`
- **Resident**: `from-primary-400 to-primary-500`
- **Psychiatric Welfare Officer**: `from-primary-600 to-primary-800`

## Implementation

The color system is defined in:
- `Frontend/src/utils/colors.js` - Color constants and utilities
- `Frontend/tailwind.config.js` - Tailwind theme configuration

## Benefits

1. **Visual Consistency**: All components share the same color language
2. **Brand Identity**: Strong, cohesive brand presence
3. **Maintainability**: Easy to update colors globally
4. **Accessibility**: Consistent contrast ratios
5. **Professional Appearance**: Unified, polished look

