# Music Player Architecture & Development Guide

## Project Overview

A **React 19 + Vite + TypeScript** music player web application with:
- 128 pre-loaded audio tracks (MP3 format)
- Real-time lyrics display with auto-scroll
- Firebase authentication and storage integration
- Theme system with multiple visual themes (Retro Arcade, Glassmorphism, Neubrutalism)
- Zustand global state management
- Fullscreen player with responsive design

**GitHub:** [Music Stuff Repository](https://github.com/yourusername/music-stuff)

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (localhost:5173)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## Project Structure

```
src/
├── components/          # React UI components
│   ├── Player.tsx       # Bottom playback bar
│   ├── FullPlayer.tsx   # Fullscreen player with lyrics
│   ├── LyricsView.tsx   # Lyrics display with auto-scroll
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── TrackRow.tsx     # Individual track item
│   ├── ThemeSwitcher.tsx# Theme selector dropdown
│   └── ...
├── hooks/
│   ├── useAudioPlayer.ts    # Audio engine wrapper (HTML5 Audio + MediaSession)
│   ├── useAudioStore.ts     # Global audio state (Zustand)
│   ├── useLoadManifest.ts   # Load track catalog from JSON
│   ├── useTheme.ts          # Theme switching hook
│   └── ...
├── themes/
│   ├── manager.ts       # Theme registry and switching
│   ├── retroArcade.ts   # Retro Arcade/Synthwave theme
│   ├── types.ts         # Theme type definitions
│   └── (future: glassmorphism.ts, neubrutalism.ts)
├── store/
│   └── audioStore.ts    # Zustand store: tracks, queue, playback state
├── lib/
│   └── firebase.ts      # Firebase initialization and helpers
├── types.ts             # Global TypeScript interfaces
├── App.tsx              # Root component
└── main.tsx             # Entry point

public/
├── publicManifest.json  # 128 track catalog with metadata & lyrics
└── audio/
    ├── mp3/             # 128 MP3 audio files
    └── thumbnails/      # Album artwork (JPG)

scripts/
├── extract_durations.py # Extract MP3 duration metadata
├── generate_lyrics.py   # Generate thematic lyrics for tracks
└── extract_thumbnails.py# Extract artwork from video files
```

---

## Key Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| Vite | 8.1.4 | Build tool & dev server |
| TypeScript | ~6.0.2 | Type safety |
| Zustand | Latest | State management |
| Tailwind CSS | Latest | Styling |
| Firebase | v12 | Auth + Firestore + Storage |
| Radix UI | - | Accessible components |
| Lucide React | - | Icon library |

---

## Core Systems

### 1. Audio Engine (`useAudioPlayer.ts`)

**Two-effect architecture prevents race conditions:**

```typescript
// Effect 1: Load track (depends on currentTrackId)
- Pause current playback
- Reset playback position
- Load new audio source
- Call audio.load()

// Effect 2: Control playback state (depends on isPlaying)
- Call audio.play() or audio.pause()
- Handles promise rejection gracefully
```

**MediaSession API integration:**
- Responds to system media controls (play/pause/next/prev)
- Displays track metadata in lock screen / notification

### 2. Global State (`store/audioStore.ts`)

**Zustand store manages:**
- `tracks[]` - All available tracks
- `currentTrackId` - Now playing track
- `queue[]` - Shuffled playback queue
- `favorites[]`, `recentlyPlayed[]` - User collections
- `repeatMode`, `shuffled` - Playback settings

**Key actions:**
- `playNext()` - Fisher-Yates shuffle for queue
- `playPrevious()` - Return to previous track
- `setTracks()` - Load track catalog

### 3. Theme System (`src/themes/`)

**Theme registry pattern:**
- `ThemeManager` - Central switcher
- Saves theme preference to `localStorage`
- Injects CSS variables dynamically
- Emits `theme-changed` event for listeners

**Current themes:**
- ✅ `retro-arcade` - Neon cyan/magenta, blocky buttons
- 🔲 `glassmorphism` - Frosted glass, blurred backgrounds
- 🔲 `neubrutalism` - High-contrast, thick borders

### 4. Manifest System (`public/publicManifest.json`)

**128 pre-generated tracks with:**
```json
{
  "id": "1",
  "title": "After the Power Dies",
  "artist": "Anuraag Rao",
  "album": "Tetra Overflow Ultra",
  "duration": 178,           // Exact duration in seconds
  "audioUrl": "/audio/mp3/...",
  "coverUrl": "/audio/thumbnails/...",
  "lyrics": [                // Pre-generated lyrics
    { "time": 0, "text": "..." },
    { "time": 5.5, "text": "..." }
  ]
}
```

---

## Common Tasks for Future Development

### Adding a New Component

1. Create file in `src/components/ComponentName.tsx`
2. Use functional component with TypeScript
3. Import and use hooks as needed
4. Export as named export

```typescript
export function MyComponent({ prop }: { prop: string }) {
  const { /* hooks */ } = useAudioStore()
  return <div>...</div>
}
```

### Adding a New Theme

1. Create file `src/themes/myTheme.ts`
2. Define `Theme` object matching `src/themes/types.ts`
3. Export `cssString` with theme styles
4. Add to `themeRegistry` in `src/themes/manager.ts`

```typescript
export const myTheme: Theme = { /* ... */ }
export const myThemeCss = ` /* ... */ `

// In manager.ts
themeRegistry['my-theme'] = { theme: myTheme, css: myThemeCss }
```

### Modifying Track Metadata

1. Edit `public/publicManifest.json` directly, OR
2. Run Python scripts:
   ```bash
   uv run python scripts/extract_durations.py
   uv run python scripts/generate_lyrics.py
   ```

### Adding Firebase Features

1. Edit `src/lib/firebase.ts` for new services
2. Use in hooks: `src/hooks/useFirebaseMusic.ts`
3. Dispatch Zustand actions for global state updates

---

## Best Practices Implemented

✅ **Type Safety**
- Full TypeScript coverage
- Explicit interface definitions
- No `any` types

✅ **Performance**
- Separated concerns into multiple effects
- Zustand for efficient state updates
- Lazy component loading via React.lazy()

✅ **Accessibility**
- ARIA labels on buttons
- Keyboard navigation support
- Semantic HTML

✅ **Error Handling**
- Try-catch in App component
- Graceful Firebase fallback
- User-friendly error messages

✅ **Code Organization**
- Clear folder structure
- Logical component hierarchy
- Reusable hooks and utilities

---

## Deployment

### Build & Deploy

```bash
# TypeScript compilation
npm run type-check

# Build optimized bundle
npm run build

# Output: dist/ folder (~886 kB minified)

# Deploy to Vercel, Netlify, or Firebase Hosting
vercel deploy
```

### Environment Variables (.env.local)

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=music-stuff-7420.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=music-stuff-7420
VITE_FIREBASE_STORAGE_BUCKET=music-stuff-7420.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tracks not loading | Check `public/publicManifest.json` exists and is valid JSON |
| Audio not playing | Verify MP3 files in `public/audio/mp3/` |
| Firebase errors | Check `.env.local` credentials; falls back to manifest loading |
| Lyrics not showing | Check manifest `lyrics` array has entries |
| Theme not switching | Clear localStorage and browser cache |

---

## Future Enhancements

- [ ] Implement Glassmorphism theme
- [ ] Implement Neubrutalism theme
- [ ] Add playlist creation UI
- [ ] Implement audio visualization
- [ ] Add equalizer controls
- [ ] Support drag-drop reordering
- [ ] PWA offline mode
- [ ] Spotify/Apple Music integration

---

## Contributors & Maintenance

Last Updated: 2026-07-16
Maintained by: [Your Name]

For questions or issues, refer to individual file comments and TypeScript interfaces.
