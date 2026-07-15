import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { TrackRow } from './TrackRow'
import type { Track, Playlist } from '../types'

type ForYouProps = {
  allTracks: Track[]
  onPlayTrack: (trackId: string) => void
  onToggleFavorite: (trackId: string) => void
  favorites: string[]
  currentTrackId: string | null
}

export function ForYou({
  allTracks,
  onPlayTrack,
  onToggleFavorite,
  favorites,
  currentTrackId,
}: ForYouProps) {
  const [recommendations, setRecommendations] = useState<Playlist | null>(null)
  const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  const user = auth.currentUser

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const loadRecommendations = async () => {
      try {
        // Query for system-generated playlists assigned to this user
        const recsQuery = query(
          collection(db, 'playlists'),
          where('isSystemGenerated', '==', true),
          where('createdBy', '==', user.uid),
        )

        const snapshot = await getDocs(recsQuery)

        if (snapshot.empty) {
          setRecommendations(null)
          setRecommendedTracks([])
        } else {
          const playlist = snapshot.docs[0]
          const playlistData = {
            id: playlist.id,
            ...playlist.data(),
          } as Playlist

          setRecommendations(playlistData)

          // Get track objects for tracks in this playlist
          const tracks = allTracks.filter((track) => playlistData.trackIds.includes(track.id))
          setRecommendedTracks(tracks)
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err)
        setRecommendations(null)
        setRecommendedTracks([])
      } finally {
        setLoading(false)
      }
    }

    void loadRecommendations()
  }, [user, allTracks])

  if (!user) {
    return (
      <section className="glass-panel space-y-3 p-4 rounded-lg">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">For You</h2>
        <p className="text-sm text-slate-400">Sign in to unlock personalized recommendations</p>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="glass-panel space-y-3 p-4 rounded-lg">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">For You</h2>
        <p className="text-sm text-slate-400">Loading recommendations...</p>
      </section>
    )
  }

  if (!recommendations || recommendedTracks.length === 0) {
    return (
      <section className="glass-panel space-y-3 p-4 rounded-lg">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">For You</h2>
        <p className="text-xs text-slate-400">
          Listen to more tracks and upvote your favorites to unlock customized mixes!
        </p>
      </section>
    )
  }

  return (
    <section className="glass-panel space-y-3 p-4 rounded-lg">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          {recommendations.name}
        </h2>
        {recommendations.description && (
          <p className="text-xs text-slate-400 mt-1">{recommendations.description}</p>
        )}
      </div>

      <div className="space-y-2">
        {recommendedTracks.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            isActive={track.id === currentTrackId}
            isFavorite={favorites.includes(track.id)}
            onPlay={onPlayTrack}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  )
}
