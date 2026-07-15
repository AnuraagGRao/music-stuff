import { useState, useMemo } from 'react'
import { Pause, Play, Repeat, Repeat1, SkipBack, SkipForward, Shuffle, Volume2, ChevronDown } from 'lucide-react'
import * as Slider from '@radix-ui/react-slider'
import { useAudioStore } from '../store/audioStore'
import { LyricsView } from './LyricsView'
import { isInstrumentalTrack } from '../lib/lyricsUtils'

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
}: FullPlayerProps) {
  const { currentTrackId, tracks, playNext, playPrevious, toggleShuffle, cycleRepeat, shuffled, repeatMode } = useAudioStore()

  const currentTrack = tracks.find((t) => t.id === currentTrackId)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Check if track is instrumental (has only appreciation messages)
  const isInstrumental = useMemo(() => {
    return currentTrack?.lyrics ? isInstrumentalTrack(currentTrack.lyrics) : true
  }, [currentTrack?.lyrics])
  
  const hasLyrics = currentTrack?.lyrics && currentTrack.lyrics.length > 0 && !isInstrumental

  if (!currentTrack) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white hover:text-gray-300"
        >
          <ChevronDown size={24} />
        </button>
        <div className="text-center text-gray-400">No track selected</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <button onClick={onClose} className="text-white hover:text-gray-300 transition">
          <ChevronDown size={28} />
        </button>
        <h2 className="text-white text-sm font-semibold">NOW PLAYING</h2>
        <div className="w-7" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
        {/* Left: Artwork & Timeline - Desktop only, compact on mobile */}
        <div className="lg:flex-1 lg:flex flex lg:flex-col lg:items-center lg:justify-center lg:px-8 lg:py-8 lg:border-r border-gray-700 lg:overflow-y-auto hidden lg:flex">
          {/* Album Art */}
          <div className="relative w-full max-w-xs mb-8 flex-shrink-0">
            <div
              className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: imageLoaded ? `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)` : '#333',
              }}
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                onLoad={() => setImageLoaded(true)}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Playing indicator */}
            {isPlaying && (
              <div className="absolute inset-0 rounded-3xl animate-pulse opacity-20" style={{ backgroundColor: accentColor }} />
            )}
          </div>

          {/* Track Info */}
          <div className="text-center w-full mb-6 px-2">
            <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-white break-words max-w-full">{currentTrack.title}</h1>
              {isInstrumental && (
                <span className="inline-block whitespace-nowrap rounded-full bg-amber-500/20 px-3 py-1.5 text-sm font-semibold text-amber-300 border border-amber-500/30 flex-shrink-0">
                  Instrumental
                </span>
              )}
            </div>
            <p className="text-gray-300 text-lg break-words">{currentTrack.artist}</p>
            <p className="text-gray-500 text-sm mt-2">{currentTrack.album}</p>
          </div>

          {/* Timeline */}
          <div className="w-full max-w-xs px-1 flex-shrink-0">
            <Slider.Root
              className="relative flex w-full touch-none select-none items-center"
              value={[currentTime]}
              onValueChange={(value) => seek(value[0])}
              max={duration || 0}
              step={0.1}
            >
              <Slider.Track className="relative h-1 flex-grow rounded-full bg-gray-700">
                <Slider.Range
                  className="absolute h-full rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              </Slider.Track>
              <Slider.Thumb className="block h-3 w-3 rounded-full bg-white shadow-lg" />
            </Slider.Root>

            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Mobile: Compact album art at top */}
        <div className="lg:hidden flex-shrink-0 px-3 py-3 flex items-center gap-3 border-b border-gray-700">
          {/* Small Album Art */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <div
              className="w-full h-full rounded-lg overflow-hidden shadow-lg"
              style={{
                background: imageLoaded ? `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)` : '#333',
              }}
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            {isPlaying && (
              <div className="absolute inset-0 rounded-lg animate-pulse opacity-20" style={{ backgroundColor: accentColor }} />
            )}
          </div>

          {/* Compact Track Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">{currentTrack.title}</h2>
            <p className="text-gray-400 text-xs truncate">{currentTrack.artist}</p>
            {/* Mini Timeline */}
            <div className="mt-1">
              <Slider.Root
                className="relative flex w-full touch-none select-none items-center"
                value={[currentTime]}
                onValueChange={(value) => seek(value[0])}
                max={duration || 0}
                step={0.1}
              >
                <Slider.Track className="relative h-0.5 flex-grow rounded-full bg-gray-700">
                  <Slider.Range
                    className="absolute h-full rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                </Slider.Track>
                <Slider.Thumb className="block h-2 w-2 rounded-full bg-white shadow-lg" />
              </Slider.Root>
              <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Lyrics & Controls */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden lg:pb-0 pb-48">
          {/* Lyrics Container - only show if not instrumental */}
          {hasLyrics && (
            <div className="flex-1 overflow-y-auto px-3 lg:px-6 py-3 lg:py-8 min-h-0 border-t lg:border-t-0">
              <h3 className="text-white font-semibold mb-3 text-xs lg:text-sm uppercase tracking-wide sticky top-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-900/80 py-2 z-10">
                Live Lyrics
              </h3>
              <div className="space-y-2">
                <LyricsView lyrics={currentTrack.lyrics || []} currentTime={currentTime} />
              </div>
            </div>
          )}

          {/* Controls - Desktop below lyrics, Mobile fixed at bottom */}
          <div className="lg:border-t lg:border-gray-700 lg:px-6 lg:py-6 lg:bg-gray-900/50 lg:flex-shrink-0 fixed lg:relative bottom-0 left-0 right-0 lg:left-auto lg:right-auto border-t border-gray-700 px-3 py-3 bg-gray-900/80 lg:bg-gray-900/50 backdrop-blur-sm lg:backdrop-blur-none">
            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-2 lg:gap-6 mb-2 lg:mb-6 flex-wrap">
              <button
                onClick={toggleShuffle}
                className={`p-1.5 lg:p-2 rounded-full transition flex-shrink-0 ${
                  shuffled ? 'text-blue-400 bg-blue-400/10' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shuffle size={16} className="lg:hidden" />
                <Shuffle size={18} className="hidden lg:block" />
              </button>

              <button
                onClick={playPrevious}
                className="p-1.5 lg:p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition flex-shrink-0"
              >
                <SkipBack size={16} className="lg:hidden" />
                <SkipBack size={20} className="hidden lg:block" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center justify-center w-10 h-10 lg:w-14 lg:h-14 rounded-full text-white transition hover:scale-110 flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                {isPlaying ? (
                  <Pause size={20} fill="white" className="lg:hidden" />
                ) : (
                  <Play size={20} fill="white" className="ml-0.5 lg:hidden" />
                )}
                {isPlaying ? (
                  <Pause size={24} fill="white" className="hidden lg:block" />
                ) : (
                  <Play size={24} fill="white" className="ml-1 hidden lg:block" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-1.5 lg:p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition flex-shrink-0"
              >
                <SkipForward size={16} className="lg:hidden" />
                <SkipForward size={20} className="hidden lg:block" />
              </button>

              <button
                onClick={cycleRepeat}
                className={`p-1.5 lg:p-2 rounded-full transition flex-shrink-0 ${
                  repeatMode !== 'off' ? 'text-blue-400 bg-blue-400/10' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {repeatMode === 'one' ? (
                  <>
                    <Repeat1 size={16} className="lg:hidden" />
                    <Repeat1 size={18} className="hidden lg:block" />
                  </>
                ) : (
                  <>
                    <Repeat size={16} className="lg:hidden" />
                    <Repeat size={18} className="hidden lg:block" />
                  </>
                )}
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 lg:gap-3 max-w-xs mx-auto">
              <Volume2 size={16} className="text-gray-400 lg:hidden flex-shrink-0" />
              <Volume2 size={18} className="text-gray-400 hidden lg:block flex-shrink-0" />
              <Slider.Root
                className="relative flex flex-1 touch-none select-none items-center"
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={1}
                step={0.01}
              >
                <Slider.Track className="relative h-0.5 lg:h-1 flex-grow rounded-full bg-gray-700">
                  <Slider.Range
                    className="absolute h-full rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                </Slider.Track>
                <Slider.Thumb className="block h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-white shadow-lg" />
              </Slider.Root>
              <span className="text-xs text-gray-400 w-9 text-right flex-shrink-0">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
