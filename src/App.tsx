import { useState } from 'react'
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

  try {
    if (!currentTrack) {
      return <div className="p-6 text-white">No tracks available.</div>
    }

    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100"
        data-theme={theme}
      >
        <div className="mx-auto flex max-w-7xl gap-4 p-3 pb-28 lg:p-6 lg:pb-32">
          <Sidebar onCreatePlaylistClick={() => setCreatePlaylistOpen(true)} />

          <main className="flex-1 space-y-4">
            <header className="glass-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between overflow-visible z-50">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-sm text-white outline-none ring-indigo-400/60 placeholder:text-slate-500 focus:ring"
                  placeholder="Search tracks, artists, albums..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <button
                  type="button"
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
                  onClick={() => (isAuthenticated ? logout() : loginWithGoogle())}
                >
                  {isAuthenticated ? 'Sign out' : 'Sign in with Google'}
                </button>
              </div>
            </header>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="glass-panel space-y-3 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Music Library</h2>
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
              <div className="glass-panel h-72 overflow-y-auto p-4 rounded-lg border border-white/10">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Live Lyrics</h2>
                <LyricsView lyrics={currentTrack.lyrics || []} currentTime={currentTime} />
              </div>
            </section>
          </main>
        </div>

        <div onClick={() => setFullscreenPlayer(true)} className="cursor-pointer">
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
          />
        </div>

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
