import * as Dialog from '@radix-ui/react-dialog'
import * as Slider from '@radix-ui/react-slider'
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import type { Track } from '../types'

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
}: Omit<PlayerProps, 'track' | 'accentColor'>) {
  return (
    <>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onShuffle} className="rounded-md p-2 hover:bg-white/10">
          <Shuffle className="size-4" />
        </button>
        <button type="button" onClick={onPrevious} className="rounded-md p-2 hover:bg-white/10">
          <SkipBack className="size-4" />
        </button>
        <button type="button" onClick={onTogglePlay} className="rounded-full bg-white/20 p-3 hover:bg-white/30">
          {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
        </button>
        <button type="button" onClick={onNext} className="rounded-md p-2 hover:bg-white/10">
          <SkipForward className="size-4" />
        </button>
        <button type="button" onClick={onRepeat} className="rounded-md p-2 hover:bg-white/10">
          <Repeat className="size-4" />
        </button>
      </div>

      <div className="w-full">
        <Slider.Root
          className="relative flex h-5 w-full touch-none select-none items-center"
          value={[currentTime]}
          max={duration || 1}
          step={1}
          onValueChange={(value) => onSeek(value[0])}
        >
          <Slider.Track className="relative h-1 grow rounded-full bg-white/20">
            <Slider.Range className="absolute h-full rounded-full bg-white" />
          </Slider.Track>
          <Slider.Thumb className="block size-3 rounded-full bg-white shadow" />
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
          <Slider.Thumb className="block size-3 rounded-full bg-white shadow" />
        </Slider.Root>
      </div>
    </>
  )
}

export function Player({ track, accentColor, ...rest }: PlayerProps) {
  return (
    <>
      <div className="glass-panel fixed inset-x-0 bottom-0 z-20 hidden items-center gap-4 border-t border-white/20 px-4 py-3 md:flex">
        <img src={track.coverUrl} alt={track.title} className="size-12 rounded-md object-cover" />
        <div className="min-w-0 w-44">
          <p className="truncate text-sm font-medium text-white">{track.title}</p>
          <p className="truncate text-xs text-slate-300">{track.artist}</p>
        </div>
        <div className="flex-1">
          <PlayerControls {...rest} />
        </div>
      </div>

      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="glass-panel fixed inset-x-3 bottom-3 z-20 flex items-center gap-3 rounded-xl p-3 text-left md:hidden"
            style={{ borderColor: accentColor }}
          >
            <img src={track.coverUrl} alt={track.title} className="size-12 rounded-md object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm text-white">{track.title}</p>
              <p className="truncate text-xs text-slate-300">Tap to expand player</p>
            </div>
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-30 bg-black/60" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border border-white/10 bg-slate-950 p-6 text-white">
            <img src={track.coverUrl} alt={track.title} className="mx-auto mb-4 size-48 rounded-2xl object-cover" />
            <p className="text-center text-lg font-semibold">{track.title}</p>
            <p className="mb-5 text-center text-sm text-slate-300">{track.artist}</p>
            <div className="space-y-4">
              <PlayerControls {...rest} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
