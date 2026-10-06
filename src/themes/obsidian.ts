import type { Theme } from './types'

export const obsidianTheme: Theme = {
  id: 'obsidian',
  name: 'Obsidian Precision',
  description: 'Linear × Raycast minimal dark luxury with hairline borders and lavender accents',
  colors: {
    bgBase: '#010102',
    bgSurface: '#0E1015',
    accentPrimary: '#5E6AD2',
    accentSecondary: '#8A8F98',
    textPrimary: '#F7F8F8',
    textMuted: '#62666D',
    borderColor: '#23252A',
    shadowColor: '#000000',
  },
  spacing: { borderRadius: '8px', density: 'compact' },
  interactive: { hoverOpacity: 0.95, activeScale: 0.99, transitionDuration: '0.15s' },
  cssVariables: {
    '--theme-bg-base': '#010102',
    '--theme-bg-surface': '#0E1015',
    '--theme-accent-primary': '#5E6AD2',
    '--theme-accent-secondary': '#8A8F98',
    '--theme-text-primary': '#F7F8F8',
    '--theme-text-muted': '#62666D',
    '--theme-border': '#23252A',
    '--theme-shadow': '#000000',
    '--theme-border-radius': '8px',
  },
}

export const obsidianCss = `
html[data-theme="obsidian"] { background: #010102; }
body[data-theme="obsidian"], [data-theme="obsidian"] {
  background-color: #010102 !important;
  color: #F7F8F8 !important;
  font-family: 'JetBrains Mono', -apple-system, BlinkMacSystemFont, sans-serif !important;
}
[data-theme="obsidian"] main { background-color: #010102 !important; }
[data-theme="obsidian"] aside {
  background-color: #0E1015 !important;
  border-right: 1px solid #23252A !important;
}
[data-theme="obsidian"] section {
  background-color: #0E1015 !important;
  border: 1px solid #23252A !important;
  border-radius: 8px !important;
}
[data-theme="obsidian"] button {
  background-color: #141720 !important;
  color: #F7F8F8 !important;
  border: 1px solid #23252A !important;
  border-radius: 6px !important;
  transition: all 0.15s ease !important;
}
[data-theme="obsidian"] button:hover {
  background-color: #1D212E !important;
  border-color: #5E6AD2 !important;
  color: #FFFFFF !important;
}
[data-theme="obsidian"] input, [data-theme="obsidian"] textarea {
  background-color: #0E1015 !important;
  color: #F7F8F8 !important;
  border: 1px solid #23252A !important;
  border-radius: 6px !important;
}
[data-theme="obsidian"] input:focus, [data-theme="obsidian"] textarea:focus {
  border-color: #5E6AD2 !important;
  outline: none !important;
}
[data-theme="obsidian"] input::placeholder { color: #62666D !important; }
[data-theme="obsidian"] input[type="range"] { accent-color: #5E6AD2 !important; }
`
