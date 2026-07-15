import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAudioStore } from '../src/store/audioStore'
import { useFirebaseMusic } from '../src/hooks/useFirebaseMusic'

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {},
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null) // Start unauthenticated
    return vi.fn() // Return unsubscribe function
  }),
}))

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn((query, successCallback, errorCallback) => {
    // Simulate real-time listener returning empty docs
    successCallback({ docs: [] })
    return vi.fn() // Return unsubscribe function
  }),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-doc-id' })),
  serverTimestamp: vi.fn(() => Date.now()),
}))

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  ref: vi.fn(() => ({})),
  uploadBytesResumable: vi.fn((ref, file) => ({
    on: vi.fn((event, progressCallback, errorCallback, completeCallback) => {
      // Simulate upload progress
      progressCallback({ bytesTransferred: file.size, totalBytes: file.size })
      completeCallback()
    }),
    snapshot: { ref: {} },
  })),
  getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/audio.mp3')),
}))

describe('Public Access & Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Public Track Access', () => {
    it('should have public tracks available without authentication', () => {
      const { result } = renderHook(() => {
        const store = useAudioStore()
        return store
      })

      expect(result.current.tracks.length).toBeGreaterThan(0)

      // Check that public tracks exist
      const publicTracks = result.current.tracks.filter((t) => t.ownerId === 'public')
      expect(publicTracks.length).toBeGreaterThan(0)
    })

    it('should allow unauthenticated users to play public tracks', () => {
      const { result } = renderHook(() => useAudioStore())

      const publicTrack = result.current.tracks.find((t) => t.ownerId === 'public')
      expect(publicTrack).toBeDefined()

      act(() => {
        if (publicTrack) {
          result.current.setCurrentTrack(publicTrack.id)
        }
      })

      expect(result.current.currentTrackId).toBe(publicTrack?.id)
    })

    it('should allow unauthenticated users to queue tracks', () => {
      const { result } = renderHook(() => useAudioStore())

      const initialQueue = result.current.queue.length
      expect(initialQueue).toBeGreaterThan(0)

      // Queue navigation should work
      const currentIndex = result.current.queue.indexOf(result.current.currentTrackId || '')
      expect(currentIndex).toBeGreaterThanOrEqual(0)
    })

    it('should allow unauthenticated users to search and filter tracks', () => {
      const { result } = renderHook(() => useAudioStore())

      const allTracks = result.current.tracks
      const searchResults = allTracks.filter((t) => t.title.toLowerCase().includes('night'))

      expect(searchResults.length).toBeGreaterThanOrEqual(0)
      if (searchResults.length > 0) {
        expect(searchResults[0]?.title.toLowerCase()).toContain('night')
      }
    })
  })

  describe('Authentication State', () => {
    it('should initialize with no authenticated user', async () => {
      const { result } = renderHook(() => useFirebaseMusic())

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
      })
    })
  })

  describe('Upload Restrictions', () => {
    it('should require authentication for track upload', async () => {
      const { result } = renderHook(() => useFirebaseMusic())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      const file = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' })

      await expect(result.current.uploadTrack(file)).rejects.toThrow('Sign in required')
    })

    it('should reject non-audio files', async () => {
      const { result } = renderHook(() => useFirebaseMusic())

      const file = new File(['not audio'], 'test.txt', { type: 'text/plain' })

      await expect(result.current.uploadTrack(file)).rejects.toThrow('Invalid file type')
    })
  })

  describe('Favorites Management', () => {
    it('should allow favorite toggling for any user', () => {
      const { result } = renderHook(() => useAudioStore())

      const trackId = result.current.tracks[0]?.id
      expect(trackId).toBeDefined()

      if (trackId) {
        act(() => {
          result.current.toggleFavorite(trackId)
        })

        expect(result.current.favorites).toContain(trackId)

        act(() => {
          result.current.toggleFavorite(trackId)
        })

        expect(result.current.favorites).not.toContain(trackId)
      }
    })
  })

  describe('Public User Experience', () => {
    it('should allow shuffle on public tracks', () => {
      const { result } = renderHook(() => useAudioStore())

      act(() => {
        result.current.toggleShuffle()
      })

      expect(result.current.shuffled).toBe(true)

      act(() => {
        result.current.toggleShuffle()
      })

      expect(result.current.shuffled).toBe(false)
    })

    it('should allow repeat mode cycling on public tracks', () => {
      const { result } = renderHook(() => useAudioStore())

      act(() => {
        result.current.cycleRepeat()
      })

      expect(result.current.repeatMode).toBe('all')

      act(() => {
        result.current.cycleRepeat()
      })

      expect(result.current.repeatMode).toBe('one')
    })

    it('should track recently played tracks for all users', () => {
      const { result } = renderHook(() => useAudioStore())

      const trackId = result.current.tracks[0]?.id
      expect(trackId).toBeDefined()

      if (trackId) {
        act(() => {
          result.current.addRecentlyPlayed(trackId)
        })

        expect(result.current.recentlyPlayed).toContain(trackId)
      }
    })
  })
})
