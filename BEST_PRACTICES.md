# Development Best Practices

## TypeScript & Type Safety

✅ **Always define types explicitly**

```typescript
// ❌ Avoid
function handleClick(event: any) { }

// ✅ Prefer
function handleClick(event: React.MouseEvent<HTMLButtonElement>) { }
```

✅ **Use interfaces for component props**

```typescript
// ✅
interface PlayerProps {
  track: Track
  isPlaying: boolean
  onTogglePlay: () => void
}

export function Player({ track, isPlaying, onTogglePlay }: PlayerProps) {
  // ...
}
```

✅ **Extract common types to `types.ts`**

```typescript
// src/types.ts
export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  lyrics?: LyricLine[]
}

export interface LyricLine {
  time: number
  text: string
}
```

---

## React & Hooks

✅ **Separate concerns into multiple hooks**

When using effects, split by dependency:

```typescript
// ✅ Good
useEffect(() => {
  audio.src = currentTrack.audioUrl
  audio.load()
}, [currentTrack.id])  // Only runs on track change

useEffect(() => {
  if (isPlaying) audio.play()
  else audio.pause()
}, [isPlaying])  // Only runs on play state change
```

❌ **Avoid combined effects that re-trigger unrelated code**

```typescript
// ❌ Bad - triggers both audio load and play/pause on any change
useEffect(() => {
  audio.src = currentTrack.audioUrl
  if (isPlaying) audio.play()
}, [currentTrack.id, isPlaying])
```

✅ **Use custom hooks for complex logic**

```typescript
// src/hooks/useAudioPlayer.ts
export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  
  // Complex logic here
  
  return { isPlaying, setIsPlaying, currentTime, /* ... */ }
}

// In component
function Player() {
  const { isPlaying, setIsPlaying } = useAudioPlayer()
  return <button onClick={() => setIsPlaying(!isPlaying)}>Play</button>
}
```

✅ **Use React.memo for expensive components**

```typescript
// Prevent re-renders when props haven't changed
export const TrackRow = React.memo(function TrackRow({ track, isActive }: Props) {
  return <div>{track.title}</div>
})
```

---

## State Management (Zustand)

✅ **Keep store actions focused**

```typescript
// ✅
export const useAudioStore = create((set) => ({
  tracks: [],
  setTracks: (tracks) => set({ tracks }),
  
  playNext: () => set((state) => ({
    // Fisher-Yates shuffle logic
  })),
}))
```

✅ **Use selectors to avoid unnecessary re-renders**

```typescript
// ✅ Only re-render when currentTrackId changes
const currentTrackId = useAudioStore((state) => state.currentTrackId)

// ❌ Avoid - re-renders on any store change
const { currentTrackId, tracks, ... } = useAudioStore()
```

---

## Performance

✅ **Lazy load heavy components**

```typescript
const FullPlayer = React.lazy(() => import('./components/FullPlayer'))

function App() {
  const [showFullPlayer, setShowFullPlayer] = useState(false)
  
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        {showFullPlayer && <FullPlayer />}
      </Suspense>
    </>
  )
}
```

✅ **Use useCallback for stable function references**

```typescript
const handlePlayTrack = useCallback((trackId: string) => {
  playTrack(trackId)
}, [])  // Stable reference across re-renders
```

✅ **Memoize expensive calculations**

```typescript
const filteredTracks = useMemo(() => {
  return tracks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase())
  )
}, [tracks, search])  // Only recalculate when deps change
```

---

## Accessibility

✅ **Always include alt text and ARIA labels**

```typescript
// ✅
<button
  aria-label="Play track"
  onClick={handlePlay}
  title="Play"
>
  <PlayIcon size={24} />
</button>

<img src="/track.jpg" alt="Album artwork for Track Name" />
```

✅ **Support keyboard navigation**

```typescript
// ✅ Handles both mouse and keyboard
<button onClick={handleClick} onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') handleClick()
}} />
```

✅ **Use semantic HTML**

```typescript
// ✅
<nav>
  <ul>
    <li><a href="/library">Library</a></li>
  </ul>
</nav>

// ❌
<div>
  <span onClick={() => {}}>Library</span>
</div>
```

---

## Error Handling

✅ **Handle async operations gracefully**

```typescript
// ✅
async function playTrack(trackId: string) {
  try {
    const track = tracks.find(t => t.id === trackId)
    if (!track) throw new Error('Track not found')
    
    audio.src = track.audioUrl
    await audio.play().catch(err => {
      console.warn('Autoplay prevented:', err)
    })
  } catch (error) {
    console.error('Play error:', error)
    showNotification('Failed to play track')
  }
}
```

