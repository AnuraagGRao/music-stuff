import { useState, useEffect, useMemo } from 'react'
import { Search, X, AlertTriangle, Disc3, Heart, Cloud, LogIn, LogOut, Command, Zap, Menu } from 'lucide-react'
import { LyricsView } from './components/LyricsView'
import { Player } from './components/Player'
import { FullPlayer } from './components/FullPlayer'
import { Queue } from './components/Queue'
import { QueueDrawer } from './components/QueueDrawer'
import { SleepTimerModal } from './components/SleepTimerModal'
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal'
import { Sidebar } from './components/Sidebar'
import { TrackRow } from './components/TrackRow'
import { UploadZone } from './components/UploadZone'
import { ForYou } from './components/ForYou'
import { CreatePlaylistModal } from './components/CreatePlaylistModal'
import { UpgradeModal } from './components/UpgradeModal'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useFirebaseMusic } from './hooks/useFirebaseMusic'
import { useAudioStore } from './store/audioStore'
import { useSeedDatabase } from './hooks/useSeedDatabase'
import { useLoadManifest } from './hooks/useLoadManifest'
import { isInstrumentalTrack } from './lib/lyricsUtils'
import { useTheme } from './hooks/useTheme'

type FilterCategory = 'all' | 'favorites' | 'uploads' | 'instrumental'

