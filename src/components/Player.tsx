import * as Slider from '@radix-ui/react-slider'
import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import type { Track } from '../types'

type RepeatMode = 'off' | 'one' | 'all'

type PlayerProps = {
  track: Track
  isPlaying: boolean
  onTogglePlay: () => void
  onNext: () => void
  onPrevious: () => void
  onShuffle: () => void
  onRepeat: () => void
  onVolumeChange: (value: number) => void
  onSeek: (value: number) => void
  volume: number
  currentTime: number
  duration: number
  accentColor: string
  shuffled?: boolean
  repeatMode?: RepeatMode
  onExpand?: () => void
}

const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${String(sec).padStart(2, '0')}`
}

function PlayerControls({
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  onShuffle,
  onRepeat,
  onVolumeChange,
  onSeek,
  volume,
  currentTime,
  duration,
  shuffled = false,
  repeatMode = 'off',
}: Omit<PlayerProps, 'track' | 'accentColor'>) {
  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onShuffle}
          className={`rounded-md p-2 transition-colors ${shuffled ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'hover:bg-white/10'}`}
          title={shuffled ? 'Shuffle ON' : 'Shuffle OFF'}
        >
          <Shuffle className="size-4" />
        </button>
        <button type="button" onClick={onPrevious} className="rounded-md p-2 hover:bg-white/10" title="Previous">
          <SkipBack className="size-4" />
        </button>
        <button type="button" onClick={onTogglePlay} className="rounded-full bg-white/20 p-3 hover:bg-white/30" title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
        </button>
        <button type="button" onClick={onNext} className="rounded-md p-2 hover:bg-white/10" title="Next">
          <SkipForward className="size-4" />
        </button>
        <button
          type="button"
          onClick={onRepeat}
          className={`rounded-md p-2 transition-colors ${
            repeatMode === 'off' ? 'hover:bg-white/10' : 'bg-indigo-500 text-white hover:bg-indigo-400'
          }`}
          title={repeatMode === 'off' ? 'Repeat OFF' : repeatMode === 'all' ? 'Repeat ALL' : 'Repeat ONE'}
        >
          {repeatMode === 'one' ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
        </button>
      </div>

      <div className="w-full">
        <Slider.Root
          className="relative flex h-5 w-full touch-none select-none items-center"
          value={[currentTime]}
          max={duration || 1}
          step={0.1}
          onValueChange={(value) => onSeek(value[0])}
        >
          <Slider.Track className="relative h-1 grow rounded-full bg-white/20">
            <Slider.Range className="absolute h-full rounded-full bg-white" />
          </Slider.Track>
          <Slider.Thumb className="block size-3 rounded-full bg-white shadow cursor-grab active:cursor-grabbing" />
        </Slider.Root>
        <div className="flex justify-between text-xs text-slate-300">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-200">
        <Volume2 className="size-4" />
        <Slider.Root
          className="relative flex h-5 w-24 touch-none select-none items-center"
          value={[volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(value) => onVolumeChange(value[0])}
        >
          <Slider.Track className="relative h-1 grow rounded-full bg-white/20">
            <Slider.Range className="absolute h-full rounded-full bg-white" />
          </Slider.Track>
          <Slider.Thumb className="block size-3 rounded-full bg-white shadow cursor-grab active:cursor-grabbing" />
        </Slider.Root>
      </div>
    </>
  )
}

export function Player({
  track,
  accentColor,
  shuffled = false,
  repeatMode = 'off',
  onExpand,
  ...rest
}: PlayerProps) {
  const hasLyrics = track.lyrics && track.lyrics.length > 0

  return (
    <>
      {/* Desktop fixed bottom player */}
      <div className="glass-panel fixed inset-x-0 bottom-0 z-20 hidden items-center justify-between gap-4 border-t border-white/20 px-4 py-3 md:flex">
        <div
          onClick={onExpand}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to open Full Player (F)"
        >
          <img src={track.coverUrl} alt={track.title} className="size-12 rounded-md object-cover shadow-sm transition-transform group-hover:scale-105" />
          <div className="min-w-0 w-44">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{track.title}</p>
              {!hasLyrics && (
                <span className="inline-block whitespace-nowrap rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  Instrumental
                </span>
              )}
            </div>
            <p className="truncate text-xs text-slate-300">{track.artist}</p>
          </div>
        </div>
        <div className="flex-1 max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <PlayerControls {...rest} shuffled={shuffled} repeatMode={repeatMode} />
        </div>
        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25 bg-white/5 transition-colors hidden lg:flex items-center gap-1 cursor-pointer"
            title="Open Fullscreen Player (F)"
          >
            Expand ↗
          </button>
        )}
      </div>

      {/* Mobile fixed bottom mini-player */}
      <div
        onClick={onExpand}
        className="glass-panel fixed inset-x-3 bottom-3 z-20 flex items-center justify-between gap-3 rounded-2xl p-2.5 text-left md:hidden shadow-2xl cursor-pointer"
        style={{ borderColor: `${accentColor}50` }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img src={track.coverUrl} alt={track.title} className="size-11 rounded-xl object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm text-white font-medium">{track.title}</p>
              {!hasLyrics && (
                <span className="inline-block whitespace-nowrap rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[0.65rem] font-semibold text-amber-300 border border-amber-500/30 shrink-0">
                  Inst.
                </span>
              )}
            </div>
            <p className="truncate text-xs text-slate-400">{track.artist}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={rest.onTogglePlay}
            className="rounded-full bg-white/20 p-2.5 text-white hover:bg-white/30 transition cursor-pointer"
            title={rest.isPlaying ? 'Pause' : 'Play'}
          >
            {rest.isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
        </div>
      </div>
    </>
  )
}