✅ **Provide fallbacks**

```typescript
// ✅ Fallback to manifest if Firebase fails
try {
  const tracks = await loadTracksFromFirebase()
  setTracks(tracks)
} catch (error) {
  console.warn('Firebase load failed, using manifest')
  const manifest = await fetch('/publicManifest.json')
  const tracks = (await manifest.json()).tracks
  setTracks(tracks)
}
```

---

## Code Organization

✅ **Keep components focused and single-responsibility**

```
components/
├── Player.tsx                    # Bottom playback bar only
├── FullPlayer.tsx               # Full-screen player only
├── TrackRow.tsx                 # Single track item only
└── ...
```

✅ **Group related logic in hooks**

```
hooks/
├── useAudioPlayer.ts            # Audio engine + controls
├── useAudioStore.ts             # Global state
├── useLoadManifest.ts           # Data loading
├── useTheme.ts                  # Theme switching
└── ...
```

✅ **Centralize configuration**

```typescript
// src/config.ts
export const CONFIG = {
  AUDIO_DIR: '/audio/mp3',
  THUMBNAIL_DIR: '/audio/thumbnails',
  MAX_VOLUME: 1.0,
  MIN_VOLUME: 0.0,
  DEFAULT_THEME: 'retro-arcade',
}
```

---

## Testing

✅ **Write tests for critical functions**

```typescript
// ✅ Test pure functions
describe('audioStore', () => {
  it('should shuffle queue correctly', () => {
    const store = useAudioStore.getState()
    store.setTracks([track1, track2, track3])
    store.playNext()
    
    expect(store.queue).toHaveLength(3)
  })
})
```

✅ **Test component rendering**

```typescript
// ✅ Vitest + React Testing Library
import { render, screen } from '@testing-library/react'
import { Player } from './Player'

describe('Player', () => {
  it('renders play button', () => {
    render(<Player isPlaying={false} onToggle={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

---

## Naming Conventions

✅ **Use clear, descriptive names**

```typescript
// ✅
const handlePlayTrackClick = () => {}
const isTrackPlaying = true
const currentTrackIndex = 0

// ❌
const handle = () => {}
const playing = true
const idx = 0
```

✅ **Prefix boolean variables with "is", "has", "can"**

```typescript
const isPlaying = true
const hasLyrics = true
const canShuffleQueue = true
```

✅ **Use PascalCase for components**

```typescript
export function PlayerBar() { }
export function TrackRow() { }

// Not: playerBar() or track_row()
```

---

## Git Workflow

✅ **Commit frequently with descriptive messages**

```bash
git commit -m "feat: add theme switcher component"
git commit -m "fix: prevent double playback on track change"
git commit -m "refactor: separate audio effects in useAudioPlayer"
```

✅ **Use conventional commits**

```
feat:   New feature
fix:    Bug fix
refactor: Code restructuring
perf:   Performance improvement
docs:   Documentation
test:   Tests
```

---

## Documentation

✅ **Comment complex logic**

```typescript
// Fisher-Yates shuffle algorithm for unbiased randomization
function shuffle(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
```

✅ **Document unusual patterns**

```typescript
// CRITICAL: Two separate effects prevent race conditions
// Effect 1 loads audio on track change
// Effect 2 plays/pauses based on isPlaying state
// DO NOT combine - causes double playback!
```

✅ **Keep README.md and ARCHITECTURE.md updated**

---

## Build & Deploy

✅ **Always type-check before building**

```bash
npm run type-check
npm run build
```

✅ **Minimize bundle size**

```bash
# Check bundle size
npm run build
# Output shows: 886.02 kB → optimization target

# Use dynamic imports
const FullPlayer = React.lazy(() => import('./components/FullPlayer'))
```

✅ **Test in production mode**

```bash
npm run build
npm run preview  # Local production preview
```

---

## Useful Commands

```bash
# Development
npm run dev                # Start dev server
npm run type-check         # TypeScript validation
npm run lint               # ESLint check

# Build & Deploy
npm run build              # Production build
npm run preview            # Preview production build

# Maintenance
npm outdated               # Check dependency updates
npm audit                  # Security vulnerabilities
```

---

## Resources

- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)
- [Web Accessibility](https://www.w3.org/WAI/)
