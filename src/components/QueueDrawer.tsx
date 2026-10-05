import { useEffect } from 'react'
import { X, Trash2, Play, Volume2, Disc3 } from 'lucide-react'
import { useAudioStore } from '../store/audioStore'

interface QueueDrawerProps {
  isOpen: boolean
  onClose: () => void
  onPlayTrack: (id: string) => void
}

const formatDuration = (seconds?: number) => {
  if (!seconds || isNaN(seconds)) return '--:--'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${String(sec).padStart(2, '0')}`
}

export function QueueDrawer({ isOpen, onClose, onPlayTrack }: QueueDrawerProps) {
  const { queue, tracks, currentTrackId, isPlaying, removeFromQueue, clearQueue } = useAudioStore()

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const currentTrack = tracks.find((t) => t.id === currentTrackId)
  
  // Resolve upcoming tracks in queue (excluding currently playing)
  const currentIndex = queue.indexOf(currentTrackId || '')
  const nextTrackIds = currentIndex !== -1 ? queue.slice(currentIndex + 1) : queue.filter(id => id !== currentTrackId)
  const upNextTracks = nextTrackIds
    .map((id) => tracks.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-[#0c0d12] border-l border-white/[0.08] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0c0d12]">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white tracking-tight">Play Queue</h2>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-[0.7rem] font-mono font-medium text-slate-300 border border-white/[0.06]">
              {upNextTracks.length + (currentTrack ? 1 : 0)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {upNextTracks.length > 0 && (
              <button
                onClick={clearQueue}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Clear all upcoming tracks"
              >
                <Trash2 className="size-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              title="Close Queue"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* ── Now Playing Section ── */}
          {currentTrack && (
            <div className="space-y-2">
              <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] text-emerald-400 font-bold block">
                Now Playing
              </span>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/[0.1] shadow-lg shadow-black/40">
                <div className="relative size-12 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="size-full object-cover"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Volume2 className="size-4 text-emerald-400 animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{currentTrack.title}</p>
                  <p className="truncate text-xs text-slate-400 mt-0.5">{currentTrack.artist}</p>
                </div>
                <span className="text-xs font-mono text-slate-400 shrink-0">
                  {formatDuration(currentTrack.duration)}
                </span>
              </div>
            </div>
          )}

          {/* ── Next Up Section ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] text-slate-400 font-bold">
                Next In Queue ({upNextTracks.length})
              </span>
            </div>

            {upNextTracks.length > 0 ? (
              <div className="space-y-1.5">
                {upNextTracks.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    className="group relative flex items-center justify-between gap-3 p-2.5 rounded-xl border border-transparent hover:border-white/[0.08] hover:bg-white/[0.04] transition-all cursor-pointer"
                    onClick={() => onPlayTrack(track.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative size-10 rounded-lg overflow-hidden shrink-0 bg-white/[0.05]">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="size-full object-cover"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="size-4 text-white fill-white ml-0.5" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-200 group-hover:text-white">
                          {track.title}
                        </p>
                        <p className="truncate text-[0.7rem] text-slate-400 mt-0.5">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-slate-400 group-hover:hidden">
                        {formatDuration(track.duration)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromQueue(track.id)
                        }}
                        className="hidden group-hover:flex p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                        title="Remove from queue"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-white/[0.08] rounded-2xl space-y-2">
                <Disc3 className="size-8 text-slate-600 mx-auto animate-spin duration-1000" />
                <p className="text-xs font-semibold text-slate-300">Queue is empty</p>
                <p className="text-[0.7rem] text-slate-500 max-w-xs mx-auto">
                  Click the ••• menu on any song and choose "Play Next" or "Add to Queue".
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
