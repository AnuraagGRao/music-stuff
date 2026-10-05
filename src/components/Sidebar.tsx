import { Heart, Library, Music2, Upload, Plus, LogOut, Disc3, Zap, Crown } from 'lucide-react'
import { usePlaylists } from '../hooks/usePlaylists'
import { useAudioStore } from '../store/audioStore'
import type { User } from 'firebase/auth'

type SidebarProps = {
  onCreatePlaylistClick?: () => void
  activeTab?: 'library' | 'favorites' | 'uploads'
  onSelectTab?: (tab: 'library' | 'favorites' | 'uploads') => void
  user?: User | null
  isAuthenticated?: boolean
  isAuthenticating?: boolean
  onLogin?: () => void
  onLogout?: () => void
  favoritesCount?: number
  uploadsCount?: number
  onUpgradeClick?: () => void
}

export function Sidebar({
  onCreatePlaylistClick,
  activeTab = 'library',
  onSelectTab,
  user,
  isAuthenticated = false,
  isAuthenticating = false,
  onLogin,
  onLogout,
  favoritesCount = 0,
  uploadsCount = 0,
  onUpgradeClick,
}: SidebarProps) {
  const { playlists } = usePlaylists()
  const { userPlan } = useAudioStore()

  const navItems = [
    { id: 'library' as const, label: 'Library', icon: Library, count: undefined },
    { id: 'favorites' as const, label: 'Favorites', icon: Heart, count: favoritesCount },
    { id: 'uploads' as const, label: 'My Uploads', icon: Upload, count: uploadsCount },
  ]

  return (
    <aside className="hidden h-full w-64 shrink-0 rounded-2xl border border-white/[0.08] bg-[#0c0d10]/90 backdrop-blur-xl p-4 lg:flex lg:flex-col justify-between shadow-2xl shadow-black/50">
      <div>
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Disc3 className="size-5 text-black" />
          </div>
          <div>
            <span className="text-[0.65rem] font-bold tracking-[0.16em] uppercase text-emerald-400 font-mono block">
              Hi-Fi Audio
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight -mt-0.5">
              Music For All
            </h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1 mb-6">
          {navItems.map(({ id, label, icon: Icon, count }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => onSelectTab?.(id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.12] text-white border border-white/15 shadow-sm font-semibold'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
                }`}
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`size-4 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>{label}</span>
                </div>
                {count !== undefined && count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[0.65rem] font-mono ${
                      isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Playlists Section */}
        {isAuthenticated && (
          <div className="border-t border-white/[0.08] pt-4">
            <div className="flex items-center justify-between mb-2.5 px-2">
              <div className="flex items-center gap-1.5">
                <Music2 className="size-3.5 text-slate-400" />
                <h2 className="text-[0.7rem] font-semibold tracking-wider uppercase text-slate-400 font-mono">
                  Playlists
                </h2>
              </div>
              <button
                type="button"
                onClick={onCreatePlaylistClick}
                className="rounded-lg p-1 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                title="Create new playlist"
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            {playlists.length === 0 ? (
              <p className="text-xs text-slate-500 px-2 py-1">No playlists yet. Create one!</p>
            ) : (
              <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    className="w-full text-left px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition truncate cursor-pointer"
                    title={playlist.name}
                  >
                    {playlist.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Profile / Auth Footer */}
      <div className="border-t border-white/[0.08] pt-4 mt-auto">
        {/* Subscription Plan Card */}
        {isAuthenticated && (
          <div className="mb-3">
            {userPlan === 'free' ? (
              <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-950/20 to-black p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Zap className="size-3.5 text-emerald-400" />
                    <span>Free Storage</span>
                  </div>
                  <span className="text-[0.65rem] font-mono text-slate-400">15MB / 5 Tracks</span>
                </div>
                <p className="text-[0.7rem] text-slate-400 leading-snug">
                  Need more space? Unlock 100MB lossless audio & unlimited storage.
                </p>
                {onUpgradeClick && (
                  <button
                    type="button"
                    onClick={onUpgradeClick}
                    className="w-full py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-sm cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Zap className="size-3 fill-black" />
                    <span>Upgrade to Pro • $4.99</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Crown className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>Aura Pro</span>
                      <span className="text-[0.6rem] font-mono text-emerald-300 bg-emerald-400/20 px-1 py-0.2 rounded font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-slate-400">Unlimited Cloud Audio</p>
                  </div>
                </div>
                {onUpgradeClick && (
                  <button
                    type="button"
                    onClick={onUpgradeClick}
                    className="text-[0.7rem] text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 cursor-pointer"
                  >
                    Manage
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {isAuthenticated && user ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="size-8 rounded-full border border-white/20 object-cover"
                />
              ) : (
                <div className="size-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-mono text-xs font-bold border border-emerald-500/30">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-white truncate">
                    {user.displayName || 'Logged in'}
                  </p>
                  {userPlan === 'pro' && (
                    <span className="text-[0.6rem] font-bold text-emerald-400 font-mono">⚡PRO</span>
                  )}
                </div>
                <p className="text-[0.65rem] text-slate-400 font-mono truncate">
                  {user.email || 'Cloud sync active'}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white text-black font-semibold text-xs transition-all hover:bg-white/90 active:scale-98 shadow-md shadow-white/10 cursor-pointer disabled:opacity-50"
          >
            {isAuthenticating ? (
              <span className="size-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="size-3.5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isAuthenticating ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>
        )}
      </div>
    </aside>
  )
}
