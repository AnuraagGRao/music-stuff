/**
 * Theme type definitions for the music player
 * Supports multiple theme variants with consistent styling patterns
 */

export interface ThemeColors {
  bgBase: string
  bgSurface: string
  accentPrimary: string
  accentSecondary: string
  textPrimary: string
  textMuted: string
  borderColor: string
  shadowColor: string
}

export interface ThemeSpacing {
  borderRadius: string
  density: 'compact' | 'normal' | 'airy'
}

export interface ThemeInteractive {
  hoverOpacity: number
  activeScale: number
  transitionDuration: string
}

export interface Theme {
  id: string
  name: string
  description: string
  colors: ThemeColors
  spacing: ThemeSpacing
  interactive: ThemeInteractive
  cssVariables: Record<string, string>
}

export type ThemeId = 'retro-arcade' | 'default' | 'playnite-modern' | 'es-de-wheel' | 'big-picture-grid' | 'neon-arcade-amoled'
