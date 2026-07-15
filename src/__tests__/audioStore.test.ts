import { describe, it, expect, beforeEach } from 'vitest'
import { useAudioStore } from '../src/store/audioStore'

describe('Audio Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useAudioStore.getState()
    useAudioStore.setState({
      tracks: store.tracks,
      currentTrackId: store.tracks[0]?.id ?? null,
      queue: store.tracks.map((t) => t.id),
      playedInShuffle: [],
      favorites: [],
      recentlyPlayed: [],
      repeatMode: 'off',
      shuffled: false,
      volume: 0.8,
    })
  })

  describe('Queue Navigation', () => {
    it('should play next track in queue', () => {
      const store = useAudioStore.getState()
      const initialTrackId = store.currentTrackId
      store.playNext()

      const updatedStore = useAudioStore.getState()
      expect(updatedStore.currentTrackId).not.toBe(initialTrackId)
      expect(updatedStore.queue).toContain(updatedStore.currentTrackId)
    })

    it('should play previous track in queue', () => {
      const store = useAudioStore.getState()
      // Move to next track first
      store.playNext()
      const currentId = useAudioStore.getState().currentTrackId

      // Now go back
      store.playPrevious()
      const previousId = useAudioStore.getState().currentTrackId

      expect(previousId).not.toBe(currentId)
    })

    it('should wrap around to first track when repeat all is enabled', () => {
      const store = useAudioStore.getState()
      const queue = store.queue
      const lastTrackId = queue[queue.length - 1]

      useAudioStore.setState({ currentTrackId: lastTrackId, repeatMode: 'all' })
      store.playNext()

      const newState = useAudioStore.getState()
      expect(newState.currentTrackId).toBe(queue[0])
    })

    it('should not advance to next track when repeat one is enabled', () => {
      const store = useAudioStore.getState()
      useAudioStore.setState({ repeatMode: 'one' })
      const currentId = store.currentTrackId

      store.playNext()
      const newState = useAudioStore.getState()
      expect(newState.currentTrackId).toBe(currentId)
    })
  })

  describe('Shuffle', () => {
    it('should shuffle the queue when shuffle is toggled on', () => {
      const store = useAudioStore.getState()
      const originalQueue = [...store.queue]

      store.toggleShuffle()
      const shuffledState = useAudioStore.getState()

      expect(shuffledState.shuffled).toBe(true)
      expect(shuffledState.queue.length).toBe(originalQueue.length)
      // All tracks should still be present
      expect(new Set(shuffledState.queue)).toEqual(new Set(originalQueue))
    })

    it('should restore original queue order when shuffle is toggled off', () => {
      const store = useAudioStore.getState()
      const originalQueue = store.tracks.map((t) => t.id)

      store.toggleShuffle()
      store.toggleShuffle()

      const restoredState = useAudioStore.getState()
      expect(restoredState.shuffled).toBe(false)
      expect(restoredState.queue).toEqual(originalQueue)
    })

    it('should not repeat tracks in shuffle mode until all are played', () => {
      const store = useAudioStore.getState()
      const { queue } = store

      store.toggleShuffle()
      useAudioStore.setState({ repeatMode: 'off' })

      const playedTracks = new Set<string>()
      let currentId = useAudioStore.getState().currentTrackId

      // Play through all tracks
      for (let i = 0; i < queue.length; i++) {
        playedTracks.add(currentId)
        store.playNext()
        currentId = useAudioStore.getState().currentTrackId
      }

      // All tracks should have been played exactly once
      expect(playedTracks.size).toBe(queue.length)
    })
  })

  describe('Repeat Modes', () => {
    it('should cycle through repeat modes: off -> all -> one -> off', () => {
      const store = useAudioStore.getState()

      store.cycleRepeat()
      expect(useAudioStore.getState().repeatMode).toBe('all')

      store.cycleRepeat()
      expect(useAudioStore.getState().repeatMode).toBe('one')

      store.cycleRepeat()
      expect(useAudioStore.getState().repeatMode).toBe('off')
    })
  })

  describe('Favorites', () => {
    it('should toggle favorite status for a track', () => {
      const store = useAudioStore.getState()
      const trackId = store.tracks[0]?.id

      if (trackId) {
        store.toggleFavorite(trackId)
        expect(useAudioStore.getState().favorites).toContain(trackId)

        store.toggleFavorite(trackId)
        expect(useAudioStore.getState().favorites).not.toContain(trackId)
      }
    })
  })

  describe('Recently Played', () => {
    it('should add track to recently played list', () => {
      const store = useAudioStore.getState()
      const trackId = store.tracks[0]?.id

      if (trackId) {
        store.addRecentlyPlayed(trackId)
        expect(useAudioStore.getState().recentlyPlayed).toContain(trackId)
      }
    })

    it('should keep recently played list limited to 20 items', () => {
      const store = useAudioStore.getState()
      const trackIds = store.tracks.map((t) => t.id)

      // Add more than 20 tracks
      for (let i = 0; i < 25; i++) {
        store.addRecentlyPlayed(trackIds[i % trackIds.length])
      }

      expect(useAudioStore.getState().recentlyPlayed.length).toBeLessThanOrEqual(20)
    })
  })

  describe('Volume Control', () => {
    it('should set volume to specified value', () => {
      const store = useAudioStore.getState()
      store.setVolume(0.5)

      expect(useAudioStore.getState().volume).toBe(0.5)
    })
  })

  describe('Track Management', () => {
    it('should add a new track to the store', () => {
      const store = useAudioStore.getState()
      const initialLength = store.tracks.length

      const newTrack = {
        id: 'new-track-123',
        title: 'New Track',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        audioUrl: 'https://example.com/audio.mp3',
        coverUrl: 'https://example.com/cover.jpg',
        ownerId: 'test-user',
        lyrics: [],
      }

      store.addTrack(newTrack)

      const updatedStore = useAudioStore.getState()
      expect(updatedStore.tracks.length).toBe(initialLength + 1)
      expect(updatedStore.tracks).toContainEqual(newTrack)
    })
  })
})
