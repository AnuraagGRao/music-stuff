import type { Theme } from './types'

/**
 * Default Dark Theme
 * Clean, minimal dark mode for the music player
 */
export const defaultTheme: Theme = {
  id: 'default',
  name: 'Default Dark',
  description: 'Clean, minimal dark theme',
  colors: {
    bgBase: '#0f172a',
    bgSurface: '#1e293b',
    accentPrimary: '#6366f1',
    accentSecondary: '#8b5cf6',
    textPrimary: '#f1f5f9',
    textMuted: '#94a3b8',
    borderColor: '#334155',
    shadowColor: '#000000',
  },
  spacing: {
    borderRadius: '0.5rem',
    density: 'normal',
  },
  interactive: {
    hoverOpacity: 0.9,
    activeScale: 0.98,
    transitionDuration: '0.2s',
  },
  cssVariables: {
    '--theme-bg-base': '#0f172a',
    '--theme-bg-surface': '#1e293b',
    '--theme-accent-primary': '#6366f1',
    '--theme-accent-secondary': '#8b5cf6',
    '--theme-text-primary': '#f1f5f9',
    '--theme-text-muted': '#94a3b8',
    '--theme-border': '#334155',
    '--theme-shadow': '#000000',
    '--theme-border-radius': '0.5rem',
    '--theme-glow-intensity': '0.3',
    '--theme-font-mono': "'Fira Code', monospace",
  },
}

/**
 * CSS template for Default Dark theme
 */
export const defaultCss = `
html[data-theme="default"] {
  background: #0f172a;
}

body[data-theme="default"],
[data-theme="default"] {
  background-color: #0f172a !important;
  color: #f1f5f9 !important;
  background-image: linear-gradient(to bottom right, #0f172a, #1e293b);
}

[data-theme="default"] main {
  background-color: #0f172a !important;
}

/* Sidebar */
[data-theme="default"] aside,
[data-theme="default"] [role="navigation"] {
  background-color: rgba(15, 23, 42, 0.95) !important;
  border-right: 1px solid #334155 !important;
}

/* Sections */
[data-theme="default"] section {
  background-color: rgba(30, 41, 59, 0.5) !important;
}

/* Grid items */
[data-theme="default"] .grid,
[data-theme="default"] [role="row"] {
  background-color: rgba(30, 41, 59, 0.3) !important;
  border-color: #334155 !important;
}

[data-theme="default"] button {
  background-color: rgba(30, 41, 59, 0.5) !important;
  color: #f1f5f9 !important;
  border-color: #334155 !important;
  transition: all 0.2s ease;
}

[data-theme="default"] button:hover {
  background-color: rgba(30, 41, 59, 0.7) !important;
  border-color: #6366f1 !important;
  color: #6366f1 !important;
}

/* Text colors */
[data-theme="default"] .text-gray-300 {
  color: #cbd5e1 !important;
}

[data-theme="default"] .text-gray-400 {
  color: #94a3b8 !important;
}

[data-theme="default"] .text-white,
[data-theme="default"] .text-gray-100 {
  color: #f1f5f9 !important;
}

/* Accent colors */
[data-theme="default"] .text-cyan-400,
[data-theme="default"] .text-indigo-400 {
  color: #6366f1 !important;
}

[data-theme="default"] .border-cyan-500,
[data-theme="default"] .border-indigo-500 {
  border-color: #6366f1 !important;
}

[data-theme="default"] .bg-cyan-500,
[data-theme="default"] .bg-indigo-500 {
  background-color: #6366f1 !important;
  color: #ffffff !important;
}

/* Active states */
[data-theme="default"] [aria-current="true"],
[data-theme="default"] .active {
  background-color: #6366f1 !important;
  color: #ffffff !important;
}

/* Player */
[data-theme="default"] .bg-gray-900 {
  background-color: rgba(15, 23, 42, 0.9) !important;
}

[data-theme="default"] .bg-gray-800 {
  background-color: rgba(30, 41, 59, 0.6) !important;
}

[data-theme="default"] .border-gray-700 {
  border-color: #334155 !important;
}

/* Input */
[data-theme="default"] input,
[data-theme="default"] textarea {
  background-color: rgba(30, 41, 59, 0.5) !important;
  color: #f1f5f9 !important;
  border-color: #334155 !important;
}

[data-theme="default"] input::placeholder {
  color: #94a3b8 !important;
}
`
