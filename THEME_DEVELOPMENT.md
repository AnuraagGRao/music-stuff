# Theme Development Guide

## Overview

The music player uses a **registry-based theme system** that allows multiple themes to coexist. Themes are defined declaratively and injected dynamically.

## Theme Structure

Every theme consists of:

```typescript
interface Theme {
  id: string                          // Unique identifier
  name: string                        // Display name
  description: string                 // One-line description
  colors: ThemeColors                 // Palette definition
  spacing: ThemeSpacing               // Geometry config
  interactive: ThemeInteractive       // Behavior settings
  cssVariables: Record<string, string>  // CSS custom properties
}

interface ThemeColors {
  bgBase: string          // Main app background
  bgSurface: string       // Cards, panels, playback bar
  accentPrimary: string   // Play button, timeline progress
  accentSecondary: string // Hover states, toggles
  textPrimary: string     // Readable text
  textMuted: string       // Secondary/disabled text
  borderColor: string     // Component borders
  shadowColor: string     // Drop shadows, glows
}

interface ThemeSpacing {
  borderRadius: string    // "0px" (sharp) to "999px" (pill-shaped)
  density: 'compact' | 'normal' | 'airy'
}

interface ThemeInteractive {
  hoverOpacity: number    // 0-1 (transparency on hover)
  activeScale: number     // 0-1 (button press scale)
  transitionDuration: string  // "0.15s" etc
}
```

## Creating a New Theme

### Step 1: Create Theme File

Create `src/themes/yourTheme.ts`:

```typescript
import type { Theme } from './types'

export const yourTheme: Theme = {
  id: 'your-theme-id',
  name: 'Your Theme Name',
  description: 'Short description',
  colors: {
    bgBase: '#background',
    bgSurface: '#surface',
    accentPrimary: '#primary',
    accentSecondary: '#secondary',
    textPrimary: '#text',
    textMuted: '#muted',
    borderColor: '#border',
    shadowColor: '#shadow',
  },
  spacing: {
    borderRadius: '8px',
    density: 'normal',
  },
  interactive: {
    hoverOpacity: 0.8,
    activeScale: 0.95,
    transitionDuration: '0.2s',
  },
  cssVariables: {
    '--theme-bg-base': '#background',
    '--theme-bg-surface': '#surface',
    '--theme-accent-primary': '#primary',
    // ... all colors
    '--theme-border-radius': '8px',
    // ... custom variables
  },
}

export const yourThemeCss = `
:root[data-theme="your-theme-id"] {
  --theme-bg-base: #background;
  /* ... all CSS variables */
}

/* Component-specific styles */
[data-theme="your-theme-id"] button {
  /* button styles */
}

[data-theme="your-theme-id"] button:hover {
  /* hover state */
}
`
```

### Step 2: Register Theme

Edit `src/themes/manager.ts`:

```typescript
import { yourTheme, yourThemeCss } from './yourTheme'

const themeRegistry: Record<ThemeId, { theme: Theme; css: string }> = {
  // ...existing themes
  'your-theme-id': {
    theme: yourTheme,
    css: yourThemeCss,
  },
}
```

Update `types.ts`:

```typescript
export type ThemeId = 'retro-arcade' | 'your-theme-id' | ...
```

### Step 3: Test

```bash
npm run build
npm run dev
# Navigate to app and select your theme from the theme switcher
```

---

## Theme Design Patterns

### Pattern 1: High Contrast (Neubrutalism)

```typescript
colors: {
  bgBase: '#FFFDD0',           // Canary yellow
  bgSurface: '#FFFFFF',        // Pure white
  accentPrimary: '#000000',    // Pure black
  accentSecondary: '#FF0000',  // Bright red
  textPrimary: '#000000',
  textMuted: '#666666',
  borderColor: '#000000',
  shadowColor: '#000000',
}

// CSS
border: 3px solid #000;
box-shadow: 4px 4px 0 #000;
font-weight: bold;
font-size: 1.25rem;
```

### Pattern 2: Glassmorphism (Apple Music)

