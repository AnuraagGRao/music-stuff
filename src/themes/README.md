# 🎮 10-Foot Console UI Themes - Complete Reference

A collection of immersive, fullscreen 10-foot UI themes designed for video game library interfaces, music players, and TV-ready applications. Each theme is optimized for controller navigation, large displays, and specific aesthetic visions.

## 📋 Theme Overview

### 1. 🕹️ **Retro Arcade** (Default)
**Theme ID:** `retro-arcade`

**Vibe:** 1980s Synthwave, Neon Cyan & Magenta Accents, Tactile Arcade Feel
- **Colors:** Cyan (#00ffff) and Magenta (#ff00ff) on pure black
- **Font:** Monospace for technical feel
- **Button Style:** Inset shadow effects (arcade-like tactility)
- **Interaction:** Buttons press down with 3D shadow effects
- **Best For:** Retro gaming enthusiasts, arcade cabinet emulation

**Key Features:**
- Neon glow effects on text and elements
- Inset button shadows for tactile feedback
- Monospace font for technical display
- High contrast cyan/magenta colors

**CSS Variables:**
```css
--theme-bg-base: #09090b
--theme-bg-surface: #0f0f12
--theme-accent-primary: #00ffff (Cyan)
--theme-accent-secondary: #ff00ff (Magenta)
--theme-text-primary: #ffffff
--theme-text-muted: #888888
--theme-border-radius: 0px (Sharp)
```

---

### 2. 🌙 **Default Dark**
**Theme ID:** `default`

**Vibe:** Minimal, Clean, Modern Dark Mode
- **Colors:** Subtle grays and whites, muted accents
- **Font:** System sans-serif
- **Focus:** Readable, accessible, lightweight
- **Best For:** Everyday use, accessibility-focused applications

**Key Features:**
- Minimal visual noise
- Excellent readability
- Accessibility-first design
- Smooth, gentle animations

---

### 3. 🎮 **Playnite Modern / PS5**
**Theme ID:** `playnite-modern`

**Vibe:** PlayStation 5 Dashboard, Cinematic, Airy, High-End Console
- **Colors:** Pure white accents on deep black
- **Layout:** Massive breathing space for background art
- **Focus State:** Items scale 1.1x with white glow
- **Unfocused:** 50% opacity, dimmed appearance
- **Best For:** Console-style music players, cinematic libraries

**Key Features:**
- Fullscreen background art with 70% dimming overlay
- Album metadata positioned in bottom-left
- Horizontal ribbon of tracks at bottom edge (scroll-snap enabled)
- Playback controls in bottom-right
- Side lyrics panel (optional)
- Airy, spacious layout with 0.3s transitions

**CSS Variables:**
```css
--theme-bg-base: #000000
--theme-bg-surface: #0a0e27
--theme-accent-primary: #ffffff
--theme-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

**Scale & Transform:**
- Focus Scale: 1.1x
- Glow Shadow: 0 0 30px rgba(255,255,255,0.6)
- Transition: 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)

---

### 4. 🎡 **ES-DE System Wheel**
**Theme ID:** `es-de-wheel`

**Vibe:** EmulationStation / Arcade Cabinet / RetroHandheld
- **Colors:** Bright Cyan (#00d4ff) and Hot Pink (#ff006e)
- **Layout:** Split-screen 60/40 (left=album, right=tracks)
- **List Style:** Vertical carousel with neon accents
- **Focus State:** Items scale 1.3x, center-aligned, bright border
- **Marquee:** Text scrolling for overflow
- **Best For:** Retro gaming aesthetic, arcade cabinet feel

**Key Features:**
- 60% left section: Album cover (crisp bordered square) + metadata (BPM, Genre, Year)
- 40% right section: Vertical track list with scroll-snap-type: y
- Active track: 1.3x scale, centered, bright cyan border with 0.5 glow
- Smooth gradient background on right section
- Neon cyan scrollbars
- Rounded 4px borders (retro feel without full blockiness)

**CSS Variables:**
```css
--theme-bg-base: #1a1a1a
--theme-bg-surface: #242424
--theme-accent-primary: #00d4ff (Bright Cyan)
--theme-accent-secondary: #ff006e (Hot Pink)
--theme-text-muted: #888888
```

**Scale & Transform:**
- Focus Scale: 1.3x
- Marquee Animation: 10s linear infinite
- Transition: 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)

---

### 5. 📺 **Big Picture Grid**
**Theme ID:** `big-picture-grid`

**Vibe:** Steam Big Picture Mode, Dense Media Library
- **Colors:** Dodger Blue (#1e90ff) on deep charcoal (#121212)
- **Layout:** Dense grid of square album covers (NO GAPS)
- **Background:** Solid deep charcoal (#121212)
- **Focus:** Items pop out (z-index: 10), scale 1.15x, heavy drop shadow
- **Titles:** Overlaid only on active/focused items
- **Best For:** Large music/video libraries, Steam-like interfaces

**Key Features:**
- Dense grid layout (repeat(auto-fill, minmax(200px, 1fr)))
- Grid gap: 0 (no spacing, maximum density)
- Items scale 1.15x on focus with outward transform
- Heavy drop shadow on focused items (20px offset)
- Bottom playback panel with progress bar and current track
- Smooth grid scrolling with scroll-snap-align: center
- Dodger blue accent color throughout

**CSS Variables:**
```css
--theme-bg-base: #121212
--theme-bg-surface: #1e1e1e
--theme-accent-primary: #1e90ff (Dodger Blue)
--theme-text-muted: #757575
--theme-border-radius: 0px
```

**Scale & Transform:**
- Focus Scale: 1.15x
- Drop Shadow: 0 20px 60px rgba(0,0,0,0.9)
- Glow Shadow: 0 0 40px rgba(30,144,255,0.6)
- Transition: 0.2s ease

---

### 6. ⚡ **Neon Arcade / Console (AMOLED Optimized)**
**Theme ID:** `neon-arcade-amoled`

**Vibe:** Minimalist Cyberpunk, High-Contrast, Battery Saver
- **Colors:** Electric Cyan (#06b6d4) on PURE BLACK (#000000)
- **Layout:** Split fullscreen with wireframe borders (minimal illumination)
- **Philosophy:** AMOLED battery efficiency, maximum contrast
- **Focus State:** Vibrant accent border, subtle glow, scale 1.12x
- **Unfocused:** Deep grey (#71717a), transparent backgrounds
- **Best For:** AMOLED displays, minimalist aesthetics, battery-conscious apps

**Key Features:**
- **Strict Pure Black:** #000000 base background (AMOLED pixel-off efficiency)
- **Wireframe Design:** Structural borders instead of filled backgrounds
- **Minimal Illumination:** Unfocused text in #71717a (dark grey)
- **Isolated Album Art:** Crisp square container (not full-bleed)
- **Localized Glow:** Only around active album art
- **High Contrast Focus:** Bright cyan accent ONLY on active items
- **Left/Right Split:** 50/50 layout with vertical divider
- **Progress Bar Glow:** Cyan glow on active playback
- **Neon Pulse:** Optional animation on active track (2s cycle)

**CSS Variables:**
```css
--theme-bg-base: #000000 (STRICT PURE BLACK)
--theme-bg-surface: #09090b
--theme-accent-primary: #06b6d4 (Electric Cyan)
--theme-accent-secondary: #22c55e (Neon Green)
--theme-text-primary: #ffffff
--theme-text-muted: #71717a (Deep Grey)
--theme-border: #18181b (Structural Wireframe)
```

**Scale & Transform:**
- Focus Scale: 1.12x (subtle, not disruptive)
- Glow Shadow: 0 0 20px rgba(6,182,212,0.3) to 0 0 30px rgba(6,182,212,0.5)
- Pulse Animation: Optional 2s ease-in-out infinite
- Transition: 0.2s ease

**AMOLED Optimizations:**
- Pure black backgrounds = AMOLED pixels completely OFF
- Wireframe borders instead of large filled areas
- Minimal neon color usage (accents only)
- Dark grey (#71717a) for text (not bright white everywhere)
- Localized glows around active elements only

---

## 🎯 Design System Constraints

### 1. Layout
- **Fullscreen Fixed:** 100vw × 100vh, `overflow: hidden`
- **No Vertical Scrolling:** Content either fits or uses scroll-snap
- **No Page Reflow:** Fixed positioning for 10-foot navigation

### 2. Background Strategy
- **Hero Background:** Album art or gradient
- **Dimming Overlay:** 60-70% opacity black overlay (except AMOLED)
- **AMOLED Special:** Pure #000000 base, wireframe borders

### 3. Spatial Navigation
- **Focus-First Design:** `:focus` and `.is-active` states most important
- **Carousel/Scroll-Snap:** Smooth, snappy scrolling (not free-form)
- **Scale on Focus:** Items physically scale up when active
- **Visual Clarity:** High contrast between active/inactive

### 4. Interaction Patterns
- **Controller-Friendly:** Arrow keys navigate, Enter to select
- **Smooth Animations:** Cubic-bezier easing (0.15s - 0.3s)
- **Hover + Focus:** Both states supported for mouse + gamepad
- **No Hover-Only:** Must work with keyboard/gamepad too

---

## 🛠️ Implementation Guide

### Apply a Theme Programmatically

```typescript
import { themeManager } from '@/themes/manager'

// Set theme
themeManager.setTheme('playnite-modern')

// Get current theme
const theme = themeManager.getTheme()

// List all themes
const available = themeManager.getAvailableThemes()
```

### Apply a Theme via HTML

```html
<div data-theme="neon-arcade-amoled" class="fullscreen-player">
  <!-- Your content here -->
</div>
```

### Required CSS Setup

```css
html, body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.fullscreen-player {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
```

### Focus States

```jsx
// JavaScript: Add .is-active class
<div className={`grid-item ${isActive ? 'is-active' : ''}`}>
  {/* content */}
</div>

// Or use CSS :focus-within
<div className="track-item" tabIndex={0}>
  {/* content */}
</div>

/* CSS will handle :focus-within automatically */
```

---

## 🎨 CSS Variable Reference

All themes use CSS custom properties for easy customization:

```css
/* Background Colors */
--theme-bg-base       /* Main background */
--theme-bg-surface    /* Card/surface background */

/* Accent Colors */
--theme-accent-primary    /* Primary interactive color */
--theme-accent-secondary  /* Secondary accent */

/* Text Colors */
--theme-text-primary  /* Main text */
--theme-text-muted    /* Secondary/disabled text */

/* Structural */
--theme-border        /* Border color */
--theme-shadow        /* Shadow color */
--theme-border-radius /* Corner radius */

/* Animation */
--theme-transition-duration  /* e.g., 0.2s */
```

### Override Theme Variables

```css
:root[data-theme="playnite-modern"] {
  --theme-accent-primary: #ff0000; /* Custom override */
}
```

---

## 📊 Theme Comparison Matrix

| Aspect | Retro Arcade | Playnite | ES-DE | Big Picture | Neon AMOLED |
|--------|---|---|---|---|---|
| **Scale on Focus** | 0.95x | 1.1x | 1.3x | 1.15x | 1.12x |
| **Primary Color** | Cyan | White | Cyan | Blue | Cyan |
| **Background** | Black | Black | Black | Charcoal | Pure Black |
| **Font** | Monospace | Sans | Sans | Sans | Sans |
| **Layout** | Single | Single | Split 60/40 | Grid Dense | Split 50/50 |
| **Transition** | 0.15s | 0.3s | 0.25s | 0.2s | 0.2s |
| **Best For** | Retro | Cinematic | Arcade | Library | AMOLED |
| **AMOLED Friendly** | ✓ | ✓ | ✓ | ✓ | ⭐⭐⭐ |

---

## 🎬 Animation Details

### Scale Easing (Most Themes)
```css
cubic-bezier(0.34, 1.56, 0.64, 1)  /* Overshoot effect */
```

### Playnite Modern Easing
```css
cubic-bezier(0.25, 0.46, 0.45, 0.94)  /* Smooth, controlled */
```

### Neon Pulse (AMOLED)
```css
@keyframes neon-pulse {
  0%, 100% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.3); }
  50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.5); }
}
```

---

## ♿ Accessibility

All themes support:
- **Keyboard Navigation:** Arrow keys + Enter
- **Gamepad Support:** Via Gamepad API
- **Focus Indicators:** Clear visible focus states
- **High Contrast:** Minimum WCAG AA contrast ratios
- **ARIA Labels:** Proper semantic markup

---

## 📝 File Structure

```
src/themes/
├── retroArcade.ts          # 1980s Synthwave
├── default.ts              # Minimal Dark Mode
├── playniteModern.ts       # PS5 Cinema Mode
├── esDeWheel.ts            # Arcade Carousel
├── bigPictureGrid.ts       # Grid Library
├── neonArcadeAmoled.ts     # AMOLED Cyberpunk
├── manager.ts              # Theme registry & switching
├── types.ts                # TypeScript interfaces
└── 10-FOOT-THEMES-REFERENCE.ts  # HTML structure examples
```

---

## 🚀 Future Enhancements

Potential themes for future implementation:
- **Glassmorphism:** Frosted glass effect, premium feel
- **Neubrutalism:** Brutalist design with bold typography
- **Neon Cyberpunk Full:** Extended AMOLED-optimized theme
- **Minimal Waveform:** Music-first with audio visualizers
- **Dark Matter:** Spacey, ambient aesthetic

---

## 📄 License

These themes are part of the Music Stuff application and follow the same license as the parent project.
