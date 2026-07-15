import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase
vi.mock('./src/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
  storage: {},
}))

// Mock MediaMetadata
global.MediaMetadata = class {
  constructor(
    public metadata: {
      title?: string
      artist?: string
      album?: string
      artwork?: Array<{ src: string; sizes: string; type: string }>
    },
  ) {}
} as any

// Mock HTMLMediaElement methods
Object.defineProperty(HTMLAudioElement.prototype, 'play', {
  configurable: true,
  value: vi.fn(() => Promise.resolve()),
})

Object.defineProperty(HTMLAudioElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(),
})

Object.defineProperty(HTMLAudioElement.prototype, 'load', {
  configurable: true,
  value: vi.fn(),
})

// Mock navigator.mediaSession
Object.defineProperty(navigator, 'mediaSession', {
  configurable: true,
  value: {
    metadata: null,
    setActionHandler: vi.fn(),
  },
})
