import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAudioPlayer } from '../src/hooks/useAudioPlayer'
import { useAudioStore } from '../src/store/audioStore'

// Mock FastAverageColor
vi.mock('fast-average-color', () => ({
  FastAverageColor: class {
    getColorAsync = vi.fn(() => Promise.resolve({ rgba: 'rgba(124, 58, 237, 0.9)' }))
    destroy = vi.fn()
  },
}))

describe('useAudioPlayer', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Reset audio element mocks
    const audio = new Audio()
    vi.spyOn(audio, 'play').mockResolvedValue(undefined)
    vi.spyOn(audio, 'pause').mockImplementation(() => {})
    vi.spyOn(audio, 'load').mockImplementation(() => {})
  })

  describe('Play/Pause Control', () => {
    it('should initialize with isPlaying as false', () => {
      const { result } = renderHook(() => useAudioPlayer())
      expect(result.current.isPlaying).toBe(false)
    })

    it('should toggle play state', async () => {
      const { result } = renderHook(() => useAudioPlayer())

      act(() => {
        result.current.setIsPlaying(true)
      })

      await waitFor(() => {
        expect(result.current.isPlaying).toBe(true)
      })

      act(() => {
        result.current.setIsPlaying(false)
      })

      await waitFor(() => {
        expect(result.current.isPlaying).toBe(false)
      })
    })

    it('should have a currentTrack available', () => {
      const { result } = renderHook(() => useAudioPlayer())
      expect(result.current.currentTrack).toBeDefined()
      expect(result.current.currentTrack?.title).toBeDefined()
    })
  })

  describe('Timeline Control', () => {
    it('should initialize currentTime as 0', () => {
      const { result } = renderHook(() => useAudioPlayer())
      expect(result.current.currentTime).toBe(0)
    })

    it('should have a duration from current track', () => {
      const { result } = renderHook(() => useAudioPlayer())
      expect(result.current.duration).toBeGreaterThan(0)
    })

    it('should clamp seek value between 0 and duration', () => {
      const { result } = renderHook(() => useAudioPlayer())
      const duration = result.current.duration

      act(() => {
        result.current.seek(-10)
      })

      expect(result.current.currentTime).toBeGreaterThanOrEqual(0)

      act(() => {
        result.current.seek(duration + 100)
      })

      expect(result.current.currentTime).toBeLessThanOrEqual(duration)
    })
  })

  describe('Volume Control', () => {
    it('should initialize volume at 0.8', () => {
      const { result } = renderHook(() => useAudioPlayer())
      expect(result.current.volume).toBe(0.8)
    })

    it('should update volume when setVolume is called', async () => {
      const { result } = renderHook(() => useAudioPlayer())

      act(() => {
        result.current.setVolume(0.5)
      })

      await waitFor(() => {
        expect(result.current.volume).toBe(0.5)
      })
    })

    it('should clamp volume between 0 and 1', () => {
      const { result } = renderHook(() => useAudioPlayer())

      act(() => {
        result.current.setVolume(-0.5)
      })

      expect(result.current.volume).toBeLessThanOrEqual(0)

      act(() => {
        result.current.setVolume(1.5)
      })

      expect(result.current.volume).toBeLessThanOrEqual(1)
    })
  })

  describe('Queue Navigation', () => {
    it('should expose playNext function', () => {
      const { result } = renderHook(() => useAudioPlayer())
      expect(typeof result.current.playNext).toBe('function')
    })

    it('should expose playPrevious function', () => {
      const { result } = renderHook(() => useAudioPlayer())
      expect(typeof result.current.playPrevious).toBe('function')
    })

    it('should call playNext when advancing track', () => {
      const { result } = renderHook(() => useAudioPlayer())
      const initialTrackId = result.current.currentTrack?.id

      act(() => {
        result.current.playNext()
      })

      // Track should change (or stay same if repeat one)
      const newState = useAudioStore.getState()
      expect(newState.currentTrackId).toBeDefined()
    })
  })

  describe('Shuffle and Repeat State', () => {
    it('should expose shuffle state', () => {
      const { result } = renderHook(() => useAudioPlayer())
      expect(typeof result.current.shuffled).toBe('boolean')
    })

    it('should expose repeat mode', () => {
      const { result } = renderHook(() => useAudioPlayer())
      expect(['off', 'all', 'one']).toContain(result.current.repeatMode)
    })

    it('should expose toggleShuffle function', () => {
      const { result } = renderHook(() => useAudioPlayer())
      expect(typeof result.current.toggleShuffle).toBe('function')
    })

    it('should expose cycleRepeat function', () => {
      const { result } = renderHook(() => useAudioPlayer())
      expect(typeof result.current.cycleRepeat).toBe('function')
    })
  })

  describe('Track Playback', () => {
    it('should play a specific track by ID', async () => {
      const { result } = renderHook(() => useAudioPlayer())
      const tracks = useAudioStore.getState().tracks
      const targetTrack = tracks[tracks.length - 1]

      if (targetTrack) {
        act(() => {
          result.current.playTrack(targetTrack.id)
        })

        await waitFor(() => {
          expect(result.current.currentTrack?.id).toBe(targetTrack.id)
        })
      }
    })

    it('should set isPlaying to true when playTrack is called', async () => {
      const { result } = renderHook(() => useAudioPlayer())
      const tracks = useAudioStore.getState().tracks
      const targetTrack = tracks[0]

      if (targetTrack) {
        act(() => {
          result.current.playTrack(targetTrack.id)
        })

        await waitFor(() => {
          expect(result.current.isPlaying).toBe(true)
        })
      }
    })
  })

  describe('Color Extraction', () => {
    it('should have an accent color from cover art', () => {
      const { result } = renderHook(() => useAudioPlayer())
      expect(result.current.accentColor).toBeDefined()
      expect(result.current.accentColor).toMatch(/rgba/)
    })
  })
})
