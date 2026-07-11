import { create } from 'zustand'
import type { Track } from '../types'

type RepeatMode = 'off' | 'one' | 'all'

type AudioState = {
  tracks: Track[]
  currentTrackId: string | null
  queue: string[]
  favorites: string[]
  recentlyPlayed: string[]
  repeatMode: RepeatMode
  shuffled: boolean
  volume: number
  setTracks: (tracks: Track[]) => void
  setCurrentTrack: (id: string) => void
  playNext: () => void
  playPrevious: () => void
  toggleFavorite: (id: string) => void
  addRecentlyPlayed: (id: string) => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setVolume: (volume: number) => void
}

const uniquePush = (items: string[], id: string) => [id, ...items.filter((item) => item !== id)].slice(0, 20)

const sampleTracks: Track[] = [
  {
    id: '1',
    title: 'Night Drive',
    artist: 'Anuraag Rao',
    album: 'Neon Stories',
    duration: 214,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    ownerId: 'demo-user',
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
    ownerId: 'demo-user',
    lyrics: [
      { time: 0, text: 'Hold the skyline in your hand' },
      { time: 11, text: 'Echoes drift like silver sand' },
      { time: 24, text: 'Every beat rewrites the night' },
      { time: 36, text: 'Breaking out in ultraviolet light' },
    ],
  },
]

export const useAudioStore = create<AudioState>((set, get) => ({
  tracks: sampleTracks,
  currentTrackId: sampleTracks[0].id,
  queue: sampleTracks.map((track) => track.id),
  favorites: [],
  recentlyPlayed: [],
  repeatMode: 'off',
  shuffled: false,
  volume: 0.8,
  setTracks: (tracks) =>
    set({
      tracks,
      queue: tracks.map((track) => track.id),
      currentTrackId: tracks[0]?.id ?? null,
    }),
  setCurrentTrack: (id) => set({ currentTrackId: id }),
  playNext: () => {
    const { queue, currentTrackId, repeatMode } = get()
    if (!queue.length || !currentTrackId) return
    if (repeatMode === 'one') return
    const currentIndex = queue.indexOf(currentTrackId)
    const nextIndex = currentIndex + 1
    if (nextIndex < queue.length) {
      set({ currentTrackId: queue[nextIndex] })
      return
    }
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
      if (!state.shuffled) {
        const shuffled = [...state.queue]
        for (let i = shuffled.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return { shuffled: true, queue: shuffled }
      }
      return { shuffled: false, queue: state.tracks.map((track) => track.id) }
    }),
  cycleRepeat: () =>
    set((state) => ({
      repeatMode: state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off',
    })),
  setVolume: (volume) => set({ volume }),
}))