function App() {
  const { theme } = useTheme()

  // Load tracks from manifest as dynamic sync
  useLoadManifest()

  // Firestore seeding for cloud persistence
  useSeedDatabase()

  const {
    tracks,
    favorites,
    recentlyPlayed,
    toggleFavorite,
    playNext,
    playPrevious,
    toggleShuffle,
    cycleRepeat,
    shuffled,
    repeatMode,
    isQueueOpen,
    setIsQueueOpen,
    userPlan,
  } = useAudioStore()

  const {
    user,
    isAuthenticated,
    isAuthenticating,
    loginWithGoogle,
    logout,
    uploadTrack,
    uploadProgress,
    isUploading,
    error: authError,
    clearError: clearAuthError,
    userTracks,
  } = useFirebaseMusic()

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all')
  const [activeNav, setActiveNav] = useState<'library' | 'favorites' | 'uploads'>('library')
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false)
  const [fullscreenPlayer, setFullscreenPlayer] = useState(false)
  const [sleepTimerOpen, setSleepTimerOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    accentColor,
    playTrack,
    seek,
    audioElement,
  } = useAudioPlayer()

  // Filtered tracks based on search and active category / nav
  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      // Nav tab filter
      if (activeNav === 'favorites' && !favorites.includes(track.id)) return false
      if (activeNav === 'uploads' && track.ownerId === 'public') return false

      // Category chip filter
      if (activeFilter === 'favorites' && !favorites.includes(track.id)) return false
      if (activeFilter === 'uploads' && track.ownerId === 'public') return false
      const isTrackInstrumental = !track.lyrics || track.lyrics.length === 0 || isInstrumentalTrack(track.lyrics)
      if (activeFilter === 'instrumental' && !isTrackInstrumental) return false

      // Search query
      if (search.trim()) {
        const query = search.toLowerCase()
        const haystack = `${track.title} ${track.artist} ${track.album}`.toLowerCase()
        return haystack.includes(query)
      }

      return true
    })
  }, [tracks, favorites, search, activeFilter, activeNav])

  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      loginWithGoogle()
    }
  }

  // Deep linking URL hash #track={id}
  useEffect(() => {
    const checkHashTrack = () => {
      const match = window.location.hash.match(/#track=([^&]+)/)
      if (match && match[1]) {
        const targetId = decodeURIComponent(match[1])
        const found = tracks.find((t) => t.id === targetId)
        if (found) {
          playTrack(found.id)
        }
      }
    }
    checkHashTrack()
    window.addEventListener('hashchange', checkHashTrack)
    return () => window.removeEventListener('hashchange', checkHashTrack)
  }, [tracks, playTrack])

  // Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        setIsPlaying(!isPlaying)
      } else if (e.code === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        seek(Math.min(duration, currentTime + 5))
      } else if (e.code === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        seek(Math.max(0, currentTime - 5))
      } else if (e.key === 'j' || e.key === 'J' || e.key === '[') {
        e.preventDefault()
        playPrevious()
      } else if (e.key === 'l' || e.key === 'L' || e.key === ']') {
        e.preventDefault()
        playNext()
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        setVolume(volume > 0 ? 0 : 0.8)
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setFullscreenPlayer((prev) => !prev)
      } else if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault()
        setIsQueueOpen(!isQueueOpen)
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setShortcutsOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setFullscreenPlayer(false)
        setIsQueueOpen(false)
        setSleepTimerOpen(false)
        setShortcutsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    seek,
    playPrevious,
    playNext,
    volume,
    setVolume,
    isQueueOpen,
    setIsQueueOpen,
  ])

  try {
    if (!currentTrack) {
      return (
        <div className="min-h-screen bg-[#07080a] text-[#ECEDEE] flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="size-9 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <span className="text-xs font-mono tracking-widest uppercase text-slate-400">Loading Audio Stream...</span>
          </div>
        </div>
      )
    }

    return (
      <div
        className="min-h-screen bg-[#07080a] text-[#ECEDEE] selection:bg-emerald-500/30 selection:text-emerald-200"
        data-theme={theme}
      >
        <div className="mx-auto flex max-w-7xl gap-4 p-3 pb-28 lg:p-6 lg:pb-32">
          {/* Sidebar */}
          <Sidebar
            onCreatePlaylistClick={() => setCreatePlaylistOpen(true)}
            activeTab={activeNav}
            onSelectTab={(tab) => {
              setActiveNav(tab)
              setActiveFilter(tab === 'favorites' ? 'favorites' : tab === 'uploads' ? 'uploads' : 'all')
            }}
            user={user}
            isAuthenticated={isAuthenticated}
            isAuthenticating={isAuthenticating}
            onLogin={loginWithGoogle}
            onLogout={logout}
            favoritesCount={favorites.length}
            uploadsCount={userTracks.length}
            onUpgradeClick={() => setUpgradeOpen(true)}
            isOpenMobile={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          <main className="flex-1 space-y-4 min-w-0">
            {/* Header: Search + Nav Actions + Auth Pill */}
            <header className="rounded-2xl border border-white/[0.08] bg-[#0c0d10]/90 backdrop-blur-xl p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center sm:justify-between shadow-xl shadow-black/40 z-40">
              {/* Search input with pill styling + Mobile Menu Trigger */}
              <div className="flex items-center gap-2 flex-1 w-full">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                  title="Open Navigation & Playlists"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-4" />
                </button>
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full rounded-full border border-white/10 bg-[#141519] py-2.5 pl-10 pr-10 text-xs sm:text-sm text-[#ededef] outline-none placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    placeholder="Search 128+ tracks by title, artist, or album..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Actions & User State */}
              <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end flex-wrap sm:flex-nowrap">
                <ThemeSwitcher />
                <a
                  href="https://anuraaggrao.com/"
                  className="hidden sm:inline-flex text-[0.72rem] font-mono uppercase tracking-wider text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-white/10 bg-[#141519] hover:bg-white/10 transition-colors"
                  title="Back to portfolio"
                >
                  Portfolio
                </a>

                <button
                  type="button"
                  onClick={() => setShortcutsOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-mono font-medium text-slate-400 hover:text-white transition cursor-pointer"
                  title="Keyboard Shortcuts (?)"
                >
                  <Command className="size-3.5" />
                  <span className="hidden md:inline">Shortcuts</span>
                </button>

                {/* Storage Plan Pill */}
                <button
                  type="button"
                  onClick={() => setUpgradeOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium transition cursor-pointer ${
                    userPlan === 'pro'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-sm shadow-emerald-500/20 font-semibold'
                      : 'bg-white/[0.04] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                  title="Aura Cloud Subscription & Storage Quota"
                >
                  <Zap className="size-3.5 text-emerald-400 fill-emerald-400" />
                  <span>{userPlan === 'pro' ? 'Aura Pro' : 'Storage / Upgrade'}</span>
                </button>

                {isAuthenticated && user ? (
                  <div className="flex items-center gap-2 pl-1">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-white">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="size-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-[0.65rem] font-bold">
                          {user.displayName?.[0] || 'U'}
                        </div>
                      )}
                      <span className="max-w-[100px] truncate hidden md:inline">
                        {user.displayName?.split(' ')[0] || 'User'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={logout}
                      className="rounded-full p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 transition cursor-pointer"
                      title="Sign out"
                    >
                      <LogOut className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isAuthenticating}
                    onClick={loginWithGoogle}
                    className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-white/90 active:scale-98 transition shadow-md shadow-white/10 cursor-pointer disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <span className="size-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="size-3.5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
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
                    <span>{isAuthenticating ? 'Signing in...' : 'Sign in'}</span>
                  </button>
                )}
              </div>
            </header>

            {/* Auth Diagnostic Error Banner */}
            {authError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-200 flex items-start justify-between gap-3 shadow-lg shadow-rose-950/20">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-300">
                      {authError.toLowerCase().includes('storage') || authError.toLowerCase().includes('upload')
                        ? 'Storage & Upload Notice'
                        : 'Authentication Notice'}
                    </p>
                    <p className="text-rose-200/90 mt-0.5 leading-relaxed">{authError}</p>
                  </div>
                </div>
                <button
                  onClick={clearAuthError}
                  className="p-1 text-rose-400 hover:text-white rounded-md transition-colors cursor-pointer shrink-0"
                  title="Dismiss error"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            {/* Main Library & Queue Layout */}
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
              {/* Tracklist Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d10]/90 backdrop-blur-xl p-4 sm:p-5 space-y-4 shadow-xl shadow-black/40">
                {/* Header & Filter Category Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
                  <div>
                    <span className="text-[0.65rem] font-bold tracking-[0.16em] uppercase text-emerald-400 font-mono block">
                      01 · Catalog
                    </span>
                    <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                      Music Library
                    </h2>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => {
                        setActiveFilter('all')
                        setActiveNav('library')
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition cursor-pointer ${
                        activeFilter === 'all'
                          ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/20'
                          : 'bg-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 border border-white/[0.08]'
                      }`}
                    >
                      All ({tracks.length})
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter('favorites')
                        setActiveNav('favorites')
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1 ${
                        activeFilter === 'favorites'
                          ? 'bg-rose-500 text-white font-bold shadow-sm shadow-rose-500/20'
                          : 'bg-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 border border-white/[0.08]'
                      }`}
                    >
                      <Heart className="size-3 fill-current" />
                      <span>Favs ({favorites.length})</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter('uploads')
                        setActiveNav('uploads')
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1 ${
                        activeFilter === 'uploads'
                          ? 'bg-indigo-500 text-white font-bold shadow-sm shadow-indigo-500/20'
                          : 'bg-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 border border-white/[0.08]'
                      }`}
                    >
                      <Cloud className="size-3" />
                      <span>Uploads ({userTracks.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveFilter(activeFilter === 'instrumental' ? 'all' : 'instrumental')}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition cursor-pointer ${
                        activeFilter === 'instrumental'
                          ? 'bg-amber-500 text-black font-bold shadow-sm shadow-amber-500/20'
                          : 'bg-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 border border-white/[0.08]'
                      }`}
                    >
                      Instrumental
                    </button>
                  </div>
                </div>

                {/* Tracklist items */}
                <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
                  {filteredTracks.length > 0 ? (
                    filteredTracks.map((track) => (
                      <TrackRow
                        key={track.id}
                        track={track}
                        isActive={track.id === currentTrack.id}
                        isPlaying={isPlaying && track.id === currentTrack.id}
                        isFavorite={favorites.includes(track.id)}
                        onPlay={playTrack}
                        onToggleFavorite={toggleFavorite}
                        onAuthRequired={handleAuthRequired}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center space-y-2">
                      <Disc3 className="size-8 text-slate-600 mx-auto animate-pulse" />
                      <p className="text-sm font-medium text-slate-300">No tracks found</p>
                      <p className="text-xs text-slate-500">
                        {search ? `No tracks match "${search}"` : 'Your current filter has no tracks.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Side Panels: For You & Queues */}
              <div className="space-y-4">
                <ForYou
                  allTracks={tracks}
                  onPlayTrack={playTrack}
                  onToggleFavorite={toggleFavorite}
                  favorites={favorites}
                  currentTrackId={currentTrack.id}
                />
                <Queue title="Recently Played" ids={recentlyPlayed} tracks={tracks} />
                <Queue title="Favorites" ids={favorites} tracks={tracks} />
              </div>
            </section>

            {/* Bottom Section: Uploads & Lyrics */}
            <section className="grid gap-4 lg:grid-cols-2">
              {isAuthenticated ? (
                <UploadZone
                  onUpload={uploadTrack}
                  isUploading={isUploading}
                  progress={uploadProgress}
                  userTracksCount={userTracks.length}
                  onUpgradeClick={() => setUpgradeOpen(true)}
                />
              ) : (
                <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d10]/90 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="size-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-400">
                    <Cloud className="size-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Cloud Music Storage</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Sign in with Google to upload and sync your personal audio. Users are solely responsible for holding lawful rights to uploaded media under DMCA Safe Harbor.
                    </p>
                  </div>
                  <button
                    onClick={loginWithGoogle}
                    disabled={isAuthenticating}
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90 active:scale-98 transition shadow-md shadow-white/10 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    <LogIn className="size-3.5" />
                    <span>{isAuthenticating ? 'Connecting...' : 'Sign in to Upload'}</span>
                  </button>
                </div>
              )}

              {/* Live Lyrics Panel */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d10]/90 backdrop-blur-xl h-72 overflow-y-auto p-4 sm:p-5 shadow-xl shadow-black/40">
                <div className="mb-3">
                  <span className="text-[0.65rem] font-bold tracking-[0.16em] uppercase text-emerald-400 font-mono block">
                    02 · Realtime
                  </span>
                  <h2 className="text-lg font-bold text-white tracking-tight -mt-0.5">
                    Live Lyrics
                  </h2>
                </div>
                <LyricsView
                  lyrics={currentTrack.lyrics || []}
                  currentTime={currentTime}
                  onSeek={seek}
                  size="normal"
                />
              </div>
            </section>
          </main>
        </div>

        {/* Floating Bottom Player */}
        <Player
          track={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onNext={playNext}
          onPrevious={playPrevious}
          onShuffle={toggleShuffle}
          onRepeat={cycleRepeat}
          onVolumeChange={setVolume}
          onSeek={seek}
          volume={volume}
          currentTime={currentTime}
          duration={duration}
          accentColor={accentColor}
          shuffled={shuffled}
          repeatMode={repeatMode}
          onExpand={() => setFullscreenPlayer(true)}
          onOpenSleepTimer={() => setSleepTimerOpen(true)}
        />

        {/* Fullscreen Player Modal */}
        {fullscreenPlayer && (
          <FullPlayer
            onClose={() => setFullscreenPlayer(false)}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            setVolume={setVolume}
            accentColor={accentColor}
            seek={seek}
            audioElement={audioElement}
          />
        )}

        {/* Play Queue Drawer */}
        <QueueDrawer
          isOpen={isQueueOpen}
          onClose={() => setIsQueueOpen(false)}
          onPlayTrack={playTrack}
        />

        {/* Sleep Timer Modal */}
        <SleepTimerModal
          isOpen={sleepTimerOpen}
          onClose={() => setSleepTimerOpen(false)}
        />

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal
          isOpen={shortcutsOpen}
          onClose={() => setShortcutsOpen(false)}
        />

        {/* Upgrade / Subscription Modal */}
        <UpgradeModal
          isOpen={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
        />

        <CreatePlaylistModal open={createPlaylistOpen} onOpenChange={setCreatePlaylistOpen} />
      </div>
    )
  } catch (error) {
    console.error('App render error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-rose-400 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading App</h1>
          <p className="mb-2">{error instanceof Error ? error.message : String(error)}</p>
          <p className="text-xs text-slate-400">Check browser console for details</p>
        </div>
      </div>
    )
  }
}

export default App
