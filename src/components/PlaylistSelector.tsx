import { MoreVertical } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { usePlaylists } from '../hooks/usePlaylists'
import type { Track } from '../types'

type PlaylistSelectorProps = {
  track: Track
  onAuthRequired?: () => void
}

export function PlaylistSelector({ track, onAuthRequired }: PlaylistSelectorProps) {
  const { playlists, addTrackToPlaylist, isTrackInPlaylist, isAuthenticated } = usePlaylists()
  const [open, setOpen] = useState(false)
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

  const handleAddToPlaylist = (playlistId: string) => {
    if (!isAuthenticated) {
      onAuthRequired?.()
      return
    }

    const isInPlaylist = isTrackInPlaylist(playlistId, track.id)
    if (!isInPlaylist) {
      void addTrackToPlaylist(playlistId, track.id)
      // Close after adding
      setTimeout(() => setOpen(false), 500)
    }
  }

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        className="rounded-md p-2 text-slate-200 transition hover:bg-white/10 disabled"
        onClick={onAuthRequired}
        title="Sign in to add to playlists"
        disabled
      >
        <MoreVertical className="size-4 opacity-50" />
      </button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="rounded-md p-2 text-slate-200 transition hover:bg-white/10"
        onClick={() => setOpen(!open)}
        title="Add to playlist"
      >
        <MoreVertical className="size-4" />
      </button>

      {open && playlists.length > 0 && (
        <div className="absolute right-0 z-50 mt-1 min-w-max rounded-lg border border-white/10 bg-slate-800 shadow-lg">
          {playlists.map((playlist) => {
            const isInPlaylist = isTrackInPlaylist(playlist.id, track.id)
            return (
              <button
                key={playlist.id}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg"
                onClick={() => handleAddToPlaylist(playlist.id)}
              >
                {isInPlaylist && <span className="text-emerald-400">✓</span>}
                {playlist.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
