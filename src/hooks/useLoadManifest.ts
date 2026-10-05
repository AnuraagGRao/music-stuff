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
  const { setTracks } = useAudioStore()

  useEffect(() => {
    if (loadedRef.current) return

    const loadManifest = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/'
        const manifestUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}publicManifest.json`
        const response = await fetch(manifestUrl)
        if (!response.ok) {
          console.warn('Failed to fetch publicManifest.json, using default bundled tracks')
          return
        }

        const manifest: PublicTrackManifest = await response.json()
        if (!manifest?.tracks || !Array.isArray(manifest.tracks) || manifest.tracks.length === 0) {
          return
        }

        // Convert manifest tracks to Track objects WITH LYRICS
        const manifestTracks: Track[] = manifest.tracks.map((trackData) => {
          return {
            id: String(trackData.id),
            title: trackData.title,
            artist: trackData.artist,
            album: trackData.album,
            duration: trackData.duration,
            audioUrl: trackData.audioUrl,
            coverUrl: trackData.coverUrl,
            ownerId: trackData.ownerId,
            isPublic: trackData.isPublic !== false,
            lyricsStatus: 'completed' as const,
            upvotesCount: trackData.upvotesCount || 0,
            downvotesCount: trackData.downvotesCount || 0,
            netScore: trackData.netScore || 0,
            lyrics: trackData.lyrics || [],
          }
        })

        console.log(`[Manifest] Loaded ${manifestTracks.length} tracks with lyrics generated`)

        const currentTracks = useAudioStore.getState().tracks
        const userTracks = currentTracks.filter((t) => t.ownerId !== 'public')
        setTracks([...manifestTracks, ...userTracks])

        loadedRef.current = true
      } catch (error) {
        console.error('Error loading manifest:', error)
      }
    }

    loadManifest()
  }, [setTracks])
}
