import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { LyricsView } from './components/LyricsView'
import { Player } from './components/Player'
import { FullPlayer } from './components/FullPlayer'
import { Queue } from './components/Queue'
import { Sidebar } from './components/Sidebar'
import { TrackRow } from './components/TrackRow'
import { UploadZone } from './components/UploadZone'
import { ForYou } from './components/ForYou'
import { CreatePlaylistModal } from './components/CreatePlaylistModal'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useFirebaseMusic } from './hooks/useFirebaseMusic'
import { useAudioStore } from './store/audioStore'
import { useSeedDatabase } from './hooks/useSeedDatabase'
import { useLoadManifest } from './hooks/useLoadManifest'
import { useLyricsExtraction } from './hooks/useLyricsExtraction'
import { useTheme } from './hooks/useTheme'

function App() {
  const { theme } = useTheme()

  // Load tracks from manifest as fallback
  useLoadManifest()

  // Extract lyrics for all tracks
  useLyricsExtraction()

  // Initialize public tracks on app load (Firestore seeding)
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
  } = useAudioStore()
  const { isAuthenticated, loginWithGoogle, logout, uploadTrack, uploadProgress, isUploading } =
    useFirebaseMusic()

  const [search, setSearch] = useState('')
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false)
  const [fullscreenPlayer, setFullscreenPlayer] = useState(false)

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

  const filteredTracks = tracks.filter((track) => {
    const haystack = `${track.title} ${track.artist} ${track.album}`.toLowerCase()
    return haystack.includes(search.toLowerCase())
  })

  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      // Trigger login
      setTimeout(() => loginWithGoogle(), 500)
    }
  }

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
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, setIsPlaying, currentTime, duration, seek, playPrevious, playNext, volume, setVolume])

  try {
    if (!currentTrack) {
      return (
        <div className="min-h-screen bg-[#0F1011] text-[#ECEDEE] flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <span className="text-xs font-mono tracking-widest uppercase text-slate-400">Loading Audio Stream...</span>
          </div>
        </div>
      )
    }

    return (
      <div
        className="min-h-screen bg-[#0F1011] text-[#ECEDEE]"
        data-theme={theme}
      >
        <div className="mx-auto flex max-w-7xl gap-4 p-3 pb-28 lg:p-6 lg:pb-32">
          <Sidebar onCreatePlaylistClick={() => setCreatePlaylistOpen(true)} />

          <main className="flex-1 space-y-4">
            <header className="glass-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between overflow-visible z-50">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-full border border-[#2C2E31] bg-[#141516] py-2 pl-9 pr-3 text-sm text-[#ECEDEE] outline-none ring-0 placeholder:text-[#63676B] focus:border-[#3D4044] transition-colors"
                  placeholder="Search tracks, artists, albums..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <a
                  href="https://anuraaggrao.com/"
                  className="text-[0.75rem] font-mono uppercase tracking-wider text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-[#2C2E31] bg-[#141516] transition-colors"
                  title="Back to portfolio"
                >
                  Portfolio
                </a>
                <button
                  type="button"
                  className="rounded-full bg-[#ECEDEE] px-4 py-2 text-sm font-medium text-[#0F1011] hover:opacity-90 font-mono text-xs transition"
                  onClick={() => (isAuthenticated ? logout() : loginWithGoogle())}
                >
                  {isAuthenticated ? 'Sign out' : 'Sign in with Google'}
                </button>
              </div>
            </header>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="glass-panel space-y-3 p-4">
                <div>
                  <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-[#889096] font-mono block">
                    01 · Tracklist
                  </span>
                  <h2 className="text-xl font-semibold text-[#ECEDEE] font-serif tracking-tight mt-0.5">
                    Music Library
                  </h2>
                </div>
                {filteredTracks.length > 0 ? (
                  filteredTracks.map((track) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      isActive={track.id === currentTrack.id}
                      isFavorite={favorites.includes(track.id)}
                      onPlay={playTrack}
                      onToggleFavorite={toggleFavorite}
                      onAuthRequired={handleAuthRequired}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No tracks match your search.</p>
                )}
              </div>

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

            <section className="grid gap-4 lg:grid-cols-2">
              {isAuthenticated ? (
                <UploadZone onUpload={uploadTrack} isUploading={isUploading} progress={uploadProgress} />
              ) : (
                <div className="glass-panel flex items-center justify-center rounded-lg border border-white/10 p-6">
                  <p className="text-sm text-slate-400">Sign in to upload your music</p>
                </div>
              )}
              <div className="glass-panel h-72 overflow-y-auto p-4 rounded-lg">
                <div className="mb-4">
                  <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-[#889096] font-mono block">
                    02 · Synchronization
                  </span>
                  <h2 className="text-xl font-semibold text-[#ECEDEE] font-serif tracking-tight mt-0.5">
                    Live Lyrics
                  </h2>
                </div>
                <LyricsView lyrics={currentTrack.lyrics || []} currentTime={currentTime} />
              </div>
            </section>
          </main>
        </div>

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
        />

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

        <CreatePlaylistModal open={createPlaylistOpen} onOpenChange={setCreatePlaylistOpen} />
      </div>
    )
  } catch (error) {
    console.error('App render error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400 p-4">
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
