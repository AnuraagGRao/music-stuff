import { useState } from 'react'
import { Search } from 'lucide-react'
import { LyricsView } from './components/LyricsView'
import { Player } from './components/Player'
import { Queue } from './components/Queue'
import { Sidebar } from './components/Sidebar'
import { TrackRow } from './components/TrackRow'
import { UploadZone } from './components/UploadZone'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useFirebaseMusic } from './hooks/useFirebaseMusic'
import { useAudioStore } from './store/audioStore'

function App() {
  const {
    tracks,
    favorites,
    recentlyPlayed,
    toggleFavorite,
    playNext,
    playPrevious,
    toggleShuffle,
    cycleRepeat,
  } = useAudioStore()
  const { user, loginWithGoogle, logout, uploadTrack, uploadProgress, isUploading } = useFirebaseMusic()

  const [search, setSearch] = useState('')

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

  if (!currentTrack) {
    return <div className="p-6 text-white">No tracks available.</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-4 p-3 pb-28 lg:p-6 lg:pb-32">
        <Sidebar />

        <main className="flex-1 space-y-4">
          <header className="glass-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-sm text-white outline-none ring-indigo-400/60 placeholder:text-slate-500 focus:ring"
                placeholder="Search tracks, artists, albums..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
              onClick={() => (user ? logout() : loginWithGoogle())}
            >
              {user ? 'Sign out' : 'Sign in with Google'}
            </button>
          </header>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="glass-panel space-y-3 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Music Library</h2>
              {filteredTracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  isActive={track.id === currentTrack.id}
                  isFavorite={favorites.includes(track.id)}
                  onPlay={playTrack}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            <div className="space-y-4">
              <Queue title="Recently Played" ids={recentlyPlayed} tracks={tracks} />
              <Queue title="Favorites" ids={favorites} tracks={tracks} />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <UploadZone onUpload={uploadTrack} isUploading={isUploading} progress={uploadProgress} />
            <LyricsView lyrics={currentTrack.lyrics} currentTime={currentTime} />
          </section>
        </main>
      </div>

      <Player
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((value) => !value)}
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
      />
    </div>
  )
}

export default App