```typescript
colors: {
  bgBase: '#0A0A0A',           // Deep black
  bgSurface: 'rgba(255,255,255,0.1)',  // Transparent white
  accentPrimary: '#FF375F',    // Vibrant pink
  accentSecondary: '#00D4FF',  // Cyan accent
  textPrimary: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.6)',
  borderColor: 'rgba(255,255,255,0.2)',
  shadowColor: 'rgba(255,255,255,0.1)',
}

// CSS
backdrop-filter: blur(24px);
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: 0 8px 32px rgba(255, 61, 95, 0.2);
```

### Pattern 3: Retro Arcade (Current Implementation)

```typescript
colors: {
  bgBase: '#09090B',
  bgSurface: '#0F0F12',
  accentPrimary: '#00FFFF',    // Neon cyan
  accentSecondary: '#FF00FF',  // Neon magenta
  textPrimary: '#FFFFFF',
  textMuted: '#888888',
  borderColor: '#00FFFF',
  shadowColor: '#00FFFF',
}

// CSS
border: 0px;
box-shadow: inset 0 -4px 0 rgba(0, 255, 255, 0.3),
            0 4px 0 #00ffff;  // Inset shadow for tactile feel
text-shadow: 0 0 8px #00ffff;  // Neon glow
font-family: 'Courier New', monospace;  // Retro mono font
```

---

## CSS Variable Naming Convention

```
--theme-{category}-{variant}

Categories:
  bg-*        Background colors
  text-*      Text colors
  accent-*    Accent colors
  border-*    Border styles
  shadow-*    Shadow styles
  radius-*    Border radius
  
Examples:
  --theme-bg-base
  --theme-text-primary
  --theme-accent-primary
  --theme-border-radius
  --theme-glow-intensity
```

---

## Interactive State Implementation

```typescript
// Hover effect
[data-theme="your-id"] button:hover {
  opacity: 0.8;  // or use accent color shift
  transform: translateY(-2px);
}

// Active/pressed state
[data-theme="your-id"] button:active {
  transform: scale(0.95);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

// Focus state (keyboard navigation)
[data-theme="your-id"] button:focus-visible {
  outline: 2px solid var(--theme-accent-primary);
  outline-offset: 2px;
}
```

---

## Testing Your Theme

1. **Color Contrast**
   - Check WCAG AA compliance (4.5:1 minimum for text)
   - Use tools: WebAIM Contrast Checker

2. **Interactive States**
   - Test all button hover/active/focus states
   - Verify slider thumb and track styling
   - Check toggle switches

3. **Components to Style**
   - Buttons (play, pause, next, prev, shuffle, repeat)
   - Sliders (timeline, volume)
   - Text inputs (search box)
   - Surfaces (cards, panels)
   - Badges and labels

4. **Responsive Design**
   - Test on mobile (320px), tablet (768px), desktop (1440px)
   - Verify touch target sizes (min 44x44px)

---

## Performance Tips

1. **Minimize repaints**: Use `transition` duration of 0.15s-0.3s
2. **Avoid animation on critical paths**: Don't animate on mount
3. **Cache CSS**: Static CSS is inlined; CSS-in-JS is avoided
4. **Use custom properties**: Leverage CSS vars for easy overrides

---

## Typography Guidelines

- **Headings**: Bold, oversized (1.5rem+)
- **Body**: 14-16px, readable contrast
- **Metadata**: Monospace for consistency (timestamps, durations)
- **Monospace font**: Use `'Courier New', 'Monaco', 'Courier', monospace`

---

## Accessibility Requirements

Every theme must:
- [ ] Meet WCAG 2.1 AA contrast ratios
- [ ] Support focus outlines (visible keyboard nav)
- [ ] Not rely on color alone for meaning
- [ ] Support `:disabled` state visually
- [ ] Use semantic HTML with ARIA labels

---

## Existing Themes Status

| Theme | Status | File | Description |
|-------|--------|------|-------------|
| Retro Arcade | ✅ Complete | `retroArcade.ts` | Neon cyan/magenta, blocky buttons |
| Glassmorphism | 🔲 TODO | - | Frosted glass, blurred backgrounds |
| Neubrutalism | 🔲 TODO | - | High-contrast, thick borders |
| Default | 🔲 TODO | - | Standard light/dark mode |

---

## Questions?

Refer to:
- `src/themes/retroArcade.ts` for a complete example
- `src/themes/manager.ts` for registration details
- Component files for HTML structure that needs styling
