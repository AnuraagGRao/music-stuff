import { useEffect, useState, useCallback } from 'react'
import { themeManager } from '../themes/manager'

/**
 * Hook for theme switching
 * Provides current theme state and setters
 */
export function useTheme() {
  const [theme, setThemeState] = useState<string>(themeManager.getThemeId())

  useEffect(() => {
    // Listen for theme changes
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme: string }>
      setThemeState(customEvent.detail.theme)
    }

    window.addEventListener('theme-changed', handleThemeChange)
    return () => window.removeEventListener('theme-changed', handleThemeChange)
  }, [])

  const setTheme = useCallback((themeId: string) => {
    themeManager.setTheme(themeId)
  }, [])

  const getTheme = useCallback(() => {
    return themeManager.getTheme()
  }, [])

  const availableThemes = useCallback(() => {
    return themeManager.getAvailableThemes()
  }, [])

  return {
    theme,
    setTheme,
    getTheme,
    availableThemes,
  }
}
