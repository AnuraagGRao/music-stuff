import type { Theme } from './types'

export const bigPictureGridTheme: Theme = {
  id: 'big-picture-grid',
  name: 'Big Picture Grid',
  description: 'Steam Big Picture: dense media library grid',
  colors: {
    bgBase: '#121212',
    bgSurface: '#1e1e1e',
    accentPrimary: '#1e90ff',
    accentSecondary: '#00a8ff',
    textPrimary: '#ffffff',
    textMuted: '#757575',
    borderColor: '#1e90ff',
    shadowColor: '#000000',
  },
  spacing: { borderRadius: '0px', density: 'compact' },
  interactive: { hoverOpacity: 1.0, activeScale: 1.15, transitionDuration: '0.2s' },
  cssVariables: {
    '--theme-bg-base': '#121212',
    '--theme-bg-surface': '#1e1e1e',
    '--theme-accent-primary': '#1e90ff',
    '--theme-accent-secondary': '#00a8ff',
    '--theme-text-primary': '#ffffff',
    '--theme-text-muted': '#757575',
    '--theme-border': '#1e90ff',
    '--theme-shadow': '#000000',
    '--theme-border-radius': '0px',
  },
}

export const bigPictureGridCss = `
html[data-theme="big-picture-grid"] { background: #121212; }
body[data-theme="big-picture-grid"], [data-theme="big-picture-grid"] { background-color: #121212 !important; color: #ffffff !important; }
[data-theme="big-picture-grid"] main { background-color: #121212 !important; }
[data-theme="big-picture-grid"] aside { background-color: #1e1e1e !important; border-right: 2px solid #1e90ff !important; }
[data-theme="big-picture-grid"] section { background-color: #121212 !important; border: 1px solid #1e90ff !important; }
[data-theme="big-picture-grid"] .grid, [data-theme="big-picture-grid"] [role="row"] { background-color: #1e1e1e !important; border: 1px solid #333333 !important; }
[data-theme="big-picture-grid"] .grid:hover, [data-theme="big-picture-grid"] [role="row"]:hover { background-color: #252525 !important; border-color: #1e90ff !important; box-shadow: 0 0 8px rgba(30, 144, 255, 0.3) !important; }
[data-theme="big-picture-grid"] button { background-color: #1e1e1e !important; color: #ffffff !important; border: 1px solid #333333 !important; }
[data-theme="big-picture-grid"] button:hover { background-color: rgba(30, 144, 255, 0.1) !important; border-color: #1e90ff !important; color: #1e90ff !important; box-shadow: 0 0 10px rgba(30, 144, 255, 0.3) !important; }
[data-theme="big-picture-grid"] input, [data-theme="big-picture-grid"] textarea { background-color: #1e1e1e !important; color: #1e90ff !important; border: 1px solid #333333 !important; }
[data-theme="big-picture-grid"] input::placeholder { color: #757575 !important; }
[data-theme="big-picture-grid"] input[type="range"] { accent-color: #1e90ff !important; }
`
