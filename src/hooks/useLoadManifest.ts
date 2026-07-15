import { useEffect, useRef } from 'react'
import { useAudioStore } from '../store/audioStore'
import type { Track } from '../types'

interface ManifestTrack {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  audioUrl: string
  coverUrl: string
  ownerId: string
  isPublic: boolean
  lyricsStatus: string
  upvotesCount: number
  downvotesCount: number
  netScore: number
  lyrics: Array<{ time: number; text: string }>
}

interface PublicTrackManifest {
  tracks: ManifestTrack[]
}

export function useLoadManifest() {
  const loadedRef = useRef(false)
  const { tracks, setTracks } = useAudioStore()

  useEffect(() => {
    if (loadedRef.current || tracks.length > 0) return

    const loadManifest = async () => {
      try {
        const response = await fetch('/publicManifest.json')
        if (!response.ok) {
          console.warn('Failed to fetch publicManifest.json')
          return
        }

        const manifest: PublicTrackManifest = await response.json()

        // Convert manifest tracks to Track objects WITH LYRICS
        const manifestTracks: Track[] = manifest.tracks.map((trackData) => {
          return {
            id: trackData.id,
            title: trackData.title,
            artist: trackData.artist,
            album: trackData.album,
            duration: trackData.duration,
            audioUrl: trackData.audioUrl,
            coverUrl: trackData.coverUrl,
            ownerId: trackData.ownerId,
            isPublic: trackData.isPublic,
            lyricsStatus: 'completed' as const,
            upvotesCount: trackData.upvotesCount,
            downvotesCount: trackData.downvotesCount,
            netScore: trackData.netScore,
            lyrics: trackData.lyrics || [],
          }
        })

        console.log(`[Manifest] Loaded ${manifestTracks.length} tracks with lyrics generated`)

        // Set all manifest tracks directly (store starts empty)
        setTracks(manifestTracks)

        loadedRef.current = true
      } catch (error) {
        console.error('Error loading manifest:', error)
      }
    }

    loadManifest()
  }, [])
}
