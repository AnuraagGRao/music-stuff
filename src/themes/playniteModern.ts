import type { Theme } from './types'

export const playniteModernTheme: Theme = {
  id: 'playnite-modern',
  name: 'Playnite Modern',
  description: 'PlayStation 5 cinematic aesthetic',
  colors: {
    bgBase: '#000000',
    bgSurface: '#0a0e27',
    accentPrimary: '#ffffff',
    accentSecondary: '#4f9dd9',
    textPrimary: '#ffffff',
    textMuted: '#999999',
    borderColor: '#ffffff',
    shadowColor: '#000000',
  },
  spacing: { borderRadius: '0.25rem', density: 'normal' },
  interactive: { hoverOpacity: 0.9, activeScale: 0.98, transitionDuration: '0.3s' },
  cssVariables: {
    '--theme-bg-base': '#000000',
    '--theme-bg-surface': '#0a0e27',
    '--theme-accent-primary': '#ffffff',
    '--theme-accent-secondary': '#4f9dd9',
    '--theme-text-primary': '#ffffff',
    '--theme-text-muted': '#999999',
    '--theme-border': '#ffffff',
    '--theme-shadow': '#000000',
    '--theme-border-radius': '0.25rem',
  },
}

export const playniteModernCss = `
html[data-theme="playnite-modern"] { background: #000000; }
body[data-theme="playnite-modern"], [data-theme="playnite-modern"] { background-color: #000000 !important; color: #ffffff !important; }
[data-theme="playnite-modern"] main { background-color: #000000 !important; }
[data-theme="playnite-modern"] aside { background-color: rgba(10, 14, 39, 0.95) !important; border-right: 2px solid rgba(255, 255, 255, 0.1) !important; }
[data-theme="playnite-modern"] section { background-color: rgba(0, 0, 0, 0.5) !important; }
[data-theme="playnite-modern"] button { background-color: rgba(10, 14, 39, 0.95) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; }
[data-theme="playnite-modern"] button:hover { background-color: rgba(79, 157, 217, 0.1) !important; border-color: rgba(79, 157, 217, 0.5) !important; color: #ffffff !important; }
[data-theme="playnite-modern"] input, [data-theme="playnite-modern"] textarea { background-color: rgba(10, 14, 39, 0.5) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; }
[data-theme="playnite-modern"] input::placeholder { color: rgba(255, 255, 255, 0.4) !important; }
`
