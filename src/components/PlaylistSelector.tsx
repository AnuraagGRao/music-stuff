import { MoreVertical, ListPlus, CornerDownRight, Share2, Check, LogIn } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { usePlaylists } from '../hooks/usePlaylists'
import { useAudioStore } from '../store/audioStore'
import type { Track } from '../types'

type PlaylistSelectorProps = {
  track: Track
  onAuthRequired?: () => void
}

export function PlaylistSelector({ track, onAuthRequired }: PlaylistSelectorProps) {
  const { playlists, addTrackToPlaylist, isTrackInPlaylist, isAuthenticated } = usePlaylists()
  const { addToQueue, playNextInQueue } = useAudioStore()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [actionNotice, setActionNotice] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const showTemporaryNotice = (text: string) => {
    setActionNotice(text)
    setTimeout(() => {
      setActionNotice(null)
      setOpen(false)
    }, 900)
  }

  const handlePlayNext = () => {
    playNextInQueue(track.id)
    showTemporaryNotice('Playing next')
  }

  const handleAddToQueue = () => {
    addToQueue(track.id)
    showTemporaryNotice('Added to queue')
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}${window.location.pathname}#track=${track.id}`
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true)
        showTemporaryNotice('Link copied')
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const handleAddToPlaylist = (playlistId: string) => {
    if (!isAuthenticated) {
      onAuthRequired?.()
      return
    }

    const isInPlaylist = isTrackInPlaylist(playlistId, track.id)
    if (!isInPlaylist) {
      void addTrackToPlaylist(playlistId, track.id)
      showTemporaryNotice('Saved to playlist')
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        onClick={() => setOpen(!open)}
        title="More actions"
        aria-label="More actions"
      >
        <MoreVertical className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-56 rounded-xl border border-white/[0.1] bg-[#0e0f14] p-1.5 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {actionNotice ? (
            <div className="p-3 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
              <Check className="size-3.5" />
              <span>{actionNotice}</span>
            </div>
          ) : (
            <div className="space-y-0.5">
              {/* Queue actions */}
              <button
                type="button"
                className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-slate-200 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                onClick={handlePlayNext}
              >
                <CornerDownRight className="size-3.5 text-indigo-400 shrink-0" />
                <span>Play Next</span>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-slate-200 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                onClick={handleAddToQueue}
              >
                <ListPlus className="size-3.5 text-emerald-400 shrink-0" />
                <span>Add to Queue</span>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-slate-200 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                onClick={handleCopyLink}
              >
                <Share2 className="size-3.5 text-amber-400 shrink-0" />
                <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
              </button>

              <div className="my-1 border-t border-white/[0.08]" />

              {/* Playlists section */}
              <div className="px-3 py-1">
                <span className="text-[0.62rem] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Add to Playlist
                </span>
              </div>

              {isAuthenticated ? (
                playlists.length > 0 ? (
                  playlists.map((playlist) => {
                    const isInPlaylist = isTrackInPlaylist(playlist.id, track.id)
                    return (
                      <button
                        key={playlist.id}
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                        onClick={() => handleAddToPlaylist(playlist.id)}
                      >
                        <span className="truncate">{playlist.name}</span>
                        {isInPlaylist && <Check className="size-3.5 text-emerald-400 shrink-0 ml-1" />}
                      </button>
                    )
                  })
                ) : (
                  <p className="px-3 py-1.5 text-[0.7rem] text-slate-400 italic">No playlists yet</p>
                )
              ) : (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-left text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                  onClick={() => {
                    setOpen(false)
                    onAuthRequired?.()
                  }}
                >
                  <LogIn className="size-3.5" />
                  <span>Sign in for Playlists</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
