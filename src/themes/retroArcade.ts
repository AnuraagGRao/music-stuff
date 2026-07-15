import type { Theme } from './types'

export const retroArcadeTheme: Theme = {
  id: 'retro-arcade',
  name: 'Retro Arcade',
  description: '1980s arcade aesthetic with neon accents',
  colors: {
    bgBase: '#0a0a0a',
    bgSurface: '#1a1a1a',
    accentPrimary: '#00ffff',
    accentSecondary: '#ff00ff',
    textPrimary: '#ffffff',
    textMuted: '#888888',
    borderColor: '#00ffff',
    shadowColor: '#000000',
  },
  spacing: { borderRadius: '0px', density: 'compact' },
  interactive: { hoverOpacity: 1.0, activeScale: 1.0, transitionDuration: '0.1s' },
  cssVariables: {
    '--theme-bg-base': '#0a0a0a',
    '--theme-bg-surface': '#1a1a1a',
    '--theme-accent-primary': '#00ffff',
    '--theme-accent-secondary': '#ff00ff',
    '--theme-text-primary': '#ffffff',
    '--theme-text-muted': '#888888',
    '--theme-border': '#00ffff',
    '--theme-shadow': '#000000',
    '--theme-border-radius': '0px',
  },
}

export const retroArcadeCss = `
html[data-theme="retro-arcade"] { background: #0a0a0a; }
body[data-theme="retro-arcade"], [data-theme="retro-arcade"] { background-color: #0a0a0a !important; color: #ffffff !important; }
[data-theme="retro-arcade"] main { background-color: #0a0a0a !important; }
[data-theme="retro-arcade"] aside { background-color: #1a1a1a !important; border-right: 2px solid #00ffff !important; }
[data-theme="retro-arcade"] section { background-color: #0a0a0a !important; border: 2px solid #00ffff !important; }
[data-theme="retro-arcade"] button { background-color: #0f0f12 !important; color: #ffffff !important; border: 2px solid #00ffff !important; }
[data-theme="retro-arcade"] button:hover { background-color: #1a1a1a !important; box-shadow: 0 0 10px #00ffff !important; }
[data-theme="retro-arcade"] input, [data-theme="retro-arcade"] textarea { background-color: #0f0f12 !important; color: #00ffff !important; border: 2px solid #00ffff !important; }
[data-theme="retro-arcade"] input::placeholder { color: #888888 !important; }
[data-theme="retro-arcade"] input[type="range"] { accent-color: #00ffff !important; }
`
