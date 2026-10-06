import { useState } from 'react'
import * as Slider from '@radix-ui/react-slider'
import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
  Moon,
  Maximize2,
  Heart,
} from 'lucide-react'
import { useAudioStore } from '../store/audioStore'
import { isInstrumentalTrack } from '../lib/lyricsUtils'
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
  onOpenSleepTimer?: () => void
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0]

const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${String(sec).padStart(2, '0')}`
}

export function Player({
  track,
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
  accentColor,
  shuffled = false,
  repeatMode = 'off',
  onExpand,
  onOpenSleepTimer,
}: PlayerProps) {
  const {
    favorites,
    toggleFavorite,
    playbackRate,
    setPlaybackRate,
    sleepTimerMinutes,
    isSleepTimerEndOfTrack,
    isQueueOpen,
    setIsQueueOpen,
    queue,
  } = useAudioStore()

  const [prevVolume, setPrevVolume] = useState(0.8)

  const isFavorite = favorites.includes(track.id)
  const isInstrumental = !track.lyrics || track.lyrics.length === 0 || isInstrumentalTrack(track.lyrics)

  // Cycle playback speed
  const handleCycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length
    setPlaybackRate(SPEED_OPTIONS[nextIndex])
  }

  // Toggle Mute
  const handleToggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume)
      onVolumeChange(0)
    } else {
      onVolumeChange(prevVolume || 0.8)
    }
  }

  const isSleepTimerActive = Boolean(sleepTimerMinutes || isSleepTimerEndOfTrack)

  return (
    <>
      {/* ═══════════ DESKTOP PLAYER BAR ═══════════ */}
      <div className="fixed inset-x-0 bottom-0 z-40 hidden md:flex items-center justify-between gap-4 border-t border-white/[0.08] bg-[#0c0d12]/95 backdrop-blur-2xl px-5 py-3 shadow-2xl">
        {/* Left: Track Details */}
        <div className="flex items-center gap-3 w-64 min-w-0">
          <div
            onClick={onExpand}
            className="relative size-12 rounded-xl overflow-hidden shrink-0 cursor-pointer group shadow-md ring-1 ring-white/10"
            title="Expand Full Player (F)"
          >
            <img
              src={track.coverUrl}
              alt={track.title}
              className="size-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="size-4 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p
                onClick={onExpand}
                className="truncate text-sm font-semibold text-white hover:text-emerald-300 transition-colors cursor-pointer"
              >
                {track.title}
              </p>
              {isInstrumental && (
                <span className="inline-block whitespace-nowrap rounded-full bg-amber-500/15 px-1.5 py-0.2 text-[0.6rem] font-mono font-medium text-amber-300 border border-amber-500/25 shrink-0">
                  Inst.
                </span>
              )}
            </div>
            <p className="truncate text-xs text-slate-400 mt-0.5">{track.artist}</p>
          </div>

          {/* Quick Favorite */}
          <button
            onClick={() => toggleFavorite(track.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer shrink-0"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`size-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Center: Playback Controls & Timeline Slider */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={onShuffle}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                shuffled ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white'
              }`}
              title={shuffled ? 'Shuffle ON' : 'Shuffle OFF'}
            >
              <Shuffle className="size-4" />
            </button>

            <button
              onClick={onPrevious}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              title="Previous (J)"
            >
              <SkipBack className="size-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className="size-10 rounded-full flex items-center justify-center text-black bg-white hover:scale-105 active:scale-95 transition shadow-md shadow-white/20 cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={onNext}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              title="Next (L)"
            >
              <SkipForward className="size-4" />
            </button>

            <button
              onClick={onRepeat}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                repeatMode !== 'off' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
            </button>
          </div>

          {/* Timeline */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[0.7rem] font-mono text-slate-400 tabular-nums w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider.Root
              className="relative flex h-4 flex-1 touch-none select-none items-center cursor-pointer group"
              value={[currentTime]}
              max={duration || 1}
              step={0.1}
              onValueChange={(val) => onSeek(val[0])}
            >
              <Slider.Track className="relative h-1 grow rounded-full bg-white/15 group-hover:h-1.5 transition-all">
                <Slider.Range className="absolute h-full rounded-full" style={{ backgroundColor: accentColor || '#10b981' }} />
              </Slider.Track>
              <Slider.Thumb className="block size-2.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity" />
            </Slider.Root>
            <span className="text-[0.7rem] font-mono text-slate-400 tabular-nums w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Aux Controls (Speed, Sleep Timer, Queue, Volume, Fullscreen) */}
        <div className="flex items-center gap-2.5 w-64 justify-end">
          {/* Playback Speed Pill */}
          <button
            onClick={handleCycleSpeed}
            className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.12] text-[0.7rem] font-mono font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>

          {/* Sleep Timer */}
          <button
            onClick={onOpenSleepTimer}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
              isSleepTimerActive
                ? 'text-indigo-400 bg-indigo-500/15 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Sleep Timer"
          >
            <Moon className="size-4" />
            {isSleepTimerActive && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-indigo-400 animate-ping" />
            )}
          </button>

          {/* Queue Drawer Button */}
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
              isQueueOpen
                ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Play Queue (Q)"
          >
            <ListMusic className="size-4" />
            {queue.length > 1 && (
              <span className="absolute -top-1 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-500 text-[0.55rem] font-mono font-bold text-black">
                {queue.length}
              </span>
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={volume === 0 ? 'Unmute (M)' : 'Mute (M)'}
            >
              {volume === 0 ? <VolumeX className="size-4 text-rose-400" /> : <Volume2 className="size-4" />}
            </button>
            <Slider.Root
              className="relative flex h-4 w-20 touch-none select-none items-center cursor-pointer"
              value={[volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(val) => onVolumeChange(val[0])}
            >
              <Slider.Track className="relative h-1 grow rounded-full bg-white/15">
                <Slider.Range className="absolute h-full rounded-full bg-white/80" />
              </Slider.Track>
              <Slider.Thumb className="block size-2 rounded-full bg-white shadow-sm" />
            </Slider.Root>
          </div>

          {/* Fullscreen Expand */}
          {onExpand && (
            <button
              onClick={onExpand}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              title="Fullscreen Player (F)"
            >
              <Maximize2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* ═══════════ MOBILE MINI-PLAYER BAR ═══════════ */}
      <div
        onClick={onExpand}
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex items-center justify-between gap-2.5 rounded-2xl bg-[#0e0f14]/95 border border-white/[0.12] p-2.5 shadow-2xl backdrop-blur-2xl md:hidden cursor-pointer select-none overflow-hidden group active:scale-[0.99] transition-transform"
      >
        {/* Realtime Playback Progress Hairline */}
        <div className="absolute top-0 inset-x-0 h-1 bg-white/[0.08] overflow-hidden">
          <div
            className="h-full transition-[width] duration-150 ease-linear"
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              backgroundColor: accentColor || '#10b981',
            }}
          />
        </div>

        {/* Track Thumbnail & Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pt-0.5">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="size-11 rounded-xl object-cover ring-1 ring-white/10 shrink-0 shadow-md"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs font-semibold text-white tracking-tight">{track.title}</p>
              {isInstrumental && (
                <span className="inline-block whitespace-nowrap rounded-full bg-amber-500/15 px-1.5 py-0.2 text-[0.58rem] font-mono text-amber-300 border border-amber-500/30 shrink-0">
                  Inst.
                </span>
              )}
            </div>
            <p className="truncate text-[0.7rem] text-slate-400 mt-0.5">{track.artist}</p>
          </div>
        </div>

        {/* Mobile Quick Action Buttons */}
        <div className="flex items-center gap-1 shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={() => toggleFavorite(track.id)}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition active:scale-125 cursor-pointer"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Heart
              className={`size-4 transition-colors ${
                isFavorite ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>

          {/* Queue Drawer */}
          <button
            type="button"
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-2 rounded-lg transition cursor-pointer relative ${
              isQueueOpen ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400 hover:text-white'
            }`}
            title="Queue"
            aria-label="Open queue"
          >
            <ListMusic className="size-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="size-9 rounded-full flex items-center justify-center text-black bg-white hover:scale-105 active:scale-95 transition shadow-md shadow-white/20 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause track' : 'Play track'}
          >
            {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current ml-0.5" />}
          </button>

          {/* Skip Next */}
          <button
            type="button"
            onClick={onNext}
            className="p-2 text-slate-300 hover:text-white rounded-lg transition active:scale-90 cursor-pointer"
            title="Next Track"
            aria-label="Skip to next track"
          >
            <SkipForward className="size-4" />
          </button>
        </div>
      </div>
    </>
  )
}
