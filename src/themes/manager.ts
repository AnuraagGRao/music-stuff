import { retroArcadeTheme, retroArcadeCss } from './retroArcade'
import { defaultTheme, defaultCss } from './default'
import { playniteModernTheme, playniteModernCss } from './playniteModern'
import { esDeWheelTheme, esDeWheelCss } from './esDeWheel'
import { bigPictureGridTheme, bigPictureGridCss } from './bigPictureGrid'
import { neonArcadeAmoledTheme, neonArcadeAmoledCss } from './neonArcadeAmoled'
import type { Theme } from './types'

/**
 * Central theme registry and management
 * Handles theme switching, persistence, and CSS injection
 */

const themeRegistry: Record<string, { theme: Theme; css: string }> = {
  'retro-arcade': {
    theme: retroArcadeTheme,
    css: retroArcadeCss,
  },
  'default': {
    theme: defaultTheme,
    css: defaultCss,
  },
  'playnite-modern': {
    theme: playniteModernTheme,
    css: playniteModernCss,
  },
  'es-de-wheel': {
    theme: esDeWheelTheme,
    css: esDeWheelCss,
  },
  'big-picture-grid': {
    theme: bigPictureGridTheme,
    css: bigPictureGridCss,
  },
  'neon-arcade-amoled': {
    theme: neonArcadeAmoledTheme,
    css: neonArcadeAmoledCss,
  },
}

export class ThemeManager {
  private currentTheme: string = 'retro-arcade'
  private styleElement: HTMLStyleElement | null = null

  constructor(initialTheme: string = 'retro-arcade') {
    this.currentTheme = initialTheme
    this.init()
  }

  /**
   * Initialize theme system
   */
  private init(): void {
    // Load saved theme preference
    const saved = localStorage.getItem('app-theme')
    if (saved && themeRegistry[saved]) {
      this.currentTheme = saved
    }

    // Inject styles
    this.injectStyles()
  }

  /**
   * Set active theme and persist preference
   */
  setTheme(themeId: string): void {
    if (!themeRegistry[themeId]) {
      console.warn(`Invalid theme ID: ${themeId}`)
      return
    }

    this.currentTheme = themeId
    localStorage.setItem('app-theme', themeId)
    document.documentElement.setAttribute('data-theme', themeId)
    this.injectStyles()

    // Dispatch event for listeners
    window.dispatchEvent(
      new CustomEvent('theme-changed', { detail: { theme: themeId } })
    )
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return themeRegistry[this.currentTheme].theme
  }

  /**
   * Get current theme ID
   */
  getThemeId(): string {
    return this.currentTheme
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): Theme[] {
    return Object.values(themeRegistry).map((entry) => entry.theme)
  }

  /**
   * Inject theme CSS into document
   */
  private injectStyles(): void {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style')
      this.styleElement.id = 'theme-styles'
      document.head.appendChild(this.styleElement)
    }

    const themeCss = themeRegistry[this.currentTheme].css
    this.styleElement.textContent = themeCss
  }
}

// Create singleton instance
export const themeManager = new ThemeManager()
