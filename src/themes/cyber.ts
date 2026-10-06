import type { Theme } from './types'

export const cyberTheme: Theme = {
  id: 'cyber',
  name: 'Cyber Luminescence',
  description: 'ElevenLabs × Superhuman deep-space glassmorphism with electric violet and cyber emerald glows',
  colors: {
    bgBase: '#08090E',
    bgSurface: 'rgba(19, 23, 38, 0.75)',
    accentPrimary: '#8B5CF6',
    accentSecondary: '#10B981',
    textPrimary: '#F8FAFC',
    textMuted: '#A5B4FC',
    borderColor: 'rgba(139, 92, 246, 0.35)',
    shadowColor: 'rgba(139, 92, 246, 0.25)',
  },
  spacing: { borderRadius: '16px', density: 'normal' },
  interactive: { hoverOpacity: 0.95, activeScale: 0.98, transitionDuration: '0.2s' },
  cssVariables: {
    '--theme-bg-base': '#08090E',
    '--theme-bg-surface': 'rgba(19, 23, 38, 0.75)',
    '--theme-accent-primary': '#8B5CF6',
    '--theme-accent-secondary': '#10B981',
    '--theme-text-primary': '#F8FAFC',
    '--theme-text-muted': '#A5B4FC',
    '--theme-border': 'rgba(139, 92, 246, 0.35)',
    '--theme-shadow': 'rgba(139, 92, 246, 0.25)',
    '--theme-border-radius': '16px',
  },
}

export const cyberCss = `
html[data-theme="cyber"] { background: #08090E; }
body[data-theme="cyber"], [data-theme="cyber"] {
  background-color: #08090E !important;
  color: #F8FAFC !important;
  background-image: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.12) 0%, transparent 70%) !important;
}
[data-theme="cyber"] main { background-color: #08090E !important; }
[data-theme="cyber"] aside {
  background-color: rgba(14, 17, 28, 0.85) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border-right: 1px solid rgba(139, 92, 246, 0.25) !important;
}
[data-theme="cyber"] section {
  background-color: rgba(19, 23, 38, 0.65) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  border-radius: 14px !important;
}
[data-theme="cyber"] button {
  background-color: rgba(28, 35, 58, 0.7) !important;
  color: #F8FAFC !important;
  border: 1px solid rgba(139, 92, 246, 0.35) !important;
  border-radius: 10px !important;
  transition: all 0.2s ease !important;
}
[data-theme="cyber"] button:hover {
  background-color: rgba(45, 55, 90, 0.9) !important;
  border-color: #8B5CF6 !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.4) !important;
}
[data-theme="cyber"] input, [data-theme="cyber"] textarea {
  background-color: rgba(14, 17, 28, 0.8) !important;
  color: #F8FAFC !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  border-radius: 10px !important;
}
[data-theme="cyber"] input:focus, [data-theme="cyber"] textarea:focus {
  border-color: #8B5CF6 !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4) !important;
  outline: none !important;
}
[data-theme="cyber"] input::placeholder { color: #A5B4FC !important; }
[data-theme="cyber"] input[type="range"] { accent-color: #8B5CF6 !important; }
`
