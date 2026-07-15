import { Heart, Play } from 'lucide-react'
import { VotingButtons } from './VotingButtons'
import { PlaylistSelector } from './PlaylistSelector'
import type { Track } from '../types'

type TrackRowProps = {
  track: Track
  isActive: boolean
  isFavorite: boolean
  onPlay: (id: string) => void
  onToggleFavorite: (id: string) => void
  onAuthRequired?: () => void
}

export function TrackRow({
  track,
  isActive,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onAuthRequired,
}: TrackRowProps) {
  const hasLyrics = track.lyrics && track.lyrics.length > 0

  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto_auto] items-center gap-2 rounded-xl border border-white/10 p-3 ${
        isActive ? 'bg-white/10' : 'bg-black/20'
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white">{track.title}</p>
          {!hasLyrics && (
            <span className="inline-block whitespace-nowrap rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
              Instrumental
            </span>
          )}
        </div>
        <p className="truncate text-xs text-slate-400">
          {track.artist} • {track.album}
        </p>
      </div>

      {/* Voting Buttons */}
      <VotingButtons track={track} onAuthRequired={onAuthRequired} />

      {/* Favorite Button */}
      <button
        type="button"
        className="rounded-md p-2 text-slate-200 transition hover:bg-white/10"
        onClick={() => onToggleFavorite(track.id)}
        title="Favorite track"
      >
        <Heart className={`size-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
      </button>

      {/* Playlist Selector */}
      <PlaylistSelector track={track} onAuthRequired={onAuthRequired} />

      {/* Play Button */}
      <button
        type="button"
        className="rounded-md bg-indigo-500 p-2 text-white transition hover:bg-indigo-400"
        onClick={() => onPlay(track.id)}
        title="Play track"
      >
        <Play className="size-4" />
      </button>
    </div>
  )
}
