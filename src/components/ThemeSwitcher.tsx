import { useTheme } from '../hooks/useTheme'
import { useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Theme Switcher Component
 * Popup menu to switch between available themes
 */
export function ThemeSwitcher() {
  const { theme, setTheme, availableThemes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const themes = availableThemes()
  
  const currentTheme = themes.find(t => t.id === theme)
  
  const getEmoji = (themeId: string) => {
    switch (themeId) {
      case 'retro-arcade': return '🕹️'
      case 'default': return '🌙'
      case 'playnite-modern': return '🎮'
      case 'es-de-wheel': return '🎡'
      case 'big-picture-grid': return '📺'
      case 'neon-arcade-amoled': return '⚡'
      default: return '🎵'
    }
  }

  const handleThemeChange = (themeId: string) => {
    console.log(`Switching to theme: ${themeId}`)
    setTheme(themeId)
    setIsOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded text-sm font-medium transition-all cursor-pointer border border-gray-700 hover:border-cyan-500"
      >
        <span>{getEmoji(theme)}</span>
        <span className="hidden sm:inline">{currentTheme?.name}</span>
        <span>▼</span>
      </button>

      {isOpen && createPortal(
        <>
          {/* Backdrop - close on click */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/50 pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popup Menu */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-gray-900 border-2 border-cyan-500 rounded-lg shadow-2xl pointer-events-auto min-w-80 max-w-96 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gray-800 px-4 py-3 border-b border-cyan-500/50 flex-shrink-0">
              <h3 className="text-cyan-400 font-semibold text-center">Select Theme</h3>
            </div>
            
            <div className="overflow-y-auto flex-1">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.id}
                  type="button"
                  onClick={() => handleThemeChange(themeOption.id)}
                  className={`w-full text-left px-6 py-3 transition-all whitespace-nowrap hover:bg-gray-800 pointer-events-auto ${
                    theme === themeOption.id
                      ? 'bg-cyan-500 text-gray-900 font-medium'
                      : 'text-gray-300'
                  }`}
                >
                  <span className="mr-3 text-lg">{getEmoji(themeOption.id)}</span>
                  {themeOption.name}
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}

