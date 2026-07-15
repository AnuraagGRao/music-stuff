import { Heart, Library, Music2, Upload, Plus } from 'lucide-react'
import { usePlaylists } from '../hooks/usePlaylists'

type SidebarProps = {
  onCreatePlaylistClick?: () => void
}

const navItems = [
  { label: 'Library', icon: Library },
  { label: 'Favorites', icon: Heart },
  { label: 'Uploads', icon: Upload },
]

export function Sidebar({ onCreatePlaylistClick }: SidebarProps) {
  const { playlists, isAuthenticated } = usePlaylists()

  return (
    <aside className="glass-panel hidden h-full w-64 shrink-0 p-4 lg:flex lg:flex-col">
      <h1 className="mb-6 text-xl font-semibold text-white">Music For All</h1>

      <nav className="space-y-2 mb-6">
        {navItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            type="button"
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>

      {isAuthenticated && (
        <div className="mt-6 border-t border-white/10 pt-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Music2 className="size-4 text-slate-300" />
              <h2 className="text-sm font-semibold text-slate-300">Playlists</h2>
            </div>
            <button
              type="button"
              onClick={onCreatePlaylistClick}
              className="rounded-md p-1 hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Create new playlist"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {playlists.length === 0 ? (
            <p className="text-xs text-slate-500">Create your first playlist!</p>
          ) : (
            <div className="space-y-1">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  type="button"
                  className="w-full text-left px-2 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 rounded transition truncate"
                  title={playlist.name}
                >
                  {playlist.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
