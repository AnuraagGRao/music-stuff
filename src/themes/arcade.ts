import type { Theme } from './types'

export const arcadeTheme: Theme = {
  id: 'arcade',
  name: 'Neo-Arcade Brutal',
  description: 'Nintendo-2001 × Teenage Engineering neo-brutalist tactile theme with chunky borders and acid green accents',
  colors: {
    bgBase: '#0D0E15',
    bgSurface: '#181A28',
    accentPrimary: '#00FF66',
    accentSecondary: '#FFE600',
    textPrimary: '#FFFFFF',
    textMuted: '#A0A8C0',
    borderColor: '#2A2E44',
    shadowColor: '#000000',
  },
  spacing: { borderRadius: '4px', density: 'compact' },
  interactive: { hoverOpacity: 1.0, activeScale: 0.98, transitionDuration: '0.1s' },
  cssVariables: {
    '--theme-bg-base': '#0D0E15',
    '--theme-bg-surface': '#181A28',
    '--theme-accent-primary': '#00FF66',
    '--theme-accent-secondary': '#FFE600',
    '--theme-text-primary': '#FFFFFF',
    '--theme-text-muted': '#A0A8C0',
    '--theme-border': '#2A2E44',
    '--theme-shadow': '#000000',
    '--theme-border-radius': '4px',
  },
}

export const arcadeCss = `
html[data-theme="arcade"] { background: #0D0E15; }
body[data-theme="arcade"], [data-theme="arcade"] {
  background-color: #0D0E15 !important;
  color: #FFFFFF !important;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px) !important;
  background-size: 20px 20px !important;
}
[data-theme="arcade"] main { background-color: #0D0E15 !important; }
[data-theme="arcade"] aside {
  background-color: #181A28 !important;
  border-right: 2px solid #2A2E44 !important;
}
[data-theme="arcade"] section {
  background-color: #181A28 !important;
  border: 2px solid #2A2E44 !important;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.8) !important;
  border-radius: 6px !important;
}
[data-theme="arcade"] button {
  background-color: #1F2338 !important;
  color: #FFFFFF !important;
  border: 2px solid #2A2E44 !important;
  box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.9) !important;
  border-radius: 4px !important;
  font-weight: 700 !important;
  transition: transform 0.1s ease, box-shadow 0.1s ease !important;
}
[data-theme="arcade"] button:hover {
  border-color: #00FF66 !important;
  color: #00FF66 !important;
  transform: translate(-2px, -2px) !important;
  box-shadow: 5px 5px 0px #00FF66 !important;
}
[data-theme="arcade"] button:active {
  transform: translate(1px, 1px) !important;
  box-shadow: 1px 1px 0px #00FF66 !important;
}
[data-theme="arcade"] input, [data-theme="arcade"] textarea {
  background-color: #121420 !important;
  color: #00FF66 !important;
  border: 2px solid #2A2E44 !important;
  border-radius: 4px !important;
}
[data-theme="arcade"] input:focus, [data-theme="arcade"] textarea:focus {
  border-color: #00FF66 !important;
  box-shadow: 3px 3px 0px #00FF66 !important;
  outline: none !important;
}
[data-theme="arcade"] input::placeholder { color: #A0A8C0 !important; }
[data-theme="arcade"] input[type="range"] { accent-color: #00FF66 !important; }
`
