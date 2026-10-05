import { Heart, Play, Pause, Music, Mic2 } from 'lucide-react'
import { VotingButtons } from './VotingButtons'
import { PlaylistSelector } from './PlaylistSelector'
import type { Track } from '../types'
import { isInstrumentalTrack } from '../lib/lyricsUtils'

type TrackRowProps = {
  track: Track
  isActive: boolean
  isPlaying?: boolean
  isFavorite: boolean
  onPlay: (id: string) => void
  onToggleFavorite: (id: string) => void
  onAuthRequired?: () => void
}

const formatDuration = (seconds?: number) => {
  if (!seconds || isNaN(seconds)) return '--:--'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${String(sec).padStart(2, '0')}`
}

export function TrackRow({
  track,
  isActive,
  isPlaying = false,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onAuthRequired,
}: TrackRowProps) {
  const isInstrumental = !track.lyrics || track.lyrics.length === 0 || isInstrumentalTrack(track.lyrics)
  const hasLyrics = !isInstrumental

  return (
    <div
      className={`group relative flex items-center justify-between gap-3 rounded-xl border p-2.5 sm:px-3 sm:py-2.5 transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-white/[0.12] border-white/20 shadow-md shadow-black/30'
          : 'bg-[#121316]/70 hover:bg-[#181a1f] border-white/[0.06] hover:border-white/[0.14]'
      }`}
      onClick={() => onPlay(track.id)}
    >
      {/* Left: Thumbnail & Title/Artist */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Cover Art with Play Overlay */}
        <div className="relative size-11 sm:size-12 shrink-0 rounded-lg overflow-hidden bg-black/40 border border-white/10 shadow-inner group/art">
          {track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                // Fallback to placeholder if thumbnail is missing
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-500">
              <Music className="size-5" />
            </div>
          )}

          {/* Hover / Active Play Button Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isActive && isPlaying ? (
              <Pause className="size-5 text-white fill-white" />
            ) : (
              <Play className="size-5 text-white fill-white ml-0.5" />
            )}
          </div>
        </div>

        {/* Text Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={`truncate text-sm font-semibold tracking-tight ${
                isActive ? 'text-emerald-400 font-bold' : 'text-[#ededef] group-hover:text-white'
              }`}
            >
              {track.title}
            </p>
            {hasLyrics ? (
              <span
                className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[0.62rem] font-mono font-medium text-emerald-300"
                title="Synchronized lyrics available"
              >
                <Mic2 className="size-2.5" />
                <span>Lyrics</span>
              </span>
            ) : (
              <span className="hidden sm:inline-block rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[0.62rem] font-mono text-slate-400">
                Instrumental
              </span>
            )}
          </div>
          <p className="truncate text-xs text-[#9aa0a6] mt-0.5">
            <span>{track.artist}</span>
            {track.album && <span className="text-white/30 mx-1.5">•</span>}
            <span className="text-white/50">{track.album}</span>
          </p>
        </div>
      </div>

      {/* Middle: Duration */}
      <div className="hidden md:flex items-center text-xs font-mono text-slate-400 tabular-nums px-2 shrink-0">
        {formatDuration(track.duration)}
      </div>

      {/* Right: Actions */}
      <div
        className="flex items-center gap-1 sm:gap-1.5 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Voting Buttons */}
        <VotingButtons track={track} onAuthRequired={onAuthRequired} />

        {/* Favorite Button */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          onClick={() => onToggleFavorite(track.id)}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label="Toggle favorite"
        >
          <Heart
            className={`size-4 transition-transform active:scale-125 ${
              isFavorite ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : ''
            }`}
          />
        </button>

        {/* Playlist Selector */}
        <PlaylistSelector track={track} onAuthRequired={onAuthRequired} />
      </div>
    </div>
  )
}
