import type { Theme } from './types'

export const esDeWheelTheme: Theme = {
  id: 'es-de-wheel',
  name: 'ES-DE Wheel',
  description: 'EmulationStation arcade carousel aesthetic',
  colors: {
    bgBase: '#1a1a2e',
    bgSurface: '#16213e',
    accentPrimary: '#00d4ff',
    accentSecondary: '#ff006e',
    textPrimary: '#ffffff',
    textMuted: '#888888',
    borderColor: '#00d4ff',
    shadowColor: '#000000',
  },
  spacing: { borderRadius: '4px', density: 'compact' },
  interactive: { hoverOpacity: 1.0, activeScale: 1.1, transitionDuration: '0.25s' },
  cssVariables: {
    '--theme-bg-base': '#1a1a2e',
    '--theme-bg-surface': '#16213e',
    '--theme-accent-primary': '#00d4ff',
    '--theme-accent-secondary': '#ff006e',
    '--theme-text-primary': '#ffffff',
    '--theme-text-muted': '#888888',
    '--theme-border': '#00d4ff',
    '--theme-shadow': '#000000',
    '--theme-border-radius': '4px',
  },
}

export const esDeWheelCss = `
html[data-theme="es-de-wheel"] { background: #1a1a2e; }
body[data-theme="es-de-wheel"], [data-theme="es-de-wheel"] { background-color: #1a1a2e !important; color: #ffffff !important; }
[data-theme="es-de-wheel"] main { background-color: #1a1a2e !important; }
[data-theme="es-de-wheel"] aside { background-color: #16213e !important; border-right: 2px solid #00d4ff !important; }
[data-theme="es-de-wheel"] section { background-color: #1a1a2e !important; border: 1px solid #00d4ff !important; }
[data-theme="es-de-wheel"] button { background-color: #16213e !important; color: #ffffff !important; border: 2px solid #00d4ff !important; }
[data-theme="es-de-wheel"] button:hover { background-color: rgba(0, 212, 255, 0.1) !important; box-shadow: 0 0 10px rgba(0, 212, 255, 0.5) !important; }
[data-theme="es-de-wheel"] button.active { background-color: #ff006e !important; border-color: #ff006e !important; box-shadow: 0 0 15px rgba(255, 0, 110, 0.6) !important; }
[data-theme="es-de-wheel"] input, [data-theme="es-de-wheel"] textarea { background-color: #16213e !important; color: #00d4ff !important; border: 1px solid #00d4ff !important; }
[data-theme="es-de-wheel"] input::placeholder { color: #888888 !important; }
[data-theme="es-de-wheel"] input[type="range"] { accent-color: #00d4ff !important; }
`
