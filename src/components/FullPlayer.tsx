import { useState, useMemo } from 'react'
import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  Shuffle,
  Volume2,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import * as Slider from '@radix-ui/react-slider'
import { useAudioStore } from '../store/audioStore'
import { LyricsView } from './LyricsView'
import { isInstrumentalTrack } from '../lib/lyricsUtils'
import AudioVisualizer from './AudioVisualizer'

interface FullPlayerProps {
  onClose: () => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  currentTime: number
  duration: number
  volume: number
  setVolume: (volume: number) => void
  accentColor: string
  seek: (time: number) => void
  audioElement: HTMLAudioElement | null
}

const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${String(sec).padStart(2, '0')}`
}

export function FullPlayer({
  onClose,
  isPlaying,
  setIsPlaying,
  currentTime,
  duration,
  volume,
  setVolume,
  accentColor,
  seek,
  audioElement,
}: FullPlayerProps) {
  const { currentTrackId, tracks, playNext, playPrevious, toggleShuffle, cycleRepeat, shuffled, repeatMode } =
    useAudioStore()

  const currentTrack = tracks.find((t) => t.id === currentTrackId)
  const [imageLoaded, setImageLoaded] = useState(false)

  const [mobileView, setMobileView] = useState<'art' | 'lyrics'>('art')

  // Check if track is instrumental
  const isInstrumental = useMemo(() => {
    return !currentTrack?.lyrics || currentTrack.lyrics.length === 0 || isInstrumentalTrack(currentTrack.lyrics)
  }, [currentTrack?.lyrics])

  const hasLyrics = !isInstrumental

  if (!currentTrack) {
    return (
      <div className="fixed inset-0 bg-[#07080a] flex items-center justify-center z-50">
        <button onClick={onClose} className="absolute top-4 left-4 text-white/80 hover:text-white">
          <ChevronDown size={24} />
        </button>
        <div className="text-center text-slate-400">No track selected</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0c0d12] via-[#07080a] to-black flex flex-col z-50 backdrop-blur-3xl select-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.08] shrink-0">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/[0.06] rounded-full transition cursor-pointer"
          title="Minimize player"
        >
          <ChevronDown size={26} />
        </button>

        {/* Center: Track title or Mobile View Toggle */}
        {hasLyrics ? (
          <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-full border border-white/10 lg:hidden">
            <button
              onClick={() => setMobileView('art')}
              className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition cursor-pointer ${
                mobileView === 'art'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Artwork
            </button>
            <button
              onClick={() => setMobileView('lyrics')}
              className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition cursor-pointer ${
                mobileView === 'lyrics'
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lyrics
            </button>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-slate-400 block">
              Now Playing
            </span>
            <span className="text-xs font-semibold text-white/90 truncate max-w-xs block">
              {currentTrack.album || 'Aura Player'}
            </span>
          </div>
        )}

        <div className="w-9 text-right">
          {hasLyrics && (
            <span className="hidden lg:inline-block text-[0.65rem] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Lyrics Active
            </span>
          )}
        </div>
      </div>

      {/* Main Content Container */}
      {hasLyrics ? (
        /* ═══════════ TWO-COLUMN VIEW (LYRICS AVAILABLE) ═══════════ */
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
          {/* Left: Album Art & Track Info (Desktop, or Mobile when 'art' tab selected) */}
          <div
            className={`lg:w-[460px] xl:w-[500px] flex-shrink-0 flex-col items-center justify-center px-6 sm:px-8 py-6 sm:py-8 border-b lg:border-b-0 lg:border-r border-white/[0.08] overflow-y-auto ${
              mobileView === 'art' ? 'flex flex-1 lg:flex-none' : 'hidden lg:flex'
            }`}
          >
            {/* Album Art */}
            <div className="relative size-56 sm:size-64 xl:size-72 mb-5 sm:mb-6 flex-shrink-0">
              <div
                className="w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                style={{
                  background: imageLoaded ? `linear-gradient(135deg, ${accentColor}30, #14151a)` : '#14151a',
                }}
              >
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  onLoad={() => setImageLoaded(true)}
                  className="w-full h-full object-cover"
                />
              </div>
              {isPlaying && (
                <div
                  className="absolute inset-0 rounded-2xl animate-pulse opacity-15 pointer-events-none"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </div>

            {/* Track Info */}
            <div className="text-center w-full mb-4 px-2">
              <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold text-white break-words tracking-tight">
                {currentTrack.title}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-1 break-words">{currentTrack.artist}</p>
              {currentTrack.album && (
                <p className="text-slate-400 text-xs mt-1">{currentTrack.album}</p>
              )}
            </div>

            {/* Audio Visualizer */}
            <div className="w-full max-w-xs mb-3">
              <AudioVisualizer
                audioElement={audioElement}
                isPlaying={isPlaying}
                height={44}
                barCount={36}
                barColor={accentColor || 'rgba(16, 185, 129, 0.85)'}
              />
            </div>
          </div>

          {/* Right: Rich Live Lyrics & Controls */}
          <div
            className={`flex-1 flex-col min-h-0 overflow-hidden ${
              mobileView === 'lyrics' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Lyrics View */}
            <div className="flex-1 overflow-y-auto px-4 lg:px-10 py-5 sm:py-6 min-h-0">
              <div className="flex items-center gap-2 mb-4 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase">
                <Sparkles className="size-3.5" />
                <span>Live Synced Lyrics</span>
              </div>
              <LyricsView
                lyrics={currentTrack.lyrics || []}
                currentTime={currentTime}
                onSeek={seek}
                size="large"
              />
            </div>
          </div>

          {/* Unified Bottom Controls Bar (Visible across mobile & desktop) */}
          <div className="border-t border-white/[0.08] px-4 sm:px-6 py-4 sm:py-5 bg-[#0c0d12]/95 backdrop-blur-xl shrink-0 space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:hidden">
            {/* Timeline Seekbar (Mobile Always Visible) */}
            <div className="w-full max-w-md mx-auto px-1 space-y-1">
              <Slider.Root
                className="relative flex w-full touch-none select-none items-center cursor-pointer group py-2"
                value={[currentTime]}
                onValueChange={(value) => seek(value[0])}
                max={duration || 0}
                step={0.1}
              >
                <Slider.Track className="relative h-1.5 flex-grow rounded-full bg-white/10 group-hover:h-2 transition-all">
                  <Slider.Range
                    className="absolute h-full rounded-full"
                    style={{ backgroundColor: accentColor || '#10b981' }}
                  />
                </Slider.Track>
                <Slider.Thumb className="block size-3.5 rounded-full bg-white shadow-lg" />
              </Slider.Root>

              <div className="flex justify-between text-[0.7rem] font-mono text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center justify-center gap-5 sm:gap-7">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition cursor-pointer ${
                  shuffled ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle size={18} />
              </button>

              <button
                onClick={playPrevious}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-full transition cursor-pointer"
                title="Previous track"
              >
                <SkipBack size={22} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="size-14 rounded-full flex items-center justify-center text-black bg-white hover:scale-105 active:scale-95 transition shadow-lg shadow-white/20 cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-0.5" />}
              </button>

              <button
                onClick={playNext}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-full transition cursor-pointer"
                title="Next track"
              >
                <SkipForward size={22} />
              </button>

              <button
                onClick={cycleRepeat}
                className={`p-2 rounded-full transition cursor-pointer ${
                  repeatMode !== 'off' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
              </button>
            </div>
          </div>

          {/* Desktop Right Column Bottom Controls */}
          <div className="hidden lg:flex border-t border-white/[0.08] px-6 py-5 bg-[#0c0d12]/90 backdrop-blur-xl shrink-0 flex-col space-y-3">
            {/* Timeline */}
            <div className="w-full max-w-md mx-auto px-1">
              <Slider.Root
                className="relative flex w-full touch-none select-none items-center cursor-pointer group"
                value={[currentTime]}
                onValueChange={(value) => seek(value[0])}
                max={duration || 0}
                step={0.1}
              >
                <Slider.Track className="relative h-1 flex-grow rounded-full bg-white/10 group-hover:h-1.5 transition-all">
                  <Slider.Range
                    className="absolute h-full rounded-full"
                    style={{ backgroundColor: accentColor || '#10b981' }}
                  />
                </Slider.Track>
                <Slider.Thumb className="block size-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </Slider.Root>

              <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-5 sm:gap-7">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition cursor-pointer ${
                  shuffled ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle size={18} />
              </button>

              <button
                onClick={playPrevious}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-full transition cursor-pointer"
                title="Previous track"
              >
                <SkipBack size={22} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="size-13 rounded-full flex items-center justify-center text-black bg-white hover:scale-105 active:scale-95 transition shadow-lg shadow-white/20 cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
              </button>

              <button
                onClick={playNext}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-full transition cursor-pointer"
                title="Next track"
              >
                <SkipForward size={22} />
              </button>

              <button
                onClick={cycleRepeat}
                className={`p-2 rounded-full transition cursor-pointer ${
                  repeatMode !== 'off' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-3 max-w-xs mx-auto pt-1">
              <Volume2 size={16} className="text-slate-400 shrink-0" />
              <Slider.Root
                className="relative flex flex-1 touch-none select-none items-center cursor-pointer"
                value={[volume]}
                onValueChange={(val) => setVolume(val[0])}
                max={1}
                step={0.01}
              >
                <Slider.Track className="relative h-1 flex-grow rounded-full bg-white/10">
                  <Slider.Range className="absolute h-full rounded-full bg-white/80" />
                </Slider.Track>
                <Slider.Thumb className="block size-2.5 rounded-full bg-white shadow-md" />
              </Slider.Root>
              <span className="text-[0.7rem] font-mono text-slate-400 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════ SINGLE-COLUMN HERO VIEW (INSTRUMENTAL) ═══════════ */
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center text-center py-4 space-y-6">
            {/* Centered Large Album Art with Ambient Glow */}
            <div className="relative size-64 sm:size-72 md:size-80 flex-shrink-0 group">
              <div
                className="w-full h-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/15 transition-transform duration-500 group-hover:scale-102"
                style={{
                  background: imageLoaded ? `linear-gradient(135deg, ${accentColor}40, #14151a)` : '#14151a',
                }}
              >
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  onLoad={() => setImageLoaded(true)}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Ambient Pulsing Glow */}
              {isPlaying && (
                <div
                  className="absolute -inset-2 rounded-3xl blur-2xl opacity-25 animate-pulse -z-10"
                  style={{ backgroundColor: accentColor || '#f59e0b' }}
                />
              )}
            </div>

            {/* Track Info & Badge */}
            <div className="space-y-2 px-4">
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {currentTrack.title}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-mono font-medium text-amber-300 shadow-sm shadow-amber-950/20">
                  Instrumental
                </span>
              </div>
              <p className="text-slate-300 text-base sm:text-lg font-medium">{currentTrack.artist}</p>
              {currentTrack.album && (
                <p className="text-slate-400 text-xs sm:text-sm font-mono">{currentTrack.album}</p>
              )}
            </div>

            {/* Audio Visualizer */}
            <div className="w-full max-w-md px-4">
              <AudioVisualizer
                audioElement={audioElement}
                isPlaying={isPlaying}
                height={56}
                barCount={44}
                barColor={accentColor || 'rgba(245, 158, 11, 0.85)'}
              />
            </div>

            {/* Timeline Slider */}
            <div className="w-full max-w-md px-4 space-y-2">
              <Slider.Root
                className="relative flex w-full touch-none select-none items-center cursor-pointer group"
                value={[currentTime]}
                onValueChange={(value) => seek(value[0])}
                max={duration || 0}
                step={0.1}
              >
                <Slider.Track className="relative h-1.5 flex-grow rounded-full bg-white/10 group-hover:h-2 transition-all">
                  <Slider.Range
                    className="absolute h-full rounded-full"
                    style={{ backgroundColor: accentColor || '#f59e0b' }}
                  />
                </Slider.Track>
                <Slider.Thumb className="block size-3.5 rounded-full bg-white shadow-lg" />
              </Slider.Root>

              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Centered Playback Controls */}
            <div className="flex items-center justify-center gap-6 sm:gap-8 pt-2">
              <button
                onClick={toggleShuffle}
                className={`p-2.5 rounded-full transition cursor-pointer ${
                  shuffled ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle size={20} />
              </button>

              <button
                onClick={playPrevious}
                className="p-2.5 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-full transition cursor-pointer"
                title="Previous track"
              >
                <SkipBack size={24} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="size-16 rounded-full flex items-center justify-center text-black bg-white hover:scale-108 active:scale-95 transition shadow-xl shadow-white/20 cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>

              <button
                onClick={playNext}
                className="p-2.5 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-full transition cursor-pointer"
                title="Next track"
              >
                <SkipForward size={24} />
              </button>

              <button
                onClick={cycleRepeat}
                className={`p-2.5 rounded-full transition cursor-pointer ${
                  repeatMode !== 'off' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 w-full max-w-xs pt-1">
              <Volume2 size={16} className="text-slate-400 shrink-0" />
              <Slider.Root
                className="relative flex flex-1 touch-none select-none items-center cursor-pointer"
                value={[volume]}
                onValueChange={(val) => setVolume(val[0])}
                max={1}
                step={0.01}
              >
                <Slider.Track className="relative h-1 flex-grow rounded-full bg-white/10">
                  <Slider.Range className="absolute h-full rounded-full bg-white/80" />
                </Slider.Track>
                <Slider.Thumb className="block size-2.5 rounded-full bg-white shadow-md" />
              </Slider.Root>
              <span className="text-[0.7rem] font-mono text-slate-400 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
