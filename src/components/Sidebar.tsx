import { Heart, Library, Music2, Upload } from 'lucide-react'

const navItems = [
  { label: 'Library', icon: Library },
  { label: 'Playlists', icon: Music2 },
  { label: 'Favorites', icon: Heart },
  { label: 'Uploads', icon: Upload },
]

export function Sidebar() {
  return (
    <aside className="glass-panel hidden h-full w-64 shrink-0 p-4 lg:block">
      <h1 className="mb-6 text-xl font-semibold text-white">music.anuraaggrao</h1>
      <nav className="space-y-2">
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
    </aside>
  )
}
