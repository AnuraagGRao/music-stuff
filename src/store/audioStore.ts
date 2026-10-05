import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Track } from '../types'

type RepeatMode = 'off' | 'one' | 'all'

type AudioState = {
  // Tracks & Queue
  tracks: Track[]
  currentTrackId: string | null
  queue: string[]
  playedInShuffle: string[]
  
  // User State
  favorites: string[]
  recentlyPlayed: string[]
  
  // Playback State
  repeatMode: RepeatMode
  shuffled: boolean
  volume: number
  isPlaying: boolean
  currentTime: number
  
  // Actions
  setTracks: (tracks: Track[]) => void
  setCurrentTrack: (id: string) => void
  playNext: () => void
  playPrevious: () => void
  toggleFavorite: (id: string) => void
  addRecentlyPlayed: (id: string) => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setVolume: (volume: number) => void
  setIsPlaying: (isPlaying: boolean) => void
  setCurrentTime: (time: number) => void
  addTrack: (track: Track) => void
}

const uniquePush = (items: string[], id: string) => [id, ...items.filter((item) => item !== id)].slice(0, 20)

const getRandomUnplayedTrack = (available: string[], played: string[]): string | null => {
  const unplayed = available.filter((id) => !played.includes(id))
  if (unplayed.length === 0) return null
  return unplayed[Math.floor(Math.random() * unplayed.length)]
}

const sampleTracks: Track[] = [
  {
    id: '1',
    title: 'Night Drive',
    artist: 'Anuraag Rao',
    album: 'Neon Stories',
    duration: 214,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    ownerId: 'public',
    isPublic: true,
    lyrics: [
      { time: 0, text: 'City lights are moving slow' },
      { time: 12, text: 'Midnight humming through the road' },
      { time: 25, text: 'Your voice echoes with the bass' },
      { time: 39, text: 'We fade into a brighter place' },
    ],
  },
  {
    id: '2',
    title: 'Glass Horizon',
    artist: 'Anuraag Rao',
    album: 'Neon Stories',
    duration: 192,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    ownerId: 'public',
    isPublic: true,
    lyrics: [
      { time: 0, text: 'Hold the skyline in your hand' },
      { time: 11, text: 'Echoes drift like silver sand' },
      { time: 24, text: 'Every beat rewrites the night' },
      { time: 36, text: 'Breaking out in ultraviolet light' },
    ],
  },
]

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      tracks: sampleTracks,
      currentTrackId: sampleTracks[0]?.id ?? null,
      queue: sampleTracks.map((t) => t.id),
      playedInShuffle: [],
      favorites: [],
      recentlyPlayed: [],
      repeatMode: 'off',
      shuffled: false,
      volume: 0.8,
      isPlaying: false,
      currentTime: 0,
      
      setTracks: (tracks) => {
        const newQueue = tracks.map((track) => track.id)
        set((state) => ({
          tracks,
          queue: newQueue,
          playedInShuffle: [],
          currentTrackId: state.currentTrackId && tracks.some((t) => t.id === state.currentTrackId)
            ? state.currentTrackId
            : (tracks[0]?.id ?? null),
        }))
      },
      
      setCurrentTrack: (id) => set({ currentTrackId: id }),
      
      addTrack: (track) => {
        set((state) => ({
          tracks: [...state.tracks, track],
          queue: [...state.queue, track.id],
        }))
      },
  
  playNext: () => {
    const { queue, currentTrackId, repeatMode, shuffled, playedInShuffle } = get()
    if (!queue.length || !currentTrackId) return
    
    // Repeat one track
    if (repeatMode === 'one') return
    
    if (shuffled) {
      const newPlayed = [...playedInShuffle, currentTrackId]
      const nextTrack = getRandomUnplayedTrack(queue, newPlayed)
      
      if (nextTrack) {
        set({ currentTrackId: nextTrack, playedInShuffle: newPlayed })
        return
      }
      
      // All tracks played in shuffle
      if (repeatMode === 'all') {
        set({ playedInShuffle: [currentTrackId], currentTrackId: getRandomUnplayedTrack(queue, [currentTrackId]) || queue[0] })
      }
      return
    }
    
    // Non-shuffle mode
    const currentIndex = queue.indexOf(currentTrackId)
    const nextIndex = currentIndex + 1
    
    if (nextIndex < queue.length) {
      set({ currentTrackId: queue[nextIndex] })
      return
    }
    
    // End of queue reached
    if (repeatMode === 'all') {
      set({ currentTrackId: queue[0] })
    }
  },
  
  playPrevious: () => {
    const { queue, currentTrackId } = get()
    if (!queue.length || !currentTrackId) return
    
    const currentIndex = queue.indexOf(currentTrackId)
    const previousIndex = currentIndex - 1
    
    if (previousIndex >= 0) {
      set({ currentTrackId: queue[previousIndex] })
    }
  },
  
  toggleFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.includes(id)
        ? state.favorites.filter((item) => item !== id)
        : [...state.favorites, id],
    })),
  
  addRecentlyPlayed: (id) => set((state) => ({ recentlyPlayed: uniquePush(state.recentlyPlayed, id) })),
  
  toggleShuffle: () =>
    set((state) => {
      const newShuffled = !state.shuffled
      
      if (newShuffled) {
        // Enable shuffle - randomize queue but keep current track first
        const shuffled = state.queue.filter((id) => id !== state.currentTrackId)
        for (let i = shuffled.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return {
          shuffled: true,
          queue: state.currentTrackId ? [state.currentTrackId, ...shuffled] : shuffled,
          playedInShuffle: state.currentTrackId ? [state.currentTrackId] : [],
        }
      }
      
      // Disable shuffle - restore original order
      return {
        shuffled: false,
        queue: state.tracks.map((track) => track.id),
        playedInShuffle: [],
      }
    }),
  
  cycleRepeat: () =>
    set((state) => ({
      repeatMode: state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off',
    })),
  
  setVolume: (volume) => set({ volume }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setCurrentTime: (currentTime) => set({ currentTime }),
}),
    {
      name: 'music-stuff-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        recentlyPlayed: state.recentlyPlayed,
        volume: state.volume,
        repeatMode: state.repeatMode,
        shuffled: state.shuffled,
      }),
    }
  )
)
