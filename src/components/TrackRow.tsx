import { Heart, Play } from 'lucide-react'
import type { Track } from '../types'

type TrackRowProps = {
  track: Track
  isActive: boolean
  isFavorite: boolean
  onPlay: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function TrackRow({ track, isActive, isFavorite, onPlay, onToggleFavorite }: TrackRowProps) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-xl border border-white/10 p-3 ${
        isActive ? 'bg-white/10' : 'bg-black/20'
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{track.title}</p>
        <p className="truncate text-xs text-slate-400">
          {track.artist} • {track.album}
        </p>
      </div>
      <button
        type="button"
        className="rounded-md p-2 text-slate-200 transition hover:bg-white/10"
        onClick={() => onToggleFavorite(track.id)}
        aria-label="Favorite track"
      >
        <Heart className={`size-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
      </button>
      <button
        type="button"
        className="rounded-md bg-indigo-500 p-2 text-white transition hover:bg-indigo-400"
        onClick={() => onPlay(track.id)}
        aria-label="Play track"
      >
        <Play className="size-4" />
      </button>
    </div>
  )
}
